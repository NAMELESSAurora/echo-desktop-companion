export type AvatarMood = 'offline' | 'idle' | 'thinking' | 'looking' | 'replying' | 'speaking' | 'interrupted' | 'error';
export type AvatarGesture = 'nod' | 'wave';
export interface AvatarFrame {
  mood: AvatarMood; mouth: number; blink: number; gazeX: number; gazeY: number;
  breath: number; gesture: AvatarGesture | null; gestureProgress: number; happy: number;
}

export function rms(samples: Float32Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (const sample of samples) sum += Number.isFinite(sample) ? sample * sample : 0;
  return Math.sqrt(sum / samples.length);
}

export function mouthTarget(level: number): number {
  return Math.min(1, Math.max(0, (level - .002) * 55));
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
    const gestureDuration = this.gesture?.type === 'wave' ? 2.6 : 1.25;
    const gestureProgress = this.gesture ? Math.min(1, Math.max(0, (now - this.gesture.started) / gestureDuration)) : 0;
    if (gestureProgress >= 1) this.gesture = null;
    return {
      mood, mouth: this.mouth, blink,
      gazeX: reducedMotion ? 0 : this.gazeX,
      gazeY: reducedMotion ? 0 : this.gazeY,
      breath: reducedMotion ? 0 : Math.sin(now * 1.8) * .028,
      gesture: this.gesture?.type ?? null, gestureProgress,
      happy: this.gesture ? .65 : mood === 'speaking' ? .12 : 0,
    };
  }
}
