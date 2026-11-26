import { ApiError } from './api';

export interface AudioStatus { playing: boolean; queued: number; playedChunks: number; receivedSeconds: number }

export interface AudioChunkMeta {
  runId: string;
  turnId: string;
  chunkId: string;
  durationMs?: number;
}

export interface PlaybackStopProgress {
  completed: AudioChunkMeta[];
  interrupted: AudioChunkMeta | null;
  playedAudioMs: number;
}

interface ScheduledChunk {
  meta?: AudioChunkMeta;
  startTime: number;
  duration: number;
  acked: boolean;
}

export class PcmPlayer {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private scheduled = new Map<AudioBufferSourceNode, ScheduledChunk>();
  private nextTime = 0;
  private generation = 0;
  private turnId = '';
  private rate = 24000;
  private volume = .45;
  private enabled = true;
  private playedChunks = 0;
  private receivedSeconds = 0;
  analyser: AnalyserNode | null = null;
  onChunkEnded: ((meta: AudioChunkMeta) => void) | null = null;

  constructor(
    private changed: (status: AudioStatus) => void,
    private factory: () => AudioContext = () => new AudioContext(),
  ) {}

  async unlock() {
    if (!this.context) {
      this.context = this.factory();
      this.gain = this.context.createGain();
      this.gain.gain.value = this.volume;
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.gain.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
    await this.context.resume();
    if (this.context.state !== 'running') throw new ApiError('audio_locked');
  }

  get isEnabled() { return this.enabled; }
  get sampleRate() { return this.rate; }
  get queuedCount() { return this.scheduled.size; }

  begin(turnId: string, sampleRate = 24000, resetStats = true) {
    this.stop();
    this.turnId = turnId;
    this.rate = sampleRate;
    if (resetStats) { this.playedChunks = 0; this.receivedSeconds = 0; }
    this.notify();
  }
  configure(sampleRate: number, channels: number, format: string) {
    if (channels !== 1 || format !== 'pcm_s16le' || ![16000, 24000, 48000].includes(sampleRate)) {
      throw new ApiError('unsupported_audio_format');
    }
    this.rate = sampleRate;
  }
  setEnabled(enabled: boolean) { this.enabled = enabled; if (!enabled) this.stop(); else this.notify(); }
  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.gain) this.gain.gain.value = this.volume;
  }
  push(turnId: string, encoded: string) {
    if (!this.enabled || turnId !== this.turnId) return;
    const context = this.context;
    if (!context || context.state !== 'running' || !this.gain) throw new ApiError('audio_locked');
    const raw = atob(encoded);
    if (raw.length % 2 || raw.length > 256_000) throw new ApiError('invalid_audio_chunk');
    if (!raw.length) return;
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    this.schedulePcmBytes(turnId, bytes);
  }
  pushPcm(turnId: string, bytes: Uint8Array, meta?: AudioChunkMeta): boolean {
    return this.schedulePcmBytes(turnId, bytes, meta);
  }
  private schedulePcmBytes(turnId: string, bytes: Uint8Array, meta?: AudioChunkMeta): boolean {
    if (!this.enabled || turnId !== this.turnId) return false;
    const context = this.context;
    if (!context || context.state !== 'running' || !this.gain) throw new ApiError('audio_locked');
    if (bytes.byteLength % 2 || bytes.byteLength > 256_000) throw new ApiError('invalid_audio_chunk');
    if (!bytes.byteLength) return false;
    if (this.nextTime - context.currentTime > 20) throw new ApiError('audio_queue_full');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const buffer = context.createBuffer(1, bytes.byteLength / 2, this.rate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) channel[i] = view.getInt16(i * 2, true) / 32768;
    const source = context.createBufferSource();
    const generation = this.generation;
    source.buffer = buffer;
    source.connect(this.gain);
    const startsAt = Math.max(context.currentTime + .025, this.nextTime);
    const entry: ScheduledChunk = { meta, startTime: startsAt, duration: buffer.duration, acked: false };
    this.scheduled.set(source, entry);
    source.onended = () => {
      const finished = this.scheduled.get(source);
      source.disconnect();
      this.scheduled.delete(source);
      if (generation === this.generation) {
        if (finished?.meta && !finished.acked) {
          finished.acked = true;
          this.onChunkEnded?.(finished.meta);
        }
        this.notify();
      }
    };
    source.start(startsAt);
    this.nextTime = startsAt + buffer.duration;
    this.playedChunks++;
    this.receivedSeconds += buffer.duration;
    this.notify();
    return true;
  }
  stopWithProgress(): PlaybackStopProgress {
    const now = this.context?.currentTime ?? 0;
    const completed: AudioChunkMeta[] = [];
    let interrupted: AudioChunkMeta | null = null;
    let playedAudioMs = 0;

    for (const entry of this.scheduled.values()) {
      if (now >= entry.startTime + entry.duration) {
        if (entry.meta && !entry.acked) {
          entry.acked = true;
          completed.push(entry.meta);
        }
      } else {
        interrupted = entry.meta ?? null;
        if (now > entry.startTime) {
          playedAudioMs = Math.min(
            Math.round(entry.duration * 1000),
            Math.max(0, Math.round((now - entry.startTime) * 1000)),
          );
        } else {
          playedAudioMs = 0;
        }
        break;
      }
    }

    this.stop();
    return { completed, interrupted, playedAudioMs };
  }
  stop() {
    this.generation++;
    for (const source of this.scheduled.keys()) {
      source.onended = null;
      try { source.stop(); } catch { /* Already ended. */ }
      source.disconnect();
    }
    this.scheduled.clear(); this.nextTime = 0;
    this.notify();
  }
  private notify() {
    this.changed({ playing: this.scheduled.size > 0, queued: this.scheduled.size,
      playedChunks: this.playedChunks, receivedSeconds: this.receivedSeconds });
  }
}
