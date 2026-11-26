import { describe, expect, it, vi } from 'vitest';
import { PcmPlayer } from '../src/audio';
import {
  MossLiveClient,
  downsampleTo16kPcm16,
  pcm16Rms,
  type LiveSocketLike,
  type LiveTranscriptUpdate,
} from '../src/moss-live';

function createFakeAudioContext() {
  const nodes: {
    stop: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
    buffer?: { duration: number };
  }[] = [];
  const ctx = {
    state: 'running',
    currentTime: 10,
    destination: {},
    resume: vi.fn(async () => {}),
    createGain: () => ({ gain: { value: 0 }, connect: vi.fn() }),
    createAnalyser: () => ({ fftSize: 0, connect: vi.fn() }),
    createBuffer: (_: number, size: number, rate: number) => ({
      duration: size / rate,
      getChannelData: () => new Float32Array(size),
    }),
    createBufferSource: () => {
      const node = {
        connect: vi.fn(),
        disconnect: vi.fn(),
        stop: vi.fn(),
        start: vi.fn(),
        onended: null as (() => void) | null,
        buffer: undefined,
      };
      nodes.push(node);
      return node;
    },
  };
  return { ctx: ctx as unknown as AudioContext, nodes };
}

class FakeWebSocket implements LiveSocketLike {
  binaryType: BinaryType = 'arraybuffer';
  readyState = 1;
  onopen: ((ev: Event) => unknown) | null = null;
  onmessage: ((ev: MessageEvent) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;
  onclose: ((ev: CloseEvent) => unknown) | null = null;
  sent: (string | ArrayBufferLike)[] = [];
  closedWith: { code?: number; reason?: string } | null = null;

  constructor(public url: string) {}

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (typeof data === 'string') this.sent.push(data);
    else if (data instanceof ArrayBuffer) this.sent.push(data);
  }

  close(code?: number, reason?: string): void {
    this.readyState = 3;
    this.closedWith = { code, reason };
  }

  emitJson(action: string, data: Record<string, unknown> = {}) {
    this.onmessage?.({ data: JSON.stringify({ action, data }) } as MessageEvent);
  }

  emitBytes(buf: ArrayBuffer) {
    this.onmessage?.({ data: buf } as MessageEvent);
  }

  sentJson(): Record<string, unknown>[] {
    return this.sent.filter((x): x is string => typeof x === 'string').map(s => JSON.parse(s));
  }
}

describe('downsampleTo16kPcm16 & pcm16Rms', () => {
  it('resamples 48 kHz mono float to 16 kHz PCM16 at exact 3:1 ratio', () => {
    const input = new Float32Array(480);
    for (let i = 0; i < input.length; i++) input[i] = Math.sin((2 * Math.PI * 400 * i) / 48000) * 0.5;
    const out = downsampleTo16kPcm16(input, 48000);
    expect(out.length).toBe(160);
    expect(pcm16Rms(out)).toBeGreaterThan(0.25);
    expect(pcm16Rms(out)).toBeLessThan(0.45);
  });

  it('preserves silence and clamps out-of-range samples safely', () => {
    const silence = downsampleTo16kPcm16(new Float32Array(320), 16000);
    expect(pcm16Rms(silence)).toBe(0);
    const hot = downsampleTo16kPcm16(new Float32Array([2.5, -2.5]), 16000);
    expect([...hot]).toEqual([32767, -32768]);
  });
});

