import './style.css';
import './avatar.css';
import nazunaHeadUrl from './assets/nazuna-head.webp';
import {
  ApiError,
  BackendApi,
  clearLocalBearerToken,
  explainError,
  getLocalBearerToken,
  setLocalBearerToken,
} from './api';
import { PcmPlayer } from './audio';
import type { AudioStatus } from './audio';
import { AvatarStage } from './avatar';
import { rms } from './avatar-state';
import type { AvatarMood } from './avatar-state';
import { DraftingController, mountFloatingDock, mountLiquidSegmented } from './liquid-controls';
import { glassRegistry, type GlassPresetId } from './liquid-glass';
import { MossLiveClient, type LiveConnectionState } from './moss-live';
import { PerformanceController } from './performance-tier';
import { ScreenSource } from './screen';
import { SfxEngine } from './sfx';
import { StageLiquidGlassEngine, type PointerState } from './stage-canvas';
import { MOOD_ATMOSPHERES, STAGE_SKIES, type StageSkyId } from './stage-skies';
import { TurnCoordinator } from './turns';
import type {
  BackendConfig,
  LiveLanguage,
  MemoryFact,
  MemoryProposal,
  MossVoice,
  PipelineEvent,
  Session,
} from './types';

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = el<HTMLTextAreaElement>('message-input');
const sendButton = el<HTMLButtonElement>('send');
const interruptButton = el<HTMLButtonElement>('interrupt');
const dockInterruptButton = el<HTMLButtonElement>('dock-interrupt-btn');
const dockNewButton = el<HTMLButtonElement>('dock-new-btn');
const dockLiveButton = el<HTMLButtonElement>('dock-live-btn');
const liveToggleButton = el<HTMLButtonElement>('live-toggle-btn');
const liveCallBar = el('live-call-bar');
const liveCallAvatar = el('live-call-avatar');
const liveCallStateEl = el('live-call-state');
const liveCallTimerEl = el('live-call-timer');
const liveMicMeter = el<HTMLMeterElement>('live-mic-meter');
const liveLangSelect = el<HTMLSelectElement>('live-lang-select');
const liveVoiceSelect = el<HTMLSelectElement>('live-voice-select');
const liveMuteButton = el<HTMLButtonElement>('live-mute-btn');
const liveBargeButton = el<HTMLButtonElement>('live-barge-btn');
const liveMockSayButton = el<HTMLButtonElement>('live-mock-say');
const liveMockBargeButton = el<HTMLButtonElement>('live-mock-barge');
const liveHangupButton = el<HTMLButtonElement>('live-hangup-btn');
const liveLockButton = el<HTMLButtonElement>('live-lock-btn');
const exportChatButton = el<HTMLButtonElement>('export-chat');
const soundCheckbox = el<HTMLInputElement>('sound-enabled');
const sfxCheckbox = el<HTMLInputElement>('sfx-enabled');
const attachCheckbox = el<HTMLInputElement>('attach-screen');
const replayButton = el<HTMLButtonElement>('replay');
const organizeButton = el<HTMLButtonElement>('organize-memory');
const api = new BackendApi();
const sfx = new SfxEngine();

// Bind bespoke Nazuna portrait medallion across HUD, stage, call bar, and tab favicon
el<HTMLImageElement>('hud-avatar-mini').src = nazunaHeadUrl;
el<HTMLImageElement>('stage-avatar-img').src = nazunaHeadUrl;
el<HTMLImageElement>('live-call-avatar-img').src = nazunaHeadUrl;
const faviconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (faviconEl) {
  faviconEl.type = 'image/webp';
  faviconEl.href = nazunaHeadUrl;
}

let session: Session | null = null;
let backendConfig: BackendConfig | null = null;
let ready = false;
let screenBusy = false;
let memoryBusy = false;
let connectionGeneration = 0;
let coordinator: TurnCoordinator;
let avatar: AvatarStage | undefined;
let audioStatus: AudioStatus = { playing: false, queued: 0, playedChunks: 0, receivedSeconds: 0 };
let replayAudio: string[] = [];
let replayBytes = 0;
let replayTurn = '';
let eventCount = 0;
let animation = 0;
let pendingProposals: MemoryProposal[] = [];
let confirmedFacts: MemoryFact[] = [];
let liveVoices: MossVoice[] = [];
let liveState: LiveConnectionState = 'idle';
let liveSpeaking = false;
let liveCallStartedAt = 0;
let liveTimerId = 0;
let mockUtteranceIndex = 0;
const views = new Map<string, { content: HTMLElement; footer: HTMLElement }>();
const liveViews = new Map<string, { content: HTMLElement; footer: HTMLElement }>();
const MOCK_LIVE_UTTERANCES = [
  '你好七草荠，我正在校验 MOSS-Live 全双工语音通道。',
  '记住：我习惯在深夜听着雨声写代码。',
  '今晚的天幕色彩很温柔，能跟我聊点轻松的话题吗？',
];
const waveCanvas = el<HTMLCanvasElement>('waveform');
const waveContext = waveCanvas.getContext('2d')!;
const audioSamples = new Float32Array(256);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ==========================================================================
// Lumen Folio Stage Sky, Liquid Glass Engine, Drafting Overlay & HUD
// ==========================================================================
const SKY_STORAGE = 'companion:stage-sky';
const PRESET_STORAGE = 'companion:glass-preset';
const LANG_STORAGE = 'companion:live-lang';
const VOLUME_STORAGE = 'companion:volume';
const PERSONA_ID_STORAGE = 'companion:persona-id';
const PERSONA_PROMPT_STORAGE = 'companion:persona-prompt';

const LIVE_LANG_LABELS: Record<LiveLanguage, string> = {
  zh: '中文',
  ja: '日本語',
  en: 'English',
};
const VALID_LANGS: readonly LiveLanguage[] = ['zh', 'ja', 'en'];

interface PersonaPreset {
  id: string;
  label: string;
  prompt: string;
}

const PERSONA_PRESETS: readonly PersonaPreset[] = [
  {
    id: 'nazuna',
    label: '夜行七草荠',
    prompt:
      '你是七草荠（Nanakusa Nazuna），性格自由散漫、俏皮直率、带一点深夜漫步的慵懒与小得意。说话像熟识的夜行伙伴一样自然简短，偶尔轻轻吐槽，但真心关心对方。不要机械复述问题，也不要用客服腔或长篇大论。',
  },
  {
    id: 'ja_tutor',
    label: '日语陪练',
    prompt:
      '你是七草荠（Nanakusa Nazuna），正在和朋友用轻松自然的东京日常日语聊天。回复简短有来有往，如果对方日语有更地道的说法，可以用玩笑口吻顺手点一句，保持自在不拘束的夜聊氛围。',
  },
  {
    id: 'focus',
    label: '静音伴读',
    prompt:
      '你是七草荠，正安静地陪对方深夜工作或读书。语气比平时更柔和克制、短句清晰、少打扰，在对方卡壳或疲惫时给出轻巧的鼓励与提醒。',
  },
  {
    id: 'coder',
    label: '代码搭档',
    prompt:
      '你是七草荠，同时是思维敏锐的深夜工程搭档。回答直击重点、逻辑利落，帮对方拆解 Bug 和设计思路时偶尔带点俏皮吐槽，不堆砌废话。',
  },
];

function readStored<T extends string>(key: string, valid: readonly T[], fallback: T): T {
  try {
    const raw = localStorage.getItem(key) as T | null;
    if (raw && valid.includes(raw)) return raw;
  } catch { /* ignore storage errors */ }
  return fallback;
}

