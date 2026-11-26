/**
 * Interactive Lumen Folio UI primitives in pure TypeScript:
 * 1. Architectural 3-plane micro-parallax Drafting Overlay + pointer reticle + 2-frame broadcast flash
 * 2. iOS Liquid Glass elastic Lip Segmented Control (click or press-and-drag)
 * 3. Floating Liquid Glass Metaball Dock + draggable Stage-Sky & Optical Preset Orb (`mergeGroup = 1`)
 */

import {
  LIQUID_GLASS_PRESETS,
  type GlassPresetId,
  glassRegistry,
} from './liquid-glass';
import type { PerformanceTier } from './performance-tier';
import type { PointerState } from './stage-canvas';
import { STAGE_SKIES, type StageSkyId } from './stage-skies';

export class DraftingController {
  private rafId = 0;
  private tier: PerformanceTier = 'high';
  private rx = -120;
  private ry = -120;
  private px = 0;
  private py = 0;

  constructor(
    private outerPlane: SVGGElement | null,
    private innerPlane: SVGGElement | null,
    private watermark: HTMLElement | null,
    private reticle: HTMLElement | null,
    private flashEl: HTMLElement | null,
    private pointer: PointerState,
  ) {}

  setTier(tier: PerformanceTier) {
    this.tier = tier;
    const active = tier === 'high' || tier === 'medium';
    if (!active) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      if (this.outerPlane) this.outerPlane.style.transform = '';
      if (this.innerPlane) this.innerPlane.style.transform = '';
      if (this.watermark) this.watermark.style.transform = '';
      if (this.reticle) this.reticle.style.opacity = '0';
    } else if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  setWatermark(code: string) {
    if (this.watermark) this.watermark.textContent = code;
  }

  flash() {
    if (this.tier === 'reduced' || !this.flashEl) return;
    this.flashEl.classList.remove('is-flashing');
    void this.flashEl.offsetWidth;
    this.flashEl.classList.add('is-flashing');
  }

