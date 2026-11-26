# HTTP 与事件契约

版本：v1。服务默认 `http://127.0.0.1:8765`，监听 loopback，单进程。脚本和宿主的 `/v1` 请求用 Bearer 本地令牌；`.local/api-token` 为默认令牌位置。HTTP 请求 JSON 不超过 3,000,000 字节，单张图片解码后不超过 2 MiB。

内置测试台在 mock 模式可用同源 cookie 访问 `/v1`。`POST /ui/connect` 要求 Origin 与服务地址一致、Sec-Fetch-Site=same-origin、X-Companion-UI=1；成功设置 HttpOnly、SameSite=Strict 的进程级临时 cookie，不返回 Bearer 令牌。live 模式始终拒绝该入口，也不接受 mock cookie 授权。

## 路由

| 方法 | 地址 | 作用 |
| --- | --- | --- |
| GET | `/health` | 模式与服务存活状态 |
| GET | `/v1/config` | 模型映射、音频格式、配置就绪标志 |
| POST | `/v1/sessions` | 创建会话，返回 id |
| GET | `/v1/sessions/{sid}` | 查看会话和视觉权限版本 |
| PUT | `/v1/sessions/{sid}/screen-policy` | 设置显式窗口授权，返回 epoch |
| POST | `/v1/sessions/{sid}/turns` | 创建异步轮次，返回 turn_id 与 events_url |
| GET | `/v1/turns/{tid}/events` | SSE 事件，支持 Last-Event-ID 或 after |
| GET | `/v1/turns/{tid}` | 持久化状态、文字结果、时间指标 |
| POST | `/v1/turns/{tid}/cancel` | 幂等取消，等待旧任务收敛 |
| POST | `/v1/sessions/{sid}/memory/organize` | 创建独立的记忆整理任务 |
| GET | `/v1/memory/jobs/{jid}` | 查看任务和 proposals |
| POST | `/v1/memory/proposals/{pid}/accept` | 确认事实 |
| GET | `/v1/sessions/{sid}/memory` | 查看同角色已确认事实 |
| PATCH | `/v1/memory/facts/{fid}` | 修改事实，失效旧上下文 |
| DELETE | `/v1/memory/facts/{fid}` | 删除事实，失效旧上下文 |
| GET | `/v1/moss/voices` | 列出当前实时语音引擎可用音色（Qwen 返回内置＋已配置的克隆音色；MOSS 代理 `GET /v1/audio/voices`） |
| POST | `/v1/moss/voices/clone` | 上传 ≤10 MB `wav/mp3/m4a/flac` 参考音频克隆音色（MOSS 代理 `POST /v1/audio/voices`） |
| POST | `/v1/live/ticket` | 为指定 `?sid=` 签发 30 秒一次性 WebSocket 握手票据（供浏览器 `live` 模式配合 Bearer 使用，避免在 URL 暴露长期令牌） |
| WS | `/v1/sessions/{sid}/live` | 全双工实时语音通道（默认 Qwen 3.1 Realtime Flash，可选 MOSS-Live-1.0；可选 `?voice=&lang=zh|ja|en&tz=&ticket=`，支持通话中 `change_language` 语言热切与 `interrupt` 手动打断） |

## 创建文字轮次

`POST /v1/sessions` 可发送 `{}`，或指定 character_id 与 system_prompt。

```json
{
  "request_id": "client-generated-unique-id",
  "text": "你好，今天我们先整理计划。",
  "speak": true,
  "supersede": true
}
```

同会话重复 request_id 和相同请求只返回原 turn_id，不重复调用模型；内容不同返回 409 request_id_conflict。supersede=false 时，同会话存在活动轮次会返回 409 session_busy。

轮次状态：queued → running → completed／failed／cancelled。服务重启会把未结束轮次标记 interrupted。completed 代表生成完成，不代表客户端已经播完音频；TTS 失败时也可 completed，但 audio_status=failed。

## 看屏

先发送 `{"enabled":true,"source_id":"window-42"}` 到 screen-policy，读取返回 epoch。随后给轮次附加：

```json
{
  "screen": {
    "source_id": "window-42",
    "policy_epoch": 1,
    "captured_at": "2026-10-25T10:00:00+09:00",
    "mime_type": "image/png",
    "image_base64": "调用方刚采集的图片字节编码"
  }
}
```

示例时间与 epoch 仅表示格式，实际必须使用新截图与当前权限版本。source_id 是客户端选择的窗口标识；后端只能检查来源声明和 epoch，不能验证图片究竟来自哪个窗口，采集端须履行选择范围。校验 Base64、大小与格式头，图像内容解码由模型处理。

撤回权限使用 `{"enabled":false}`。权限变化的 HTTP 响应返回之前，旧图像任务已取消；已经发送给模型的图片无法撤回。前端仍应停采集并丢弃待上传帧。

## SSE 事件

宿主使用 fetch 并设置 Authorization 头读取流；内置模拟测试台使用 same-origin cookie。每个事件都有：schema_version、id、type、session_id、turn_id、timestamp、data。id 仅在单轮内递增。

| 事件 | data 主要字段 | 客户端动作 |
| --- | --- | --- |
| turn.started | mode、role、audio_format、sample_rate、channels、mock_audio | 设定本轮播放器格式 |
| text.delta | text | 追加显示正文 |
| speech.segment | segment、text | 可选显示正在合成的句子 |
| audio.chunk | segment、chunk、audio_base64 | Base64 解码后按事件顺序入 PCM16 队列 |
| audio.segment_done | segment | 一句音频生成完毕，不代表已播放完毕 |
| usage | role、model、values、measured | 记录供应商返回的计量；模拟模式 measured=false |
| warning | role、code | 显示可降级问题 |
| audio.clear | reason | 立即停播并清除该 turn_id 的所有音频 |
| turn.completed | first_text_ms、first_audio_ms、duration_ms、audio_status | 生成结束，可保留文字 |
| turn.cancelled／turn.failed | reason 及可用时间指标 | 停播清队列，结束本轮 |