const VALID_SKIES = STAGE_SKIES.map(s => s.id) as StageSkyId[];
const VALID_PRESETS: readonly GlassPresetId[] = ['apple', 'thick', 'prism', 'frosted'];
let currentSky: StageSkyId = readStored(SKY_STORAGE, VALID_SKIES, 'pale');
let currentPreset: GlassPresetId = readStored(PRESET_STORAGE, VALID_PRESETS, 'apple');
let currentLiveLang: LiveLanguage = readStored(LANG_STORAGE, VALID_LANGS, 'zh');
let currentPersonaId = (() => {
  try { return localStorage.getItem(PERSONA_ID_STORAGE) || 'nazuna'; } catch { return 'nazuna'; }
})();
let currentPersonaPrompt = (() => {
  try {
    return localStorage.getItem(PERSONA_PROMPT_STORAGE) || PERSONA_PRESETS[0].prompt;
  } catch {
    return PERSONA_PRESETS[0].prompt;
  }
})();
const storedVolume = (() => {
  try {
    const v = Number(localStorage.getItem(VOLUME_STORAGE));
    return Number.isFinite(v) && v >= 0 && v <= 100 ? v : 45;
  } catch { return 45; }
})();

const pointer: PointerState = { x: 0, y: 0, nx: 0.56, ny: 0.45, speed: 0, active: false };
let lastPtrX = window.innerWidth * 0.55;
let lastPtrY = window.innerHeight * 0.45;
let lastPtrT = performance.now();

window.addEventListener('pointermove', e => {
  const now = performance.now();
  const dt = Math.max(now - lastPtrT, 8);
  const speed = Math.min(Math.hypot((e.clientX - lastPtrX) / dt, (e.clientY - lastPtrY) / dt), 4.0);
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.nx = e.clientX / Math.max(window.innerWidth, 1);
  pointer.ny = e.clientY / Math.max(window.innerHeight, 1);
  pointer.speed = speed;
  pointer.active = true;
  if (speed > 0.75) stageEngine.triggerFoil(Math.min(1, 0.25 + speed * 0.14));
  lastPtrX = e.clientX; lastPtrY = e.clientY; lastPtrT = now;
}, { passive: true });

window.addEventListener('pointerleave', () => {
  pointer.active = false;
  pointer.speed = 0;
}, { passive: true });

const drafting = new DraftingController(
  document.getElementById('draft-outer-plane') as unknown as SVGGElement | null,
  document.getElementById('draft-inner-plane') as unknown as SVGGElement | null,
  document.getElementById('drafting-watermark'),
  document.getElementById('drafting-reticle'),
  document.getElementById('broadcast-flash'),
  pointer,
);

function currentAudioEnergy(): number {
  if (!audioStatus.playing || !player.analyser) return 0;
  player.analyser.getFloatTimeDomainData(audioSamples);
  return Math.min(1, rms(audioSamples) * 18);
}

const stageEngine = new StageLiquidGlassEngine(
  el('stage-gl-host'),
  el('stage-fallback'),
  pointer,
  currentAudioEnergy,
);

const MOOD_CN: Record<AvatarMood, string> = {
  offline: '待连',
  idle: '静候',
  thinking: '思索',
  looking: '观屏',
  replying: '落字',
  speaking: '声纹',
  interrupted: '截断',
  error: '受阻',
};

function applyMoodAtmosphere(mood: AvatarMood) {
  const atmo = MOOD_ATMOSPHERES[mood];
  const root = document.documentElement.style;
  root.setProperty('--atmo-a', atmo.primaryPigment);
  root.setProperty('--atmo-b', atmo.secondaryPigment);
  root.setProperty('--atmo-foil-a', atmo.foilAccentA);
  root.setProperty('--atmo-foil-b', atmo.foilAccentB);
  root.setProperty('--atmo-signal', atmo.signalAccent);
  el('hud-plate').textContent = `${atmo.plateCode} · ${MOOD_CN[mood]}`;
  drafting.setWatermark(atmo.plateCode.slice(-2));
  stageEngine.setAtmosphere(atmo);
}

const skySegmented = mountLiquidSegmented<StageSkyId>(
  el('sky-segmented'),
  STAGE_SKIES.slice(0, 4).map(s => ({ id: s.id, label: s.shortLabel })),
  currentSky === 'dawn' ? 'eclipse' : currentSky,
  next => applySky(next, true),
  'hud-sky',
  44,
);

const floatingDock = mountFloatingDock({
  bar: el('dock-bar'),
  orb: el<HTMLButtonElement>('dock-orb'),
  popover: el('stage-popover'),
  skyGrid: el('dock-sky-grid'),
  presetGrid: el('dock-preset-grid'),
  closeButton: el<HTMLButtonElement>('popover-close'),
  flashButton: el<HTMLButtonElement>('flash-test-btn'),
  initialSky: currentSky,
  initialPreset: currentPreset,
  onSkyChange: sky => applySky(sky, true),
  onPresetChange: preset => applyPreset(preset),
  onFlash: () => { drafting.flash(); stageEngine.triggerFoil(1.0); sfx.play('skyShift'); },
  onFoilImpulse: s => stageEngine.triggerFoil(s),
});

function applySky(sky: StageSkyId, flash = false) {
  const changed = currentSky !== sky;
  currentSky = sky;
  const dark = sky !== 'pale';
  document.documentElement.dataset.skyTheme = dark ? 'dark' : 'light';
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = dark ? '#12101c' : '#f3f0e9';
  stageEngine.setSky(sky);
  skySegmented.setValue(sky === 'dawn' ? 'eclipse' : sky);
  floatingDock.syncSky(sky);
  if (flash) {
    drafting.flash();
    if (changed) sfx.play('skyShift');
  }
  try { localStorage.setItem(SKY_STORAGE, sky); } catch { /* ignore */ }
  if (!animation) drawWave();
}

function applyPreset(preset: GlassPresetId) {
  const changed = currentPreset !== preset;
  currentPreset = preset;
  stageEngine.setPreset(preset);
  floatingDock.syncPreset(preset);
  if (changed) sfx.play('click');
  try { localStorage.setItem(PRESET_STORAGE, preset); } catch { /* ignore */ }
}

function renderPersonaControls() {
  const grid = el('dock-persona-grid');
  const promptInput = el<HTMLTextAreaElement>('persona-prompt-input');
  grid.replaceChildren();
  for (const preset of PERSONA_PRESETS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dock-chip';
    btn.classList.toggle('is-active', preset.id === currentPersonaId);
    btn.textContent = preset.label;
    btn.addEventListener('click', () => {
      currentPersonaId = preset.id;
      currentPersonaPrompt = preset.prompt;
      promptInput.value = preset.prompt;
      try {
        localStorage.setItem(PERSONA_ID_STORAGE, currentPersonaId);
        localStorage.setItem(PERSONA_PROMPT_STORAGE, currentPersonaPrompt);
      } catch { /* ignore */ }
      sfx.play('click');
      renderPersonaControls();
    });
    grid.append(btn);
  }
  if (promptInput.value !== currentPersonaPrompt) {
    promptInput.value = currentPersonaPrompt;
  }
}

