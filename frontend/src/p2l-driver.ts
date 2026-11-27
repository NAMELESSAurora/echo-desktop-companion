/**
 * Live2D / PSD2Live WebAssembly Runtime Driver (`p2lrt`) for 回声 · ECHO (v0.5.0).
 *
 * Wraps the MIT-licensed `P2LPlayer` (`p2l.js` + `p2l_runtime.wasm`, ABI 1.2/1.4)
 * with a critically-damped procedural choreography engine:
 *  - Smooth non-gapping 3-way hand pose switching (`ParamHandPose`: 0=idle, 1=wave, 2=think)
 *  - Articulated wrist-in-sleeve rotation (`ParamWaveSwing` ±18°, `ParamThinkSway` ±4°)
 *  - Expressive multi-gesture state machine (`nod`, `wave`, `think`, `headpat`, `poke`)
 *  - Real-time 5-vowel spectral lip-sync (`ParamA/I/U/E/O` + `ParamMouthOpenY` + `ParamJawOpen`)
 *  - Manual + mood-reactive facial expressions (`ParamCheek`, `ParamEyeL/RSmile`, `ParamTongueOut`)
 *  - True Cubism physics wind (`p2l_physics_wind`) & layered clip playback so Idle never stalls
 */

import type {
  AvatarExpressionPreset,
  AvatarFrame,
  AvatarGesture,
  SpectralHint,
} from './avatar-state';
import { P2LPlayer } from './vendor/p2l.js';

export const DEFAULT_LIVE2D_WASM_URL = '/ui/assets/live2d/p2l_runtime.wasm';
export const DEFAULT_LIVE2D_MODEL_URL = '/ui/assets/live2d/nazuna.p2lrt';
export const MAX_P2LRT_BYTES = 64 * 1024 * 1024;

interface P2LRuntimeAbi {
  p2l_play_layer?: (rig: number, layer: number, clipIdx: number, priority: number) => number;
  p2l_set_layer_weight?: (rig: number, layer: number, weight: number) => void;
  p2l_set_parameter_override?: (rig: number, index: number, value: number, weight: number) => void;
  p2l_clear_parameter_overrides?: (rig: number) => void;
  p2l_physics_wind?: (rig: number, x: number, y: number) => void;
  p2l_behavior_strength?: (rig: number, breath: number, look: number, speed: number) => void;
  p2l_blink_settings?: (
    rig: number,
    minSec: number,
    maxSec: number,
    closeSec: number,
    holdSec: number,
    openSec: number,
  ) => void;
}

interface ParamMeta {
  index: number;
  min: number;
  max: number;
  def: number;
}

const EXPRESSION_LABELS: Record<AvatarExpressionPreset, string> = {
  auto: '自动',
  smile: '微笑',
  shy: '害羞',
  surprised: '惊讶',
  sleepy: '慵懒',
  cheeky: '俏皮',
};

export const EXPRESSION_PRESET_ORDER: readonly AvatarExpressionPreset[] = [
  'auto',
  'smile',
  'shy',
  'surprised',
  'sleepy',
  'cheeky',
];

