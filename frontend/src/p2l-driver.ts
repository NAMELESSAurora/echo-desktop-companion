/**
 * Live2D / PSD2Live WebAssembly Runtime Driver (`p2lrt`) for 回声 · ECHO.
 *
 * Wraps the MIT-licensed `P2LPlayer` (`p2l.js` + `p2l_runtime.wasm`) to drive
 * auto-rigged `.p2lrt` Live2D models with real-time PCM lip-sync, pointer gaze
 * tracking, blinking, breathing, XPBD hair/cloth physics, and gesture clips.
 */

import type { AvatarFrame, AvatarGesture } from './avatar-state';
import { P2LPlayer } from './vendor/p2l.js';

export const DEFAULT_LIVE2D_WASM_URL = '/ui/assets/live2d/p2l_runtime.wasm';
export const DEFAULT_LIVE2D_MODEL_URL = '/ui/assets/live2d/nazuna.p2lrt';
export const MAX_P2LRT_BYTES = 64 * 1024 * 1024;

let cachedRuntimePromise: Promise<WebAssembly.Exports> | null = null;

async function getP2LRuntime(wasmUrl = DEFAULT_LIVE2D_WASM_URL): Promise<WebAssembly.Exports> {
  if (!cachedRuntimePromise) {
    cachedRuntimePromise = fetch(wasmUrl)
      .then(resp => {
        if (!resp.ok) throw new Error(`Live2D WASM 加载失败 (${resp.status})`);
        return resp.arrayBuffer();
      })
      .then(buf => WebAssembly.instantiate(buf, {}))
      .then(res => res.instance.exports)
      .catch(err => {
        cachedRuntimePromise = null;
        throw err;
      });
  }
  return cachedRuntimePromise;
}

export class P2LLive2DController {
  private lastGesture: AvatarGesture | null = null;
  private lastMood: AvatarFrame['mood'] | null = null;
  private smoothMouth = 0;
  private disposed = false;

  private constructor(
    public readonly player: P2LPlayer,
    private readonly canvas: HTMLCanvasElement,
  ) {
    // Enable live XPBD hair/cloth simulation & skinning when the model carries it
    if (player.advancedFeatures) {
      try {
        player.setAdvanced(player.advancedFeatures);
      } catch { /* ignore if unsupported */ }
    }
    // Frame Nazuna's head, face, raised hand & coat collar cleanly inside the stage viewport
    player.view = { zoom: 1.32, x: 0, y: 46 };
    const idleClip = this.findClip(['idle', 'Idle', 'breath', 'Breath']);
    if (idleClip) player.play(idleClip);
    player.lipSync(0);
    player.lookAt(0, 0);
  }

  static async loadFromUrl(
    canvas: HTMLCanvasElement,
    rigUrl = DEFAULT_LIVE2D_MODEL_URL,
    wasmUrl = DEFAULT_LIVE2D_WASM_URL,
  ): Promise<P2LLive2DController> {
    const [runtime, rigBuf] = await Promise.all([
      getP2LRuntime(wasmUrl),
      fetch(rigUrl).then(resp => {
        if (!resp.ok) throw new Error(`Live2D 模型加载失败 (${resp.status})`);
        return resp.arrayBuffer();
      }),
    ]);
    const player = await P2LPlayer.fromBytes(canvas, runtime, new Uint8Array(rigBuf));
    return new P2LLive2DController(player, canvas);
  }

  static async loadFromBytes(
    canvas: HTMLCanvasElement,
    bytes: ArrayBuffer,
    wasmUrl = DEFAULT_LIVE2D_WASM_URL,
  ): Promise<P2LLive2DController> {
    if (bytes.byteLength < 16 || bytes.byteLength > MAX_P2LRT_BYTES) {
      throw new Error('Live2D (.p2lrt) 文件体积无效或超出 64 MB 上限。');
    }
    const runtime = await getP2LRuntime(wasmUrl);
    const player = await P2LPlayer.fromBytes(canvas, runtime, new Uint8Array(bytes));
    return new P2LLive2DController(player, canvas);
  }

  private findClip(candidates: string[]): string | null {
    for (const c of candidates) {
      const exact = this.player.clips.find(id => id === c);
      if (exact) return exact;
    }
    for (const c of candidates) {
      const lower = c.toLowerCase();
      const partial = this.player.clips.find(id => id.toLowerCase().includes(lower));
      if (partial) return partial;
    }
    return null;
  }

