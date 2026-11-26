"""Build and smoke-test the standalone Windows EchoCompanion.exe."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
DIST_EXE = ROOT / "dist" / "EchoCompanion.exe"


def run(cmd: list[str], cwd: Path = ROOT) -> None:
    print(f"+ {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, check=True)


def smoke_test_exe(exe_path: Path, port: int = 18765) -> None:
    if not exe_path.exists():
        raise FileNotFoundError(f"EXE not found: {exe_path}")

    # Test 1: --version CLI flag (note: console=False won't attach stdout on Windows, check exit 0)
    res = subprocess.run([str(exe_path), "--version"], check=False, timeout=20)
    if res.returncode != 0:
        raise RuntimeError(f"EchoCompanion.exe --version exited with {res.returncode}")

    # Test 2: Headless server startup, HTML/assets serving, /ui/connect, /v1/moss/voices
    smoke_data = ROOT / ".local" / "exe-smoke-data"
    smoke_data.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["COMPANION_MODE"] = "mock"
    env["COMPANION_DATA_DIR"] = str(smoke_data)

    proc = subprocess.Popen(
        [str(exe_path), "--headless", "--no-tray", "--port", str(port)],
        env=env,
    )
    base = f"http://127.0.0.1:{port}"
    try:
        deadline = time.monotonic() + 25.0
        healthy = False
        while time.monotonic() < deadline:
            if proc.poll() is not None:
                raise RuntimeError(f"EXE exited early with code {proc.returncode}")
            try:
                with urllib.request.urlopen(f"{base}/health", timeout=1.0) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    if resp.status == 200 and body.get("status") == "ok":
                        healthy = True
                        break
            except Exception:
                time.sleep(0.2)
        if not healthy:
            raise RuntimeError("EXE did not become healthy within 25s")

        # Verify built frontend HTML and Live2D WASM/rig assets are bundled and served cleanly
        with urllib.request.urlopen(f"{base}/", timeout=5.0) as resp:
            html = resp.read().decode("utf-8")
            assert resp.status == 200
            assert "回声 · ECHO" in html
            assert 'id="live-toggle-btn"' in html
            assert 'id="avatar-live2d-canvas"' in html

        with urllib.request.urlopen(f"{base}/ui/assets/live2d/p2l_runtime.wasm", timeout=5.0) as r:
            wasm_head = r.read(4)
            assert r.status == 200 and wasm_head == b"\x00asm"

        with urllib.request.urlopen(f"{base}/ui/assets/live2d/nazuna.p2lrt", timeout=5.0) as r:
            rig_bytes = r.read()
            assert r.status == 200 and len(rig_bytes) > 100_000

        # Verify mock UI cookie bootstrap + MOSS voices endpoint work inside frozen EXE
        req = urllib.request.Request(
            f"{base}/ui/connect",
            data=b"{}",
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Origin": base,
                "Sec-Fetch-Site": "same-origin",
                "X-Companion-UI": "1",
            },
        )
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            cookie = resp.headers.get("Set-Cookie", "").split(";")[0]
            assert resp.status == 200 and "companion_mock_ui=" in cookie

        voices_req = urllib.request.Request(
            f"{base}/v1/moss/voices",
            headers={"Cookie": cookie},
        )
        with urllib.request.urlopen(voices_req, timeout=5.0) as resp:
            vdata = json.loads(resp.read().decode("utf-8"))
            assert resp.status == 200 and len(vdata.get("voices", [])) >= 2

        print(
            f"OK: {exe_path.name} smoke-tested on {base} ({exe_path.stat().st_size / 1e6:.2f} MB)"
        )
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=8)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=5)

    # Test 3: Live-mode startup check (verifies certifi CA bundle & httpx SSL context in EXE)
    live_smoke_data = ROOT / ".local" / "exe-smoke-live"
    live_smoke_data.mkdir(parents=True, exist_ok=True)
    live_env = os.environ.copy()
    live_env["COMPANION_MODE"] = "live"
    live_env["COMPANION_DATA_DIR"] = str(live_smoke_data)
    live_port = port + 1
    live_base = f"http://127.0.0.1:{live_port}"
    live_proc = subprocess.Popen(
        [str(exe_path), "--headless", "--no-tray", "--port", str(live_port)],
        env=live_env,
    )
    try:
        deadline = time.monotonic() + 20.0
        live_ok = False
        while time.monotonic() < deadline:
            if live_proc.poll() is not None:
                raise RuntimeError(f"Live-mode EXE exited early with code {live_proc.returncode}")
            try:
                with urllib.request.urlopen(f"{live_base}/health", timeout=1.0) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    if resp.status == 200 and body.get("mode") == "live":
                        live_ok = True
                        break
            except Exception:
                time.sleep(0.2)
        if not live_ok:
            raise RuntimeError("Live-mode EXE did not become healthy within 20s")
        print(f"OK: {exe_path.name} live-mode TLS/httpx boot verified on {live_base}")
    finally:
        live_proc.terminate()
        try:
            live_proc.wait(timeout=8)
        except subprocess.TimeoutExpired:
            live_proc.kill()
            live_proc.wait(timeout=5)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build EchoCompanion.exe")
    parser.add_argument("--skip-frontend", action="store_true")
    parser.add_argument("--skip-smoke", action="store_true")
    args = parser.parse_args()

    if not args.skip_frontend:
        npm = "npm.cmd" if os.name == "nt" else "npm"
        run([npm, "run", "build"], cwd=FRONTEND)

    run([sys.executable, str(ROOT / "scripts" / "make_icon.py")])
    run(
        [
            sys.executable,
            "-m",
            "PyInstaller",
            "--clean",
            "--noconfirm",
            str(ROOT / "echo-companion.spec"),
        ]
    )

    if not args.skip_smoke:
        smoke_test_exe(DIST_EXE)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
