import { describe, expect, it } from 'vitest';
import { AvatarState, mouthTarget, rms } from '../src/avatar-state';

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
  it('respects reduced motion and bounds pointer tracking', () => {
    const m = state(); m.look(10, -10); m.act('nod', 1);
    const f = m.frame(1.4, .1, 0);
    expect(f.gazeX).toBeLessThanOrEqual(1); expect(f.gazeY).toBeGreaterThanOrEqual(-1);
    expect(f.gesture).toBe('nod');
    expect(m.frame(1.5, .1, 0, true)).toMatchObject({ gazeX: 0, gazeY: 0, breath: 0, blink: 0 });
    expect(m.frame(3, .1, 0).gesture).toBeNull();
  });
  it('measures real audio energy and rejects silence', () => {
    expect(rms(new Float32Array([.5, -.5]))).toBeCloseTo(.5);
    expect(rms(new Float32Array())).toBe(0);
    expect(mouthTarget(.001)).toBe(0);
    expect(mouthTarget(1)).toBe(1);
  });
});
