import asyncio
import base64
from datetime import UTC, datetime, timedelta

from conftest import client_for, events, new_session, start

from companion.models import FactCandidate, MemoryResult
from companion.providers import (
    AudioChunk,
    MockSpeechProvider,
    MockTextProvider,
    ProviderError,
    Providers,
    TextChunk,
)

PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1kAAAAASUVORK5CYII="


async def wait_job(client, jid):
    for _ in range(200):
        job = (await client.get(f"/v1/memory/jobs/{jid}")).json()
        if job["status"] not in ("queued", "running"):
            return job
        await asyncio.sleep(0.005)
    raise AssertionError("memory job did not terminate")


async def organize(client, sid):
    response = await client.post(f"/v1/sessions/{sid}/memory/organize", json={})
    assert response.status_code == 202
    return await wait_job(client, response.json()["id"])


async def test_offline_text_speech_and_idempotency(settings):
    async with client_for(settings) as (client, app):
        sid = await new_session(client)
        tid = await start(client, sid)
        result = await events(client, tid)
        assert [e["id"] for e in result] == list(range(1, len(result) + 1))
        assert result[0]["type"] == "turn.started"
        assert result[0]["data"]["mock_audio"] is True
        assert result[-1]["type"] == "turn.completed"
        assert result[-1]["data"]["audio_status"] == "generated"
        audio = [e for e in result if e["type"] == "audio.chunk"]
        assert audio and len(base64.b64decode(audio[0]["data"]["audio_base64"])) % 2 == 0
        state = (await client.get(f"/v1/turns/{tid}")).json()
        assert state["status"] == "completed"
        assert len(state["messages"]) == 2
        repeated = await client.post(
            f"/v1/sessions/{sid}/turns",
            json={
                "request_id": "req-1",
                "text": "你好",
            },
        )
        assert repeated.json()["turn_id"] == tid
        assert repeated.json()["replayed"] is True
        assert len(app.state.engine.turns) == 1
        conflict = await client.post(
            f"/v1/sessions/{sid}/turns",
            json={
                "request_id": "req-1",
                "text": "不同内容",
            },
        )
        assert conflict.status_code == 409


async def test_new_input_supersedes_queued_turn(settings):
    settings.mock_delay_s = 0.03
    async with client_for(settings) as (client, app):
        sid = await new_session(client)
        old = await start(client, sid)
        new = await start(client, sid, "新的问题", request_id="req-2")
        old_events = await events(client, old)
        assert old_events[-1]["type"] == "turn.cancelled"
        assert old_events[-1]["data"]["reason"] == "superseded"
        assert any(e["type"] == "audio.clear" for e in old_events)
        assert (await events(client, new))[-1]["type"] == "turn.completed"
        assert (await client.get(f"/v1/turns/{old}")).json()["messages"] == []


class HangingSpeech:
    def __init__(self):
        self.entered, self.stopped = asyncio.Event(), asyncio.Event()

    async def synthesize(self, text):
        self.entered.set()
        try:
            yield AudioChunk(audio=b"\x00\x00" * 100)
            await asyncio.Event().wait()
        finally:
            self.stopped.set()


async def test_cancel_closes_inflight_speech_and_has_one_terminal_event(settings):
    speech = HangingSpeech()
    bundle = Providers(MockTextProvider(settings), speech)
    async with client_for(settings, bundle) as (client, app):
        sid = await new_session(client)
        tid = await start(client, sid)
        await asyncio.wait_for(speech.entered.wait(), 1)
        cancel = await client.post(f"/v1/turns/{tid}/cancel")
        assert cancel.json()["status"] == "cancelled"
        assert speech.stopped.is_set()
        await client.post(f"/v1/turns/{tid}/cancel")
        log = await events(client, tid)
        assert sum(e["type"] == "turn.cancelled" for e in log) == 1
        assert log[-2]["type"] == "audio.clear"
        assert log[-1]["type"] == "turn.cancelled"


class BrokenSpeech:
    async def synthesize(self, text):
        raise ProviderError("provider_rate_limit", "tts")
        yield  # pragma: no cover


