import { ApiError } from './api';
import type { ScreenFrame } from './types';

type Policy = (sid: string, enabled: boolean, source?: string, keepalive?: boolean) => Promise<{ epoch: number }>;
export interface ScreenStatus { kind: 'off' | 'choosing' | 'sample' | 'window'; label: string; ready: boolean }

export class ScreenSource {
  private generation = 0;
  private stream: MediaStream | null = null;
  private sourceId = '';
  private epoch = 0;
  private sid = '';
  private ready = false;
  private kind: 'off' | 'sample' | 'window' = 'off';
  private policyQueue: Promise<unknown> = Promise.resolve();

  constructor(
    private video: HTMLVideoElement,
    private sample: HTMLCanvasElement,
    private policy: Policy,
    private changed: (status: ScreenStatus) => void,
    private invalidated: () => void,
    private error: (error: unknown) => void,
  ) {}

  get available() { return this.ready; }
  get owner() { return this.sid; }

  private enqueue(sid: string, enabled: boolean, source?: string, keepalive = false) {
    const next = this.policyQueue.catch(() => {}).then(() => this.policy(sid, enabled, source, keepalive));
    this.policyQueue = next;
    return next;
  }

  private clearLocal() {
    this.generation++;
    this.ready = false;
    this.kind = 'off';
    if (this.stream) {
      for (const track of this.stream.getTracks()) { track.onended = null; track.stop(); }
    }
    this.stream = null;
    this.video.srcObject = null;
    this.sample.getContext('2d')?.clearRect(0, 0, this.sample.width, this.sample.height);
    this.invalidated();
    this.changed({ kind: 'off', label: '尚未择定视窗', ready: false });
    return this.generation;
  }

  async stop(keepalive = false) {
    const oldSid = this.sid;
    this.clearLocal();
    this.sid = ''; this.sourceId = ''; this.epoch = 0;
    if (oldSid) {
      try { await this.enqueue(oldSid, false, undefined, keepalive); }
      catch (error) { this.error(error); }
    }
  }

  private async enable(sid: string, kind: 'sample' | 'window', label: string, generation: number) {
    if (generation !== this.generation) return;
    const source = `browser-${crypto.randomUUID()}`;
    this.sid = sid; this.sourceId = source; this.kind = kind;
    const result = await this.enqueue(sid, true, source);
    if (generation !== this.generation) return;
    this.epoch = result.epoch; this.ready = true;
    this.changed({ kind, label, ready: true });
  }

  async useSample(sid: string) {
    const oldSid = this.sid;
    const generation = this.clearLocal();
    if (oldSid) void this.enqueue(oldSid, false).catch(this.error);
    drawSample(this.sample);
    this.changed({ kind: 'choosing', label: '正在铺展光学样张', ready: false });
    try { await this.enable(sid, 'sample', '样张 · 光蚀画片', generation); }
    catch (error) { if (generation === this.generation) { await this.stop(); this.error(error); } }
  }

  async chooseWindow(sid: string) {
    if (!navigator.mediaDevices?.getDisplayMedia) throw new ApiError('capture_unavailable');
    const oldSid = this.sid;
    const generation = this.clearLocal();
    if (oldSid) void this.enqueue(oldSid, false).catch(this.error);
    this.changed({ kind: 'choosing', label: '等待择取系统窗口', ready: false });
    try {
      // Keep getDisplayMedia inside the click's user activation, before any await.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 5, max: 10 } }, audio: false,
      });
      if (generation !== this.generation) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      this.video.srcObject = stream;
      const track = stream.getVideoTracks()[0];
      if (!track) throw new ApiError('capture_not_ready');
      track.onended = () => { if (generation === this.generation) void this.stop(); };
      await this.video.play();
      if (generation !== this.generation) return;
      await this.enable(sid, 'window', track.label || '已选系统窗口', generation);
    } catch (error) {
      if (generation !== this.generation) return;
      await this.stop();
      if (error instanceof DOMException && error.name === 'NotAllowedError') return;
      this.error(error);
    }
  }

  snapshot(): ScreenFrame {
    if (!this.ready) throw new ApiError('capture_not_ready');
    const source = this.kind === 'sample' ? this.sample : this.video;
    const width = this.kind === 'sample' ? this.sample.width : this.video.videoWidth;
    const height = this.kind === 'sample' ? this.sample.height : this.video.videoHeight;
    if (!width || !height) throw new ApiError('capture_not_ready');
    const scale = Math.min(1, 1280 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new ApiError('capture_not_ready');
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg', .76).split(',')[1];
    if (!image || image.length > 2_750_000) throw new ApiError('image_too_large');
    return { image_base64: image, mime_type: 'image/jpeg', source_id: this.sourceId,
      policy_epoch: this.epoch, captured_at: new Date().toISOString() };
  }
}

export function drawSample(canvas: HTMLCanvasElement) {
  canvas.width = 1280; canvas.height = 800;
  const ctx = canvas.getContext('2d')!;
  // Warm mineral vellum exhibition plate (uses only methods mocked in screen.test.ts)
  ctx.fillStyle = '#e8e4da'; ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#f7f4ed'; ctx.beginPath(); ctx.roundRect(72, 68, 1136, 664, 28); ctx.fill();
  ctx.fillStyle = '#d9d3c6'; ctx.fillRect(72, 152, 1136, 2);
  ctx.fillStyle = '#e83b1e'; ctx.beginPath(); ctx.arc(124, 112, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2d5da8'; ctx.beginPath(); ctx.arc(152, 112, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#009fb8'; ctx.beginPath(); ctx.arc(180, 112, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5c5f68'; ctx.font = '20px Consolas, monospace';
  ctx.fillText('ECHO // OPTICAL SAMPLE PLATE 01', 224, 120);
  ctx.fillStyle = '#111318'; ctx.font = 'bold 52px "Microsoft YaHei", sans-serif';
  ctx.fillText('光影之间，留一段静默。', 136, 278);
  ctx.fillStyle = '#5c5f68'; ctx.font = '24px "Microsoft YaHei", sans-serif';
  ctx.fillText('以合成光学样张校验视窗采帧与多模态通路，不涉及系统桌面。', 136, 334);
  ['翻阅未读完的画册', '放一张轻盈的器乐黑胶', '梳理今晚留下的思绪'].forEach((text, i) => {
    const y = 420 + i * 78;
    ctx.fillStyle = i === 0 ? '#111318' : '#ece8df';
    ctx.beginPath(); ctx.roundRect(136, y - 28, 1008, 58, 16); ctx.fill();
    ctx.fillStyle = i === 0 ? '#f8f6f2' : '#2c2f38';
    ctx.font = '23px "Microsoft YaHei", sans-serif'; ctx.fillText(text, 172, y + 9);
    ctx.fillStyle = i === 0 ? '#b8f227' : '#6c707a';
    ctx.font = '19px Consolas, monospace'; ctx.fillText(['PLATE 01 · 15M', 'PLATE 02 · 40M', 'PLATE 03 · 10M'][i], 946, y + 8);
  });
}
