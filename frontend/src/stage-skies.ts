/**
 * Stage-set GLSL3 shaders and Beer-Lambert pigment chemistry ported from
 * NAMELESSAurora/lumen-folio (sourced from fsc-music-player mac-stage-sets).
 */

import type { AvatarMood } from './avatar-state';

export type StageSkyId = 'pale' | 'deep' | 'eclipse' | 'nebula' | 'dawn';

export interface StageSkySpec {
  id: StageSkyId;
  appearance: 'light' | 'dark';
  code: string;
  label: string;
  shortLabel: string;
}

export interface CompanionAtmosphere {
  plateCode: string;
  moodTag: string;
  primaryPigment: string;
  secondaryPigment: string;
  foilAccentA: string;
  foilAccentB: string;
  signalAccent: string;
}

export const STAGE_SKIES: StageSkySpec[] = [
  { id: 'pale', appearance: 'light', code: 'SKY_01', label: '表 · 晨间留白', shortLabel: '晨间留白' },
  { id: 'deep', appearance: 'dark', code: 'SKY_02', label: '里 · 穹顶星云', shortLabel: '穹顶星云' },
  { id: 'eclipse', appearance: 'dark', code: 'SKY_03', label: '蚀 · 水彩日蚀', shortLabel: '水彩日蚀' },
  { id: 'nebula', appearance: 'dark', code: 'SKY_04', label: '染 · 湿染星云', shortLabel: '湿染星云' },
  { id: 'dawn', appearance: 'dark', code: 'SKY_05', label: '曙 · 水彩曙弧', shortLabel: '水彩曙弧' },
];

export const MOOD_ATMOSPHERES: Record<AvatarMood, CompanionAtmosphere> = {
  offline: {
    plateCode: 'PLATE_00',
    moodTag: 'STANDBY',
    primaryPigment: '#2D5DA8',
    secondaryPigment: '#7A8BA8',
    foilAccentA: '#7FA8E8',
    foilAccentB: '#4EE2EC',
    signalAccent: '#7A8BA8',
  },
  idle: {
    plateCode: 'PLATE_00',
    moodTag: 'STILLNESS',
    primaryPigment: '#2D5DA8',
    secondaryPigment: '#D85A7F',
    foilAccentA: '#FF3BA7',
    foilAccentB: '#4EE2EC',
    signalAccent: '#E83B1E',
  },
  thinking: {
    plateCode: 'PLATE_03',
    moodTag: 'QUIET RESONANCE',
    primaryPigment: '#3C4B8E',
    secondaryPigment: '#926DA8',
    foilAccentA: '#B388FF',
    foilAccentB: '#64FFDA',
    signalAccent: '#7C6CE0',
  },
  looking: {
    plateCode: 'PLATE_01',
    moodTag: 'VISION CAPTURE',
    primaryPigment: '#0B7A8A',
    secondaryPigment: '#34C6B4',
    foilAccentA: '#00E5FF',
    foilAccentB: '#B8F227',
    signalAccent: '#009FB8',
  },
  replying: {
    plateCode: 'PLATE_04',
    moodTag: 'STREAMING TEXT',
    primaryPigment: '#3949D8',
    secondaryPigment: '#D82674',
    foilAccentA: '#FF2E93',
    foilAccentB: '#00E5FF',
    signalAccent: '#009FB8',
  },
  speaking: {
    plateCode: 'PLATE_04',
    moodTag: 'VOICE TRANSIENT',
    primaryPigment: '#D82674',
    secondaryPigment: '#3949D8',
    foilAccentA: '#FF2E93',
    foilAccentB: '#00E5FF',
    signalAccent: '#E83B1E',
  },
  interrupted: {
    plateCode: 'PLATE_02',
    moodTag: 'RAZOR CUT',
    primaryPigment: '#D43E28',
    secondaryPigment: '#F0A13B',
    foilAccentA: '#FF4D8D',
    foilAccentB: '#FFD857',
    signalAccent: '#E83B1E',
  },
  error: {
    plateCode: 'PLATE_02',
    moodTag: 'SIGNAL FAULT',
    primaryPigment: '#D43E28',
    secondaryPigment: '#F0A13B',
    foilAccentA: '#FF4D8D',
    foilAccentB: '#FFD857',
    signalAccent: '#E83B1E',
  },
};

export function hexToRgbNormalized(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = Number.parseInt(clean, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const TWO_SKY_PAL_U: number[][] = [
  '#9FB0EA',
  '#E9D3EC',
  '#FCE9D8',
  '#C4B3EA',
  '#F4BDD3',
  '#FBD9A8',
  '#FFFFFF',
].map(hexToRgbNormalized);

export const TWO_SKY_PAL_M: number[][] = [
  '#24123A',
  '#5C1A45',
  '#8E2249',
  '#8E559F',
  '#EC506A',
  '#F6A259',
  '#FFE9F1',
].map(hexToRgbNormalized);

export const TWO_SKY_FIRM = {
  sun: [-0.18, 0.56, 0.025, 1.0],
  eyeM: [0.22, 0.44, 0.032, 1.0],
  liftM: [Math.PI + 0.2, 0.62, 0.42, 1.0],
  neb: [1.7, 0.0, 0.9, 1.0],
};

const PAPER = [0.93, 0.91, 0.86];
export const CANON_PIGMENTS = {
  K_PAY: [2.3, 2.08, 1.62],
  K_ULT: [1.38, 1.02, 0.17],
  K_TQ: [1.45, 0.32, 0.42],
  K_VIO: [0.62, 1.12, 0.34],
  K_ROS: [0.14, 1.2, 0.52],
  K_AMB: [0.06, 0.55, 1.35],
  K_YEL: [0.03, 0.12, 1.05],
};

function lum(c: number[]): number {
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 1) + 1) % 1;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [hue2rgb(hh + 1 / 3), hue2rgb(hh), hue2rgb(hh - 1 / 3)];
}

function srgbToLin(c: [number, number, number]): [number, number, number] {
  return [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)];
}

function pigmentFromLinear(
  col: [number, number, number],
  canon: number[],
  sat = 1.25,
): [number, number, number] {
  const ref = PAPER.map((p, i) => p * Math.exp(-canon[i]));
  const Lr = lum(ref);
  const L = lum(col);
  let c = col.map(x => Math.max(0.002, L + (x - L) * sat));
  const scale = Lr / Math.max(lum(c), 1e-4);
  c = c.map((x, i) => Math.min(PAPER[i] * 0.97, Math.max(0.004, x * scale)));
  return [
    -Math.log(c[0] / PAPER[0]),
    -Math.log(c[1] / PAPER[1]),
    -Math.log(c[2] / PAPER[2]),
  ];
}

