/**
 * Native WebGL2 Two-Pass Stage Sky + Analytical-Gradient SDF Liquid Glass Compositor.
 * Ported from NAMELESSAurora/lumen-folio (`StageLiquidGlassCanvas.tsx`) with zero extra
 * runtime dependencies, hidden-tab pausing, and automatic CSS fallback on low/reduced tiers.
 */

import {
  LIQUID_GLASS_PRESETS,
  type GlassPresetId,
  glassRegistry,
} from './liquid-glass';
import type { PerformanceTier } from './performance-tier';
import {
  FULLSCREEN_VS_300,
  MOOD_ATMOSPHERES,
  TWO_SKY_BAKE_FS,
  TWO_SKY_FIRM,
  TWO_SKY_PAL_M,
  TWO_SKY_PAL_U,
  WATERCOLOUR_SKY_BAKE_FS,
  type CompanionAtmosphere,
  type StageSkyId,
  computePaintPigments,
  hexToRgbNormalized,
  lerp,
} from './stage-skies';

const MAX_SHAPES = 14;

export interface PointerState {
  x: number;
  y: number;
  nx: number;
  ny: number;
  speed: number;
  active: boolean;
}

const STAGE_BG_FS = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexPale;
uniform sampler2D uTexDeep;
uniform sampler2D uTexWc;
uniform float uPaleReady;
uniform float uDeepReady;
uniform float uWcReady;

uniform float uW0;
uniform float uW1;
uniform float uW2;

uniform float uTime;
uniform float uScroll;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uFoilBoost;
uniform float uAudioEnergy;
uniform vec3 uPigmentA;
uniform vec3 uPigmentB;
uniform vec3 uFoilA;
uniform vec3 uFoilB;
uniform vec4 uSun;
uniform int uAuroraSteps;

mat2 mm2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float tri(float x) { return clamp(abs(fract(x) - 0.5), 0.01, 0.49); }
vec2 tri2(vec2 p) { return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x))); }

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec2 hash22(vec2 p) {
  float n = hash21(p);
  return vec2(n, hash21(p + n * 17.31 + 3.7));
}

float triNoise2d(vec2 p, float ph) {
  float z = 1.8, z2 = 2.5, rz = 0.0;
  p *= mm2(p.x * 0.06);
  vec2 bp = p;
  for (int i = 0; i < 4; i++) {
    vec2 dg = tri2(bp * 1.85) * 0.75;
    dg *= mm2(ph);
    p -= dg / z2;
    bp *= 1.3; z2 *= 0.45; z *= 0.42;
    p *= 1.21 + (rz - 1.0) * 0.02;
    rz += tri(p.x + tri(p.y)) * z;
    p *= -mat2(0.95534, 0.29552, -0.29552, 0.95534);
  }
  return clamp(1.0 / pow(max(rz * 29.0, 1e-3), 1.3), 0.0, 0.55);
}

// 4-tap GPU hardware-accelerated bicubic B-spline filter eliminates bilinear diamond/block artifacts
vec4 cubicWeights(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  float w = 6.0 - x - y - z;
  return vec4(x, y, z, w) * (1.0 / 6.0);
}

vec4 textureBicubic(sampler2D tex, vec2 uv) {
  vec2 texSize = vec2(textureSize(tex, 0));
  vec2 invSize = 1.0 / texSize;
  vec2 tc = uv * texSize - 0.5;
  vec2 f = fract(tc);
  tc -= f;
  vec4 xc = cubicWeights(f.x);
  vec4 yc = cubicWeights(f.y);
  vec4 c = tc.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 offset = (c + vec4(xc.yw, yc.yw) / s) * invSize.xxyy;
  vec4 s0 = texture(tex, offset.xz);
  vec4 s1 = texture(tex, offset.yz);
  vec4 s2 = texture(tex, offset.xw);
  vec4 s3 = texture(tex, offset.yw);
  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);
  return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy);
}

vec3 rotY(vec3 v, float a) {
  float c = cos(a), s = sin(a);
  return vec3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
}

vec3 dirOf(float az, float el) {
  return vec3(sin(az) * cos(el), sin(el), cos(az) * cos(el));
}

vec2 chartOf(vec3 r, vec3 a) {
  vec3 t1 = normalize(cross(vec3(0.0, 1.0, 0.0), a));
  vec3 t2 = cross(a, t1);
  vec2 p = vec2(dot(r, t1), dot(r, t2));
  return p * (acos(clamp(dot(r, a), -1.0, 1.0)) / max(length(p), 1e-5));
}

vec4 sampleTwoSky(sampler2D tex, float ready, vec3 rotRay, vec3 fbLow, vec3 fbHigh) {
  float az = atan(rotRay.x, rotRay.z);
  float el = asin(clamp(max(rotRay.y, 0.0005), 0.0, 1.0));
  vec2 uv = vec2(fract(az / 6.2831853 + 0.5), clamp(pow(el / 1.5707963, 0.740741), 0.002, 0.998));
  vec4 baked = textureBicubic(tex, uv);
  vec3 fb = mix(fbLow, fbHigh, smoothstep(0.0, 0.78, uv.y));
  return vec4(mix(fb, baked.rgb, ready), baked.a * ready);
}

vec3 sampleWatercolour(sampler2D tex, float ready, vec2 uv, vec2 pan) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float texAsp = 16.0 / 9.0;
  vec2 p = uv - 0.5;
  if (aspect > texAsp) {
    p.y *= texAsp / aspect;
  } else {
    p.x *= aspect / texAsp;
  }
  vec2 suv = clamp(p * 0.94 + 0.5 + pan, vec2(0.003), vec2(0.997));
  vec3 baked = textureBicubic(tex, suv).rgb;
  vec3 fb = mix(vec3(0.08, 0.09, 0.14), mix(uPigmentA, uPigmentB, uv.x) * 0.42, smoothstep(0.0, 0.9, uv.y));
  vec3 col = mix(fb, baked, ready);
  // Subtle real-time mood pigment glaze avoids full-FBO re-bakes on every avatar mood change
  vec3 moodGlaze = mix(uPigmentA, uPigmentB, clamp(uv.x * 0.8 + uv.y * 0.2, 0.0, 1.0));
  return mix(col, col * mix(vec3(1.0), moodGlaze * 1.45 + 0.25, 0.18), ready);
}

