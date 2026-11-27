import { describe, expect, it, vi } from 'vitest';
import {
  EXPRESSION_PRESET_ORDER,
  getExpressionLabel,
  MAX_P2LRT_BYTES,
  P2LLive2DController,
} from '../src/p2l-driver';
import type { AvatarFrame } from '../src/avatar-state';

function makeFrame(overrides: Partial<AvatarFrame> = {}): AvatarFrame {
  return {
    mood: 'idle',
    mouth: 0,
    blink: 0,
    gazeX: 0,
    gazeY: 0,
    breath: 0,
    gesture: null,
    gestureProgress: 0,
    happy: 0,
    ...overrides,
  };
}

function makeMockPlayer(withMultiPose = true) {
  const paramDefs = withMultiPose
    ? [
        { id: 'ParamAngleX', min: -45, max: 45, default: 0 },
        { id: 'ParamAngleY', min: -30, max: 30, default: 0 },
        { id: 'ParamAngleZ', min: -30, max: 30, default: 0 },
        { id: 'ParamBodyAngleY', min: -10, max: 10, default: 0 },
        { id: 'ParamBodyAngleZ', min: -10, max: 10, default: 0 },
        { id: 'ParamEyeLOpen', min: 0, max: 2, default: 1 },
        { id: 'ParamEyeROpen', min: 0, max: 2, default: 1 },
        { id: 'ParamEyeLSmile', min: 0, max: 1, default: 0 },
        { id: 'ParamEyeRSmile', min: 0, max: 1, default: 0 },
        { id: 'ParamCheek', min: 0, max: 1, default: 0 },
        { id: 'ParamMouthOpenY', min: 0, max: 1, default: 0 },
        { id: 'ParamMouthForm', min: -1, max: 1, default: 0 },
        { id: 'ParamTongueOut', min: 0, max: 1, default: 0 },
        { id: 'ParamA', min: 0, max: 1, default: 0 },
        { id: 'ParamI', min: 0, max: 1, default: 0 },
        { id: 'ParamU', min: 0, max: 1, default: 0 },
        { id: 'ParamE', min: 0, max: 1, default: 0 },
        { id: 'ParamO', min: 0, max: 1, default: 0 },
        { id: 'ParamJawOpen', min: 0, max: 1, default: 0 },
        { id: 'ParamHandPose', min: 0, max: 2, default: 0 },
        { id: 'ParamWaveSwing', min: -1, max: 1, default: 0 },
        { id: 'ParamThinkSway', min: -1, max: 1, default: 0 },
      ]
    : [];

  const overrides = new Map<string, { value: number; weight: number }>();
  const rt = {
    p2l_play_layer: vi.fn(),
    p2l_set_parameter_override: vi.fn((_rig: number, idx: number, val: number, w: number) => {
      const def = paramDefs[idx];
      if (def) overrides.set(def.id, { value: val, weight: w });
    }),
    p2l_clear_parameter_overrides: vi.fn(() => overrides.clear()),
    p2l_physics_wind: vi.fn(),
    p2l_behavior_strength: vi.fn(),
    p2l_blink_settings: vi.fn(),
  };

  return {
    overrides,
    rt,
    player: {
      width: 1280,
      height: 1280,
      rig: 42,
      rt,
      clips: withMultiPose ? [] : ['Idle', 'Nod', 'Wave'],
      parameters: paramDefs.map(p => p.id),
      expressions: ['smile', 'shy', 'surprised', 'sleepy', 'sad'],
      hitAreas: ['HitAreaHead', 'HitAreaFace', 'HitAreaBody'],
      advancedFeatures: 7,
      view: { zoom: 1, x: 0, y: 0 },
      play: vi.fn(),
      expression: vi.fn(),
      setAdvanced: vi.fn(() => 7),
      hitTest: vi.fn(() => 'HitAreaHead'),
      lookAt: vi.fn(),
      lipSync: vi.fn(),
      setParameter: vi.fn(),
      parameterRanges: vi.fn(() => paramDefs),
      parameterValues: vi.fn(() => paramDefs.map(p => p.default)),
      wind: vi.fn(),
      behaviors: vi.fn(),
      resetSimulation: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      update: vi.fn(),
      draw: vi.fn(),
      dispose: vi.fn(),
    },
  };
}

