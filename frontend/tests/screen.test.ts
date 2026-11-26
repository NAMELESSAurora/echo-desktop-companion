import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScreenSource } from '../src/screen';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
function mockElements() {
  const context = { clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), roundRect: vi.fn(), fill: vi.fn(), arc: vi.fn(), fillText: vi.fn() };
  const video = { srcObject: null, play: vi.fn(async () => {}), videoWidth: 100, videoHeight: 100 };
  const canvas = { width: 1280, height: 800, getContext: () => context };
  return { video: video as unknown as HTMLVideoElement, canvas: canvas as unknown as HTMLCanvasElement };
}
afterEach(() => vi.unstubAllGlobals());

describe('screen permission lifecycle', () => {
  it('revokes after a pending grant and never restores a stopped source', async () => {
    const elements = mockElements(); const grant = deferred<{epoch: number}>(); const calls: boolean[] = [];
    const changed = vi.fn();
    const source = new ScreenSource(elements.video, elements.canvas, async (_, enabled) => {
      calls.push(enabled); return enabled ? grant.promise : { epoch: 2 };
    }, changed, vi.fn(), vi.fn());
    const enabling = source.useSample('s'); await tick();
    expect(changed.mock.calls.at(-1)![0]).toMatchObject({ kind: 'choosing', ready: false });
    const stopping = source.stop();
    expect(source.available).toBe(false);
    grant.resolve({ epoch: 1 }); await enabling; await stopping;
    expect(calls).toEqual([true, false]);
    expect(source.available).toBe(false);
    expect(changed.mock.calls.at(-1)![0].kind).toBe('off');
  });
  it('stops a stream returned after the chooser was cancelled locally', async () => {
    const pending = deferred<MediaStream>();
    vi.stubGlobal('navigator', { mediaDevices: { getDisplayMedia: () => pending.promise } });
    const elements = mockElements(); const track = { stop: vi.fn(), onended: null };
    const source = new ScreenSource(elements.video, elements.canvas, vi.fn(async () => ({ epoch: 1 })), vi.fn(), vi.fn(), vi.fn());
    const choosing = source.chooseWindow('s'); await source.stop();
    pending.resolve({ getTracks: () => [track] } as unknown as MediaStream); await choosing;
    expect(track.stop).toHaveBeenCalledOnce(); expect(source.available).toBe(false);
  });
  it('stops media tracks and clears preview when sharing ends', async () => {
    const track = { stop: vi.fn(), onended: null as (() => void) | null, label: 'Synthetic window' };
    const media = { getTracks: () => [track], getVideoTracks: () => [track] };
    vi.stubGlobal('navigator', { mediaDevices: { getDisplayMedia: async () => media } });
    const e = mockElements(); const policy = vi.fn(async (_sid: string, _enabled: boolean) => ({ epoch: 1 }));
    const source = new ScreenSource(e.video, e.canvas, policy, vi.fn(), vi.fn(), vi.fn());
    await source.chooseWindow('s'); expect(source.available).toBe(true);
    track.onended!(); await tick(); await tick();
    expect(source.available).toBe(false); expect(e.video.srcObject).toBeNull();
    expect(track.stop).toHaveBeenCalled(); expect(policy.mock.calls.at(-1)![1]).toBe(false);
  });
});
