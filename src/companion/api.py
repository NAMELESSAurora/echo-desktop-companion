import asyncio
import json
import mimetypes
import secrets
import sqlite3
import sys
from collections.abc import Callable
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Request, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from companion.config import Settings
from companion.events import ReplayExpired
from companion.middleware import BodyLimitMiddleware
from companion.models import MemoryEdit, MemoryOrganize, ScreenPolicy, SessionCreate, TurnCreate
from companion.moss_live import LiveUpstream, MossLiveManager
from companion.pipeline import Pipeline, PipelineError
from companion.providers import Providers, build_providers
from companion.store import StaleMemory, Store

mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("application/octet-stream", ".p2lrt")

security = HTTPBearer(auto_error=False)


def create_app(
    settings: Settings | None = None,
    providers: Providers | None = None,
    live_upstream_factory: Callable[[Settings], LiveUpstream] | None = None,
):
    config = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        config.data_dir.mkdir(parents=True, exist_ok=True)
        token = config.api_token.get_secret_value()
        if not token:
            path = config.data_dir / "api-token"
            if not path.exists():
                try:
                    with path.open("x", encoding="utf-8") as f:
                        f.write(secrets.token_urlsafe(32))
                    path.chmod(0o600)
                except FileExistsError:
                    pass
            token = path.read_text(encoding="utf-8").strip()
        if len(token) < 16:
            raise RuntimeError("The local access token must contain at least 16 characters")
        store = Store(config.data_dir / "companion.sqlite3")
        await store.start()
        bundle = providers or build_providers(config)
        engine = Pipeline(config, store, bundle)
        live = MossLiveManager(config, store, engine, live_upstream_factory)
        app.state.engine, app.state.store, app.state.token = engine, store, token
        app.state.live = live
        app.state.ui_token = secrets.token_urlsafe(32)
        try:
            yield
        finally:
            await live.shutdown()
            await engine.shutdown()
            await bundle.close()
            await store.close()

    app = FastAPI(title="Desktop Companion Pipeline", version="0.4.0", lifespan=lifespan)
    app.add_middleware(BodyLimitMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "[::1]"])

    @app.middleware("http")
    async def browser_boundary(request: Request, call_next):
        origin = request.headers.get("origin")
        own_origin = str(request.base_url).rstrip("/")
        if origin and origin not in {own_origin, *config.allowed_origins}:
            return JSONResponse({"error": {"code": "origin_not_allowed"}}, status_code=403)
        length = request.headers.get("content-length")
        if length:
            max_len = 10_500_000 if request.url.path == "/v1/moss/voices/clone" else 3_000_000
            try:
                too_large = int(length) > max_len
            except ValueError:
                return JSONResponse({"error": {"code": "invalid_content_length"}}, status_code=400)
            if too_large:
                return JSONResponse({"error": {"code": "request_too_large"}}, status_code=413)
        return await call_next(request)

    async def authenticate(
        request: Request,
        credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    ):
        bearer_ok = credentials is not None and secrets.compare_digest(
            credentials.credentials.encode(), request.app.state.token.encode()
        )
        ui_cookie = request.cookies.get("companion_mock_ui", "")
        mock_ui_ok = config.mode == "mock" and secrets.compare_digest(
            ui_cookie.encode(), request.app.state.ui_token.encode()
        )
        if not bearer_ok and not mock_ui_ok:
            raise HTTPException(status_code=401, detail="invalid_local_token")

    auth = [Depends(authenticate)]

    @app.exception_handler(PipelineError)
    async def pipeline_error(_, exc):
        return JSONResponse({"error": {"code": exc.code}}, status_code=exc.status)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_, exc):
        # Pydantic errors can contain entire base64 frames: never echo request input.
        issues = [{"location": list(e["loc"]), "type": e["type"]} for e in exc.errors()]
        return JSONResponse(
            {"error": {"code": "invalid_request", "issues": issues}}, status_code=422
        )

    @app.exception_handler(sqlite3.IntegrityError)
    async def data_conflict(_, exc):
        return JSONResponse({"error": {"code": "data_conflict"}}, status_code=409)

    @app.get("/health")
    async def health():
        return {"status": "ok", "mode": config.mode, "version": "0.4.0"}

    @app.post("/ui/connect", include_in_schema=False)
    async def connect_test_ui(request: Request):
        # This same-origin bootstrap only grants access to offline/mock mode.
        # It never discloses the operator's Bearer token or works against live providers.
        if config.mode != "mock":
            raise PipelineError(409, "test_ui_requires_mock")
        origin = str(request.base_url).rstrip("/")
        if (
            request.headers.get("origin") != origin
            or request.headers.get("sec-fetch-site") != "same-origin"
            or request.headers.get("x-companion-ui") != "1"
        ):
            raise PipelineError(403, "same_origin_required")
        response = JSONResponse({"connected": True, "mode": "mock"})
        response.set_cookie(
            "companion_mock_ui", app.state.ui_token, httponly=True, samesite="strict", path="/"
        )
        response.headers["Cache-Control"] = "no-store"
        return response

    meipass = getattr(sys, "_MEIPASS", None)
    bundled_web = Path(meipass) / "companion" / "web" if meipass else None
    web_dir = bundled_web if bundled_web and bundled_web.exists() else Path(__file__).parent / "web"

    @app.get("/", include_in_schema=False)
    async def test_ui():
        if not (web_dir / "index.html").exists():
            return JSONResponse({"error": {"code": "frontend_not_built"}}, status_code=503)
        return FileResponse(
            web_dir / "index.html",
            headers={
                "Cache-Control": "no-store",
                "Content-Security-Policy": (
                    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; "
                    "img-src 'self' data: blob:; media-src 'self' blob:; "
                    "connect-src 'self' ws://127.0.0.1:* ws://localhost:* blob:; "
                    "frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
                ),
                "Referrer-Policy": "no-referrer",
                "X-Content-Type-Options": "nosniff",
            },
        )

    @app.get("/v1/config", dependencies=auth)
    async def configuration():
        return config.public()

    @app.post("/v1/sessions", status_code=201, dependencies=auth)
    async def create_session(body: SessionCreate):
        return await app.state.store.create_session(body)

    @app.get("/v1/sessions/{sid}", dependencies=auth)
    async def session(sid: str):
        return await app.state.engine._session(sid)

    @app.put("/v1/sessions/{sid}/screen-policy", dependencies=auth)
    async def screen_policy(sid: str, body: ScreenPolicy):
        result = await app.state.engine.set_screen(sid, body)
        return {
            "enabled": bool(result["screen_enabled"]),
            "source_id": result["screen_source"],
            "epoch": result["screen_epoch"],
        }

    @app.post("/v1/sessions/{sid}/turns", status_code=202, dependencies=auth)
    async def start_turn(sid: str, body: TurnCreate):
        return await app.state.engine.start_turn(sid, body)

    @app.get("/v1/turns/{tid}", dependencies=auth)
    async def get_turn(tid: str):
        result = await app.state.store.turn(tid)
        if not result:
            raise PipelineError(404, "turn_not_found")
        return result

    @app.post("/v1/turns/{tid}/cancel", dependencies=auth)
    async def cancel_turn(tid: str):
        return await app.state.engine.cancel(tid)

    @app.get("/v1/turns/{tid}/events", dependencies=auth)
    async def turn_events(
        tid: str,
        after: int = 0,
        last_event_id: Annotated[str | None, Header()] = None,
    ):
        if last_event_id is not None:
            try:
                after = int(last_event_id)
            except ValueError as e:
                raise PipelineError(422, "invalid_event_cursor") from e
        if after < 0:
            raise PipelineError(422, "invalid_event_cursor")
        turn = app.state.engine.turns.get(tid)
        if turn is None:
            if await app.state.store.turn(tid):
                raise PipelineError(410, "events_expired")
            raise PipelineError(404, "turn_not_found")
        try:
            turn.log.check_cursor(after)
        except ReplayExpired as e:
            raise PipelineError(409, "event_history_lost") from e
        except ValueError as e:
            raise PipelineError(422, "invalid_event_cursor") from e

        async def stream():
            try:
                async for event in turn.log.stream(after):
                    yield event
            except ReplayExpired:
                data = json.dumps({"turn_id": tid, "code": "event_history_lost"})
                yield f"event: stream.reset_required\ndata: {data}\n\n"
            except asyncio.CancelledError:
                # Transport disconnect is not a cancellation command. POST cancel is explicit.
                raise

        return StreamingResponse(
            stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
        )

    @app.post("/v1/sessions/{sid}/memory/organize", status_code=202, dependencies=auth)
    async def organize(sid: str, body: MemoryOrganize):
        return await app.state.engine.start_memory_job(sid, body.message_limit)

    @app.get("/v1/memory/jobs/{jid}", dependencies=auth)
    async def memory_job(jid: str):
        job = await app.state.store.job(jid)
        if not job:
            raise PipelineError(404, "job_not_found")
        return job

    @app.post("/v1/memory/proposals/{pid}/accept", dependencies=auth)
    async def accept(pid: str):
        try:
            return await app.state.store.accept(pid)
        except KeyError as e:
            raise PipelineError(404, "proposal_not_found") from e
        except StaleMemory as e:
            raise PipelineError(409, "memory_changed") from e

    @app.get("/v1/sessions/{sid}/memory", dependencies=auth)
    async def facts(sid: str):
        session = await app.state.engine._session(sid)
        return {"facts": await app.state.store.facts(session["character_id"])}

    @app.patch("/v1/memory/facts/{fid}", dependencies=auth)
    async def edit_fact(fid: str, body: MemoryEdit):
        await app.state.engine.edit_fact(fid, body.text)
        return {"status": "updated", "earlier_context_invalidated": True}

    @app.delete("/v1/memory/facts/{fid}", dependencies=auth)
    async def delete_fact(fid: str):
        await app.state.engine.edit_fact(fid, None)
        return {"status": "deleted", "earlier_context_invalidated": True}

    @app.get("/v1/moss/voices", dependencies=auth)
    async def moss_voices():
        return await app.state.live.list_voices()

    @app.post("/v1/moss/voices/clone", status_code=201, dependencies=auth)
    async def moss_clone_voice(
        request: Request,
        name: str = "",
        filename: str = "sample.wav",
        description: str = "",
    ):
        audio_bytes = await request.body()
        return await app.state.live.clone_voice(
            audio_bytes, filename=filename, name=name, description=description
        )

    @app.post("/v1/live/ticket", dependencies=auth)
    async def live_ticket(sid: str):
        session = await app.state.store.session(sid)
        if not session:
            raise PipelineError(404, "session_not_found")
        return {"ticket": app.state.live.issue_ticket(sid), "expires_in_s": 30}

    @app.websocket("/v1/sessions/{sid}/live")
    async def moss_live_socket(
        websocket: WebSocket,
        sid: str,
        voice: str | None = None,
        lang: str | None = None,
        tz: str | None = None,
        ticket: str | None = None,
    ):
        origin = websocket.headers.get("origin")
        scheme = "https" if websocket.url.scheme == "wss" else "http"
        own_origin = f"{scheme}://{websocket.url.netloc}"
        if origin and origin not in {own_origin, *config.allowed_origins}:
            await websocket.close(code=4403, reason="origin_not_allowed")
            return
        auth_header = websocket.headers.get("authorization", "")
        bearer_token = auth_header[7:].strip() if auth_header.lower().startswith("bearer ") else ""
        bearer_ok = bool(bearer_token) and secrets.compare_digest(
            bearer_token.encode(), app.state.token.encode()
        )
        ui_cookie = websocket.cookies.get("companion_mock_ui", "")
        mock_ui_ok = config.mode == "mock" and secrets.compare_digest(
            ui_cookie.encode(), app.state.ui_token.encode()
        )
        ticket_ok = app.state.live.consume_ticket(sid, ticket)
        if not bearer_ok and not mock_ui_ok and not ticket_ok:
            await websocket.close(code=4401, reason="invalid_local_token")
            return
        await app.state.live.handle_websocket(
            websocket, sid, voice_override=voice, language_override=lang, time_zone=tz
        )

    app.mount("/ui/assets", StaticFiles(directory=web_dir / "assets", check_dir=False))
    return app