function syncLanguageControls(lang: LiveLanguage) {
  currentLiveLang = lang;
  liveLangSelect.value = lang;
  document.querySelectorAll<HTMLButtonElement>('[data-live-lang]').forEach(btn => {
    const active = btn.dataset.liveLang === lang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function switchLiveLanguage(lang: LiveLanguage, fromUser = true) {
  const changed = currentLiveLang !== lang;
  syncLanguageControls(lang);
  try { localStorage.setItem(LANG_STORAGE, lang); } catch { /* ignore */ }
  if (!fromUser) return;
  if (changed) {
    sfx.play('langSwitch');
    stageEngine.triggerFoil(0.65);
  } else {
    sfx.play('click');
  }
  if (liveClient.isConnected) {
    liveCallStateEl.textContent = `正在热切至 ${LIVE_LANG_LABELS[lang]}…`;
    liveClient.setLanguage(lang);
  } else if (ready) {
    el('turn-status').textContent = `实时语音语言已切换为 ${LIVE_LANG_LABELS[lang]}`;
  }
}

// Register structural Liquid Glass cards and HUD capsules into GPU SDF compositor
glassRegistry.register({
  id: 'hud-brand-pill', element: el('hud-brand-pill'), radius: 'pill', edgeShape: 'convex',
  mergeGroup: 0, priority: 55, overrideRefraction: 22, overrideDispersion: 0.28,
});
glassRegistry.register({
  id: 'hud-tier-btn', element: el('tier-button'), radius: 'pill', edgeShape: 'convex',
  mergeGroup: 0, priority: 52, overrideRefraction: 20, overrideDispersion: 0.22,
});
glassRegistry.register({
  id: 'hud-status-pill', element: el('hud-status-pill'), radius: 'pill', edgeShape: 'convex',
  mergeGroup: 0, priority: 54, overrideRefraction: 22, overrideDispersion: 0.26,
});
glassRegistry.register({
  id: 'stage-conversation', element: el('conversation-panel'), radius: 26, edgeShape: 'convex',
  mergeGroup: 0, priority: 20, overrideBlurMix: 0.78, overrideFrost: 0.28, overrideRefraction: 20, overrideDispersion: 0.16,
});
glassRegistry.register({
  id: 'inspector-screen', element: el('screen-card'), radius: 24, edgeShape: 'convex',
  mergeGroup: 0, priority: 22, overrideBlurMix: 0.82, overrideFrost: 0.3, overrideRefraction: 18, overrideDispersion: 0.15,
});
glassRegistry.register({
  id: 'inspector-audio', element: el('audio-card'), radius: 24, edgeShape: 'convex',
  mergeGroup: 0, priority: 24, overrideBlurMix: 0.82, overrideFrost: 0.3, overrideRefraction: 18, overrideDispersion: 0.15,
});
glassRegistry.register({
  id: 'inspector-telemetry', element: el('telemetry-card'), radius: 24, edgeShape: 'convex',
  mergeGroup: 0, priority: 26, overrideBlurMix: 0.82, overrideFrost: 0.3, overrideRefraction: 18, overrideDispersion: 0.15,
});

const perf = new PerformanceController(snap => {
  el('tier-label').textContent = snap.override ? `${snap.tier.toUpperCase()}·MAN` : snap.tier.toUpperCase();
  el('fps-label').textContent = `${snap.fps}FPS`;
  stageEngine.setTier(snap.tier);
  drafting.setTier(snap.tier);
});
el('tier-button').addEventListener('click', () => { perf.cycleOverride(); stageEngine.triggerFoil(0.6); sfx.play('click'); });

function updateClock() {
  const now = new Date();
  el('hud-clock').textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':');
}
updateClock();
window.setInterval(updateClock, 1000);

// ==========================================================================
// Stage Focus & Inspector Tabs
// ==========================================================================
let stageFocused = false;
function setStageFocus(next: boolean) {
  stageFocused = next;
  el('conversation-panel').classList.toggle('is-stage-focused', next);
  const toggleBtn = el<HTMLButtonElement>('toggle-stage-focus');
  const dockFocusBtn = el<HTMLButtonElement>('dock-focus-btn');
  toggleBtn.setAttribute('aria-pressed', String(next));
  toggleBtn.textContent = next ? '收拢幕布' : '展开幕布';
  dockFocusBtn.setAttribute('aria-pressed', String(next));
  avatar?.setExpanded(next);
}
el('toggle-stage-focus').addEventListener('click', () => { sfx.play('click'); setStageFocus(!stageFocused); });
el('dock-focus-btn').addEventListener('click', () => { sfx.play('click'); setStageFocus(!stageFocused); });

function switchInspectorTab(tab: 'telemetry' | 'memory') {
  const isMem = tab === 'memory';
  el('tab-btn-telemetry').classList.toggle('is-active', !isMem);
  el('tab-btn-telemetry').setAttribute('aria-selected', String(!isMem));
  el('tab-btn-memory').classList.toggle('is-active', isMem);
  el('tab-btn-memory').setAttribute('aria-selected', String(isMem));
  el('panel-telemetry').hidden = isMem;
  el('panel-memory').hidden = !isMem;
}
el('tab-btn-telemetry').addEventListener('click', () => { sfx.play('click'); switchInspectorTab('telemetry'); });
el('tab-btn-memory').addEventListener('click', () => {
  sfx.play('click');
  switchInspectorTab('memory');
  if (session && ready) void refreshFacts();
});
el('dock-memory-btn').addEventListener('click', () => {
  sfx.play('click');
  switchInspectorTab('memory');
  el('telemetry-card').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  if (session && ready) void refreshFacts();
});

// ==========================================================================
// Core Companion Console Logic
// ==========================================================================
function showError(error: unknown) {
  el('notice-text').textContent = explainError(error);
  el('notice').hidden = false;
  sfx.play('error');
}

function actions() {
  const liveActive = liveState === 'connecting' || liveState === 'connected';
  const liveConnected = liveState === 'connected';
  sendButton.disabled = !ready || screenBusy || !input.value.trim();
  input.disabled = !ready;
  el<HTMLButtonElement>('new-session').disabled = !ready;
  el<HTMLButtonElement>('mobile-new-session').disabled = !ready;
  dockNewButton.disabled = !ready;
  liveToggleButton.disabled = !ready;
  dockLiveButton.disabled = !ready;
  liveLockButton.hidden = !(backendConfig?.mode === 'live' && Boolean(getLocalBearerToken()));
  exportChatButton.disabled = el('messages').querySelectorAll('.message').length === 0;
  liveToggleButton.setAttribute('aria-pressed', String(liveActive));
  dockLiveButton.setAttribute('aria-pressed', String(liveActive));
  liveToggleButton.querySelector('span')!.textContent = liveConnected ? '通话中' : liveActive ? '连接中…' : '语音通话';
  dockLiveButton.querySelector('span')!.textContent = liveActive ? '挂断通话' : '语音通话';
  liveCallBar.hidden = !liveActive;
  liveCallBar.classList.toggle('is-connected', liveConnected);
  liveCallAvatar.classList.toggle('is-speaking', liveSpeaking);
  liveVoiceSelect.disabled = !liveConnected;
  liveLangSelect.disabled = !liveConnected;
  liveMuteButton.disabled = !liveConnected || !liveClient.hasMic;
  liveBargeButton.disabled = !liveConnected || !liveSpeaking;
  const isMockLive = liveConnected && liveClient.ready?.mode === 'mock';
  liveMockSayButton.hidden = !isMockLive;
  liveMockBargeButton.hidden = !isMockLive;
  liveMockSayButton.disabled = !isMockLive;
  liveMockBargeButton.disabled = !isMockLive || !liveSpeaking;
  el<HTMLButtonElement>('choose-screen').disabled = !ready;
  el<HTMLButtonElement>('sample-screen').disabled = !ready;
  organizeButton.disabled = !ready || memoryBusy;
  const running = coordinator?.current && !coordinator.current.terminal && !coordinator.current.cancelled;
  const canStop = Boolean(running || audioStatus.playing || liveSpeaking);
  interruptButton.disabled = !canStop;
  dockInterruptButton.disabled = !canStop;
  replayButton.disabled = !ready || !replayAudio.length || !soundCheckbox.checked || !!running || liveActive;
}

function drawWave() {
  animation = 0;
  const w = waveCanvas.width, h = waveCanvas.height;
  waveContext.clearRect(0, 0, w, h);
  const styles = getComputedStyle(document.documentElement);
  const activeStroke = styles.getPropertyValue('--atmo-signal').trim() || '#e83b1e';
  const idleStroke = styles.getPropertyValue('--ink-hairline-strong').trim() || 'rgba(17,19,24,0.28)';
  waveContext.strokeStyle = audioStatus.playing ? activeStroke : idleStroke;
  waveContext.lineWidth = audioStatus.playing ? 2.4 : 1.5;
  waveContext.beginPath();
  const values = new Uint8Array(128);
  if (audioStatus.playing && player.analyser && !reducedMotion.matches) {
    player.analyser.getByteTimeDomainData(values);
  } else values.fill(128);
  for (let i = 0; i < values.length; i++) {
    const y = h / 2 + (values[i] - 128) * 2.5;
    const x = i / (values.length - 1) * w;
    if (i === 0) waveContext.moveTo(x, y); else waveContext.lineTo(x, y);
  }
  waveContext.stroke();
  if (audioStatus.playing && !reducedMotion.matches) animation = requestAnimationFrame(drawWave);
}

const player = new PcmPlayer(status => {
  audioStatus = status;
  avatar?.playback(status.playing);
  const liveAudioLabel = backendConfig?.mode === 'live' ? '七草荠声轨共振中' : '声波共振中（诊断音）';
  el('audio-status').textContent = !soundCheckbox.checked
    ? '声景已静默'
    : status.playing
      ? liveAudioLabel
      : status.playedChunks
        ? '余韵已落'
        : '静候声波';
  el('audio-chunks').textContent = String(status.playedChunks);
  actions();
  if (!animation) drawWave();
});

avatar = new AvatarStage(el('avatar-stage'), () => player.analyser, mood => applyMoodAtmosphere(mood));

const screen = new ScreenSource(
  el<HTMLVideoElement>('screen-video'), el<HTMLCanvasElement>('screen-sample'),
  (sid, enabled, source, keepalive) => api.policy(sid, enabled, source, keepalive),
  status => {
    screenBusy = status.kind === 'choosing';
    el('screen-status').textContent = screenBusy ? '择取中' : status.ready ? '本地预览中' : '未启视野';
    el('screen-source-name').textContent = status.label;
    el('screen-source-name').parentElement!.classList.toggle('active', status.ready);
    el('screen-placeholder').hidden = status.ready;
    el('screen-video').hidden = status.kind !== 'window' || !status.ready;
    el('screen-sample').hidden = status.kind !== 'sample' || !status.ready;
    el<HTMLButtonElement>('stop-screen').disabled = status.kind === 'off';
    attachCheckbox.disabled = !status.ready;
    attachCheckbox.checked = status.ready;
    el('attachment-chip').hidden = !status.ready;
    actions();
  },
  () => {
    if (coordinator?.current?.hasScreen) coordinator.cancel();
    attachCheckbox.checked = false;
    el('attachment-chip').hidden = true;
  },
  showError,
);

function message(role: 'user' | 'assistant', text: string, withScreen = false, channel: 'http' | 'live' = 'http') {
  const item = document.createElement('article');
  item.className = `message message-${role}`;
  item.dataset.role = role;
  item.dataset.channel = channel;
  const header = document.createElement('div'); header.className = 'message-header';
  const badge = document.createElement('span');
  badge.className = role === 'assistant' ? 'message-avatar is-portrait' : 'message-avatar';
  if (role === 'assistant') {
    const img = document.createElement('img');
    img.src = nazunaHeadUrl;
    img.alt = '七草荠';
    badge.append(img);
  } else {
    badge.textContent = '你';
  }
  const name = document.createElement('span');
  const liveTag = backendConfig?.moss_live?.provider === 'qwen' ? '七草荠 · QWEN 3.1' : '七草荠 · MOSS-LIVE';
  const httpTag = backendConfig?.mode === 'live' ? '七草荠 · 实时' : '七草荠 · 离线演练';
  name.textContent = role === 'user'
    ? (channel === 'live' ? '来访者 · LIVE 语音' : '来访者 · YOU')
    : (channel === 'live' ? liveTag : httpTag);
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'message-copy-btn';
  copyBtn.title = '复制本条文字';
  copyBtn.setAttribute('aria-label', '复制本条文字');
  copyBtn.innerHTML = '<svg class="icon"><use href="#i-copy" /></svg>';
  const time = document.createElement('time'); time.textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  header.append(badge, name, time, copyBtn);
  const content = document.createElement('div'); content.className = 'message-content'; content.textContent = text;
  copyBtn.addEventListener('click', () => {
    const raw = content.textContent?.trim();
    if (!raw || !navigator.clipboard) return;
    void navigator.clipboard.writeText(raw).then(() => {
      sfx.play('click');
      copyBtn.classList.add('is-copied');
      window.setTimeout(() => copyBtn.classList.remove('is-copied'), 1100);
    }).catch(() => {});
  });
  const footer = document.createElement('div'); footer.className = 'message-footer';
  item.append(header, content, footer);
  if (withScreen && role === 'user') {
    const label = document.createElement('div'); label.className = 'message-image-label'; label.textContent = '附带视窗一帧 · FRAME ATTACHED'; item.append(label);
  }
  el('messages').append(item);
  exportChatButton.disabled = false;
  return { content, footer };
}

function scrollMessages(force = false) {
  const messages = el('messages');
  if (force || messages.scrollHeight - messages.scrollTop - messages.clientHeight < 180) messages.scrollTop = messages.scrollHeight;
}

function logEvent(event: PipelineEvent) {
  eventCount++;
  el('event-count').textContent = `${String(eventCount).padStart(2, '0')} EVENTS`;
  el('log-count').textContent = String(eventCount);
  const row = document.createElement('li');
  const id = document.createElement('span'); id.textContent = String(event.id).padStart(2, '0');
  row.append(id, event.type);
  const list = el('event-log'); list.append(row);
  while (list.children.length > 60) list.firstElementChild?.remove();
  list.scrollTop = list.scrollHeight;
}

function logLiveEvent(action: string) {
  eventCount++;
  el('event-count').textContent = `${String(eventCount).padStart(2, '0')} EVENTS`;
  el('log-count').textContent = String(eventCount);
  const row = document.createElement('li');
  const id = document.createElement('span'); id.textContent = 'WS';
  row.append(id, action);
  const list = el('event-log'); list.append(row);
  while (list.children.length > 60) list.firstElementChild?.remove();
  list.scrollTop = list.scrollHeight;
}

function formatCallDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function stopLiveTimer() {
  if (liveTimerId) {
    window.clearInterval(liveTimerId);
    liveTimerId = 0;
  }
  liveCallTimerEl.textContent = '00:00';
}

function startLiveTimer() {
  stopLiveTimer();
  liveCallStartedAt = Date.now();
  liveCallTimerEl.textContent = '00:00';
  liveTimerId = window.setInterval(() => {
    liveCallTimerEl.textContent = formatCallDuration(Date.now() - liveCallStartedAt);
  }, 1000);
}

const liveClient = new MossLiveClient(player, {
  onState(next, readyInfo) {
    const prevState = liveState;
    liveState = next;
    if (next === 'connecting') {
      const provName = backendConfig?.moss_live?.provider === 'qwen' ? 'Qwen 3.1 实时语音' : 'MOSS-Live';
      liveCallStateEl.textContent = `正在握手 ${provName}…`;
      el('turn-status').textContent = '正在拨通实时语音声道';
      el('flow-state').textContent = 'WS 握手';
      stopLiveTimer();
    } else if (next === 'connected') {
      const modeTag = readyInfo?.mode === 'mock'
        ? '离线全双工演练'
        : readyInfo?.provider === 'qwen'
          ? 'Qwen 3.1 实时在线（静默门控省流）'
          : 'MOSS-Live 在线';
      liveCallStateEl.textContent = `${modeTag} · 随时可开口`;
      el('turn-status').textContent = readyInfo?.provider === 'qwen' && readyInfo?.mode === 'live'
        ? 'Qwen 3.1 七草荠实时通话中'
        : '实时全双工语音通话中';
      el('flow-state').textContent = '全双工在线';
      if (readyInfo?.voice && [...liveVoiceSelect.options].some(o => o.value === readyInfo.voice)) {
        liveVoiceSelect.value = readyInfo.voice;
      }
      if (readyInfo?.language && VALID_LANGS.includes(readyInfo.language)) {
        syncLanguageControls(readyInfo.language);
      }
      startLiveTimer();
      stageEngine.triggerFoil(0.85);
      sfx.play('callConnect');
    } else {
      const wasActive = prevState === 'connected' || prevState === 'connecting';
      liveSpeaking = false;
      liveMicMeter.value = 0;
      stopLiveTimer();
      avatar?.playback(false);
      avatar?.resetConversation();
      if (wasActive) sfx.play('callHangup');
      if (ready) {
        el('turn-status').textContent = '语音通话已挂断';
        el('flow-state').textContent = '待命';
      }
    }
    actions();
  },
  onTranscript(update) {
    el('empty-state').hidden = true;
    if (update.previousKey && liveViews.has(update.previousKey) && !liveViews.has(update.key)) {
      const moved = liveViews.get(update.previousKey)!;
      liveViews.delete(update.previousKey);
      liveViews.set(update.key, moved);
    }
    let view = liveViews.get(update.key);
    if (!view) {
      view = message(update.role, update.text, false, 'live');
      liveViews.set(update.key, view);
    } else {
      // MOSS-Live transcripts are full-text snapshots, always overwrite rather than append.
      view.content.textContent = update.text;
    }
    if (update.role === 'user') {
      view.footer.textContent = update.revised
        ? '已修订实时转写'
        : update.final
          ? '语音已识别'
          : '正在聆听转写…';
    } else {
      if (update.interrupted) {
        if (!view.footer.textContent?.startsWith('已打断 · 已播')) {
          view.footer.textContent = '已被打断 · 播放已停止';
        }
      } else {
        view.footer.textContent = update.final
          ? '全双工声轨落定'
          : '正在同步发声…';
      }
    }
    scrollMessages();
  },
  onUserSpeech(speaking) {
    if (speaking) {
      liveCallStateEl.textContent = '正在聆听你的声音…';
    } else {
      liveCallStateEl.textContent = '七草荠正在构思回应…';
      avatar?.begin(`live-think-${Date.now()}`, false);
    }
  },
  onAssistantStart(runId) {
    liveSpeaking = true;
    avatar?.begin(runId || 'live-reply', false);
    avatar?.text(runId || 'live-reply');
    liveCallStateEl.textContent = '七草荠正在回应（随时可打断）';
    stageEngine.triggerFoil(0.65);
    actions();
  },
  onAssistantInterrupt(runId, _turnId, _reason, playedAudioMs) {
    liveSpeaking = false;
    avatar?.interrupt(runId || 'live-reply');
    drafting.flash();
    stageEngine.triggerFoil(0.95);
    sfx.play('bargeIn');
    liveCallStateEl.textContent = `已打断 · 回报进度 ${playedAudioMs} ms`;
    const view = liveViews.get(`live-assistant-${runId}`);
    if (view) view.footer.textContent = `已打断 · 已播 ${playedAudioMs} ms`;
    actions();
  },
  onAssistantEnd(runId, _turnId, status) {
    liveSpeaking = false;
    if (status === 'completed') {
      avatar?.complete(runId || 'live-reply');
      liveCallStateEl.textContent = `通话在线（${LIVE_LANG_LABELS[currentLiveLang]}）· 随时可开口`;
    }
    actions();
  },
  onVoiceChanged(voiceName) {
    if ([...liveVoiceSelect.options].some(o => o.value === voiceName)) {
      liveVoiceSelect.value = voiceName;
    }
    sfx.play('langSwitch');
    liveCallStateEl.textContent = '实时音色已热切';
  },
  onLanguageChanged(lang) {
    syncLanguageControls(lang);
    liveCallStateEl.textContent = `已热切至 ${LIVE_LANG_LABELS[lang]} · 下句生效`;
    el('turn-status').textContent = `实时语音已热切为 ${LIVE_LANG_LABELS[lang]}`;
  },
  onMicState({ available, muted, level }) {
    liveMicMeter.value = level;
    liveMuteButton.disabled = liveState !== 'connected' || !available;
    liveMuteButton.setAttribute('aria-pressed', String(muted));
    liveMuteButton.querySelector('span')!.textContent = muted ? '取消静音' : '静音';
    const useEl = liveMuteButton.querySelector('use');
    if (useEl) useEl.setAttribute('href', muted ? '#i-mic-off' : '#i-mic');
  },
  onEvent(action) {
    logLiveEvent(action);
  },
  onNotice(error) {
    showError(error);
  },
});

async function refreshMossVoices() {
  try {
    const res = await api.mossVoices();
    liveVoices = res.voices;
    liveVoiceSelect.replaceChildren();
    const defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = '默认音色';
    liveVoiceSelect.append(defOpt);
    for (const voice of liveVoices) {
      const opt = document.createElement('option');
      opt.value = voice.id;
      opt.textContent = voice.name;
      liveVoiceSelect.append(opt);
    }
  } catch { /* voice catalog is optional */ }
}

async function toggleLiveCall() {
  if (!ready || !session) return;
  if (liveClient.isActive) {
    liveClient.disconnect();
    return;
  }
  coordinator.cancel();
  try {
    let ticket: string | undefined;
    if (backendConfig?.mode === 'live' || getLocalBearerToken()) {
      const res = await api.liveTicket(session.id);
      ticket = res.ticket;
    }
    await liveClient.connect(
      session.id,
      liveVoiceSelect.value || undefined,
      ticket,
      currentLiveLang,
    );
  } catch (error) {
    showError(error);
    actions();
  }
}

function millis(value: unknown) { return typeof value === 'number' ? `${Math.round(value)} ms` : '—'; }
function invalidateAudio() {
  player.stop(); replayAudio = []; replayBytes = 0; replayTurn = ''; actions();
}

coordinator = new TurnCoordinator(api, {
  created(record) {
    avatar?.begin(record.localId, record.hasScreen);
    el('empty-state').hidden = true;
    message('user', record.text, record.hasScreen);
    const view = message('assistant', '');
    view.footer.textContent = '正在汇聚回应…';
    views.set(record.localId, view);
    el('turn-status').textContent = record.hasScreen ? '正在凝视所附画面' : '正在构思回应';
    el('flow-state').textContent = '流式生成';
    for (const id of ['first-text', 'first-audio', 'duration']) el(id).textContent = '—';
    eventCount = 0; el('event-count').textContent = '00 EVENTS'; el('log-count').textContent = '0'; el('event-log').replaceChildren();
    replayAudio = []; replayBytes = 0; replayTurn = '';
    player.begin(record.localId);
    stageEngine.triggerFoil(0.7);
    actions(); scrollMessages(true);
  },
  event(record, event) {
    const view = views.get(record.localId)!;
    logEvent(event);
    const data = event.data;
    if (event.type === 'turn.started') {
      if (data.mode !== 'mock' && !getLocalBearerToken()) {
        coordinator.cancel();
        showError(new ApiError('test_ui_requires_mock'));
        return;
      }
      player.begin(event.turn_id);
      try { player.configure(Number(data.sample_rate), Number(data.channels), String(data.audio_format)); }
      catch (error) { showError(error); }
      view.footer.textContent = '管线已开启，正在落字…';
    } else if (event.type === 'text.delta' && typeof data.text === 'string') {
      avatar?.text(record.localId);
      view.content.textContent += data.text;
      scrollMessages();
    } else if (event.type === 'audio.chunk' && typeof data.audio_base64 === 'string') {
      if (soundCheckbox.checked) {
        try {
          player.push(event.turn_id, data.audio_base64);
          replayBytes += data.audio_base64.length;
          if (replayBytes <= 2_800_000) { replayAudio.push(data.audio_base64); replayTurn = event.turn_id; }
          else { replayAudio = []; replayTurn = ''; }
        } catch (error) { invalidateAudio(); showError(error); }
      }
    } else if (event.type === 'audio.clear') {
      invalidateAudio();
    } else if (event.type === 'warning') {
      view.footer.textContent = '声景暂不可用，文字回应继续。';
    } else if (event.type === 'turn.completed') {
      avatar?.complete(record.localId);
      sfx.play('replyDone');
      el('turn-status').textContent = '本轮回应落定';
      el('flow-state').textContent = '已落定';
      view.footer.textContent = data.audio_status === 'failed'
        ? '文字落定 · 声景未合成'
        : backendConfig?.mode === 'live'
          ? '声轨已落定'
          : '离线演练完成';
      el('first-text').textContent = millis(data.first_text_ms);
      el('first-audio').textContent = millis(data.first_audio_ms);
      el('duration').textContent = millis(data.duration_ms);
    } else if (event.type === 'turn.cancelled' || event.type === 'turn.failed') {
      invalidateAudio();
      if (event.type === 'turn.cancelled') avatar?.interrupt(record.localId);
      else avatar?.fail(record.localId);
      el('turn-status').textContent = event.type === 'turn.cancelled' ? '已刹那止声' : '本轮未能完成';
      el('flow-state').textContent = event.type === 'turn.cancelled' ? '已截断' : '异常';
      view.footer.textContent = event.type === 'turn.cancelled' ? '已打断 · 播放队列已清空' : `本轮中断 · ${String(data.reason ?? '')}`;
      if (event.type === 'turn.failed') view.footer.classList.add('error');
    }
    actions();
  },
  stopped(record) {
    invalidateAudio();
    avatar?.interrupt(record.localId);
    drafting.flash();
    stageEngine.triggerFoil(0.9);
    sfx.play('bargeIn');
    const view = views.get(record.localId);
    if (view && !record.terminal) view.footer.textContent = '已打断 · 播放队列已清空';
    el('turn-status').textContent = record.terminal ? '声景已止' : '已刹那止声';
    el('flow-state').textContent = '已截断';
    el('audio-status').textContent = '声景已止';
    actions();
  },
  error(record, error) {
    if (coordinator.current !== record) return;
    invalidateAudio();
    avatar?.fail(record.localId);
    const view = views.get(record.localId);
    if (view) {
      view.footer.textContent = record.cancelled ? '本地已止声，后端取消尚待确认。' : explainError(error);
      view.footer.classList.add('error');
    }
    el('turn-status').textContent = '链路待检查';
    el('flow-state').textContent = '待检查';
    showError(error); actions();
  },
});

// ==========================================================================
// Memory Curation Panel (Organize -> Proposals -> Accept -> Confirmed Facts)
// ==========================================================================
function renderMemoryLists() {
  el('memory-count-badge').textContent = String(confirmedFacts.length);

  const propEl = el('memory-proposals');
  propEl.replaceChildren();
  const activeProps = pendingProposals.filter(p => p.status === 'pending');
  if (!activeProps.length) {
    const empty = document.createElement('li');
    empty.className = 'memory-empty';
    empty.textContent = '发送「记住：……」后点击「整理本卷记忆」即可提取候选事实。';
    propEl.append(empty);
  } else {
    for (const prop of activeProps) {
      const li = document.createElement('li');
      li.className = 'memory-item';
      const span = document.createElement('span');
      span.className = 'memory-item-text';
      span.textContent = prop.text;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-item-btn';
      btn.textContent = '确认采纳';
      btn.addEventListener('click', () => void acceptProposal(prop.id));
      li.append(span, btn);
      propEl.append(li);
    }
  }

  const factEl = el('memory-facts');
  factEl.replaceChildren();
  if (!confirmedFacts.length) {
    const empty = document.createElement('li');
    empty.className = 'memory-empty';
    empty.textContent = '尚无跨卷生效的长期记忆。';
    factEl.append(empty);
  } else {
    for (const fact of confirmedFacts) {
      const li = document.createElement('li');
      li.className = 'memory-item';
      const span = document.createElement('span');
      span.className = 'memory-item-text';
      span.textContent = fact.text;
      const act = document.createElement('div');
      act.className = 'memory-item-actions';
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'memory-item-btn';
      editBtn.textContent = '编辑';
      editBtn.addEventListener('click', () => {
        sfx.play('click');
        li.replaceChildren();
        const field = document.createElement('input');
        field.type = 'text';
        field.className = 'memory-edit-input';
        field.value = fact.text;
        field.maxLength = 500;
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'memory-item-btn';
        saveBtn.textContent = '保存';
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'memory-item-btn danger';
        cancelBtn.textContent = '取消';
        const commit = () => {
          const next = field.value.trim();
          if (!next || next === fact.text) { renderMemoryLists(); return; }
          void saveFactEdit(fact.id, next);
        };
        saveBtn.addEventListener('click', commit);
        cancelBtn.addEventListener('click', () => renderMemoryLists());
        field.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
          if (ev.key === 'Escape') { ev.preventDefault(); renderMemoryLists(); }
        });
        li.append(field, saveBtn, cancelBtn);
        field.focus();
        field.select();
      });
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'memory-item-btn danger';
      delBtn.textContent = '遗忘';
      delBtn.addEventListener('click', () => void forgetFact(fact.id));
      act.append(editBtn, delBtn);
      li.append(span, act);
      factEl.append(li);
    }
  }
}

