"""Enroll Nanakusa Nazuna (七草荠 · CV: 雨宫天) on Qwen 3.1 Realtime Flash & TTS Flash.

Uses the verified 19.20s zero-BGM dry studio reference
(`.local/voice_refs/clean/nazuna_ref_24k.wav`), enrolls on BOTH
`qwen-audio-3.1-realtime-flash` and `qwen-audio-3.1-tts-flash`, and runs a quick
Chinese + Japanese audition over `wss://dashscope.aliyuncs.com/api-ws/v1/realtime`.

Reads the DashScope key via COMPANION_QWEN_API_KEY / DASHSCOPE_API_KEY or DPAPI
(`%USERPROFILE%\\.oc-shell-companion\\qwen-key.bin`). NEVER prints keys or mutates external configs.
"""

from __future__ import annotations

import asyncio
import base64
import ctypes
import ctypes.wintypes
import hashlib
import json
import os
import time
import urllib.request
import uuid
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
REF_WAV = ROOT / ".local" / "voice_refs" / "clean" / "nazuna_ref_24k.wav"
OUT_JSON = ROOT / ".local" / "voice_refs" / "qwen_nazuna_voices.json"
AUDITION_DIR = ROOT / ".local" / "voice_refs" / "audition"


class _DataBlob(ctypes.Structure):
    _fields_ = [
        ("cbData", ctypes.wintypes.DWORD),
        ("pbData", ctypes.POINTER(ctypes.c_char)),
    ]


def load_dashscope_key() -> str:
    for var in ("COMPANION_QWEN_API_KEY", "DASHSCOPE_API_KEY", "QWEN_API_KEY"):
        val = os.environ.get(var, "").strip()
        if val:
            return val
    dpapi_path = Path.home() / ".oc-shell-companion" / "qwen-key.bin"
    if not dpapi_path.exists():
        raise RuntimeError(
            "No DashScope key found in env (COMPANION_QWEN_API_KEY / DASHSCOPE_API_KEY) "
            f"or {dpapi_path}"
        )
    raw = dpapi_path.read_bytes()
    blob_in = _DataBlob(len(raw), ctypes.create_string_buffer(raw, len(raw)))
    blob_out = _DataBlob()
    if not ctypes.windll.crypt32.CryptUnprotectData(
        ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)
    ):
        raise RuntimeError("DPAPI decrypt failed for qwen-key.bin")
    try:
        return ctypes.string_at(blob_out.pbData, blob_out.cbData).decode("utf-8").strip()
    finally:
        ctypes.windll.kernel32.LocalFree(blob_out.pbData)


def estimate_f0_stats(wav_path: Path) -> tuple[float, float, float]:
    with wave.open(str(wav_path), "rb") as wf:
        sr = wf.getframerate()
        nch = wf.getnchannels()
        arr = (
            np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)
            / 32768.0
        )
    if nch > 1:
        arr = arr.reshape(-1, nch).mean(axis=1)
    win = int(0.030 * sr)
    hop = int(0.010 * sr)
    min_lag, max_lag = int(sr / 520.0), int(sr / 140.0)
    f0s: list[float] = []
    for i in range(0, max(0, len(arr) - win), hop):
        seg = arr[i : i + win]
        if float(np.sqrt(np.mean(seg**2))) < 0.022:
            continue
        seg = seg - np.mean(seg)
        ac = np.correlate(seg, seg, mode="full")[win - 1 :]
        if ac[0] <= 1e-8:
            continue
        ac /= ac[0]
        sub = ac[min_lag:max_lag]
        if len(sub) and float(np.max(sub)) > 0.42:
            f0s.append(sr / float(min_lag + int(np.argmax(sub))))
    dur = len(arr) / float(sr)
    if not f0s:
        return (0.0, 0.0, dur)
    f0a = np.array(f0s)
    return (float(np.median(f0a)), float(np.percentile(f0a, 75) - np.percentile(f0a, 25)), dur)