describe('MossLiveClient protocol state machine', () => {
  it('completes full playback chunk acks and full-text transcript overwrite', async () => {
    const audio = createFakeAudioContext();
    const player = new PcmPlayer(vi.fn(), () => audio.ctx);
    let socket!: FakeWebSocket;
    const transcripts: LiveTranscriptUpdate[] = [];
    const onState = vi.fn();
    const onAssistantEnd = vi.fn();

    const client = new MossLiveClient(
      player,
      {
        onState,
        onTranscript: u => transcripts.push(u),
        onUserSpeech: vi.fn(),
        onAssistantStart: vi.fn(),
        onAssistantInterrupt: vi.fn(),
        onAssistantEnd,
      },
      {
        micEnabled: false,
        socketFactory: url => {
          socket = new FakeWebSocket(url);
          return socket;
        },
      },
    );

    await client.connect('sess-123', 'voice-abc', 'tk-once', 'ja');
    expect(socket.url).toContain('/v1/sessions/sess-123/live');
    expect(socket.url).toContain('voice=voice-abc');
    expect(socket.url).toContain('lang=ja');
    expect(socket.url).toContain('ticket=tk-once');

    socket.emitJson('live.ready', {
      mode: 'mock',
      provider: 'qwen',
      model: 'qwen-audio-3.1-realtime-flash',
      remote_session_id: 'remote-1',
      memory_scope: 'session',
      delegation: 'none',
      voice: 'voice-abc',
      language: 'ja',
      input_audio: { format: 'pcm_s16le', sample_rate: 16000, channels: 1 },
      output_audio: { format: 'pcm_s16le', sample_rate: 24000, channels: 1 },
      idle_timeout_s: 180,
      mock_audio: true,
    });
    expect(client.isConnected).toBe(true);

    // Hot-switch language & manual interrupt protocol actions
    client.setLanguage('en');
    expect(socket.sentJson()).toContainEqual({ action: 'change_language', language: 'en' });
    socket.emitJson('language_changed', { language: 'en' });
    expect(client.ready?.language).toBe('en');
    client.interrupt();
    expect(socket.sentJson()).toContainEqual({ action: 'interrupt' });

    // User partial -> final re-keys seamlessly
    socket.emitJson('input.transcript.updated', { text: '你好' });
    socket.emitJson('input.transcript.done', { text: '你好七草荠', turn: '1' });
    expect(transcripts[0].key).toBe('live-user-pending-1');
    expect(transcripts[1].previousKey).toBe('live-user-pending-1');
    expect(transcripts[1].key).toBe('live-user-1');

    // Assistant audio turn with 2 chunks
    socket.emitJson('response.audio.started', { run_id: 'r1', turn_id: 't1' });
    socket.emitJson('output.transcript.updated', { run_id: 'r1', turn_id: 't1', text: '半句' });
    socket.emitJson('response.audio.context', { run_id: 'r1', turn_id: 't1', chunk_id: 'c1', duration_ms: 100 });
    socket.emitBytes(new ArrayBuffer(4800));
    socket.emitJson('output.transcript.updated', { run_id: 'r1', turn_id: 't1', text: '完整的一句话' });
    socket.emitJson('response.audio.context', { run_id: 'r1', turn_id: 't1', chunk_id: 'c2', duration_ms: 100 });
    socket.emitBytes(new ArrayBuffer(4800));
    socket.emitJson('response.audio.done', { run_id: 'r1', turn_id: 't1' });

    // Before audio nodes end, playback.completed MUST NOT be sent yet
    expect(socket.sentJson().some(m => m.action === 'playback.completed')).toBe(false);

    // Finish chunk 1
    audio.nodes[0].onended?.();
    expect(socket.sentJson()).toContainEqual({
      action: 'playback.chunk.completed',
      run_id: 'r1',
      turn_id: 't1',
      chunk_id: 'c1',
    });
    expect(socket.sentJson().some(m => m.action === 'playback.completed')).toBe(false);

    // Finish chunk 2 -> immediately sends chunk ack AND playback.completed
    audio.nodes[1].onended?.();
    expect(socket.sentJson()).toContainEqual({
      action: 'playback.chunk.completed',
      run_id: 'r1',
      turn_id: 't1',
      chunk_id: 'c2',
    });
    expect(socket.sentJson()).toContainEqual({
      action: 'playback.completed',
      run_id: 'r1',
      turn_id: 't1',
    });

    socket.emitJson('output.transcript.done', { run_id: 'r1', turn_id: 't1', text: '完整的一句话' });
    socket.emitJson('response.ended', { run_id: 'r1', turn_id: 't1', status: 'completed' });
    expect(onAssistantEnd).toHaveBeenCalledWith('r1', 't1', 'completed');

    client.disconnect();
  });

  it('reports completed chunks before playback.stopped(played_audio_ms) on barge-in', async () => {
    const audio = createFakeAudioContext();
    const player = new PcmPlayer(vi.fn(), () => audio.ctx);
    let socket!: FakeWebSocket;
    const onInterrupt = vi.fn();

    const client = new MossLiveClient(
      player,
      {
        onState: vi.fn(),
        onTranscript: vi.fn(),
        onUserSpeech: vi.fn(),
        onAssistantStart: vi.fn(),
        onAssistantInterrupt: onInterrupt,
        onAssistantEnd: vi.fn(),
      },
      {
        micEnabled: false,
        socketFactory: url => {
          socket = new FakeWebSocket(url);
          return socket;
        },
      },
    );

    await client.connect('sess-barge');
    socket.emitJson('live.ready', {
      mode: 'mock',
      model: 'moss-live-1.0',
      remote_session_id: 'r',
      memory_scope: 'session',
      delegation: 'none',
      voice: null,
      input_audio: { format: 'pcm_s16le', sample_rate: 16000, channels: 1 },
      output_audio: { format: 'pcm_s16le', sample_rate: 24000, channels: 1 },
      idle_timeout_s: 180,
      mock_audio: true,
    });

    socket.emitJson('response.audio.started', { run_id: 'r2', turn_id: 't2' });
    socket.emitJson('response.audio.context', { run_id: 'r2', turn_id: 't2', chunk_id: 'c1', duration_ms: 100 });
    socket.emitBytes(new ArrayBuffer(4800)); // 10.025 -> 10.125
    socket.emitJson('response.audio.context', { run_id: 'r2', turn_id: 't2', chunk_id: 'c2', duration_ms: 100 });
    socket.emitBytes(new ArrayBuffer(4800)); // 10.125 -> 10.225

    // Interrupt at 10.185 (c1 completed, c2 played 60 ms)
    (audio.ctx as unknown as { currentTime: number }).currentTime = 10.185;
    socket.emitJson('response.audio.stop', { run_id: 'r2', turn_id: 't2', reason: 'barge_in' });

    const msgs = socket.sentJson();
    expect(msgs).toEqual([
      { action: 'playback.chunk.completed', run_id: 'r2', turn_id: 't2', chunk_id: 'c1' },
      { action: 'playback.stopped', run_id: 'r2', turn_id: 't2', played_audio_ms: 60 },
    ]);
    expect(onInterrupt).toHaveBeenCalledWith('r2', 't2', 'barge_in', 60);
    client.disconnect();
  });

  it('acknowledges playback even when speaker output is muted so turns never stall', async () => {
    const audio = createFakeAudioContext();
    const player = new PcmPlayer(vi.fn(), () => audio.ctx);
    player.setEnabled(false);
    let socket!: FakeWebSocket;

    const client = new MossLiveClient(
      player,
      {
        onState: vi.fn(),
        onTranscript: vi.fn(),
        onUserSpeech: vi.fn(),
        onAssistantStart: vi.fn(),
        onAssistantInterrupt: vi.fn(),
        onAssistantEnd: vi.fn(),
      },
      {
        micEnabled: false,
        socketFactory: url => {
          socket = new FakeWebSocket(url);
          return socket;
        },
      },
    );

    await client.connect('sess-muted');
    socket.emitJson('live.ready', {
      mode: 'mock',
      model: 'moss-live-1.0',
      remote_session_id: 'r',
      memory_scope: 'session',
      delegation: 'none',
      voice: null,
      input_audio: { format: 'pcm_s16le', sample_rate: 16000, channels: 1 },
      output_audio: { format: 'pcm_s16le', sample_rate: 24000, channels: 1 },
      idle_timeout_s: 180,
      mock_audio: true,
    });

    socket.emitJson('response.audio.started', { run_id: 'r3', turn_id: 't3' });
    socket.emitJson('response.audio.context', { run_id: 'r3', turn_id: 't3', chunk_id: 'c1', duration_ms: 100 });
    socket.emitBytes(new ArrayBuffer(4800));
    socket.emitJson('response.audio.done', { run_id: 'r3', turn_id: 't3' });

    expect(socket.sentJson()).toEqual([
      { action: 'playback.chunk.completed', run_id: 'r3', turn_id: 't3', chunk_id: 'c1' },
      { action: 'playback.completed', run_id: 'r3', turn_id: 't3' },
    ]);
    client.disconnect();
  });
});