async def test_tts_failure_degrades_to_text_and_does_not_deadlock_queue(settings):
    class LongReply(MockTextProvider):
        async def reply(self, role, messages):
            for _ in range(20):
                yield TextChunk(text="这是一个独立的句子。")

    async with client_for(settings, Providers(LongReply(settings), BrokenSpeech())) as (client, _):
        sid = await new_session(client)
        tid = await start(client, sid)
        log = await asyncio.wait_for(events(client, tid), 2)
        assert log[-1]["type"] == "turn.completed"
        assert log[-1]["data"]["audio_status"] == "failed"
        assert sum(e["type"] == "warning" for e in log) == 1
        assert len((await client.get(f"/v1/turns/{tid}")).json()["messages"]) == 2


class HoldingText(MockTextProvider):
    def __init__(self, settings):
        super().__init__(settings)
        self.entered = asyncio.Event()
        self.stopped = asyncio.Event()

    async def reply(self, role, messages):
        self.entered.set()
        try:
            yield TextChunk(text="正在处理。")
            await asyncio.Event().wait()
        finally:
            self.stopped.set()


def screen(epoch):
    return {
        "image_base64": PNG,
        "mime_type": "image/png",
        "source_id": "window-test",
        "policy_epoch": epoch,
        "captured_at": datetime.now(UTC).isoformat(),
    }


async def test_screen_scope_epoch_revocation_and_no_persistence(settings):
    text = HoldingText(settings)
    async with client_for(settings, Providers(text, MockSpeechProvider(settings))) as (client, app):
        sid = await new_session(client)
        body = {"request_id": "vision-1", "text": "看一下这个窗口", "screen": screen(1)}
        denied = await client.post(f"/v1/sessions/{sid}/turns", json=body)
        assert denied.status_code == 409
        policy = (
            await client.put(
                f"/v1/sessions/{sid}/screen-policy",
                json={
                    "enabled": True,
                    "source_id": "window-test",
                },
            )
        ).json()
        body["screen"] = screen(policy["epoch"])
        result = await client.post(f"/v1/sessions/{sid}/turns", json=body)
        assert result.status_code == 202
        tid = result.json()["turn_id"]
        await asyncio.wait_for(text.entered.wait(), 1)
        disabled = await client.put(f"/v1/sessions/{sid}/screen-policy", json={"enabled": False})
        assert disabled.status_code == 200
        assert text.stopped.is_set()
        log = await events(client, tid)
        assert log[-1]["type"] == "turn.cancelled"
        assert app.state.engine.turns[tid].request.screen is None
        assert (await client.get(f"/v1/turns/{tid}")).json()["messages"] == []
        await client.put(
            f"/v1/sessions/{sid}/screen-policy",
            json={
                "enabled": True,
                "source_id": "window-test",
            },
        )
        body["request_id"] = "vision-old-epoch"
        assert (await client.post(f"/v1/sessions/{sid}/turns", json=body)).status_code == 409
        assert (await organize(client, sid))["proposal_count"] == 0


