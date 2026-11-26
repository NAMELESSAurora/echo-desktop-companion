/**
 * Zero-rerender registry for GPU Analytical-Gradient SDF Liquid Glass primitives.
 * Ported from NAMELESSAurora/lumen-folio (Good Machines Lab 03 / Apple WWDC25 optics).
 */

export type GlassPresetId = 'apple' | 'thick' | 'prism' | 'frosted';
export type GlassEdgeShape = 'convex' | 'lip';

export interface GlassPresetConfig {
  id: GlassPresetId;
  label: string;
  refractionPx: number;
  edgeWidthPx: number;
  magnify: number;
  dispersion: number;
  blurMix: number;
  frost: number;
  vibrancy: number;
  brightness: number;
  colorFromBelow: number;
  rimLight: number;
  rimWidthPx: number;
  shadow: number;
  mergeDistancePx: number;
}

export const LIQUID_GLASS_PRESETS: Record<GlassPresetId, GlassPresetConfig> = {
  apple: {
    id: 'apple',
    label: 'Apple 液态玻璃',
    refractionPx: 26,
    edgeWidthPx: 24,
    magnify: 1.06,
    dispersion: 0.24,
    blurMix: 0.28,
    frost: 0.08,
    vibrancy: 1.38,
    brightness: 0.03,
    colorFromBelow: 0.35,
    rimLight: 0.82,
    rimWidthPx: 1.6,
    shadow: 0.32,
    mergeDistancePx: 26,
  },
  thick: {
    id: 'thick',
    label: '厚透镜折射',
    refractionPx: 48,
    edgeWidthPx: 44,
    magnify: 1.24,
    dispersion: 0.45,
    blurMix: 0.04,
    frost: 0.02,
    vibrancy: 1.18,
    brightness: 0.025,
    colorFromBelow: 0.14,
    rimLight: 0.9,
    rimWidthPx: 2.2,
    shadow: 0.44,
    mergeDistancePx: 32,
  },
  prism: {
    id: 'prism',
    label: '棱镜色散',
    refractionPx: 40,
    edgeWidthPx: 36,
    magnify: 1.14,
    dispersion: 0.92,
    blurMix: 0.03,
    frost: 0.015,
    vibrancy: 1.28,
    brightness: 0.03,
    colorFromBelow: 0.12,
    rimLight: 0.95,
    rimWidthPx: 1.85,
    shadow: 0.3,
    mergeDistancePx: 30,
  },
  frosted: {
    id: 'frosted',
    label: '柔和磨砂',
    refractionPx: 14,
    edgeWidthPx: 16,
    magnify: 1.0,
    dispersion: 0.06,
    blurMix: 0.9,
    frost: 0.22,
    vibrancy: 1.4,
    brightness: 0.045,
    colorFromBelow: 0.55,
    rimLight: 0.52,
    rimWidthPx: 1.3,
    shadow: 0.26,
    mergeDistancePx: 18,
  },
};

export interface ManualGlassRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  active?: boolean;
}

export interface GlassPrimitiveEntry {
  id: string;
  element: HTMLElement | null;
  manualRect?: () => ManualGlassRect | null;
  radius?: number | 'pill';
  edgeShape: GlassEdgeShape;
  mergeGroup: number;
  priority: number;
  overrideRefraction?: number;
  overrideDispersion?: number;
  overrideBlurMix?: number;
  overrideFrost?: number;
}

export class LiquidGlassRegistry {
  private entries = new Map<string, GlassPrimitiveEntry>();

  register(entry: GlassPrimitiveEntry): () => void {
    this.entries.set(entry.id, entry);
    return () => {
      this.entries.delete(entry.id);
    };
  }

  update(id: string, patch: Partial<GlassPrimitiveEntry>): void {
    const existing = this.entries.get(id);
    if (existing) this.entries.set(id, { ...existing, ...patch });
  }

  list(): GlassPrimitiveEntry[] {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
  }
}

export const glassRegistry = new LiquidGlassRegistry();
