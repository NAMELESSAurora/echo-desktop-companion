import json
import math
import struct
import time

import pytest
from conftest import TOKEN
from fastapi.testclient import TestClient
from pydantic import SecretStr, ValidationError
from starlette.websockets import WebSocketDisconnect

from companion.api import create_app
from companion.config import Settings
from companion.moss_live import MockMossUpstream, build_moss_realtime_url, pcm16_rms


def make_pcm16_frame(amplitude: int, samples: int = 640, freq_hz: float = 440.0) -> bytes:
    buf = bytearray(samples * 2)
    for i in range(samples):
        val = int(amplitude * math.sin(2.0 * math.pi * freq_hz * i / 16000.0))
        struct.pack_into("<h", buf, i * 2, max(-32767, min(32767, val)))
    return bytes(buf)


def make_settings(tmp_path, **overrides) -> Settings:
    defaults = dict(
        _env_file=None,
        data_dir=tmp_path,
        api_token=SecretStr(TOKEN),
        mock_delay_s=0.005,
        moss_idle_timeout_s=30.0,
    )
    defaults.update(overrides)
    return Settings(**defaults)


def create_session_sync(client: TestClient, headers: dict, **body) -> str:
    resp = client.post("/v1/sessions", headers=headers, json=body)
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def ws_url(path: str) -> str:
    return f"ws://127.0.0.1{path}"


def test_moss_settings_validation_and_public_config(tmp_path):
    with pytest.raises(ValidationError):
        make_settings(tmp_path, moss_realtime_url="ws://insecure.example/v1/realtime")
    with pytest.raises(ValidationError):
        make_settings(tmp_path, moss_rest_base_url="http://insecure.example/v1")

    cfg = make_settings(
        tmp_path,
        live_provider="moss",
        moss_api_key=SecretStr("moss-secret-do-not-leak"),
        moss_memory_scope="user",
        moss_user_id="user-42",
    )
    url = build_moss_realtime_url(cfg)
    assert url == "wss://api.mosi.cn/v1/realtime?model=moss-live-1.0&user=user-42"

    pub = cfg.public()
    assert "moss-secret-do-not-leak" not in str(pub)
    assert pub["configured"]["moss_live"] is True
    assert pub["moss_live"]["provider"] == "moss"
    assert pub["moss_live"]["model"] == "moss-live-1.0"
    assert pub["moss_live"]["memory_scope"] == "user"
    assert pub["moss_live"]["output_audio"]["sample_rate"] == 24000

    # Default provider is Qwen 3.1 Realtime Flash
    qcfg = make_settings(
        tmp_path / "q",
        qwen_api_key=SecretStr("qwen-secret-never-leak"),
        qwen_realtime_voice="qwen-audio-3.1-realtime-flash-rtnazfl-demo",
    )
    qpub = qcfg.public()
    assert "qwen-secret-never-leak" not in str(qpub)
    assert qpub["moss_live"]["provider"] == "qwen"
    assert qpub["moss_live"]["model"] == "qwen-audio-3.1-realtime-flash"
    assert qpub["configured"]["qwen_realtime"] is True