// Analytical Retina-sharp sun disc, sunbeams, concentric architectural pencil rings & 36 orbit dots
vec3 compositePaleSun(vec3 col, float cloudOcc, vec3 paleRay, float isWater, float ready) {
  vec3 sunDir = dirOf(uSun.x, uSun.y);
  float ang = acos(clamp(dot(paleRay, sunDir), -1.0, 1.0));
  // Compute screen-space derivative BEFORE any non-uniform per-pixel branch (GLSL ES 3.00 spec)
  float pxAng = max(fwidth(ang), 0.00055);
  if (ang > 0.75 || ready < 0.005) return col;

  float Rs = uSun.z * 2.45;
  float skyVis = (1.0 - smoothstep(0.14, 0.74, cloudOcc)) * (1.0 - isWater * 0.65) * ready;

  vec2 qs = chartOf(paleRay, sunDir);
  float th = atan(qs.y, qs.x);
  float thOrbit = th + uTime * 0.018;

  // Soft radiating sunbeams behind clouds
  float rayBand = smoothstep(Rs * 1.08, Rs * 2.3, ang) * smoothstep(Rs * 6.8, Rs * 1.6, ang);
  float rayPat = 0.5 + 0.5 * sin(th * 9.0 + sin(th * 3.0 - uTime * 0.04) * 1.1);
  float sunRays = pow(rayPat, 2.2) * rayBand * 0.14 * skyVis;
  col = mix(col, vec3(1.0, 0.97, 0.94), sunRays * uSun.w);

  // Two razor-sharp concentric architectural drafting rings (exact pixel-width AA)
  vec3 pencil = vec3(0.55, 0.54, 0.76);
  float ringHalf = max(0.00085, pxAng * 0.85);
  float aa = pxAng * 1.05;
  float r1 = 1.0 - smoothstep(ringHalf - aa * 0.4, ringHalf + aa, abs(ang - Rs * 1.19));
  float r2 = 1.0 - smoothstep(ringHalf - aa * 0.4, ringHalf + aa, abs(ang - Rs * 1.38));

  // 36 true-circular orbit dots spaced evenly along Rd
  float Rd = Rs * 1.84;
  float sector = 6.2831853 / 36.0;
  float dArc = (fract(thOrbit / sector + 0.5) - 0.5) * sector * Rd;
  float dotDist = length(vec2(ang - Rd, dArc));
  float dotRad = max(0.0019, pxAng * 1.45);
  float dots = 1.0 - smoothstep(dotRad - aa * 0.85, dotRad + aa * 0.85, dotDist);

  float draftingAlpha = clamp(r1 * 0.62 + r2 * 0.48 + dots * 0.68, 0.0, 0.78) * skyVis * uSun.w;
  col = mix(col, pencil, draftingAlpha);

  // Backlit warm solar halo (bleeds softly over sunlit cloud rims)
  float halo = (0.34 * exp(-ang / (Rs * 1.25)) + 0.10 * exp(-ang / (Rs * 4.2))) * (1.0 + 0.22 * uAudioEnergy) * ready;
  col = mix(col, vec3(1.0, 0.965, 0.92), clamp(halo * (1.0 - cloudOcc * 0.52) * uSun.w, 0.0, 0.65));

  // Crisp circular cream-white sun disc occluded smoothly by foreground clouds
  float disc = 1.0 - smoothstep(Rs - aa, Rs + aa, ang);
  col = mix(col, vec3(0.992, 0.986, 0.972), disc * skyVis * uSun.w);
  return col;
}