async def test_stale_screen_rejected_before_model_call(settings):
    async with client_for(settings) as (client, _):
        sid = await new_session(client)
        p = (
            await client.put(
                f"/v1/sessions/{sid}/screen-policy",
                json={
                    "enabled": True,
                    "source_id": "window-test",
                },
            )
        ).json()
        frame = screen(p["epoch"])
        frame["captured_at"] = (datetime.now(UTC) - timedelta(seconds=20)).isoformat()
        response = await client.post(
            f"/v1/sessions/{sid}/turns",
            json={
                "request_id": "stale",
                "text": "看看",
                "screen": frame,
            },
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "screen_frame_stale"


async def test_vision_role_receives_frame_but_next_turn_and_memory_do_not(settings):
    class RecordingText(MockTextProvider):
        def __init__(self, settings):
            super().__init__(settings)
            self.calls = []

        async def reply(self, role, messages):
            self.calls.append((role, messages))
            async for chunk in super().reply(role, messages):
                yield chunk

    text = RecordingText(settings)
    async with client_for(settings, Providers(text, MockSpeechProvider(settings))) as (client, app):
        sid = await new_session(client)
        policy = (
            await client.put(
                f"/v1/sessions/{sid}/screen-policy",
                json={
                    "enabled": True,
                    "source_id": "window-test",
                },
            )
        ).json()
        vision = await start(client, sid, "图中是什么", screen=screen(policy["epoch"]), speak=False)
        await events(client, vision)
        role, messages = text.calls[0]
        assert role == "vision"
        assert messages[-1]["content"][1]["image_url"]["url"] == "data:image/png;base64," + PNG
        await events(
            client, await start(client, sid, "新的文字问题", request_id="text-2", speak=False)
        )
        assert text.calls[-1][0] == "dialogue"
        assert PNG not in str(text.calls[-1][1])
        assert "图中是什么" not in str(text.calls[-1][1])
        _, _, sources = await app.state.store.memory_snapshot(sid, 30)
        assert [s["text"] for s in sources] == ["新的文字问题"]


async def test_capacity_refuses_extra_turn_without_interrupting_other_sessions(settings):
    settings.max_active_turns = 1
    text = HoldingText(settings)
    async with client_for(settings, Providers(text, MockSpeechProvider(settings))) as (client, app):
        sid = await new_session(client)
        sid2 = await new_session(client)
        active = await start(client, sid, speak=False)
        await text.entered.wait()
        busy = await client.post(
            f"/v1/sessions/{sid2}/turns",
            json={
                "request_id": "blocked",
                "text": "不能无限排队",
                "speak": False,
            },
        )
        assert busy.status_code == 429
        assert not app.state.engine.turns[active].log.closed
        await client.post(f"/v1/turns/{active}/cancel")


async def test_memory_proposals_accept_cross_session_edit_and_forget(settings):
    async with client_for(settings) as (client, app):
        sid = await new_session(client)
        tid = await start(client, sid, "记住：我喜欢无糖茶", speak=False)
        await events(client, tid)
        job = await organize(client, sid)
        assert job["status"] == "completed"
        assert len(job["proposals"]) == 1
        assert (await client.get(f"/v1/sessions/{sid}/memory")).json()["facts"] == []
        accepted = (
            await client.post(f"/v1/memory/proposals/{job['proposals'][0]['id']}/accept")
        ).json()
        sid2 = await new_session(client)
        facts = (await client.get(f"/v1/sessions/{sid2}/memory")).json()["facts"]
        assert facts[0]["text"] == "我喜欢无糖茶"
        assert facts[0]["id"] == accepted["id"]
        edited = await client.patch(
            f"/v1/memory/facts/{accepted['id']}",
            json={
                "text": "我现在喜欢气泡水",
            },
        )
        assert edited.status_code == 200
        active_facts, old_history = await app.state.store.context(sid)
        assert active_facts[0]["text"] == "我现在喜欢气泡水"
        assert old_history == []
        await client.delete(f"/v1/memory/facts/{accepted['id']}")
        assert (await client.get(f"/v1/sessions/{sid2}/memory")).json()["facts"] == []
        assert (await organize(client, sid))["proposals"] == []
        stale = await client.post(f"/v1/memory/proposals/{job['proposals'][0]['id']}/accept")
        assert stale.status_code == 409


async def test_bad_memory_job_does_not_poison_next_job(settings):
    class InvalidOnce(MockTextProvider):
        count = 0

        async def organize(self, sources):
            self.count += 1
            if self.count == 1:
                return MemoryResult(
                    facts=[FactCandidate(text="不能写入", source_message_ids=[999])]
                )
            return await super().organize(sources)

    async with client_for(
        settings, Providers(InvalidOnce(settings), MockSpeechProvider(settings))
    ) as (client, _):
        sid = await new_session(client)
        await events(client, await start(client, sid, "记住：我的测试代号是蓝鸟", speak=False))
        bad = await organize(client, sid)
        assert bad["status"] == "failed"
        assert bad["error_code"] == "invalid_memory_sources"
        assert bad["proposals"] == []
        assert (await organize(client, sid))["status"] == "completed"


async def test_memory_edit_invalidates_inflight_consolidation(settings):
    class SlowMemory(MockTextProvider):
        def __init__(self, settings):
            super().__init__(settings)
            self.entered, self.release = asyncio.Event(), asyncio.Event()
            self.slow = False

        async def organize(self, sources):
            if self.slow:
                self.entered.set()
                await self.release.wait()
            return await super().organize(sources)

    text = SlowMemory(settings)
    async with client_for(settings, Providers(text, MockSpeechProvider(settings))) as (client, _):
        sid = await new_session(client)
        await events(client, await start(client, sid, "记住：测试事实", speak=False))
        first = await organize(client, sid)
        fact = (
            await client.post(f"/v1/memory/proposals/{first['proposals'][0]['id']}/accept")
        ).json()
        text.slow = True
        running = (await client.post(f"/v1/sessions/{sid}/memory/organize", json={})).json()
        await text.entered.wait()
        await client.delete(f"/v1/memory/facts/{fact['id']}")
        text.release.set()
        result = await wait_job(client, running["id"])
        assert result["status"] == "stale"
        assert result["proposals"] == []


async def test_timeout_stops_upstream_and_next_session_works(settings):
    settings.turn_timeout_s = 0.05
    text = HoldingText(settings)
    async with client_for(settings, Providers(text, MockSpeechProvider(settings))) as (client, _):
        sid = await new_session(client)
        log = await events(client, await start(client, sid, speak=False))
        assert log[-1]["type"] == "turn.failed"
        assert log[-1]["data"]["reason"] == "turn_timeout"
        assert text.stopped.is_set()


async def test_unexpected_speech_exception_still_drains_text_queue(settings):
    class UnexpectedSpeech:
        async def synthesize(self, text):
            raise ValueError("test fault, must not reach API")
            yield

    async with client_for(settings, Providers(MockTextProvider(settings), UnexpectedSpeech())) as (
        client,
        _,
    ):
        sid = await new_session(client)
        log = await events(client, await start(client, sid))
        assert log[-1]["type"] == "turn.completed"
        assert log[-1]["data"]["audio_status"] == "failed"
        assert any(e["data"].get("code") == "tts_internal_error" for e in log)


async def test_cancel_during_commit_does_not_contradict_persisted_terminal_state(settings):
    async with client_for(settings) as (client, app):
        sid = await new_session(client)
        entered, release = asyncio.Event(), asyncio.Event()
        original = app.state.store.finish

        async def slow_finish(*args, **kwargs):
            entered.set()
            await release.wait()
            return await original(*args, **kwargs)

        app.state.store.finish = slow_finish
        tid = await start(client, sid, speak=False)
        await asyncio.wait_for(entered.wait(), 1)
        cancelled = asyncio.create_task(client.post(f"/v1/turns/{tid}/cancel"))
        await asyncio.sleep(0.01)
        release.set()
        result = await cancelled
        assert result.json()["status"] == "completed"
        log = await events(client, tid)
        assert log[-1]["type"] == "turn.completed"
        assert not any(e["type"] == "turn.cancelled" for e in log)


async def test_missing_fact_edit_does_not_cancel_an_unrelated_turn(settings):
    text = HoldingText(settings)
    async with client_for(settings, Providers(text, MockSpeechProvider(settings))) as (client, app):
        sid = await new_session(client)
        tid = await start(client, sid, speak=False)
        await text.entered.wait()
        response = await client.delete("/v1/memory/facts/missing")
        assert response.status_code == 404
        assert not app.state.engine.turns[tid].log.closed
        await client.post(f"/v1/turns/{tid}/cancel")


async def test_restart_preserves_data_and_resets_screen_permission(settings):
    async with client_for(settings) as (client, app):
        sid = await new_session(client)
        tid = await start(client, sid, "重启前的消息", speak=False)
        await events(client, tid)
        await client.put(
            f"/v1/sessions/{sid}/screen-policy",
            json={
                "enabled": True,
                "source_id": "window-test",
            },
        )
        await app.state.store.create_turn("crashed-turn", sid, "crash", "hash", False)
    async with client_for(settings) as (client, _):
        assert (await client.get(f"/v1/turns/{tid}")).json()["status"] == "completed"
        assert (await client.get(f"/v1/turns/{tid}/events")).status_code == 410
        assert (await client.get("/v1/turns/crashed-turn")).json()["status"] == "interrupted"
        assert (await client.get(f"/v1/sessions/{sid}")).json()["screen_enabled"] == 0