def dash_json(url: str, method: str, key: str, body: dict | None = None, oss_resolve: bool = False):
    headers = {"Authorization": "Bearer " + key}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    if oss_resolve:
        headers["X-DashScope-OssResourceResolve"] = "enable"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def upload_temp_oss(wav_bytes: bytes, prefix: str, key: str) -> str:
    pol = dash_json(
        "https://dashscope.aliyuncs.com/api/v1/uploads?action=getPolicy&model=voice-enrollment",
        "GET",
        key,
    )["data"]
    host = pol["upload_host"].replace("http://", "https://")
    fname = f"{prefix}-{uuid.uuid4().hex[:8]}.wav"
    obj_key = pol["upload_dir"].rstrip("/") + "/" + fname
    bd = "ECHOQWEN" + uuid.uuid4().hex
    parts: list[bytes] = []
    for kf, kp in [
        ("OSSAccessKeyId", "oss_access_key_id"),
        ("Signature", "signature"),
        ("policy", "policy"),
        ("x-oss-object-acl", "x_oss_object_acl"),
        ("x-oss-forbid-overwrite", "x_oss_forbid_overwrite"),
    ]:
        parts.append(
            f'--{bd}\r\nContent-Disposition: form-data; name="{kf}"\r\n\r\n{pol[kp]}\r\n'.encode()
        )
    parts.append(
        f'--{bd}\r\nContent-Disposition: form-data; name="key"\r\n\r\n{obj_key}\r\n'.encode()
    )
    parts.append(
        (
            f'--{bd}\r\nContent-Disposition: form-data; name="success_action_status"\r\n\r\n200\r\n'
        ).encode()
    )
    parts.append(
        f'--{bd}\r\nContent-Disposition: form-data; name="file"; filename="{fname}"\r\n'
        f"Content-Type: audio/wav\r\n\r\n".encode()
    )
    parts.append(wav_bytes)
    parts.append(f"\r\n--{bd}--\r\n".encode())
    body = b"".join(parts)
    req = urllib.request.Request(
        host,
        data=body,
        method="POST",
        headers={
            "Content-Type": f"multipart/form-data; boundary={bd}",
            "Content-Length": str(len(body)),
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status not in (200, 204):
            raise RuntimeError(f"OSS upload failed HTTP {resp.status}")
    return "oss://" + obj_key


def enroll_voice(
    key: str,
    target_model: str,
    prefix: str,
    wav_path: Path,
    store: dict,
    slot_key: str,
) -> str:
    wav_bytes = wav_path.read_bytes()
    sha = hashlib.sha256(wav_bytes).hexdigest()
    existing = store.get(slot_key)
    if (
        existing
        and existing.get("status") == "OK"
        and existing.get("ref_sha256") == sha
        and existing.get("voice_id")
    ):
        print(f"[{slot_key}] Reusing verified voice_id={existing['voice_id']}")
        return existing["voice_id"]

    print(f"[{slot_key}] Uploading {wav_path.name} ({len(wav_bytes)} B) for {target_model}...")
    oss_url = upload_temp_oss(wav_bytes, prefix, key)
    payload: dict = {
        "action": "create_voice",
        "target_model": target_model,
        "prefix": prefix,
        "url": oss_url,
    }
    if "tts-flash" in target_model:
        payload["language_hints"] = ["ja"]
        payload["max_prompt_audio_length"] = 20.0
        payload["enable_preprocess"] = False
        payload["enable_volume_normalization"] = False
    else:
        payload["enable_volume_normalization"] = "false"

    custom_url = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization"
    res = dash_json(
        custom_url,
        "POST",
        key,
        body={"model": "voice-enrollment", "input": payload},
        oss_resolve=True,
    )
    vid = res.get("output", {}).get("voice_id", "")
    if not vid:
        raise RuntimeError(f"create_voice({target_model}) failed: {res}")
    print(f"[{slot_key}] Created voice_id={vid}, polling deployment status...")

    status = "DEPLOYING"
    for _ in range(30):
        time.sleep(2.0)
        q = dash_json(
            custom_url,
            "POST",
            key,
            body={"model": "voice-enrollment", "input": {"action": "query_voice", "voice_id": vid}},
        )
        status = q.get("output", {}).get("status", "")
        print(f"  [{slot_key}] status={status}")
        if status == "OK":
            break
        if status == "UNDEPLOYED":
            raise RuntimeError(f"Voice clone UNDEPLOYED ({target_model}): {q}")

    store[slot_key] = {
        "character": "七草荠 (Nanakusa Nazuna)",
        "actor": "雨宫天 (Sora Amamiya)",
        "model": target_model,
        "voice_id": vid,
        "status": status,
        "ref_sha256": sha,
        "ref_wav": str(wav_path),
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")
    return vid


async def audition_realtime(
    key: str,
    model: str,
    voice_id: str,
    text: str,
    lang: str,
    out_wav: Path,
) -> None:
    import websockets

    ws_url = f"wss://dashscope.aliyuncs.com/api-ws/v1/realtime?model={model}"
    if lang == "zh":
        instr = (
            "你是《彻夜之歌》里的七草荠（Nanakusa Nazuna），现在作为用户的桌面夜行伴生伙伴。"
            "保持参考音色里那种略带慵懒、坏笑、亲近又俏皮的少女声线，用自然松弛的中文口语直接说出用户交给你的台词，"
            "不要念标点、不要加多余解释。"
        )
        prompt = f"请用七草荠的口吻自然说出这一句：\n{text}"
    else:
        instr = (
            "あなたは『よふかしのうた』の七草ナズナ（CV：雨宮天）です。"
            "参考音声の少し気だるくて悪戯っぽい親しみのあるトーンを保ち、渡されたセリフだけを自然に演じてください。"
        )
        prompt = f"次のセリフをナズナらしくそのまま話して：\n{text}"

    pcm = bytearray()
    transcript: list[str] = []
    async with websockets.connect(
        ws_url,
        additional_headers={"Authorization": "Bearer " + key},
        open_timeout=30,
    ) as ws:
        await ws.send(
            json.dumps(
                {
                    "type": "session.update",
                    "session": {
                        "modalities": ["audio", "text"],
                        "voice": voice_id,
                        "enable_speech_emotion": True,
                        "output_audio_format": "pcm",
                        "output_audio": {"language": lang},
                        "turn_detection": {"type": "server_vad"},
                        "enable_search": False,
                        "instructions": instr,
                    },
                },
                ensure_ascii=False,
            )
        )
        while True:
            ev = json.loads(await asyncio.wait_for(ws.recv(), timeout=30))
            if ev.get("type") == "error":
                raise RuntimeError(f"Realtime session.update error: {ev}")
            if ev.get("type") == "session.updated":
                break

        await ws.send(
            json.dumps(
                {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "message",
                        "role": "user",
                        "content": [{"type": "input_text", "text": prompt}],
                    },
                },
                ensure_ascii=False,
            )
        )
        await ws.send(
            json.dumps({"type": "response.create", "response": {"modalities": ["audio", "text"]}})
        )
        while True:
            ev = json.loads(await asyncio.wait_for(ws.recv(), timeout=45))
            t = ev.get("type")
            if t == "error":
                raise RuntimeError(f"Realtime response error: {ev}")
            if t == "response.audio.delta":
                pcm.extend(base64.b64decode(ev["delta"]))
            elif t == "response.audio_transcript.delta":
                transcript.append(ev.get("delta", ""))
            elif t == "response.done":
                break

    out_wav.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)
        wf.writeframes(bytes(pcm))
    med, iqr, dur = estimate_f0_stats(out_wav)
    print(
        f"[AUDITION {model} {lang}] {out_wav.name} | dur={dur:.2f}s | "
        f"F0={med:.1f}Hz (IQR {iqr:.1f}Hz) | text={''.join(transcript)!r}"
    )


async def main() -> None:
    if not REF_WAV.exists():
        raise FileNotFoundError(f"Master reference WAV missing: {REF_WAV}")
    key = load_dashscope_key()
    store = json.loads(OUT_JSON.read_text(encoding="utf-8")) if OUT_JSON.exists() else {}

    # 1. Enroll on qwen-audio-3.1-realtime-flash (10x cheaper than MOSS-Live!)
    rt_vid = None
    rt_model = "qwen-audio-3.1-realtime-flash"
    try:
        rt_vid = enroll_voice(key, rt_model, "rtnazfl", REF_WAV, store, "realtime_flash")
    except Exception as exc:
        print(
            f"[WARN] {rt_model} enrollment failed ({exc}); falling back check on realtime-plus..."
        )
        rt_model = "qwen-audio-3.1-realtime-plus"
        rt_vid = enroll_voice(key, rt_model, "rtnazpl", REF_WAV, store, "realtime_plus")

    # 2. Enroll on qwen-audio-3.1-tts-flash (for ultra-low-cost HTTP/SSE pipeline!)
    tts_vid = enroll_voice(key, "qwen-audio-3.1-tts-flash", "ttsnazfl", REF_WAV, store, "tts_flash")
    print(f"\nENROLLED:\n  realtime ({rt_model}): {rt_vid}\n  tts_flash: {tts_vid}")

    # 3. Run real Chinese + Japanese auditions on the realtime model
    await audition_realtime(
        key,
        rt_model,
        rt_vid,
        "哟，这么晚还没睡啊？既然都熬夜了，今晚就陪我好好聊到满意为止吧。",
        "zh",
        AUDITION_DIR / "nazuna_realtime_zh.wav",
    )
    await audition_realtime(
        key,
        rt_model,
        rt_vid,
        "おいおい、まだ寝る気ないんだろ？夜はこれからだっつの。",
        "ja",
        AUDITION_DIR / "nazuna_realtime_ja.wav",
    )


if __name__ == "__main__":
    asyncio.run(main())
