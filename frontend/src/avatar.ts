import * as THREE from 'three';
import { AvatarState, rms } from './avatar-state';
import type { AvatarGesture, AvatarMood } from './avatar-state';
import { BuiltinAvatar } from './avatar-drivers';
import type { AvatarDriver } from './avatar-drivers';
import { MAX_VRM_BYTES, validateVrm } from './vrm-file';

const labels: Record<AvatarMood, string> = {
  offline: '幕布未启',
  idle: '静候幕前',
  thinking: '凝神思索',
  looking: '凝视画面',
  replying: '落字成句',
  speaking: '声波共振',
  interrupted: '刹那止声',
  error: '链路受阻',
};

export class AvatarStage {
  readonly state = new AvatarState();
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  private floor: THREE.Mesh | null = null;
  private driver: AvatarDriver | null = null;
  private frameId = 0;
  private previous = 0;
  private paused = false;
  private generation = 0;
  private samples = new Float32Array(256);
  private media = matchMedia('(prefers-reduced-motion: reduce)');
  private observer: ResizeObserver | null = null;
  private lastMood: AvatarMood | '' = '';
  private peakMouth = 0;
  private status: HTMLElement;
  private name: HTMLElement;
  private note: HTMLElement;
  private mouthMeter: HTMLMeterElement;
  private message: HTMLElement;
  private reset: HTMLButtonElement;
  private file: HTMLInputElement;

