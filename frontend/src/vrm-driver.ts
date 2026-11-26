import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { VRM } from '@pixiv/three-vrm';
import type { AvatarDriver } from './avatar-drivers';
import { disposeObject } from './avatar-drivers';
import type { AvatarFrame } from './avatar-state';
import { validateVrm } from './vrm-file';

class VrmAvatar implements AvatarDriver {
  root = new THREE.Group();
  private head: THREE.Object3D | null;
  private left: THREE.Object3D | null;
  private right: THREE.Object3D | null;
  private headRest: THREE.Quaternion;
  private leftRest: THREE.Quaternion;
  private rightRest: THREE.Quaternion;
  private scratch = new THREE.Quaternion();
  private rotation = new THREE.Euler();
  private expressions: Set<string>;

  constructor(private vrm: VRM) {
    VRMUtils.rotateVRM0(vrm);
    this.head = vrm.humanoid.getNormalizedBoneNode('head');
    this.left = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
    this.right = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
    this.headRest = this.head?.quaternion.clone() ?? new THREE.Quaternion();
    this.leftRest = this.left?.quaternion.clone() ?? new THREE.Quaternion();
    this.rightRest = this.right?.quaternion.clone() ?? new THREE.Quaternion();
    this.root.add(vrm.scene);
    this.pose(this.left, this.leftRest, 0, 0, -1.05);
    this.pose(this.right, this.rightRest, 0, 0, 1.05);
    vrm.update(0);
    vrm.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(vrm.scene);
    const height = box.max.y - box.min.y;
    if (!Number.isFinite(height) || height < .01) throw new Error('模型没有可显示的几何体。');
    const scale = 2.75 / height;
    const center = box.getCenter(new THREE.Vector3());
    vrm.scene.scale.multiplyScalar(scale);
    vrm.scene.position.add(new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale));
    this.expressions = new Set(['aa', 'blink', 'happy'].filter(name => vrm.expressionManager?.getExpression(name)));
  }

  private pose(bone: THREE.Object3D | null, rest: THREE.Quaternion, x: number, y: number, z: number) {
    if (!bone) return;
    this.rotation.set(x, y, z); this.scratch.setFromEuler(this.rotation);
    bone.quaternion.copy(rest).multiply(this.scratch);
  }

  update(frame: AvatarFrame, delta: number, reduced: boolean) {
    const p = frame.gestureProgress, envelope = frame.gesture ? Math.sin(p * Math.PI) : 0;
    const nod = frame.gesture === 'nod' ? (reduced ? .10 : Math.sin(p * Math.PI * 4) * .16) * envelope : 0;
    this.pose(this.head, this.headRest, frame.gazeY * .12 + nod, frame.gazeX * .28,
      frame.mood === 'thinking' ? .07 : frame.mood === 'looking' ? -.06 : 0);
    this.pose(this.left, this.leftRest, 0, 0, -1.05);
    this.pose(this.right, this.rightRest, 0, 0,
      1.05 - (frame.gesture === 'wave' ? (2.1 + (reduced ? 0 : Math.sin(p * Math.PI * 10) * .18)) * envelope : 0));
    for (const [name, value] of [['aa', frame.mouth], ['blink', frame.blink], ['happy', frame.happy]] as const) {
      if (this.expressions.has(name)) this.vrm.expressionManager!.setValue(name, value);
    }
    this.root.position.y = frame.breath * .3;
    this.vrm.update(Math.min(delta, 1 / 15));
  }
  dispose() { disposeObject(this.root); }
}

export async function loadVrm(data: ArrayBuffer): Promise<AvatarDriver> {
  validateVrm(data);
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => {
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    throw new Error('已阻止模型读取外部资源。');
  });
  const loader = new GLTFLoader(manager);
  loader.register(parser => new VRMLoaderPlugin(parser));
  const gltf = await loader.parseAsync(data, '');
  const vrm = gltf.userData.vrm as VRM | undefined;
  if (!vrm) { disposeObject(gltf.scene); throw new Error('文件中没有可用的 VRM 形象。'); }
  try { return new VrmAvatar(vrm); }
  catch (error) { disposeObject(gltf.scene); throw error; }
}