export function getExpressionLabel(preset: AvatarExpressionPreset): string {
  return EXPRESSION_LABELS[preset];
}

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

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / Math.max(1e-5, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export class P2LLive2DController {
  private readonly paramMap = new Map<string, ParamMeta>();
  private readonly rt: P2LRuntimeAbi | null;
  private readonly rigHandle: number;
  private lastGesture: AvatarGesture | null = null;
  private lastMood: AvatarFrame['mood'] | null = null;
  private expressionPreset: AvatarExpressionPreset = 'auto';
  private smoothMouth = 0;
  private smoothHandPose = 0;
  private smoothVowels = { a: 0, i: 0, u: 0, e: 0, o: 0 };
  private elapsed = 0;
  private disposed = false;

  private constructor(
    public readonly player: P2LPlayer,
    private readonly canvas: HTMLCanvasElement,
  ) {
    const rawPlayer = player as unknown as { rt?: P2LRuntimeAbi; rig?: number };
    this.rt = rawPlayer.rt ?? null;
    this.rigHandle = typeof rawPlayer.rig === 'number' ? rawPlayer.rig : 0;

    // Index all parameters & ranges once for O(1) override dispatch
    try {
      const ranges = player.parameterRanges();
      ranges.forEach((r, idx) => {
        this.paramMap.set(r.id, { index: idx, min: r.min, max: r.max, def: r.default });
      });
    } catch {
      player.parameters.forEach((id, idx) => {
        this.paramMap.set(id, { index: idx, min: -1, max: 1, def: 0 });
      });
    }

    // Enable live XPBD hair/cloth simulation & skinning when the model carries it
    if (player.advancedFeatures) {
      try {
        player.setAdvanced(player.advancedFeatures);
      } catch { /* ignore if unsupported */ }
    }

    // Tune natural blinking cadence & responsive look/breath behavior via ABI 1.2
    if (this.rt && this.rigHandle) {
      try {
        this.rt.p2l_behavior_strength?.(this.rigHandle, 1.0, 0.85, 0.72);
        this.rt.p2l_blink_settings?.(this.rigHandle, 2.5, 5.5, 0.09, 0.045, 0.14);
      } catch { /* ignore if runtime lacks ABI 1.2 */ }
    }

    // Precision stage framing so head, braids, raised waving hand, thinking hand & lapels fit cleanly
    this.setExpanded(false);

    // Keep Idle clip looping permanently on Layer 0 if the model includes one
    const idleClip = this.findClip(['idle', 'Idle', 'breath', 'Breath']);
    if (idleClip) {
      const idx = player.clips.indexOf(idleClip);
      if (this.rt?.p2l_play_layer && this.rigHandle && idx >= 0) {
        this.rt.p2l_play_layer(this.rigHandle, 0, idx, 1);
      } else {
        player.play(idleClip);
      }
    }

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

  hasParam(id: string): boolean {
    return this.paramMap.has(id);
  }

  private setOverride(id: string, value: number, weight = 1): void {
    const meta = this.paramMap.get(id);
    if (!meta || weight <= 0.001) return;
    const clamped = clamp(value, meta.min, meta.max);
    if (this.rt?.p2l_set_parameter_override && this.rigHandle) {
      this.rt.p2l_set_parameter_override(this.rigHandle, meta.index, clamped, clamp(weight, 0, 1));
    } else {
      this.player.setParameter(id, meta.def + (clamped - meta.def) * clamp(weight, 0, 1));
    }
  }

  private clearOverrides(): void {
    if (this.rt?.p2l_clear_parameter_overrides && this.rigHandle) {
      this.rt.p2l_clear_parameter_overrides(this.rigHandle);
    }
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

  setExpressionPreset(preset: AvatarExpressionPreset): void {
    this.expressionPreset = preset;
    this.syncBuiltinExpression(this.lastMood ?? 'idle');
  }

  getExpressionPreset(): AvatarExpressionPreset {
    return this.expressionPreset;
  }

  private syncBuiltinExpression(mood: AvatarFrame['mood']): void {
    let target: string | null = null;
    if (this.expressionPreset !== 'auto') {
      if (this.expressionPreset === 'smile') target = this.findExpression(['smile', 'Smile']);
      else if (this.expressionPreset === 'shy') target = this.findExpression(['shy', 'Shy']);
      else if (this.expressionPreset === 'surprised') target = this.findExpression(['surprised', 'Surprised']);
      else if (this.expressionPreset === 'sleepy') target = this.findExpression(['sleepy', 'Sleepy']);
      else if (this.expressionPreset === 'cheeky') target = this.findExpression(['smile', 'Smile']);
    } else {
      if (mood === 'interrupted') target = this.findExpression(['surprised', 'Surprised']);
      else if (mood === 'error') target = this.findExpression(['sad', 'gloom', 'Sad']);
      else if (mood === 'speaking') target = this.findExpression(['smile', 'Smile']);
    }
    try {
      this.player.expression(target);
    } catch { /* ignore if model has no expressions */ }
  }

  triggerGesture(gesture: AvatarGesture): void {
    if (this.disposed) return;
    // For bespoke multi-pose models with ParamHandPose/ParamWaveSwing, gestures are driven procedurally
    // with spring physics every frame so Idle never stalls. Fall back to layered clips for third-party .p2lrt files.
    if (this.hasParam('ParamHandPose')) return;

    const candidates = gesture === 'nod'
      ? ['nod', 'Nod', 'HeadNod', '点头']
      : gesture === 'wave'
      ? ['wave', 'Wave', 'Greet']
      : [];
    const clip = candidates.length ? this.findClip(candidates) : null;
    if (clip) {
      const idx = this.player.clips.indexOf(clip);
      if (this.rt?.p2l_play_layer && this.rigHandle && idx >= 0) {
        this.rt.p2l_play_layer(this.rigHandle, 1, idx, 2);
      } else {
        this.player.play(clip);
      }
    }
    if (gesture === 'wave' && this.expressionPreset === 'auto') {
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
    // Calibrated for 1280x1280 front portrait so head, braids, raised waving hand, thinking hand & lapels fit cleanly
    this.player.view = expanded
      ? { zoom: 1.38, x: 0, y: 72 }
      : { zoom: 1.48, x: 0, y: 58 };
  }

  private applyPresetOverrides(preset: AvatarExpressionPreset, isSpeaking: boolean): void {
    if (preset === 'auto') return;
    if (preset === 'smile') {
      this.setOverride('ParamEyeLSmile', 0.85, 0.85);
      this.setOverride('ParamEyeRSmile', 0.85, 0.85);
      this.setOverride('ParamMouthForm', 0.72, 0.85);
      this.setOverride('ParamCheek', 0.35, 0.75);
    } else if (preset === 'shy') {
      this.setOverride('ParamCheek', 0.96, 1.0);
      this.setOverride('ParamBrowLAngle', 0.55, 0.8);
      this.setOverride('ParamBrowRAngle', 0.55, 0.8);
      this.setOverride('ParamEyeLSmile', 0.45, 0.7);
      this.setOverride('ParamEyeRSmile', 0.45, 0.7);
      this.setOverride('ParamAngleZ', -6.5, 0.65);
    } else if (preset === 'surprised') {
      this.setOverride('ParamEyeLOpen', 1.35, 0.9);
      this.setOverride('ParamEyeROpen', 1.35, 0.9);
      this.setOverride('ParamBrowLY', 0.72, 0.9);
      this.setOverride('ParamBrowRY', 0.72, 0.9);
      if (!isSpeaking) {
        this.setOverride('ParamMouthOpenY', 0.36, 0.85);
        this.setOverride('ParamO', 0.68, 0.85);
      }
    } else if (preset === 'sleepy') {
      this.setOverride('ParamEyeLOpen', 0.46, 0.88);
      this.setOverride('ParamEyeROpen', 0.46, 0.88);
      this.setOverride('ParamEyeLSquint', 0.4, 0.7);
      this.setOverride('ParamEyeRSquint', 0.4, 0.7);
      this.setOverride('ParamAngleY', -6.5, 0.65);
      this.setOverride('ParamAngleZ', 6.0, 0.65);
    } else if (preset === 'cheeky') {
      this.setOverride('ParamEyeLOpen', 0.0, 0.95);
      this.setOverride('ParamEyeLSmile', 1.0, 1.0);
      this.setOverride('ParamEyeRSmile', 0.35, 0.7);
      this.setOverride('ParamCheek', 0.58, 0.9);
      this.setOverride('ParamMouthForm', 0.6, 0.85);
      if (!isSpeaking) {
        this.setOverride('ParamMouthOpenY', 0.68, 0.9);
        this.setOverride('ParamTongueOut', 0.88, 0.95);
      }
    }
  }

  private applyGestureChoreography(
    frame: AvatarFrame,
    dt: number,
    reducedMotion: boolean,
  ): { windBoostX: number; windBoostY: number } {
    const g = frame.gesture;
    const p = frame.gestureProgress;
    const isSpeaking = frame.mood === 'speaking' && this.smoothMouth > 0.04;
    let windBoostX = 0;
    let windBoostY = 0;

    // 1. Decide target hand pose: 0=idle, 1=wave, 2=think (also auto-think while awaiting reply/vision!)
    let targetPose = 0;
    if (g === 'wave' && p > 0.02 && p < 0.92) {
      targetPose = 1;
    } else if (g === 'think' && p > 0.02 && p < 0.92) {
      targetPose = 2;
    } else if (!g && (frame.mood === 'thinking' || frame.mood === 'looking')) {
      targetPose = 2;
    }

    // Critically-damped smooth pose glide (faster when jumping 1 <-> 2 to avoid mid-pose hang)
    const speed = Math.abs(targetPose - this.smoothHandPose) > 1.05 ? 22 : 12;
    if (reducedMotion) {
      this.smoothHandPose = targetPose;
    } else {
      this.smoothHandPose += (targetPose - this.smoothHandPose) * (1 - Math.exp(-dt * speed));
      if (Math.abs(targetPose - this.smoothHandPose) < 0.004) this.smoothHandPose = targetPose;
    }
    this.setOverride('ParamHandPose', this.smoothHandPose, 1.0);

    // 2. Auto subtle thinking posture when mood is thinking/looking and no manual gesture is running
    if (!g && (frame.mood === 'thinking' || frame.mood === 'looking')) {
      const lookDir = frame.mood === 'looking' ? -1 : 1;
      this.setOverride('ParamThinkSway', reducedMotion ? 0 : Math.sin(this.elapsed * 2.0) * 0.55, 0.9);
      this.setOverride('ParamAngleZ', -9.0 * lookDir, 0.72);
      this.setOverride('ParamAngleX', 11.0 * lookDir, 0.55);
      this.setOverride('ParamAngleY', 5.0, 0.5);
      this.setOverride('ParamBrowRY', 0.32, 0.65);
      this.setOverride('ParamBrowLAngle', -0.2, 0.6);
      return { windBoostX: 0, windBoostY: 0 };
    }

    if (!g) return { windBoostX: 0, windBoostY: 0 };

    const env = smoothstep(0.0, 0.14, p) * (1 - smoothstep(0.84, 1.0, p));

    if (g === 'wave') {
      // Joyful 3-cycle raised wrist wave inside flared coat sleeve + cheerful head tilt & blush
      const waveOsc = reducedMotion ? 0.45 : Math.sin((p - 0.1) * Math.PI * 5.2);
      this.setOverride('ParamWaveSwing', waveOsc * 0.96 * env, 1.0);
      this.setOverride('ParamAngleZ', (10.5 + waveOsc * 2.8) * env, 0.88);
      this.setOverride('ParamAngleY', 3.5 * env, 0.5);
      this.setOverride('ParamBodyAngleZ', (4.5 + waveOsc * 1.4) * env, 0.75);
      this.setOverride('ParamBodyAngleY', Math.abs(waveOsc) * 3.0 * env, 0.55);
      this.setOverride('ParamEyeLSmile', 0.92 * env, 0.95);
      this.setOverride('ParamEyeRSmile', 0.92 * env, 0.95);
      this.setOverride('ParamCheek', 0.48 * env, 0.9);
      this.setOverride('ParamMouthForm', 0.68 * env, 0.85);
      windBoostX = waveOsc * 22 * env;
    } else if (g === 'nod') {
      // Anticipation up -> crisp nod down -> smooth overshoot settle + lagged shoulder follow-through
      const nodCurve = reducedMotion
        ? -0.55 * env
        : p < 0.18
        ? Math.sin((p / 0.18) * Math.PI) * 0.25
        : -Math.sin(clamp((p - 0.14) / 0.76, 0, 1) * Math.PI * 2) * (1 - p * 0.45);
      const laggedP = clamp(p - 0.08, 0, 1);
      const bodyNod = reducedMotion ? -0.3 * env : -Math.sin(laggedP * Math.PI * 2) * 0.45 * env;
      this.setOverride('ParamAngleY', nodCurve * 20, 0.92);
      this.setOverride('ParamBodyAngleY', bodyNod * 8, 0.72);
      this.setOverride('ParamEyeLSmile', 0.55 * env, 0.8);
      this.setOverride('ParamEyeRSmile', 0.55 * env, 0.8);
      if (p > 0.2 && p < 0.55 && !reducedMotion) {
        const blinkDip = Math.sin(((p - 0.2) / 0.35) * Math.PI);
        this.setOverride('ParamEyeLOpen', 1 - blinkDip * 0.75, 0.85);
        this.setOverride('ParamEyeROpen', 1 - blinkDip * 0.75, 0.85);
      }
      windBoostY = -nodCurve * 16;
    } else if (g === 'think') {
      // Contemplative index-finger-to-chin pose with curious gaze & gentle wrist micro-sway
      const sway = reducedMotion ? 0.3 : Math.sin(p * Math.PI * 3.0) * 0.78;
      this.setOverride('ParamThinkSway', sway * env, 1.0);
      this.setOverride('ParamAngleZ', -11.0 * env, 0.88);
      this.setOverride('ParamAngleX', 12.5 * env, 0.72);
      this.setOverride('ParamAngleY', 6.5 * env, 0.65);
      this.setOverride('ParamBodyAngleZ', -3.5 * env, 0.6);
      this.setOverride('ParamEyeBallX', 0.52 * env, 0.85);
      this.setOverride('ParamEyeBallY', 0.4 * env, 0.85);
      this.setOverride('ParamBrowRY', 0.42 * env, 0.8);
      this.setOverride('ParamBrowLAngle', -0.26 * env, 0.75);
      this.setOverride('ParamMouthForm', -0.22 * env, 0.7);
    } else if (g === 'headpat') {
      // Cozy 3-pulse headpat squish + closed happy crescent eyes (^_^) + full anime cheek blush + hair rustle!
      const pat = reducedMotion ? 0.5 : Math.pow(Math.sin(p * Math.PI * 3), 2);
      const snuggle = reducedMotion ? 0 : Math.sin(p * Math.PI * 3);
      this.setOverride('ParamAngleY', (-9.5 - 7.5 * pat) * env, 0.95);
      this.setOverride('ParamAngleZ', snuggle * 8.0 * env, 0.85);
      this.setOverride('ParamBodyAngleY', (-3.5 - 3.0 * pat) * env, 0.75);
      this.setOverride('ParamEyeLOpen', 0.0, env);
      this.setOverride('ParamEyeROpen', 0.0, env);
      this.setOverride('ParamEyeLSmile', 1.0, env);
      this.setOverride('ParamEyeRSmile', 1.0, env);
      this.setOverride('ParamCheek', 0.98 * env, 1.0);
      this.setOverride('ParamMouthForm', 0.85 * env, 0.9);
      windBoostX = snuggle * 28 * env;
      windBoostY = -pat * 20 * env;
    } else if (g === 'poke') {
      // Playful vampire wink + cheeky tongue blep + surprised bounce!
      const bounce = reducedMotion ? 0.5 : Math.sin(p * Math.PI * 2.5);
      this.setOverride('ParamAngleZ', (-11.5 + bounce * 2.5) * env, 0.9);
      this.setOverride('ParamAngleX', -9.0 * env, 0.7);
      this.setOverride('ParamBodyAngleZ', -4.5 * env, 0.7);
      this.setOverride('ParamEyeLOpen', 0.0, env);
      this.setOverride('ParamEyeLSmile', 1.0, env);
      this.setOverride('ParamEyeROpen', 1.18, env * 0.85);
      this.setOverride('ParamEyeRSmile', 0.25, env * 0.6);
      this.setOverride('ParamCheek', 0.72 * env, 0.95);
      this.setOverride('ParamMouthForm', 0.52 * env, 0.85);
      if (!isSpeaking) {
        this.setOverride('ParamMouthOpenY', 0.74 * env, 0.92);
        this.setOverride('ParamTongueOut', 0.96 * env, 0.96);
      }
      windBoostX = -bounce * 18 * env;
    }

    return { windBoostX, windBoostY };
  }

  private applyMultiVowelLipSync(
    level: number,
    dt: number,
    spectral?: SpectralHint,
  ): void {
    const active = level > 0.02;
    let ta = 0, ti = 0, tu = 0, te = 0, to = 0;
    if (active) {
      const low = spectral?.low ?? 0.35;
      const mid = spectral?.mid ?? 0.55;
      const high = spectral?.high ?? 0.3;
      const total = low + mid + high + 0.001;
      const nl = low / total;
      const nm = mid / total;
      const nh = high / total;
      // Blend real spectral formant ratios with smooth syllable cadence so vowels stay lively
      const cad = Math.sin(this.elapsed * 11.5);
      ta = clamp((nm * 1.15 + Math.max(0, cad) * 0.25) * level * 1.15, 0, 1);
      to = clamp((nl * 1.1 + Math.max(0, -cad) * 0.2) * level * 0.95, 0, 0.9);
      ti = clamp((nh * 1.25) * level * 0.9, 0, 0.85);
      te = clamp((nm * 0.55 + nh * 0.45) * level * 0.75, 0, 0.8);
      tu = clamp((nl * 0.7) * level * 0.65, 0, 0.7);
    }

    const rate = 1 - Math.exp(-dt * (active ? 20 : 14));
    this.smoothVowels.a += (ta - this.smoothVowels.a) * rate;
    this.smoothVowels.i += (ti - this.smoothVowels.i) * rate;
    this.smoothVowels.u += (tu - this.smoothVowels.u) * rate;
    this.smoothVowels.e += (te - this.smoothVowels.e) * rate;
    this.smoothVowels.o += (to - this.smoothVowels.o) * rate;

    if (active || this.smoothVowels.a > 0.015 || this.smoothVowels.o > 0.015) {
      this.setOverride('ParamA', this.smoothVowels.a, 0.92);
      this.setOverride('ParamI', this.smoothVowels.i, 0.85);
      this.setOverride('ParamU', this.smoothVowels.u, 0.85);
      this.setOverride('ParamE', this.smoothVowels.e, 0.85);
      this.setOverride('ParamO', this.smoothVowels.o, 0.9);
      this.setOverride('ParamJawOpen', clamp(level * 0.75, 0, 1), 0.75);
    }
  }

  updateAndDraw(
    frame: AvatarFrame,
    dt: number,
    reducedMotion = false,
    spectral?: SpectralHint,
  ): void {
    if (this.disposed || this.canvas.hidden) return;
    const step = clamp(dt, 0.001, 0.1);
    if (!reducedMotion) this.elapsed += step;

    // Smooth mouth lip-sync envelope with fast attack & natural release
    const targetMouth = clamp(frame.mouth * 1.35, 0, 1);
    const lerpRate = targetMouth > this.smoothMouth ? 0.58 : 0.3;
    this.smoothMouth += (targetMouth - this.smoothMouth) * lerpRate;
    const lipLevel = this.smoothMouth < 0.015 ? 0 : this.smoothMouth;
    this.player.lipSync(lipLevel);

    if (frame.mood !== this.lastMood) {
      this.lastMood = frame.mood;
      this.syncBuiltinExpression(frame.mood);
    }

    if (frame.gesture && frame.gesture !== this.lastGesture) {
      this.triggerGesture(frame.gesture);
    }
    this.lastGesture = frame.gesture;

    // Clear previous frame's overrides so released parameters return seamlessly to rest
    this.clearOverrides();

    // Layer 1: Manual expression preset (if user pinned Smile/Shy/Surprised/Sleepy/Cheeky)
    this.applyPresetOverrides(this.expressionPreset, lipLevel > 0.02);

    // Layer 2: Multi-vowel formant lip-sync when audio is actively playing
    this.applyMultiVowelLipSync(lipLevel, step, spectral);

    // Layer 3: Active gesture choreography & smooth 3-way hand pose switching
    const { windBoostX, windBoostY } = this.applyGestureChoreography(frame, step, reducedMotion);

    // Gaze & head tracking (p2l.js uses x right [-1..1], y up [-1..1])
    const gx = clamp(frame.gazeX, -1, 1);
    const gy = clamp(-frame.gazeY, -1, 1);
    const moodTiltX = frame.mood === 'thinking' ? 0.22 : frame.mood === 'looking' ? -0.18 : 0;
    const moodTiltY = frame.mood === 'thinking' ? 0.16 : frame.mood === 'interrupted' ? -0.12 : 0;
    this.player.lookAt(
      clamp(gx * 0.85 + moodTiltX, -1, 1),
      clamp(gy * 0.78 + moodTiltY, -1, 1),
    );

    // Real Cubism pendulum wind (p2l_physics_wind) + XPBD sim wind when available!
    if (!reducedMotion) {
      const breezeX = gx * 14 + Math.sin(this.elapsed * 1.15) * (9 + lipLevel * 18) + windBoostX;
      const breezeY = Math.cos(this.elapsed * 0.85) * 4 + windBoostY;
      if (this.rt?.p2l_physics_wind && this.rigHandle) {
        try { this.rt.p2l_physics_wind(this.rigHandle, breezeX * 0.015, breezeY * 0.015); } catch { /* ignore */ }
      }
      if (this.player.advancedFeatures) {
        try { this.player.wind(breezeX, breezeY); } catch { /* ignore */ }
      }
    }

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