function mixK(a: number[], b: number[], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function computePaintPigments(primaryHex: string, secondaryHex: string) {
  const mainSrgb = hexToRgbNormalized(primaryHex);
  const secondSrgb = hexToRgbNormalized(secondaryHex);
  const mainLin = srgbToLin(mainSrgb);
  const secondLin = srgbToLin(secondSrgb);

  const [h, s, l] = rgbToHsl(mainSrgb[0], mainSrgb[1], mainSrgb[2]);
  const nbLin = srgbToLin(hslToRgb(h + 0.085, s, l));
  const vioLin: [number, number, number] = [
    (mainLin[0] + secondLin[0]) * 0.5,
    (mainLin[1] + secondLin[1]) * 0.5,
    (mainLin[2] + secondLin[2]) * 0.5,
  ];

  return {
    K_PAY: mixK(CANON_PIGMENTS.K_PAY, pigmentFromLinear(mainLin, CANON_PIGMENTS.K_PAY, 1), 0.18),
    K_ULT: pigmentFromLinear(mainLin, CANON_PIGMENTS.K_ULT),
    K_TQ: pigmentFromLinear(nbLin, CANON_PIGMENTS.K_TQ),
    K_VIO: pigmentFromLinear(vioLin, CANON_PIGMENTS.K_VIO, 1.1),
    K_ROS: pigmentFromLinear(secondLin, CANON_PIGMENTS.K_ROS),
    K_AMB: [...CANON_PIGMENTS.K_AMB] as [number, number, number],
    K_YEL: [...CANON_PIGMENTS.K_YEL] as [number, number, number],
  };
}

export const FULLSCREEN_VS_300 = `#version 300 es
out vec2 vUv;
void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

export const TWO_SKY_BAKE_FS = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uOut;
uniform float uSide;
out vec4 oc;

float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash22(vec2 p) { float n = hash21(p); return vec2(n, hash21(p + n * 17.31 + 3.7)); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float sq(float x) { return x * x; }
vec3 sane(vec3 c, vec3 alt) { return (any(isnan(c)) || any(isinf(c))) ? alt : c; }

float hash31(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
float vnoise3(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

uniform vec4 uSun;
uniform vec4 uNeb;
uniform vec4 uEyeM;
uniform vec4 uLiftM;
uniform float uClock;
uniform vec3 uPalU[7];
uniform vec3 uPalM[7];

vec3 dirOf(float az, float el) { return vec3(sin(az) * cos(el), sin(el), cos(az) * cos(el)); }
float fb3(vec3 p) { return 0.57 * vnoise3(p) + 0.29 * vnoise3(p * 2.1 + 5.3) + 0.14 * vnoise3(p * 4.3 + 9.1); }
float fb2(vec2 p) { return 0.57 * vnoise(p) + 0.29 * vnoise(p * 2.13 + 5.3) + 0.14 * vnoise(p * 4.37 + 9.1); }

vec2 chartOf(vec3 r, vec3 a) {
  vec3 t1 = normalize(cross(vec3(0.0, 1.0, 0.0), a)), t2 = cross(a, t1);
  vec2 p = vec2(dot(r, t1), dot(r, t2));
  return p * (acos(clamp(dot(r, a), -1.0, 1.0)) / max(length(p), 1e-5));
}
float edgeOf(float d, float wet) {
  float w = mix(0.0042, 0.16, wet);
  return 1.0 - smoothstep(-w, w * mix(1.0, 0.35, wet), d);
}
float heads(vec2 h, float n, float seed) {
  float x = (atan(h.x, h.y) / 6.2831853 + 0.5) * n, i = floor(x), f = x - i, top = 0.0;
  for (int k = -1; k <= 1; k++) {
    vec2 hh = hash22(vec2(mod(i + float(k) + n, n), seed));
    float u = (f - float(k) - 0.2 - 0.6 * hh.x) / (0.52 + 0.46 * hh.y);
    top = max(top, (0.42 + 0.58 * hh.y) * sqrt(max(0.0, 1.0 - u * u)));
  }
  return top;
}
vec3 bank(vec2 h, float el, float base, float amp, float n, float seed, float wet) {
  float swell = vnoise(h * 1.7 + seed) + 0.5 * vnoise(h * 3.8 + seed * 1.3);
  float H = base + amp * (
    0.42 * swell
    + 0.48 * heads(h, n, seed)
    + 0.18 * heads(h, floor(n * 2.1) + 1.0, seed + 3.1)
    + 0.045 * heads(h, floor(n * 4.2) + 2.0, seed + 5.7)
  );
  float d = el - H + 0.0018 * (1.0 - wet) * (vnoise(h * 68.0 + seed) - 0.5);
  return vec3(
    edgeOf(d, wet),
    clamp(-d / (amp + 0.02), 0.0, 1.0),
    (1.0 - wet) * smoothstep(0.009, 0.0, abs(d + 0.003))
  );
}
float specks(vec3 r, float crowd, float off, float orbs) {
  vec2 M = r.xz / (1.0 + r.y) * 2.0;
  float w = 0.0, toRad = (1.0 + r.y) * 0.5;
  for (int l = 0; l < 4; l++) {
    float S = l == 0 ? 150.0 : l == 1 ? 52.0 : l == 2 ? 19.0 : 5.5;
    vec2 Pp = M * S + float(l) * 13.7, id = floor(Pp);
    vec2 hh = hash22(id + off + float(l) * 7.7), jj = hash22(id + off + 3.3);
    float keep = l == 0 ? step(1.0 - 0.62 * crowd, hh.x) : l == 1 ? step(0.74, hh.x) : l == 2 ? step(0.86, hh.x) : step(1.0 - 0.34 * orbs, hh.x);
    float dd = length(fract(Pp) - 0.2 - 0.6 * jj) / S * toRad;
    float tw = 0.76 + 0.24 * sin(uClock * (0.5 + 1.8 * hh.y) + hh.x * 40.0);
    float rad = l == 0 ? 0.0005 + 0.0006 * hh.y : l == 1 ? 0.0007 + 0.0007 * hh.y : l == 2 ? 0.0013 + 0.0012 * hh.y : 0.0012;
    float a = smoothstep(rad, rad * 0.35, dd) * (l == 0 ? 0.5 + 0.5 * jj.x : l == 1 ? 0.55 + 0.45 * jj.y : 1.0);
    if (l == 2) a += 0.3 * exp(-dd / (rad * 3.4));
    if (l == 3) a += 0.17 * smoothstep(0.016 + 0.014 * hh.y, 0.0, dd) + 0.14 * exp(-dd / 0.005);
    w = max(w, a * keep * tw);
  }
  return w;
}
vec2 veil(vec2 p, vec2 c0, vec2 dir, float len, float wid, float seed) {
  vec2 w = vec2(fb2(p * 7.0 + seed), fb2(p * 7.0 + seed + 31.0)) - 0.5;
  vec2 d = p - c0 + w * 0.06;
  float u = dot(d, dir) / len, v = dot(d, vec2(-dir.y, dir.x)) / wid;
  float along = smoothstep(-0.14, 0.08, u) * smoothstep(1.1, 0.72, u);
  float sd = (abs(v) - 0.38 - 0.62 * sin(3.14159 * clamp(u, 0.0, 1.0))) * wid;
  float frill = 0.004 * (vnoise(p * 95.0 + seed) - 0.5) + 0.009 * (vnoise(p * 33.0 + seed * 2.0) - 0.5);
  float found = step(0.0, v);
  float a = along * mix(edgeOf(sd + 0.03, 0.7), edgeOf(sd + frill, 0.0), found);
  a *= 0.45 + 0.55 * smoothstep(0.25, 0.66, fb2(p * 19.0 + w * 4.0 + seed * 1.7));
  return vec2(a, along * found * smoothstep(0.003, 0.0006, abs(sd + frill)));
}

vec4 skyPale(vec3 r, vec3 P0, vec3 P1, vec3 P2, vec3 P3, vec3 P4, vec3 P5, vec3 P6, bool fine) {
  float el = asin(clamp(r.y, 0.0, 1.0)), K = uNeb.w;
  vec2 h = normalize(r.xz + 1e-6), G = r.xz / (1.0 + r.y);
  vec3 sun = dirOf(uSun.x, uSun.y);
  float sideS = dot(h, normalize(sun.xz)), ang = acos(clamp(dot(r, sun), -1.0, 1.0));
  vec2 dr = vec2(uNeb.y, 0.3 * uNeb.y);
  float fl2 = fb2(G * 5.8 + 21.0 + uNeb.x - dr);
  vec3 W = P6 * 0.97;
  vec3 c = mix(P2, P4, smoothstep(0.0, 0.22, el));
  c = mix(c, P3, smoothstep(0.14, 0.50, el));
  c = mix(c, P0, smoothstep(0.36, 1.02, el));
  c = mix(c, mix(P3, P0, 0.6), 0.38 * smoothstep(0.3, -0.9, sideS) * smoothstep(0.02, 0.34, el));
  c = mix(c, P5, 0.68 * exp(-el / 0.13) * smoothstep(-0.7, 1.0, sideS));
  {
    float m = smoothstep(0.14, 0.44, el);
    float v1 = smoothstep(0.48, 0.68, fb3(vec3(h * 1.5, el * 4.4) + uNeb.x + vec3(dr, 0.0)));
    float v2 = smoothstep(0.50, 0.70, fb3(vec3(h * 2.2, el * 6.0) + 17.0 + uNeb.x - vec3(dr, 0.0)));
    c = mix(c, mix(P3, P0, 0.55), 0.46 * v1 * m * K);
    c = mix(c, P4, 0.62 * v2 * m * K);
    c = mix(c, W, 0.44 * smoothstep(0.55, 0.74, fl2) * max(v1, v2) * m);
  }
  // Low-frequency warm atmospheric solar scatter (crisp sun disc & drafting rings rendered analytically at full DPR)
  c = mix(c, mix(P5, W, 0.62), clamp(uSun.w * (0.36 * exp(-ang / 0.12) + 0.16 * exp(-ang / 0.38)), 0.0, 1.0));
  float wetB = fine ? 0.08 : 1.0;
  vec3 b = bank(h, el, 0.02, 0.08, 62.0, 3.0, max(wetB, 0.16));
  float cloudOcc = b.x * 0.78 * K;
  vec3 backCloud = mix(W, mix(P4, P5, 0.48), smoothstep(0.06, 0.65, b.y));
  backCloud = mix(backCloud, W, b.z * 0.35);
  c = mix(c, backCloud, b.x * 0.88 * K);

  float env = max(0.32 + 0.68 * smoothstep(0.34, 0.68, fb2(h * 1.3 + 5.0)), smoothstep(0.84, 0.99, sideS));
  b = bank(h, el, 0.0, 0.19 * env, 46.0, 7.0, wetB);
  cloudOcc = max(cloudOcc, b.x * 0.94 * K);
  vec3 bc = mix(W, P4, smoothstep(0.08, 0.48, b.y));
  if (fine) {
    bc = mix(bc, mix(P4, P3, 0.52), 0.82 * bank(h, el, -0.028, 0.155 * env, 52.0, 9.0, 0.14).x);
    bc = mix(bc, mix(P3, P0, 0.38), 0.78 * bank(h, el, -0.056, 0.12 * env, 38.0, 10.0, 0.18).x);
    bc = mix(bc, mix(W, P5, 0.3), b.z * 0.45 * smoothstep(-0.2, 0.9, sideS));
  } else bc = mix(bc, mix(P4, P3, 0.5), smoothstep(0.3, 0.9, b.y));
  c = mix(c, bc, b.x * 0.94 * K);

  float env2 = smoothstep(0.42, 0.72, fb2(h * 0.95 + 11.0)) * (1.0 - 0.72 * smoothstep(0.76, 0.97, sideS));
  b = bank(h, el, -0.02, 0.28 * env2, 30.0, 13.0, wetB);
  cloudOcc = max(cloudOcc, b.x * 0.98 * K);
  bc = mix(W, mix(P3, P4, 0.34), smoothstep(0.08, 0.36, b.y));
  if (fine) {
    bc = mix(bc, P3, 0.84 * bank(h, el, -0.055, 0.23 * env2, 36.0, 15.0, 0.14).x);
    bc = mix(bc, mix(P3, P0, 0.64), 0.82 * bank(h, el, -0.095, 0.18 * env2, 26.0, 16.0, 0.18).x);
    bc = mix(bc, W, b.z * 0.42);
  } else bc = mix(bc, mix(P3, P0, 0.4), smoothstep(0.3, 0.9, b.y));
  c = mix(c, bc, b.x * 0.95 * K);

  c = mix(c, W, 0.52 * exp(-el / 0.0028));
  return vec4(c, clamp(cloudOcc, 0.0, 1.0));
}

vec3 skyDeep(vec3 r, vec3 P0, vec3 P1, vec3 P2, vec3 P3, vec3 P4, vec3 P5, vec3 P6, bool fine) {
  float el = asin(clamp(r.y, 0.0, 1.0)), K = uNeb.w, E = uEyeM.w, L2 = uLiftM.w;
  vec2 h = normalize(r.xz + 1e-6), G = r.xz / (1.0 + r.y);
  vec3 eye = dirOf(uEyeM.x, uEyeM.y), lit = dirOf(uLiftM.x, uLiftM.y);
  vec2 q = chartOf(r, eye) * vec2(-1.0, 1.0), he = normalize(eye.xz);
  float rho = length(q), sideE = dot(h, he), sideL = dot(h, normalize(lit.xz));
  float dAz = -atan(h.x * he.y - h.y * he.x, sideE);
  float angL = acos(clamp(dot(r, lit), -1.0, 1.0)), nearE = smoothstep(2.3, 1.5, rho);
  vec2 dr = vec2(uNeb.y, 0.3 * uNeb.y);
  float fld = fb2(G * 3.4 + uNeb.x + dr), fl2 = fb2(G * 6.3 + 21.0 + uNeb.x - dr);
  float deepSide = smoothstep(0.3, 0.85, dAz) * smoothstep(2.3, 1.5, dAz) * E;
  float warm = max(max(E * smoothstep(1.7, 0.15, rho), 0.9 * L2 * smoothstep(1.7, 0.2, angL)), 0.42) * (1.0 - 0.85 * deepSide);
  vec3 c = mix(P0, P1, clamp(0.12 + 0.88 * warm, 0.0, 1.0) * smoothstep(1.35, 0.0, el));
  c = mix(c, P2, 0.75 * warm * warm * smoothstep(0.95, 0.0, el));
  c = mix(c, P0 * 0.8, 0.6 * deepSide);
  if (fine) c *= 1.0 + 0.05 * (vnoise(h * 240.0) - 0.5) + 0.03 * (vnoise(h * 61.0 + 4.0) - 0.5);
  float hot = (1.0 - smoothstep(0.08, 0.74, length((q - vec2(-0.2, -0.02)) * vec2(0.9, 1.3)) + 0.4 * (fld - 0.5))) * nearE * E;
  hot = max(hot, (1.0 - smoothstep(0.1, 1.15, angL + 0.5 * (fld - 0.5))) * L2);
  hot = max(hot, 0.62 * smoothstep(-0.45, 0.5, sideL + 0.5 * (fld - 0.5)) * (1.0 - smoothstep(0.12, 0.85, el + 0.3 * (fl2 - 0.5))) * L2);
  c = mix(c, mix(P2, P4, smoothstep(0.2, 0.92, hot)), smoothstep(0.0, 0.45, hot) * 0.96 * K);
  c = mix(c, mix(P4, P5, 0.4), 0.5 * smoothstep(0.55, 0.9, hot) * smoothstep(0.42, 0.62, fl2) * K);
  vec2 ql = (q - vec2(-0.9, 0.7)) * vec2(0.95, 1.0);
  float st = fine ? fb2(vec2(q.x * 34.0, q.y * 2.6) + 7.0) : 0.5;
  float lift = (1.0 - smoothstep(0.05, 0.5, length(ql) + 0.42 * (fld - 0.5) + 0.16 * (fl2 - 0.5) + 0.14 * (st - 0.5) * smoothstep(0.08, -0.3, ql.y))) * nearE * E;
  {
    float halo = (1.0 - smoothstep(0.25, 1.0, length(ql) + 0.4 * (fld - 0.5))) * nearE * E;
    c = mix(c, mix(P2, P4, smoothstep(0.2, 0.92, halo)), smoothstep(0.0, 0.45, halo) * 0.96 * K);
  }
  if (angL < 1.2) {
    vec2 qs = chartOf(r, lit);
    float st2 = fine ? fb2(vec2(qs.x * 34.0, qs.y * 2.6) + 3.0) : 0.5;
    lift = max(lift, (1.0 - smoothstep(0.04, uLiftM.z, angL + 0.42 * (fld - 0.5) + 0.16 * (fl2 - 0.5) + 0.14 * (st2 - 0.5) * smoothstep(0.08, -0.3, qs.y))) * L2);
  }
  c = mix(c, mix(P4, P6, 0.35), smoothstep(0.0, 0.3, lift) * 0.85);
  c = mix(c, mix(P4, P6, 0.8), smoothstep(0.22, 0.6, lift) * 0.9);
  c = mix(c, vec3(0.955, 0.93, 0.945), smoothstep(0.62, 1.0, lift));
  {
    vec2 qm = chartOf(r, dirOf(uEyeM.x - 0.46, min(uEyeM.y + 0.52, 1.25))) * vec2(-1.0, 1.0);
    float rm = length(qm);
    vec2 cm = qm / max(rm, 1e-5);
    float d0 = rm - 0.45, d1 = length(qm - vec2(-0.33, -0.19)) - 0.2, d2 = length(qm - vec2(0.36, 0.26)) - 0.33;
    float h1 = clamp(0.5 + 0.5 * (d1 - d0) / 0.1, 0.0, 1.0), d01 = mix(d1, d0, h1) - 0.1 * h1 * (1.0 - h1);
    float h2 = clamp(0.5 + 0.5 * (d2 - d01) / 0.14, 0.0, 1.0), dm = mix(d2, d01, h2) - 0.14 * h2 * (1.0 - h2);
    dm += 0.07 * (fld - 0.5) + 0.03 * (fl2 - 0.5) + (fine ? 0.004 * (vnoise(qm * 60.0) - 0.5) : 0.0);
    float under = smoothstep(0.1, 0.62, dot(cm, vec2(0.35, -0.94)) + 0.4 * (fld - 0.5));
    float wetm = fine ? 1.0 - 0.96 * under : 1.0;
    float am = edgeOf(dm, wetm) * nearE * E;
    vec3 mcol = mix(P3, mix(P3, P4, 0.62), sq(smoothstep(0.8, 0.1, rho)));
    mcol = mix(mcol, mix(P3, P0, 0.5), 0.75 * smoothstep(0.0, 0.9, dot(cm, vec2(0.85, 0.53))) * smoothstep(0.25, 1.0, rm / 0.45));
    mcol = mix(mcol, mix(P3, vec3(0.74, 0.84, 1.0), 0.55), 0.6 * smoothstep(0.58, 0.7, fl2) * smoothstep(-0.2, 0.6, dot(cm, vec2(-0.5, 0.86))));
    mcol = mix(mcol, mix(mcol, P6, 0.16), 1.0 - smoothstep(-0.06, 0.06, dm + 0.13 + 0.1 * (fl2 - 0.5)));
    c = mix(c, mcol, am * 0.92 * K);
    if (fine) c *= 1.0 - 0.07 * (1.0 - wetm) * am * smoothstep(-0.03, -0.007, dm) * smoothstep(0.0, -0.007, dm);
  }
  float wetB = fine ? 0.0 : 1.0, lightSide = smoothstep(-0.3, 0.95, max(sideE * E, sideL * L2));
  vec3 b = bank(h, el, -0.01, 0.13, 40.0, 17.0, max(wetB, 0.1));
  c = mix(c, mix(mix(P0, P1, 0.7), mix(P1, P2, 0.8), lightSide), b.x * 0.8 * K * (1.0 - 0.6 * lightSide));
  b = bank(h, el, 0.0, 0.06, 84.0, 11.0, max(wetB, 0.1));
  c = mix(c, mix(mix(P0, P1, 0.9) * 1.25, mix(P2, P4, 0.5), lightSide), b.x * 0.9 * K);
  if (rho < 0.9 && E > 0.0 && fine) {
    float cur = max(length((q - vec2(0.066, 0.052)) * vec2(1.0, 0.86)) - 0.083, 0.074 - length(q - vec2(0.012, -0.012))) + 0.03 * (fb2(q * 11.0 + 5.0) - 0.5) + 0.008 * (fb2(q * 34.0 + 5.0) - 0.5);
    c = mix(c, mix(P2, P4, 0.22), edgeOf(cur, 0.0) * 0.6 * E);
    c = mix(c, mix(P2, P0, 0.35), 0.3 * edgeOf(cur + 0.018, 0.12) * E);
    float skin = max(length(q - vec2(0.085, 0.02)) - 0.07, 0.05 - length(q - vec2(0.02, 0.0))) + 0.022 * (fb2(q * 13.0 + 9.0) - 0.5) + 0.008 * (fb2(q * 36.0 + 9.0) - 0.5);
    c = mix(c, mix(P4, P6, 0.3), edgeOf(skin, 0.0) * 0.26 * E);
    c = mix(c, mix(P4, P6, 0.5), 0.4 * smoothstep(0.0026, 0.0, abs(skin)) * E);
  }
  float env = max(E * smoothstep(0.85, 0.15, abs(dAz + 0.55)), 0.85 * L2 * smoothstep(0.35, 0.95, sideL));
  b = bank(h, el, -0.02, 0.38 * max(E * smoothstep(1.1, 0.25, abs(dAz + 0.7)), 0.8 * L2 * smoothstep(0.2, 0.9, sideL)), 30.0, 19.0, max(wetB, 0.06));
  c = mix(c, mix(mix(P4, P6, 0.3), mix(P4, P5, 0.35), smoothstep(0.1, 0.8, b.y)), b.x * 0.55 * K);
  b = bank(h, el, -0.03, 0.25 * env, 42.0, 23.0, wetB);
  vec3 bc = mix(mix(P5, P6, 0.5), P5, smoothstep(0.02, 0.2, b.y));
  if (fine) {
    bc = mix(bc, mix(P5, P4, 0.3), 0.9 * bank(h, el, -0.06, 0.21 * env, 52.0, 29.0, 0.0).x);
    bc = mix(bc, mix(P5, P4, 0.58), 0.9 * bank(h, el, -0.095, 0.165 * env, 36.0, 31.0, 0.0).x);
    bc = mix(bc, mix(P5, P6, 0.5), 0.3 * smoothstep(0.55, 0.78, fb3(vec3(h * 5.0, el * 34.0) + 3.0)));
  } else bc = mix(bc, mix(P5, P4, 0.4), smoothstep(0.2, 0.9, b.y));
  c = mix(c, bc, b.x * 0.96 * K);
  float env2 = max(E * smoothstep(0.65, 0.15, abs(dAz + 0.95)), 0.6 * L2 * smoothstep(0.6, 0.98, sideL));
  b = bank(h, el, -0.03, 0.15 * env2, 30.0, 37.0, wetB);
  bc = mix(mix(P5, P4, 0.4), mix(P4, P2, 0.25), smoothstep(0.05, 0.5, b.y));
  if (fine) bc = mix(bc, mix(P4, P2, 0.5), 0.85 * bank(h, el, -0.06, 0.12 * env2, 38.0, 39.0, 0.0).x);
  c = mix(c, bc, b.x * 0.96 * K);
  float crowd = 0.0, heart = 0.0;
  if (rho < 1.0 && E > 0.0) {
    float s = uEyeM.z;
    vec2 cth = q / max(rho, 1e-5);
    float fr = fb2(cth * 2.2 + uNeb.x + 4.0) - 0.5, fr2 = fine ? vnoise(cth * 10.0 + 9.0) - 0.5 : 0.0;
    float R = s * (1.8 + 1.0 * fr + 0.16 * fr2);
    c = mix(c, mix(P4, P6, 0.42), 0.75 * exp(-rho / (s * 3.0)) * E);
    if (fine) {
      vec2 v = veil(q, vec2(-0.02, -0.03), vec2(-0.8, -0.6), 0.36, 0.14, 3.0);
      c = mix(c, mix(P4, P6, 0.78), 0.8 * v.x * E); c = mix(c, mix(P6, P4, 0.2), 0.3 * v.y * E);
      v = veil(q, vec2(0.02, -0.04), vec2(-0.26, -0.966), 0.23, 0.075, 11.0);
      c = mix(c, mix(P4, P3, 0.4), 0.62 * v.x * E); c = mix(c, mix(P6, P4, 0.3), 0.26 * v.y * E);
      v = veil(q, vec2(0.04, 0.02), vec2(0.5, -0.866), 0.24, 0.06, 23.0);
      c = mix(c, mix(P4, P6, 0.6), 0.6 * v.x * E); c = mix(c, mix(P6, P4, 0.25), 0.26 * v.y * E);
      vec2 tq = q - vec2(-0.02, -0.03) - vec2(-0.8, -0.6) * 0.38;
      crowd = smoothstep(0.03, 0.0, abs(dot(tq, vec2(0.6, -0.8)) + 0.02 * (fld - 0.5))) * smoothstep(-0.08, 0.02, dot(tq, vec2(-0.8, -0.6))) * smoothstep(0.24, 0.04, dot(tq, vec2(-0.8, -0.6)));
      crowd = max(crowd, 0.4 * smoothstep(R * 4.5, R * 2.0, rho) * smoothstep(R * 1.3, R * 2.2, rho));
      float rays = smoothstep(0.5, 0.95, vnoise(cth * 15.0 + rho / s * 0.3)) * smoothstep(R * 2.8, R * 1.05, rho) * smoothstep(R * 0.8, R * 1.05, rho);
      c = mix(c, mix(P4, P6, 0.7), 0.2 * rays * E);
    }
    c = mix(c, mix(P6, mix(P5, P4, 0.5), 0.3), 0.8 * exp(-sq((rho - R) / (s * (0.42 + 0.5 * abs(fr))))) * E);
    c = mix(c, vec3(0.95, 0.93, 0.92), 0.5 * exp(-sq((rho - R * 0.9) / (s * 0.16))) * E);
    heart = smoothstep(R * 1.02, R * 0.35, rho) * E;
    c = mix(c, vec3(0.85, 0.93, 0.97), heart);
  }
  if (fine) {
    crowd = max(crowd, smoothstep(0.08, 0.42, lift) * (1.0 - smoothstep(0.55, 0.9, lift)));
    crowd = max(crowd, 0.5 * smoothstep(0.62, 0.8, fl2));
    // Crisp high-res star specks are now rendered analytically at native DPR in STAGE_BG_FS;
    // keep only soft large nebular orbs here so magnified textures never show blurry dot blotches.
    c = mix(c, mix(vec3(1.0), P6, 0.35), 0.55 * uNeb.z * specks(r, 0.0, 31.0, 0.85) * (0.32 + 0.68 * (1.0 - smoothstep(0.25, 0.8, lum(c)))) * (1.0 - heart));
  }
  return mix(c, mix(P6, vec3(1.0), 0.5), 0.55 * exp(-el / 0.0025));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uOut;
  float az = (uv.x - 0.5) * 6.2831853;
  float el = 1.5707963 * pow(uv.y, 1.35);
  vec3 r = vec3(sin(az) * cos(el), sin(el), cos(az) * cos(el));
  vec4 res = uSide < 0.5
    ? skyPale(r, uPalU[0], uPalU[1], uPalU[2], uPalU[3], uPalU[4], uPalU[5], uPalU[6], true)
    : vec4(skyDeep(r, uPalM[0], uPalM[1], uPalM[2], uPalM[3], uPalM[4], uPalM[5], uPalM[6], true), 0.0);
  oc = vec4(clamp(sane(res.rgb, vec3(0.5)), 0.0, 1.0), clamp(res.a, 0.0, 1.0));
}
`;

export const WATERCOLOUR_SKY_BAKE_FS = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uOut;
uniform vec2 uSpan;
uniform float uPhi;
uniform int uMode;
uniform float uSeed;
uniform vec3 K_PAY;
uniform vec3 K_ULT;
uniform vec3 K_TQ;
uniform vec3 K_VIO;
uniform vec3 K_ROS;
uniform vec3 K_AMB;
uniform vec3 K_YEL;
out vec4 outColor;
float PPD;
float PX;

uint seedU;
uint lb32(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
vec3 gradAt(ivec3 c) {
  uint h = lb32(uint(c.x) ^ lb32(uint(c.y) ^ lb32(uint(c.z) ^ seedU)));
  float a = float(h & 65535u) * (6.2831853 / 65536.), z = float(h >> 16) * (2. / 65536.) - 1., r = sqrt(max(0., 1. - z * z));
  return vec3(r * cos(a), r * sin(a), z);
}
float gn(vec3 p) {
  ivec3 i = ivec3(floor(p)); vec3 f = fract(p), u = f * f * f * (f * (f * 6. - 15.) + 10.);
  float a = dot(gradAt(i), f), b = dot(gradAt(i + ivec3(1, 0, 0)), f - vec3(1, 0, 0));
  float c = dot(gradAt(i + ivec3(0, 1, 0)), f - vec3(0, 1, 0)), d = dot(gradAt(i + ivec3(1, 1, 0)), f - vec3(1, 1, 0));
  float e = dot(gradAt(i + ivec3(0, 0, 1)), f - vec3(0, 0, 1)), g = dot(gradAt(i + ivec3(1, 0, 1)), f - vec3(1, 0, 1));
  float h = dot(gradAt(i + ivec3(0, 1, 1)), f - vec3(0, 1, 1)), k = dot(gradAt(i + ivec3(1, 1, 1)), f - vec3(1, 1, 1));
  return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z) * 1.7;
}
float hashf(ivec3 c) { return float(lb32(uint(c.x) * 0x9e3779b9u ^ lb32(uint(c.y) ^ uint(c.z) + seedU * 7u))) / 4294967295.; }
mat3 RT;
float fbm(vec3 p, int n) {
  float s = 0., a = .5, w = 0.;
  for (int i = 0; i < 6; i++) { if (i >= n) break; s += a * gn(p); w += a; p = RT * p * 2.03 + vec3(3.1, -1.7, 5.3); a *= .53; }
  return s / w;
}
float f01(vec3 p, int n) { return .5 + .5 * fbm(p, n); }
vec3 orb(float k, float c) { return k * vec3(cos(uPhi + c), sin(uPhi + c), .45 * cos(2. * uPhi + 1.7 * c)); }
vec3 at(vec2 s, float f) { return vec3(s, 0.) * f; }

const vec3 PAPER = vec3(.93, .91, .86);
struct Paint { float pay, ult, tq, vio, ros, amb, yel; };
Paint none() { Paint p; p.pay = 0.; p.ult = 0.; p.tq = 0.; p.vio = 0.; p.ros = 0.; p.amb = 0.; p.yel = 0.; return p; }
Paint scaled(Paint p, float k) { p.pay *= k; p.ult *= k; p.tq *= k; p.vio *= k; p.ros *= k; p.amb *= k; p.yel *= k; return p; }
Paint mixPaint(Paint a, Paint b, float t) {
  a.pay = mix(a.pay, b.pay, t); a.ult = mix(a.ult, b.ult, t); a.tq = mix(a.tq, b.tq, t); a.vio = mix(a.vio, b.vio, t);
  a.ros = mix(a.ros, b.ros, t); a.amb = mix(a.amb, b.amb, t); a.yel = mix(a.yel, b.yel, t); return a;
}
struct Sheet { float h, rel, gran, wet, flow, settle; };
Sheet sheetAt(vec2 s) {
  Sheet S;
  float a = .6 * gn(at(s, 4.) + vec3(11.)) + .4 * gn(at(s, 9.) + vec3(-7.));
  float b = .6 * gn(at(s + vec2(.05, .05), 4.) + vec3(11.)) + .4 * gn(at(s + vec2(.05, .05), 9.) + vec3(-7.));
  S.h = a; S.rel = a - b;
  S.gran = gn(at(s, 2.6) + vec3(31.)) * .6 + gn(at(s, 6.) + vec3(53.)) * .4;
  S.wet = smoothstep(.22, .52, f01(at(s, 1. / 16.) + vec3(41.) + orb(.04, 1.), 3));
  S.flow = f01(at(s, 1. / 7.) + vec3(23.) + orb(.08, 2.7), 4);
  S.settle = smoothstep(.35, .75, f01(at(s, 1. / 5.) + vec3(61.) + orb(.05, .7), 3));
  return S;
}
vec2 wash(float d, float t, Sheet S) {
  float w = mix(.07, .44, S.wet), a = smoothstep(max(t - .25 * w, .4 * t), t + w, d);
  float rim = pow(1. - S.wet, 2.) * smoothstep(t - .1 * w, t + .25 * w, d) * (1. - smoothstep(t + .25 * w, t + 1.1 * w, d));
  return vec2(a, rim);
}
vec3 reflectance(Paint p, Sheet S) {
  float settle = max(1. + (.12 + .38 * S.settle) * (-S.h) + (.08 + .3 * S.settle) * S.gran, .3);
  vec3 k = (p.pay * K_PAY + p.ult * K_ULT) * settle + p.tq * K_TQ * mix(1., settle, .5) + p.vio * K_VIO + p.ros * K_ROS + p.amb * K_AMB + p.yel * K_YEL;
  k *= 1. + .1 * S.h;
  return PAPER * exp(-k) * (1. + .26 * S.rel);
}
vec2 bloom(vec2 s, float f, float t) {
  float b = f01(at(s, f) + vec3(17., 3., 9.) + orb(.05, 2.5), 5);
  float here = smoothstep(.5, .68, f01(at(s, f * .35) + vec3(-5., 12., 4.), 3));
  return vec2(smoothstep(t, t + .06, b), exp(-pow((b - t) / .035, 2.))) * here;
}
float salt(vec2 s) {
  float nx = max(1., floor(uSpan.x / .9 + .5)), cs = uSpan.x / nx; vec2 q = s / cs, cell = floor(q);
  ivec3 id = ivec3(int(cell.x), int(cell.y), 55);
  if (hashf(id) > .3) return 0.;
  vec2 pos = cell + .2 + .6 * vec2(hashf(id + ivec3(0, 0, 3)), hashf(id + ivec3(0, 0, 7))), d = (q - pos) * cs;
  float r = length(d), th = atan(d.y, d.x), rad = (.12 + .2 * hashf(id + ivec3(0, 0, 11)));
  rad *= 1. + .35 * sin(7. * th + 6.28 * hashf(id + ivec3(0, 0, 13))) + .2 * sin(13. * th);
  return smoothstep(rad, rad * .3, r) * (.55 + .45 * hashf(id + ivec3(0, 0, 17)));
}
float spatter(vec2 s, float dust) {
  float m = 0.;
  for (int g = 0; g < 3; g++) {
    float csN = g == 0 ? .28 : g == 1 ? 1.2 : 5.5;
    float nx = max(1., floor(uSpan.x / csN + .5)), cs = uSpan.x / nx; vec2 q = s / cs, cell = floor(q);
    ivec3 id = ivec3(int(cell.x), int(cell.y), g * 7 + 3);
    float h = hashf(id), h2 = hashf(id + ivec3(0, 0, 101)), h3 = hashf(id + ivec3(0, 0, 211));
    if (h > (g == 0 ? .2 : g == 1 ? .14 : .06)) continue;
    vec2 pos = cell + vec2(.15) + .7 * vec2(h2, h3), d = (q - pos) * cs;
    float px = g == 0 ? .45 + .8 * pow(h3, 6.) : g == 1 ? .75 + 1.0 * h3 : 1.1 + 1.4 * h3;
    float rad = px / PPD, r = length(d) * (1. + (g == 2 ? .18 : .08) * sin(5. * atan(d.y, d.x) + h * 40.));
    float op = g == 0 ? (.22 + .65 * pow(fract(h2 * 7.3 + h3), 3.)) * dust : g == 1 ? .68 : .58;
    m = max(m, smoothstep(rad, rad * (g == 2 ? .45 : .18), r) * op);
  }
  return m;
}
vec2 resist(vec2 d, float rad, float h) {
  float r = length(d), th = atan(d.y, d.x);
  float e = rad * (1. + .1 * sin(3. * th + h * 30.) + .06 * sin(5. * th + h * 17.));
  float m = 1. - smoothstep(e - .7 * PX, e + .7 * PX, r);
  float rim = exp(-pow((r - e - .7 * PX - .1 * rad) / (.16 * rad + PX), 2.));
  return vec2(m, rim * (1. - m));
}
float sparkle(vec2 d, float len, float w, float ang0) {
  float m = 0.;
  for (int i = 0; i < 8; i++) {
    float a = ang0 + float(i) * .78539816;
    vec2 u = vec2(cos(a), sin(a));
    float along = dot(d, u), across = abs(d.x * u.y - d.y * u.x);
    float L = len * ((i & 1) == 0 ? 1. : .86), t = clamp(along / L, 0., 1.);
    float wid = w * (1. - t) + .3 * PX;
    float on = smoothstep(-PX, PX, along) * (1. - smoothstep(L - 2. * PX, L, along));
    m = max(m, on * (1. - smoothstep(wid - .5 * PX, wid + .5 * PX, across)) * (1. - .6 * t * t));
  }
  return m;
}
float dry(Sheet S, float k) {
  float top = clamp(.5 + .55 * S.h + .25 * S.gran, 0., 1.);
  return smoothstep(1.08 - k - .1, 1.08 - k + .1, top);
}
float tide(float d, float t, float w) { return exp(-pow((d - t) / w, 2.)); }
vec3 finish(Paint p, Sheet S, float gouache, float mask) {
  vec3 R = reflectance(scaled(p, 1. - .96 * clamp(mask, 0., 1.)), S);
  return mix(R, PAPER * 1.03, clamp(gouache, 0., 1.));
}
Paint night(vec2 s, Sheet S, float base, float k) {
  Paint p = none();
  vec3 q = at(s, 1. / 26.) + vec3(uSeed * 13.);
  vec3 w = vec3(fbm(q + orb(.22, 0.), 4), fbm(q + vec3(4.1, 7.7, 1.3) + orb(.22, 2.), 4), 0.);
  float d = f01(q + 1.5 * w + orb(.09, 1.), 5);
  float d2 = f01(at(s, 1. / 11.) + 2. * w + vec3(9., 2., 5.) + orb(.1, 3.), 4);
  vec2 a1 = wash(.5 + .5 * w.x + .2 * d, .45, S), a2 = wash(d2, .52, S);
  p.pay = base + .2 * a1.x + .16 * a2.x + .26 * (a1.y + a2.y) + .07 * S.gran;
  p.ult = .18 + .22 * (.5 + .5 * w.y);
  vec2 lift = wash(d, .46, S);
  float l = k * lift.x * (.5 + .45 * smoothstep(.45, .85, d2));
  p.pay *= 1. - .7 * l; p.pay += .18 * lift.y * k;
  p.ult += .3 * l * (.6 + .8 * S.flow) * (1. - smoothstep(.55, .8, d2));
  p.tq += .22 * l * smoothstep(.5, .78, d2);
  p.vio += .16 * l * (1. - smoothstep(.25, .55, d2));
  vec2 bl = bloom(s, 1. / 6., .2); p.pay *= 1. - .14 * bl.x * l; p.pay += .18 * bl.y * l;
  p.pay *= 1. - .35 * salt(s);
  return p;
}

const vec3 YS[6] = vec3[6](vec3(.12, .1, 1.), vec3(-.05, .2, .6), vec3(.22, -.04, .55), vec3(.02, -.08, .5), vec3(.3, .18, .4), vec3(-.14, .02, .38));
vec3 bloomNebula(vec2 s) {
  Sheet S = sheetAt(s);
  float hh = .5 * uSpan.y; vec2 n = s / hh;
  Paint p = night(s, S, 2.05, .34);
  vec3 q = at(s, 1. / 13.) + vec3(uSeed * 5.);
  vec3 w = vec3(fbm(q + orb(.15, 0.), 4), fbm(q + vec3(5.2, 1.3, 2.8) + orb(.15, 2.1), 4), 0.);
  float cloud = smoothstep(.12, .88, f01(q + 1.6 * w + orb(.07, 1.), 5));
  float fine = f01(at(s, 1. / 4.5) + 1.3 * w + vec3(3., 8., 1.) + orb(.1, 2.4), 4);
  vec2 c = n - vec2(.05, .02);
  float r = length(c * vec2(.72, 1.)) + .32 * w.x;
  float mass = cloud + .35 * (fine - .5) - pow(r / 1.02, 2.);
  vec2 W1 = wash(smoothstep(-.1, .75, mass), .14, S);
  float heart = smoothstep(.7, .12, r + .25 * w.y - .15 * fine);
  float tone = mix(.7, 1.3, S.flow);
  p.pay *= 1. - .8 * W1.x; p.pay += .3 * W1.y;
  p.ult += tone * W1.x * (.62 - .5 * heart);
  p.ros += tone * W1.x * .85 * heart * (.65 + .6 * fine);
  p.tq += .3 * W1.x * smoothstep(.55, 1., r) * smoothstep(.4, .7, fine);
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    vec2 ck = vec2(cos(fk * 2.3 + .6), sin(fk * 2.3 + .6)) * (.3 + .14 * fk) + vec2(.05, 0.), dv = n - ck;
    float ak = atan(dv.y, dv.x); vec2 dir = vec2(cos(ak), sin(ak));
    float rk = (.11 + .045 * fk) * (1. + .25 * fbm(vec3(dir * 1.6, fk * 5.) + orb(.03, fk), 3));
    float dk = length(dv) + .02 * fbm(vec3(dir * 8., fk + 2.), 3) + .012 * fbm(at(s, 1.4) + vec3(fk * 3.), 2);
    float inside = (1. - smoothstep(rk - .008, rk + .008, dk)) * W1.x;
    float edge = tide(dk, rk, .008) * W1.x;
    float t1 = rk * (.74 + .06 * fbm(vec3(dir * 3., fk + 9.), 2)), t2 = rk * (.5 + .08 * fbm(vec3(dir * 3., fk + 13.), 2));
    float tides = (tide(dk, t1, .005) * .5 + tide(dk, t2, .004) * .3) * inside;
    p.pay *= 1. - .14 * inside; p.ult *= 1. - .18 * inside; p.ros *= 1. - .18 * inside;
    p.pay += .35 * edge + .25 * tides; p.ult += .3 * edge + .2 * tides; p.ros += .2 * edge * heart;
  }
  float lane = smoothstep(.64, .86, f01(at(s, 1. / 6.) + 1.3 * w + vec3(8.) + orb(.05, 1.), 4)) * smoothstep(.95, .3, r);
  float feath = f01(at(s, 1.1) + vec3(2.) + .5 * w, 3);
  p.pay += .9 * lane * (.5 + .7 * feath) * W1.x; p.ros *= 1. - .5 * lane; p.ult *= 1. - .3 * lane;
  float mask = 0., g8 = 0., warm = 0.;
  for (int i = 0; i < 6; i++) {
    vec2 d = (n - YS[i].xy) * hh; float z = YS[i].z;
    vec2 R = resist(d, .08 + .26 * z * z, fract(float(i) * .37));
    mask = max(mask, R.x); p.pay += .3 * R.y;
    warm += exp(-dot(d, d) / pow(1. + 2.2 * z, 2.)) * z;
    if (i == 0) g8 = sparkle(d, 2.2, .08, .1);
  }
  vec2 Wa = wash(warm * heart * 1.3, .3, S); p.amb += .7 * Wa.x; p.ros *= 1. - .4 * Wa.x; p.ult *= 1. - .4 * Wa.x;
  vec2 bl = bloom(s, 1. / 5., .17); p.pay *= 1. - .2 * bl.x * W1.x; p.pay += .25 * bl.y * W1.x;
  float sp = max(spatter(s, .18 + .38 * smoothstep(1.3, .3, r)), .85 * g8);
  return finish(p, S, sp, mask);
}

