"""Run a real localhost HTTP/SSE smoke test. Refuses paid/live mode."""

import argparse
import asyncio
import base64
import json
import uuid
import wave
from datetime import UTC, datetime
from pathlib import Path

import httpx

from companion.config import Settings

PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1kAAAAASUVORK5CYII="


async def run(base_url):
    settings = Settings()
    token = settings.api_token.get_secret_value()
    if not token:
        token = (settings.data_dir / "api-token").read_text().strip()
    artifact_dir = Path("artifacts")
    artifact_dir.mkdir(exist_ok=True)
    async with httpx.AsyncClient(
        base_url=base_url, headers={"Authorization": "Bearer " + token}, timeout=10
    ) as client:

        async def request(method, path, **kwargs):
            response = await client.request(method, path, **kwargs)
            response.raise_for_status()
            return response.json()

        assert (await request("GET", "/health"))["mode"] == "mock", "Smoke test refuses live mode"
        config = await request("GET", "/v1/config")
        session = await request(
            "POST",
            "/v1/sessions",
            json={
                "character_id": "smoke_" + uuid.uuid4().hex[:8],
            },
        )
        sid = session["id"]

        async def turn(text, request_id, **kwargs):
            return await request(
                "POST",
                f"/v1/sessions/{sid}/turns",
                json={
                    "text": text,
                    "request_id": request_id,
                    **kwargs,
                },
            )

        async def collect(created, cancel_at_text=False):
            seen = []
            cancelled = False
            async with client.stream("GET", created["events_url"]) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    event = json.loads(line[6:])
                    seen.append(event)
                    if cancel_at_text and event["type"] == "text.delta" and not cancelled:
                        cancelled = True
                        await request("POST", f"/v1/turns/{created['turn_id']}/cancel")
            return seen

        created = await turn("记住：这个演示角色喜欢无糖茶", "dialogue")
        dialogue = await collect(created)
        assert dialogue[-1]["type"] == "turn.completed"
        audio = b"".join(
            base64.b64decode(e["data"]["audio_base64"])
            for e in dialogue
            if e["type"] == "audio.chunk"
        )
        assert audio
        with wave.open(str(artifact_dir / "demo.wav"), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(config["audio"]["sample_rate"])
            output.writeframes(audio)

        job = await request("POST", f"/v1/sessions/{sid}/memory/organize", json={})
        for _ in range(100):
            job = await request("GET", f"/v1/memory/jobs/{job['id']}")
            if job["status"] not in ("queued", "running"):
                break
            await asyncio.sleep(0.02)
        assert job["status"] == "completed" and job["proposal_count"] == 1
        fact = await request("POST", f"/v1/memory/proposals/{job['proposals'][0]['id']}/accept")
        assert fact["text"] == "这个演示角色喜欢无糖茶"

        policy = await request(
            "PUT",
            f"/v1/sessions/{sid}/screen-policy",
            json={
                "enabled": True,
                "source_id": "synthetic-test-window",
            },
        )
        vision_turn = await turn(
            "这是合成测试图片",
            "vision",
            speak=False,
            screen={
                "image_base64": PNG,
                "mime_type": "image/png",
                "policy_epoch": policy["epoch"],
                "source_id": "synthetic-test-window",
                "captured_at": datetime.now(UTC).isoformat(),
            },
        )
        vision = await collect(vision_turn)
        assert vision[-1]["type"] == "turn.completed"
        assert (await request("GET", f"/v1/turns/{vision_turn['turn_id']}"))["messages"] == []
        await request("PUT", f"/v1/sessions/{sid}/screen-policy", json={"enabled": False})
        cancelled = await collect(await turn("这是需要立即打断的演示。" * 10, "cancel"), True)
        assert cancelled[-1]["type"] == "turn.cancelled"
        report = {
            "checked_at": datetime.now(UTC).isoformat(),
            "mode": "mock",
            "paid_calls": 0,
            "models": config["models"],
            "session_id": sid,
            "dialogue_terminal": dialogue[-1]["type"],
            "audio_bytes": len(audio),
            "audio_description": "50 ms diagnostic tones, not synthesized human speech",
            "memory_proposals": job["proposal_count"],
            "memory_accepted": True,
            "vision_terminal": vision[-1]["type"],
            "vision_history_persisted": False,
            "cancel_terminal": cancelled[-1]["type"],
            "event_counts": {
                "dialogue": len(dialogue),
                "vision": len(vision),
                "cancel": len(cancelled),
            },
        }
        (artifact_dir / "smoke-report.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8765")
    asyncio.run(run(parser.parse_args().base_url))
