import { describe, expect, it } from 'vitest';
import { AvatarState, extractSpectralHint, mouthTarget, rms } from '../src/avatar-state';

function state() { const model = new AvatarState(); model.setConnected(true); return model; }

describe('avatar realtime state', () => {
  it('uses turn events for thinking and vision, never opens its mouth from text alone', () => {
    const m = state(); m.begin('a', false);
    expect(m.frame(1, .03, 1).mood).toBe('thinking');
    expect(m.frame(1.1, .03, 1).mouth).toBe(0);
    m.text('a'); expect(m.frame(1.2, .03, 1).mood).toBe('replying');
    m.complete('a'); expect(m.frame(1.3, .03, 1).mood).toBe('idle');
    m.begin('b', true); expect(m.frame(1.4, .03, 0).mood).toBe('looking');
  });
  it('stays speaking until playback drains, even after generation completed', () => {
    const m = state(); m.begin('a', false); m.playback(true); m.complete('a');
    const frame = m.frame(1, .1, .025);
    expect(frame.mood).toBe('speaking'); expect(frame.mouth).toBeGreaterThan(.5);
    m.playback(false);
    expect(m.frame(1.1, .03, .025)).toMatchObject({ mood: 'idle', mouth: 0 });
  });
  it('interrupts immediately and ignores old completion and late playback', () => {
    const m = state(); m.begin('a', false); m.playback(true); m.frame(1, .1, .1);
    m.interrupt('a', 1.1); m.playback(true); m.complete('a');
    expect(m.frame(1.2, .03, 1)).toMatchObject({ mood: 'interrupted', mouth: 0 });
    m.begin('b', false); m.complete('a'); m.interrupt('a', 1.3);
    expect(m.frame(1.4, .03, 1)).toMatchObject({ mood: 'thinking', mouth: 0 });
  });
  it('replay re-enables audio interaction after interruption', () => {
    const m = state(); m.begin('a', false); m.interrupt('a', 1);
    m.replay(); m.playback(true);
    expect(m.frame(1.1, .1, .1).mood).toBe('speaking');
  });
  it('clears mouth and gestures on new session, failure and disconnect', () => {
    const m = state(); m.begin('a', false); m.act('wave', 1); m.playback(true);
    m.fail('a'); expect(m.frame(1.1, .03, 1)).toMatchObject({ mood: 'error', mouth: 0, gesture: null });
    m.reset(); expect(m.frame(1.2, .03, 1).mood).toBe('idle');
    m.setConnected(false); expect(m.frame(1.3, .03, 1)).toMatchObject({ mood: 'offline', mouth: 0 });
  });
  it('supports expanded Live2D gestures (think, headpat, poke) with tuned durations', () => {
    const m = state();
    m.act('think', 1);
    expect(m.frame(2.5, .03, 0)).toMatchObject({ gesture: 'think' });
    expect(m.frame(4.2, .03, 0).gesture).toBeNull();

    m.act('headpat', 5);
    const pat = m.frame(6.0, .03, 0);
    expect(pat.gesture).toBe('headpat');
    expect(pat.happy).toBeGreaterThan(.85);
    expect(m.frame(7.6, .03, 0).gesture).toBeNull();

    m.act('poke', 8);
    expect(m.frame(9.0, .03, 0).gesture).toBe('poke');
    expect(m.frame(10.2, .03, 0).gesture).toBeNull();
  });
  it('respects reduced motion and bounds pointer tracking', () => {
    const m = state(); m.look(10, -10); m.act('nod', 1);
    const f = m.frame(1.4, .1, 0);
    expect(f.gazeX).toBeLessThanOrEqual(1); expect(f.gazeY).toBeGreaterThanOrEqual(-1);
    expect(f.gesture).toBe('nod');
    expect(m.frame(1.5, .1, 0, true)).toMatchObject({ gazeX: 0, gazeY: 0, breath: 0, blink: 0 });
    expect(m.frame(3, .1, 0).gesture).toBeNull();
  });
  it('measures real audio energy, rejects silence, and extracts spectral formants', () => {
    expect(rms(new Float32Array([.5, -.5]))).toBeCloseTo(.5);
    expect(rms(new Float32Array())).toBe(0);
    expect(mouthTarget(.001)).toBe(0);
    expect(mouthTarget(1)).toBe(1);
    const bins = new Uint8Array(64);
    bins.fill(255, 0, 8);
    const hint = extractSpectralHint(bins);
    expect(hint.low).toBeGreaterThan(0.9);
    expect(hint.high).toBe(0);
  });
});