  private loop = () => {
    if (this.tier !== 'high' && this.tier !== 'medium') {
      this.rafId = 0;
      return;
    }
    this.rafId = requestAnimationFrame(this.loop);
    if (document.hidden) return;

    const targetPx = this.pointer.active ? (this.pointer.nx - 0.5) * 2 : 0;
    const targetPy = this.pointer.active ? (this.pointer.ny - 0.5) * 2 : 0;
    this.px += (targetPx - this.px) * 0.06;
    this.py += (targetPy - this.py) * 0.06;

    if (this.outerPlane) {
      this.outerPlane.style.transform = `translate3d(${(-this.px * 8).toFixed(2)}px, ${(-this.py * 6).toFixed(2)}px, 0)`;
    }
    if (this.innerPlane) {
      this.innerPlane.style.transform = `translate3d(${(this.px * 10).toFixed(2)}px, ${(this.py * 8).toFixed(2)}px, 0)`;
    }
    if (this.watermark) {
      this.watermark.style.transform = `translate3d(${(-this.px * 15).toFixed(2)}px, ${(-this.py * 11).toFixed(2)}px, 0)`;
    }
    if (this.reticle) {
      if (this.pointer.active) {
        this.rx += (this.pointer.x - this.rx) * 0.22;
        this.ry += (this.pointer.y - this.ry) * 0.22;
        const scale = 1 + Math.min(this.pointer.speed * 0.16, 0.4);
        this.reticle.style.opacity = '1';
        this.reticle.style.transform = `translate3d(${this.rx.toFixed(1)}px, ${this.ry.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      } else {
        this.reticle.style.opacity = '0';
      }
    }
  };
}

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
}

export interface SegmentedHandle<T extends string> {
  setValue(next: T): void;
  refresh(): void;
}

export function mountLiquidSegmented<T extends string>(
  container: HTMLElement,
  options: Array<SegmentedOption<T>>,
  initialValue: T,
  onChange: (next: T) => void,
  idPrefix: string,
  priority = 44,
): SegmentedHandle<T> {
  let value = initialValue;
  let dragging = false;
  let isPressed = false;
  let isAnimating = false;
  let animTimer = 0;
  let lastDragX = 0;

  container.classList.add('liquid-segmented');
  container.setAttribute('role', 'tablist');
  container.replaceChildren();

  const knob = document.createElement('div');
  knob.className = 'liquid-segmented-knob';
  knob.setAttribute('aria-hidden', 'true');
  container.append(knob);

  const buttons = options.map(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'liquid-segmented-tab';
    btn.setAttribute('role', 'tab');
    btn.dataset.value = opt.id;
    btn.textContent = opt.label;
    container.append(btn);
    return btn;
  });

  const activeIndex = () => Math.max(0, options.findIndex(o => o.id === value));

  const syncVisuals = (overrideLeft?: number, overrideWidth?: number, stretchX = 1) => {
    const idx = activeIndex();
    const btn = buttons[idx];
    buttons.forEach((b, i) => {
      const selected = i === idx;
      b.setAttribute('aria-selected', String(selected));
      b.classList.toggle('is-active', selected);
    });
    const activeGlass = isPressed || isAnimating;
    knob.classList.toggle('is-lip-glass', activeGlass);
    knob.classList.toggle('is-pressed', isPressed);

    const tr = container.getBoundingClientRect();
    if (!btn || !tr.width) return;
    const br = btn.getBoundingClientRect();
    const left = overrideLeft ?? br.left - tr.left;
    const width = overrideWidth ?? br.width;
    knob.style.left = `${left.toFixed(1)}px`;
    knob.style.width = `${width.toFixed(1)}px`;
    knob.style.transform = activeGlass
      ? `translateY(-50%) scaleX(${(1.07 * stretchX).toFixed(3)}) scaleY(1.26)`
      : 'translateY(-50%) scale(1)';
  };

  const pulse = () => {
    isAnimating = true;
    syncVisuals();
    window.clearTimeout(animTimer);
    animTimer = window.setTimeout(() => {
      isAnimating = false;
      syncVisuals();
    }, 480);
  };

  const pickAt = (clientX: number) => {
    const tr = container.getBoundingClientRect();
    if (!tr.width) return;
    const relX = clientX - tr.left;
    const vx = Math.abs(clientX - lastDragX);
    lastDragX = clientX;

    let bestIdx = activeIndex();
    let bestDist = Infinity;
    buttons.forEach((btn, idx) => {
      const br = btn.getBoundingClientRect();
      const center = br.left - tr.left + br.width * 0.5;
      const d = Math.abs(relX - center);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });

    const w = buttons[bestIdx]?.getBoundingClientRect().width || 64;
    const clampedLeft = Math.max(3, Math.min(tr.width - w - 3, relX - w * 0.5));
    const stretchX = 1 + Math.min(vx * 0.014, 0.18);
    if (options[bestIdx] && options[bestIdx].id !== value) {
      value = options[bestIdx].id;
      onChange(value);
    }
    syncVisuals(clampedLeft, w, stretchX);
  };

  container.addEventListener('pointerdown', e => {
    dragging = true;
    isPressed = true;
    lastDragX = e.clientX;
    container.setPointerCapture(e.pointerId);
    pickAt(e.clientX);
  });
  container.addEventListener('pointermove', e => {
    if (!dragging) return;
    pickAt(e.clientX);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    isPressed = false;
    pulse();
  };
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const opt = options[idx];
      if (!opt) return;
      if (opt.id !== value) {
        value = opt.id;
        onChange(value);
      }
      pulse();
    });
  });

  glassRegistry.register({
    id: `${idPrefix}-track`,
    element: container,
    radius: 'pill',
    edgeShape: 'convex',
    mergeGroup: 0,
    priority,
    overrideRefraction: 18,
    overrideDispersion: 0.18,
    overrideBlurMix: 0.42,
    overrideFrost: 0.12,
  });

  glassRegistry.register({
    id: `${idPrefix}-knob`,
    element: null,
    manualRect: () => {
      if (!isPressed && !isAnimating) return null;
      const r = knob.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return null;
      return { x: r.left, y: r.top, width: r.width, height: r.height, radius: r.height * 0.5, active: true };
    },
    radius: 'pill',
    edgeShape: 'lip',
    mergeGroup: 0,
    priority: priority + 28,
    overrideRefraction: 32,
    overrideDispersion: 0.62,
    overrideBlurMix: 0.02,
    overrideFrost: 0.02,
  });

  window.addEventListener('resize', () => syncVisuals());
  requestAnimationFrame(() => syncVisuals());

  return {
    setValue(next: T) {
      value = next;
      syncVisuals();
    },
    refresh() {
      syncVisuals();
    },
  };
}

export interface FloatingDockOptions {
  bar: HTMLElement;
  orb: HTMLButtonElement;
  popover: HTMLElement;
  skyGrid: HTMLElement;
  presetGrid: HTMLElement;
  closeButton: HTMLButtonElement;
  flashButton: HTMLButtonElement;
  initialSky: StageSkyId;
  initialPreset: GlassPresetId;
  onSkyChange: (sky: StageSkyId) => void;
  onPresetChange: (preset: GlassPresetId) => void;
  onFlash: () => void;
  onFoilImpulse: (strength?: number) => void;
}

export function mountFloatingDock(opts: FloatingDockOptions) {
  let activeSky = opts.initialSky;
  let activePreset = opts.initialPreset;
  let open = false;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let offX = 0;
  let offY = 0;

  const setPopoverOpen = (next: boolean) => {
    open = next;
    opts.popover.hidden = !next;
    opts.orb.setAttribute('aria-expanded', String(next));
    opts.orb.classList.toggle('is-open', next);
  };

  const renderSkyButtons = () => {
    opts.skyGrid.replaceChildren();
    for (const sky of STAGE_SKIES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dock-chip';
      btn.dataset.skyOption = sky.id;
      btn.textContent = sky.label;
      btn.classList.toggle('is-active', sky.id === activeSky);
      btn.addEventListener('click', () => {
        activeSky = sky.id;
        opts.onSkyChange(sky.id);
        renderSkyButtons();
      });
      opts.skyGrid.append(btn);
    }
  };

  const renderPresetButtons = () => {
    opts.presetGrid.replaceChildren();
    const order: GlassPresetId[] = ['apple', 'thick', 'prism', 'frosted'];
    for (const pid of order) {
      const p = LIQUID_GLASS_PRESETS[pid];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dock-chip';
      btn.dataset.presetOption = pid;
      btn.textContent = p.label;
      btn.classList.toggle('is-active', pid === activePreset);
      btn.addEventListener('click', () => {
        activePreset = pid;
        opts.onPresetChange(pid);
        renderPresetButtons();
      });
      opts.presetGrid.append(btn);
    }
  };

  renderSkyButtons();
  renderPresetButtons();
  setPopoverOpen(false);

  opts.closeButton.addEventListener('click', () => setPopoverOpen(false));
  opts.flashButton.addEventListener('click', () => opts.onFlash());

  const applyOrbTransform = (scale: number) => {
    opts.orb.style.transform = `translate3d(${offX.toFixed(1)}px, ${offY.toFixed(1)}px, 0) scale(${scale})`;
  };

  opts.orb.addEventListener('pointerdown', e => {
    dragging = true;
    moved = false;
    startX = e.clientX - offX;
    startY = e.clientY - offY;
    opts.orb.classList.add('is-dragging');
    opts.orb.setPointerCapture(e.pointerId);
    applyOrbTransform(1.09);
    opts.onFoilImpulse(0.75);
  });

  opts.orb.addEventListener('pointermove', e => {
    if (!dragging) return;
    const nx = e.clientX - startX;
    const ny = e.clientY - startY;
    if (Math.hypot(nx - offX, ny - offY) > 4) moved = true;
    offX = Math.max(-185, Math.min(80, nx));
    offY = Math.max(-90, Math.min(35, ny));
    applyOrbTransform(1.09);
  });

  const finishDrag = () => {
    if (!dragging) return;
    dragging = false;
    opts.orb.classList.remove('is-dragging');
    if (!moved) {
      setPopoverOpen(!open);
      opts.onFoilImpulse(0.95);
    }
    offX = 0;
    offY = 0;
    applyOrbTransform(1);
  };

  opts.orb.addEventListener('pointerup', finishDrag);
  opts.orb.addEventListener('pointercancel', finishDrag);

  // Register capsule bar & draggable orb in shared mergeGroup = 1 for real GPU SDF metaball fusion
  glassRegistry.register({
    id: 'floating-dock-bar',
    element: opts.bar,
    radius: 'pill',
    edgeShape: 'convex',
    mergeGroup: 1,
    priority: 80,
    overrideRefraction: 40,
    overrideDispersion: 0.68,
    overrideBlurMix: 0.1,
    overrideFrost: 0.04,
  });

  glassRegistry.register({
    id: 'floating-dock-orb',
    element: opts.orb,
    radius: 'pill',
    edgeShape: 'convex',
    mergeGroup: 1,
    priority: 82,
    overrideRefraction: 44,
    overrideDispersion: 0.78,
    overrideBlurMix: 0.06,
    overrideFrost: 0.03,
  });

  glassRegistry.register({
    id: 'floating-dock-popover',
    element: opts.popover,
    radius: 26,
    edgeShape: 'convex',
    mergeGroup: 0,
    priority: 92,
    overrideRefraction: 20,
    overrideDispersion: 0.18,
    overrideBlurMix: 0.88,
    overrideFrost: 0.34,
  });

  return {
    syncSky(sky: StageSkyId) {
      activeSky = sky;
      renderSkyButtons();
    },
    syncPreset(preset: GlassPresetId) {
      activePreset = preset;
      renderPresetButtons();
    },
    close() {
      setPopoverOpen(false);
    },
  };
}