客户端必须按 turn_id 区分音频。新轮次成为活动轮次后，丢弃旧轮次迟到的音频；不能仅依赖取消 HTTP 响应。重连时发送最后消费的事件 id，避免重复播放；事件过期时清播放器、查轮次状态，不能盲目从头再播。

连接中断本身不取消服务器轮次；前端放弃对话时显式 POST cancel。总轮次默认 90 秒超时，包含排队。已经进入最后提交阶段的轮次即使同时收到取消，也会保持 completed：数据库和终态事件必须一致。

回放队列在内存中有大小和轮次数上限，截图与图像回复的事件会在该有界缓存内短暂存在，但不持久化。图像 Base64 从来不进入事件。慢消费者落后时收到 stream.reset_required，包含 code=event_history_lost，不再继续该连接。

## 记忆

organize 请求体为 `{}` 或 `{"message_limit":30}`。返回 queued 任务，查询到 completed 后取得 proposals。source_message_ids 只引用完成的、允许进入上下文的纯文字用户消息；视觉轮次不会成为来源。

任务可进入 failed、stale、cancelled 或 interrupted。failed 不阻塞后续任务；不存在无界自动重试。整理时用户修改／删除事实会提高 epoch，旧任务结果进入 stale，不能再被确认。

accepted 的事实进入同 character_id 的后续会话。修改和删除保守地失效该角色全部旧模型上下文，原始聊天记录仍可从轮次结果查阅。此行为不是完整个人数据擦除，也没有语义级查重或所有同义事实联动删除。

## 实时语音轨（双引擎：Qwen 3.1 Realtime Flash / MOSS-Live-1.0）

`WS /v1/sessions/{sid}/live` 与现有 HTTP/SSE 文本＋单帧看屏＋SQLite 记忆管线并行共存，不替换原有接口，通过 `COMPANION_LIVE_PROVIDER=qwen|moss`（默认 `qwen`）统一适配：

- **显式拨通，绝不自动连接**：仅在客户端主动建立 WebSocket 时连上游。
- **鉴权与安全边界**：握手严格校验 `Origin`（防跨站 WebSocket 劫持），凭证支持 `Authorization: Bearer`、一次性 `?ticket=`（由 `POST /v1/live/ticket?sid=...` 在 30 秒内单次消费），以及 `mock` 模式下的同源 `companion_mock_ui` Cookie；所有云端 API Key 仅保存在后端。
- **Qwen 3.1 Realtime Flash 模式（默认）**：后端连接 `wss://dashscope.aliyuncs.com/api-ws/v1/realtime`，自动下发 `session.update`（注入 `system_prompt` 与角色 SQLite 长期事实、自定义/内置音色、`fun-asr` 语音识别、`server_vad` 与情感语调），并将 DashScope 事件翻译为统一的前端协议帧；上行 16 kHz PCM16 经 **160 ms 预缓冲 + 1.2 s 拖尾本地 RMS 静默门控**（`COMPANION_QWEN_SILENCE_GATE_RMS`，默认 `0.014`），静默期间不上行音频包，大幅降低待机费用。
- **MOSS-Live-1.0 模式（可选）**：按官方顺序执行 `attach_session` → 可选 `change_voice` → `session.update` → `media.configure`（`playback: "client"`、`output_audio: pcm16@24kHz`）→ 可选 `client_context.update(time_zone)` → 向客户端发送 `live.ready`。
- **上行与下行音频**：客户端以二进制帧发送 16 kHz 单声道 PCM S16LE；服务端在每个下行二进制 PCM 帧前发送 `response.audio.context(run_id, turn_id, chunk_id, duration_ms)`，客户端播完每块回复 `playback.chunk.completed`，收到 `response.audio.done` 且播完最后一块回复 `playback.completed`，收到 `response.audio.stop` 立即停播并先确认已播完片段再回复 `playback.stopped(played_audio_ms)`。
- **字幕语义与记忆回流**：`input/output.transcript.updated|done|revised` 为完整文本覆盖语义（非增量追加）；每次正常结束（`response.ended(status="completed")`）的语音轮次会自动写入本地 SQLite `turns` / `messages`，可直接复用 `/v1/sessions/{sid}/memory/organize` 提取长期事实。
- **费用与并发保护**：同会话仅允许一路通话（`4409 live_session_busy`），全局默认上限 1 路（最高 3 路，`4429 live_capacity_full`），连续静默达 `COMPANION_MOSS_IDLE_TIMEOUT_S`（默认 180 秒，纯静默音频帧和 `ping` 均不续期）时发送 `live.idle_timeout` 并以关闭码 `4000` 自动挂断。

## 错误

常见状态：401 本地令牌错误；403 Origin 不允许；409 请求冲突／过期权限／失效记忆；410 事件不再保留；413 请求体过大；422 输入或事件游标错误；429 管线或后台任务满；503 live 服务凭据不完整。

Provider 错误以事件／任务 error_code 返回：provider_auth、provider_rate_limit、provider_timeout、provider_unavailable、invalid_provider_response、incomplete_stream、invalid_audio_response 等。响应不携带原始上游错误正文。

局域网、互联网暴露、多用户授权、跨源浏览器接入与多 worker 部署均不属于当前支持范围。