vec3 eclipse(vec2 s) {
  Sheet S = sheetAt(s);
  float hh = .5 * uSpan.y; vec2 n = s / hh;
  Paint p = night(s, S, 2.1, .28);
  float R = .38;
  vec2 v = (n - vec2(0.18, 0.04)) / R;
  float r = length(v), th = atan(v.y, v.x), pxr = PX / (hh * R);
  vec3 q = at(s, 1. / 9.) + vec3(uSeed * 4.);
  vec3 w = vec3(fbm(q + orb(.2, 0.), 4), fbm(q + vec3(5.2, 1.3, 2.8) + orb(.2, 2.1), 4), 0.);
  float thb = th + .035 * sin(uPhi) + .1 * (r - 1.) * sin(2. * th + .7);
  vec2 cs = vec2(cos(thb), sin(thb));
  float hair = f01(vec3(cs * 9., log(max(r, .2)) * 1.2 - uSeed) + .25 * w, 4);
  float hair2 = f01(vec3(cs * 30., log(max(r, .2)) * 2.5 + 3.) + .12 * w, 4);
  float eq = pow(abs(cos(thb - .35)), 3.), pol = pow(abs(sin(thb - .35)), 8.);
  float L = .12 + .98 * eq * (.55 + .7 * hair) + .32 * pol * hair2 + .12 * hair;
  float I = exp(-max(r - 1., 0.) / L) * smoothstep(.97, 1.01, r) * (.78 + .4 * hair2);
  vec2 Wc = wash(I, .12, S);
  float strokes = dry(S, .5) * smoothstep(.55, .8, hair2) * smoothstep(.03, .2, I) * (1. - smoothstep(.35, .6, I));
  p.pay *= 1. - .84 * Wc.x - .3 * strokes; p.pay += .15 * Wc.y;
  p.ult += .45 * Wc.x * (1. - smoothstep(.25, .95, I)) + .16 * strokes;
  p.tq += .30 * Wc.x * smoothstep(.2, .6, I) * (1. - smoothstep(.7, 1., I));
  p.vio += .14 * Wc.x * smoothstep(.18, .03, I);
  float prom = 0.;
  for (int k = 0; k < 6; k++) {
    float ak = 6.2831853 * hashf(ivec3(k, 3, 91)) - 3.14159265, wk = .04 + .07 * hashf(ivec3(k, 5, 91)), hk = .04 + .07 * hashf(ivec3(k, 7, 91));
    float da = abs(mod(th - ak + 3.14159265, 6.2831853) - 3.14159265);
    float top = hk * max(1. - pow(da / wk, 2.), 0.) * (.55 + .75 * f01(vec3(cs * 14., r * 40.) + vec3(float(k) * 3.), 3));
    if (top > 1e-4) prom = max(prom, smoothstep(.995, 1.005, r) * (1. - smoothstep(top * .35, top, r - 1.)));
  }
  p.ros += .95 * prom; p.pay *= 1. - .75 * prom; p.ult *= 1. - .6 * prom;
  float disc = 1. - smoothstep(.993 - pxr, .993 + pxr, r);
  p.pay = mix(p.pay, 3.3 + .2 * S.gran, disc); p.ult = mix(p.ult, .5, disc);
  p.tq *= 1. - disc; p.ros *= 1. - disc; p.vio *= 1. - disc;
  float ring = exp(-pow((r - 1.) / max(.0048, 1.3 * pxr), 2.)) * (.7 + .3 * smoothstep(.25, .6, hair2));
  float ba = .72;
  vec2 db = (v - vec2(cos(ba), sin(ba))) * R * hh;
  float bg = exp(-dot(db, db) / pow(1.8, 2.));
  vec2 Wb = wash(bg * 1.3, .25, S); p.amb += .8 * Wb.x; p.pay *= 1. - .6 * Wb.x; p.ult *= 1. - .5 * Wb.x;
  vec2 Rb = resist(db, .34, .3);
  float g8 = sparkle(db, 2.8, .085, .12);
  float sp = max(spatter(s, .5) * (1. - disc) * (1. - .7 * Wc.x), max(.9 * ring, .85 * g8));
  return finish(p, S, sp, Rb.x);
}

