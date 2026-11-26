import { describe, expect, it, vi } from 'vitest';
import { SfxEngine } from '../src/sfx';

function createFakeSfxContext() {
  const oscStarts = vi.fn();
  const bufStarts = vi.fn();
  const ctx = {
    state: 'running',
    currentTime: 1.0,
    sampleRate: 48000,
    destination: {},
    resume: vi.fn(async () => {}),
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }),
    createOscillator: () => ({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: oscStarts,
      stop: vi.fn(),
    }),
    createBuffer: (_: number, len: number) => ({
      getChannelData: () => new Float32Array(len),
    }),
    createBufferSource: () => ({
      buffer: null,
      connect: vi.fn(),
      start: bufStarts,
      stop: vi.fn(),
    }),
    createBiquadFilter: () => ({
      type: 'bandpass',
      frequency: { setValueAtTime: vi.fn() },
      Q: { value: 1 },
      connect: vi.fn(),
    }),
  };
  return { ctx: ctx as unknown as AudioContext, oscStarts, bufStarts };
}

describe('SfxEngine procedural WebAudio cues', () => {
  it('synthesizes cues when enabled and stays completely silent when disabled', () => {
    const fake = createFakeSfxContext();
    const sfx = new SfxEngine(() => fake.ctx);
    sfx.setEnabled(true);
    sfx.setVolume(0.6);

    sfx.play('langSwitch');
    expect(fake.oscStarts).toHaveBeenCalledTimes(3);

    sfx.play('skyShift');
    expect(fake.bufStarts).toHaveBeenCalledTimes(1);

    fake.oscStarts.mockClear();
    sfx.setEnabled(false);
    sfx.play('callConnect');
    expect(fake.oscStarts).not.toHaveBeenCalled();
  });
});