  constructor(
    private element: HTMLElement,
    private analyser: () => AnalyserNode | null,
    private onMoodChange?: (mood: AvatarMood) => void,
  ) {
    const get = <T extends HTMLElement>(id: string) => element.querySelector<T>(`#${id}`)!;
    this.status = get('avatar-status'); this.name = get('avatar-name'); this.note = get('avatar-note');
    this.mouthMeter = get('avatar-mouth'); this.message = get('avatar-message');
    this.reset = get('avatar-reset'); this.file = get('avatar-file');
    const canvas = get<HTMLCanvasElement>('avatar-canvas');
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      this.camera.position.set(0, 1.68, 5.8); this.camera.lookAt(0, 1.43, 0);
      this.scene.add(new THREE.HemisphereLight(0xf6f4ff, 0x8795b1, 2.5));
      const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(-3, 5, 5); this.scene.add(key);
      const rim = new THREE.DirectionalLight(0xa3b8ff, 1.9); rim.position.set(4, 3, -3); this.scene.add(rim);
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(.82, 48),
        new THREE.MeshBasicMaterial({ color: 0x6d7fa8, transparent: true, opacity: .18, depthWrite: false }),
      );
      floor.rotation.x = -Math.PI / 2; floor.position.y = -.015; floor.scale.set(1, .65, 1);
      this.floor = floor;
      this.scene.add(floor);
      this.replace(new BuiltinAvatar());
      this.observer = new ResizeObserver(() => this.resize(canvas)); this.observer.observe(canvas);
      this.resize(canvas); this.resume();
      element.dataset.renderer = 'webgl';
    } catch {
      element.dataset.renderer = 'unavailable';
      this.showMessage('当前浏览器暂未启用 3D 舞台，可换 Chrome／Edge 打开；对话与声景不受影响。');
      canvas.hidden = true;
      element.querySelectorAll<HTMLButtonElement>('.avatar-actions button').forEach(button => { button.disabled = true; });
    }
    canvas.addEventListener('pointermove', event => {
      const box = canvas.getBoundingClientRect();
      this.state.look((event.clientX - box.left) / box.width * 2 - 1, (event.clientY - box.top) / box.height * 2 - 1);
    });
    canvas.addEventListener('pointerleave', () => this.state.look(0, 0));
    canvas.addEventListener('click', () => this.act('wave'));
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.act('wave'); }
    });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); this.pause(); this.showMessage('3D 舞台显示暂时中断，请刷新恢复，对话仍可继续。');
    });
    get<HTMLButtonElement>('avatar-nod').addEventListener('click', () => this.act('nod'));
    get<HTMLButtonElement>('avatar-wave').addEventListener('click', () => this.act('wave'));
    get<HTMLButtonElement>('avatar-import').addEventListener('click', () => this.file.click());
    this.file.addEventListener('change', () => { const file = this.file.files?.[0]; this.file.value = ''; if (file) void this.importFile(file); });
    this.reset.addEventListener('click', () => this.restore());
    document.addEventListener('visibilitychange', () => document.hidden ? this.pause() : this.resume());
    window.addEventListener('pagehide', () => { this.pause(); this.state.reset(); });
    window.addEventListener('pageshow', () => this.resume());
  }

  private resize(canvas: HTMLCanvasElement) {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height || !this.renderer) return;
    this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.render(this.scene, this.camera);
  }
  private replace(driver: AvatarDriver) {
    this.driver?.dispose();
    this.driver = driver;
    this.scene.add(driver.root);
    if (this.floor) this.floor.visible = !driver.is2dPortrait;
  }
  private showMessage(text: string) { this.message.textContent = text; this.message.hidden = !text; }
  private act(gesture: AvatarGesture) {
    const now = performance.now() / 1000;
    this.state.act(gesture, now);
    this.element.dataset.gestureStarted = now.toFixed(3);
    this.note.textContent = gesture === 'wave' ? '七草荠向你挥手致意' : '轻颔回应';
  }
  private restore() {
    this.generation++; this.replace(new BuiltinAvatar()); this.name.textContent = '七草荠 · NAZUNA';
    this.reset.disabled = true; this.showMessage(''); this.note.textContent = '移光随眸，轻触致意 · 真实声波驱动共振光环';
    this.element.dataset.model = 'builtin';
  }
  async importFile(file: File) {
    if (!this.renderer) { this.showMessage('3D 舞台不可用，暂时无法载入本地模型。'); return; }
    const generation = ++this.generation;
    this.reset.disabled = false;
    this.showMessage('正在解析本机 VRM 资产…');
    try {
      if (file.size > MAX_VRM_BYTES) throw new Error('模型体积超过 64 MB 上限，请选用较轻量的自包含 VRM。');
      if (!file.name.toLowerCase().endsWith('.vrm')) throw new Error('请选择标准 .vrm 模型文件。');
      const data = await file.arrayBuffer();
      validateVrm(data);
      if (generation !== this.generation) return;
      const { loadVrm } = await import('./vrm-driver');
      const driver = await loadVrm(data);
      if (generation !== this.generation) { driver.dispose(); return; }
      this.replace(driver);
      this.name.textContent = file.name.replace(/\.vrm$/i, '').slice(0, 40);
      this.element.dataset.model = 'vrm';
      this.showMessage(''); this.note.textContent = '模型仅于本机载入 · 表情取决于资产支持';
    } catch (error) {
      if (generation !== this.generation) return;
      this.showMessage(error instanceof Error ? error.message : '模型未能载入，已保留原有形象。');
    }
  }
  connected(value: boolean) {
    this.state.setConnected(value);
    if (!this.renderer) {
      this.status.textContent = value ? '3D 不可用' : '幕布未启';
      this.onMoodChange?.(value ? 'idle' : 'offline');
    }
  }
  begin(id: string, hasScreen: boolean) { this.peakMouth = 0; this.state.begin(id, hasScreen); }
  text(id: string) { this.state.text(id); }
  complete(id: string) { this.state.complete(id); }
  interrupt(id: string) { this.state.interrupt(id, performance.now() / 1000); this.closeMouth(); }
  fail(id: string) { this.state.fail(id); this.closeMouth(); }
  playback(playing: boolean) { this.state.playback(playing); if (!playing) this.closeMouth(); }
  replay() { this.peakMouth = 0; this.state.replay(); }
  resetConversation() { this.peakMouth = 0; this.state.reset(); this.closeMouth(); }
  private closeMouth() { this.mouthMeter.value = 0; this.element.dataset.mouth = '0'; }
  pause() { this.paused = true; cancelAnimationFrame(this.frameId); this.frameId = 0; }
  resume() {
    if (!this.renderer || document.hidden) return;
    this.paused = false; this.previous = 0;
    if (!this.frameId) this.frameId = requestAnimationFrame(this.animate);
  }
  private animate = (timestamp: number) => {
    if (this.paused || !this.renderer) return;
    this.frameId = requestAnimationFrame(this.animate);
    if (timestamp - this.previous < 1000 / 30) return;
    const delta = this.previous ? (timestamp - this.previous) / 1000 : 1 / 30;
    this.previous = timestamp;
    const analyser = this.analyser();
    if (analyser) analyser.getFloatTimeDomainData(this.samples); else this.samples.fill(0);
    const frame = this.state.frame(timestamp / 1000, delta, rms(this.samples), this.media.matches);
    this.driver?.update(frame, Math.min(delta, .1), this.media.matches);
    this.renderer.render(this.scene, this.camera);
    this.mouthMeter.value = frame.mouth;
    this.element.dataset.mouth = frame.mouth.toFixed(3);
    this.peakMouth = Math.max(this.peakMouth, frame.mouth);
    this.element.dataset.mouthPeak = this.peakMouth.toFixed(3);
    this.element.dataset.mood = frame.mood;
    this.element.dataset.gesture = frame.gesture ?? 'none';
    this.element.dataset.frameTime = (timestamp / 1000).toFixed(3);
    this.element.dataset.gesturePhase = frame.gesture && frame.gestureProgress > .3 && frame.gestureProgress < .7 ? 'active' : 'rest';
    if (frame.mood !== this.lastMood) {
      this.status.textContent = labels[frame.mood];
      this.lastMood = frame.mood;
      this.onMoodChange?.(frame.mood);
    }
  };
}