vec3 dawn(vec2 s) {
  Sheet S = sheetAt(s);
  float hh = .5 * uSpan.y; vec2 n = s / hh;
  Paint p = night(s, S, 2.15, .24);
  vec2 C0 = vec2(-.55, -4.05); float RR = 3.72;
  vec2 o = n - C0; float d = length(o) - RR, ang = atan(o.x, o.y);
  float sun = exp(-pow((ang - .32) / .22, 2.));
  vec3 q = vec3(ang * 9., d * 4., 0.) + vec3(uSeed * 6.);
  vec3 w = vec3(fbm(q * .6 + orb(.15, 0.), 4), fbm(q * .6 + vec3(4., 1., 6.) + orb(.15, 2.), 4), 0.);
  float dd = d, up = max(d + .015 * w.x * smoothstep(0., .04, d), 0.);
  float glow = (.28 + .78 * sun) * exp(-up / (.34 + .32 * sun)) + .16 * exp(-up / 1.4);
  float cov = smoothstep(0., .55, glow * (.93 + .14 * w.y)) * (.9 + .2 * (S.flow - .5));
  float tone = mix(.75, 1.25, S.flow);
  p.pay *= 1. - .85 * cov;
  vec2 Wm = wash(sun * exp(-up / .09), .2, S);
  p.amb += tone * 1.05 * Wm.x; p.pay *= 1. - .8 * Wm.x; p.ult *= 1. - .6 * Wm.x;
  float core = exp(-pow((ang - .32) / .075, 2.)) * exp(-up / .13);
  p.pay *= 1. - .95 * core; p.ult *= 1. - core; p.ros *= 1. - .6 * core; p.yel += .55 * core;
  p.ros += tone * .7 * wash((.4 + .6 * sun) * exp(-up / .2), .25, S).x * (1. - .5 * exp(-up / .05));
  p.ult += tone * .5 * cov * smoothstep(.04, .3, up) * (1. - .3 * sun);
  p.tq += .22 * cov * smoothstep(.25, .8, up);
  p.yel += .5 * sun * exp(-up / .025);
  float pl = 1. - smoothstep(-PX / hh, PX / hh, dd);
  float bands = f01(vec3(ang * 14., d * 22., 2.) + .4 * w, 4);
  Paint P = none();
  P.pay = 2.7 + .25 * smoothstep(.3, .8, bands) + .06 * S.gran; P.ult = .45;
  float limb = exp(min(dd, 0.) / .05) * (.3 + .7 * sun);
  P.pay *= 1. - .6 * limb; P.amb += .4 * limb * sun; P.ros += .3 * limb;
  p = mixPaint(p, P, pl);
  float line = exp(-pow(dd / max(.004, 1.3 * PX / hh), 2.)) * (.35 + .65 * sun);
  float sp = max(spatter(s, .6) * smoothstep(.1, .6, up) * (1. - pl), .85 * line);
  return finish(p, S, sp, 0.);
}

void main() {
  seedU = uint(uSeed * 7919.) + 17u;
  float a = .61, b = 1.13;
  RT = mat3(1., 0., 0., 0., cos(a), sin(a), 0., -sin(a), cos(a)) * mat3(cos(b), sin(b), 0., -sin(b), cos(b), 0., 0., 0., 1.);
  vec2 uv = gl_FragCoord.xy / uOut;
  vec2 s = (uv - .5) * uSpan;
  PPD = min(uOut.x / uSpan.x, uOut.y / uSpan.y);
  PX = 1. / PPD;
  vec3 c = uMode == 2 ? bloomNebula(s) : uMode == 5 ? dawn(s) : eclipse(s);
  outColor = vec4(pow(clamp(c, 0., 1.), vec3(1. / 2.2)), 1.);
}
`;
