"""Standalone Windows desktop launcher for 回声 · ECHO.

Starts the embedded FastAPI/Uvicorn server on loopback, waits for /health,
launches an isolated Edge/Chrome standalone app window (--app=...) with full
WebGL2, microphone, and getDisplayMedia support, and manages lifecycle via a
Windows system tray icon.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from dataclasses import dataclass
from pathlib import Path

import uvicorn

from companion.api import create_app
from companion.config import Settings

APP_NAME = "EchoCompanion"
APP_TITLE = "回声 · ECHO"
APP_VERSION = "0.5.0"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765


@dataclass(frozen=True)
class RuntimePaths:
    data_dir: Path
    env_file: Path | None
    log_file: Path
    profile_dir: Path
    icon_path: Path | None


def is_frozen() -> bool:
    return bool(getattr(sys, "frozen", False))


def bundle_root() -> Path:
    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        return Path(meipass)
    return Path(__file__).resolve().parents[2]


def exe_dir() -> Path:
    if is_frozen():
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parents[2]


def resolve_runtime_paths(env: dict[str, str] | None = None) -> RuntimePaths:
    environ = env if env is not None else os.environ
    explicit_dir = environ.get("COMPANION_DATA_DIR", "").strip()
    if explicit_dir:
        data_dir = Path(explicit_dir).expanduser().resolve()
    elif is_frozen():
        local_app = environ.get("LOCALAPPDATA", "").strip()
        if local_app:
            data_dir = Path(local_app) / APP_NAME
        else:
            data_dir = Path.home() / f".{APP_NAME.lower()}"
    else:
        data_dir = (Path.cwd() / ".local").resolve()

    data_dir.mkdir(parents=True, exist_ok=True)

    # Copy bundled .env.example into data_dir once so desktop users can configure keys easily
    bundled_example = bundle_root() / ".env.example"
    target_example = data_dir / ".env.example"
    if bundled_example.exists() and not target_example.exists():
        try:
            shutil.copy2(bundled_example, target_example)
        except OSError:
            pass

    # Priority order for .env: next to EXE -> user data_dir -> current working directory
    env_candidates = [exe_dir() / ".env", data_dir / ".env", Path.cwd() / ".env"]
    env_file = next((p for p in env_candidates if p.exists()), None)

    icon_candidates = [
        bundle_root() / "companion" / "assets" / "echo-companion.ico",
        Path(__file__).resolve().parent / "assets" / "echo-companion.ico",
    ]
    icon_path = next((p for p in icon_candidates if p.exists()), None)

    return RuntimePaths(
        data_dir=data_dir,
        env_file=env_file,
        log_file=data_dir / "echo-companion.log",
        profile_dir=data_dir / "browser-profile",
        icon_path=icon_path,
    )


def redirect_stdio_when_windowless(log_file: Path) -> None:
    """Prevent Uvicorn/logging crashes when PyInstaller runs with console=False."""
    if sys.stdout is not None and sys.stderr is not None:
        return
    try:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        stream = log_file.open("a", encoding="utf-8", buffering=1)
        if sys.stdout is None:
            sys.stdout = stream
        if sys.stderr is None:
            sys.stderr = stream
    except OSError:
        pass


def check_companion_health(host: str, port: int, timeout: float = 0.6) -> bool:
    url = f"http://{host}:{port}/health"
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with opener.open(url, timeout=timeout) as resp:
            if resp.status != 200:
                return False
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("status") == "ok" and "mode" in data
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        return False


def _port_is_free(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False


def pick_port(host: str, preferred: int) -> tuple[int, bool]:
    """Return (port, already_running_our_instance)."""
    if check_companion_health(host, preferred):
        return preferred, True
    if _port_is_free(host, preferred):
        return preferred, False
    for candidate in range(preferred + 1, preferred + 50):
        if _port_is_free(host, candidate):
            return candidate, False
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((host, 0))
        return int(sock.getsockname()[1]), False


def wait_until_healthy(host: str, port: int, timeout_s: float = 15.0) -> bool:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        if check_companion_health(host, port, timeout=0.5):
            return True
        time.sleep(0.12)
    return False


def find_app_browser() -> Path | None:
    """Locate Microsoft Edge or Google Chrome for native standalone --app window mode."""
    pf86 = Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"))
    pf = Path(os.environ.get("PROGRAMFILES", r"C:\Program Files"))
    local = Path(os.environ.get("LOCALAPPDATA", ""))

    candidates = [
        pf86 / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        pf / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        pf / "Google" / "Chrome" / "Application" / "chrome.exe",
        pf86 / "Google" / "Chrome" / "Application" / "chrome.exe",
        local / "Google" / "Chrome" / "Application" / "chrome.exe",
    ]
    for path in candidates:
        if path.exists():
            return path
    for name in ("msedge", "chrome", "chromium"):
        found = shutil.which(name)
        if found:
            return Path(found)
    return None


def launch_app_window(url: str, profile_dir: Path) -> subprocess.Popen | None:
    """Open URL in an isolated Edge/Chrome standalone desktop app window."""
    browser = find_app_browser()
    if browser is None:
        webbrowser.open(url)
        return None
    profile_dir.mkdir(parents=True, exist_ok=True)
    args = [
        str(browser),
        f"--app={url}",
        "--new-window",
        "--window-size=1440,900",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-background-mode",
    ]
    popen_kwargs: dict = {}
    if os.name == "nt":
        # Never pass CREATE_NO_WINDOW to GUI browsers: Edge/Chrome can inherit a hidden
        # window state and stay invisible with MainWindowHandle=0. Force SW_SHOWNORMAL.
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        si.wShowWindow = 1  # SW_SHOWNORMAL
        popen_kwargs["startupinfo"] = si
        popen_kwargs["creationflags"] = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    try:
        return subprocess.Popen(args, **popen_kwargs)
    except OSError:
        webbrowser.open(url)
        return None


def open_folder(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    startfile = getattr(os, "startfile", None)
    if startfile is not None:
        startfile(str(path))
    else:
        webbrowser.open(path.as_uri())


def _load_tray_image(icon_path: Path | None):
    from PIL import Image, ImageDraw

    if icon_path and icon_path.exists():
        try:
            return Image.open(icon_path).convert("RGBA")
        except Exception:
            pass
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((4, 4, 60, 60), radius=16, fill=(18, 17, 28, 255))
    draw.ellipse((20, 20, 44, 44), fill=(232, 59, 30, 255))
    return img


def _run_with_tray(
    server: uvicorn.Server,
    server_thread: threading.Thread,
    url: str,
    mode: str,
    paths: RuntimePaths,
) -> None:
    import pystray

    mode_label = "离线演练" if mode == "mock" else "实时接口"

    def on_open_app(icon, _item):
        launch_app_window(url, paths.profile_dir)

    def on_open_browser(icon, _item):
        webbrowser.open(url)

    def on_open_data(icon, _item):
        open_folder(paths.data_dir)

    def on_open_docs(icon, _item):
        webbrowser.open(f"{url}/docs")

    def on_copy_token(icon, _item):
        token_path = paths.data_dir / "api-token"
        if token_path.exists():
            tok = token_path.read_text(encoding="utf-8").strip()
            if tok:
                try:
                    subprocess.run(
                        ["clip"],
                        input=tok.encode("utf-8"),
                        check=False,
                        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                    )
                except OSError:
                    pass

    def on_quit(icon, _item):
        server.should_exit = True
        icon.stop()

    menu = pystray.Menu(
        pystray.MenuItem(f"{APP_TITLE} ({mode_label})", None, enabled=False),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("打开独立伴生窗口", on_open_app, default=True),
        pystray.MenuItem("在默认浏览器中打开", on_open_browser),
        pystray.MenuItem("打开配置与数据目录", on_open_data),
        pystray.MenuItem("复制本地访问令牌 (Live 模式)", on_copy_token),
        pystray.MenuItem("查看 API 接口文档", on_open_docs),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("退出回声", on_quit),
    )

    tray = pystray.Icon(
        APP_NAME,
        _load_tray_image(paths.icon_path),
        f"{APP_TITLE} — {url}",
        menu,
    )
    tray.run()
    server.should_exit = True
    server_thread.join(timeout=6.0)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog=APP_NAME,
        description="回声 · ECHO 独立桌面伴生程序",
    )
    parser.add_argument("--host", default=DEFAULT_HOST, help="监听地址（默认 127.0.0.1）")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="首选端口（默认 8765）")
    parser.add_argument("--headless", action="store_true", help="仅启动本地服务，不自动弹窗")
    parser.add_argument("--no-tray", action="store_true", help="禁用系统托盘，前台运行服务")
    parser.add_argument("--version", action="store_true", help="打印版本号后退出")
    return parser.parse_args(argv)


def _configure_frozen_tls() -> None:
    """Ensure httpx and websockets find certifi's bundled CA roots inside PyInstaller EXEs."""
    if not is_frozen():
        return
    try:
        import certifi

        ca_path = Path(certifi.where())
        if ca_path.exists():
            os.environ.setdefault("SSL_CERT_FILE", str(ca_path))
            os.environ.setdefault("REQUESTS_CA_BUNDLE", str(ca_path))
    except Exception:
        pass


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.version:
        print(f"{APP_NAME} {APP_VERSION}")
        return 0

    _configure_frozen_tls()
    paths = resolve_runtime_paths()
    redirect_stdio_when_windowless(paths.log_file)

    port, already_running = pick_port(args.host, args.port)
    url = f"http://{args.host}:{port}/"

    if already_running:
        if not args.headless:
            launch_app_window(url, paths.profile_dir)
        return 0

    settings = Settings(
        _env_file=str(paths.env_file) if paths.env_file else None,
        data_dir=paths.data_dir,
    )
    app = create_app(settings)
    config = uvicorn.Config(
        app,
        host=args.host,
        port=port,
        log_config=None,
        access_log=False,
        lifespan="on",
    )
    server = uvicorn.Server(config)

    if args.no_tray:
        if not args.headless:
            threading.Thread(
                target=lambda: (
                    wait_until_healthy(args.host, port)
                    and launch_app_window(url, paths.profile_dir)
                ),
                daemon=True,
            ).start()
        server.run()
        return 0

    server_thread = threading.Thread(target=server.run, name="echo-uvicorn", daemon=True)
    server_thread.start()

    if not wait_until_healthy(args.host, port, timeout_s=15.0):
        server.should_exit = True
        server_thread.join(timeout=3.0)
        return 1

    if not args.headless:
        launch_app_window(url, paths.profile_dir)

    try:
        _run_with_tray(server, server_thread, url, settings.mode, paths)
    except Exception:
        # Fallback if system tray is unavailable in headless/CI session
        try:
            while server_thread.is_alive():
                server_thread.join(timeout=0.5)
        except KeyboardInterrupt:
            server.should_exit = True
            server_thread.join(timeout=5.0)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
