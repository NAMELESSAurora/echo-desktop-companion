export type AvatarMood = 'offline' | 'idle' | 'thinking' | 'looking' | 'replying' | 'speaking' | 'interrupted' | 'error';
export type AvatarGesture = 'nod' | 'wave' | 'think' | 'headpat' | 'poke';
export type AvatarExpressionPreset = 'auto' | 'smile' | 'shy' | 'surprised' | 'sleepy' | 'cheeky';

export interface AvatarFrame {
  mood: AvatarMood;
  mouth: number;
  blink: number;
  gazeX: number;
  gazeY: number;
  breath: number;
  gesture: AvatarGesture | null;
  gestureProgress: number;
  happy: number;
}

export interface SpectralHint {
  low: number;
  mid: number;
  high: number;
}

const GESTURE_DURATIONS: Record<AvatarGesture, number> = {
  nod: 1.25,
  wave: 2.8,
  think: 3.0,
  headpat: 2.4,
  poke: 2.0,
};

export function rms(samples: Float32Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (const sample of samples) sum += Number.isFinite(sample) ? sample * sample : 0;
  return Math.sqrt(sum / samples.length);
}

export function mouthTarget(level: number): number {
  return Math.min(1, Math.max(0, (level - .002) * 55));
}

export function extractSpectralHint(bins: Uint8Array): SpectralHint {
  if (!bins.length) return { low: 0, mid: 0, high: 0 };
  const n = bins.length;
  const lowEnd = Math.max(1, Math.floor(n * 0.14));
  const midEnd = Math.max(lowEnd + 1, Math.floor(n * 0.45));
  const highEnd = Math.max(midEnd + 1, Math.floor(n * 0.85));
  let low = 0, mid = 0, high = 0;
  for (let i = 0; i < lowEnd; i++) low += bins[i];
  for (let i = lowEnd; i < midEnd; i++) mid += bins[i];
  for (let i = midEnd; i < highEnd; i++) high += bins[i];
  return {
    low: low / (lowEnd * 255),
    mid: mid / ((midEnd - lowEnd) * 255),
    high: high / ((highEnd - midEnd) * 255),
  };
}

// Rendering-independent state. Text generation never pretends to be audible speech.
export class AvatarState {
  connected = false;
  private turn = '';
  private phase: 'idle' | 'pending' | 'replying' | 'complete' | 'cancelled' | 'failed' = 'idle';
  private hasScreen = false;
  private audio = false;
  private mouth = 0;
  private interruptedUntil = 0;
  private gesture: { type: AvatarGesture; started: number } | null = null;
  private gazeX = 0;
  private gazeY = 0;
  private gazeTargetX = 0;
  private gazeTargetY = 0;

  setConnected(value: boolean) { this.connected = value; if (!value) this.reset(); }
  begin(turn: string, hasScreen: boolean) {
    this.turn = turn; this.phase = 'pending'; this.hasScreen = hasScreen;
    this.audio = false; this.mouth = 0; this.interruptedUntil = 0; this.gesture = null;
  }
  text(turn: string) { if (turn === this.turn && this.phase === 'pending') this.phase = 'replying'; }
  complete(turn: string) {
    if (turn === this.turn && this.phase !== 'cancelled' && this.phase !== 'failed') this.phase = 'complete';
  }
  interrupt(turn: string, now: number) {
    if (turn !== this.turn) return;
    this.phase = 'cancelled'; this.audio = false; this.mouth = 0;
    this.interruptedUntil = now + .65; this.gesture = null;
  }
  fail(turn: string) {
    if (turn !== this.turn) return;
    this.phase = 'failed'; this.audio = false; this.mouth = 0; this.gesture = null;
  }
  playback(playing: boolean) {
    this.audio = playing && this.connected && this.phase !== 'cancelled' && this.phase !== 'failed';
    if (!this.audio) this.mouth = 0;
  }
  replay() { this.phase = 'complete'; this.interruptedUntil = 0; this.audio = false; this.mouth = 0; }
  act(type: AvatarGesture, now: number) { this.gesture = { type, started: now }; }
  look(x: number, y: number) {
    this.gazeTargetX = Math.max(-1, Math.min(1, x));
    this.gazeTargetY = Math.max(-1, Math.min(1, y));
  }
  reset() {
    this.turn = ''; this.phase = 'idle'; this.audio = false; this.mouth = 0;
    this.interruptedUntil = 0; this.gesture = null; this.hasScreen = false;
  }
  frame(now: number, delta: number, audioLevel: number, reducedMotion = false): AvatarFrame {
    let mood: AvatarMood = !this.connected ? 'offline' : this.phase === 'failed' ? 'error'
      : now < this.interruptedUntil ? 'interrupted' : this.audio ? 'speaking'
      : this.phase === 'pending' ? this.hasScreen ? 'looking' : 'thinking'
      : this.phase === 'replying' ? 'replying' : 'idle';
    const target = mood === 'speaking' ? mouthTarget(audioLevel) : 0;
    const dt = Math.min(.1, Math.max(0, delta));
    if (mood !== 'speaking') this.mouth = 0;
    else this.mouth += (target - this.mouth) * (1 - Math.exp(-dt / (target > this.mouth ? .025 : .07)));
    const gazeBlend = 1 - Math.exp(-dt * 9);
    this.gazeX += (this.gazeTargetX - this.gazeX) * gazeBlend;
    this.gazeY += (this.gazeTargetY - this.gazeY) * gazeBlend;
    const cycle = now % 4.7;
    const blink = reducedMotion || cycle > .16 ? 0 : Math.sin(cycle / .16 * Math.PI);
    const gestureDuration = this.gesture ? GESTURE_DURATIONS[this.gesture.type] : 1.25;
    const gestureProgress = this.gesture ? Math.min(1, Math.max(0, (now - this.gesture.started) / gestureDuration)) : 0;
    if (gestureProgress >= 1) this.gesture = null;
    const happy = this.gesture === null
      ? (mood === 'speaking' ? .12 : 0)
      : this.gesture.type === 'headpat' ? .92
      : this.gesture.type === 'wave' || this.gesture.type === 'poke' ? .72
      : this.gesture.type === 'think' ? .08 : .52;
    return {
      mood, mouth: this.mouth, blink,
      gazeX: reducedMotion ? 0 : this.gazeX,
      gazeY: reducedMotion ? 0 : this.gazeY,
      breath: reducedMotion ? 0 : Math.sin(now * 1.8) * .028,
      gesture: this.gesture?.type ?? null, gestureProgress,
      happy,
    };
  }
}
