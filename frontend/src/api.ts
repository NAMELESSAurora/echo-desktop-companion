import type {
  BackendConfig,
  CreatedTurn,
  MemoryFact,
  MemoryJob,
  MossVoice,
  PipelineEvent,
  Session,
  TurnPayload,
} from './types';

export class ApiError extends Error {
  constructor(public code: string, public status = 0) { super(code); }
}

export async function request<T>(method: string, path: string, body?: unknown, keepalive = false): Promise<T> {
  const response = await fetch(path, {
    method, credentials: 'same-origin', keepalive,
    headers: { 'Content-Type': 'application/json', 'X-Companion-UI': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error?.code ?? data.detail ?? 'request_failed', response.status);
  return data as T;
}

// Handles network boundaries, CRLF, multi-line data and a final unterminated event.
export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<PipelineEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lines: string[] = [];
  let eventSize = 0;
  const consume = (line: string): PipelineEvent | null => {
    if (line === '') {
      if (!lines.length) return null;
      const value = JSON.parse(lines.join('\n')) as PipelineEvent;
      lines = []; eventSize = 0;
      return value;
    }
    if (line.startsWith('data:')) {
      const data = line.slice(5).replace(/^ /, '');
      eventSize += data.length;
      if (eventSize > 2_000_000) throw new ApiError('event_too_large');
      lines.push(data);
    }
    return null;
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let end: number;
      while ((end = buffer.indexOf('\n')) >= 0) {
        const event = consume(buffer.slice(0, end).replace(/\r$/, ''));
        buffer = buffer.slice(end + 1);
        if (event) yield event;
      }
      if (buffer.length > 2_000_000) throw new ApiError('event_too_large');
      if (done) {
        if (buffer) consume(buffer.replace(/\r$/, ''));
        const final = consume('');
        if (final) yield final;
        return;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export interface TurnApi {
  start(sid: string, payload: TurnPayload): Promise<CreatedTurn>;
  cancel(tid: string, keepalive?: boolean): Promise<unknown>;
  events(path: string, signal: AbortSignal): AsyncGenerator<PipelineEvent>;
}

export class BackendApi implements TurnApi {
  async connect(): Promise<BackendConfig> {
    await request('POST', '/ui/connect', {});
    const config = await request<BackendConfig>('GET', '/v1/config');
    if (config.mode !== 'mock') throw new ApiError('test_ui_requires_mock');
    return config;
  }
  session(): Promise<Session> {
    return request('POST', '/v1/sessions', { character_id: 'frontend-test' });
  }
  restoreSession(sid: string): Promise<Session> { return request('GET', `/v1/sessions/${sid}`); }
  start(sid: string, payload: TurnPayload): Promise<CreatedTurn> {
    return request('POST', `/v1/sessions/${sid}/turns`, payload);
  }
  cancel(tid: string, keepalive = false): Promise<unknown> {
    return request('POST', `/v1/turns/${tid}/cancel`, undefined, keepalive);
  }
  policy(sid: string, enabled: boolean, sourceId?: string, keepalive = false) {
    return request<{ enabled: boolean; epoch: number; source_id: string | null }>(
      'PUT', `/v1/sessions/${sid}/screen-policy`, { enabled, source_id: sourceId ?? null }, keepalive,
    );
  }
  organizeMemory(sid: string, messageLimit = 30): Promise<MemoryJob> {
    return request('POST', `/v1/sessions/${sid}/memory/organize`, { message_limit: messageLimit });
  }
  memoryJob(jid: string): Promise<MemoryJob> {
    return request('GET', `/v1/memory/jobs/${jid}`);
  }
  acceptProposal(pid: string): Promise<MemoryFact> {
    return request('POST', `/v1/memory/proposals/${pid}/accept`);
  }
  facts(sid: string): Promise<{ facts: MemoryFact[] }> {
    return request('GET', `/v1/sessions/${sid}/memory`);
  }
  deleteFact(fid: string): Promise<unknown> {
    return request('DELETE', `/v1/memory/facts/${fid}`);
  }
  mossVoices(): Promise<{ mode: string; measured: boolean; voices: MossVoice[] }> {
    return request('GET', '/v1/moss/voices');
  }
  async *events(path: string, signal: AbortSignal): AsyncGenerator<PipelineEvent> {
    const response = await fetch(path, { credentials: 'same-origin', signal });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error?.code ?? 'stream_failed', response.status);
    }
    if (!response.body) throw new ApiError('empty_stream');
    yield* readSSE(response.body);
  }
}

export function explainError(error: unknown): string {
  if (error instanceof DOMException && ['NotSupportedError', 'NotReadableError'].includes(error.name)) {
    return '浏览器未能捕获窗口画面。可在 Chrome／Edge 中重试，或先载入样张。';
  }
  const code = error instanceof ApiError ? error.code : error instanceof Error ? error.message : '';
  const known: Record<string, string> = {
    test_ui_requires_mock: '当前舞台仅在离线演练模式（mock）下建立同源连接，请将后端切回 mock 后重试。',
    invalid_local_token: '本地连接凭证已失效，请点击顶部重连按钮恢复。',
    same_origin_required: '请通过本地服务地址打开本舞台，不要直接从文件系统打开 HTML。',
    screen_permission_mismatch: '视窗授权已变更，请撤回视野后重新择取窗口。',
    screen_frame_stale: '所附画面已逾 15 秒时效，请重新发出以捕获最新一帧。',
    pipeline_busy: '本地管线正处于满载状态，请稍候片刻再试。',
    memory_queue_full: '后台记忆整理队列已满，请等待当前任务收敛后再试。',
    memory_changed: '长期记忆已更新，先前的候选提案已自动失效，请重新整理。',
    proposal_not_found: '该条候选记忆不存在或已清理。',
    memory_not_found: '该条长期记忆已不存在。',
    event_history_lost: '事件回放已超出窗口，本地播放已停止，请重新发话。',
    events_expired: '后端已重启或回收旧轮次事件，请重新发话。',
    session_not_found: '当前会话卷已失效，请点击「新起一卷」。',
    incomplete_stream: '事件流提前断开，本轮已止步，可随时重新发出。',
    audio_locked: '浏览器暂未解锁声景播放，请轻点声景开关后重试。',
    capture_unavailable: '当前浏览器不支持窗口共享，可先点击「载入样张」验证视觉通路。',
    capture_not_ready: '视窗画面尚未就绪，请稍候再发。',
    capture_changed: '视窗来源已切换，请重新发出。',
    image_too_large: '截取画面超过 2 MiB 上限，请择取更小的窗口。',
    moss_not_configured: '后端尚未配置 COMPANION_MOSS_API_KEY，请在 .env 中填入密钥或使用离线演练模式。',
    moss_user_id_required: '跨会话用户记忆（user）模式需要配置 COMPANION_MOSS_USER_ID。',
    moss_auth_failed: 'MOSS-Live 鉴权失败，请检查 COMPANION_MOSS_API_KEY 是否有效。',
    moss_rate_limited: 'MOSS-Live 并发已达上限或触发限流，请稍后再拨通。',
    moss_unavailable: '无法连通 MOSS-Live 上游服务，请检查网络或配置。',
    moss_handshake_failed: 'MOSS-Live 实时握手失败，请稍后重试。',
    live_session_busy: '当前会话卷已有一路进行中的实时语音通话。',
    live_capacity_full: '本地后端已达到 MOSS-Live 最大并发通话数限制。',
    idle_timeout: '通话已连续静默超时，为避免无谓计费已自动挂断。',
    mic_denied: '未获取麦克风权限：离线演练态仍可使用「模拟口述」体验全双工通话链路。',
    live_disconnected: '实时语音通道已断开。',
    Failed: '无法触达本地管线，请确认服务正在运行。',
  };
  return known[code] ?? (code.includes('fetch') ? '与本地管线的连接中断，请检查服务后点击重连。' : '本次操作未能完成，请重试或展开 SSE 脉络查看详情。');
}
