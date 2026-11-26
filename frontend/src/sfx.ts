/**
 * Procedural Studio-Grade WebAudio Tactile SFX Engine for 回声 · ECHO.
 *
 * Crafted around minimalist glass-ceramic & Japanese digital stationery acoustics:
 * subtle 4ms anti-click attacks, warm harmonic partials, gentle low-pass sculpting,
 * zero external audio files, and graceful silent fallback in headless environments.
 */

export type SfxKind =
  | 'click'
  | 'send'
  | 'replyDone'
  | 'callConnect'
  | 'callHangup'
  | 'langSwitch'
  | 'micOn'
  | 'micOff'
  | 'bargeIn'
  | 'skyShift'
  | 'memorySave'
  | 'avatarReact'
  | 'error';

const SFX_ENABLED_KEY = 'companion:sfx-enabled';

export class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = true;
  private volume = 0.45;
  private lastPlayed = new Map<SfxKind, number>();

  constructor(private factory?: () => AudioContext) {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(SFX_ENABLED_KEY);
        if (stored === '0' || stored === 'false') this.enabled = false;
      }
    } catch { /* ignore */ }
  }

  get isEnabled(): boolean { return this.enabled; }

  setEnabled(next: boolean): void {
    this.enabled = next;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SFX_ENABLED_KEY, next ? '1' : '0');
      }
    } catch { /* ignore */ }
  }

  setVolume(norm: number): void {
    this.volume = Math.max(0, Math.min(1, norm));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume * 0.36, this.ctx.currentTime, 0.02);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled || this.volume <= 0.005) return null;
    if (!this.ctx) {
      const AudioCtor = this.factory
        ? null
        : (typeof AudioContext !== 'undefined' ? AudioContext : null);
      if (!this.factory && !AudioCtor) return null;
      try {
        this.ctx = this.factory ? this.factory() : new AudioCtor!();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume * 0.36;
        this.master.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  play(kind: SfxKind): void {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const prev = this.lastPlayed.get(kind) ?? 0;
    if (nowMs - prev < 35) return;
    this.lastPlayed.set(kind, nowMs);

    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + 0.004;

    switch (kind) {
      case 'click':
        this.tone(ctx, 1340, 1180, t, 0.032, 0.16, 'sine');
        this.tone(ctx, 2680, 2400, t, 0.018, 0.05, 'triangle');
        break;
      case 'send':
        this.tone(ctx, 659.25, 659.25, t, 0.075, 0.17, 'sine');
        this.tone(ctx, 987.77, 995.0, t + 0.036, 0.11, 0.15, 'triangle');
        break;
      case 'replyDone':
        this.tone(ctx, 880.0, 880.0, t, 0.22, 0.13, 'sine');
        this.tone(ctx, 1318.51, 1318.51, t + 0.055, 0.26, 0.11, 'sine');
        break;
      case 'callConnect':
        this.tone(ctx, 523.25, 523.25, t, 0.18, 0.16, 'sine');
        this.tone(ctx, 783.99, 783.99, t + 0.075, 0.22, 0.16, 'sine');
        this.tone(ctx, 1174.66, 1174.66, t + 0.155, 0.30, 0.14, 'triangle');
        break;
      case 'callHangup':
        this.tone(ctx, 783.99, 760.0, t, 0.12, 0.16, 'sine');
        this.tone(ctx, 523.25, 493.88, t + 0.085, 0.22, 0.15, 'sine');
        break;
      case 'langSwitch':
        this.tone(ctx, 739.99, 739.99, t, 0.095, 0.17, 'sine');
        this.tone(ctx, 1108.73, 1114.0, t + 0.048, 0.17, 0.16, 'triangle');
        this.tone(ctx, 2217.46, 2217.46, t + 0.052, 0.09, 0.05, 'sine');
        break;
      case 'micOn':
        this.tone(ctx, 520, 780, t, 0.075, 0.16, 'sine');
        break;
      case 'micOff':
        this.tone(ctx, 640, 400, t, 0.08, 0.15, 'sine');
        break;
      case 'bargeIn':
        this.tone(ctx, 420, 210, t, 0.085, 0.20, 'triangle');
        this.noiseBurst(ctx, t, 0.045, 1600, 0.09);
        break;
      case 'skyShift':
        this.tone(ctx, 587.33, 880.0, t, 0.28, 0.09, 'sine');
        this.tone(ctx, 1174.66, 1318.51, t + 0.04, 0.30, 0.06, 'sine');
        this.noiseBurst(ctx, t, 0.18, 1850, 0.045);
        break;
      case 'memorySave':
        this.tone(ctx, 587.33, 587.33, t, 0.16, 0.14, 'sine');
        this.tone(ctx, 739.99, 739.99, t + 0.06, 0.18, 0.14, 'sine');
        this.tone(ctx, 880.0, 880.0, t + 0.12, 0.22, 0.14, 'sine');
        this.tone(ctx, 1174.66, 1174.66, t + 0.18, 0.28, 0.12, 'triangle');
        break;
      case 'avatarReact':
        this.tone(ctx, 783.99, 820.0, t, 0.08, 0.15, 'sine');
        this.tone(ctx, 987.77, 1046.5, t + 0.05, 0.13, 0.13, 'sine');
        break;
      case 'error':
        this.tone(ctx, 250, 220, t, 0.09, 0.17, 'sine');
        this.tone(ctx, 196, 174, t + 0.095, 0.12, 0.15, 'sine');
        break;
    }
  }

  private tone(
    ctx: AudioContext,
    freqStart: number,
    freqEnd: number,
    start: number,
    duration: number,
    peakGain: number,
    type: OscillatorType,
  ): void {
    if (!this.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, start);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), start + duration);
    }
    const attack = Math.min(0.006, duration * 0.22);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.015);
  }

  private noiseBurst(
    ctx: AudioContext,
    start: number,
    duration: number,
    centerHz: number,
    peakGain: number,
  ): void {
    if (!this.master) return;
    const samples = Math.max(64, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / samples) * Math.PI);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(centerHz, start);
    filter.Q.value = 1.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(start);
    src.stop(start + duration + 0.01);
  }
}