async function refreshFacts() {
  if (!session) return;
  try {
    const data = await api.facts(session.id);
    confirmedFacts = data.facts;
    renderMemoryLists();
  } catch (error) {
    showError(error);
  }
}

async function organizeMemory() {
  if (!session || !ready || memoryBusy) return;
  memoryBusy = true;
  el('memory-status').textContent = '正在整理文字卷…';
  actions();
  try {
    let job = await api.organizeMemory(session.id);
    for (let i = 0; i < 120 && (job.status === 'queued' || job.status === 'running'); i++) {
      await new Promise(r => setTimeout(r, 60));
      job = await api.memoryJob(job.id);
    }
    if (job.status === 'completed') {
      pendingProposals = job.proposals;
      el('memory-status').textContent = job.proposal_count ? `提取 ${job.proposal_count} 条候选` : '未发现新事实';
      stageEngine.triggerFoil(0.8);
    } else {
      el('memory-status').textContent = `整理未完成 (${job.error_code ?? job.status})`;
    }
    renderMemoryLists();
  } catch (error) {
    el('memory-status').textContent = '整理失败';
    showError(error);
  } finally {
    memoryBusy = false;
    actions();
  }
}

async function acceptProposal(pid: string) {
  try {
    await api.acceptProposal(pid);
    pendingProposals = pendingProposals.filter(p => p.id !== pid);
    el('memory-status').textContent = '已写入长期记忆';
    stageEngine.triggerFoil(0.85);
    sfx.play('memorySave');
    await refreshFacts();
  } catch (error) {
    showError(error);
  }
}

