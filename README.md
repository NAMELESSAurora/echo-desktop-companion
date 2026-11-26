# 回声 · ECHO // 光蚀伴生桌面程序

一套可离线独立运行、也可无缝对接云端大模型的桌面伴生应用与双轨后端管线：

- **光蚀伴生前端（Lumen Folio 视觉引擎）**：原生 WebGL2 双通道天幕着色器（5 套天幕：晨间留白／穹顶星云／水彩日蚀／湿染星云／水彩曙弧，等比例针孔投影 + 屏幕原生分辨率解析太阳／星轨 + 4-Tap 双三次滤波）与解析梯度 SDF 液态玻璃合成器；内置透明背景 **七草荠（Nanakusa Nazuna）** 2.5D 交互立绘（呼吸、眼神跟随、轻颔／挥手、声波共振光环），并支持本地导入任意自包含 `.vrm` 3D 形象（最大 64 MB）。
- **双轨并发后端架构**：
  1. **HTTP / SSE 经典轨**：流式文字对话（DeepSeek Flash）、显式授权单帧窗口共观（绝不静默截屏或落盘）、分句 PCM16 语音合成（Qwen AUDIO 3.1 TTS）、以及本地 SQLite 长期事实记忆整理与人工确认。
  2. **双引擎全双工实时语音轨**（`WS /v1/sessions/{sid}/live`）：默认接入 **阿里云百炼 Qwen 3.1 Realtime Flash**（`qwen-audio-3.1-realtime-flash`，支持免费声音克隆、内置 Fun-ASR 识别、情感语调与 `server_vad` 打断，并内置 **160 ms 预缓冲 + 1.2 s 拖尾的本地 RMS 静默门控**，安静待机不发音频包、近乎零待机费用）；同时保留 **MOSS-Live-1.0** 可选切换。统一支持 16 kHz PCM16 上行、24 kHz PCM16 下行、音色热切、自动注入 SQLite 长期事实及静默自动挂断。
- **Windows 独立便携 EXE**：单文件 `EchoCompanion.exe`，双击自动启动本机 loopback 服务，以独立 Edge/Chrome 应用窗口（无黑框，完整支持 WebGL2、麦克风与窗口共享）打开，并常驻 Windows 系统托盘管理启停与配置目录。

---

## 快速体验（Windows 独立 EXE）

