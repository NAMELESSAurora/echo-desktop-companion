import { describe, expect, it, vi } from 'vitest';
import { PcmPlayer } from '../src/audio';

function fakeContext() {
  const nodes: { stop: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; onended: (() => void) | null; buffer?: unknown }[] = [];
  let samples = new Float32Array();
  const ctx = {
    state: 'running', currentTime: 1, destination: {}, resume: vi.fn(async () => {}),
    createGain: () => ({ gain: { value: 0 }, connect: vi.fn() }),
    createAnalyser: () => ({ fftSize: 0, connect: vi.fn() }),
    createBuffer: (_: number, size: number, rate: number) => {
      samples = new Float32Array(size);
      return { duration: size / rate, getChannelData: () => samples };
    },
    createBufferSource: () => {
      const node = { connect: vi.fn(), disconnect: vi.fn(), stop: vi.fn(), start: vi.fn(), onended: null, buffer: undefined };
      nodes.push(node); return node;
    },
  };
  return { ctx: ctx as unknown as AudioContext, nodes, samples: () => samples };
}

describe('PCM playback', () => {
  it('decodes signed little-endian samples and schedules contiguous buffers', async () => {
    const f = fakeContext(); const changed = vi.fn();
    const player = new PcmPlayer(changed, () => f.ctx);
    await player.unlock(); player.begin('a');
    player.push('a', btoa(String.fromCharCode(0,128,255,127,0,0)));
    expect([...f.samples()]).toEqual([-1, 32767 / 32768, 0]);
    player.push('a', btoa('\0\0'));
    const first = f.nodes[0].start.mock.calls[0][0];
    expect(f.nodes[1].start.mock.calls[0][0]).toBeCloseTo(first + 3 / 24000, 8);
  });
  it('stops every scheduled node and ignores stale turns and muted chunks', async () => {
    const f = fakeContext(); const player = new PcmPlayer(vi.fn(), () => f.ctx);
    await player.unlock(); player.begin('a'); player.push('a', btoa('\0\0'));
    player.begin('b');
    expect(f.nodes[0].stop).toHaveBeenCalledOnce();
    player.push('a', btoa('\0\0'));
    expect(f.nodes).toHaveLength(1);
    player.setEnabled(false); player.push('b', btoa('\0\0'));
    expect(f.nodes).toHaveLength(1);
  });
  it('rejects partial PCM samples instead of playing corrupt data', async () => {
    const f = fakeContext(); const player = new PcmPlayer(vi.fn(), () => f.ctx);
    await player.unlock(); player.begin('a');
    expect(() => player.push('a', btoa('\0'))).toThrow('invalid_audio_chunk');
  });
  it('tracks per-chunk metadata, emits onChunkEnded, and calculates played_audio_ms on barge-in', async () => {
    const f = fakeContext();
    const ended: string[] = [];
    const player = new PcmPlayer(vi.fn(), () => f.ctx);
    player.onChunkEnded = meta => ended.push(meta.chunkId);
    await player.unlock();
    player.begin('run-1:turn-1', 24000);

    // 2400 samples @ 24 kHz = 100 ms per chunk (4800 bytes)
    const pcm100ms = new Uint8Array(4800);
    expect(player.pushPcm('run-1:turn-1', pcm100ms, { runId: 'run-1', turnId: 'turn-1', chunkId: 'c1' })).toBe(true);
    expect(player.pushPcm('run-1:turn-1', pcm100ms, { runId: 'run-1', turnId: 'turn-1', chunkId: 'c2' })).toBe(true);
    expect(player.pushPcm('run-1:turn-1', pcm100ms, { runId: 'run-1', turnId: 'turn-1', chunkId: 'c3' })).toBe(true);

    // c1 starts at 1.025 -> ends 1.125; c2 starts 1.125 -> ends 1.225; c3 starts 1.225 -> ends 1.325
    // Advance clock to 1.170 (c1 finished, c2 played 45 ms, c3 not started)
    (f.ctx as unknown as { currentTime: number }).currentTime = 1.17;
    const progress = player.stopWithProgress();
    expect(progress.completed.map(c => c.chunkId)).toEqual(['c1']);
    expect(progress.interrupted?.chunkId).toBe('c2');
    expect(progress.playedAudioMs).toBe(45);
    expect(ended).toEqual([]);
    expect(f.nodes[0].stop).toHaveBeenCalledOnce();
    expect(f.nodes[1].stop).toHaveBeenCalledOnce();
    expect(f.nodes[2].stop).toHaveBeenCalledOnce();
  });
});