async function saveFactEdit(fid: string, text: string) {
  try {
    await api.editFact(fid, text);
    pendingProposals = [];
    el('memory-status').textContent = '已修订长期记忆';
    sfx.play('memorySave');
    await refreshFacts();
  } catch (error) {
    showError(error);
  }
}

async function forgetFact(fid: string) {
  try {
    await api.deleteFact(fid);
    pendingProposals = [];
    el('memory-status').textContent = '已遗忘并失效旧上下文';
    drafting.flash();
    sfx.play('click');
    await refreshFacts();
  } catch (error) {
    showError(error);
  }
}

organizeButton.addEventListener('click', () => void organizeMemory());

// ==========================================================================
// Connection, Session Lifecycle & Event Bindings
// ==========================================================================
async function connect() {
  const generation = ++connectionGeneration;
  liveClient.disconnect();
  avatar?.connected(false);
  ready = false; actions(); coordinator.cancel();
  await screen.stop();
  el('connection-status').textContent = '正在接通';
  try {
    backendConfig = await api.connect();
    if (generation !== connectionGeneration) return;
    el('live-auth-bar').hidden = true;
    const isLive = backendConfig.mode === 'live';
    const isQwen = backendConfig.moss_live?.provider !== 'moss';
    el('mode-badge-text').textContent = isLive ? (isQwen ? '实时 · QWEN' : '实时 · MOSS') : '离线演练';
    el('pipeline-badge').textContent = isLive ? (isQwen ? 'QWEN REALTIME' : 'MOSS-LIVE') : 'MOCK PIPELINE';
    el('calibration-engine').textContent = isQwen
      ? 'DEEPSEEK FLASH × QWEN 3.1 REALTIME'
      : 'DEEPSEEK FLASH × MOSS-LIVE 1.0';
    if (backendConfig.moss_live?.language && VALID_LANGS.includes(backendConfig.moss_live.language)) {
      try {
        if (!localStorage.getItem(LANG_STORAGE)) syncLanguageControls(backendConfig.moss_live.language);
      } catch { /* ignore */ }
    }
    if (session) {
      try { session = await api.restoreSession(session.id); }
      catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) throw error;
        session = await api.session({ character_id: 'nazuna', system_prompt: currentPersonaPrompt }); clearConversation();
      }
    } else session = await api.session({ character_id: 'nazuna', system_prompt: currentPersonaPrompt });
    if (generation !== connectionGeneration) return;
    ready = true;
    avatar?.connected(true);
    el('session-label').textContent = `VOL.${session.id.slice(0, 8).toUpperCase()}`;
    el('connection-status').textContent = '已接通';
    el('notice').hidden = true;
    actions();
    void refreshFacts();
    void refreshMossVoices();
  } catch (error) {
    if (generation !== connectionGeneration) return;
    if (error instanceof ApiError && (error.code === 'test_ui_requires_mock' || error.status === 401)) {
      if (error.status === 401 && getLocalBearerToken()) clearLocalBearerToken();
      el('live-auth-bar').hidden = false;
    }
    el('connection-status').textContent = '尚未接通'; showError(error); actions();
  }
}