// Crisp native-pixel procedural starfield for dark skies (zero magnified texture blobs)
float crispStars(vec3 r) {
  vec2 g = r.xz / (1.0 + max(r.y, 0.02)) * 2.0;
  float px = max(length(fwidth(g)), 0.0004);
  float acc = 0.0;
  for (int l = 0; l < 2; l++) {
    float scale = l == 0 ? 78.0 : 34.0;
    vec2 p = g * scale + float(l) * 19.3;
    vec2 id = floor(p);
    vec2 h = hash22(id + float(l) * 11.7);
    float keep = step(l == 0 ? 0.84 : 0.92, h.x);
    vec2 cellPos = 0.18 + 0.64 * hash22(id + 5.1);
    float d = length(fract(p) - cellPos) / scale;
    float rad = (l == 0 ? 0.85 : 1.35) * px;
    float tw = 0.72 + 0.28 * sin(uTime * (0.9 + 2.1 * h.y) + h.x * 50.0);
    float core = 1.0 - smoothstep(rad * 0.25, rad * 1.25, d);
    float glow = l == 1 ? 0.28 * exp(-d / max(rad * 2.8, 1e-4)) : 0.0;
    acc = max(acc, (core + glow) * keep * tw * (l == 0 ? 0.72 : 1.0));
  }
  return acc * smoothstep(0.04, 0.34, r.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 ndc = vUv * 2.0 - 1.0;

  // Strictly isotropic pinhole camera projection (identical horizontal & vertical tanHalfFov -> 1:1 true circles)
  float tanHalfFov = 0.50;
  float yaw = (uPointer.x - 0.5) * 0.14 + sin(uTime * 0.04) * 0.045 + uScroll * 0.12;
  float pitch = 0.42 + (uPointer.y - 0.5) * 0.055 - uScroll * 0.04;
  vec3 raw = normalize(vec3(ndc.x * tanHalfFov * aspect, ndc.y * tanHalfFov, 1.0));
  float cp = cos(pitch), sp = sin(pitch);
  vec3 ray = vec3(raw.x, raw.y * cp + raw.z * sp, -raw.y * sp + raw.z * cp);

  float isWater = smoothstep(0.015, -0.025, ray.y);
  vec3 reflRay = ray;
  if (isWater > 0.001) {
    float rip = sin(vUv.x * 52.0 + uTime * 1.1) * 0.0016 + cos(vUv.y * 110.0 - uTime * 1.4) * 0.0020;
    reflRay.y = abs(ray.y) + 0.014 + rip;
    reflRay.x += rip * 1.3;
    reflRay = normalize(reflRay);
  }
  vec3 sampleRay = mix(ray, reflRay, isWater);

  vec3 paleCol = vec3(0.0);
  if (uW0 > 0.002) {
    vec3 paleRay = rotY(sampleRay, yaw - 0.32);
    vec4 paleSample = sampleTwoSky(
      uTexPale, uPaleReady, paleRay,
      vec3(0.98, 0.89, 0.85), vec3(0.62, 0.70, 0.92)
    );
    paleCol = compositePaleSun(paleSample.rgb, paleSample.a, paleRay, isWater, uPaleReady);
    // Subtle native-pixel cold-press cotton paper micro-tooth (no magnified blotches)
    float tooth = (hash21(floor(gl_FragCoord.xy * 0.75)) - 0.5) * 0.018;
    paleCol = clamp(paleCol + tooth, 0.0, 1.0);
    paleCol = mix(paleCol, paleCol * vec3(0.94, 0.95, 0.99) + vec3(0.02), isWater * 0.28);
  }

  vec3 deepCol = vec3(0.0);
  if (uW1 > 0.002) {
    vec3 deepRay = rotY(sampleRay, yaw + 0.24);
    deepCol = sampleTwoSky(
      uTexDeep, uDeepReady, deepRay,
      vec3(0.56, 0.15, 0.30), vec3(0.14, 0.07, 0.23)
    ).rgb;
    float starAmt = crispStars(deepRay) * (1.0 - isWater * 0.7);
    deepCol = mix(deepCol, vec3(1.0, 0.95, 0.98), starAmt * 0.82);
    deepCol = mix(deepCol, deepCol * 0.76, isWater * 0.35);
  }

  vec3 wcCol = vec3(0.0);
  if (uW2 > 0.002) {
    vec2 wcPan = vec2((uPointer.x - 0.5) * 0.022 + sin(uTime * 0.055) * 0.007, (uPointer.y - 0.5) * 0.016 - uScroll * 0.018);
    wcCol = sampleWatercolour(uTexWc, uWcReady, vUv, wcPan);
  }

  vec3 sky = paleCol * uW0 + deepCol * uW1 + wcCol * uW2;

  float darkWeight = clamp(uW1 + uW2, 0.0, 1.0);
  if (darkWeight > 0.01 && ray.y > 0.0) {
    float dither = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    vec3 aur = vec3(0.0);
    vec3 avg = vec3(0.0);
    float lift = 0.82 + uAudioEnergy * 0.95 + uFoilBoost * 0.38;
    vec3 rd = normalize(vec3(ray.x, max(ray.y, 0.02), ray.z));
    for (int i = 0; i < 12; i++) {
      if (i >= uAuroraSteps) break;
      float k = (float(i) + dither) * (37.2 / float(max(uAuroraSteps, 1)));
      float pt = (0.85 + pow(k, 1.35) * 0.0022 * lift) / (rd.y * 2.0 + 0.42);
      vec2 ap = vec2(-4.2 + pt * rd.z, pt * rd.x);
      float rz = triNoise2d(ap, uTime * 0.04);
      vec3 c2 = mix(uFoilB, uFoilA, smoothstep(4.0, 32.0, k)) * rz;
      avg = mix(avg, c2, 0.5);
      aur += avg * exp2(-k * 0.072 / lift - 2.45) * smoothstep(0.0, 4.5, k) * (37.2 / float(max(uAuroraSteps, 1)));
    }
    aur *= clamp(rd.y * 12.0 + 0.2, 0.0, 1.0);
    sky += aur * darkWeight * (0.24 + 0.32 * uFoilBoost + 0.55 * uAudioEnergy);
  }

  float dth = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  fragColor = vec4(clamp(sky + dth, 0.0, 1.0), 1.0);
}
`;

const SEP_BLUR_FS = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTex;
uniform vec2 uDir;

void main() {
  vec3 acc = texture(uTex, vUv).rgb * 0.19648255;
  acc += texture(uTex, clamp(vUv + uDir * 1.41176, vec2(0.002), vec2(0.998))).rgb * 0.29690696;
  acc += texture(uTex, clamp(vUv - uDir * 1.41176, vec2(0.002), vec2(0.998))).rgb * 0.29690696;
  acc += texture(uTex, clamp(vUv + uDir * 3.29412, vec2(0.002), vec2(0.998))).rgb * 0.09447039;
  acc += texture(uTex, clamp(vUv - uDir * 3.29412, vec2(0.002), vec2(0.998))).rgb * 0.09447039;
  acc += texture(uTex, clamp(vUv + uDir * 5.17647, vec2(0.002), vec2(0.998))).rgb * 0.01038136;
  acc += texture(uTex, clamp(vUv - uDir * 5.17647, vec2(0.002), vec2(0.998))).rgb * 0.01038136;
  fragColor = vec4(acc, 1.0);
}
`;

const LIQUID_GLASS_COMPOSITE_FS = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uBg;
uniform sampler2D uBlur;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uIsDark;

uniform int uCount;
uniform vec4 uRects[${MAX_SHAPES}];
uniform vec4 uMeta[${MAX_SHAPES}];
uniform vec4 uOptics[${MAX_SHAPES}];

uniform float uMagnify;
uniform float uVibrancy;
uniform float uBrightness;
uniform float uColorFromBelow;
uniform float uRimLight;
uniform float uRimWidth;
uniform float uShadow;
uniform float uMergeDist;

vec3 sdgRoundedBox(vec2 p, vec2 b, float r) {
  float rr = min(r, min(b.x, b.y));
  vec2 s = vec2(p.x < 0.0 ? -1.0 : 1.0, p.y < 0.0 ? -1.0 : 1.0);
  vec2 w = abs(p) - (b - rr);
  vec2 g = max(w, 0.0);
  float m = length(g);
  if (m > 0.0001) return vec3(m - rr, s * (g / m));
  if (w.x > w.y) return vec3(w.x - rr, vec2(s.x, 0.0));
  return vec3(w.y - rr, vec2(0.0, s.y));
}

vec3 sminGrad(vec3 a, vec3 b, float k) {
  float kk = max(k, 0.001);
  float h = max(kk - abs(a.x - b.x), 0.0) / kk;
  float m = h * h * 0.5;
  float s = m * kk * 0.5;
  if (a.x < b.x) {
    vec2 g = mix(a.yz, b.yz, m);
    float gl = length(g);
    return vec3(a.x - s, gl > 1e-4 ? g / gl : a.yz);
  }
  vec2 g = mix(b.yz, a.yz, m);
  float gl = length(g);
  return vec3(b.x - s, gl > 1e-4 ? g / gl : b.yz);
}

vec3 sampleSpectralGlass(vec2 bgUv, vec2 refractUv, float dispersion, float blurMix, float edgeFactor) {
  vec2 delta = refractUv - bgUv;
  float spread = dispersion * (0.22 + 0.78 * edgeFactor) * 0.58;

  vec2 uv0 = clamp(bgUv + delta * (1.0 + spread * 1.00), vec2(0.002), vec2(0.998));
  vec2 uv1 = clamp(bgUv + delta * (1.0 + spread * 0.45), vec2(0.002), vec2(0.998));
  vec2 uv2 = clamp(refractUv, vec2(0.002), vec2(0.998));
  vec2 uv3 = clamp(bgUv + delta * (1.0 - spread * 0.45), vec2(0.002), vec2(0.998));
  vec2 uv4 = clamp(bgUv + delta * (1.0 - spread * 1.00), vec2(0.002), vec2(0.998));

  vec3 c0 = mix(texture(uBg, uv0).rgb, texture(uBlur, uv0).rgb, blurMix);
  vec3 c1 = mix(texture(uBg, uv1).rgb, texture(uBlur, uv1).rgb, blurMix);
  vec3 c2 = mix(texture(uBg, uv2).rgb, texture(uBlur, uv2).rgb, blurMix);
  vec3 c3 = mix(texture(uBg, uv3).rgb, texture(uBlur, uv3).rgb, blurMix);
  vec3 c4 = mix(texture(uBg, uv4).rgb, texture(uBlur, uv4).rgb, blurMix);

  return vec3(
    c0.r * 0.48 + c1.r * 0.34 + c2.r * 0.18,
    c1.g * 0.26 + c2.g * 0.48 + c3.g * 0.26,
    c2.b * 0.18 + c3.b * 0.34 + c4.b * 0.48
  );
}

void main() {
  vec2 cssRes = uResolution / max(uDpr, 0.5);
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / max(uDpr, 0.5);
  vec2 pSh = p - vec2(0.0, 7.0);
  vec2 bgUv = vUv;

  vec3 col = texture(uBg, bgUv).rgb;
  if (uCount <= 0) {
    fragColor = vec4(col, 1.0);
    return;
  }

  float minSh = 1e6;
  bool hasG1 = false;
  vec3 g1DG = vec3(1e6, 0.0, -1.0);
  vec4 g1Rect = vec4(0.0);
  vec4 g1Meta = vec4(0.0);
  vec4 g1Opt = vec4(0.0);
  float g1BestD = 1e6;

  bool hasWin = false;
  vec3 winDG = vec3(1e6, 0.0, -1.0);
  vec4 winRect = vec4(0.0);
  vec4 winMeta = vec4(0.0);
  vec4 winOpt = vec4(0.0);

  for (int i = 0; i < ${MAX_SHAPES}; i++) {
    if (i >= uCount) break;
    vec4 r = uRects[i];
    vec4 m = uMeta[i];
    vec4 o = uOptics[i];

    vec2 qs = abs(pSh - r.xy) - r.zw + min(m.x, min(r.z, r.w));
    float ds = min(max(qs.x, qs.y), 0.0) + length(max(qs, 0.0)) - min(m.x, min(r.z, r.w));
    minSh = min(minSh, ds);

    vec3 dg = sdgRoundedBox(p - r.xy, r.zw, m.x);

    if (m.z > 0.5) {
      g1DG = hasG1 ? sminGrad(g1DG, dg, uMergeDist) : dg;
      hasG1 = true;
      if (dg.x < g1BestD) {
        g1BestD = dg.x;
        g1Rect = r;
        g1Meta = m;
        g1Opt = o;
      }
    } else if (dg.x < 1.5) {
      hasWin = true;
      winDG = dg;
      winRect = r;
      winMeta = m;
      winOpt = o;
    }
  }

  if (hasG1 && g1DG.x < 1.5) {
    hasWin = true;
    winDG = g1DG;
    winRect = g1Rect;
    winMeta = g1Meta;
    winOpt = g1Opt;
  }

  if (minSh > -2.0 && minSh < 46.0) {
    float sMask = exp(-max(minSh, 0.0) / 14.0) * uShadow * mix(0.26, 0.54, uIsDark);
    col *= 1.0 - sMask;
  }

  if (!hasWin) {
    fragColor = vec4(col, 1.0);
    return;
  }

  float coverage = 1.0 - smoothstep(-0.75, 0.85, winDG.x);
  if (coverage <= 0.001) {
    fragColor = vec4(col, 1.0);
    return;
  }

  float edgeShape = winMeta.y;
  float edgeWidth = max(winMeta.w, 10.0);
  float refractPx = winOpt.x;
  float dispersion = winOpt.y;
  float blurMix = winOpt.z;
  float frost = winOpt.w;

  float minDim = min(winRect.z, winRect.w) * 2.0;
  float sizeScale = clamp(minDim / 56.0, 0.78, 1.48);
  float effEdge = min(edgeWidth * mix(0.88, 1.2, clamp((minDim - 40.0) / 180.0, 0.0, 1.0)), minDim * 0.49);

  float distIn = max(-winDG.x, 0.0);
  float t = clamp(distIn / max(effEdge, 1.0), 0.0, 1.0);
  vec2 normal = winDG.yz;

  float u = 1.0 - t;
  float bendProfile;
  if (edgeShape < 0.5) {
    float u3 = u * u * u;
    float u4 = u3 * u;
    float domeSlope = u3 / max(pow(max(1.0 - u4, 0.0), 0.72), 0.14);
    bendProfile = min(domeSlope, 3.6) * 0.46;
  } else {
    float lipRim = pow(u, 2.0) * 1.55;
    float innerDish = -0.36 * sin(3.14159265 * clamp((t - 0.2) / 0.8, 0.0, 1.0));
    bendProfile = lipRim + innerDish;
  }

  vec2 refractOffsetPx = -normal * bendProfile * refractPx * sizeScale;
  vec2 fromCenterCss = p - winRect.xy;
  vec2 magOffsetPx = -fromCenterCss * (1.0 - 1.0 / max(uMagnify, 1.0)) * (0.45 + 0.55 * t);
  if (winMeta.z > 0.5) magOffsetPx *= 0.22;

  vec2 totalOffsetPx = refractOffsetPx + magOffsetPx;
  vec2 refractUv = bgUv + vec2(totalOffsetPx.x / cssRes.x, -totalOffsetPx.y / cssRes.y);

  float edgeFactor = pow(u, 1.35);
  vec3 glassCol = sampleSpectralGlass(bgUv, refractUv, dispersion, blurMix, edgeFactor);

  float luma = dot(glassCol, vec3(0.2126, 0.7152, 0.0722));
  glassCol = max(mix(vec3(luma), glassCol, uVibrancy), 0.0);

  vec3 belowGlow = texture(uBlur, clamp(bgUv, vec2(0.004), vec2(0.996))).rgb;
  glassCol = mix(glassCol, belowGlow * 1.1, uColorFromBelow * 0.3);

  vec3 frostTint = mix(vec3(0.99, 0.985, 0.975), vec3(0.09, 0.085, 0.15), uIsDark * 0.65);
  glassCol = mix(glassCol, frostTint, frost);
  glassCol += vec3(uBrightness);

  float innerShade = smoothstep(0.0, 0.2, t) * (1.0 - smoothstep(0.2, 0.62, t));
  glassCol *= 1.0 - innerShade * (0.045 + 0.05 * edgeShape);

  vec2 lightDir = normalize(vec2(-0.7071, -0.7071));
  float ndlTop = max(dot(normal, lightDir), 0.0);
  float ndlBot = max(dot(normal, -lightDir), 0.0);
  float rimSharp = 1.0 - smoothstep(0.0, max(uRimWidth * 1.4, 1.35), distIn);
  float rimGlow = (1.0 - smoothstep(0.0, max(uRimWidth * 6.0, 6.0), distIn)) * 0.32;

  float spec = pow(ndlTop, 1.45) + pow(ndlBot, 2.0) * 0.72;
  float rimEnergy = (rimSharp * (0.36 + 0.96 * spec) + rimGlow * spec) * uRimLight;

  vec2 normalUv = vec2(normal.x, -normal.y);
  vec3 rimTint = mix(
    vec3(1.0),
    0.76 + 0.24 * cos(6.28318 * (atan(normalUv.y, normalUv.x) * 0.35 + vec3(0.0, 0.33, 0.67))),
    clamp(dispersion * 0.62, 0.0, 0.55)
  );
  glassCol += rimTint * rimEnergy * mix(0.88, 0.78, uIsDark);

  if (edgeShape >= 0.5) {
    float lipRing = exp(-pow((t - 0.32) / 0.12, 2.0)) * 0.24 * uRimLight;
    glassCol += vec3(1.0) * lipRing * (0.45 + 0.55 * ndlTop);
  }

  fragColor = vec4(mix(col, clamp(glassCol, 0.0, 1.0), coverage), 1.0);
}
`;

interface Target2D {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  width: number;
  height: number;
  wrapS: number;
  wrapT: number;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to allocate WebGL2 shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown';
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to allocate WebGL2 program');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown';
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${log}`);
  }
  return program;
}

function createTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  wrapS: number,
  wrapT: number,
): Target2D {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { fbo, tex, width, height, wrapS, wrapT };
}

function resizeTarget(gl: WebGL2RenderingContext, target: Target2D, width: number, height: number) {
  if (target.width === width && target.height === height) return;
  target.width = width;
  target.height = height;
  gl.bindTexture(gl.TEXTURE_2D, target.tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function uLoc(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation | null {
  return gl.getUniformLocation(program, name) ?? gl.getUniformLocation(program, `${name}[0]`);
}

export class StageLiquidGlassEngine {
  private sky: StageSkyId = 'pale';
  private preset: GlassPresetId = 'apple';
  private atmosphere: CompanionAtmosphere = MOOD_ATMOSPHERES.idle;
  private tier: PerformanceTier = 'high';
  private foilImpulse = 0.25;
  private gpuActive = false;
  private teardownGl: ((loseContext: boolean) => void) | null = null;
  private visibilityListener: (() => void) | null = null;
  private paused = false;

  constructor(
    private host: HTMLElement,
    private fallbackEl: HTMLElement,
    private pointer: PointerState,
    private getAudioEnergy: () => number,
    private onGpuStateChange?: (active: boolean) => void,
  ) {}

  setSky(sky: StageSkyId) {
    this.sky = sky;
    this.fallbackEl.dataset.sky = sky;
    this.triggerFoil(0.95);
  }

  setPreset(preset: GlassPresetId) {
    this.preset = preset;
    this.triggerFoil(0.7);
  }

  setAtmosphere(atmosphere: CompanionAtmosphere) {
    this.atmosphere = atmosphere;
    this.triggerFoil(0.65);
  }

  triggerFoil(strength = 0.85) {
    this.foilImpulse = Math.max(this.foilImpulse, strength);
  }

  setTier(tier: PerformanceTier) {
    const prevWebGL = this.tier === 'high' || this.tier === 'medium';
    const nextWebGL = tier === 'high' || tier === 'medium';
    const changed = this.tier !== tier;
    this.tier = tier;
    if (!changed && this.gpuActive === nextWebGL) return;

    if (!nextWebGL) {
      this.stopWebGL(true);
      this.fallbackEl.hidden = false;
      this.setGpuActive(false);
    } else if (!prevWebGL || !this.teardownGl || changed) {
      this.stopWebGL(true);
      const ok = this.startWebGL(tier);
      this.fallbackEl.hidden = ok;
      this.setGpuActive(ok);
    }
  }

  get isGpuActive(): boolean {
    return this.gpuActive;
  }

  private setGpuActive(active: boolean) {
    this.gpuActive = active;
    document.documentElement.dataset.glassMode = active ? 'gpu' : 'fallback';
    this.onGpuStateChange?.(active);
  }

  private stopWebGL(loseCtx: boolean) {
    if (this.teardownGl) {
      this.teardownGl(loseCtx);
      this.teardownGl = null;
    }
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }
  }

  dispose() {
    this.stopWebGL(true);
  }

  private startWebGL(tier: PerformanceTier): boolean {
    const canvas = document.createElement('canvas');
    canvas.className = 'stage-gl-canvas';
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
    } catch {
      return false;
    }
    if (!gl) return false;

    this.host.replaceChildren(canvas);

    let twoBakeProg: WebGLProgram;
    let wcBakeProg: WebGLProgram;
    let bgProg: WebGLProgram;
    let blurProg: WebGLProgram;
    let glassProg: WebGLProgram;
    try {
      twoBakeProg = createProgram(gl, FULLSCREEN_VS_300, TWO_SKY_BAKE_FS);
      wcBakeProg = createProgram(gl, FULLSCREEN_VS_300, WATERCOLOUR_SKY_BAKE_FS);
      bgProg = createProgram(gl, FULLSCREEN_VS_300, STAGE_BG_FS);
      blurProg = createProgram(gl, FULLSCREEN_VS_300, SEP_BLUR_FS);
      glassProg = createProgram(gl, FULLSCREEN_VS_300, LIQUID_GLASS_COMPOSITE_FS);
    } catch {
      this.host.replaceChildren();
      return false;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    const maxTex = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 2048;
    const TWO_W = Math.min(maxTex, tier === 'high' ? 3072 : 2048);
    const TWO_H = Math.min(maxTex, tier === 'high' ? 1024 : 684);
    const WC_W = Math.min(maxTex, tier === 'high' ? 1600 : 1152);
    const WC_H = Math.min(maxTex, tier === 'high' ? 900 : 648);

    const paleTarget = createTarget(gl, TWO_W, TWO_H, gl.REPEAT, gl.CLAMP_TO_EDGE);
    const deepTarget = createTarget(gl, TWO_W, TWO_H, gl.REPEAT, gl.CLAMP_TO_EDGE);
    const wcTarget = createTarget(gl, WC_W, WC_H, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    const bgTarget = createTarget(gl, Math.max(1, window.innerWidth), Math.max(1, window.innerHeight), gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    const blurHTarget = createTarget(gl, Math.max(1, Math.floor(window.innerWidth / 2)), Math.max(1, Math.floor(window.innerHeight / 2)), gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    const blurVTarget = createTarget(gl, Math.max(1, Math.floor(window.innerWidth / 2)), Math.max(1, Math.floor(window.innerHeight / 2)), gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

    const twoU = {
      uOut: uLoc(gl, twoBakeProg, 'uOut'),
      uSide: uLoc(gl, twoBakeProg, 'uSide'),
      uSun: uLoc(gl, twoBakeProg, 'uSun'),
      uNeb: uLoc(gl, twoBakeProg, 'uNeb'),
      uEyeM: uLoc(gl, twoBakeProg, 'uEyeM'),
      uLiftM: uLoc(gl, twoBakeProg, 'uLiftM'),
      uClock: uLoc(gl, twoBakeProg, 'uClock'),
      uPalU: uLoc(gl, twoBakeProg, 'uPalU'),
      uPalM: uLoc(gl, twoBakeProg, 'uPalM'),
    };
    gl.useProgram(twoBakeProg);
    gl.uniform2f(twoU.uOut, TWO_W, TWO_H);
    gl.uniform4fv(twoU.uSun, TWO_SKY_FIRM.sun);
    gl.uniform4fv(twoU.uNeb, TWO_SKY_FIRM.neb);
    gl.uniform4fv(twoU.uEyeM, TWO_SKY_FIRM.eyeM);
    gl.uniform4fv(twoU.uLiftM, TWO_SKY_FIRM.liftM);
    gl.uniform1f(twoU.uClock, 0);
    gl.uniform3fv(twoU.uPalU, new Float32Array(TWO_SKY_PAL_U.flat()));
    gl.uniform3fv(twoU.uPalM, new Float32Array(TWO_SKY_PAL_M.flat()));

    const wcU = {
      uOut: uLoc(gl, wcBakeProg, 'uOut'),
      uSpan: uLoc(gl, wcBakeProg, 'uSpan'),
      uPhi: uLoc(gl, wcBakeProg, 'uPhi'),
      uMode: uLoc(gl, wcBakeProg, 'uMode'),
      uSeed: uLoc(gl, wcBakeProg, 'uSeed'),
      K_PAY: uLoc(gl, wcBakeProg, 'K_PAY'),
      K_ULT: uLoc(gl, wcBakeProg, 'K_ULT'),
      K_TQ: uLoc(gl, wcBakeProg, 'K_TQ'),
      K_VIO: uLoc(gl, wcBakeProg, 'K_VIO'),
      K_ROS: uLoc(gl, wcBakeProg, 'K_ROS'),
      K_AMB: uLoc(gl, wcBakeProg, 'K_AMB'),
      K_YEL: uLoc(gl, wcBakeProg, 'K_YEL'),
    };
    gl.useProgram(wcBakeProg);
    gl.uniform2f(wcU.uOut, WC_W, WC_H);
    gl.uniform1f(wcU.uPhi, 1.2);
    gl.uniform1f(wcU.uSeed, 1.7);

    const bgU = {
      uTexPale: uLoc(gl, bgProg, 'uTexPale'),
      uTexDeep: uLoc(gl, bgProg, 'uTexDeep'),
      uTexWc: uLoc(gl, bgProg, 'uTexWc'),
      uPaleReady: uLoc(gl, bgProg, 'uPaleReady'),
      uDeepReady: uLoc(gl, bgProg, 'uDeepReady'),
      uWcReady: uLoc(gl, bgProg, 'uWcReady'),
      uW0: uLoc(gl, bgProg, 'uW0'),
      uW1: uLoc(gl, bgProg, 'uW1'),
      uW2: uLoc(gl, bgProg, 'uW2'),
      uTime: uLoc(gl, bgProg, 'uTime'),
      uScroll: uLoc(gl, bgProg, 'uScroll'),
      uResolution: uLoc(gl, bgProg, 'uResolution'),
      uPointer: uLoc(gl, bgProg, 'uPointer'),
      uFoilBoost: uLoc(gl, bgProg, 'uFoilBoost'),
      uAudioEnergy: uLoc(gl, bgProg, 'uAudioEnergy'),
      uPigmentA: uLoc(gl, bgProg, 'uPigmentA'),
      uPigmentB: uLoc(gl, bgProg, 'uPigmentB'),
      uFoilA: uLoc(gl, bgProg, 'uFoilA'),
      uFoilB: uLoc(gl, bgProg, 'uFoilB'),
      uSun: uLoc(gl, bgProg, 'uSun'),
      uAuroraSteps: uLoc(gl, bgProg, 'uAuroraSteps'),
    };
    gl.useProgram(bgProg);
    gl.uniform1i(bgU.uTexPale, 0);
    gl.uniform1i(bgU.uTexDeep, 1);
    gl.uniform1i(bgU.uTexWc, 2);
    gl.uniform4fv(bgU.uSun, TWO_SKY_FIRM.sun);
    gl.uniform1i(bgU.uAuroraSteps, tier === 'high' ? 12 : 8);

    const blurU = {
      uTex: uLoc(gl, blurProg, 'uTex'),
      uDir: uLoc(gl, blurProg, 'uDir'),
    };
    gl.useProgram(blurProg);
    gl.uniform1i(blurU.uTex, 0);

    const glassU = {
      uBg: uLoc(gl, glassProg, 'uBg'),
      uBlur: uLoc(gl, glassProg, 'uBlur'),
      uResolution: uLoc(gl, glassProg, 'uResolution'),
      uDpr: uLoc(gl, glassProg, 'uDpr'),
      uIsDark: uLoc(gl, glassProg, 'uIsDark'),
      uCount: uLoc(gl, glassProg, 'uCount'),
      uRects: uLoc(gl, glassProg, 'uRects'),
      uMeta: uLoc(gl, glassProg, 'uMeta'),
      uOptics: uLoc(gl, glassProg, 'uOptics'),
      uMagnify: uLoc(gl, glassProg, 'uMagnify'),
      uVibrancy: uLoc(gl, glassProg, 'uVibrancy'),
      uBrightness: uLoc(gl, glassProg, 'uBrightness'),
      uColorFromBelow: uLoc(gl, glassProg, 'uColorFromBelow'),
      uRimLight: uLoc(gl, glassProg, 'uRimLight'),
      uRimWidth: uLoc(gl, glassProg, 'uRimWidth'),
      uShadow: uLoc(gl, glassProg, 'uShadow'),
      uMergeDist: uLoc(gl, glassProg, 'uMergeDist'),
    };
    gl.useProgram(glassProg);
    gl.uniform1i(glassU.uBg, 0);
    gl.uniform1i(glassU.uBlur, 1);

    const rectsBuf = new Float32Array(MAX_SHAPES * 4);
    const metaBuf = new Float32Array(MAX_SHAPES * 4);
    const opticsBuf = new Float32Array(MAX_SHAPES * 4);

    let dpr = tier === 'high' ? Math.min(window.devicePixelRatio || 1, 2.0) : Math.min(window.devicePixelRatio || 1, 1.25);
    const resize = () => {
      if (!gl) return;
      dpr = tier === 'high' ? Math.min(window.devicePixelRatio || 1, 2.0) : Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const pw = Math.max(1, Math.round(w * dpr));
      const ph = Math.max(1, Math.round(h * dpr));
      canvas.width = pw;
      canvas.height = ph;
      resizeTarget(gl, bgTarget, pw, ph);
      const bw = Math.max(1, Math.floor(pw / 2));
      const bh = Math.max(1, Math.floor(ph / 2));
      resizeTarget(gl, blurHTarget, bw, bh);
      resizeTarget(gl, blurVTarget, bw, bh);
    };
    resize();

    let rafId = 0;
    let contextLost = false;
    let paleRow = 0;
    let paleDone = false;
    let deepRow = 0;
    let deepDone = false;
    let wcRow = 0;
    let wcDone = false;
    let wcActiveKey = '';

    const curPigA = hexToRgbNormalized(this.atmosphere.primaryPigment);
    const curPigB = hexToRgbNormalized(this.atmosphere.secondaryPigment);
    const curFoilA = hexToRgbNormalized(this.atmosphere.foilAccentA);
    const curFoilB = hexToRgbNormalized(this.atmosphere.foilAccentB);

    let prevTime = performance.now();
    const startTime = prevTime;
    const smoothPtr = { x: 0.5, y: 0.5 };
    let smoothScroll = 0;
    let smoothFoil = 0.25;
    let w0 = this.sky === 'pale' ? 1 : 0;
    let w1 = this.sky === 'deep' ? 1 : 0;
    let w2 = this.sky !== 'pale' && this.sky !== 'deep' ? 1 : 0;
    let paleFade = 0;
    let deepFade = 0;
    let wcFade = 0;
    let smoothDark = this.sky === 'pale' ? 0 : 1;

    const getWcMode = (sky: StageSkyId) => (sky === 'nebula' ? 2 : sky === 'dawn' ? 5 : 3);

    const stepBaker = () => {
      if (!gl) return;
      if (!paleDone && (this.sky === 'pale' || deepDone)) {
        const strip = tier === 'high' ? 32 : 20;
        const hStrip = Math.min(strip, TWO_H - paleRow);
        gl.bindFramebuffer(gl.FRAMEBUFFER, paleTarget.fbo);
        gl.viewport(0, 0, TWO_W, TWO_H);
        gl.useProgram(twoBakeProg);
        gl.uniform1f(twoU.uSide, 0);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, paleRow, TWO_W, hStrip);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disable(gl.SCISSOR_TEST);
        paleRow += hStrip;
        if (paleRow >= TWO_H) paleDone = true;
        return;
      }

      if (!deepDone && (this.sky === 'deep' || paleDone)) {
        const strip = tier === 'high' ? 28 : 16;
        const hStrip = Math.min(strip, TWO_H - deepRow);
        gl.bindFramebuffer(gl.FRAMEBUFFER, deepTarget.fbo);
        gl.viewport(0, 0, TWO_W, TWO_H);
        gl.useProgram(twoBakeProg);
        gl.uniform1f(twoU.uSide, 1);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, deepRow, TWO_W, hStrip);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disable(gl.SCISSOR_TEST);
        deepRow += hStrip;
        if (deepRow >= TWO_H) deepDone = true;
        return;
      }

      // Bake watercolour FBO lazily only when a watercolour sky is active (or once both domes finish),
      // keyed solely on wcMode so avatar mood changes glaze in real time without FBO stalls.
      const wcNeeded = this.sky !== 'pale' && this.sky !== 'deep';
      if (!wcNeeded && wcDone) return;
      const wcMode = getWcMode(this.sky);
      const wantedKey = String(wcMode);
      if (wcActiveKey !== wantedKey) {
        wcActiveKey = wantedKey;
        wcRow = 0;
        wcDone = false;
        wcFade = 0;
        const pig = computePaintPigments(MOOD_ATMOSPHERES.idle.primaryPigment, MOOD_ATMOSPHERES.idle.secondaryPigment);
        gl.useProgram(wcBakeProg);
        gl.uniform1i(wcU.uMode, wcMode);
        gl.uniform2fv(wcU.uSpan, wcMode === 2 ? [92, 51.75] : wcMode === 5 ? [124, 69.75] : [98, 55.125]);
        gl.uniform3fv(wcU.K_PAY, pig.K_PAY);
        gl.uniform3fv(wcU.K_ULT, pig.K_ULT);
        gl.uniform3fv(wcU.K_TQ, pig.K_TQ);
        gl.uniform3fv(wcU.K_VIO, pig.K_VIO);
        gl.uniform3fv(wcU.K_ROS, pig.K_ROS);
        gl.uniform3fv(wcU.K_AMB, pig.K_AMB);
        gl.uniform3fv(wcU.K_YEL, pig.K_YEL);
      }

      if (!wcDone) {
        const strip = tier === 'high' ? 30 : 20;
        const hStrip = Math.min(strip, WC_H - wcRow);
        gl.bindFramebuffer(gl.FRAMEBUFFER, wcTarget.fbo);
        gl.viewport(0, 0, WC_W, WC_H);
        gl.useProgram(wcBakeProg);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, wcRow, WC_W, hStrip);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disable(gl.SCISSOR_TEST);
        wcRow += hStrip;
        if (wcRow >= WC_H) wcDone = true;
      }
    };

    const collectGlassShapes = () => {
      const preset = LIQUID_GLASS_PRESETS[this.preset];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const entries = glassRegistry.list();
      const collected: Array<{
        cx: number; cy: number; hw: number; hh: number;
        radius: number; edgeShape: number; mergeGroup: number; priority: number;
        edgeWidth: number; refraction: number; dispersion: number; blurMix: number; frost: number;
      }> = [];

      for (const e of entries) {
        let x = 0; let y = 0; let w = 0; let h = 0; let rad = 22;
        if (e.manualRect) {
          const m = e.manualRect();
          if (!m || m.active === false || m.width < 2 || m.height < 2) continue;
          x = m.x; y = m.y; w = m.width; h = m.height; rad = m.radius;
        } else if (e.element) {
          if (e.element.hidden) continue;
          const r = e.element.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          if (r.bottom < -40 || r.top > vh + 40 || r.right < -40 || r.left > vw + 40) continue;
          x = r.left; y = r.top; w = r.width; h = r.height;
          rad = e.radius === 'pill' ? h * 0.5 : (e.radius ?? 24);
        } else {
          continue;
        }

        collected.push({
          cx: x + w * 0.5, cy: y + h * 0.5, hw: w * 0.5, hh: h * 0.5,
          radius: rad,
          edgeShape: e.edgeShape === 'lip' ? 1.0 : 0.0,
          mergeGroup: e.mergeGroup,
          priority: e.priority,
          edgeWidth: e.edgeShape === 'lip' ? Math.min(22, h * 0.48) : preset.edgeWidthPx,
          refraction: e.overrideRefraction ?? preset.refractionPx,
          dispersion: e.overrideDispersion ?? preset.dispersion,
          blurMix: e.overrideBlurMix ?? preset.blurMix,
          frost: e.overrideFrost ?? preset.frost,
        });
      }

      collected.sort((a, b) => b.priority - a.priority);
      const active = collected.slice(0, MAX_SHAPES).sort((a, b) => a.priority - b.priority);
      for (let i = 0; i < active.length; i++) {
        const s = active[i];
        const off = i * 4;
        rectsBuf[off] = s.cx; rectsBuf[off + 1] = s.cy; rectsBuf[off + 2] = s.hw; rectsBuf[off + 3] = s.hh;
        metaBuf[off] = s.radius; metaBuf[off + 1] = s.edgeShape; metaBuf[off + 2] = s.mergeGroup; metaBuf[off + 3] = s.edgeWidth;
        opticsBuf[off] = s.refraction; opticsBuf[off + 1] = s.dispersion; opticsBuf[off + 2] = s.blurMix; opticsBuf[off + 3] = s.frost;
      }
      return active.length;
    };

    const animate = (now: number) => {
      if (contextLost || this.paused || !gl) return;
      rafId = requestAnimationFrame(animate);

      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      stepBaker();

      const targetW0 = this.sky === 'pale' ? 1 : 0;
      const targetW1 = this.sky === 'deep' ? 1 : 0;
      const targetW2 = this.sky !== 'pale' && this.sky !== 'deep' ? 1 : 0;
      const skyLerp = 1 - Math.exp(-dt * 3.4);
      w0 = lerp(w0, targetW0, skyLerp);
      w1 = lerp(w1, targetW1, skyLerp);
      w2 = lerp(w2, targetW2, skyLerp);

      if (paleDone) paleFade = Math.min(1, paleFade + dt * 2.8);
      if (deepDone) deepFade = Math.min(1, deepFade + dt * 2.8);
      if (wcDone) wcFade = Math.min(1, wcFade + dt * 2.5);
      smoothDark = lerp(smoothDark, this.sky === 'pale' ? 0 : 1, skyLerp);

      const tPigA = hexToRgbNormalized(this.atmosphere.primaryPigment);
      const tPigB = hexToRgbNormalized(this.atmosphere.secondaryPigment);
      const tFoilA = hexToRgbNormalized(this.atmosphere.foilAccentA);
      const tFoilB = hexToRgbNormalized(this.atmosphere.foilAccentB);
      const colorLerp = 1 - Math.exp(-dt * 3.0);
      for (let c = 0; c < 3; c++) {
        curPigA[c] = lerp(curPigA[c], tPigA[c], colorLerp);
        curPigB[c] = lerp(curPigB[c], tPigB[c], colorLerp);
        curFoilA[c] = lerp(curFoilA[c], tFoilA[c], colorLerp);
        curFoilB[c] = lerp(curFoilB[c], tFoilB[c], colorLerp);
      }

      const tx = this.pointer.active ? this.pointer.nx : 0.5;
      const ty = this.pointer.active ? 1.0 - this.pointer.ny : 0.5;
      smoothPtr.x = lerp(smoothPtr.x, tx, 0.08);
      smoothPtr.y = lerp(smoothPtr.y, ty, 0.08);

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      smoothScroll = lerp(smoothScroll, window.scrollY / maxScroll, 0.08);

      this.foilImpulse = Math.max(0, this.foilImpulse - dt * 1.4);
      smoothFoil = lerp(smoothFoil, this.foilImpulse, 0.16);

      const pw = bgTarget.width;
      const ph = bgTarget.height;
      const bw = blurHTarget.width;
      const bh = blurHTarget.height;

      // Pass 1: Stage Sky -> bgTarget
      gl.bindFramebuffer(gl.FRAMEBUFFER, bgTarget.fbo);
      gl.viewport(0, 0, pw, ph);
      gl.useProgram(bgProg);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, paleTarget.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, deepTarget.tex);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, wcTarget.tex);
      gl.uniform1f(bgU.uPaleReady, paleFade);
      gl.uniform1f(bgU.uDeepReady, deepFade);
      gl.uniform1f(bgU.uWcReady, wcFade);
      gl.uniform1f(bgU.uW0, w0);
      gl.uniform1f(bgU.uW1, w1);
      gl.uniform1f(bgU.uW2, w2);
      gl.uniform1f(bgU.uTime, (now - startTime) * 0.001);
      gl.uniform1f(bgU.uScroll, smoothScroll);
      gl.uniform2f(bgU.uResolution, pw, ph);
      gl.uniform2f(bgU.uPointer, smoothPtr.x, smoothPtr.y);
      gl.uniform1f(bgU.uFoilBoost, smoothFoil);
      gl.uniform1f(bgU.uAudioEnergy, this.getAudioEnergy());
      gl.uniform3fv(bgU.uPigmentA, curPigA);
      gl.uniform3fv(bgU.uPigmentB, curPigB);
      gl.uniform3fv(bgU.uFoilA, curFoilA);
      gl.uniform3fv(bgU.uFoilB, curFoilB);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Pass 1B & 1C: Half-res separable Gaussian blur
      gl.bindFramebuffer(gl.FRAMEBUFFER, blurHTarget.fbo);
      gl.viewport(0, 0, bw, bh);
      gl.useProgram(blurProg);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, bgTarget.tex);
      gl.uniform2f(blurU.uDir, 2.4 / Math.max(bw, 1), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, blurVTarget.fbo);
      gl.viewport(0, 0, bw, bh);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, blurHTarget.tex);
      gl.uniform2f(blurU.uDir, 0, 2.4 / Math.max(bh, 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Pass 2: Analytical-Gradient SDF Liquid Glass Compositor -> Screen
      const preset = LIQUID_GLASS_PRESETS[this.preset];
      const count = collectGlassShapes();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, pw, ph);
      gl.useProgram(glassProg);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, bgTarget.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, blurVTarget.tex);
      gl.uniform2f(glassU.uResolution, pw, ph);
      gl.uniform1f(glassU.uDpr, dpr);
      gl.uniform1f(glassU.uIsDark, smoothDark);
      gl.uniform1i(glassU.uCount, count);
      gl.uniform4fv(glassU.uRects, rectsBuf);
      gl.uniform4fv(glassU.uMeta, metaBuf);
      gl.uniform4fv(glassU.uOptics, opticsBuf);
      gl.uniform1f(glassU.uMagnify, preset.magnify);
      gl.uniform1f(glassU.uVibrancy, preset.vibrancy);
      gl.uniform1f(glassU.uBrightness, preset.brightness);
      gl.uniform1f(glassU.uColorFromBelow, preset.colorFromBelow);
      gl.uniform1f(glassU.uRimLight, preset.rimLight);
      gl.uniform1f(glassU.uRimWidth, preset.rimWidthPx);
      gl.uniform1f(glassU.uShadow, preset.shadow);
      gl.uniform1f(glassU.uMergeDist, preset.mergeDistancePx);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(rafId);
      this.fallbackEl.hidden = false;
      this.setGpuActive(false);
    };
    const onContextRestored = () => {
      contextLost = false;
      this.stopWebGL(false);
      const ok = this.startWebGL(this.tier);
      this.fallbackEl.hidden = ok;
      this.setGpuActive(ok);
    };

    this.visibilityListener = () => {
      if (document.hidden) {
        this.paused = true;
        cancelAnimationFrame(rafId);
      } else {
        this.paused = false;
        prevTime = performance.now();
        if (!contextLost) rafId = requestAnimationFrame(animate);
      }
    };

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', this.visibilityListener);

    this.paused = document.hidden;
    if (!this.paused) rafId = requestAnimationFrame(animate);

    this.teardownGl = (loseCtx: boolean) => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (gl) {
        try {
          [twoBakeProg, wcBakeProg, bgProg, blurProg, glassProg].forEach(p => gl!.deleteProgram(p));
          [paleTarget, deepTarget, wcTarget, bgTarget, blurHTarget, blurVTarget].forEach(t => {
            gl!.deleteFramebuffer(t.fbo);
            gl!.deleteTexture(t.tex);
          });
          if (vao) gl.deleteVertexArray(vao);
          if (loseCtx) gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          // Safe cleanup on already-lost context
        }
      }
      if (canvas.parentNode === this.host) this.host.removeChild(canvas);
    };

    return true;
  }
}