1. 前往本仓库 [Releases](https://github.com/NAMELESSAurora/echo-desktop-companion/releases) 下载 `EchoCompanion.exe`。
2. 双击直接运行（默认处于 `mock` 离线演练模式，无需任何密钥或 Python/Node 环境即可体验完整 UI、对话、单帧看屏、记忆整理、以及全双工语音通话协议模拟）。
3. 右下角系统托盘图标支持：
   - **打开独立伴生窗口** / **在默认浏览器中打开**
   - **复制本地访问令牌 (Live 模式)**（启用 `live` 模式后，在页面解锁条粘贴即可安全登录）
   - **打开配置与数据目录**（默认 `%LOCALAPPDATA%\EchoCompanion`，内置 `.env.example`、`companion.sqlite3` 与 `echo-companion.log`；也可将 `.env` 放在 `EchoCompanion.exe` 同目录作为便携覆盖配置）
   - **查看 API 接口文档 (`/docs`)**
   - **退出回声**（优雅关闭本地服务与 SQLite WAL）

> 命令行参数（适合脚本或无界面运行）：`EchoCompanion.exe --port 8765 --headless --no-tray` / `--version`。

---

## 本地开发与自行打包 EXE

环境要求：Python 3.12 / 3.13、`uv`、Node.js 20+。

```powershell
# 1. 构建并测试前端（输出自动写入 src/companion/web/）
cd frontend
npm ci
npm run build
npm test

# 2. 安装 Python 依赖并启动本地服务（离线演练模式）
cd ..
uv sync --frozen --group dev --group desktop
uv run --frozen python -m uvicorn companion.api:create_app --factory --host 127.0.0.1 --port 8765

# 3. 代码检查与测试
uv run --frozen ruff check src tests scripts
uv run --frozen ruff format --check src tests scripts
uv run --frozen pytest -q

# 4. 打包并自动冒烟校验单文件 dist/EchoCompanion.exe
uv run --frozen --group desktop python scripts/build_exe.py
```

---

## 接入真实云端模型（DeepSeek / Qwen 3.1 Realtime Flash / MOSS-Live）

复制 `.env.example` 为 `.env`（开发态放项目根目录；EXE 独立运行可放 `EchoCompanion.exe` 同目录或 `%LOCALAPPDATA%\EchoCompanion\.env`），填入对应密钥并将 `COMPANION_MODE` 切换为 `live` 后重启：

```dotenv
COMPANION_MODE=live

# 对话 / 看屏 / 记忆整理（DeepSeek）
COMPANION_DEEPSEEK_API_KEY=your_deepseek_key
COMPANION_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
COMPANION_DIALOGUE_MODEL=deepseek-flash
COMPANION_VISION_MODEL=deepseek-flash
COMPANION_MEMORY_MODEL=deepseek-flash

# 阿里云百炼 Qwen 3.1（实时语音与单轨 TTS 共用同一把 API Key）
COMPANION_QWEN_API_KEY=your_dashscope_key
COMPANION_QWEN_TTS_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer
COMPANION_QWEN_TTS_MODEL=qwen-audio-3.1-tts-flash
COMPANION_QWEN_VOICE=longanhuan_v3.1

# 全双工实时语音引擎（默认 qwen，可选 moss）
COMPANION_LIVE_PROVIDER=qwen
COMPANION_QWEN_REALTIME_URL=wss://dashscope.aliyuncs.com/api-ws/v1/realtime
COMPANION_QWEN_REALTIME_MODEL=qwen-audio-3.1-realtime-flash
# 可填内置音色或通过 DashScope 声音复刻注册的自定义 voice_id（见 scripts/enroll_qwen_nazuna.py）
COMPANION_QWEN_REALTIME_VOICE=Cherry
COMPANION_QWEN_REALTIME_LANGUAGE=zh
# 本地 RMS 静默门控阈值（默认 0.014；静默期间不上行音频包，待机成本近乎 ¥0）
COMPANION_QWEN_SILENCE_GATE_RMS=0.014
COMPANION_MOSS_IDLE_TIMEOUT_S=180
COMPANION_MOSS_MAX_CONNECTIONS=1

# 如需切换至 MOSS-Live-1.0，将 COMPANION_LIVE_PROVIDER=moss 并配置：
# COMPANION_MOSS_API_KEY=your_moss_api_key
# COMPANION_MOSS_MODEL=moss-live-1.0
# COMPANION_MOSS_VOICE=
# COMPANION_MOSS_MEMORY_SCOPE=session
```

### 安全与计费边界说明
- 所有模型密钥严格保存在本机后端进程，永不暴露给浏览器或前端包；`/v1/config` 仅返回就绪布尔值。
- `live` 模式出于安全边界默认禁用 `/ui/connect` 同源免密 Cookie 登录；在前端页面顶部解锁条粘贴本机令牌（可右键系统托盘「复制本地访问令牌」获取，仅暂存于 `sessionStorage`）即可发起 Bearer 请求，并由 `POST /v1/live/ticket` 自动换取 30 秒一次性 WebSocket 票据建立实时语音连接。
- **计费防护**：应用永不自动拨通实时语音。使用 **Qwen 3.1 Realtime Flash** 时，后端在客户端 16 kHz 上行链路上启用 160 ms 预缓冲 + 1.2 s 拖尾 RMS 静默门控，安静待机时不向上游发送音频帧；同时所有引擎均保留默认 180 秒静默自动挂断。若切回 **MOSS-Live-1.0**，上游从 `session_attached` 起按分钟计费（静默期同样计费）。
- **验证说明**：仓库 CI / 单元测试默认在离线 `mock` 协议模拟下执行；`qwen-audio-3.1-realtime-flash` 的声音复刻与实时 WebSocket 握手已通过实网验证。

---

## 文档索引
- HTTP / SSE / MOSS-Live WebSocket 完整接口契约：[docs/API.md](docs/API.md)
- 管线架构与并发边界：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 虚拟形象与 VRM 驱动说明：[docs/AVATAR.md](docs/AVATAR.md)
- 前端测试台说明：[docs/FRONTEND.md](docs/FRONTEND.md)
