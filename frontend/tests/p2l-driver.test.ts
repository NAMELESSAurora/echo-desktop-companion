import { describe, expect, it, vi } from 'vitest';
import { MAX_P2LRT_BYTES, P2LLive2DController } from '../src/p2l-driver';
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

describe('P2LLive2DController', () => {
  it('rejects empty or oversized .p2lrt buffers before touching WebAssembly', async () => {
    const canvas = { hidden: false } as unknown as HTMLCanvasElement;
    await expect(P2LLive2DController.loadFromBytes(canvas, new ArrayBuffer(4))).rejects.toThrow('无效');
    const fakeHuge = { byteLength: MAX_P2LRT_BYTES + 1 } as ArrayBuffer;
    await expect(P2LLive2DController.loadFromBytes(canvas, fakeHuge)).rejects.toThrow('64 MB');
  });

  it('drives lipSync, inverted-Y lookAt, gestures, wind, and reducedMotion cleanly', () => {
    const mockPlayer = {
      width: 636,
      height: 960,
      clips: ['Idle', 'Nod', 'Wave'],
      parameters: [],
      expressions: ['smile', 'surprised', 'sleepy', 'sad'],
      hitAreas: ['HitAreaHead'],
      advancedFeatures: 7,
      view: { zoom: 1, x: 0, y: 0 },
      play: vi.fn(),
      expression: vi.fn(),
      setAdvanced: vi.fn(() => 7),
      hitTest: vi.fn(() => 'HitAreaHead'),
      lookAt: vi.fn(),
      lipSync: vi.fn(),
      setParameter: vi.fn(),
      parameterRanges: vi.fn(() => []),
      parameterValues: vi.fn(() => []),
      wind: vi.fn(),
      behaviors: vi.fn(),
      resetSimulation: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      update: vi.fn(),
      draw: vi.fn(),
      dispose: vi.fn(),
    };
    const canvas = { hidden: false } as unknown as HTMLCanvasElement;
    // Construct via internal constructor for deterministic unit verification
    const CtrlCtor = P2LLive2DController as unknown as new (
      player: typeof mockPlayer,
      canvas: HTMLCanvasElement,
    ) => P2LLive2DController;
    const ctrl = new CtrlCtor(mockPlayer, canvas);

    expect(mockPlayer.setAdvanced).toHaveBeenCalledWith(7);
    expect(mockPlayer.play).toHaveBeenCalledWith('Idle');

    ctrl.updateAndDraw(makeFrame({ mood: 'speaking', mouth: 0.6, gazeX: 0.5, gazeY: -0.5, gesture: 'wave' }), 0.033, false);
    expect(mockPlayer.lipSync).toHaveBeenLastCalledWith(expect.any(Number));
    expect(mockPlayer.lipSync.mock.calls.at(-1)?.[0]).toBeGreaterThan(0.3);
    // gazeY = -0.5 (looking up in screen coords) -> positive Y in p2l coordinates
    const [lx, ly] = mockPlayer.lookAt.mock.calls.at(-1) as [number, number];
    expect(lx).toBeGreaterThan(0.3);
    expect(ly).toBeGreaterThan(0.3);
    expect(mockPlayer.play).toHaveBeenCalledWith('Wave');
    expect(mockPlayer.expression).toHaveBeenCalledWith('smile');
    expect(mockPlayer.wind).toHaveBeenCalled();
    expect(mockPlayer.update).toHaveBeenLastCalledWith(0.033);
    expect(mockPlayer.draw).toHaveBeenCalled();

    ctrl.updateAndDraw(makeFrame({ mood: 'interrupted' }), 0.033, false);
    expect(mockPlayer.expression).toHaveBeenLastCalledWith('surprised');

    // Reduced motion halts step progression and skips ambient wind
    mockPlayer.wind.mockClear();
    ctrl.updateAndDraw(makeFrame({ mood: 'idle' }), 0.033, true);
    expect(mockPlayer.expression).toHaveBeenLastCalledWith(null);
    expect(mockPlayer.wind).not.toHaveBeenCalled();
    expect(mockPlayer.update).toHaveBeenLastCalledWith(0);

    expect(ctrl.hitTest(10, 20)).toBe('HitAreaHead');
    ctrl.setExpanded(true);
    expect(mockPlayer.view.zoom).toBeLessThan(1.3);

    ctrl.dispose();
    expect(mockPlayer.dispose).toHaveBeenCalledTimes(1);
    // Subsequent updates after dispose are no-ops
    mockPlayer.draw.mockClear();
    ctrl.updateAndDraw(makeFrame(), 0.033, false);
    expect(mockPlayer.draw).not.toHaveBeenCalled();
  });
});
