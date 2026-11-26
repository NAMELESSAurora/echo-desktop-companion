from starlette.responses import JSONResponse


class BodyLimitMiddleware:
    """Bound request bodies, including requests without Content-Length."""

    def __init__(self, app, limit=3_000_000, voice_clone_limit=10_500_000):
        self.app = app
        self.limit = limit
        self.voice_clone_limit = voice_clone_limit

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] not in ("POST", "PUT", "PATCH"):
            await self.app(scope, receive, send)
            return
        max_bytes = (
            self.voice_clone_limit if scope.get("path") == "/v1/moss/voices/clone" else self.limit
        )
        chunks, size = [], 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            block = message.get("body", b"")
            size += len(block)
            if size > max_bytes:
                response = JSONResponse({"error": {"code": "request_too_large"}}, status_code=413)
                await response(scope, receive, send)
                return
            chunks.append(block)
            if not message.get("more_body", False):
                break
        body = b"".join(chunks)
        delivered = False

        async def bounded_receive():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": body, "more_body": False}
            return await receive()

        await self.app(scope, bounded_receive, send)