el('live-auth-bar').addEventListener('submit', event => {
  event.preventDefault();
  const tokInput = el<HTMLInputElement>('live-token-input');
  const rememberBox = el<HTMLInputElement>('live-token-remember');
  const val = tokInput.value.trim();
  if (!val) return;
  sfx.play('click');
  setLocalBearerToken(val, rememberBox.checked);
  tokInput.value = '';
  void connect();
});

liveLockButton.addEventListener('click', () => {
  sfx.play('click');
  clearLocalBearerToken();
  liveClient.disconnect();
  void connect();
});

function stopActiveSpeech() {
  if (liveClient.isConnected && liveSpeaking) {
    if (backendConfig?.mode === 'mock') liveClient.sendMockBargeIn();
    else liveClient.interrupt();
  } else {
    coordinator.cancel();
  }
}

function exportConversationMarkdown() {
  const nodes = [...el('messages').querySelectorAll<HTMLElement>('.message')];
  if (!nodes.length) return;
  const lines = [
    `# 回声 · ECHO 对话卷面 (${el('session-label').textContent ?? ''})`,
    `导出时间：${new Date().toLocaleString('zh-CN')}`,
    `语音语言：${LIVE_LANG_LABELS[currentLiveLang]}`,
    '',
  ];
  for (const node of nodes) {
    const speaker = node.querySelector('.message-header span:nth-of-type(2)')?.textContent ?? node.dataset.role ?? '';
    const time = node.querySelector('time')?.textContent ?? '';
    const body = node.querySelector('.message-content')?.textContent?.trim() ?? '';
    lines.push(`### ${speaker} (${time})`, '', body, '');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `echo-nazuna-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
  sfx.play('memorySave');
}

function send() {
  if (!ready || screenBusy || !session || !input.value.trim()) return;
  const text = input.value.trim();
  const sid = session.id;
  const withScreen = attachCheckbox.checked && screen.available;
  const speak = soundCheckbox.checked;
  const unlocked = speak ? player.unlock() : Promise.resolve();
  void unlocked.catch(() => {});
  sfx.play('send');
  input.value = ''; actions();
  coordinator.send(sid, text, withScreen, async () => {
    await unlocked;
    if (withScreen && screen.owner !== sid) throw new ApiError('capture_changed');
    return { request_id: crypto.randomUUID(), text, speak, supersede: true,
      ...(withScreen ? { screen: screen.snapshot() } : {}) };
  });
  input.focus();
}

el('composer').addEventListener('submit', event => { event.preventDefault(); send(); });
input.addEventListener('input', actions);
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); send(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    floatingDock.close();
    stopActiveSpeech();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey) {
    const k = event.key.toLowerCase();
    if (k === 'l') {
      event.preventDefault();
      const idx = VALID_LANGS.indexOf(currentLiveLang);
      switchLiveLanguage(VALID_LANGS[(idx + 1) % VALID_LANGS.length], true);
    } else if (k === 'm' && liveClient.isConnected && liveClient.hasMic) {
      event.preventDefault();
      const nextMuted = !liveClient.isMuted;
      liveClient.setMicMuted(nextMuted);
      sfx.play(nextMuted ? 'micOff' : 'micOn');
    } else if (k === 'v' && ready) {
      event.preventDefault();
      void toggleLiveCall();
    }
  }
});
el('interrupt').addEventListener('click', stopActiveSpeech);
dockInterruptButton.addEventListener('click', stopActiveSpeech);
liveBargeButton.addEventListener('click', stopActiveSpeech);
liveToggleButton.addEventListener('click', () => void toggleLiveCall());
dockLiveButton.addEventListener('click', () => void toggleLiveCall());
liveHangupButton.addEventListener('click', () => liveClient.disconnect());
liveMuteButton.addEventListener('click', () => {
  const nextMuted = !liveClient.isMuted;
  liveClient.setMicMuted(nextMuted);
  sfx.play(nextMuted ? 'micOff' : 'micOn');
});
document.querySelectorAll<HTMLButtonElement>('[data-live-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.liveLang as LiveLanguage;
    if (VALID_LANGS.includes(lang)) switchLiveLanguage(lang, true);
  });
});
liveLangSelect.addEventListener('change', () => {
  const lang = liveLangSelect.value as LiveLanguage;
  if (VALID_LANGS.includes(lang)) switchLiveLanguage(lang, true);
});
liveVoiceSelect.addEventListener('change', () => {
  if (liveVoiceSelect.value) liveClient.setVoice(liveVoiceSelect.value);
});
liveMockSayButton.addEventListener('click', () => {
  const prompt = MOCK_LIVE_UTTERANCES[mockUtteranceIndex % MOCK_LIVE_UTTERANCES.length];
  mockUtteranceIndex++;
  sfx.play('send');
  liveClient.sendMockUtterance(prompt);
});
liveMockBargeButton.addEventListener('click', () => liveClient.sendMockBargeIn());
exportChatButton.addEventListener('click', exportConversationMarkdown);
el('avatar-nod').addEventListener('click', () => sfx.play('avatarReact'));
el('avatar-wave').addEventListener('click', () => sfx.play('avatarReact'));
el('avatar-canvas').addEventListener('click', () => sfx.play('avatarReact'));
el('avatar-live2d-canvas').addEventListener('click', () => sfx.play('avatarReact'));
el('avatar-mode-toggle').addEventListener('click', () => sfx.play('click'));
el('persona-apply-btn').addEventListener('click', () => {
  const raw = el<HTMLTextAreaElement>('persona-prompt-input').value.trim();
  if (!raw) return;
  currentPersonaPrompt = raw;
  try { localStorage.setItem(PERSONA_PROMPT_STORAGE, raw); } catch { /* ignore */ }
  sfx.play('memorySave');
  floatingDock.close();
  void newSession();
});
sfxCheckbox.checked = sfx.isEnabled;
sfxCheckbox.addEventListener('change', () => {
  sfx.setEnabled(sfxCheckbox.checked);
  if (sfxCheckbox.checked) sfx.play('langSwitch');
});
el('sfx-preview').addEventListener('click', () => {
  if (!sfx.isEnabled) {
    sfx.setEnabled(true);
    sfxCheckbox.checked = true;
  }
  sfx.play('memorySave');
});
el('reconnect').addEventListener('click', () => { sfx.play('click'); void connect(); });
el('dismiss-notice').addEventListener('click', () => { sfx.play('click'); el('notice').hidden = true; });
document.querySelectorAll<HTMLButtonElement>('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => { sfx.play('click'); input.value = button.dataset.prompt!; actions(); input.focus(); });
});
el('sample-screen').addEventListener('click', () => { sfx.play('click'); if (session && ready) void screen.useSample(session.id); });
el('choose-screen').addEventListener('click', () => {
  sfx.play('click');
  if (session && ready) void screen.chooseWindow(session.id).catch(showError);
});
el('stop-screen').addEventListener('click', () => { sfx.play('click'); void screen.stop(); });
attachCheckbox.addEventListener('change', () => { sfx.play('click'); el('attachment-chip').hidden = !attachCheckbox.checked; });
soundCheckbox.addEventListener('change', () => {
  player.setEnabled(soundCheckbox.checked);
  if (soundCheckbox.checked) { void player.unlock().catch(showError); sfx.play('click'); }
  else { replayAudio = []; replayTurn = ''; }
  actions();
});
const volumeSlider = el<HTMLInputElement>('volume');
volumeSlider.value = String(storedVolume);
player.setVolume(storedVolume / 100);
sfx.setVolume(storedVolume / 100);
el('volume-value').textContent = `${storedVolume}%`;
volumeSlider.addEventListener('input', event => {
  const value = Number((event.target as HTMLInputElement).value);
  player.setVolume(value / 100);
  sfx.setVolume(value / 100);
  el('volume-value').textContent = `${value}%`;
  try { localStorage.setItem(VOLUME_STORAGE, String(value)); } catch { /* ignore */ }
});
replayButton.addEventListener('click', async () => {
  const audio = [...replayAudio], turnId = replayTurn;
  try {
    await player.unlock();
    if (turnId !== replayTurn || !soundCheckbox.checked) return;
    avatar?.replay();
    player.begin(turnId);
    for (const chunk of audio) player.push(turnId, chunk);
    el('audio-status').textContent = '正在重播上轮声轨';
  } catch (error) { showError(error); }
});

function clearConversation() {
  views.clear(); liveViews.clear(); coordinator.current = null;
  pendingProposals = [];
  avatar?.resetConversation();
  player.begin('');
  el('messages').querySelectorAll('.message').forEach(node => node.remove());
  el('empty-state').hidden = false;
  el('turn-status').textContent = '静候第一句落笔';
  el('flow-state').textContent = '待命';
  el('event-log').replaceChildren();
  el('event-count').textContent = '00 EVENTS';
  el('log-count').textContent = '0';
  for (const id of ['first-text', 'first-audio', 'duration']) el(id).textContent = '—';
  renderMemoryLists();
}

async function newSession() {
  const generation = ++connectionGeneration;
  liveClient.disconnect();
  avatar?.connected(false);
  ready = false; actions(); coordinator.cancel();
  await screen.stop();
  try {
    const created = await api.session({ character_id: 'nazuna', system_prompt: currentPersonaPrompt });
    if (generation !== connectionGeneration) return;
    session = created; ready = true;
    clearConversation();
    drafting.flash();
    sfx.play('skyShift');
    avatar?.connected(true);
    el('session-label').textContent = `VOL.${session.id.slice(0, 8).toUpperCase()}`;
    actions(); input.focus();
    void refreshFacts();
  } catch (error) { showError(error); actions(); }
}

el('new-session').addEventListener('click', () => void newSession());
el('mobile-new-session').addEventListener('click', () => void newSession());
dockNewButton.addEventListener('click', () => void newSession());
window.addEventListener('pagehide', () => {
  liveClient.disconnect();
  coordinator.cancel(true);
  void screen.stop(true);
  player.stop();
  perf.stop();
  stageEngine.dispose();
});

applyMoodAtmosphere('offline');
applySky(currentSky, false);
applyPreset(currentPreset);
syncLanguageControls(currentLiveLang);
renderPersonaControls();
perf.start();
drawWave();
void connect();