def test_moss_voices_endpoint_mock_and_live_fail_closed(tmp_path):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    app_mock = create_app(make_settings(tmp_path / "m"))
    with TestClient(app_mock, base_url="http://127.0.0.1") as client:
        resp = client.get("/v1/moss/voices", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["mode"] == "mock"
        assert body["measured"] is False
        assert len(body["voices"]) >= 2

    app_live_moss = create_app(make_settings(tmp_path / "lm", mode="live", live_provider="moss"))
    with TestClient(app_live_moss, base_url="http://127.0.0.1") as client:
        resp = client.get("/v1/moss/voices", headers=headers)
        assert resp.status_code == 503
        assert resp.json()["error"]["code"] == "moss_not_configured"

    app_live_qwen = create_app(
        make_settings(
            tmp_path / "lq",
            mode="live",
            live_provider="qwen",
            qwen_api_key=SecretStr("sk-fake-qwen"),
            qwen_realtime_voice="qwen-audio-3.1-realtime-flash-rtnazfl-demo",
        )
    )
    with TestClient(app_live_qwen, base_url="http://127.0.0.1") as client:
        resp = client.get("/v1/moss/voices", headers=headers)
        assert resp.status_code == 200
        voices = resp.json()["voices"]
        assert voices[0]["id"] == "qwen-audio-3.1-realtime-flash-rtnazfl-demo"
        assert voices[0]["source"] == "qwen_cloned"


def test_moss_voice_clone_endpoint_validation_and_mock_listing(tmp_path):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    wav_header = b"RIFF" + struct.pack("<I", 36) + b"WAVEfmt " + b"\x00" * 28

    app_mock = create_app(make_settings(tmp_path / "m"))
    with TestClient(app_mock, base_url="http://127.0.0.1") as client:
        # Invalid extension / bad header rejected
        bad_ext = client.post(
            "/v1/moss/voices/clone?filename=bad.txt", headers=headers, content=b"hello"
        )
        assert bad_ext.status_code == 422
        assert bad_ext.json()["error"]["code"] == "unsupported_audio_sample_format"

        bad_hdr = client.post(
            "/v1/moss/voices/clone?filename=fake.wav", headers=headers, content=b"not-a-wav-file"
        )
        assert bad_hdr.status_code == 422
        assert bad_hdr.json()["error"]["code"] == "invalid_audio_sample_header"

        # Valid WAV clones cleanly and appears in GET /v1/moss/voices
        ok = client.post(
            "/v1/moss/voices/clone?name=七草荠&filename=nazuna.wav",
            headers={**headers, "Content-Type": "audio/wav"},
            content=wav_header,
        )
        assert ok.status_code == 201, ok.text
        created = ok.json()["voice"]
        assert created["name"] == "七草荠"
        assert created["id"].startswith("mock-voice-")

        voices = client.get("/v1/moss/voices", headers=headers).json()["voices"]
        assert any(v["id"] == created["id"] for v in voices)

    app_live = create_app(make_settings(tmp_path / "l", mode="live"))
    with TestClient(app_live, base_url="http://127.0.0.1") as client:
        resp = client.post(
            "/v1/moss/voices/clone?name=七草荠&filename=nazuna.wav",
            headers={**headers, "Content-Type": "audio/wav"},
            content=wav_header,
        )
        assert resp.status_code == 503
        assert resp.json()["error"]["code"] == "moss_not_configured"


def test_live_websocket_auth_origin_and_config_boundaries(tmp_path):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    app = create_app(make_settings(tmp_path / "mock"))
    with TestClient(app, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)

        # Unauthenticated rejected before accept
        with pytest.raises(WebSocketDisconnect) as exc_info:
            with client.websocket_connect(ws_url(f"/v1/sessions/{sid}/live")):
                pass
        assert exc_info.value.code == 4401

        # Cross-origin CSWSH rejected before accept
        with pytest.raises(WebSocketDisconnect) as exc_info:
            with client.websocket_connect(
                ws_url(f"/v1/sessions/{sid}/live"),
                headers={**headers, "Origin": "https://evil.example"},
            ):
                pass
        assert exc_info.value.code == 4403

        # Missing session yields structured error then 4404
        with client.websocket_connect(
            ws_url("/v1/sessions/does-not-exist/live"), headers=headers
        ) as ws:
            err = ws.receive_json()
            assert err["action"] == "error"
            assert err["data"]["error"]["code"] == "session_not_found"
            with pytest.raises(WebSocketDisconnect) as close_exc:
                ws.receive_json()
            assert close_exc.value.code == 4404

    # Live mode without MOSS_API_KEY (when provider=moss) fails closed with 4503
    app_live = create_app(make_settings(tmp_path / "live", mode="live", live_provider="moss"))
    with TestClient(app_live, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)
        with client.websocket_connect(ws_url(f"/v1/sessions/{sid}/live"), headers=headers) as ws:
            err = ws.receive_json()
            assert err["action"] == "error"
            assert err["data"]["error"]["code"] == "moss_not_configured"
            with pytest.raises(WebSocketDisconnect) as close_exc:
                ws.receive_json()
            assert close_exc.value.code == 4503

    # Live mode without QWEN_API_KEY (default provider=qwen) fails closed with 4503
    app_live_q = create_app(make_settings(tmp_path / "live-q", mode="live", live_provider="qwen"))
    with TestClient(app_live_q, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)
        with client.websocket_connect(ws_url(f"/v1/sessions/{sid}/live"), headers=headers) as ws:
            err = ws.receive_json()
            assert err["data"]["error"]["code"] == "qwen_not_configured"
            with pytest.raises(WebSocketDisconnect) as close_exc:
                ws.receive_json()
            assert close_exc.value.code == 4503

    # Live mode with memory_scope=user but missing user_id fails closed
    app_user = create_app(
        make_settings(
            tmp_path / "live-user",
            mode="live",
            live_provider="moss",
            moss_api_key=SecretStr("sk-test-fake"),
            moss_memory_scope="user",
            moss_user_id="",
        )
    )
    with TestClient(app_user, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)
        with client.websocket_connect(ws_url(f"/v1/sessions/{sid}/live"), headers=headers) as ws:
            err = ws.receive_json()
            assert err["data"]["error"]["code"] == "moss_user_id_required"
            with pytest.raises(WebSocketDisconnect) as close_exc:
                ws.receive_json()
            assert close_exc.value.code == 4503


def test_live_bootstrap_order_memory_injection_and_voice_to_memory_roundtrip(tmp_path):
    sent_to_upstream: list[dict] = []

    class SpyMockUpstream(MockMossUpstream):
        async def send_json(self, payload: dict) -> None:
            sent_to_upstream.append(payload)
            await super().send_json(payload)

    headers = {"Authorization": f"Bearer {TOKEN}"}
    app = create_app(
        make_settings(
            tmp_path,
            live_provider="moss",
            moss_voice="6c3152b1-1d4f-4e49-ade3-09f447712fec",
        ),
        live_upstream_factory=lambda s: SpyMockUpstream(s),
    )

    with TestClient(app, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(
            client,
            headers,
            character_id="nazuna",
            system_prompt="你是七草荠，夜间漫步的伴生伙伴。",
        )
        # Seed a confirmed long-term fact first via existing HTTP turn + memory flow
        t_resp = client.post(
            f"/v1/sessions/{sid}/turns",
            headers=headers,
            json={"request_id": "seed-1", "text": "记住：用户偏爱无糖乌龙茶。", "speak": False},
        )
        assert t_resp.status_code == 202
        tid = t_resp.json()["turn_id"]
        assert client.get(f"/v1/turns/{tid}/events", headers=headers).status_code == 200
        job = client.post(
            f"/v1/sessions/{sid}/memory/organize", headers=headers, json={"message_limit": 20}
        ).json()
        for _ in range(50):
            job = client.get(f"/v1/memory/jobs/{job['id']}", headers=headers).json()
            if job["status"] == "completed":
                break
            time.sleep(0.02)
        assert job["status"] == "completed" and job["proposal_count"] >= 1
        pid = job["proposals"][0]["id"]
        assert client.post(f"/v1/memory/proposals/{pid}/accept", headers=headers).status_code == 200

        # Connect WebSocket using same-origin mock UI cookie to verify browser auth path too!
        boot = client.post(
            "/ui/connect",
            json={},
            headers={
                "Origin": "http://127.0.0.1",
                "Sec-Fetch-Site": "same-origin",
                "X-Companion-UI": "1",
            },
        )
        assert boot.status_code == 200

        with client.websocket_connect(
            ws_url(f"/v1/sessions/{sid}/live?tz=Asia/Shanghai"),
            headers={"Origin": "http://127.0.0.1"},
        ) as ws:
            ready = ws.receive_json()
            assert ready["action"] == "live.ready"
            assert ready["data"]["mode"] == "mock"
            assert ready["data"]["output_audio"]["sample_rate"] == 24000
            assert ready["data"]["voice"] == "6c3152b1-1d4f-4e49-ade3-09f447712fec"

            # Verify exact official MOSS-Live bootstrap ordering + injected SQLite memory
            actions = [p["action"] for p in sent_to_upstream]
            assert actions[:5] == [
                "attach_session",
                "change_voice",
                "session.update",
                "media.configure",
                "client_context.update",
            ]
            session_update = sent_to_upstream[2]["session"]
            assert "七草荠" in session_update["persona"]["prompt"]
            assert "无糖乌龙茶" in session_update["instructions"]
            assert sent_to_upstream[3]["playback"] == "client"
            assert sent_to_upstream[4]["context"]["time_zone"] == "Asia/Shanghai"

            ctx_ack = ws.receive_json()
            assert ctx_ack["action"] == "client_context.updated"

            # Switch voice live mid-call
            ws.send_json(
                {"action": "change_voice", "voice_name": "6cc93520-3207-4f7a-bca9-2d560b9c306b"}
            )
            v_ack = ws.receive_json()
            assert v_ack["action"] == "voice_changed"
            assert v_ack["data"]["name"] == "6cc93520-3207-4f7a-bca9-2d560b9c306b"

            # Trigger mock spoken utterance containing a memorable fact
            ws.send_json({"action": "mock.utterance", "text": "记住：我喜欢凌晨两点听爵士乐。"})

            contexts: list[dict] = []
            pcm_chunks: list[bytes] = []
            run_id = ""
            turn_id = ""

            while True:
                packet = ws.receive()
                if packet.get("bytes") is not None:
                    pcm_chunks.append(packet["bytes"])
                    continue
                ev = json.loads(packet["text"])
                act = ev["action"]
                if act == "response.audio.started":
                    run_id = ev["data"]["run_id"]
                    turn_id = ev["data"]["turn_id"]
                elif act == "response.audio.context":
                    contexts.append(ev["data"])
                elif act == "response.audio.done":
                    break

            assert len(contexts) == 4
            assert len(pcm_chunks) == 4
            assert all(len(c) > 0 and len(c) % 2 == 0 for c in pcm_chunks)

            # Send client playback acknowledgements per MOSS-Live contract
            for ctx in contexts:
                ws.send_json(
                    {
                        "action": "playback.chunk.completed",
                        "run_id": ctx["run_id"],
                        "turn_id": ctx["turn_id"],
                        "chunk_id": ctx["chunk_id"],
                    }
                )
            ws.send_json({"action": "playback.completed", "run_id": run_id, "turn_id": turn_id})

            t_done = ws.receive_json()
            assert t_done["action"] == "output.transcript.done"
            assert "凌晨两点听爵士乐" in t_done["data"]["text"]

            ended = ws.receive_json()
            assert ended["action"] == "response.ended"
            assert ended["data"]["status"] == "completed"

        # Spoken voice turn was persisted into SQLite and feeds memory organization!
        job2 = client.post(
            f"/v1/sessions/{sid}/memory/organize", headers=headers, json={"message_limit": 30}
        ).json()
        for _ in range(50):
            job2 = client.get(f"/v1/memory/jobs/{job2['id']}", headers=headers).json()
            if job2["status"] == "completed":
                break
            time.sleep(0.02)
        assert job2["status"] == "completed"
        proposal_texts = [p["text"] for p in job2["proposals"]]
        assert any("爵士乐" in t for t in proposal_texts)


def test_live_pcm16_vad_barge_in_and_guardrails(tmp_path):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    app = create_app(make_settings(tmp_path, mock_delay_s=0.04))

    with TestClient(app, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)

        with client.websocket_connect(ws_url(f"/v1/sessions/{sid}/live"), headers=headers) as ws:
            assert ws.receive_json()["action"] == "live.ready"

            # Reject unknown control action & malformed binary frame
            ws.send_json({"action": "session.update", "session": {}})
            err1 = ws.receive_json()
            assert err1["data"]["error"]["code"] == "action_not_allowed"

            ws.send_bytes(b"\x01\x02\x03")
            err2 = ws.receive_json()
            assert err2["data"]["error"]["code"] == "invalid_audio_frame"

            # Range validation on media.output.configure
            ws.send_json({"action": "media.output.configure", "volume_db": 99})
            err3 = ws.receive_json()
            assert err3["data"]["error"]["code"] == "invalid_public_request"

            ws.send_json({"action": "media.output.configure", "volume_db": -3, "speed": 1.1})
            ok_cfg = ws.receive_json()
            assert ok_cfg["action"] == "media.output.configured"
            assert ok_cfg["data"]["speed"] == 1.1

            # Real 16 kHz PCM16 VAD: speech -> silence -> response -> mid-speech barge-in
            loud = make_pcm16_frame(6500)
            silence = make_pcm16_frame(0)
            assert pcm16_rms(loud) > 0.1
            assert pcm16_rms(silence) == 0.0

            ws.send_json({"action": "mic_state", "enabled": True})
            for _ in range(3):
                ws.send_bytes(loud)
            assert ws.receive_json()["action"] == "input.speech.started"
            assert ws.receive_json()["action"] == "input.transcript.updated"

            for _ in range(11):
                ws.send_bytes(silence)

            seen_actions = []
            while "response.audio.started" not in seen_actions:
                pkt = ws.receive()
                if pkt.get("text"):
                    seen_actions.append(json.loads(pkt["text"])["action"])
            assert "input.speech.stopped" in seen_actions
            assert "input.transcript.done" in seen_actions

            # Barge in mid-reply using loud speech frames!
            for _ in range(3):
                ws.send_bytes(loud)

            got_stop = None
            got_interrupted = None
            for _ in range(25):
                pkt = ws.receive()
                if pkt.get("bytes") is not None:
                    continue
                ev = json.loads(pkt["text"])
                if ev["action"] == "response.audio.stop":
                    got_stop = ev
                elif ev["action"] == "response.interrupted":
                    got_interrupted = ev
                    break

            assert got_stop is not None and got_stop["data"]["reason"] == "barge_in"
            assert got_interrupted is not None
            ws.send_json(
                {
                    "action": "playback.stopped",
                    "run_id": got_stop["data"]["run_id"],
                    "turn_id": got_stop["data"]["turn_id"],
                    "played_audio_ms": 110,
                }
            )


def test_live_concurrency_limits_and_mock_only_action_blocked_in_live_mode(tmp_path):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    app = create_app(make_settings(tmp_path / "cap", moss_max_connections=1))
    with TestClient(app, base_url="http://127.0.0.1") as client:
        sid1 = create_session_sync(client, headers)
        sid2 = create_session_sync(client, headers)

        with client.websocket_connect(ws_url(f"/v1/sessions/{sid1}/live"), headers=headers) as ws1:
            assert ws1.receive_json()["action"] == "live.ready"

            # Same session second live socket rejected with 4409
            with client.websocket_connect(
                ws_url(f"/v1/sessions/{sid1}/live"), headers=headers
            ) as ws_dup:
                assert ws_dup.receive_json()["data"]["error"]["code"] == "live_session_busy"
                with pytest.raises(WebSocketDisconnect) as exc1:
                    ws_dup.receive_json()
                assert exc1.value.code == 4409

            # Second session exceeds moss_max_connections=1 -> 4429
            with client.websocket_connect(
                ws_url(f"/v1/sessions/{sid2}/live"), headers=headers
            ) as ws_cap:
                assert ws_cap.receive_json()["data"]["error"]["code"] == "live_capacity_full"
                with pytest.raises(WebSocketDisconnect) as exc2:
                    ws_cap.receive_json()
                assert exc2.value.code == 4429

    # In live mode with injected fake upstream, mock.utterance MUST be rejected
    app_live = create_app(
        make_settings(
            tmp_path / "live-guard",
            mode="live",
            live_provider="qwen",
            qwen_api_key=SecretStr("sk-fake"),
        ),
        live_upstream_factory=lambda s: MockMossUpstream(s),
    )
    with TestClient(app_live, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)
        # Verify single-use WebSocket live ticket works once and cannot be replayed
        t_resp = client.post(f"/v1/live/ticket?sid={sid}", headers=headers)
        assert t_resp.status_code == 200
        ticket = t_resp.json()["ticket"]
        with client.websocket_connect(
            ws_url(f"/v1/sessions/{sid}/live?ticket={ticket}"),
            headers={"Origin": "http://127.0.0.1"},
        ) as ws:
            assert ws.receive_json()["action"] == "live.ready"
            ws.send_json({"action": "mock.utterance", "text": "hello"})
            err = ws.receive_json()
            assert err["data"]["error"]["code"] == "mock_only_action"
        # Reusing the consumed single-use ticket MUST fail with 4401
        with pytest.raises(WebSocketDisconnect) as replay_exc:
            with client.websocket_connect(
                ws_url(f"/v1/sessions/{sid}/live?ticket={ticket}"),
                headers={"Origin": "http://127.0.0.1"},
            ):
                pass
        assert replay_exc.value.code == 4401


async def test_qwen_realtime_silence_gate_drops_idle_and_flushes_preroll(tmp_path):
    from companion.moss_live import QwenRealtimeUpstream

    cfg = make_settings(tmp_path, qwen_silence_gate_rms=0.05)
    up = QwenRealtimeUpstream(cfg)
    sent_payloads: list[dict] = []

    class FakeWs:
        async def send(self, text: str) -> None:
            sent_payloads.append(json.loads(text))

    up._ws = FakeWs()
    up.mic_enabled = True

    silence = make_pcm16_frame(0)
    loud = make_pcm16_frame(6500)

    # Pure silence -> ZERO upstream audio frames sent (¥0 idle cost!)
    for _ in range(10):
        await up.send_bytes(silence)
    assert len(sent_payloads) == 0

    # Loud speech opens gate: flushes 4 pre-roll frames + current loud frame = 5 frames!
    await up.send_bytes(loud)
    assert len(sent_payloads) == 5
    assert all(p["type"] == "input_audio_buffer.append" for p in sent_payloads)

    # 30 silence frames pass during hangover (~1.2s for server_vad commit), then gate shuts
    for _ in range(35):
        await up.send_bytes(silence)
    assert len(sent_payloads) == 5 + 30


def test_live_idle_watchdog_ignores_silence_and_closes_to_prevent_billing(tmp_path):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    cfg = make_settings(tmp_path)
    cfg.moss_idle_timeout_s = 0.25
    app = create_app(cfg)
    with TestClient(app, base_url="http://127.0.0.1") as client:
        sid = create_session_sync(client, headers)
        with client.websocket_connect(ws_url(f"/v1/sessions/{sid}/live"), headers=headers) as ws:
            assert ws.receive_json()["action"] == "live.ready"
            # Continuously sending silent PCM16 frames MUST NOT keep billing connection alive
            silence = make_pcm16_frame(0)
            ws.send_bytes(silence)
            ws.send_json({"action": "ping", "timestamp": 123})
            pong = ws.receive_json()
            assert pong["action"] == "pong"

            ev = ws.receive_json()
            assert ev["action"] == "live.idle_timeout"
            with pytest.raises(WebSocketDisconnect) as exc:
                ws.receive_json()
            assert exc.value.code == 4000


def test_settings_coerces_sample_rate_literals_from_dotenv(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "COMPANION_MODE=live\n"
        "COMPANION_SAMPLE_RATE=24000\n"
        "COMPANION_MOSS_OUTPUT_SAMPLE_RATE=24000\n"
        "COMPANION_LIVE_PROVIDER=qwen\n",
        encoding="utf-8",
    )
    cfg = Settings(_env_file=str(env_file), data_dir=tmp_path)
    assert cfg.mode == "live"
    assert cfg.sample_rate == 24000
    assert cfg.moss_output_sample_rate == 24000
    assert cfg.live_provider == "qwen"
