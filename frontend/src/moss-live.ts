import { ApiError } from './api';
import type { AudioChunkMeta, PcmPlayer } from './audio';
import type { LiveLanguage, MossLiveReady } from './types';

export type LiveConnectionState = 'idle' | 'connecting' | 'connected' | 'closing';

export interface LiveTranscriptUpdate {
  role: 'user' | 'assistant';
  key: string;
  previousKey?: string;
  text: string;
  final: boolean;
  revised?: boolean;
  interrupted?: boolean;
}

export interface LiveSocketLike {
  binaryType: BinaryType;
  readonly readyState: number;
  onopen: ((ev: Event) => unknown) | null;
  onmessage: ((ev: MessageEvent) => unknown) | null;
  onerror: ((ev: Event) => unknown) | null;
  onclose: ((ev: CloseEvent) => unknown) | null;
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  close(code?: number, reason?: string): void;
}

export interface MossLiveCallbacks {
  onState: (state: LiveConnectionState, ready?: MossLiveReady | null) => void;
  onTranscript: (update: LiveTranscriptUpdate) => void;
  onUserSpeech: (speaking: boolean) => void;
  onAssistantStart: (runId: string, turnId: string) => void;
  onAssistantInterrupt: (runId: string, turnId: string, reason: string, playedAudioMs: number) => void;
  onAssistantEnd: (runId: string, turnId: string, status: string) => void;
  onVoiceChanged?: (voiceName: string) => void;
  onLanguageChanged?: (language: LiveLanguage) => void;
  onMicState?: (info: { available: boolean; muted: boolean; level: number }) => void;
  onEvent?: (action: string, data: Record<string, unknown>) => void;
  onNotice?: (codeOrError: unknown) => void;
}

export interface MossLiveOptions {
  socketFactory?: (url: string) => LiveSocketLike;
  micEnabled?: boolean;
}

const WS_OPEN = 1;
const TARGET_INPUT_RATE = 16000;
// 640 samples @ 16 kHz = 40 ms PCM16 frame (1280 bytes), matching MOSS-Live 20-60ms guidance.
const FRAME_SAMPLES = 640;

/** Linearly resamples mono float [-1, 1] audio to 16 kHz signed 16-bit PCM. */
export function downsampleTo16kPcm16(input: Float32Array, inputRate: number): Int16Array {
  if (!input.length || inputRate <= 0) return new Int16Array(0);
  if (inputRate === TARGET_INPUT_RATE) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      out[i] = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
    }
    return out;
  }
  const ratio = inputRate / TARGET_INPUT_RATE;
  const outLength = Math.max(1, Math.floor(input.length / ratio));
  const out = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = input[Math.min(idx, input.length - 1)];
    const b = input[Math.min(idx + 1, input.length - 1)];
    const sample = Math.max(-1, Math.min(1, a + (b - a) * frac));
    out[i] = sample < 0 ? Math.round(sample * 32768) : Math.round(sample * 32767);
  }
  return out;
}

export function pcm16Rms(samples: Int16Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const norm = samples[i] / 32768;
    sum += norm * norm;
  }
  return Math.sqrt(sum / samples.length);
}

export class MossLiveClient {
  private ws: LiveSocketLike | null = null;
  private state: LiveConnectionState = 'idle';
  private readyInfo: MossLiveReady | null = null;
  private outputRate = 24000;

  // Audio playback tracking for exact MOSS-Live client acknowledgements
  private activeRunId = '';
  private activeTurnId = '';
  private audioDoneReceived = false;
  private completionAckSent = false;
  private pendingContexts: AudioChunkMeta[] = [];
  private inFlightChunks = 0;
  private userTurnCounter = 0;
  private activeUserKey = '';

  // Microphone capture state
  private micStream: MediaStream | null = null;
  private micContext: AudioContext | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micSilentGain: GainNode | null = null;
  private micAvailable = false;
  private micMuted = false;
  private micResidual: number[] = [];
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private lastErrorCode = '';

  constructor(
    private player: PcmPlayer,
    private callbacks: MossLiveCallbacks,
    private options: MossLiveOptions = {},
  ) {}