  private findExpression(candidates: string[]): string | null {
    for (const c of candidates) {
      const exact = this.player.expressions.find(id => id === c);
      if (exact) return exact;
    }
    for (const c of candidates) {
      const lower = c.toLowerCase();
      const partial = this.player.expressions.find(id => id.toLowerCase().includes(lower));
      if (partial) return partial;
    }
    return null;
  }

  private applyMoodExpression(mood: AvatarFrame['mood']): void {
    let target: string | null = null;
    if (mood === 'offline') target = this.findExpression(['sleepy', 'Sleepy']);
    else if (mood === 'interrupted') target = this.findExpression(['surprised', 'Surprised']);
    else if (mood === 'error') target = this.findExpression(['sad', 'gloom', 'Sad']);
    else if (mood === 'speaking') target = this.findExpression(['smile', 'Smile']);
    try {
      this.player.expression(target);
    } catch { /* ignore if model has no expressions */ }
  }

  triggerGesture(gesture: AvatarGesture): void {
    if (this.disposed) return;
    if (gesture === 'nod') {
      const clip = this.findClip(['nod', 'Nod', 'HeadNod', '点头']);
      if (clip) this.player.play(clip);
    } else if (gesture === 'wave') {
      const clip = this.findClip(['wave', 'Wave', 'shake', 'Shake', 'Greet', 'nod', 'Nod']);
      if (clip) this.player.play(clip);
      const smile = this.findExpression(['smile', 'Smile']);
      if (smile) {
        try { this.player.expression(smile); } catch { /* ignore */ }
      }
    }
  }

  hitTest(clientX: number, clientY: number): string | null {
    if (this.disposed) return null;
    try {
      return this.player.hitTest(clientX, clientY);
    } catch {
      return null;
    }
  }

  setExpanded(expanded: boolean): void {
    if (this.disposed) return;
    this.player.view = expanded
      ? { zoom: 1.24, x: 0, y: 48 }
      : { zoom: 1.32, x: 0, y: 46 };
  }

  updateAndDraw(frame: AvatarFrame, dt: number, reducedMotion = false): void {
    if (this.disposed || this.canvas.hidden) return;
    const step = Math.min(Math.max(dt, 0.001), 0.1);

    // Smooth mouth lip-sync envelope with fast attack & natural release
    const targetMouth = Math.max(0, Math.min(1, frame.mouth * 1.35));
    const lerpRate = targetMouth > this.smoothMouth ? 0.55 : 0.28;
    this.smoothMouth += (targetMouth - this.smoothMouth) * lerpRate;
    this.player.lipSync(this.smoothMouth < 0.015 ? 0 : this.smoothMouth);

    if (frame.mood !== this.lastMood) {
      this.applyMoodExpression(frame.mood);
      this.lastMood = frame.mood;
    }

    // Gaze & head tracking (p2l.js uses x right [-1..1], y up [-1..1])
    const gx = Math.max(-1, Math.min(1, frame.gazeX));
    const gy = Math.max(-1, Math.min(1, -frame.gazeY));
    const moodTiltX = frame.mood === 'thinking' ? 0.22 : frame.mood === 'looking' ? -0.18 : 0;
    const moodTiltY = frame.mood === 'thinking' ? 0.15 : frame.mood === 'interrupted' ? -0.12 : 0;
    this.player.lookAt(
      Math.max(-1, Math.min(1, gx * 0.85 + moodTiltX)),
      Math.max(-1, Math.min(1, gy * 0.78 + moodTiltY)),
    );

    // Subtle ambient hair breeze driven by speech energy & gaze sweep
    if (!reducedMotion && this.player.advancedFeatures) {
      const windX = gx * 18 + Math.sin(performance.now() * 0.0011) * (10 + this.smoothMouth * 22);
      try { this.player.wind(windX, 0); } catch { /* ignore if unsupported */ }
    }

    if (frame.gesture && frame.gesture !== this.lastGesture) {
      this.triggerGesture(frame.gesture);
    }
    this.lastGesture = frame.gesture;

    this.player.update(reducedMotion ? 0 : step);
    this.player.draw();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.player.dispose();
    } catch { /* ignore */ }
  }
}
