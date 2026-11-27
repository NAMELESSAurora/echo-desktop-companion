import * as THREE from 'three';
import nazunaAvatarUrl from './assets/nazuna-avatar.webp';
import type { AvatarFrame, AvatarMood } from './avatar-state';

export interface AvatarDriver {
  root: THREE.Object3D;
  is2dPortrait?: boolean;
  update(frame: AvatarFrame, delta: number, reducedMotion: boolean): void;
  dispose(): void;
}

export function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  textures.forEach(x => x.dispose());
  materials.forEach(x => x.dispose());
  geometries.forEach(x => x.dispose());
  root.removeFromParent();
}

const MOOD_HALO_HEX: Record<AvatarMood, number> = {
  offline: 0x8692ab,
  idle: 0xa996e8,
  thinking: 0x8575f0,
  looking: 0x1fc7de,
  replying: 0x7b8cff,
  speaking: 0xff4fa0,
  interrupted: 0xe83b1e,
  error: 0xe83b1e,
};

function createGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(0.42, 'rgba(210, 195, 255, 0.28)');
    grad.addColorStop(1, 'rgba(210, 195, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Default placeholder companion driver featuring NovelAI-generated transparent
 * Nanakusa Nazuna (七草荠) with 2.5D cursor parallax, breathing, gesture choreography,
 * and real Web Audio RMS-driven acoustic resonance halo.
 */
export class BuiltinAvatar implements AvatarDriver {
  readonly is2dPortrait = true;
  root = new THREE.Group();
  private stageGroup = new THREE.Group();
  private spriteMesh: THREE.Mesh;
  private spriteMat: THREE.MeshBasicMaterial;
  private haloGroup = new THREE.Group();
  private outerRing: THREE.Mesh;
  private innerRing: THREE.Mesh;
  private glowMesh: THREE.Mesh;
  private ringMat: THREE.MeshBasicMaterial;
  private innerRingMat: THREE.MeshBasicMaterial;
  private glowMat: THREE.MeshBasicMaterial;
  private currentColor = new THREE.Color(MOOD_HALO_HEX.idle);
  private targetColor = new THREE.Color(MOOD_HALO_HEX.idle);
  private baseY = 1.26;
  private elapsed = 0;

  constructor() {
    this.root.add(this.haloGroup);
    this.root.add(this.stageGroup);

    // Subtle architectural acoustic resonance halo behind her shoulders
    this.haloGroup.position.set(0, 1.82, -0.22);

    this.ringMat = new THREE.MeshBasicMaterial({
      color: MOOD_HALO_HEX.idle,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      toneMapped: false,
    });
    this.outerRing = new THREE.Mesh(new THREE.RingGeometry(1.16, 1.182, 72), this.ringMat);
    this.haloGroup.add(this.outerRing);

    this.innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      toneMapped: false,
    });
    this.innerRing = new THREE.Mesh(new THREE.RingGeometry(0.84, 0.855, 64), this.innerRingMat);
    this.haloGroup.add(this.innerRing);

    this.glowMat = new THREE.MeshBasicMaterial({
      map: createGlowTexture(),
      color: MOOD_HALO_HEX.idle,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      toneMapped: false,
    });
    this.glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), this.glowMat);
    this.glowMesh.position.z = -0.06;
    this.haloGroup.add(this.glowMesh);

    // Crisp transparent NAI Nanakusa Nazuna portrait quad anchored flush to lower stage edge
    const aspect = 636 / 960;
    const height = 3.48;
    const width = height * aspect;

    const texture = new THREE.TextureLoader().load(nazunaAvatarUrl, loaded => {
      loaded.needsUpdate = true;
      this.spriteMat.needsUpdate = true;
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    this.spriteMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.015,
      depthWrite: false,
      toneMapped: false,
    });

    this.spriteMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), this.spriteMat);
    this.stageGroup.position.set(0, this.baseY, 0);
    this.stageGroup.add(this.spriteMesh);
  }

  update(frame: AvatarFrame, delta: number, reduced: boolean) {
    this.elapsed += delta;
    const p = frame.gestureProgress;
    const envelope = frame.gesture ? Math.sin(Math.PI * p) : 0;

    // Gesture choreography (nod, playful wave, thinking lean, cozy headpat, cheeky poke)
    const nodPitch = frame.gesture === 'nod'
      ? (reduced ? 0.06 : Math.sin(p * Math.PI * 4) * 0.095) * envelope
      : frame.gesture === 'headpat'
      ? (reduced ? 0.05 : (0.06 + Math.pow(Math.sin(p * Math.PI * 3), 2) * 0.05)) * envelope
      : 0;
    const nodDip = frame.gesture === 'nod'
      ? (reduced ? -0.03 : -Math.abs(Math.sin(p * Math.PI * 2)) * 0.055) * envelope
      : frame.gesture === 'headpat'
      ? (reduced ? -0.04 : -(0.035 + Math.pow(Math.sin(p * Math.PI * 3), 2) * 0.04)) * envelope
      : 0;
    const waveTilt = frame.gesture === 'wave'
      ? (reduced ? -0.045 : Math.sin(p * Math.PI * 5) * 0.065) * envelope
      : frame.gesture === 'think'
      ? 0.055 * envelope
      : frame.gesture === 'poke'
      ? (reduced ? -0.05 : -Math.sin(p * Math.PI * 3) * 0.085) * envelope
      : 0;
    const waveLift = frame.gesture === 'wave'
      ? (reduced ? 0.04 : Math.abs(Math.sin(p * Math.PI * 3)) * 0.075) * envelope
      : frame.gesture === 'poke'
      ? (reduced ? 0.02 : Math.sin(p * Math.PI) * 0.045) * envelope
      : 0;

    // Real audio RMS cadence vitality
    const speakLift = frame.mood === 'speaking' ? frame.mouth * 0.048 : 0;
    const speakScale = frame.mood === 'speaking' ? frame.mouth * 0.022 : 0;

    // Breathing + 2.5D pointer gaze tracking
    const breathY = reduced ? 0 : frame.breath * 0.85;
    const gazeShiftX = reduced ? 0 : frame.gazeX * 0.095;
    const moodTilt = frame.mood === 'thinking' ? 0.028 : frame.mood === 'looking' ? -0.026 : 0;

    this.stageGroup.position.set(gazeShiftX, this.baseY + breathY + nodDip + waveLift + speakLift, 0);
    this.stageGroup.rotation.set(
      (reduced ? 0 : frame.gazeY * 0.055) + nodPitch,
      reduced ? 0 : frame.gazeX * 0.13,
      moodTilt + waveTilt,
    );
    const scaleX = 1 + (reduced ? 0 : frame.breath * 0.12) + speakScale * 0.6;
    const scaleY = 1 + (reduced ? 0 : frame.breath * 0.25) + speakScale;
    this.stageGroup.scale.set(scaleX, scaleY, 1);

    // Smoothly morph acoustic resonance halo color and radius with mood & live audio RMS
    this.targetColor.setHex(MOOD_HALO_HEX[frame.mood]);
    this.currentColor.lerp(this.targetColor, Math.min(1, delta * 5.5));
    this.ringMat.color.copy(this.currentColor);
    this.glowMat.color.copy(this.currentColor);

    const pulse = frame.mood === 'speaking' ? frame.mouth : frame.gesture ? envelope * 0.45 : 0;
    const ringScale = 1 + pulse * 0.22 + (reduced ? 0 : Math.sin(this.elapsed * 1.4) * 0.018);
    this.outerRing.scale.set(ringScale, ringScale, 1);
    this.innerRing.scale.set(1 + pulse * 0.14, 1 + pulse * 0.14, 1);
    this.glowMesh.scale.set(1 + pulse * 0.28, 1 + pulse * 0.28, 1);

    this.ringMat.opacity = 0.22 + pulse * 0.56;
    this.innerRingMat.opacity = 0.12 + pulse * 0.34;
    this.glowMat.opacity = 0.18 + pulse * 0.38;
    this.haloGroup.position.x = -gazeShiftX * 0.45;
  }

  dispose() {
    disposeObject(this.root);
  }
}
