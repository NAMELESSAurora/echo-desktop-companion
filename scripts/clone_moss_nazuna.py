"""Nanakusa Nazuna (七草荠 · CV: 雨宫天) voice-reference extraction & MOSS voice cloning pipeline.

Modeled directly on the proven PV QwenTTS pipeline (svdeck_nai_hook/src/clone_real_gbc_voices.py
and someone_real_hook/src/enroll_anime_nijika.py):
  1. --extract : Separates vocals with local UVR-MDX-NET-Voc_FT.onnx, transcribes Japanese speech
                 segments with local faster_whisper (small, int8, vad_filter=True), computes F0
                 pitch stats (median & IQR Hz) to avoid breathy/whispery artifacts, and masters
                 a clean 12-20s 24 kHz mono PCM16 WAV (highpass=75Hz, -19 dBFS RMS, 8ms fades).
  2. --clone   : Uploads the mastered WAV to MOSS `POST https://api.mosi.cn/v1/audio/voices`
                 (multipart/form-data), confirms it in `GET /v1/audio/voices`, and optionally
                 verifies `change_voice` on `wss://api.mosi.cn/v1/realtime?model=moss-live-1.0`.

Secrets are read only from `COMPANION_MOSS_API_KEY` / `MOSS_API_KEY` or `.env`, never printed.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import subprocess
import sys
import wave
from pathlib import Path

import httpx
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
REF_ROOT = ROOT / ".local" / "voice_refs"
RAW_DIR = REF_ROOT / "raw"
VOC_DIR = REF_ROOT / "vocals"
CLEAN_DIR = REF_ROOT / "clean"
MANIFEST_PATH = REF_ROOT / "moss_nazuna_voice.json"
DEFAULT_CLEAN_WAV = CLEAN_DIR / "nazuna_ref_24k.wav"

UVR_CANDIDATES = [
    Path(r"D:\WB\ak_amv\models\uvr\models\MDXNet\UVR-MDX-NET-Voc_FT.onnx"),
    Path(r"D:\A\oc-powershell\voice-library\tools\models\UVR-MDX-NET-Voc_FT.onnx"),
    Path(r"D:\A\provant\models\uvr\models\MDXNet\UVR-MDX-NET-Voc_FT.onnx"),
]
SEP_MDX_DIR = Path(r"D:\A\anime-amv-stylize\engine")


def estimate_f0_stats(wav_path: Path) -> tuple[float, float, float, float]:
    """Return (f0_median_hz, f0_iqr_hz, duration_s, voiced_ratio)."""
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
    min_lag = int(sr / 520.0)
    max_lag = int(sr / 140.0)
    f0s: list[float] = []
    total_frames = 0
    for i in range(0, max(0, len(arr) - win), hop):
        total_frames += 1
        seg = arr[i : i + win]
        rms = float(np.sqrt(np.mean(seg**2)))
        if rms < 0.022:
            continue
        seg = seg - np.mean(seg)
        ac = np.correlate(seg, seg, mode="full")[win - 1 :]
        if ac[0] <= 1e-8:
            continue
        ac /= ac[0]
        sub = ac[min_lag:max_lag]
        if len(sub) == 0:
            continue
        pk_i = int(np.argmax(sub))
        if sub[pk_i] > 0.42:
            f0s.append(sr / float(min_lag + pk_i))
    dur = len(arr) / float(sr)
    if not f0s:
        return (0.0, 0.0, dur, 0.0)
    f0a = np.array(f0s)
    voiced_ratio = len(f0s) / max(1, total_frames)
    return (
        float(np.median(f0a)),
        float(np.percentile(f0a, 75) - np.percentile(f0a, 25)),
        dur,
        voiced_ratio,
    )


def master_slice(src_wav: Path, dst_wav: Path, t0: float, t1: float) -> float:
    """Master a studio 24 kHz mono PCM16 reference (highpass 75 Hz, -19 dBFS RMS, 8 ms fades)."""
    dst_wav.parent.mkdir(parents=True, exist_ok=True)
    raw = subprocess.check_output(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            f"{t0:.3f}",
            "-to",
            f"{t1:.3f}",
            "-i",
            str(src_wav),
            "-ac",
            "1",
            "-ar",
            "24000",
            "-af",
            "highpass=f=75",
            "-f",
            "f32le",
            "pipe:1",
        ]
    )
    arr = np.frombuffer(raw, dtype=np.float32).copy()
    rms = float(np.sqrt(np.mean(arr**2)) + 1e-9)
    target_rms = 10 ** (-19.0 / 20.0)
    arr *= min(target_rms / rms, 4.0)
    peak = float(np.max(np.abs(arr)) + 1e-9)
    if peak > 0.85:
        arr *= 0.85 / peak
    fn = int(0.008 * 24000)
    if len(arr) > fn * 3:
        arr[:fn] *= np.linspace(0.0, 1.0, fn, dtype=np.float32)
        arr[-fn:] *= np.linspace(1.0, 0.0, fn, dtype=np.float32)
    pcm = np.clip(arr * 32767.0, -32768, 32767).astype(np.int16)
    with wave.open(str(dst_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)
        wf.writeframes(pcm.tobytes())
    return len(pcm) / 24000.0


def separate_vocals(raw_wav: Path, out_wav: Path, max_sec: float | None = None) -> Path:
    if out_wav.exists():
        return out_wav
    uvr = next((p for p in UVR_CANDIDATES if p.exists()), None)
    if uvr is None or not SEP_MDX_DIR.exists():
        print("[UVR] Local UVR model not found; using raw audio directly.")
        return raw_wav
    if str(SEP_MDX_DIR) not in sys.path:
        sys.path.insert(0, str(SEP_MDX_DIR))
    import sep_mdx as sm

    sm.FF = "ffmpeg"
    sm.MODEL = str(uvr)
    print(f"[UVR] Separating vocals for {raw_wav.name} with {uvr.name}...")
    mix = sm.load(str(raw_wav), ss=0.0, t=max_sec)
    voc = sm.separate(mix)
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    sm.save(str(out_wav), voc)
    return out_wav


def extract_and_audit(
    source_name: str | None = None,
    t0_override: float | None = None,
    t1_override: float | None = None,
) -> Path:
    from faster_whisper import WhisperModel

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    VOC_DIR.mkdir(parents=True, exist_ok=True)
    CLEAN_DIR.mkdir(parents=True, exist_ok=True)

    candidates = sorted(RAW_DIR.glob("*.wav"))
    if source_name:
        candidates = [p for p in candidates if source_name in p.stem]
    if not candidates:
        raise FileNotFoundError(f"No raw WAV sources found in {RAW_DIR}")

    print("[ASR] Loading faster_whisper small (int8)...")
    asr = WhisperModel("small", device="cpu", compute_type="int8")

    audit: list[dict] = []
    for raw_wav in candidates:
        voc_wav = separate_vocals(raw_wav, VOC_DIR / f"{raw_wav.stem}_vocals.wav", max_sec=75.0)
        segs_iter, info = asr.transcribe(
            str(voc_wav), language="ja", vad_filter=True, word_timestamps=False
        )
        segs = [
            {"start": float(s.start), "end": float(s.end), "text": s.text.strip()}
            for s in segs_iter
            if s.text.strip()
        ]
        print(
            f"\n[{raw_wav.stem}] lang={info.language} p={info.language_probability:.2f} | "
            f"{len(segs)} segments:"
        )
        for s in segs:
            print(f"  {s['start']:6.2f}s - {s['end']:6.2f}s : {s['text']}")

        if t0_override is not None and t1_override is not None:
            t0, t1 = t0_override, t1_override
            span_text = " / ".join(s["text"] for s in segs if s["end"] >= t0 and s["start"] <= t1)
            score = 10.0
        else:
            best = None
            for i in range(len(segs)):
                for j in range(i, len(segs)):
                    dur = segs[j]["end"] - segs[i]["start"]
                    if 11.5 <= dur <= 19.5:
                        speech_sum = sum(segs[k]["end"] - segs[k]["start"] for k in range(i, j + 1))
                        density = speech_sum / max(dur, 0.1)
                        intro_pen = 0.25 if segs[i]["start"] < 2.5 else 0.0
                        sc = density * 2.2 - abs(dur - 15.5) * 0.05 - intro_pen
                        if best is None or sc > best[0]:
                            best = (
                                sc,
                                segs[i]["start"],
                                segs[j]["end"],
                                " / ".join(segs[k]["text"] for k in range(i, j + 1)),
                            )
            if best is None and segs:
                s0 = segs[0]["start"]
                e0 = min(s0 + 16.0, segs[-1]["end"])
                best = (0.0, s0, e0, " / ".join(s["text"] for s in segs))
            if best is None:
                continue
            score, t0, t1, span_text = best

        t0 = max(0.0, t0 - 0.10)
        t1 = t1 + 0.12
        cand_out = CLEAN_DIR / f"{raw_wav.stem}_cand.wav"
        dur = master_slice(voc_wav, cand_out, t0, t1)
        f0_med, f0_iqr, _, voiced = estimate_f0_stats(cand_out)
        # Prefer normal conversational voice (good voiced_ratio & F0 190-330Hz, not whisper)
        quality = score + voiced * 1.8 + (0.6 if 185.0 <= f0_med <= 340.0 else -0.4)
        rec = {
            "source": raw_wav.stem,
            "wav": str(cand_out),
            "slice": [round(t0, 3), round(t1, 3)],
            "duration_s": round(dur, 3),
            "f0_median_hz": round(f0_med, 1),
            "f0_iqr_hz": round(f0_iqr, 1),
            "voiced_ratio": round(voiced, 3),
            "quality": round(quality, 3),
            "transcript": span_text,
        }
        audit.append(rec)
        print(
            f"  => CANDIDATE {cand_out.name}: {dur:.2f}s | F0={f0_med:.1f}Hz (IQR {f0_iqr:.1f}Hz) "
            f"| voiced={voiced:.2f} | Q={quality:.2f}"
        )

    if not audit:
        raise RuntimeError("No usable speech candidates extracted.")

    audit.sort(key=lambda r: r["quality"], reverse=True)
    winner = audit[0]
    import shutil

    shutil.copy2(winner["wav"], DEFAULT_CLEAN_WAV)
    sha = hashlib.sha256(DEFAULT_CLEAN_WAV.read_bytes()).hexdigest()
    summary = {"selected": {**winner, "wav": str(DEFAULT_CLEAN_WAV), "sha256": sha}, "all": audit}
    (CLEAN_DIR / "nazuna_extract_audit.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nSELECTED CLEAN NAZUNA REF -> {DEFAULT_CLEAN_WAV} ({winner['duration_s']}s)")
    print(f"  transcript: {winner['transcript']}")
    return DEFAULT_CLEAN_WAV


def resolve_moss_api_key() -> str:
    for var in ("COMPANION_MOSS_API_KEY", "MOSS_API_KEY"):
        val = os.environ.get(var, "").strip()
        if val:
            return val
    for env_path in (
        ROOT / ".env",
        Path(os.environ.get("LOCALAPPDATA", "")) / "EchoCompanion" / ".env",
    ):
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                if k.strip() in ("COMPANION_MOSS_API_KEY", "MOSS_API_KEY") and v.strip():
                    return v.strip().strip('"').strip("'")
    raise RuntimeError(
        "未找到 MOSS API Key。请设置环境变量 COMPANION_MOSS_API_KEY（或 MOSS_API_KEY），"
        "或在 .env 中填写 COMPANION_MOSS_API_KEY=<你的密钥> 后重试。"
    )


async def verify_moss_live_change_voice(api_key: str, voice_id: str) -> dict:
    """Brief WSS /v1/realtime probe verifying attach_session + change_voice, then closing."""
    import websockets

    url = "wss://api.mosi.cn/v1/realtime?model=moss-live-1.0"
    async with websockets.connect(
        url,
        additional_headers={"Authorization": f"Bearer {api_key}"},
        open_timeout=15,
    ) as ws:
        await ws.send(json.dumps({"action": "attach_session", "session_id": None}))
        while True:
            ev = json.loads(await asyncio.wait_for(ws.recv(), timeout=15))
            if ev.get("action") == "error":
                raise RuntimeError(f"MOSS-Live attach error: {ev}")
            if ev.get("action") == "session_attached":
                break
        await ws.send(json.dumps({"action": "change_voice", "voice_name": voice_id}))
        while True:
            ev = json.loads(await asyncio.wait_for(ws.recv(), timeout=15))
            if ev.get("action") == "error":
                raise RuntimeError(f"MOSS-Live change_voice rejected: {ev}")
            if ev.get("action") == "voice_changed":
                return ev.get("data") or {}


def clone_to_moss(wav_path: Path, name: str, verify_live: bool = False) -> dict:
    if not wav_path.exists():
        raise FileNotFoundError(f"Clean reference WAV not found: {wav_path}")
    raw_bytes = wav_path.read_bytes()
    if len(raw_bytes) > 10 * 1024 * 1024:
        raise ValueError("MOSS audio_sample limit is 10 MB")
    sha = hashlib.sha256(raw_bytes).hexdigest()

    api_key = resolve_moss_api_key()
    base = os.environ.get("COMPANION_MOSS_REST_BASE_URL", "https://api.mosi.cn/v1").rstrip("/")
    headers = {"Authorization": f"Bearer {api_key}"}

    print(f"[MOSS] Uploading {wav_path.name} ({len(raw_bytes)} B) to POST {base}/audio/voices ...")
    with httpx.Client(timeout=httpx.Timeout(60.0, connect=10.0), follow_redirects=False) as client:
        resp = client.post(
            f"{base}/audio/voices",
            headers=headers,
            data={
                "name": name,
                "description": "七草荠（Nanakusa Nazuna · CV: 雨宫天）真实干声克隆",
            },
            files={"audio_sample": (wav_path.name, raw_bytes, "audio/wav")},
        )
        if resp.status_code >= 400:
            raise RuntimeError(
                f"POST /v1/audio/voices failed HTTP {resp.status_code}: {resp.text[:300]}"
            )
        created = resp.json()
        voice_id = created.get("id")
        if not voice_id:
            raise RuntimeError(f"Unexpected response without id: {created}")
        print(f"[MOSS] Cloned voice created: id={voice_id} name={created.get('name')!r}")

        # Verify presence in GET /v1/audio/voices
        list_resp = client.get(f"{base}/audio/voices", params={"limit": 50}, headers=headers)
        in_list = False
        if list_resp.status_code == 200:
            items = list_resp.json().get("data") or []
            in_list = any(item.get("id") == voice_id for item in items if isinstance(item, dict))
        print(f"[MOSS] Listed in GET /v1/audio/voices: {in_list}")

    live_probe = None
    if verify_live:
        print("[MOSS-Live] Probing change_voice on moss-live-1.0 ...")
        live_probe = asyncio.run(verify_moss_live_change_voice(api_key, voice_id))
        print(f"[MOSS-Live] voice_changed confirmed: {live_probe}")

    record = {
        "character": "七草荠 (Nanakusa Nazuna)",
        "actor": "雨宫天 (Sora Amamiya)",
        "voice_id": voice_id,
        "name": created.get("name", name),
        "object": created.get("object", "audio.voice"),
        "created_at": created.get("created_at"),
        "in_voice_list": in_list,
        "live_change_voice_verified": bool(live_probe),
        "ref_wav": str(wav_path),
        "ref_sha256": sha,
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[MOSS] Saved manifest -> {MANIFEST_PATH}")
    return record


def main() -> int:
    ap = argparse.ArgumentParser(description="Nazuna voice extraction & MOSS cloning pipeline")
    ap.add_argument("--extract", action="store_true", help="Run UVR + Whisper + studio mastering")
    ap.add_argument("--source", default=None, help="Filter raw WAV filename substring")
    ap.add_argument("--t0", type=float, default=None, help="Manual slice start seconds")
    ap.add_argument("--t1", type=float, default=None, help="Manual slice end seconds")
    ap.add_argument(
        "--clone", action="store_true", help="Upload clean WAV to MOSS /v1/audio/voices"
    )
    ap.add_argument("--wav", default=str(DEFAULT_CLEAN_WAV), help="WAV file to upload for cloning")
    ap.add_argument("--name", default="七草荠-Nazuna", help="Voice display name on MOSS")
    ap.add_argument(
        "--verify-live", action="store_true", help="Probe WSS moss-live-1.0 change_voice"
    )
    args = ap.parse_args()

    wav_path = Path(args.wav)
    if args.extract:
        wav_path = extract_and_audit(args.source, args.t0, args.t1)
    if args.clone:
        clone_to_moss(wav_path, args.name, verify_live=args.verify_live)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
