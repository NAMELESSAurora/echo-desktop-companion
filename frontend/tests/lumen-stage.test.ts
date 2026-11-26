import { describe, expect, it, vi } from 'vitest';
import type { AvatarMood } from '../src/avatar-state';
import { LIQUID_GLASS_PRESETS, LiquidGlassRegistry } from '../src/liquid-glass';
import { PerformanceController } from '../src/performance-tier';
import {
  MOOD_ATMOSPHERES,
  STAGE_SKIES,
  computePaintPigments,
  hexToRgbNormalized,
} from '../src/stage-skies';

describe('Lumen Folio stage design subsystems', () => {
  it('provides valid RGB normalization and Beer-Lambert pigment vectors', () => {
    expect(hexToRgbNormalized('#FF0080')).toEqual([1, 0, 128 / 255]);
    const pigments = computePaintPigments('#2D5DA8', '#D85A7F');
    for (const vec of Object.values(pigments)) {
      expect(vec).toHaveLength(3);
      for (const component of vec) {
        expect(Number.isFinite(component)).toBe(true);
        expect(component).toBeGreaterThan(0);
      }
    }
    expect(STAGE_SKIES.map(s => s.id)).toEqual(['pale', 'deep', 'eclipse', 'nebula', 'dawn']);
    expect(STAGE_SKIES[0].appearance).toBe('light');
    expect(STAGE_SKIES.slice(1).every(s => s.appearance === 'dark')).toBe(true);
  });

  it('maps every avatar mood to an Earned Color atmosphere plate', () => {
    const moods: AvatarMood[] = [
      'offline', 'idle', 'thinking', 'looking', 'replying', 'speaking', 'interrupted', 'error',
    ];
    for (const mood of moods) {
      const atmo = MOOD_ATMOSPHERES[mood];
      expect(atmo.plateCode).toMatch(/^PLATE_0[0-4]$/);
      expect(atmo.primaryPigment).toMatch(/^#[0-9A-F]{6}$/i);
      expect(atmo.secondaryPigment).toMatch(/^#[0-9A-F]{6}$/i);
      expect(atmo.signalAccent).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('registers, updates, and unregisters Liquid Glass primitives cleanly', () => {
    const registry = new LiquidGlassRegistry();
    const unregA = registry.register({
      id: 'dock-bar', element: null, edgeShape: 'convex', mergeGroup: 1, priority: 80,
    });
    const unregB = registry.register({
      id: 'dock-orb', element: null, edgeShape: 'lip', mergeGroup: 1, priority: 82,
    });
    expect(registry.list()).toHaveLength(2);
    registry.update('dock-bar', { overrideDispersion: 0.72 });
    expect(registry.list().find(e => e.id === 'dock-bar')?.overrideDispersion).toBe(0.72);
    unregA();
    expect(registry.list().map(e => e.id)).toEqual(['dock-orb']);
    unregB();
    expect(registry.list()).toHaveLength(0);
    expect(Object.keys(LIQUID_GLASS_PRESETS)).toEqual(['apple', 'thick', 'prism', 'frosted']);
  });

  it('cycles performance tier overrides cleanly in headless environment', () => {
    const updates = vi.fn();
    const controller = new PerformanceController(updates);
    expect(controller.snapshot.tier).toBe('low');
    expect(controller.cycleOverride().tier).toBe('high');
    expect(controller.cycleOverride().tier).toBe('medium');
    expect(controller.cycleOverride().tier).toBe('low');
    expect(controller.cycleOverride().tier).toBe('reduced');
    expect(controller.cycleOverride().override).toBeNull();
    expect(updates).toHaveBeenCalledTimes(5);
  });
});