  get connectionState(): LiveConnectionState { return this.state; }
  get isConnected(): boolean { return this.state === 'connected'; }
  get isActive(): boolean { return this.state === 'connecting' || this.state === 'connected'; }
  get isMuted(): boolean { return this.micMuted; }
  get hasMic(): boolean { return this.micAvailable; }
  get ready(): MossLiveReady | null { return this.readyInfo; }

  async connect(sessionId: string, voice?: string, ticket?: string, language?: LiveLanguage): Promise<void> {
    if (this.isActive) return;
    this.setState('connecting', null);
    this.lastErrorCode = '';
    this.resetTurnState();

    // Unlock audio player inside the user gesture before opening WebSocket
    if (this.player.isEnabled) {
      await this.player.unlock();
    }

    const params = new URLSearchParams();
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) params.set('tz', tz);
    } catch { /* ignore */ }
    if (voice) params.set('voice', voice);
    if (language) params.set('lang', language);
    if (ticket) params.set('ticket', ticket);

    const loc = typeof location !== 'undefined' ? location : { protocol: 'http:', host: '127.0.0.1:8765' };
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    const query = params.toString();
    const url = `${proto}//${loc.host}/v1/sessions/${encodeURIComponent(sessionId)}/live${query ? `?${query}` : ''}`;

    const socket = this.options.socketFactory
      ? this.options.socketFactory(url)
      : (new WebSocket(url) as unknown as LiveSocketLike);
    socket.binaryType = 'arraybuffer';
    this.ws = socket;

    this.player.onChunkEnded = meta => {
      this.handleChunkFinished(meta);
    };

    socket.onmessage = ev => {
      if (this.ws !== socket) return;
      if (ev.data instanceof ArrayBuffer) {
        this.handleBinaryAudio(new Uint8Array(ev.data));
      } else if (typeof Blob !== 'undefined' && ev.data instanceof Blob) {
        void ev.data.arrayBuffer().then(buf => {
          if (this.ws === socket) this.handleBinaryAudio(new Uint8Array(buf));
        });
      } else if (typeof ev.data === 'string') {
        this.handleJsonMessage(ev.data);
      }
    };

    socket.onerror = () => {
      if (this.ws !== socket) return;
      if (!this.lastErrorCode) {
        this.lastErrorCode = 'live_disconnected';
      }
    };

    socket.onclose = ev => {
      if (this.ws !== socket) return;
      const reason = ev.reason || this.lastErrorCode;
      this.cleanupResources();
      this.setState('idle', null);
      if (ev.code === 4000 || reason === 'idle_timeout') {
        this.callbacks.onNotice?.(new ApiError('idle_timeout'));
      } else if (reason && ev.code !== 1000 && ev.code !== 1001) {
        this.callbacks.onNotice?.(new ApiError(reason));
      }
    };
  }

  disconnect(): void {
    const socket = this.ws;
    this.cleanupResources();
    if (socket && socket.readyState <= WS_OPEN) {
      try { socket.close(1000, 'user_hangup'); } catch { /* ignore */ }
    }
    this.setState('idle', null);
  }

  setMicMuted(muted: boolean): void {
    this.micMuted = muted;
    if (this.micAvailable) {
      this.sendJson({ action: 'mic_state', enabled: !muted });
    }
    this.callbacks.onMicState?.({ available: this.micAvailable, muted: this.micMuted, level: 0 });
  }

  setVoice(voiceId: string): void {
    if (!this.isConnected || !voiceId) return;
    this.sendJson({ action: 'change_voice', voice_name: voiceId });
  }

  setLanguage(language: LiveLanguage): void {
    if (!this.isConnected) return;
    this.sendJson({ action: 'change_language', language });
  }

  interrupt(): void {
    if (!this.isConnected) return;
    this.sendJson({ action: 'interrupt' });
  }

  sendMockUtterance(text: string): void {
    if (!this.isConnected) return;
    this.sendJson({ action: 'mock.utterance', text });
  }

  sendMockBargeIn(): void {
    if (!this.isConnected) return;
    this.sendJson({ action: 'mock.barge_in' });
  }

  private setState(next: LiveConnectionState, readyInfo?: MossLiveReady | null) {
    this.state = next;
    if (readyInfo !== undefined) this.readyInfo = readyInfo;
    this.callbacks.onState(next, this.readyInfo);
  }

  private resetTurnState() {
    this.activeRunId = '';
    this.activeTurnId = '';
    this.audioDoneReceived = false;
    this.completionAckSent = false;
    this.pendingContexts = [];
    this.inFlightChunks = 0;
    this.activeUserKey = '';
  }

  private sendJson(payload: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WS_OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }

  private handleJsonMessage(raw: string): void {
    let msg: { action?: string; data?: Record<string, unknown> };
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    const action = String(msg.action ?? '');
    const data = (msg.data ?? {}) as Record<string, unknown>;
    this.callbacks.onEvent?.(action, data);

    if (action === 'live.ready') {
      const info = data as unknown as MossLiveReady;
      this.outputRate = info.output_audio?.sample_rate || 24000;
      this.player.configure(this.outputRate, info.output_audio?.channels || 1, 'pcm_s16le');
      this.setState('connected', info);
      this.startKeepalive();
      if (this.options.micEnabled !== false) {
        void this.startMicrophone();
      }
      return;
    }

    if (action === 'live.idle_timeout') {
      this.lastErrorCode = 'idle_timeout';
      return;
    }

    if (action === 'error') {
      const errObj = (data.error ?? {}) as Record<string, unknown>;
      const code = String(errObj.code ?? 'live_disconnected');
      this.lastErrorCode = code;
      this.callbacks.onNotice?.(new ApiError(code));
      return;
    }

    if (action === 'voice_changed') {
      const name = String(data.name ?? '');
      if (name) this.callbacks.onVoiceChanged?.(name);
      return;
    }

    if (action === 'language_changed') {
      const lang = String(data.language ?? '') as LiveLanguage;
      if (lang === 'zh' || lang === 'ja' || lang === 'en') {
        if (this.readyInfo) this.readyInfo = { ...this.readyInfo, language: lang };
        this.callbacks.onLanguageChanged?.(lang);
      }
      return;
    }

    if (action === 'input.speech.started') {
      this.callbacks.onUserSpeech(true);
      return;
    }

    if (action === 'input.speech.stopped') {
      this.callbacks.onUserSpeech(false);
      return;
    }

    if (action === 'input.transcript.updated') {
      if (!this.activeUserKey) {
        this.userTurnCounter++;
        this.activeUserKey = `live-user-pending-${this.userTurnCounter}`;
      }
      this.callbacks.onTranscript({
        role: 'user',
        key: this.activeUserKey,
        text: String(data.text ?? ''),
        final: false,
      });
      return;
    }

    if (action === 'input.transcript.done') {
      const serverTurn = data.turn ? `live-user-${String(data.turn)}` : '';
      const previousKey = this.activeUserKey || undefined;
      const key = serverTurn || previousKey || `live-user-${++this.userTurnCounter}`;
      this.activeUserKey = '';
      this.callbacks.onTranscript({
        role: 'user',
        key,
        previousKey: previousKey && previousKey !== key ? previousKey : undefined,
        text: String(data.text ?? ''),
        final: true,
      });
      return;
    }

    if (action === 'input.transcript.revised') {
      const serverTurn = data.turn ? `live-user-${String(data.turn)}` : `live-user-${this.userTurnCounter}`;
      this.callbacks.onTranscript({
        role: 'user',
        key: serverTurn,
        text: String(data.text ?? ''),
        final: true,
        revised: true,
      });
      return;
    }

    if (action === 'response.audio.started') {
      this.activeRunId = String(data.run_id ?? '');
      this.activeTurnId = String(data.turn_id ?? '');
      this.audioDoneReceived = false;
      this.completionAckSent = false;
      this.pendingContexts = [];
      this.inFlightChunks = 0;
      const playKey = `${this.activeRunId}:${this.activeTurnId}`;
      this.player.begin(playKey, this.outputRate, false);
      this.callbacks.onAssistantStart(this.activeRunId, this.activeTurnId);
      return;
    }

    if (action === 'response.audio.context') {
      const meta: AudioChunkMeta = {
        runId: String(data.run_id ?? this.activeRunId),
        turnId: String(data.turn_id ?? this.activeTurnId),
        chunkId: String(data.chunk_id ?? ''),
        durationMs: typeof data.duration_ms === 'number' ? data.duration_ms : undefined,
      };
      this.pendingContexts.push(meta);
      return;
    }

    if (action === 'response.audio.done') {
      const runId = String(data.run_id ?? '');
      const turnId = String(data.turn_id ?? '');
      if (runId === this.activeRunId && turnId === this.activeTurnId) {
        this.audioDoneReceived = true;
        this.maybeCompletePlayback();
      }
      return;
    }

    if (action === 'response.audio.stop') {
      const runId = String(data.run_id ?? this.activeRunId);
      const turnId = String(data.turn_id ?? this.activeTurnId);
      const reason = String(data.reason ?? 'barge_in');
      const progress = this.player.stopWithProgress();
      this.pendingContexts = [];
      this.inFlightChunks = 0;
      this.audioDoneReceived = false;
      this.completionAckSent = true;
      for (const doneChunk of progress.completed) {
        this.sendJson({
          action: 'playback.chunk.completed',
          run_id: doneChunk.runId,
          turn_id: doneChunk.turnId,
          chunk_id: doneChunk.chunkId,
        });
      }
      if (runId && turnId) {
        this.sendJson({
          action: 'playback.stopped',
          run_id: runId,
          turn_id: turnId,
          played_audio_ms: progress.playedAudioMs,
        });
      }
      this.callbacks.onAssistantInterrupt(runId, turnId, reason, progress.playedAudioMs);
      return;
    }

    if (action === 'output.transcript.updated') {
      const runId = String(data.run_id ?? this.activeRunId);
      const turnId = String(data.turn_id ?? this.activeTurnId);
      const key = `live-assistant-${runId || turnId || 'current'}`;
      this.callbacks.onTranscript({
        role: 'assistant',
        key,
        text: String(data.text ?? ''),
        final: false,
      });
      return;
    }

    if (action === 'output.transcript.done') {
      const runId = String(data.run_id ?? this.activeRunId);
      const turnId = String(data.turn_id ?? this.activeTurnId);
      const key = `live-assistant-${runId || turnId || 'current'}`;
      this.callbacks.onTranscript({
        role: 'assistant',
        key,
        text: String(data.text ?? ''),
        final: true,
      });
      return;
    }

    if (action === 'response.interrupted') {
      const runId = String(data.run_id ?? this.activeRunId);
      const turnId = String(data.turn_id ?? this.activeTurnId);
      const key = `live-assistant-${runId || turnId || 'current'}`;
      const partial = String(data.text ?? '');
      if (partial) {
        this.callbacks.onTranscript({
          role: 'assistant',
          key,
          text: partial,
          final: true,
          interrupted: true,
        });
      }
      return;
    }

    if (action === 'response.ended') {
      const runId = String(data.run_id ?? this.activeRunId);
      const turnId = String(data.turn_id ?? this.activeTurnId);
      const status = String(data.status ?? 'completed');
      this.callbacks.onAssistantEnd(runId, turnId, status);
    }
  }

  private handleBinaryAudio(bytes: Uint8Array): void {
    const meta = this.pendingContexts.shift();
    const runId = meta?.runId || this.activeRunId;
    const turnId = meta?.turnId || this.activeTurnId;
    const playKey = `${runId}:${turnId}`;

    let scheduled = false;
    if (this.player.isEnabled) {
      try {
        scheduled = this.player.pushPcm(playKey, bytes, meta);
      } catch {
        scheduled = false;
      }
    }

    if (scheduled) {
      this.inFlightChunks++;
    } else if (meta) {
      // Even when local speaker is muted/unavailable, still ack so server advances turn cleanly.
      this.sendJson({
        action: 'playback.chunk.completed',
        run_id: meta.runId,
        turn_id: meta.turnId,
        chunk_id: meta.chunkId,
      });
      this.maybeCompletePlayback();
    }
  }

  private handleChunkFinished(meta: AudioChunkMeta): void {
    if (!this.isConnected) return;
    this.inFlightChunks = Math.max(0, this.inFlightChunks - 1);
    this.sendJson({
      action: 'playback.chunk.completed',
      run_id: meta.runId,
      turn_id: meta.turnId,
      chunk_id: meta.chunkId,
    });
    if (meta.runId === this.activeRunId && meta.turnId === this.activeTurnId) {
      this.maybeCompletePlayback();
    }
  }

  private maybeCompletePlayback(): void {
    if (
      !this.audioDoneReceived ||
      this.completionAckSent ||
      this.inFlightChunks > 0 ||
      !this.activeRunId ||
      !this.activeTurnId
    ) {
      return;
    }
    this.completionAckSent = true;
    this.sendJson({
      action: 'playback.completed',
      run_id: this.activeRunId,
      turn_id: this.activeTurnId,
    });
  }

  private startKeepalive(): void {
    this.stopKeepalive();
    this.pingTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendJson({ action: 'ping', timestamp: Date.now() });
      }
    }, 25000);
  }

  private stopKeepalive(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private async startMicrophone(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.micAvailable = false;
      this.callbacks.onMicState?.({ available: false, muted: true, level: 0 });
      this.callbacks.onNotice?.(new ApiError('mic_denied'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      if (!this.isConnected) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      this.micStream = stream;
      const ctx = new AudioContext();
      this.micContext = ctx;
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      this.micSource = source;
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      this.micProcessor = processor;
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      this.micSilentGain = silentGain;
      this.micResidual = [];

      processor.onaudioprocess = ev => {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WS_OPEN) return;
        const channel = ev.inputBuffer.getChannelData(0);
        const down = downsampleTo16kPcm16(channel, ctx.sampleRate);
        for (let i = 0; i < down.length; i++) {
          this.micResidual.push(this.micMuted ? 0 : down[i]);
        }
        while (this.micResidual.length >= FRAME_SAMPLES) {
          const frame = new Int16Array(FRAME_SAMPLES);
          for (let i = 0; i < FRAME_SAMPLES; i++) frame[i] = this.micResidual[i];
          this.micResidual.splice(0, FRAME_SAMPLES);
          if (!this.micMuted) {
            this.ws.send(frame.buffer);
          } else {
            // Send silent PCM frames when muted only if mic_state stays enabled; when muted we set mic_state=false.
          }
          const level = this.micMuted ? 0 : Math.min(1, pcm16Rms(frame) * 6);
          this.callbacks.onMicState?.({ available: true, muted: this.micMuted, level });
        }
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(ctx.destination);

      this.micAvailable = true;
      this.micMuted = false;
      this.sendJson({ action: 'mic_state', enabled: true });
      this.callbacks.onMicState?.({ available: true, muted: false, level: 0 });
    } catch {
      this.micAvailable = false;
      this.micMuted = true;
      this.callbacks.onMicState?.({ available: false, muted: true, level: 0 });
      this.callbacks.onNotice?.(new ApiError('mic_denied'));
    }
  }

  private stopMicrophone(): void {
    if (this.micProcessor) {
      this.micProcessor.onaudioprocess = null;
      try { this.micProcessor.disconnect(); } catch { /* ignore */ }
      this.micProcessor = null;
    }
    if (this.micSource) {
      try { this.micSource.disconnect(); } catch { /* ignore */ }
      this.micSource = null;
    }
    if (this.micSilentGain) {
      try { this.micSilentGain.disconnect(); } catch { /* ignore */ }
      this.micSilentGain = null;
    }
    if (this.micContext) {
      void this.micContext.close().catch(() => {});
      this.micContext = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    this.micAvailable = false;
    this.micResidual = [];
    this.callbacks.onMicState?.({ available: false, muted: this.micMuted, level: 0 });
  }

  private cleanupResources(): void {
    this.stopKeepalive();
    this.stopMicrophone();
    this.player.onChunkEnded = null;
    this.player.stop();
    this.ws = null;
    this.resetTurnState();
  }
}
