import pytest
from conftest import client_for, events, new_session, start

from companion.events import EventLog, ReplayExpired, SentenceBuffer


async def test_auth_host_origin_and_redacted_validation(settings):
    async with client_for(settings) as (client, _):
        assert (await client.get("/health")).status_code == 200
        assert (
            await client.get("/v1/config", headers={"Authorization": "Bearer wrong"})
        ).status_code == 401
        assert (
            await client.get("/v1/config", headers={"Host": "attacker.test"})
        ).status_code == 400
        assert (
            await client.get("/v1/config", headers={"Origin": "https://attacker.test"})
        ).status_code == 403
        sid = await new_session(client)
        response = await client.post(
            f"/v1/sessions/{sid}/turns",
            json={
                "request_id": "bad",
                "text": "test",
                "screen": {
                    "image_base64": "sensitive-invalid-base64",
                },
            },
        )
        assert response.status_code == 422
        assert "sensitive-invalid-base64" not in response.text
        cfg = (await client.get("/v1/config")).json()
        assert "api_key" not in str(cfg)
        assert cfg["models"]["tts"] == "qwen-audio-3.1-tts-flash"


async def test_live_missing_configuration_fails_closed(settings):
    settings.mode = "live"
    async with client_for(settings) as (client, _):
        sid = await new_session(client)
        response = await client.post(
            f"/v1/sessions/{sid}/turns",
            json={
                "request_id": "no-live-key",
                "text": "hello",
            },
        )
        assert response.status_code == 503
        assert response.json()["error"]["code"] == "deepseek_not_configured"


async def test_event_replay_and_bad_cursor(settings):
    async with client_for(settings) as (client, _):
        sid = await new_session(client)
        tid = await start(client, sid, speak=False)
        log = await events(client, tid)
        response = await client.get(f"/v1/turns/{tid}/events", headers={"Last-Event-ID": "2"})
        assert "id: 1\n" not in response.text
        assert f"id: {log[-1]['id']}\n" in response.text
        assert (await client.get(f"/v1/turns/{tid}/events?after=9999")).status_code == 422


async def test_bounded_event_history_detects_slow_consumer():
    log = EventLog("session", "turn", max_bytes=500)
    for _ in range(10):
        await log.emit("text.delta", {"text": "a" * 50})
    assert log.size <= 500
    with pytest.raises(ReplayExpired):
        log.check_cursor(0)


def test_sentence_split_handles_cross_chunk_chinese_and_long_unpunctuated_text():
    buffer = SentenceBuffer(max_chars=10)
    assert buffer.feed("第一") == []
    assert buffer.feed("句。下一句！") == ["第一句。", "下一句！"]
    assert buffer.feed("abcdefghijklm") == ["abcdefghij"]
    assert buffer.flush() == ["klm"]


async def test_chunked_body_limit(settings):
    async def body():
        for _ in range(4):
            yield b"x" * 800000

    async with client_for(settings) as (client, _):
        response = await client.post("/v1/sessions", content=body())
        assert response.status_code == 413
        assert response.json()["error"]["code"] == "request_too_large"
