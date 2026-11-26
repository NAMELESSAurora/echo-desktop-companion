/**
 * 4-tier performance controller (`high | medium | low | reduced`) ported from
 * NAMELESSAurora/lumen-folio, with automatic WebGL2 / reduced-motion detection
 * and gentle FPS watchdog that ignores background tab pauses.
 */

export type PerformanceTier = 'high' | 'medium' | 'low' | 'reduced';

export interface PerformanceSnapshot {
  tier: PerformanceTier;
  detectedTier: PerformanceTier;
  override: PerformanceTier | null;
  fps: number;
}

const CYCLE_ORDER: Array<PerformanceTier | null> = ['high', 'medium', 'low', 'reduced', null];

export function detectHardwareTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'low';
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'reduced';

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return 'low';

  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) return 'low';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return 'low';
  }

  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const small = window.innerWidth < 768;

  if (cores <= 2 || mem <= 2) return 'low';
  if (coarse || small || cores <= 4 || mem <= 4) return 'medium';
  return 'high';
}

export class PerformanceController {
  private detectedTier: PerformanceTier;
  private override: PerformanceTier | null = null;
  private fps = 60;
  private rafId = 0;
  private media: MediaQueryList | null = null;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(private onChange: (snapshot: PerformanceSnapshot) => void) {
    this.detectedTier = detectHardwareTier();
  }

  get snapshot(): PerformanceSnapshot {
    return {
      tier: this.override ?? this.detectedTier,
      detectedTier: this.detectedTier,
      override: this.override,
      fps: this.fps,
    };
  }

  start() {
    this.onChange(this.snapshot);
    if (typeof window === 'undefined') return;
    this.media = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    if (this.media) {
      this.mediaListener = (e: MediaQueryListEvent) => {
        this.detectedTier = e.matches ? 'reduced' : detectHardwareTier();
        this.onChange(this.snapshot);
      };
      this.media.addEventListener('change', this.mediaListener);
    }

    let frames = 0;
    let lowStreak = 0;
    let lastSample = performance.now();

    const tick = (now: number) => {
      frames += 1;
      const elapsed = now - lastSample;
      if (elapsed >= 1000) {
        const paused = document.hidden || elapsed > 2400;
        const currentFps = Math.min(Math.round((frames * 1000) / elapsed), 144);
        frames = 0;
        lastSample = now;
        if (!paused) {
          this.fps = currentFps;
          if (currentFps < 20) {
            lowStreak += 1;
            if (lowStreak >= 5) {
              this.detectedTier =
                this.detectedTier === 'high' ? 'medium' : this.detectedTier === 'medium' ? 'low' : this.detectedTier;
              lowStreak = 0;
            }
          } else {
            lowStreak = 0;
          }
          this.onChange(this.snapshot);
        } else {
          lowStreak = 0;
        }
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  cycleOverride(): PerformanceSnapshot {
    const idx = CYCLE_ORDER.indexOf(this.override);
    this.override = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    const snap = this.snapshot;
    this.onChange(snap);
    return snap;
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    if (this.media && this.mediaListener) {
      this.media.removeEventListener('change', this.mediaListener);
    }
  }
}