describe('P2LLive2DController', () => {
  it('rejects empty or oversized .p2lrt buffers before touching WebAssembly', async () => {
    const canvas = { hidden: false } as unknown as HTMLCanvasElement;
    await expect(P2LLive2DController.loadFromBytes(canvas, new ArrayBuffer(4))).rejects.toThrow('无效');
    const fakeHuge = { byteLength: MAX_P2LRT_BYTES + 1 } as ArrayBuffer;
    await expect(P2LLive2DController.loadFromBytes(canvas, fakeHuge)).rejects.toThrow('64 MB');
  });

  it('drives multi-pose hand switching, wrist wave, headpat blush, poke wink/blep, and 5-vowel lip-sync', () => {
    const { player, rt, overrides } = makeMockPlayer(true);
    const canvas = { hidden: false } as unknown as HTMLCanvasElement;
    const CtrlCtor = P2LLive2DController as unknown as new (
      p: typeof player,
      c: HTMLCanvasElement,
    ) => P2LLive2DController;
    const ctrl = new CtrlCtor(player, canvas);

    expect(rt.p2l_behavior_strength).toHaveBeenCalled();
    expect(rt.p2l_blink_settings).toHaveBeenCalled();

    // 1. Wave switches ParamHandPose toward 1 and swings ParamWaveSwing
    for (let i = 0; i < 8; i++) {
      ctrl.updateAndDraw(makeFrame({ gesture: 'wave', gestureProgress: 0.35 }), 0.05, false);
    }
    expect(overrides.get('ParamHandPose')?.value).toBeGreaterThan(0.8);
    expect(Math.abs(overrides.get('ParamWaveSwing')?.value ?? 0)).toBeGreaterThan(0.1);
    expect(rt.p2l_physics_wind).toHaveBeenCalled();

    // 2. Thinking mood automatically raises ParamHandPose toward 2 (chin-rest!)
    for (let i = 0; i < 12; i++) {
      ctrl.updateAndDraw(makeFrame({ mood: 'thinking' }), 0.05, false);
    }
    expect(overrides.get('ParamHandPose')?.value).toBeGreaterThan(1.7);

    // 3. Headpat closes eyes into smiling crescents with full anime blush
    ctrl.updateAndDraw(makeFrame({ gesture: 'headpat', gestureProgress: 0.5 }), 0.033, false);
    expect(overrides.get('ParamEyeLOpen')?.value).toBe(0);
    expect(overrides.get('ParamEyeLSmile')?.value).toBe(1);
    expect(overrides.get('ParamCheek')?.value).toBeGreaterThan(0.9);

    // 4. Poke winks left eye and sticks tongue out (blep!)
    ctrl.updateAndDraw(makeFrame({ gesture: 'poke', gestureProgress: 0.5 }), 0.033, false);
    expect(overrides.get('ParamEyeLOpen')?.value).toBe(0);
    expect(overrides.get('ParamTongueOut')?.value).toBeGreaterThan(0.8);

    // 5. Speaking with spectral formants drives vowels A/I/U/E/O
    ctrl.updateAndDraw(
      makeFrame({ mood: 'speaking', mouth: 0.75 }),
      0.033,
      false,
      { low: 0.1, mid: 0.85, high: 0.2 },
    );
    expect(overrides.get('ParamA')?.value).toBeGreaterThan(0.15);

    // 6. Manual expression preset pins shy blush
    ctrl.setExpressionPreset('shy');
    expect(ctrl.getExpressionPreset()).toBe('shy');
    ctrl.updateAndDraw(makeFrame({ mood: 'idle' }), 0.033, false);
    expect(overrides.get('ParamCheek')?.value).toBeGreaterThan(0.9);
    expect(EXPRESSION_PRESET_ORDER.map(getExpressionLabel)).toContain('害羞');

    // 7. Reduced motion halts step progression and skips wind
    rt.p2l_physics_wind.mockClear();
    player.wind.mockClear();
    ctrl.updateAndDraw(makeFrame({ mood: 'idle' }), 0.033, true);
    expect(rt.p2l_physics_wind).not.toHaveBeenCalled();
    expect(player.wind).not.toHaveBeenCalled();
    expect(player.update).toHaveBeenLastCalledWith(0);

    expect(ctrl.hitTest(10, 20)).toBe('HitAreaHead');
    ctrl.setExpanded(true);
    expect(player.view.zoom).toBeLessThan(1.45);

    ctrl.dispose();
    expect(player.dispose).toHaveBeenCalledTimes(1);
    player.draw.mockClear();
    ctrl.updateAndDraw(makeFrame(), 0.033, false);
    expect(player.draw).not.toHaveBeenCalled();
  });

  it('keeps Idle looping on Layer 0 and plays one-shot gestures on Layer 1 for clip-based third-party models', () => {
    const { player, rt } = makeMockPlayer(false);
    const canvas = { hidden: false } as unknown as HTMLCanvasElement;
    const CtrlCtor = P2LLive2DController as unknown as new (
      p: typeof player,
      c: HTMLCanvasElement,
    ) => P2LLive2DController;
    const ctrl = new CtrlCtor(player, canvas);

    expect(rt.p2l_play_layer).toHaveBeenCalledWith(42, 0, 0, 1);
    ctrl.updateAndDraw(makeFrame({ gesture: 'wave', gestureProgress: 0.2 }), 0.033, false);
    expect(rt.p2l_play_layer).toHaveBeenCalledWith(42, 1, 2, 2);
    ctrl.dispose();
  });
});
