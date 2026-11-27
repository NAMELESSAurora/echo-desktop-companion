(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`/ui/assets/nazuna-head-D2KIwLcu.webp`,t=`companion:local-bearer`,n=`companion:local-bearer-persist`,r=``;try{if(typeof sessionStorage<`u`&&(r=sessionStorage.getItem(t)||``),!r&&typeof localStorage<`u`){let e=localStorage.getItem(n)||``;e&&(r=e)}else typeof localStorage<`u`&&localStorage.getItem(n)}catch{}function i(e,i=!1){r=e.trim();try{typeof sessionStorage<`u`&&(r?sessionStorage.setItem(t,r):sessionStorage.removeItem(t)),typeof localStorage<`u`&&(r&&i?localStorage.setItem(n,r):localStorage.removeItem(n))}catch{}}function a(){i(``,!1)}function o(){return r}var s=class extends Error{code;status;constructor(e,t=0){super(e),this.code=e,this.status=t}};async function c(e,t,n,i=!1){let a={"Content-Type":`application/json`,"X-Companion-UI":`1`};r&&(a.Authorization=`Bearer ${r}`);let o=await fetch(t,{method:e,credentials:`same-origin`,keepalive:i,headers:a,body:n===void 0?void 0:JSON.stringify(n)}),c=await o.json().catch(()=>({}));if(!o.ok)throw new s(c.error?.code??c.detail??`request_failed`,o.status);return c}async function*l(e){let t=e.getReader(),n=new TextDecoder,r=``,i=[],a=0,o=e=>{if(e===``){if(!i.length)return null;let e=JSON.parse(i.join(`
`));return i=[],a=0,e}if(e.startsWith(`data:`)){let t=e.slice(5).replace(/^ /,``);if(a+=t.length,a>2e6)throw new s(`event_too_large`);i.push(t)}return null};try{for(;;){let{value:e,done:i}=await t.read();r+=n.decode(e,{stream:!i});let a;for(;(a=r.indexOf(`
`))>=0;){let e=o(r.slice(0,a).replace(/\r$/,``));r=r.slice(a+1),e&&(yield e)}if(r.length>2e6)throw new s(`event_too_large`);if(i){r&&o(r.replace(/\r$/,``));let e=o(``);e&&(yield e);return}}}finally{await t.cancel().catch(()=>{}),t.releaseLock()}}var u=class{async connect(){if(r)return c(`GET`,`/v1/config`);await c(`POST`,`/ui/connect`,{});let e=await c(`GET`,`/v1/config`);if(e.mode!==`mock`)throw new s(`test_ui_requires_mock`);return e}session(e){return c(`POST`,`/v1/sessions`,{character_id:e?.character_id||`nazuna`,...e?.system_prompt?{system_prompt:e.system_prompt}:{}})}restoreSession(e){return c(`GET`,`/v1/sessions/${e}`)}start(e,t){return c(`POST`,`/v1/sessions/${e}/turns`,t)}cancel(e,t=!1){return c(`POST`,`/v1/turns/${e}/cancel`,void 0,t)}policy(e,t,n,r=!1){return c(`PUT`,`/v1/sessions/${e}/screen-policy`,{enabled:t,source_id:n??null},r)}organizeMemory(e,t=30){return c(`POST`,`/v1/sessions/${e}/memory/organize`,{message_limit:t})}memoryJob(e){return c(`GET`,`/v1/memory/jobs/${e}`)}acceptProposal(e){return c(`POST`,`/v1/memory/proposals/${e}/accept`)}facts(e){return c(`GET`,`/v1/sessions/${e}/memory`)}editFact(e,t){return c(`PATCH`,`/v1/memory/facts/${e}`,{text:t})}deleteFact(e){return c(`DELETE`,`/v1/memory/facts/${e}`)}mossVoices(){return c(`GET`,`/v1/moss/voices`)}liveTicket(e){return c(`POST`,`/v1/live/ticket?sid=${encodeURIComponent(e)}`,{})}async*events(e,t){let n={};r&&(n.Authorization=`Bearer ${r}`);let i=await fetch(e,{credentials:`same-origin`,headers:n,signal:t});if(!i.ok)throw new s((await i.json().catch(()=>({}))).error?.code??`stream_failed`,i.status);if(!i.body)throw new s(`empty_stream`);yield*l(i.body)}};function d(e){if(e instanceof DOMException&&[`NotSupportedError`,`NotReadableError`].includes(e.name))return`浏览器未能捕获窗口画面。可在 Chrome／Edge 中重试，或先载入样张。`;let t=e instanceof s?e.code:e instanceof Error?e.message:``;return{test_ui_requires_mock:`当前后端处于真实在线（live）模式：请粘贴本机 .local/api-token（或在系统托盘点击「复制本地访问令牌」）后接入。`,qwen_not_configured:`后端尚未配置 COMPANION_QWEN_API_KEY，请在 .env 中填入百炼密钥后重启。`,qwen_auth_failed:`阿里云百炼 API Key 鉴权失败，请检查 COMPANION_QWEN_API_KEY。`,qwen_rate_limited:`阿里云百炼实时语音并发已满或触发限流，请稍后再试。`,qwen_unavailable:`无法连通阿里云百炼实时语音服务，请检查网络设置。`,qwen_handshake_failed:`阿里云百炼实时语音握手超时，请重试。`,invalid_local_token:`本地连接凭证已失效，请点击顶部重连按钮恢复。`,same_origin_required:`请通过本地服务地址打开本舞台，不要直接从文件系统打开 HTML。`,screen_permission_mismatch:`视窗授权已变更，请撤回视野后重新择取窗口。`,screen_frame_stale:`所附画面已逾 15 秒时效，请重新发出以捕获最新一帧。`,pipeline_busy:`本地管线正处于满载状态，请稍候片刻再试。`,memory_queue_full:`后台记忆整理队列已满，请等待当前任务收敛后再试。`,memory_changed:`长期记忆已更新，先前的候选提案已自动失效，请重新整理。`,proposal_not_found:`该条候选记忆不存在或已清理。`,memory_not_found:`该条长期记忆已不存在。`,event_history_lost:`事件回放已超出窗口，本地播放已停止，请重新发话。`,events_expired:`后端已重启或回收旧轮次事件，请重新发话。`,session_not_found:`当前会话卷已失效，请点击「新起一卷」。`,incomplete_stream:`事件流提前断开，本轮已止步，可随时重新发出。`,audio_locked:`浏览器暂未解锁声景播放，请轻点声景开关后重试。`,capture_unavailable:`当前浏览器不支持窗口共享，可先点击「载入样张」验证视觉通路。`,capture_not_ready:`视窗画面尚未就绪，请稍候再发。`,capture_changed:`视窗来源已切换，请重新发出。`,image_too_large:`截取画面超过 2 MiB 上限，请择取更小的窗口。`,moss_not_configured:`后端尚未配置 COMPANION_MOSS_API_KEY，请在 .env 中填入密钥或使用离线演练模式。`,moss_user_id_required:`跨会话用户记忆（user）模式需要配置 COMPANION_MOSS_USER_ID。`,moss_auth_failed:`MOSS-Live 鉴权失败，请检查 COMPANION_MOSS_API_KEY 是否有效。`,moss_rate_limited:`MOSS-Live 并发已达上限或触发限流，请稍后再拨通。`,moss_unavailable:`无法连通 MOSS-Live 上游服务，请检查网络或配置。`,moss_handshake_failed:`MOSS-Live 实时握手失败，请稍后重试。`,live_session_busy:`当前会话卷已有一路进行中的实时语音通话。`,live_capacity_full:`本地后端已达到 MOSS-Live 最大并发通话数限制。`,idle_timeout:`通话已连续静默超时，为避免无谓计费已自动挂断。`,mic_denied:`未获取麦克风权限：离线演练态仍可使用「模拟口述」体验全双工通话链路。`,live_disconnected:`实时语音通道已断开。`,Failed:`无法触达本地管线，请确认服务正在运行。`}[t]??(t.includes(`fetch`)?`与本地管线的连接中断，请检查服务后点击重连。`:`本次操作未能完成，请重试或展开 SSE 脉络查看详情。`)}var f=class{changed;factory;context=null;gain=null;scheduled=new Map;nextTime=0;generation=0;turnId=``;rate=24e3;volume=.45;enabled=!0;playedChunks=0;receivedSeconds=0;analyser=null;onChunkEnded=null;constructor(e,t=()=>new AudioContext){this.changed=e,this.factory=t}async unlock(){if(this.context||(this.context=this.factory(),this.gain=this.context.createGain(),this.gain.gain.value=this.volume,this.analyser=this.context.createAnalyser(),this.analyser.fftSize=256,this.gain.connect(this.analyser),this.analyser.connect(this.context.destination)),await this.context.resume(),this.context.state!==`running`)throw new s(`audio_locked`)}get isEnabled(){return this.enabled}get sampleRate(){return this.rate}get queuedCount(){return this.scheduled.size}begin(e,t=24e3,n=!0){this.stop(),this.turnId=e,this.rate=t,n&&(this.playedChunks=0,this.receivedSeconds=0),this.notify()}configure(e,t,n){if(t!==1||n!==`pcm_s16le`||![16e3,24e3,48e3].includes(e))throw new s(`unsupported_audio_format`);this.rate=e}setEnabled(e){this.enabled=e,e?this.notify():this.stop()}setVolume(e){this.volume=Math.min(1,Math.max(0,e)),this.gain&&(this.gain.gain.value=this.volume)}push(e,t){if(!this.enabled||e!==this.turnId)return;let n=this.context;if(!n||n.state!==`running`||!this.gain)throw new s(`audio_locked`);let r=atob(t);if(r.length%2||r.length>256e3)throw new s(`invalid_audio_chunk`);if(!r.length)return;let i=Uint8Array.from(r,e=>e.charCodeAt(0));this.schedulePcmBytes(e,i)}pushPcm(e,t,n){return this.schedulePcmBytes(e,t,n)}schedulePcmBytes(e,t,n){if(!this.enabled||e!==this.turnId)return!1;let r=this.context;if(!r||r.state!==`running`||!this.gain)throw new s(`audio_locked`);if(t.byteLength%2||t.byteLength>256e3)throw new s(`invalid_audio_chunk`);if(!t.byteLength)return!1;if(this.nextTime-r.currentTime>20)throw new s(`audio_queue_full`);let i=new DataView(t.buffer,t.byteOffset,t.byteLength),a=r.createBuffer(1,t.byteLength/2,this.rate),o=a.getChannelData(0);for(let e=0;e<o.length;e++)o[e]=i.getInt16(e*2,!0)/32768;let c=r.createBufferSource(),l=this.generation;c.buffer=a,c.connect(this.gain);let u=Math.max(r.currentTime+.025,this.nextTime),d={meta:n,startTime:u,duration:a.duration,acked:!1};return this.scheduled.set(c,d),c.onended=()=>{let e=this.scheduled.get(c);c.disconnect(),this.scheduled.delete(c),l===this.generation&&(e?.meta&&!e.acked&&(e.acked=!0,this.onChunkEnded?.(e.meta)),this.notify())},c.start(u),this.nextTime=u+a.duration,this.playedChunks++,this.receivedSeconds+=a.duration,this.notify(),!0}stopWithProgress(){let e=this.context?.currentTime??0,t=[],n=null,r=0;for(let i of this.scheduled.values())if(e>=i.startTime+i.duration)i.meta&&!i.acked&&(i.acked=!0,t.push(i.meta));else{n=i.meta??null,r=e>i.startTime?Math.min(Math.round(i.duration*1e3),Math.max(0,Math.round((e-i.startTime)*1e3))):0;break}return this.stop(),{completed:t,interrupted:n,playedAudioMs:r}}stop(){this.generation++;for(let e of this.scheduled.keys()){e.onended=null;try{e.stop()}catch{}e.disconnect()}this.scheduled.clear(),this.nextTime=0,this.notify()}notify(){this.changed({playing:this.scheduled.size>0,queued:this.scheduled.size,playedChunks:this.playedChunks,receivedSeconds:this.receivedSeconds})}},p=`attached`,m=1e3,h=1001,g=1002,_=1003,v=1004,y=1005,b=1006,x=1007,S=1008,C=1009,w=1010,T=1011,E=1012,D=1013,O=1014,k=1015,A=1016,j=1017,ee=1018,te=1020,M=35902,N=35899,ne=1021,re=1022,ie=1023,ae=1026,oe=1027,P=1028,se=1029,ce=1030,le=1031,ue=1033,de=33776,fe=33777,pe=33778,me=33779,he=35840,ge=35841,_e=35842,ve=35843,ye=36196,be=37492,xe=37496,Se=37488,Ce=37489,we=37490,Te=37491,Ee=37808,De=37809,Oe=37810,ke=37811,Ae=37812,je=37813,Me=37814,Ne=37815,F=37816,Pe=37817,Fe=37818,Ie=37819,I=37820,Le=37821,L=36492,R=36494,Re=36495,ze=36283,Be=36284,Ve=36285,He=36286,Ue=2300,We=2301,Ge=2302,Ke=2303,qe=2400,Je=2401,Ye=2402,Xe=2500,Ze=3200,Qe=`srgb`,$e=`srgb-linear`,et=`linear`,tt=`srgb`,nt=7680,rt=35044,it=35048,at=2e3;function ot(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function st(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function ct(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function lt(){let e=ct(`canvas`);return e.style.display=`block`,e}var ut={};function dt(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function ft(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function z(...e){e=ft(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function B(...e){e=ft(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function pt(...e){let t=e.join(` `);t in ut||(ut[t]=!0,z(...e))}function mt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var ht={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},gt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},_t=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),vt=1234567,yt=Math.PI/180,bt=180/Math.PI;function xt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(_t[e&255]+_t[e>>8&255]+_t[e>>16&255]+_t[e>>24&255]+`-`+_t[t&255]+_t[t>>8&255]+`-`+_t[t>>16&15|64]+_t[t>>24&255]+`-`+_t[n&63|128]+_t[n>>8&255]+`-`+_t[n>>16&255]+_t[n>>24&255]+_t[r&255]+_t[r>>8&255]+_t[r>>16&255]+_t[r>>24&255]).toLowerCase()}function V(e,t,n){return Math.max(t,Math.min(n,e))}function St(e,t){return(e%t+t)%t}function Ct(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function wt(e,t,n){return e===t?0:(n-e)/(t-e)}function Tt(e,t,n){return(1-n)*e+n*t}function Et(e,t,n,r){return Tt(e,t,1-Math.exp(-n*r))}function Dt(e,t=1){return t-Math.abs(St(e,t*2)-t)}function Ot(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function kt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function At(e,t){return e+Math.floor(Math.random()*(t-e+1))}function jt(e,t){return e+Math.random()*(t-e)}function Mt(e){return e*(.5-Math.random())}function Nt(e){e!==void 0&&(vt=e);let t=vt+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Pt(e){return e*yt}function Ft(e){return e*bt}function It(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Lt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Rt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function zt(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:z(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Bt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function H(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var Vt={DEG2RAD:yt,RAD2DEG:bt,generateUUID:xt,clamp:V,euclideanModulo:St,mapLinear:Ct,inverseLerp:wt,lerp:Tt,damp:Et,pingpong:Dt,smoothstep:Ot,smootherstep:kt,randInt:At,randFloat:jt,randFloatSpread:Mt,seededRandom:Nt,degToRad:Pt,radToDeg:Ft,isPowerOfTwo:It,ceilPowerOfTwo:Lt,floorPowerOfTwo:Rt,setQuaternionFromProperEuler:zt,normalize:H,denormalize:Bt},U=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=V(this.x,e.x,t.x),this.y=V(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=V(this.x,e,t),this.y=V(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(V(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(V(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ht=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:z(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(V(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Wt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Wt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=V(this.x,e.x,t.x),this.y=V(this.y,e.y,t.y),this.z=V(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=V(this.x,e,t),this.y=V(this.y,e,t),this.z=V(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(V(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ut.copy(this).projectOnVector(e),this.sub(Ut)}reflect(e){return this.sub(Ut.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(V(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ut=new W,Wt=new Ht,G=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return pt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Gt.makeScale(e,t)),this}rotate(e){return pt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Gt.makeRotation(-e)),this}translate(e,t){return pt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Gt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Gt=new G,Kt=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),qt=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Jt(){let e={enabled:!0,workingColorSpace:$e,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Yt(e.r),e.g=Yt(e.g),e.b=Yt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Xt(e.r),e.g=Xt(e.g),e.b=Xt(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?et:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return pt(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return pt(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[$e]:{primaries:t,whitePoint:r,transfer:et,toXYZ:Kt,fromXYZ:qt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Qe},outputColorSpaceConfig:{drawingBufferColorSpace:Qe}},[Qe]:{primaries:t,whitePoint:r,transfer:tt,toXYZ:Kt,fromXYZ:qt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Qe}}}),e}var K=Jt();function Yt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Xt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Zt,Qt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Zt===void 0&&(Zt=ct(`canvas`)),Zt.width=e.width,Zt.height=e.height;let t=Zt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Zt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=ct(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Yt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Yt(t[e]/255)*255):t[e]=Yt(t[e]);return{data:t,width:e.width,height:e.height}}return z(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},$t=0,en=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:$t++}),this.uuid=xt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(tn(r[t].image)):e.push(tn(r[t]))}else e=tn(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function tn(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Qt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(z(`Texture: Unable to serialize Texture.`),{})}var nn=0,rn=new W,an=class e extends gt{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=h,i=h,a=b,o=S,s=ie,c=C,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:nn++}),this.uuid=xt(),this.name=``,this.source=new en(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new U(0,0),this.repeat=new U(1,1),this.center=new U(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(rn).x}get height(){return this.source.getSize(rn).y}get depth(){return this.source.getSize(rn).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){z(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?z(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case m:e.x-=Math.floor(e.x);break;case h:e.x=e.x<0?0:1;break;case g:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case m:e.y-=Math.floor(e.y);break;case h:e.y=e.y<0?0:1;break;case g:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};an.DEFAULT_IMAGE=null,an.DEFAULT_MAPPING=300,an.DEFAULT_ANISOTROPY=1;var on=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=V(this.x,e.x,t.x),this.y=V(this.y,e.y,t.y),this.z=V(this.z,e.z,t.z),this.w=V(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=V(this.x,e,t),this.y=V(this.y,e,t),this.z=V(this.z,e,t),this.w=V(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(V(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},sn=class extends gt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:b,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new on(0,0,e,t),this.scissorTest=!1,this.viewport=new on(0,0,e,t),this.textures=[];let r=new an({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:b,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new en(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},cn=class extends sn{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ln=class extends an{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=_,this.minFilter=_,this.wrapR=h,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},un=class extends an{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=_,this.minFilter=_,this.wrapR=h,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},q=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/dn.setFromMatrixColumn(e,0).length(),i=1/dn.setFromMatrixColumn(e,1).length(),a=1/dn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(pn,e,mn)}lookAt(e,t,n){let r=this.elements;return _n.subVectors(e,t),_n.lengthSq()===0&&(_n.z=1),_n.normalize(),hn.crossVectors(n,_n),hn.lengthSq()===0&&(Math.abs(n.z)===1?_n.x+=1e-4:_n.z+=1e-4,_n.normalize(),hn.crossVectors(n,_n)),hn.normalize(),gn.crossVectors(_n,hn),r[0]=hn.x,r[4]=gn.x,r[8]=_n.x,r[1]=hn.y,r[5]=gn.y,r[9]=_n.y,r[2]=hn.z,r[6]=gn.z,r[10]=_n.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],te=r[3],M=r[7],N=r[11],ne=r[15];return i[0]=a*x+o*T+s*k+c*te,i[4]=a*S+o*E+s*A+c*M,i[8]=a*C+o*D+s*j+c*N,i[12]=a*w+o*O+s*ee+c*ne,i[1]=l*x+u*T+d*k+f*te,i[5]=l*S+u*E+d*A+f*M,i[9]=l*C+u*D+d*j+f*N,i[13]=l*w+u*O+d*ee+f*ne,i[2]=p*x+m*T+h*k+g*te,i[6]=p*S+m*E+h*A+g*M,i[10]=p*C+m*D+h*j+g*N,i[14]=p*w+m*O+h*ee+g*ne,i[3]=_*x+v*T+y*k+b*te,i[7]=_*S+v*E+y*A+b*M,i[11]=_*C+v*D+y*j+b*N,i[15]=_*w+v*O+y*ee+b*ne,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=dn.set(r[0],r[1],r[2]).length(),o=dn.set(r[4],r[5],r[6]).length(),s=dn.set(r[8],r[9],r[10]).length();i<0&&(a=-a),fn.copy(this);let c=1/a,l=1/o,u=1/s;return fn.elements[0]*=c,fn.elements[1]*=c,fn.elements[2]*=c,fn.elements[4]*=l,fn.elements[5]*=l,fn.elements[6]*=l,fn.elements[8]*=u,fn.elements[9]*=u,fn.elements[10]*=u,t.setFromRotationMatrix(fn),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=at,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=at,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},dn=new W,fn=new q,pn=new W(0,0,0),mn=new W(1,1,1),hn=new W,gn=new W,_n=new W,vn=new q,yn=new Ht,bn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(V(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-V(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(V(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-V(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(V(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-V(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:z(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return vn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(vn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return yn.setFromEuler(this),this.setFromQuaternion(yn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};bn.DEFAULT_ORDER=`XYZ`;var xn=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Sn=0,Cn=new W,wn=new Ht,Tn=new q,En=new W,Dn=new W,On=new W,kn=new Ht,An=new W(1,0,0),jn=new W(0,1,0),Mn=new W(0,0,1),Nn={type:`added`},Pn={type:`removed`},Fn={type:`childadded`,child:null},In={type:`childremoved`,child:null},Ln=class e extends gt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sn++}),this.uuid=xt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new bn,r=new Ht,i=new W(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new q},normalMatrix:{value:new G}}),this.matrix=new q,this.matrixWorld=new q,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return wn.setFromAxisAngle(e,t),this.quaternion.multiply(wn),this}rotateOnWorldAxis(e,t){return wn.setFromAxisAngle(e,t),this.quaternion.premultiply(wn),this}rotateX(e){return this.rotateOnAxis(An,e)}rotateY(e){return this.rotateOnAxis(jn,e)}rotateZ(e){return this.rotateOnAxis(Mn,e)}translateOnAxis(e,t){return Cn.copy(e).applyQuaternion(this.quaternion),this.position.add(Cn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(An,e)}translateY(e){return this.translateOnAxis(jn,e)}translateZ(e){return this.translateOnAxis(Mn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?En.copy(e):En.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Dn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tn.lookAt(Dn,En,this.up):Tn.lookAt(En,Dn,this.up),this.quaternion.setFromRotationMatrix(Tn),r&&(Tn.extractRotation(r.matrixWorld),wn.setFromRotationMatrix(Tn),this.quaternion.premultiply(wn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(B(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Nn),Fn.child=e,this.dispatchEvent(Fn),Fn.child=null):B(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Pn),In.child=e,this.dispatchEvent(In),In.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Tn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Tn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Nn),Fn.child=e,this.dispatchEvent(Fn),Fn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Dn,e,On),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Dn,kn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Ln.DEFAULT_UP=new W(0,1,0),Ln.DEFAULT_MATRIX_AUTO_UPDATE=!0,Ln.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Rn=class extends Ln{constructor(){super(),this.isGroup=!0,this.type=`Group`}},zn={type:`move`},Bn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Rn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Rn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Rn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(zn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Rn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Vn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Hn={h:0,s:0,l:0},Un={h:0,s:0,l:0};function Wn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var J=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Qe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,K.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=K.workingColorSpace){return this.r=e,this.g=t,this.b=n,K.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=K.workingColorSpace){if(e=St(e,1),t=V(t,0,1),n=V(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Wn(i,r,e+1/3),this.g=Wn(i,r,e),this.b=Wn(i,r,e-1/3)}return K.colorSpaceToWorking(this,r),this}setStyle(e,t=Qe){function n(t){t!==void 0&&parseFloat(t)<1&&z(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:z(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);z(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Qe){let n=Vn[e.toLowerCase()];return n===void 0?z(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Yt(e.r),this.g=Yt(e.g),this.b=Yt(e.b),this}copyLinearToSRGB(e){return this.r=Xt(e.r),this.g=Xt(e.g),this.b=Xt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Qe){return K.workingToColorSpace(Gn.copy(this),e),Math.round(V(Gn.r*255,0,255))*65536+Math.round(V(Gn.g*255,0,255))*256+Math.round(V(Gn.b*255,0,255))}getHexString(e=Qe){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=K.workingColorSpace){K.workingToColorSpace(Gn.copy(this),t);let n=Gn.r,r=Gn.g,i=Gn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=K.workingColorSpace){return K.workingToColorSpace(Gn.copy(this),t),e.r=Gn.r,e.g=Gn.g,e.b=Gn.b,e}getStyle(e=Qe){K.workingToColorSpace(Gn.copy(this),e);let t=Gn.r,n=Gn.g,r=Gn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Hn),this.setHSL(Hn.h+e,Hn.s+t,Hn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Hn),e.getHSL(Un);let n=Tt(Hn.h,Un.h,t),r=Tt(Hn.s,Un.s,t),i=Tt(Hn.l,Un.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Gn=new J;J.NAMES=Vn;var Kn=class extends Ln{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bn,this.environmentIntensity=1,this.environmentRotation=new bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},qn=new W,Jn=new W,Yn=new W,Xn=new W,Zn=new W,Qn=new W,$n=new W,er=new W,tr=new W,nr=new W,rr=new on,ir=new on,ar=new on,or=class e{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),qn.subVectors(e,t),r.cross(qn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){qn.subVectors(r,t),Jn.subVectors(n,t),Yn.subVectors(e,t);let a=qn.dot(qn),o=qn.dot(Jn),s=qn.dot(Yn),c=Jn.dot(Jn),l=Jn.dot(Yn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Xn)!==null&&Xn.x>=0&&Xn.y>=0&&Xn.x+Xn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Xn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Xn.x),s.addScaledVector(a,Xn.y),s.addScaledVector(o,Xn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return rr.setScalar(0),ir.setScalar(0),ar.setScalar(0),rr.fromBufferAttribute(e,t),ir.fromBufferAttribute(e,n),ar.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(rr,i.x),a.addScaledVector(ir,i.y),a.addScaledVector(ar,i.z),a}static isFrontFacing(e,t,n,r){return qn.subVectors(n,t),Jn.subVectors(e,t),qn.cross(Jn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qn.subVectors(this.c,this.b),Jn.subVectors(this.a,this.b),qn.cross(Jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Zn.subVectors(r,n),Qn.subVectors(i,n),er.subVectors(e,n);let s=Zn.dot(er),c=Qn.dot(er);if(s<=0&&c<=0)return t.copy(n);tr.subVectors(e,r);let l=Zn.dot(tr),u=Qn.dot(tr);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Zn,a);nr.subVectors(e,i);let f=Zn.dot(nr),p=Qn.dot(nr);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Qn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return $n.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector($n,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Zn,a).addScaledVector(Qn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},sr=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(lr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(lr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=lr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,lr):lr.fromBufferAttribute(r,t),lr.applyMatrix4(e.matrixWorld),this.expandByPoint(lr);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),ur.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),ur.copy(e.boundingBox)),ur.applyMatrix4(e.matrixWorld),this.union(ur)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,lr),lr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_r),vr.subVectors(this.max,_r),dr.subVectors(e.a,_r),fr.subVectors(e.b,_r),pr.subVectors(e.c,_r),mr.subVectors(fr,dr),hr.subVectors(pr,fr),gr.subVectors(dr,pr);let t=[0,-mr.z,mr.y,0,-hr.z,hr.y,0,-gr.z,gr.y,mr.z,0,-mr.x,hr.z,0,-hr.x,gr.z,0,-gr.x,-mr.y,mr.x,0,-hr.y,hr.x,0,-gr.y,gr.x,0];return!xr(t,dr,fr,pr,vr)||(t=[1,0,0,0,1,0,0,0,1],!xr(t,dr,fr,pr,vr))?!1:(yr.crossVectors(mr,hr),t=[yr.x,yr.y,yr.z],xr(t,dr,fr,pr,vr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,lr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(lr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(cr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),cr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),cr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),cr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),cr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),cr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),cr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),cr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(cr)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},cr=[new W,new W,new W,new W,new W,new W,new W,new W],lr=new W,ur=new sr,dr=new W,fr=new W,pr=new W,mr=new W,hr=new W,gr=new W,_r=new W,vr=new W,yr=new W,br=new W;function xr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){br.fromArray(e,a);let o=i.x*Math.abs(br.x)+i.y*Math.abs(br.y)+i.z*Math.abs(br.z),s=t.dot(br),c=n.dot(br),l=r.dot(br);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Sr=new W,Cr=new U,wr=0,Tr=class extends gt{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=rt,this.updateRanges=[],this.gpuType=k,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Cr.fromBufferAttribute(this,t),Cr.applyMatrix3(e),this.setXY(t,Cr.x,Cr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyMatrix3(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyMatrix4(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyNormalMatrix(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.transformDirection(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Bt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=H(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Bt(t,this.array)),t}setX(e,t){return this.normalized&&(t=H(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Bt(t,this.array)),t}setY(e,t){return this.normalized&&(t=H(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Bt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=H(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Bt(t,this.array)),t}setW(e,t){return this.normalized&&(t=H(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=H(t,this.array),n=H(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=H(t,this.array),n=H(n,this.array),r=H(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=H(t,this.array),n=H(n,this.array),r=H(r,this.array),i=H(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},Er=class extends Tr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Dr=class extends Tr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Or=class extends Tr{constructor(e,t,n){super(new Float32Array(e),t,n)}},kr=new sr,Ar=new W,jr=new W,Mr=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?kr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ar.subVectors(e,this.center);let t=Ar.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Ar,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(jr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ar.copy(e.center).add(jr)),this.expandByPoint(Ar.copy(e.center).sub(jr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Nr=0,Pr=new q,Fr=new Ln,Ir=new W,Lr=new sr,Rr=new sr,zr=new W,Br=class e extends gt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nr++}),this.uuid=xt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(ot(e)?Dr:Er)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new G().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Pr.makeRotationFromQuaternion(e),this.applyMatrix4(Pr),this}rotateX(e){return Pr.makeRotationX(e),this.applyMatrix4(Pr),this}rotateY(e){return Pr.makeRotationY(e),this.applyMatrix4(Pr),this}rotateZ(e){return Pr.makeRotationZ(e),this.applyMatrix4(Pr),this}translate(e,t,n){return Pr.makeTranslation(e,t,n),this.applyMatrix4(Pr),this}scale(e,t,n){return Pr.makeScale(e,t,n),this.applyMatrix4(Pr),this}lookAt(e){return Fr.lookAt(e),Fr.updateMatrix(),this.applyMatrix4(Fr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ir).negate(),this.translate(Ir.x,Ir.y,Ir.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Or(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&z(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new sr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)B(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Lr.setFromBufferAttribute(n),this.morphTargetsRelative?(zr.addVectors(this.boundingBox.min,Lr.min),this.boundingBox.expandByPoint(zr),zr.addVectors(this.boundingBox.max,Lr.max),this.boundingBox.expandByPoint(zr)):(this.boundingBox.expandByPoint(Lr.min),this.boundingBox.expandByPoint(Lr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&B(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)B(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new W,1/0);else if(e){let n=this.boundingSphere.center;if(Lr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Rr.setFromBufferAttribute(n),this.morphTargetsRelative?(zr.addVectors(Lr.min,Rr.min),Lr.expandByPoint(zr),zr.addVectors(Lr.max,Rr.max),Lr.expandByPoint(zr)):(Lr.expandByPoint(Rr.min),Lr.expandByPoint(Rr.max))}Lr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)zr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(zr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)zr.fromBufferAttribute(a,t),o&&(Ir.fromBufferAttribute(e,t),zr.add(Ir)),r=Math.max(r,n.distanceToSquared(zr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&B(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){B(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Tr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new W,s[e]=new W;let c=new W,l=new W,u=new W,d=new U,f=new U,p=new U,m=new W,h=new W;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new W,y=new W,b=new W,x=new W;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Tr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new W,i=new W,a=new W,o=new W,s=new W,c=new W,l=new W,u=new W;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)zr.fromBufferAttribute(e,t),zr.normalize(),e.setXYZ(t,zr.x,zr.y,zr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Tr(a,r,i)}if(this.index===null)return z(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Vr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=rt,this.updateRanges=[],this.version=0,this.uuid=xt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Hr=new W,Ur=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Hr.fromBufferAttribute(this,t),Hr.applyMatrix4(e),this.setXYZ(t,Hr.x,Hr.y,Hr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Hr.fromBufferAttribute(this,t),Hr.applyNormalMatrix(e),this.setXYZ(t,Hr.x,Hr.y,Hr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Hr.fromBufferAttribute(this,t),Hr.transformDirection(e),this.setXYZ(t,Hr.x,Hr.y,Hr.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Bt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=H(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=H(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=H(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=H(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=H(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Bt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Bt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Bt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Bt(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=H(t,this.array),n=H(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=H(t,this.array),n=H(n,this.array),r=H(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=H(t,this.array),n=H(n,this.array),r=H(r,this.array),i=H(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){dt(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Tr(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){dt(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Wr=new W,Gr=new W,Kr=new G,qr=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Wr.subVectors(n,t).cross(Gr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Wr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Kr.getNormalMatrix(e),r=this.coplanarPoint(Wr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Jr=0,Yr=class extends gt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jr++}),this.uuid=xt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new J(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=nt,this.stencilZFail=nt,this.stencilZPass=nt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){z(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?z(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new J().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new qr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new U().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new U().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Xr=new W,Zr=new W,Qr=new W,$r=new W,ei=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Xr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Xr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Xr.copy(this.origin).addScaledVector(this.direction,t),Xr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Zr.copy(e).add(t).multiplyScalar(.5),Qr.copy(t).sub(e).normalize(),$r.copy(this.origin).sub(Zr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Qr),o=$r.dot(this.direction),s=-$r.dot(Qr),c=$r.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Zr).addScaledVector(Qr,d),f}intersectSphere(e,t){if(e.radius<0)return null;Xr.subVectors(e.center,this.origin);let n=Xr.dot(this.direction),r=Xr.dot(Xr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Xr)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,te;if(y>=b&&y>=x?(w=s,D=u,A=p,te=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,te=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,te=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let M=S/w,N=C/w,ne=1/w,re=T-M*D,ie=E-N*D,ae=O-M*A,oe=k-N*A,P=j-M*te,se=ee-N*te,ce=P*oe-se*ae,le=re*se-ie*P,ue=ae*ie-oe*re;if(r){if(ce<0||le<0||ue<0)return null}else if((ce<0||le<0||ue<0)&&(ce>0||le>0||ue>0))return null;let de=ce+le+ue;if(de===0)return null;let fe=ne*(ce*D+le*A+ue*te);return(de>0?fe<0:fe>0)?null:this.at(fe/de,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ti=class extends Yr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ni=new q,ri=new ei,ii=new Mr,ai=new W,oi=new W,si=new W,ci=new W,li=new W,ui=new W,di=new W,fi=new W,pi=class extends Ln{constructor(e=new Br,t=new ti){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){ui.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(li.fromBufferAttribute(s,e),a?ui.addScaledVector(li,r):ui.addScaledVector(li.sub(t),r))}t.add(ui)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ii.copy(n.boundingSphere),ii.applyMatrix4(i),ri.copy(e.ray).recast(e.near),!(ii.containsPoint(ri.origin)===!1&&(ri.intersectSphere(ii,ai)===null||ri.origin.distanceToSquared(ai)>(e.far-e.near)**2))&&(ni.copy(i).invert(),ri.copy(e.ray).applyMatrix4(ni),(n.boundingBox===null||ri.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,ri)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=hi(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=hi(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=hi(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=hi(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function mi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;fi.copy(s),fi.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(fi);return l<n.near||l>n.far?null:{distance:l,point:fi.clone(),object:e}}function hi(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,oi),e.getVertexPosition(c,si),e.getVertexPosition(l,ci);let u=mi(e,t,n,r,oi,si,ci,di);if(u){let e=new W;or.getBarycoord(di,oi,si,ci,e),i&&(u.uv=or.getInterpolatedAttribute(i,s,c,l,e,new U)),a&&(u.uv1=or.getInterpolatedAttribute(a,s,c,l,e,new U)),o&&(u.normal=or.getInterpolatedAttribute(o,s,c,l,e,new W),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new W,materialIndex:0};or.getNormal(oi,si,ci,t.normal),u.face=t,u.barycoord=e}return u}var gi=new on,_i=new on,vi=new on,yi=new on,bi=new q,xi=new W,Si=new Mr,Ci=new q,wi=new ei,Ti=class extends pi{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=p,this.bindMatrix=new q,this.bindMatrixInverse=new q,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new sr),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,xi),this.boundingBox.expandByPoint(xi)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Mr),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,xi),this.boundingSphere.expandByPoint(xi)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Si.copy(this.boundingSphere),Si.applyMatrix4(r),e.ray.intersectsSphere(Si)!==!1&&(Ci.copy(r).invert(),wi.copy(e.ray).applyMatrix4(Ci),(this.boundingBox===null||wi.intersectsBox(this.boundingBox)!==!1)&&this._computeIntersections(e,t,wi)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new on,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():z(`SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;_i.fromBufferAttribute(r.attributes.skinIndex,e),vi.fromBufferAttribute(r.attributes.skinWeight,e),t.isVector4?(gi.copy(t),t.set(0,0,0,0)):(gi.set(...t,1),t.set(0,0,0)),gi.applyMatrix4(this.bindMatrix);for(let e=0;e<4;e++){let r=vi.getComponent(e);if(r!==0){let i=_i.getComponent(e);bi.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector(yi.copy(gi).applyMatrix4(bi),r)}}return t.isVector4&&(t.w=gi.w),t.applyMatrix4(this.bindMatrixInverse)}},Ei=class extends Ln{constructor(){super(),this.isBone=!0,this.type=`Bone`}},Di=class extends an{constructor(e=null,t=1,n=1,r,i,a,o,s,c=_,l=_,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Oi=new q,ki=new q,Ai=class e{constructor(e=[],t=[]){this.uuid=xt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){z(`Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new q)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new q;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:ki;Oi.multiplyMatrices(i,t[r]),Oi.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Di(t,e,e,ie,k);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(z(`Skeleton: No bone found with UUID:`,r),i=new Ei),this.bones.push(i),this.boneInverses.push(new q().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},ji=class extends Tr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Mi=new q,Ni=new q,Pi=[],Fi=new sr,Ii=new q,Li=new pi,Ri=new Mr,zi=class extends pi{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ji(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ii)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new sr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Mi),Fi.copy(e.boundingBox).applyMatrix4(Mi),this.boundingBox.union(Fi)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Mi),Ri.copy(e.boundingSphere).applyMatrix4(Mi),this.boundingSphere.union(Ri)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Li.geometry=this.geometry,Li.material=this.material,Li.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ri.copy(this.boundingSphere),Ri.applyMatrix4(n),e.ray.intersectsSphere(Ri)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Mi),Ni.multiplyMatrices(n,Mi),Li.matrixWorld=Ni,Li.raycast(e,Pi);for(let e=0,n=Pi.length;e<n;e++){let n=Pi[e];n.instanceId=i,n.object=this,t.push(n)}Pi.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ji(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Di(new Float32Array(r*this.count),r,this.count,P,k));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Bi=new Mr,Vi=new U(.5,.5),Hi=new W,Ui=class{constructor(e=new qr,t=new qr,n=new qr,r=new qr,i=new qr,a=new qr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=at,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){return Bi.center.set(0,0,0),Bi.radius=.7071067811865476+Vi.distanceTo(e.center),Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Hi.x=r.normal.x>0?e.max.x:e.min.x,Hi.y=r.normal.y>0?e.max.y:e.min.y,Hi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Hi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Wi=class extends Yr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new J(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Gi=new W,Ki=new W,qi=new q,Ji=new ei,Yi=new Mr,Xi=new W,Zi=new W,Qi=class extends Ln{constructor(e=new Br,t=new Wi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Gi.fromBufferAttribute(t,e-1),Ki.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Gi.distanceTo(Ki);e.setAttribute(`lineDistance`,new Or(n,1))}else z(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Yi.copy(n.boundingSphere),Yi.applyMatrix4(r),Yi.radius+=i,e.ray.intersectsSphere(Yi)===!1)return;qi.copy(r).invert(),Ji.copy(e.ray).applyMatrix4(qi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=$i(this,e,Ji,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=$i(this,e,Ji,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=$i(this,e,Ji,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=$i(this,e,Ji,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function $i(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Gi.fromBufferAttribute(s,i),Ki.fromBufferAttribute(s,a),n.distanceSqToSegment(Gi,Ki,Xi,Zi)>r)return;Xi.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Xi);if(!(c<t.near||c>t.far))return{distance:c,point:Zi.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var ea=new W,ta=new W,na=class extends Qi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)ea.fromBufferAttribute(t,e),ta.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+ea.distanceTo(ta);e.setAttribute(`lineDistance`,new Or(n,1))}else z(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},ra=class extends Qi{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},ia=class extends Yr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new J(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},aa=new q,oa=new ei,sa=new Mr,ca=new W,la=class extends Ln{constructor(e=new Br,t=new ia){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),sa.copy(n.boundingSphere),sa.applyMatrix4(r),sa.radius+=i,e.ray.intersectsSphere(sa)===!1)return;aa.copy(r).invert(),oa.copy(e.ray).applyMatrix4(aa);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);ca.fromBufferAttribute(l,n),ua(ca,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)ca.fromBufferAttribute(l,a),ua(ca,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ua(e,t,n,r,i,a,o){let s=oa.distanceSqToPoint(e);if(s<n){let n=new W;oa.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var da=class extends an{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},fa=class extends an{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},pa=class extends an{constructor(e,t,n=O,r,i,a,o=_,s=_,c,l=ae,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new en(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ma=class extends pa{constructor(e,t=O,n=301,r,i,a=_,o=_,s,c=ae){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ha=class extends an{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ga=class e extends Br{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Or(c,3)),this.setAttribute(`normal`,new Or(l,3)),this.setAttribute(`uv`,new Or(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new W;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},_a=class e extends Br{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new W,l=new U;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Or(a,3)),this.setAttribute(`normal`,new Or(o,3)),this.setAttribute(`uv`,new Or(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},va=class e extends Br{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Or(p,3)),this.setAttribute(`normal`,new Or(m,3)),this.setAttribute(`uv`,new Or(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},ya=class e extends Br{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new W,p=new U;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Or(s,3)),this.setAttribute(`normal`,new Or(c,3)),this.setAttribute(`uv`,new Or(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};function ba(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Sa(i))i.isRenderTargetTexture?(z(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Sa(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function xa(e){let t={};for(let n=0;n<e.length;n++){let r=ba(e[n]);for(let e in r)t[e]=r[e]}return t}function Sa(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Ca(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function wa(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:K.workingColorSpace}var Ta={clone:ba,merge:xa},Ea=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Da=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Oa=class extends Yr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ea,this.fragmentShader=Da,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ba(e.uniforms),this.uniformsGroups=Ca(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new J().setHex(r.value);break;case`v2`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new on().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new G().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new q().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ka=class extends Oa{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Aa=class extends Yr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new J(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new J(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new U(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ja=class extends Aa{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new U(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return V(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new J(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new J(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new J(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Ma=class extends Yr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ze,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Na=class extends Yr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Pa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Fa(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}function Ia(e){function t(t,n){return e[t]-e[n]}let n=e.length,r=Array(n);for(let e=0;e!==n;++e)r[e]=e;return r.sort(t),r}function La(e,t,n){let r=e.length,i=new e.constructor(r);for(let a=0,o=0;o!==r;++a){let r=n[a]*t;for(let n=0;n!==t;++n)i[o++]=e[r+n]}return i}function Ra(e,t,n,r){let i=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[i++];if(a===void 0)return;let o=a[r];if(o!==void 0){if(Array.isArray(o))do o=a[r],o!==void 0&&(t.push(a.time),n.push(...o)),a=e[i++];while(a!==void 0);else if(o.toArray!==void 0)do o=a[r],o!==void 0&&(t.push(a.time),o.toArray(n,n.length)),a=e[i++];while(a!==void 0);else do o=a[r],o!==void 0&&(t.push(a.time),n.push(o)),a=e[i++];while(a!==void 0)}}var za=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Ba=class extends za{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:qe,endingEnd:qe}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Je:i=e,o=2*t-n;break;case Ye:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Je:a=e,s=2*n-t;break;case Ye:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Va=class extends za{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Ha=class extends za{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ua=class extends za{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Ka(n,t,g,y,r);i[p]=Wa(x,o,_,b,m)}return i}};function Wa(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Ga(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Ka(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Wa(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Ga(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var qa=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Pa(t,this.TimeBufferType),this.values=Pa(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Pa(e.times,Array),values:Pa(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Fa(e.settings)&&(n.settings={inTangents:Pa(e.settings.inTangents,Array),outTangents:Pa(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ha(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Va(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ba(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ua(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ue:t=this.InterpolantFactoryMethodDiscrete;break;case We:t=this.InterpolantFactoryMethodLinear;break;case Ge:t=this.InterpolantFactoryMethodSmooth;break;case Ke:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return z(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ue;case this.InterpolantFactoryMethodLinear:return We;case this.InterpolantFactoryMethodSmooth:return Ge;case this.InterpolantFactoryMethodBezier:return Ke}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Fa(this.settings)&&(Ja(this.settings.inTangents,e),Ja(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(B(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(B(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){B(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){B(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&st(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){B(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ge,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Fa(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Ja(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}qa.prototype.ValueTypeName=``,qa.prototype.TimeBufferType=Float32Array,qa.prototype.ValueBufferType=Float32Array,qa.prototype.DefaultInterpolation=We;var Ya=class extends qa{constructor(e,t,n){super(e,t,n)}};Ya.prototype.ValueTypeName=`bool`,Ya.prototype.ValueBufferType=Array,Ya.prototype.DefaultInterpolation=Ue,Ya.prototype.InterpolantFactoryMethodLinear=void 0,Ya.prototype.InterpolantFactoryMethodSmooth=void 0;var Xa=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}};Xa.prototype.ValueTypeName=`color`;var Za=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}};Za.prototype.ValueTypeName=`number`;var Qa=class extends za{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Ht.slerpFlat(i,0,a,c-o,a,c,s);return i}},$a=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Qa(this.times,this.values,this.getValueSize(),e)}};$a.prototype.ValueTypeName=`quaternion`,$a.prototype.InterpolantFactoryMethodSmooth=void 0;var eo=class extends qa{constructor(e,t,n){super(e,t,n)}};eo.prototype.ValueTypeName=`string`,eo.prototype.ValueBufferType=Array,eo.prototype.DefaultInterpolation=Ue,eo.prototype.InterpolantFactoryMethodLinear=void 0,eo.prototype.InterpolantFactoryMethodSmooth=void 0;var to=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}};to.prototype.ValueTypeName=`vector`;var no=class{constructor(e=``,t=-1,n=[],r=Xe){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=xt(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let e=0,i=n.length;e!==i;++e)t.push(io(n[e]).scale(r));let i=new this(e.name,e.duration,t,e.blendMode);return i.uuid=e.uuid,i.userData=JSON.parse(e.userData||`{}`),i}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let e=0,r=n.length;e!==r;++e)t.push(qa.toJSON(n[e]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let i=t.length,a=[];for(let e=0;e<i;e++){let o=[],s=[];o.push((e+i-1)%i,e,(e+1)%i),s.push(0,1,0);let c=Ia(o);o=La(o,1,c),s=La(s,1,c),!r&&o[0]===0&&(o.push(i),s.push(s[0])),a.push(new Za(`.morphTargetInfluences[`+t[e].name+`]`,o,s).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let t=e;n=t.geometry&&t.geometry.animations||t.animations}for(let e=0;e<n.length;e++)if(n[e].name===t)return n[e];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},i=/^([\w-]*?)([\d]+)$/;for(let t=0,n=e.length;t<n;t++){let n=e[t],a=n.name.match(i);if(a&&a.length>1){let e=a[1],t=r[e];t||(r[e]=t=[]),t.push(n)}}let a=[];for(let e in r)a.push(this.CreateFromMorphTargetSequence(e,r[e],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let e=this.tracks[n];t=Math.max(t,e.times[e.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e&&=this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function ro(e){switch(e.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return Za;case`vector`:case`vector2`:case`vector3`:case`vector4`:return to;case`color`:return Xa;case`quaternion`:return $a;case`bool`:case`boolean`:return Ya;case`string`:return eo}throw Error(`THREE.KeyframeTrack: Unsupported typeName: `+e)}function io(e){if(e.type===void 0)throw Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let t=ro(e.type);if(e.times===void 0){let t=[],n=[];Ra(e.keys,t,n,`value`),e.times=t,e.values=n}let n;return n=t.parse===void 0?new t(e.name,e.times,e.values,e.interpolation):t.parse(e),Fa(e.settings)&&(n.settings={inTangents:Pa(e.settings.inTangents,Float32Array),outTangents:Pa(e.settings.outTangents,Float32Array)}),n}var ao={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(oo(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!oo(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function oo(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var so=class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},co=new so,lo=class{constructor(e){this.manager=e===void 0?co:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};lo.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var uo={},fo=class extends Error{constructor(e,t){super(e),this.response=t}},po=class extends lo{constructor(e){super(e),this.mimeType=``,this.responseType=``,this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=ao.get(`file:${e}`);if(i!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(i),this.manager.itemEnd(e)},0);return}if(uo[e]!==void 0){uo[e].push({onLoad:t,onProgress:n,onError:r});return}uo[e]=[],uo[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?`include`:`same-origin`,signal:typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,s=this.responseType;fetch(a).then(t=>{if(t.status===200||t.status===0){if(t.status===0&&z(`FileLoader: HTTP Status 0 received.`),typeof ReadableStream>`u`||t.body===void 0||t.body.getReader===void 0)return t;let n=uo[e],r=t.body.getReader(),i=t.headers.get(`X-File-Size`)||t.headers.get(`Content-Length`),a=i?parseInt(i):0,o=a!==0,s=0,c=new ReadableStream({start(e){t();function t(){r.read().then(({done:r,value:i})=>{if(r)e.close();else{s+=i.byteLength;let r=new ProgressEvent(`progress`,{lengthComputable:o,loaded:s,total:a});for(let e=0,t=n.length;e<t;e++){let t=n[e];t.onProgress&&t.onProgress(r)}e.enqueue(i),t()}},t=>{e.error(t)})}}});return new Response(c)}throw new fo(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`,t)}).then(e=>{switch(s){case`arraybuffer`:return e.arrayBuffer();case`blob`:return e.blob();case`document`:return e.text().then(e=>new DOMParser().parseFromString(e,o));case`json`:return e.json();default:if(o===``)return e.text();{let t=/charset="?([^;"\s]*)"?/i.exec(o),n=t&&t[1]?t[1].toLowerCase():void 0,r=new TextDecoder(n);return e.arrayBuffer().then(e=>r.decode(e))}}}).then(t=>{ao.add(`file:${e}`,t);let n=uo[e];delete uo[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onLoad&&r.onLoad(t)}}).catch(t=>{let n=uo[e];if(n===void 0)throw this.manager.itemError(e),t;delete uo[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onError&&r.onError(t)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},mo=new WeakMap,ho=class extends lo{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=ao.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=mo.get(a);e===void 0&&(e=[],mo.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=ct(`img`);function s(){l(),t&&t(this);let n=mo.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}mo.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),ao.remove(`image:${e}`);let n=mo.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}mo.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ao.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},go=class extends lo{constructor(e){super(e)}load(e,t,n,r){let i=new an,a=new ho(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},_o=class extends Ln{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new J(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},vo=class extends _o{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Ln.DEFAULT_UP),this.updateMatrix(),this.groundColor=new J(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},yo=new q,bo=new W,xo=new W,So=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new U(512,512),this.mapType=C,this.map=null,this.mapPass=null,this.matrix=new q,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ui,this._frameExtents=new U(1,1),this._viewportCount=1,this._viewports=[new on(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;bo.setFromMatrixPosition(e.matrixWorld),t.position.copy(bo),xo.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(xo),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){yo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(yo,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(yo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Co=new W,wo=new Ht,To=new W,Eo=class extends Ln{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new q,this.projectionMatrix=new q,this.projectionMatrixInverse=new q,this.coordinateSystem=at,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Co,wo,To),To.x===1&&To.y===1&&To.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Co,wo,To.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Co,wo,To),To.x===1&&To.y===1&&To.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Co,wo,To.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Do=new W,Oo=new U,ko=new U,Ao=class extends Eo{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=bt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(yt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return bt*2*Math.atan(Math.tan(yt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Do.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Do.x,Do.y).multiplyScalar(-e/Do.z),Do.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Do.x,Do.y).multiplyScalar(-e/Do.z)}getViewSize(e,t){return this.getViewBounds(e,Oo,ko),t.subVectors(ko,Oo)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(yt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},jo=class extends So{constructor(){super(new Ao(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=bt*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},Mo=class extends _o{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(Ln.DEFAULT_UP),this.updateMatrix(),this.target=new Ln,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new jo}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},No=class extends So{constructor(){super(new Ao(90,1,.5,500)),this.isPointLightShadow=!0}},Po=class extends _o{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new No}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Fo=class extends Eo{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Io=class extends So{constructor(){super(new Fo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Lo=class extends _o{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Ln.DEFAULT_UP),this.updateMatrix(),this.target=new Ln,this.shadow=new Io}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Ro=class{static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.slice(0,t+1)}static resolveURL(e,t){return typeof e!=`string`||e===``?``:(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,`$1`)),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},zo=new WeakMap,Bo=class extends lo{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>`u`&&z(`ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&z(`ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=ao.get(`image-bitmap:${e}`);if(a!==void 0){if(i.manager.itemStart(e),a.then){a.then(n=>{zo.has(a)===!0?(r&&r(zo.get(a)),i.manager.itemError(e),i.manager.itemEnd(e)):(t&&t(n),i.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);return}let o={};o.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let s=fetch(e,o).then(function(e){return e.blob()}).then(function(e){return createImageBitmap(e,Object.assign({},i.options,{colorSpaceConversion:`none`}))}).then(function(n){return ao.add(`image-bitmap:${e}`,n),t&&t(n),i.manager.itemEnd(e),n}).catch(function(t){r&&r(t),zo.set(s,t),ao.remove(`image-bitmap:${e}`),i.manager.itemError(e),i.manager.itemEnd(e)});ao.add(`image-bitmap:${e}`,s),i.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Vo=-90,Ho=1,Uo=class extends Ln{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Ao(Vo,Ho,e,t);r.layers=this.layers,this.add(r);let i=new Ao(Vo,Ho,e,t);i.layers=this.layers,this.add(i);let a=new Ao(Vo,Ho,e,t);a.layers=this.layers,this.add(a);let o=new Ao(Vo,Ho,e,t);o.layers=this.layers,this.add(o);let s=new Ao(Vo,Ho,e,t);s.layers=this.layers,this.add(s);let c=new Ao(Vo,Ho,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Wo=class extends Ao{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Go=`\\[\\]\\.:\\/`,Ko=RegExp(`[\\[\\]\\.:\\/]`,`g`),qo=`[^\\[\\]\\.:\\/]`,Jo=`[^`+Go.replace(`\\.`,``)+`]`,Yo=`((?:WC+[\\/:])*)`.replace(`WC`,qo),Xo=`(WCOD+)?`.replace(`WCOD`,Jo),Zo=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,qo),Qo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,qo),$o=RegExp(`^`+Yo+Xo+Zo+Qo+`$`),es=[`material`,`materials`,`bones`,`map`],ts=class{constructor(e,t,n){let r=n||ns.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ns=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Ko,``)}static parseTrackName(e){let t=$o.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);es.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){z(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){B(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){B(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){B(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){B(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){B(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){B(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){B(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;B(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){B(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){B(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ns.Composite=ts,ns.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},ns.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},ns.prototype.GetterByBindingType=[ns.prototype._getValue_direct,ns.prototype._getValue_array,ns.prototype._getValue_arrayElement,ns.prototype._getValue_toArray],ns.prototype.SetterByBindingTypeAndVersioning=[[ns.prototype._setValue_direct,ns.prototype._setValue_direct_setNeedsUpdate,ns.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ns.prototype._setValue_array,ns.prototype._setValue_array_setNeedsUpdate,ns.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ns.prototype._setValue_arrayElement,ns.prototype._setValue_arrayElement_setNeedsUpdate,ns.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ns.prototype._setValue_fromArray,ns.prototype._setValue_fromArray_setNeedsUpdate,ns.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var rs=class{constructor(e,t,n,r,i,a=!1){this.isGLBufferAttribute=!0,this.name=``,this.buffer=e,this.type=t,this.itemSize=n,this.elementSize=r,this.count=i,this.normalized=a,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}};(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});var is=class extends na{constructor(e=1){let t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],r=new Br;r.setAttribute(`position`,new Or(t,3)),r.setAttribute(`color`,new Or(n,3));let i=new Wi({vertexColors:!0,toneMapped:!1});super(r,i),this.type=`AxesHelper`}setColors(e,t,n){let r=new J,i=this.geometry.attributes.color.array;return r.set(e),r.toArray(i,0),r.toArray(i,3),r.set(t),r.toArray(i,6),r.toArray(i,9),r.set(n),r.toArray(i,12),r.toArray(i,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function as(e,t,n,r){let i=os(r);switch(n){case ne:return e*t;case P:return e*t/i.components*i.byteLength;case se:return e*t/i.components*i.byteLength;case ce:return e*t*2/i.components*i.byteLength;case le:return e*t*2/i.components*i.byteLength;case re:return e*t*3/i.components*i.byteLength;case ie:return e*t*4/i.components*i.byteLength;case ue:return e*t*4/i.components*i.byteLength;case de:case fe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case pe:case me:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ge:case ve:return Math.max(e,16)*Math.max(t,8)/4;case he:case _e:return Math.max(e,8)*Math.max(t,8)/2;case ye:case be:case Se:case Ce:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case xe:case we:case Te:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ee:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case De:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Oe:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ke:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Ae:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case je:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Me:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ne:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case F:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Pe:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Fe:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Ie:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case I:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Le:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case L:case R:case Re:return Math.ceil(e/4)*Math.ceil(t/4)*16;case ze:case Be:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ve:case He:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function os(e){switch(e){case C:case w:return{byteLength:1,components:1};case E:case T:case A:return{byteLength:2,components:1};case j:case ee:return{byteLength:2,components:4};case O:case D:case k:return{byteLength:4,components:1};case M:case N:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?z(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function ss(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function cs(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Y={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},X={common:{diffuse:{value:new J(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new U(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new J(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new W},probesMax:{value:new W},probesResolution:{value:new W}},points:{diffuse:{value:new J(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new J(16777215)},opacity:{value:1},center:{value:new U(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},ls={basic:{uniforms:xa([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.fog]),vertexShader:Y.meshbasic_vert,fragmentShader:Y.meshbasic_frag},lambert:{uniforms:xa([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new J(0)},envMapIntensity:{value:1}}]),vertexShader:Y.meshlambert_vert,fragmentShader:Y.meshlambert_frag},phong:{uniforms:xa([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new J(0)},specular:{value:new J(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Y.meshphong_vert,fragmentShader:Y.meshphong_frag},standard:{uniforms:xa([X.common,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.roughnessmap,X.metalnessmap,X.fog,X.lights,{emissive:{value:new J(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag},toon:{uniforms:xa([X.common,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.gradientmap,X.fog,X.lights,{emissive:{value:new J(0)}}]),vertexShader:Y.meshtoon_vert,fragmentShader:Y.meshtoon_frag},matcap:{uniforms:xa([X.common,X.bumpmap,X.normalmap,X.displacementmap,X.fog,{matcap:{value:null}}]),vertexShader:Y.meshmatcap_vert,fragmentShader:Y.meshmatcap_frag},points:{uniforms:xa([X.points,X.fog]),vertexShader:Y.points_vert,fragmentShader:Y.points_frag},dashed:{uniforms:xa([X.common,X.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Y.linedashed_vert,fragmentShader:Y.linedashed_frag},depth:{uniforms:xa([X.common,X.displacementmap]),vertexShader:Y.depth_vert,fragmentShader:Y.depth_frag},normal:{uniforms:xa([X.common,X.bumpmap,X.normalmap,X.displacementmap,{opacity:{value:1}}]),vertexShader:Y.meshnormal_vert,fragmentShader:Y.meshnormal_frag},sprite:{uniforms:xa([X.sprite,X.fog]),vertexShader:Y.sprite_vert,fragmentShader:Y.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Y.background_vert,fragmentShader:Y.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:Y.backgroundCube_vert,fragmentShader:Y.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Y.cube_vert,fragmentShader:Y.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Y.equirect_vert,fragmentShader:Y.equirect_frag},distance:{uniforms:xa([X.common,X.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Y.distance_vert,fragmentShader:Y.distance_frag},shadow:{uniforms:xa([X.lights,X.fog,{color:{value:new J(0)},opacity:{value:1}}]),vertexShader:Y.shadow_vert,fragmentShader:Y.shadow_frag}};ls.physical={uniforms:xa([ls.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new U(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new J(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new U},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new J(0)},specularColor:{value:new J(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new U},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag};var us={r:0,b:0,g:0},ds=new q,fs=new G;fs.set(-1,0,0,0,1,0,0,0,1);function ps(e,t,n,r,i,a){let o=new J(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new pi(new ga(1,1,1),new Oa({name:`BackgroundCubeMaterial`,uniforms:ba(ls.backgroundCube.uniforms),vertexShader:ls.backgroundCube.vertexShader,fragmentShader:ls.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(ds.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(fs),l.material.toneMapped=K.getTransfer(i.colorSpace)!==tt,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new pi(new va(2,2),new Oa({name:`BackgroundMaterial`,uniforms:ba(ls.background.uniforms),vertexShader:ls.background.vertexShader,fragmentShader:ls.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=K.getTransfer(i.colorSpace)!==tt,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(us,wa(e)),n.buffers.color.setClear(us.r,us.g,us.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function ms(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function hs(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function gs(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(z(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&z(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function _s(e){let t=this,n=null,r=0,i=!1,a=!1,o=new qr,s=new G,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var vs=4,ys=6,bs=20,xs=256,Ss=new Fo,Cs=new J,ws=null,Ts=0,Es=0,Ds=!1,Os=new W,ks=new W,As=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Os}=i;ws=this._renderer.getRenderTarget(),Ts=this._renderer.getActiveCubeFace(),Es=this._renderer.getActiveMipmapLevel(),Ds=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ls(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Is(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ws,Ts,Es),this._renderer.xr.enabled=Ds,e.scissorTest=!1,Ns(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ws=this._renderer.getRenderTarget(),Ts=this._renderer.getActiveCubeFace(),Es=this._renderer.getActiveMipmapLevel(),Ds=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:b,minFilter:b,generateMipmaps:!1,type:A,format:ie,colorSpace:$e,depthBuffer:!1},r=Ms(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ms(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=js(r)),this._blurMaterial=Fs(r,e,t),this._ggxMaterial=Ps(r,e,t)}return r}_compileMaterial(e){let t=new pi(new Br,e);this._renderer.compile(t,Ss)}_sceneToCubeUV(e,t,n,r,i){let a=new Ao(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Cs),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pi(new ga,new ti({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Cs),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Ns(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ls()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Is());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Ns(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Ss)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-vs?n-d+vs:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Ns(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Ss),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Ns(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Ss)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Ns(t,3*l*(r>this._lodMax-vs?r-this._lodMax+vs:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Ss)}};function js(e){let t=[],n=[],r=e,i=e-vs+1+ys;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?ks.set(1,r,n):e===1?ks.set(-n,1,-r):e===2?ks.set(-n,r,1):e===3?ks.set(-1,r,-n):e===4?ks.set(-n,-1,r):ks.set(n,r,-1),ks.toArray(l,(e*6+t)*3)}}let u=new Br;u.setAttribute(`position`,new Tr(c,3)),u.setAttribute(`outputDirection`,new Tr(l,3)),n.push(new pi(u,null)),r>vs&&r--}return{lodMeshes:n,sizeLods:t}}function Ms(e,t,n){let r=new cn(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Ns(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Ps(e,t,n){return new Oa({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:xs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Rs(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Fs(e,t,n){return new Oa({name:`SphericalGaussianBlur`,defines:{SAMPLES:bs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Rs(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Is(){return new Oa({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Rs(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ls(){return new Oa({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Rs(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Rs(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var zs=class extends cn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new da(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ga(5,5,5),i=new Oa({name:`CubemapFromEquirect`,uniforms:ba(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new pi(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=b),new Uo(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Bs(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new zs(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new As(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new As(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Vs(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&pt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Hs(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Dr:Er)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Us(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Ws(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:B(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Gs(e,t,n){let r=new WeakMap,i=new on;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new ln(h,p,m,u);g.type=k,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new U(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ks(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var qs={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Js(e,t,n,r,i,a){let o=new cn(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Br;l.setAttribute(`position`,new Or([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new Or([0,2,0,0,2,0],2));let u=new ka({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new pi(l,u),f=new Fo(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new cn(t,n,{type:A,depthBuffer:!1,stencilBuffer:!1}),c=new cn(t,n,{type:A,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},K.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=qs[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Ys=new an,Xs=new pa(1,1),Zs=new ln,Qs=new un,$s=new da,ec=[],tc=[],nc=new Float32Array(16),rc=new Float32Array(9),ic=new Float32Array(4);function ac(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ec[i];if(a===void 0&&(a=new Float32Array(i),ec[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function oc(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function sc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function cc(e,t){let n=tc[t];n===void 0&&(n=new Int32Array(t),tc[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function lc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function uc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(oc(n,t))return;e.uniform2fv(this.addr,t),sc(n,t)}}function dc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(oc(n,t))return;e.uniform3fv(this.addr,t),sc(n,t)}}function fc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(oc(n,t))return;e.uniform4fv(this.addr,t),sc(n,t)}}function pc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(oc(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),sc(n,t)}else{if(oc(n,r))return;ic.set(r),e.uniformMatrix2fv(this.addr,!1,ic),sc(n,r)}}function mc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(oc(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),sc(n,t)}else{if(oc(n,r))return;rc.set(r),e.uniformMatrix3fv(this.addr,!1,rc),sc(n,r)}}function hc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(oc(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),sc(n,t)}else{if(oc(n,r))return;nc.set(r),e.uniformMatrix4fv(this.addr,!1,nc),sc(n,r)}}function gc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function _c(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(oc(n,t))return;e.uniform2iv(this.addr,t),sc(n,t)}}function vc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(oc(n,t))return;e.uniform3iv(this.addr,t),sc(n,t)}}function yc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(oc(n,t))return;e.uniform4iv(this.addr,t),sc(n,t)}}function bc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function xc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(oc(n,t))return;e.uniform2uiv(this.addr,t),sc(n,t)}}function Sc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(oc(n,t))return;e.uniform3uiv(this.addr,t),sc(n,t)}}function Cc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(oc(n,t))return;e.uniform4uiv(this.addr,t),sc(n,t)}}function wc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Xs.compareFunction=n.isReversedDepthBuffer()?518:515,a=Xs):a=Ys,n.setTexture2D(t||a,i)}function Tc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Qs,i)}function Ec(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||$s,i)}function Dc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Zs,i)}function Oc(e){switch(e){case 5126:return lc;case 35664:return uc;case 35665:return dc;case 35666:return fc;case 35674:return pc;case 35675:return mc;case 35676:return hc;case 5124:case 35670:return gc;case 35667:case 35671:return _c;case 35668:case 35672:return vc;case 35669:case 35673:return yc;case 5125:return bc;case 36294:return xc;case 36295:return Sc;case 36296:return Cc;case 35678:case 36198:case 36298:case 36306:case 35682:return wc;case 35679:case 36299:case 36307:return Tc;case 35680:case 36300:case 36308:case 36293:return Ec;case 36289:case 36303:case 36311:case 36292:return Dc}}function kc(e,t){e.uniform1fv(this.addr,t)}function Ac(e,t){let n=ac(t,this.size,2);e.uniform2fv(this.addr,n)}function jc(e,t){let n=ac(t,this.size,3);e.uniform3fv(this.addr,n)}function Mc(e,t){let n=ac(t,this.size,4);e.uniform4fv(this.addr,n)}function Nc(e,t){let n=ac(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Pc(e,t){let n=ac(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Fc(e,t){let n=ac(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Ic(e,t){e.uniform1iv(this.addr,t)}function Lc(e,t){e.uniform2iv(this.addr,t)}function Rc(e,t){e.uniform3iv(this.addr,t)}function zc(e,t){e.uniform4iv(this.addr,t)}function Bc(e,t){e.uniform1uiv(this.addr,t)}function Vc(e,t){e.uniform2uiv(this.addr,t)}function Hc(e,t){e.uniform3uiv(this.addr,t)}function Uc(e,t){e.uniform4uiv(this.addr,t)}function Wc(e,t,n){let r=this.cache,i=t.length,a=cc(n,i);oc(r,a)||(e.uniform1iv(this.addr,a),sc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Xs:Ys;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Gc(e,t,n){let r=this.cache,i=t.length,a=cc(n,i);oc(r,a)||(e.uniform1iv(this.addr,a),sc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Qs,a[e])}function Kc(e,t,n){let r=this.cache,i=t.length,a=cc(n,i);oc(r,a)||(e.uniform1iv(this.addr,a),sc(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||$s,a[e])}function qc(e,t,n){let r=this.cache,i=t.length,a=cc(n,i);oc(r,a)||(e.uniform1iv(this.addr,a),sc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Zs,a[e])}function Jc(e){switch(e){case 5126:return kc;case 35664:return Ac;case 35665:return jc;case 35666:return Mc;case 35674:return Nc;case 35675:return Pc;case 35676:return Fc;case 5124:case 35670:return Ic;case 35667:case 35671:return Lc;case 35668:case 35672:return Rc;case 35669:case 35673:return zc;case 5125:return Bc;case 36294:return Vc;case 36295:return Hc;case 36296:return Uc;case 35678:case 36198:case 36298:case 36306:case 35682:return Wc;case 35679:case 36299:case 36307:return Gc;case 35680:case 36300:case 36308:case 36293:return Kc;case 36289:case 36303:case 36311:case 36292:return qc}}var Yc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Oc(t.type)}},Xc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Jc(t.type)}},Zc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Qc=/(\w+)(\])?(\[|\.)?/g;function $c(e,t){e.seq.push(t),e.map[t.id]=t}function el(e,t,n){let r=e.name,i=r.length;for(Qc.lastIndex=0;;){let a=Qc.exec(r),o=Qc.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){$c(n,l===void 0?new Yc(s,e,t):new Xc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Zc(s),$c(n,e)),n=e}}}var tl=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);el(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function nl(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var rl=37297,il=0;function al(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var ol=new G;function sl(e){K._getMatrix(ol,K.workingColorSpace,e);let t=`mat3( ${ol.elements.map(e=>e.toFixed(4))} )`;switch(K.getTransfer(e)){case et:return[t,`LinearTransferOETF`];case tt:return[t,`sRGBTransferOETF`];default:return z(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function cl(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+al(e.getShaderSource(t),r)}return i}function ll(e,t){let n=sl(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var ul={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function dl(e,t){let n=ul[t];return n===void 0?(z(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var fl=new W;function pl(){return K.getLuminanceCoefficients(fl),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${fl.x.toFixed(4)}, ${fl.y.toFixed(4)}, ${fl.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function ml(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(_l).join(`
`)}function hl(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function gl(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function _l(e){return e!==``}function vl(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function yl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var bl=/^[ \t]*#include +<([\w\d./]+)>/gm;function xl(e){return e.replace(bl,Cl)}var Sl=new Map;function Cl(e,t){let n=Y[t];if(n===void 0){let e=Sl.get(t);if(e!==void 0)n=Y[e],z(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return xl(n)}var wl=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Tl(e){return e.replace(wl,El)}function El(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Dl(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Ol={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function kl(e){return Ol[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Al={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function jl(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Al[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var Ml={302:`ENVMAP_MODE_REFRACTION`};function Nl(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Ml[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Pl={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Fl(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Pl[e.combine]||`ENVMAP_BLENDING_NONE`}function Il(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Ll(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=kl(n),l=jl(n),u=Nl(n),d=Fl(n),f=Il(n),p=ml(n),m=hl(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(_l).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(_l).join(`
`),_.length>0&&(_+=`
`)):(g=[Dl(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(_l).join(`
`),_=[Dl(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Y.tonemapping_pars_fragment,n.toneMapping===0?``:dl(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Y.colorspace_pars_fragment,ll(`linearToOutputTexel`,n.outputColorSpace),pl(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(_l).join(`
`)),o=xl(o),o=vl(o,n),o=yl(o,n),s=xl(s),s=vl(s,n),s=yl(s,n),o=Tl(o),s=Tl(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=nl(i,i.VERTEX_SHADER,y),S=nl(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=cl(i,x,`vertex`),n=cl(i,S,`fragment`);B(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):z(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new tl(i,h),T=gl(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,rl)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=il++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Rl=0,zl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Bl(e),t.set(e,n)),n}},Bl=class{constructor(e){this.id=Rl++,this.code=e,this.usedTimes=0}};function Vl(e){return e===1030||e===37490||e===36285}function Hl(e,t,n,r,i,a){let o=new xn,s=new zl,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&z(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=ls[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),te=h.isInstancedMesh===!0,M=h.isBatchedMesh===!0,N=!!i.map,ne=!!i.matcap,re=!!x,ie=!!i.aoMap,ae=!!i.lightMap,oe=!!i.bumpMap&&i.wireframe===!1,P=!!i.normalMap,se=!!i.displacementMap,ce=!!i.emissiveMap,le=!!i.metalnessMap,ue=!!i.roughnessMap,de=i.anisotropy>0,fe=i.clearcoat>0,pe=i.dispersion>0,me=i.retroreflectivity>0,he=i.iridescence>0,ge=i.sheen>0,_e=i.transmission>0,ve=de&&!!i.anisotropyMap,ye=fe&&!!i.clearcoatMap,be=fe&&!!i.clearcoatNormalMap,xe=fe&&!!i.clearcoatRoughnessMap,Se=he&&!!i.iridescenceMap,Ce=he&&!!i.iridescenceThicknessMap,we=ge&&!!i.sheenColorMap,Te=ge&&!!i.sheenRoughnessMap,Ee=!!i.specularMap,De=!!i.specularColorMap,Oe=!!i.specularIntensityMap,ke=_e&&!!i.transmissionMap,Ae=_e&&!!i.thicknessMap,je=!!i.gradientMap,Me=!!i.alphaMap,Ne=i.alphaTest>0,F=!!i.alphaHash,Pe=!!i.extensions,Fe=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Fe=e.toneMapping);let Ie={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:M,batchingColor:M&&h._colorsTexture!==null,instancing:te,instancingColor:te&&h.instanceColor!==null,instancingMorph:te&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:K.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:N,matcap:ne,envMap:re,envMapMode:re&&x.mapping,envMapCubeUVHeight:S,aoMap:ie,lightMap:ae,bumpMap:oe,normalMap:P,displacementMap:se,emissiveMap:ce,normalMapObjectSpace:P&&i.normalMapType===1,normalMapTangentSpace:P&&i.normalMapType===0,packedNormalMap:P&&i.normalMapType===0&&Vl(i.normalMap.format),metalnessMap:le,roughnessMap:ue,anisotropy:de,anisotropyMap:ve,clearcoat:fe,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:xe,dispersion:pe,retroreflection:me,iridescence:he,iridescenceMap:Se,iridescenceThicknessMap:Ce,sheen:ge,sheenColorMap:we,sheenRoughnessMap:Te,specularMap:Ee,specularColorMap:De,specularIntensityMap:Oe,transmission:_e,transmissionMap:ke,thicknessMap:Ae,gradientMap:je,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Me,alphaTest:Ne,alphaHash:F,combine:i.combine,mapUv:N&&m(i.map.channel),aoMapUv:ie&&m(i.aoMap.channel),lightMapUv:ae&&m(i.lightMap.channel),bumpMapUv:oe&&m(i.bumpMap.channel),normalMapUv:P&&m(i.normalMap.channel),displacementMapUv:se&&m(i.displacementMap.channel),emissiveMapUv:ce&&m(i.emissiveMap.channel),metalnessMapUv:le&&m(i.metalnessMap.channel),roughnessMapUv:ue&&m(i.roughnessMap.channel),anisotropyMapUv:ve&&m(i.anisotropyMap.channel),clearcoatMapUv:ye&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:be&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:we&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Te&&m(i.sheenRoughnessMap.channel),specularMapUv:Ee&&m(i.specularMap.channel),specularColorMapUv:De&&m(i.specularColorMap.channel),specularIntensityMapUv:Oe&&m(i.specularIntensityMap.channel),transmissionMapUv:ke&&m(i.transmissionMap.channel),thicknessMapUv:Ae&&m(i.thicknessMap.channel),alphaMapUv:Me&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(P||de),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(N||Me),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&P===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Fe,decodeVideoTexture:N&&i.map.isVideoTexture===!0&&K.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&i.emissiveMap.isVideoTexture===!0&&K.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Pe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Pe&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ie.vertexUv1s=c.has(1),Ie.vertexUv2s=c.has(2),Ie.vertexUv3s=c.has(3),c.clear(),Ie}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=ls[t];n=Ta.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Ll(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function Ul(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Wl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Gl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Kl(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Wl),r.length>1&&r.sort(t||Gl),i.length>1&&i.sort(t||Gl)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function ql(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Kl,e.set(t,[i])):n>=r.length?(i=new Kl,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Jl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new W,color:new J};break;case`SpotLight`:n={position:new W,direction:new W,color:new J,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new W,color:new J,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new W,skyColor:new J,groundColor:new J};break;case`RectAreaLight`:n={color:new J,position:new W,halfWidth:new W,halfHeight:new W}}return e[t.id]=n,n}}}function Yl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Xl=0;function Zl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Ql(e){let t=new Jl,n=Yl(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new W);let i=new W,a=new q,o=new q;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Zl);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=X.LTC_FLOAT_1,r.rectAreaLTC2=X.LTC_FLOAT_2):(r.rectAreaLTC1=X.LTC_HALF_1,r.rectAreaLTC2=X.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Xl++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function $l(e){let t=new Ql(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function eu(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new $l(e),t.set(n,[a])):r>=i.length?(a=new $l(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var tu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nu=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ru=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],iu=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],au=new q,ou=new W,su=new W;function cu(e,t,n){let r=new Ui,i=new U,a=new U,o=new on,s=new Ma,c=new Na,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Oa({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new U},radius:{value:4}},vertexShader:tu,fragmentShader:nu}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Br;m.setAttribute(`position`,new Tr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new pi(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(z(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=v!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){z(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){z(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new cn(i.x,i.y,{format:ce,type:A,minFilter:b,magFilter:b,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new pa(i.x,i.y,k),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=ae,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=_,d.map.depthTexture.magFilter=_}else l.isPointLight?(d.map=new zs(i.x),d.map.depthTexture=new ma(i.x,O)):(d.map=new cn(i.x,i.y),d.map.depthTexture=new pa(i.x,i.y,O)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=ae,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=b,d.map.depthTexture.magFilter=b):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=_,d.map.depthTexture.magFilter=_);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),ou.setFromMatrixPosition(l.matrixWorld),e.position.copy(ou),su.copy(e.position),su.add(ru[t]),e.up.copy(iu[t]),e.lookAt(su),e.updateMatrixWorld(),n.makeTranslation(-ou.x,-ou.y,-ou.z),au.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(au,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),S(n,s,i,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&y(d,s),d.needsUpdate=!1}v=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function y(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new cn(i.x,i.y,{format:ce,type:A}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function x(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,C)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function S(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=x(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=x(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)S(c[e],i,a,o,s)}function C(e){e.target.removeEventListener(`dispose`,C);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function lu(e,t){function n(){let t=!1,n=new on,r=null,i=new on(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?le(e.DEPTH_TEST):ue(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=ht[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?le(e.STENCIL_TEST):ue(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,M=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(M=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),te=M>=2):(M=parseFloat(/^WebGL (\d)/.exec(N)[1]),te=M>=1);let ne=null,re={},ie=e.getParameter(e.SCISSOR_BOX),ae=e.getParameter(e.VIEWPORT),oe=new on().fromArray(ie),P=new on().fromArray(ae);function se(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ce={};ce[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),le(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),le(e.CULL_FACE),ge(0);function le(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ue(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function de(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function fe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function pe(t){return h!==t&&(e.useProgram(t),h=t,!0)}let me={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};me[103]=e.MIN,me[104]=e.MAX;let he={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ge(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(ue(e.BLEND),g=!1);else if(g===!1&&(le(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:B(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:B(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:B(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:B(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(me[n],me[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(he[r],he[i],he[o],he[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function _e(t,n){t.side===2?ue(e.CULL_FACE):le(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?ge(0):ge(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),xe(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?le(e.SAMPLE_ALPHA_TO_COVERAGE):ue(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ye(t){t===0?ue(e.CULL_FACE):(le(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function be(t){t!==k&&(te&&e.lineWidth(t),k=t)}function xe(t,n,r){t?(le(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):ue(e.POLYGON_OFFSET_FILL)}function Se(t){t?le(e.SCISSOR_TEST):ue(e.SCISSOR_TEST)}function Ce(t){t===void 0&&(t=e.TEXTURE0+ee-1),ne!==t&&(e.activeTexture(t),ne=t)}function we(t,n,r){r===void 0&&(r=ne===null?e.TEXTURE0+ee-1:ne);let i=re[r];i===void 0&&(i={type:void 0,texture:void 0},re[r]=i),(i.type!==t||i.texture!==n)&&(ne!==r&&(e.activeTexture(r),ne=r),e.bindTexture(t,n||ce[t]),i.type=t,i.texture=n)}function Te(){let t=re[ne];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ee(){try{e.compressedTexImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function De(){try{e.compressedTexImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Oe(){try{e.texSubImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function ke(){try{e.texSubImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Me(){try{e.texStorage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Ne(){try{e.texStorage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function F(){try{e.texImage2D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Pe(){try{e.texImage3D(...arguments)}catch(e){B(`WebGLState:`,e)}}function Fe(t){return d[t]===void 0?e.getParameter(t):d[t]}function Ie(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function I(t){oe.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),oe.copy(t))}function Le(t){P.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),P.copy(t))}function L(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function R(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},ne=null,re={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,oe.set(0,0,e.canvas.width,e.canvas.height),P.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:le,disable:ue,bindFramebuffer:de,drawBuffers:fe,useProgram:pe,setBlending:ge,setMaterial:_e,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:xe,setScissorTest:Se,activeTexture:Ce,bindTexture:we,unbindTexture:Te,compressedTexImage2D:Ee,compressedTexImage3D:De,texImage2D:F,texImage3D:Pe,pixelStorei:Ie,getParameter:Fe,updateUBOMapping:L,uniformBlockBinding:R,texStorage2D:Me,texStorage3D:Ne,texSubImage2D:Oe,texSubImage3D:ke,compressedTexSubImage2D:Ae,compressedTexSubImage3D:je,scissor:I,viewport:Le,reset:Re}}function uu(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new U,u=new WeakMap,d=new Set,f,p=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):ct(`canvas`)}function T(e,t,n){let r=1,i=Fe(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=w(n,a));let o=t?w(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),z(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&z(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function E(e){return e.generateMipmaps}function D(t){e.generateMipmap(t)}function O(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function k(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];z(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||z(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?et:K.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function A(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,z(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function j(e,t){return E(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function ee(e){let t=e.target;t.removeEventListener(`dispose`,ee),M(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function te(e){let t=e.target;t.removeEventListener(`dispose`,te),ne(t)}function M(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&N(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function N(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function ne(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let re=0;function ie(){re=0}function ae(){return re}function P(e){re=e}function se(){let e=re;return e>=i.maxTextures&&z(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),re+=1,e}function ce(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function le(t,i){let a=r.get(t);if(t.isVideoTexture&&F(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)z(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)z(`WebGLRenderer: Texture marked for update but image is incomplete`);else{be(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ue(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?be(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function de(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?be(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function fe(t,i){let a=r.get(t);t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version?xe(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let pe={[m]:e.REPEAT,[h]:e.CLAMP_TO_EDGE,[g]:e.MIRRORED_REPEAT},me={[_]:e.NEAREST,[v]:e.NEAREST_MIPMAP_NEAREST,[y]:e.NEAREST_MIPMAP_LINEAR,[b]:e.LINEAR,[x]:e.LINEAR_MIPMAP_NEAREST,[S]:e.LINEAR_MIPMAP_LINEAR},he={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function ge(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&z(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,pe[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,pe[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,pe[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,me[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,me[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,he[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function _e(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,ee));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=ce(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&N(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ve(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ye(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ve(n.start,r.width,4),c=ve(t.start,r.width,4);n.start<=i+1&&a===c&&ve(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function be(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=_e(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=K.getPrimaries(K.workingColorSpace),r=o.colorSpace===``?null:K.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=T(o.image,!1,i.maxTextureSize);t=Pe(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=k(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);ge(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,v=f.__version===void 0||l===!0,y=u.dataReady,b=j(o,t);if(o.isDepthTexture)m=A(o.format===oe,o.type),v&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&v&&n.texStorage2D(e.TEXTURE_2D,b,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?y&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(v&&n.texStorage2D(e.TEXTURE_2D,b,m,t.width,t.height),y&&ye(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&v&&n.texStorage3D(e.TEXTURE_2D_ARRAY,b,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(y){if(o.layerUpdates.size>0){let t=as(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else z(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?y&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&v&&n.texStorage2D(e.TEXTURE_2D,b,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?y&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?z(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?y&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(v&&n.texStorage3D(e.TEXTURE_2D_ARRAY,b,m,t.width,t.height,t.depth),y){if(o.layerUpdates.size>0){let i=as(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(v&&n.texStorage3D(e.TEXTURE_3D,b,m,t.width,t.height,t.depth),y&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(v){if(_)n.texStorage2D(e.TEXTURE_2D,b,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<b;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&v){let t=Fe(g[0]);n.texStorage2D(e.TEXTURE_2D,b,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?y&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(v){let r=Fe(t);n.texStorage2D(e.TEXTURE_2D,b,m,r.width,r.height)}y&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);E(o)&&D(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function xe(t,o,s){if(o.image.length!==6)return;let c=_e(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=K.getPrimaries(K.workingColorSpace),r=o.colorSpace===``?null:K.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=T(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=Pe(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),v=k(o.internalFormat,g,_,o.normalized,o.colorSpace),y=o.isVideoTexture!==!0,b=u.__version===void 0||c===!0,x=l.dataReady,S=j(o,h);ge(e.TEXTURE_CUBE_MAP,o);let C;if(f){y&&b&&n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=m[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];o.format===1023?y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?z(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=o.mipmaps,y&&b){C.length>0&&S++;let t=Fe(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(p){y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<C.length;r++){let i=C[r].image[t].image;y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,i.width,i.height,0,g,_,i.data)}}else{y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,m[t]);for(let r=0;r<C.length;r++){let i=C[r];y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,g,_,i.image[t])}}}E(o)&&D(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function Se(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=k(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Ne(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,Me(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ce(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=A(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Ne(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Me(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Me(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=k(o.internalFormat,c,l,o.normalized,o.colorSpace);Ne(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Me(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Me(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function we(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,l.__webglTexture&&i.depthTexture.image.width===i.width&&i.depthTexture.image.height===i.height||(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,ee)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),ge(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else le(i.depthTexture,0);let u=l.__webglTexture,d=Me(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)Ne(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)Ne(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Te(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)we(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?we(i.__webglFramebuffer[0],t,0):we(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),Ce(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),Ce(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ee(t,n,i){let a=r.get(t);n!==void 0&&Se(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Te(t)}function De(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,te);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Ne(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=k(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=Me(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),Ce(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),ge(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)Se(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else Se(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);E(i)&&D(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),ge(c,a),Se(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),E(a)&&D(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),ge(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)Se(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else Se(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);E(i)&&D(r),n.unbindTexture()}t.depthBuffer&&Te(t)}function Oe(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(E(a)){let t=O(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),D(t),n.unbindTexture()}}}let ke=[],Ae=[];function je(t){if(t.samples>0){if(Ne(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(ke.length=0,Ae.length=0,ke.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(ke.push(l),Ae.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ae)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ke))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Me(e){return Math.min(i.maxSamples,e.samples)}function Ne(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function F(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function Pe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(K.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&z(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):B(`WebGLTextures: Unsupported texture color space:`,n)),t}function Fe(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=se,this.resetTextureUnits=ie,this.getTextureUnits=ae,this.setTextureUnits=P,this.setTexture2D=le,this.setTexture2DArray=ue,this.setTexture3D=de,this.setTextureCube=fe,this.rebindTextures=Ee,this.setupRenderTarget=De,this.updateRenderTargetMipmap=Oe,this.updateMultisampleRenderTarget=je,this.setupDepthRenderbuffer=Te,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=Ne,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function du(e,t){function n(n,r=``){let i,a=K.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var fu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,pu=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,mu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ha(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Oa({vertexShader:fu,fragmentShader:pu,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pi(new va(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},hu=class extends gt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new mu,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new U,w=null,T=null,E=new Ao;E.viewport=new on;let D=new Ao;D.viewport=new on;let k=[E,D],A=new Wo,j=null,ee=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Bn,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Bn,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Bn,b[e]=t),t.getHandSpace()};function M(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function N(){r.removeEventListener(`select`,M),r.removeEventListener(`selectstart`,M),r.removeEventListener(`selectend`,M),r.removeEventListener(`squeeze`,M),r.removeEventListener(`squeezestart`,M),r.removeEventListener(`squeezeend`,M),r.removeEventListener(`end`,N),r.removeEventListener(`inputsourceschange`,ne);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}j=null,ee=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,fe.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(S.width,S.height,!1),T!==null){let e=T.camera;e.fov=T.fov,e.zoom=T.zoom,e.updateProjectionMatrix(),T=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&z(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&z(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,M),r.addEventListener(`selectstart`,M),r.addEventListener(`selectend`,M),r.addEventListener(`squeeze`,M),r.addEventListener(`squeezestart`,M),r.addEventListener(`squeezeend`,M),r.addEventListener(`end`,N),r.addEventListener(`inputsourceschange`,ne),_.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?oe:ae,a=_.stencil?te:O);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new cn(d.textureWidth,d.textureHeight,{format:ie,type:C,depthTexture:new pa(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new cn(f.framebufferWidth,f.framebufferHeight,{format:ie,type:C,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),fe.setContext(r),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function ne(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let re=new W,P=new W;function se(e,t,n){re.setFromMatrixPosition(t.matrixWorld),P.setFromMatrixPosition(n.matrixWorld);let r=re.distanceTo(P),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ce(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),A.near=D.near=E.near=t,A.far=D.far=E.far=n,(j!==A.near||ee!==A.far)&&(r.updateRenderState({depthNear:A.near,depthFar:A.far}),j=A.near,ee=A.far),A.layers.mask=e.layers.mask|6,E.layers.mask=A.layers.mask&-5,D.layers.mask=A.layers.mask&-3;let i=e.parent,a=A.cameras;ce(A,i);for(let e=0;e<a.length;e++)ce(a[e],i);a.length===2?se(A,E,D):A.projectionMatrix.copy(E.projectionMatrix),T===null&&e.isPerspectiveCamera&&(T={camera:e,fov:e.fov,zoom:e.zoom}),le(e,A,i)};function le(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=bt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(A)},this.getCameraTexture=function(e){return g[e]};let ue=null;function de(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==A.cameras.length&&(A.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=k[n];o===void 0&&(o=new Ao,o.layers.enable(n),o.viewport=new on,k[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(A.matrix.copy(o.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),i===!0&&A.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new ha,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ue&&ue(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let fe=new ss;fe.setAnimationLoop(de),this.setAnimationLoop=function(e){ue=e},this.dispose=function(){}}},gu=new q,_u=new G;_u.set(-1,0,0,0,1,0,0,0,1);function vu(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,wa(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(gu.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(_u),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function yu(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return B(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?z(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):z(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var bu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),xu=null;function Su(){return xu===null&&(xu=new Di(bu,16,16,ce,A),xu.name=`DFG_LUT`,xu.minFilter=b,xu.magFilter=b,xu.wrapS=h,xu.wrapT=h,xu.generateMipmaps=!1,xu.needsUpdate=!0),xu}var Cu=class{constructor(e={}){let{canvas:t=lt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=C}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([ue,le,se]),g=new Set([C,O,E,te,j,ee]),_=new Uint32Array(4),v=new Int32Array(4),y=new W,b=null,x=null,w=[],T=[],D=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let k=this,M=!1,N=null,ne=null,re=null,ie=null;this._outputColorSpace=Qe;let ae=0,oe=0,P=null,ce=-1,de=null,fe=new on,pe=new on,me=null,he=new J(0),ge=0,_e=t.width,ve=t.height,ye=1,be=null,xe=null,Se=new on(0,0,_e,ve),Ce=new on(0,0,_e,ve),we=!1,Te=new Ui,Ee=!1,De=!1,Oe=new q,ke=new W,Ae=new on,je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Me=!1;function Ne(){return P===null?ye:1}let F=n;function Pe(e,n){return t.getContext(e,n)}let Fe,Ie,I,Le,L,R,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,$e,et,tt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,it,!1),t.addEventListener(`webglcontextrestored`,ot,!1),t.addEventListener(`webglcontextcreationerror`,st,!1),F===null){let t=`webgl2`;if(F=Pe(t,e),F===null)throw Pe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}nt()}catch(e){throw t.removeEventListener(`webglcontextlost`,it,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),B(`WebGLRenderer: `+e.message),e}function nt(){Fe=new Vs(F),Fe.init(),$e=new du(F,Fe),Ie=new gs(F,Fe,e,$e),I=new lu(F,Fe),Ie.reversedDepthBuffer&&d&&I.buffers.depth.setReversed(!0),ne=F.createFramebuffer(),re=F.createFramebuffer(),ie=F.createFramebuffer(),Le=new Ws(F),L=new Ul,R=new uu(F,Fe,I,L,Ie,$e,Le),Re=new Bs(k),ze=new cs(F),et=new ms(F,ze),Be=new Hs(F,ze,Le,et),Ve=new Ks(F,Be,ze,et,Le),Ye=new Gs(F,Ie,R),Ke=new _s(L),He=new Hl(k,Re,Fe,Ie,et,Ke),Ue=new vu(k,L),We=new ql,Ge=new eu(Fe),Je=new ps(k,Re,I,Ve,p,s),qe=new cu(k,Ve,Ie),tt=new yu(F,Le,Ie,I),Xe=new hs(F,Fe,Le),Ze=new Us(F,Fe,Le),Le.programs=He.programs,k.capabilities=Ie,k.extensions=Fe,k.properties=L,k.renderLists=We,k.shadowMap=qe,k.state=I,k.info=Le}m!==1009&&(D=new Js(m,t.width,t.height,o,r,i));let rt=new hu(k,F);this.xr=rt,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let e=Fe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Fe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ye},this.setPixelRatio=function(e){e!==void 0&&(ye=e,this.setSize(_e,ve,!1))},this.getSize=function(e){return e.set(_e,ve)},this.setSize=function(e,n,r=!0){rt.isPresenting?z(`WebGLRenderer: Can't change size while VR device is presenting.`):(_e=e,ve=n,t.width=Math.floor(e*ye),t.height=Math.floor(n*ye),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),D!==null&&D.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(_e*ye,ve*ye).floor()},this.setDrawingBufferSize=function(e,n,r){_e=e,ve=n,ye=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)B(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){z(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}D.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(fe)},this.getViewport=function(e){return e.copy(Se)},this.setViewport=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),I.viewport(fe.copy(Se).multiplyScalar(ye).round())},this.getScissor=function(e){return e.copy(Ce)},this.setScissor=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),I.scissor(pe.copy(Ce).multiplyScalar(ye).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(e){I.setScissorTest(we=e)},this.setOpaqueSort=function(e){be=e},this.setTransparentSort=function(e){xe=e},this.getClearColor=function(e){return e.copy(Je.getClearColor())},this.setClearColor=function(){Je.setClearColor(...arguments)},this.getClearAlpha=function(){return Je.getClearAlpha()},this.setClearAlpha=function(){Je.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(P!==null){let t=P.texture.format;e=h.has(t)}if(e){let e=P.texture.type,t=g.has(e),n=Je.getClearColor(),r=Je.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,F.clearBufferuiv(F.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,F.clearBufferiv(F.COLOR,0,v))}else r|=F.COLOR_BUFFER_BIT}t&&(r|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&F.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),N=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,it,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),Je.dispose(),We.dispose(),Ge.dispose(),L.dispose(),Re.dispose(),Ve.dispose(),et.dispose(),tt.dispose(),He.dispose(),rt.dispose(),rt.removeEventListener(`sessionstart`,_t),rt.removeEventListener(`sessionend`,vt),yt.stop()};function it(e){e.preventDefault(),dt(`WebGLRenderer: Context Lost.`),M=!0}function ot(){dt(`WebGLRenderer: Context Restored.`),M=!1;let e=Le.autoReset,t=qe.enabled,n=qe.autoUpdate,r=qe.needsUpdate,i=qe.type;nt(),Le.autoReset=e,qe.enabled=t,qe.autoUpdate=n,qe.needsUpdate=r,qe.type=i}function st(e){B(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ct(e){let t=e.target;t.removeEventListener(`dispose`,ct),ut(t)}function ut(e){ft(e),L.remove(e)}function ft(e){let t=L.get(e).programs;t!==void 0&&(t.forEach(function(e){He.releaseProgram(e)}),e.isShaderMaterial&&He.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=je);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=Ot(e,t,n,r,i);I.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Be.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;et.setup(i,r,s,n,c);let h,g=Xe;if(c!==null&&(h=ze.get(c),g=Ze,g.setIndex(h)),i.isMesh)r.wireframe===!0?(I.setLineWidth(r.wireframeLinewidth*Ne()),g.setMode(F.LINES)):g.setMode(F.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),I.setLineWidth(e*Ne()),i.isLineSegments?g.setMode(F.LINES):i.isLineLoop?g.setMode(F.LINE_LOOP):g.setMode(F.LINE_STRIP)}else i.isPoints?g.setMode(F.POINTS):i.isSprite&&g.setMode(F.TRIANGLES);if(i.isBatchedMesh){if(Fe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ze.get(c).bytesPerElement:1,o=L.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(F,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function pt(e,t,n,r){N!==null&&e.isNodeMaterial&&N.setObject(r,e),Ee===!0&&Ke.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,wt(e,t,r),e.side=0,e.needsUpdate=!0,wt(e,t,r),e.side=2):wt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),N!==null&&N.renderStart(e,t,n),x=Ge.get(n),x.init(t),T.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),N!==null&&N.updateLights(x.state.lightsArray),De=this.localClippingEnabled,Ee=Ke.init(this.clippingPlanes,De),Ee===!0&&Ke.setGlobalState(this.clippingPlanes,t),N!==null&&qe.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];pt(o,n,t,e),r.add(o)}else pt(i,n,t,e),r.add(i)}}),x=T.pop(),N!==null&&N.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=L.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Fe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ht=null;function gt(e){ht&&ht(e)}function _t(){yt.stop()}function vt(){yt.start()}let yt=new ss;yt.setAnimationLoop(gt),typeof self<`u`&&yt.setContext(self),this.setAnimationLoop=function(e){ht=e,rt.setAnimationLoop(e),e===null?yt.stop():yt.start()},rt.addEventListener(`sessionstart`,_t),rt.addEventListener(`sessionend`,vt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){B(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(M===!0)return;N!==null&&N.renderStart(e,t);let n=rt.enabled===!0&&rt.isPresenting===!0,r=D!==null&&(P===null||n)&&D.begin(k,P);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),rt.enabled===!0&&rt.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(rt.cameraAutoUpdate===!0&&rt.updateCamera(t),t=rt.getCamera()),e.isScene===!0&&e.onBeforeRender(k,e,t,P),x=Ge.get(e,T.length),x.init(t),x.state.textureUnits=R.getTextureUnits(),T.push(x),Oe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Te.setFromProjectionMatrix(Oe,at,t.reversedDepth),De=this.localClippingEnabled,Ee=Ke.init(this.clippingPlanes,De),b=We.get(e,w.length),b.init(),w.push(b),rt.enabled===!0&&rt.isPresenting===!0){let e=k.xr.getDepthSensingMesh();e!==null&&bt(e,t,-1/0,k.sortObjects)}bt(e,t,0,k.sortObjects),b.finish(),N!==null&&N.updateLights(x.state.lightsArray),k.sortObjects===!0&&b.sort(be,xe),Me=rt.enabled===!1||rt.isPresenting===!1||rt.hasDepthSensing()===!1,Me&&Je.addToRenderList(b,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ee===!0&&Ke.beginShadows();let i=x.state.shadowsArray;if(qe.render(i,e,t),Ee===!0&&Ke.endShadows(),(r&&D.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];V(n,r,e,a)}Me&&Je.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];xt(b,e,n,n.viewport)}}else r.length>0&&V(n,r,e,t),Me&&Je.render(e),xt(b,e,t)}P!==null&&oe===0&&(R.updateMultisampleRenderTarget(P),R.updateRenderTargetMipmap(P)),r&&D.end(k),e.isScene===!0&&e.onAfterRender(k,e,t),et.resetDefaultState(),ce=-1,de=null,T.pop(),T.length>0?(x=T[T.length-1],R.setTextureUnits(x.state.textureUnits),Ee===!0&&Ke.setGlobalState(k.clippingPlanes,x.state.camera)):x=null,w.pop(),b=w.length>0?w[w.length-1]:null,N!==null&&N.renderEnd()};function bt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Te)){r&&Ae.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Oe);let i=Ve.update(e),a=e.material;a.visible&&b.push(e,i,a,n,Ae.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Te))){let i=Ve.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Ae.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Ae.copy(e.boundingSphere.center)),Ae.applyMatrix4(e.matrixWorld).applyMatrix4(Oe)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,Ae.z,s,t)}}else a.visible&&b.push(e,i,a,n,Ae.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)bt(i[e],t,n,r)}function xt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),Ee===!0&&Ke.setGlobalState(k.clippingPlanes,n),r&&I.viewport(fe.copy(r)),i.length>0&&St(i,t,n),a.length>0&&St(a,t,n),o.length>0&&St(o,t,n),I.buffers.depth.setTest(!0),I.buffers.depth.setMask(!0),I.buffers.color.setMask(!0),I.setPolygonOffset(!1)}function V(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=Fe.has(`EXT_color_buffer_half_float`)||Fe.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new cn(1,1,{generateMipmaps:!0,type:e?A:C,minFilter:S,samples:Math.max(4,Ie.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:K.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||fe;a.setSize(o.z*k.transmissionResolutionScale,o.w*k.transmissionResolutionScale);let s=k.getRenderTarget(),c=k.getActiveCubeFace(),l=k.getActiveMipmapLevel();k.setRenderTarget(a),k.getClearColor(he),ge=k.getClearAlpha(),ge<1&&k.setClearColor(16777215,.5),k.clear(),Me&&Je.render(n);let u=k.toneMapping;k.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),Ee===!0&&Ke.setGlobalState(k.clippingPlanes,r),St(e,n,r),R.updateMultisampleRenderTarget(a),R.updateRenderTargetMipmap(a),Fe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(R.updateMultisampleRenderTarget(a),R.updateRenderTargetMipmap(a))}k.setRenderTarget(s,c,l),k.setClearColor(he,ge),d!==void 0&&(r.viewport=d),k.toneMapping=u}function St(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Ct(o,t,n,s,l,c)}}function Ct(e,t,n,r,i,a){N!==null&&i.isNodeMaterial&&N.setObject(e,i),e.onBeforeRender(k,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(k,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,k.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,k.renderBufferDirect(n,t,r,i,e,a),i.side=2):k.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(k,t,n,r,i,a)}function wt(e,t,n){t.isScene!==!0&&(t=je);let r=L.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=He.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=He.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Re.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ct),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Et(e,s),d}else s.uniforms=He.getUniforms(e),N!==null&&e.isNodeMaterial&&N.build(e,n,s),e.onBeforeCompile(s,k),d=He.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ke.uniform),Et(e,s),r.needsLights=At(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function Tt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=tl.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Et(e,t){let n=L.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Dt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function Ot(e,t,n,r,i){t.isScene!==!0&&(t=je),R.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=P===null?k.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:K.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Re.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(h=k.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=L.get(r),y=x.state.lights;if(Ee===!0&&(De===!0||e!==de)){let t=e===de&&r.id===ce;Ke.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ke.numPlanes||v.numIntersection!==Ke.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=wt(r,t,i),N&&r.isNodeMaterial&&N.onUpdateProgram(r,S,v));let C=!1,w=!1,T=!1,E=S.getUniforms(),D=v.uniforms;if(I.useProgram(S.program)&&(C=!0,w=!0,T=!0),r.id!==ce&&(ce=r.id,w=!0),v.needsLights){let e=Dt(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||de!==e){I.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),E.setValue(F,`projectionMatrix`,e.projectionMatrix),E.setValue(F,`viewMatrix`,e.matrixWorldInverse);let t=E.map.cameraPosition;t!==void 0&&t.setValue(F,ke.setFromMatrixPosition(e.matrixWorld)),Ie.logarithmicDepthBuffer&&E.setValue(F,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&E.setValue(F,`isOrthographic`,e.isOrthographicCamera===!0),de!==e&&(de=e,w=!0,T=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&E.setValue(F,`sunShadowMap`,y.state.sunShadowMap,R),y.state.directionalShadowMap.length>0&&E.setValue(F,`directionalShadowMap`,y.state.directionalShadowMap,R),y.state.spotShadowMap.length>0&&E.setValue(F,`spotShadowMap`,y.state.spotShadowMap,R),y.state.pointShadowMap.length>0&&E.setValue(F,`pointShadowMap`,y.state.pointShadowMap,R)),i.isSkinnedMesh){E.setOptional(F,i,`bindMatrix`),E.setOptional(F,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),E.setValue(F,`boneTexture`,e.boneTexture,R))}i.isBatchedMesh&&(E.setOptional(F,i,`batchingTexture`),E.setValue(F,`batchingTexture`,i._matricesTexture,R),E.setOptional(F,i,`batchingIdTexture`),E.setValue(F,`batchingIdTexture`,i._indirectTexture,R),E.setOptional(F,i,`batchingColorTexture`),i._colorsTexture!==null&&E.setValue(F,`batchingColorTexture`,i._colorsTexture,R));let O=n.morphAttributes;if((O.position!==void 0||O.normal!==void 0||O.color!==void 0)&&Ye.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,E.setValue(F,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(D.envMapIntensity.value=t.environmentIntensity),D.dfgLUT!==void 0&&(D.dfgLUT.value=Su()),w){if(E.setValue(F,`toneMappingExposure`,k.toneMappingExposure),v.needsLights&&kt(D,T),a&&r.fog===!0&&Ue.refreshFogUniforms(D,a),Ue.refreshMaterialUniforms(D,r,ye,ve,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;D.probesSH.value=e.texture,D.probesMin.value.copy(e.boundingBox.min),D.probesMax.value.copy(e.boundingBox.max),D.probesResolution.value.copy(e.resolution)}tl.upload(F,Tt(v),D,R)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(tl.upload(F,Tt(v),D,R),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&E.setValue(F,`center`,i.center),E.setValue(F,`modelViewMatrix`,i.modelViewMatrix),E.setValue(F,`normalMatrix`,i.normalMatrix),E.setValue(F,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];tt.update(n,S),tt.bind(n,S)}}return S}function kt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function At(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return ae},this.getActiveMipmapLevel=function(){return oe},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(e,t,n){let r=L.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),L.get(e.texture).__webglTexture=t,L.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=L.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){P=e,ae=t,oe=n;let r=null,i=!1,a=!1;if(e){let o=L.get(e);if(o.__useDefaultFramebuffer!==void 0){I.bindFramebuffer(F.FRAMEBUFFER,o.__webglFramebuffer),fe.copy(e.viewport),pe.copy(e.scissor),me=e.scissorTest,I.viewport(fe),I.scissor(pe),I.setScissorTest(me),ce=-1;return}if(o.__webglFramebuffer===void 0)R.setupRenderTarget(e);else if(o.__hasExternalTextures)R.rebindTextures(e,L.get(e.texture).__webglTexture,L.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&L.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);R.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=L.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&R.useMultisampledRTT(e)===!1?L.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,fe.copy(e.viewport),pe.copy(e.scissor),me=e.scissorTest}else fe.copy(Se).multiplyScalar(ye).floor(),pe.copy(Ce).multiplyScalar(ye).floor(),me=we;if(n!==0&&(r=ne),I.bindFramebuffer(F.FRAMEBUFFER,r)&&I.drawBuffers(e,r),I.viewport(fe),I.scissor(pe),I.setScissorTest(me),i){let r=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=L.get(e.textures[t]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,t.__webglTexture,n)}ce=-1};function jt(e){let t=L.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Ie.textureFormatReadable(e.format),t.__typeReadable=Ie.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){B(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){I.bindFramebuffer(F.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let u=jt(o);if(u.__formatReadable===!1){B(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){B(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&F.readPixels(t,n,r,i,$e.convert(c),$e.convert(l),a)}finally{let e=P===null?null:L.get(P).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){I.bindFramebuffer(F.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let d=jt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.bufferData(F.PIXEL_PACK_BUFFER,a.byteLength,F.STREAM_READ),F.readPixels(t,n,r,i,$e.convert(l),$e.convert(u),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let p=P===null?null:L.get(P).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,p);let m=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await mt(F,m,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,a),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(f),F.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;R.setTexture2D(e,0),F.copyTexSubImage2D(F.TEXTURE_2D,n,0,0,o,s,i,a),I.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=$e.convert(t.format),_=$e.convert(t.type),v;t.isData3DTexture?(R.setTexture3D(t,0),v=F.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(R.setTexture2DArray(t,0),v=F.TEXTURE_2D_ARRAY):(R.setTexture2D(t,0),v=F.TEXTURE_2D),I.activeTexture(F.TEXTURE0),I.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(F.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(F.UNPACK_ROW_LENGTH),b=I.getParameter(F.UNPACK_IMAGE_HEIGHT),x=I.getParameter(F.UNPACK_SKIP_PIXELS),S=I.getParameter(F.UNPACK_SKIP_ROWS),C=I.getParameter(F.UNPACK_SKIP_IMAGES);I.pixelStorei(F.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(F.UNPACK_SKIP_PIXELS,l),I.pixelStorei(F.UNPACK_SKIP_ROWS,u),I.pixelStorei(F.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=L.get(e),r=L.get(t),h=L.get(n.__renderTarget),g=L.get(r.__renderTarget);I.bindFramebuffer(F.READ_FRAMEBUFFER,h.__webglFramebuffer),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(e).__webglTexture,i,d+n),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(t).__webglTexture,a,m+n)),F.blitFramebuffer(l,u,o,s,f,p,o,s,F.DEPTH_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||L.has(e)){let n=L.get(e),r=L.get(t);I.bindFramebuffer(F.READ_FRAMEBUFFER,re),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,ie);for(let e=0;e<c;e++)w?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,n.__webglTexture,i),T?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,r.__webglTexture,a),i===0?T?F.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):F.copyTexSubImage2D(v,a,f,p,l,u,o,s):F.blitFramebuffer(l,u,o,s,f,p,o,s,F.COLOR_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?F.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(F.UNPACK_ROW_LENGTH,y),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(F.UNPACK_SKIP_PIXELS,x),I.pixelStorei(F.UNPACK_SKIP_ROWS,S),I.pixelStorei(F.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&F.generateMipmap(v),I.unbindTexture()},this.initRenderTarget=function(e){L.get(e).__webglFramebuffer===void 0&&R.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?R.setTextureCube(e,0):e.isData3DTexture?R.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?R.setTexture2DArray(e,0):R.setTexture2D(e,0),I.unbindTexture()},this.resetState=function(){ae=0,oe=0,P=null,I.reset(),et.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return at}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=K._getDrawingBufferColorSpace(e),t.unpackColorSpace=K._getUnpackColorSpace()}},wu={nod:1.25,wave:2.8,think:3,headpat:2.4,poke:2};function Tu(e){if(!e.length)return 0;let t=0;for(let n of e)t+=Number.isFinite(n)?n*n:0;return Math.sqrt(t/e.length)}function Eu(e){return Math.min(1,Math.max(0,(e-.002)*55))}function Du(e){if(!e.length)return{low:0,mid:0,high:0};let t=e.length,n=Math.max(1,Math.floor(t*.14)),r=Math.max(n+1,Math.floor(t*.45)),i=Math.max(r+1,Math.floor(t*.85)),a=0,o=0,s=0;for(let t=0;t<n;t++)a+=e[t];for(let t=n;t<r;t++)o+=e[t];for(let t=r;t<i;t++)s+=e[t];return{low:a/(n*255),mid:o/((r-n)*255),high:s/((i-r)*255)}}var Ou=class{connected=!1;turn=``;phase=`idle`;hasScreen=!1;audio=!1;mouth=0;interruptedUntil=0;gesture=null;gazeX=0;gazeY=0;gazeTargetX=0;gazeTargetY=0;setConnected(e){this.connected=e,e||this.reset()}begin(e,t){this.turn=e,this.phase=`pending`,this.hasScreen=t,this.audio=!1,this.mouth=0,this.interruptedUntil=0,this.gesture=null}text(e){e===this.turn&&this.phase===`pending`&&(this.phase=`replying`)}complete(e){e===this.turn&&this.phase!==`cancelled`&&this.phase!==`failed`&&(this.phase=`complete`)}interrupt(e,t){e===this.turn&&(this.phase=`cancelled`,this.audio=!1,this.mouth=0,this.interruptedUntil=t+.65,this.gesture=null)}fail(e){e===this.turn&&(this.phase=`failed`,this.audio=!1,this.mouth=0,this.gesture=null)}playback(e){this.audio=e&&this.connected&&this.phase!==`cancelled`&&this.phase!==`failed`,this.audio||(this.mouth=0)}replay(){this.phase=`complete`,this.interruptedUntil=0,this.audio=!1,this.mouth=0}act(e,t){this.gesture={type:e,started:t}}look(e,t){this.gazeTargetX=Math.max(-1,Math.min(1,e)),this.gazeTargetY=Math.max(-1,Math.min(1,t))}reset(){this.turn=``,this.phase=`idle`,this.audio=!1,this.mouth=0,this.interruptedUntil=0,this.gesture=null,this.hasScreen=!1}frame(e,t,n,r=!1){let i=this.connected?this.phase===`failed`?`error`:e<this.interruptedUntil?`interrupted`:this.audio?`speaking`:this.phase===`pending`?this.hasScreen?`looking`:`thinking`:this.phase===`replying`?`replying`:`idle`:`offline`,a=i===`speaking`?Eu(n):0,o=Math.min(.1,Math.max(0,t));i===`speaking`?this.mouth+=(a-this.mouth)*(1-Math.exp(-o/(a>this.mouth?.025:.07))):this.mouth=0;let s=1-Math.exp(-o*9);this.gazeX+=(this.gazeTargetX-this.gazeX)*s,this.gazeY+=(this.gazeTargetY-this.gazeY)*s;let c=e%4.7,l=r||c>.16?0:Math.sin(c/.16*Math.PI),u=this.gesture?wu[this.gesture.type]:1.25,d=this.gesture?Math.min(1,Math.max(0,(e-this.gesture.started)/u)):0;d>=1&&(this.gesture=null);let f=this.gesture===null?i===`speaking`?.12:0:this.gesture.type===`headpat`?.92:this.gesture.type===`wave`||this.gesture.type===`poke`?.72:this.gesture.type===`think`?.08:.52;return{mood:i,mouth:this.mouth,blink:l,gazeX:r?0:this.gazeX,gazeY:r?0:this.gazeY,breath:r?0:Math.sin(e*1.8)*.028,gesture:this.gesture?.type??null,gestureProgress:d,happy:f}}},ku=`/ui/assets/nazuna-avatar-Bx05Di5l.webp`;function Au(e){let t=new Set,n=new Set,r=new Set;e.traverse(e=>{if(e instanceof pi){t.add(e.geometry);for(let t of Array.isArray(e.material)?e.material:[e.material]){n.add(t);for(let e of Object.values(t))e instanceof an&&r.add(e)}}}),r.forEach(e=>e.dispose()),n.forEach(e=>e.dispose()),t.forEach(e=>e.dispose()),e.removeFromParent()}var ju={offline:8819371,idle:11114216,thinking:8746480,looking:2082782,replying:8097023,speaking:16732064,interrupted:15219486,error:15219486};function Mu(){let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`);if(t){let e=t.createRadialGradient(128,128,8,128,128,128);e.addColorStop(0,`rgba(255, 255, 255, 0.72)`),e.addColorStop(.42,`rgba(210, 195, 255, 0.28)`),e.addColorStop(1,`rgba(210, 195, 255, 0)`),t.fillStyle=e,t.fillRect(0,0,256,256)}let n=new fa(e);return n.colorSpace=Qe,n}var Nu=class{is2dPortrait=!0;root=new Rn;stageGroup=new Rn;spriteMesh;spriteMat;haloGroup=new Rn;outerRing;innerRing;glowMesh;ringMat;innerRingMat;glowMat;currentColor=new J(ju.idle);targetColor=new J(ju.idle);baseY=1.26;elapsed=0;constructor(){this.root.add(this.haloGroup),this.root.add(this.stageGroup),this.haloGroup.position.set(0,1.82,-.22),this.ringMat=new ti({color:ju.idle,transparent:!0,opacity:.26,depthWrite:!1,toneMapped:!1}),this.outerRing=new pi(new ya(1.16,1.182,72),this.ringMat),this.haloGroup.add(this.outerRing),this.innerRingMat=new ti({color:16777215,transparent:!0,opacity:.16,depthWrite:!1,toneMapped:!1}),this.innerRing=new pi(new ya(.84,.855,64),this.innerRingMat),this.haloGroup.add(this.innerRing),this.glowMat=new ti({map:Mu(),color:ju.idle,transparent:!0,opacity:.22,depthWrite:!1,toneMapped:!1}),this.glowMesh=new pi(new va(3.2,3.2),this.glowMat),this.glowMesh.position.z=-.06,this.haloGroup.add(this.glowMesh);let e=new go().load(ku,e=>{e.needsUpdate=!0,this.spriteMat.needsUpdate=!0});e.colorSpace=Qe,e.anisotropy=4,e.minFilter=S,e.magFilter=b,this.spriteMat=new ti({map:e,transparent:!0,alphaTest:.015,depthWrite:!1,toneMapped:!1}),this.spriteMesh=new pi(new va(2.3055,3.48),this.spriteMat),this.stageGroup.position.set(0,this.baseY,0),this.stageGroup.add(this.spriteMesh)}update(e,t,n){this.elapsed+=t;let r=e.gestureProgress,i=e.gesture?Math.sin(Math.PI*r):0,a=e.gesture===`nod`?(n?.06:Math.sin(r*Math.PI*4)*.095)*i:e.gesture===`headpat`?(n?.05:.06+Math.sin(r*Math.PI*3)**2*.05)*i:0,o=e.gesture===`nod`?(n?-.03:-Math.abs(Math.sin(r*Math.PI*2))*.055)*i:e.gesture===`headpat`?(n?-.04:-(.035+Math.sin(r*Math.PI*3)**2*.04))*i:0,s=e.gesture===`wave`?(n?-.045:Math.sin(r*Math.PI*5)*.065)*i:e.gesture===`think`?.055*i:e.gesture===`poke`?(n?-.05:-Math.sin(r*Math.PI*3)*.085)*i:0,c=e.gesture===`wave`?(n?.04:Math.abs(Math.sin(r*Math.PI*3))*.075)*i:e.gesture===`poke`?(n?.02:Math.sin(r*Math.PI)*.045)*i:0,l=e.mood===`speaking`?e.mouth*.048:0,u=e.mood===`speaking`?e.mouth*.022:0,d=n?0:e.breath*.85,f=n?0:e.gazeX*.095,p=e.mood===`thinking`?.028:e.mood===`looking`?-.026:0;this.stageGroup.position.set(f,this.baseY+d+o+c+l,0),this.stageGroup.rotation.set((n?0:e.gazeY*.055)+a,n?0:e.gazeX*.13,p+s);let m=1+(n?0:e.breath*.12)+u*.6,h=1+(n?0:e.breath*.25)+u;this.stageGroup.scale.set(m,h,1),this.targetColor.setHex(ju[e.mood]),this.currentColor.lerp(this.targetColor,Math.min(1,t*5.5)),this.ringMat.color.copy(this.currentColor),this.glowMat.color.copy(this.currentColor);let g=e.mood===`speaking`?e.mouth:e.gesture?i*.45:0,_=1+g*.22+(n?0:Math.sin(this.elapsed*1.4)*.018);this.outerRing.scale.set(_,_,1),this.innerRing.scale.set(1+g*.14,1+g*.14,1),this.glowMesh.scale.set(1+g*.28,1+g*.28,1),this.ringMat.opacity=.22+g*.56,this.innerRingMat.opacity=.12+g*.34,this.glowMat.opacity=.18+g*.38,this.haloGroup.position.x=-f*.45}dispose(){Au(this.root)}},Pu=`
attribute vec2 position;
attribute vec2 uv;
uniform vec4 view; // scale x, scale y, offset x, offset y
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position * view.xy + view.zw, 0.0, 1.0);
}`,Fu=`
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`,Iu=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`,Lu=`
uniform sampler2D destination;
uniform vec2 targetSize;
uniform int colorBlend;
uniform int alphaBlend;

float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }

vec3 clipColor(vec3 c) {
  float l = lum(c);
  float n = min(c.r, min(c.g, c.b));
  float x = max(c.r, max(c.g, c.b));
  if (n < 0.0) c = l + (c - l) * l / (l - n);
  if (x > 1.0) c = l + (c - l) * (1.0 - l) / (x - l);
  return c;
}

vec3 setLum(vec3 c, float l) { return clipColor(c + (l - lum(c))); }

float sat(vec3 c) { return max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b)); }

vec3 setSat(vec3 c, float s) {
  float lo = min(c.r, min(c.g, c.b));
  float hi = max(c.r, max(c.g, c.b));
  return hi > lo ? (c - lo) * s / (hi - lo) : vec3(0.0);
}

// W3C HardLight(Cb, Cs): multiply below one half, screen above.
float hardLight(float b, float s) {
  if (s <= 0.5) return b * 2.0 * s;
  float t = 2.0 * s - 1.0;
  return b + t - b * t;
}

float softLightD(float b) { return b <= 0.25 ? ((16.0 * b - 12.0) * b + 4.0) * b : sqrt(b); }

// The separable blend function B(Cb, Cs) of the color blend mode.
float separable(float b, float s) {
  if (colorBlend == 1 || colorBlend == 3 || colorBlend == 4) return min(1.0, b + s);
  if (colorBlend == 2 || colorBlend == 6) return b * s;
  if (colorBlend == 5) return min(b, s);
  if (colorBlend == 7) return b >= 1.0 ? 1.0 : (s <= 0.0 ? 0.0 : 1.0 - min(1.0, (1.0 - b) / s));
  if (colorBlend == 8) return max(0.0, b + s - 1.0);
  if (colorBlend == 9) return max(b, s);
  if (colorBlend == 10) return b + s - b * s;
  if (colorBlend == 11) return b <= 0.0 ? 0.0 : (s >= 1.0 ? 1.0 : min(1.0, b / (1.0 - s)));
  if (colorBlend == 12) return hardLight(s, b);
  if (colorBlend == 13) return s <= 0.5 ? b - (1.0 - 2.0 * s) * b * (1.0 - b) : b + (2.0 * s - 1.0) * (softLightD(b) - b);
  if (colorBlend == 14) return hardLight(b, s);
  if (colorBlend == 15) return clamp(b + 2.0 * s - 1.0, 0.0, 1.0);
  return s;
}

vec3 blendColor(vec3 b, vec3 s) {
  if (colorBlend == 16) return setLum(setSat(s, sat(b)), lum(b));
  if (colorBlend == 17) return setLum(s, lum(b));
  return vec3(separable(b.r, s.r), separable(b.g, s.g), separable(b.b, s.b));
}

vec4 composite(vec4 s) {
  vec4 d = texture2D(destination, gl_FragCoord.xy / targetSize);
  vec4 o;
  if (colorBlend == 1) {
    o = vec4(s.rgb + d.rgb, d.a);
  } else if (colorBlend == 2) {
    o = vec4(s.rgb * d.rgb + d.rgb * (1.0 - s.a), d.a);
  } else if (colorBlend == 0 && alphaBlend == 0) {
    o = s + d * (1.0 - s.a);
  } else {
    float sa = s.a, da = d.a;
    vec3 cs = sa > 0.0 ? clamp(s.rgb / sa, 0.0, 1.0) : vec3(0.0);
    vec3 cb = da > 0.0 ? clamp(d.rgb / da, 0.0, 1.0) : vec3(0.0);
    // How much of the source overlaps the destination, by the alpha mode's coverage model.
    float p = alphaBlend == 3 ? min(sa, da) : (alphaBlend == 4 ? max(sa + da - 1.0, 0.0) : sa * da);
    float w = sa > 0.0 ? p / sa : 0.0;
    vec3 m = (1.0 - w) * cs + w * blendColor(cb, cs);
    // Porter-Duff factors: over, atop, out (the source erases), conjoint and disjoint over.
    float fa = 1.0, fb = 1.0 - sa;
    if (alphaBlend == 1) fa = da;
    else if (alphaBlend == 2) fa = 0.0;
    else if (alphaBlend == 3) fb = (da <= 0.0 || sa >= da) ? 0.0 : 1.0 - sa / da;
    else if (alphaBlend == 4) fb = da <= 0.0 ? 0.0 : min(1.0, (1.0 - sa) / da);
    o = vec4(sa * fa * m + da * fb * cb, sa * fa + da * fb);
  }
  return clamp(o, 0.0, 1.0);
}
`,Ru=`
uniform sampler2D tex;
uniform vec3 multiply;
uniform vec3 screen;
uniform float opacity;
uniform float maskThreshold; // above zero: draw as a mask, keeping only covered pixels
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tex, vUv);
  if (maskThreshold > 0.0) {
    if (c.a < maskThreshold) discard;
    gl_FragColor = vec4(0.0);
    return;
  }
  c.rgb *= multiply;
  c.rgb += screen * c.a - c.rgb * screen;
  c *= opacity;
#ifdef COMPOSITE
  gl_FragColor = composite(c);
#else
  gl_FragColor = c;
#endif
}`,zu=`
uniform sampler2D layer;
uniform vec2 layerSize;
uniform vec3 multiply;
uniform vec3 screen;
uniform float opacity;
void main() {
  vec4 l = texture2D(layer, gl_FragCoord.xy / layerSize) * opacity;
  vec3 c = l.a > 0.0 ? clamp(l.rgb / l.a, 0.0, 1.0) : vec3(0.0);
  c *= multiply;
  c = c + screen - c * screen;
  vec4 s = vec4(c * l.a, l.a);
#ifdef COMPOSITE
  gl_FragColor = composite(s);
#else
  gl_FragColor = s;
#endif
}`;function Bu(e,t){return e===1||e===2||e===0&&t===0}var Vu=class e{static async create(t,n,r){let[i,a]=await Promise.all([fetch(n).then(e=>e.arrayBuffer()),fetch(r).then(e=>e.arrayBuffer())]),{instance:o}=await WebAssembly.instantiate(i,{}),s=new e(t,o.exports,new Uint8Array(a));return await s.loadTextures(),s.start(),s}static async fromBytes(t,n,r){let i=new e(t,n,r);return await i.loadTextures(),i}constructor(e,t,n){this.canvas=e,this.rt=t;let r=t.p2l_alloc(n.length);new Uint8Array(t.memory.buffer,r,n.length).set(n);let i=t.p2l_alloc(512);if(this.rig=t.p2l_rig_load(r,n.length,i,512),t.p2l_dealloc(r,n.length),!this.rig){let e=this.string(i);throw t.p2l_dealloc(i,512),Error(`The rig could not be loaded: `+e)}t.p2l_dealloc(i,512),t.p2l_behaviors(this.rig,7);let a=t.p2l_alloc(8);t.p2l_canvas(this.rig,a,a+4),[this.width,this.height]=new Float32Array(t.memory.buffer,a,2),t.p2l_dealloc(a,8),this.clips=this.list(t.p2l_clip_count,t.p2l_clip_id),this.parameters=this.list(t.p2l_parameter_count,t.p2l_parameter_id),this.expressions=this.list(t.p2l_expression_count,t.p2l_expression_id),this.hitAreas=this.list(t.p2l_hit_area_count,t.p2l_hit_area_id),this.advancedFeatures=t.p2l_advanced_available(this.rig),this.meshes=[];let o=t.p2l_mesh_count(this.rig),s=t.p2l_alloc(16);for(let e=0;e<o;e++){let n=t.p2l_mesh_vertex_count(this.rig,e),r=t.p2l_mesh_indices(this.rig,e,s),i=new Uint32Array(t.memory.buffer,s,1)[0],a=t.p2l_mesh_blend(this.rig,e,s+4),o=new Uint8Array(t.memory.buffer,s+4,1)[0]!==0,c=t.p2l_mesh_alpha_blend(this.rig,e),l=this.indices((n,r,i)=>t.p2l_mesh_masks(this.rig,e,n,r,i),!0);this.meshes.push({vertices:n,uvs:new Float32Array(new Float32Array(t.memory.buffer,t.p2l_mesh_uvs(this.rig,e),n*2)),indices:new Uint32Array(new Uint32Array(t.memory.buffer,r,i)),texture:t.p2l_mesh_texture(this.rig,e),blend:a,alphaBlend:c,culling:o,fixed:Bu(a,c),masks:l.list,invertMask:l.inverted})}this.groups=[];let c=t.p2l_part_count(this.rig);for(let e=0;e<c;e++){t.p2l_part_group(this.rig,e,s,s+4,s+8);let[n,r]=new Int32Array(t.memory.buffer,s,2),i=new Uint8Array(t.memory.buffer,s+8,1)[0]!==0,a=this.indices((n,r)=>t.p2l_part_masks(this.rig,e,n,r),!1).list;this.groups.push({blend:n,alphaBlend:r,invertMask:i,masks:a,fixed:Bu(n,r)})}t.p2l_dealloc(s,16),this.commandCapacity=o+2*c,this.commandsPointer=t.p2l_alloc(this.commandCapacity*4+4),this.colors=t.p2l_alloc(28),this.meshIds=this.list(t.p2l_mesh_count,t.p2l_mesh_id),this.bones=this.list(t.p2l_bone_count,t.p2l_bone_id),this.view={zoom:1,x:0,y:0},this.setupGl()}indices(e,t){let n=this.rt,r=e(0,0,0),i=n.p2l_alloc(r*4+4);e(i,r,t?i+r*4:0);let a=Array.from(new Uint32Array(n.memory.buffer,i,r)),o=t&&new Uint8Array(n.memory.buffer,i+r*4,1)[0]!==0;return n.p2l_dealloc(i,r*4+4),{list:a,inverted:o}}parameterRanges(){let e=this.rt,t=e.p2l_alloc(12),n=this.parameters.map((n,r)=>{e.p2l_parameter_range(this.rig,r,t,t+4,t+8);let[i,a,o]=new Float32Array(e.memory.buffer,t,3);return{id:n,min:i,max:a,default:o}});return e.p2l_dealloc(t,12),n}parameterValues(){return Array.from(new Float32Array(this.rt.memory.buffer,this.rt.p2l_parameter_current(this.rig),this.parameters.length))}meshVertices(e){return new Float32Array(this.rt.memory.buffer,this.rt.p2l_mesh_vertices(this.rig,e),this.meshes[e].vertices*2)}hitAreaMeshes(e){let t=this.rt.p2l_hit_area_meshes(this.rig,e,0,0),n=this.rt.p2l_alloc(t*4+4);this.rt.p2l_hit_area_meshes(this.rig,e,n,t);let r=Array.from(new Uint32Array(this.rt.memory.buffer,n,t));return this.rt.p2l_dealloc(n,t*4+4),r}boneFrames(){let e=this.rt.p2l_alloc(24),t=[];return this.bones.forEach((n,r)=>{this.rt.p2l_bone_transform(this.rig,r,e)&&t.push({id:n,m:Array.from(new Float32Array(this.rt.memory.buffer,e,6))})}),this.rt.p2l_dealloc(e,24),t}colliders(){let e=this.rt.p2l_sim_colliders(this.rig,0,0);if(e===0)return[];let t=this.rt.p2l_alloc(e*24);this.rt.p2l_sim_colliders(this.rig,t,e);let n=Array.from(new Float32Array(this.rt.memory.buffer,t,e*6));return this.rt.p2l_dealloc(t,e*24),Array.from({length:e},(e,t)=>n.slice(t*6,t*6+6))}poseGroups(){return Array.from({length:this.rt.p2l_pose_group_count(this.rig)},(e,t)=>this.rt.p2l_pose_group_size(this.rig,t))}showPose(e,t){return this.rt.p2l_pose_show(this.rig,e,t)}resetSimulation(){this.rt.p2l_sim_reset(this.rig)}wind(e,t){this.rt.p2l_sim_wind(this.rig,e,t)}behaviors(e){this.rt.p2l_behaviors(this.rig,e)}layout(){let e=this.canvas.getBoundingClientRect(),t=Math.min(e.width/this.width,e.height/this.height)*this.view.zoom;return{scale:t,left:e.width/2+this.view.x-this.width/2*t,top:e.height/2+this.view.y-this.height/2*t,rect:e}}dispose(){this.stop();let e=this.gl;for(let t of this.textures||[])e.deleteTexture(t);for(let t of this.meshes)e.deleteBuffer(t.uvBuffer),e.deleteBuffer(t.indexBuffer);e.deleteBuffer(this.positionBuffer),e.deleteBuffer(this.quadBuffer);for(let t of this.layers)e.deleteFramebuffer(t.framebuffer),e.deleteTexture(t.texture);e.deleteTexture(this.destination),e.deleteRenderbuffer(this.depthStencil);for(let t of Object.values(this.programs))e.deleteProgram(t.program);this.rt.p2l_dealloc(this.commandsPointer,this.commandCapacity*4+4),this.rt.p2l_dealloc(this.colors,28),this.rt.p2l_rig_free(this.rig),this.rig=0}string(e){let t=new Uint8Array(this.rt.memory.buffer,e),n=0;for(;t[n]!==0;)n++;return new TextDecoder().decode(t.subarray(0,n))}list(e,t){return Array.from({length:e(this.rig)},(e,n)=>this.string(t(this.rig,n)))}setupGl(){let e=this.canvas.getContext(`webgl`,{stencil:!0,alpha:!0,premultipliedAlpha:!0});if(!e)throw Error(`WebGL is not available`);let t=e.getExtension(`OES_element_index_uint`)!=null;if(this.indexType=t?e.UNSIGNED_INT:e.UNSIGNED_SHORT,!t)for(let e of this.meshes){let t=e.indices;for(let e=0;e<t.length;e++)if(t[e]>65535)throw Error(`This model needs 32-bit mesh indices, which this browser's WebGL does not provide`);e.indices=new Uint16Array(t)}this.gl=e;let n=(t,n)=>{let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(r));return r},r=(t,r,i)=>{let a=e.createProgram();if(e.attachShader(a,n(e.VERTEX_SHADER,t)),e.attachShader(a,n(e.FRAGMENT_SHADER,Iu+(i?`#define COMPOSITE
`+Lu:``)+r)),e.bindAttribLocation(a,0,`position`),t===Pu&&e.bindAttribLocation(a,1,`uv`),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw Error(e.getProgramInfoLog(a));let o={};for(let t of[`view`,`tex`,`multiply`,`screen`,`opacity`,`maskThreshold`,`layer`,`layerSize`,`destination`,`targetSize`,`colorBlend`,`alphaBlend`])o[t]=e.getUniformLocation(a,t);return e.useProgram(a),o.tex&&e.uniform1i(o.tex,0),o.layer&&e.uniform1i(o.layer,0),o.destination&&e.uniform1i(o.destination,1),{program:a,loc:o}};this.programs={mesh:r(Pu,Ru,!1),meshComposite:r(Pu,Ru,!0),group:r(Fu,zu,!1),groupComposite:r(Fu,zu,!0)},e.enableVertexAttribArray(0),this.positionBuffer=e.createBuffer(),this.quadBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.quadBuffer),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);for(let t of this.meshes)t.uvBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,t.uvBuffer),e.bufferData(e.ARRAY_BUFFER,t.uvs,e.STATIC_DRAW),t.indexBuffer=e.createBuffer(),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.indexBuffer),e.bufferData(e.ELEMENT_ARRAY_BUFFER,t.indices,e.STATIC_DRAW);this.destination=this.targetTexture(),this.depthStencil=e.createRenderbuffer(),this.layers=[],this.targetWidth=0,this.targetHeight=0,this.isolation=!0}targetTexture(){let e=this.gl,t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),t}resizeTargets(e,t){let n=this.gl;this.targetWidth=e,this.targetHeight=t;let r=r=>{n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,e,t,0,n.RGBA,n.UNSIGNED_BYTE,null)};r(this.destination),n.bindRenderbuffer(n.RENDERBUFFER,this.depthStencil),n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,e,t);for(let e of this.layers)r(e.texture),e.used=null}layer(e){let t=this.gl;if(!this.isolation)return null;for(;this.layers.length<=e;){let e=this.targetTexture();t.texImage2D(t.TEXTURE_2D,0,t.RGBA,this.targetWidth,this.targetHeight,0,t.RGBA,t.UNSIGNED_BYTE,null);let n=t.createFramebuffer();t.bindFramebuffer(t.FRAMEBUFFER,n),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,e,0),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.RENDERBUFFER,this.depthStencil);let r=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE;if(t.bindFramebuffer(t.FRAMEBUFFER,null),!r)return t.deleteFramebuffer(n),t.deleteTexture(e),this.isolation=!1,null;this.layers.push({texture:e,framebuffer:n,used:null})}return this.layers[e]}async loadTextures(){let e=this.gl,t=this.rt,n=t.p2l_alloc(16);this.textures=[],e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE);for(let r=0;r<t.p2l_texture_count(this.rig);r++){let i=t.p2l_texture_png(this.rig,r,n,n+8,n+12),a=new Uint32Array(t.memory.buffer,n,1)[0],o=new Uint8Array(t.memory.buffer,i,a).slice(),s=await createImageBitmap(new Blob([o],{type:`image/png`}),{premultiplyAlpha:`premultiply`,colorSpaceConversion:`none`}),c=e.createTexture();e.bindTexture(e.TEXTURE_2D,c),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),this.textures.push(c)}e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.p2l_dealloc(n,16)}play(e){this.rt.p2l_play(this.rig,e==null?-1:this.clips.indexOf(e))}expression(e){this.rt.p2l_expression(this.rig,e==null?-1:this.expressions.indexOf(e))}setAdvanced(e){return this.rt.p2l_set_advanced(this.rig,e)}toRig(e,t){let{scale:n,left:r,top:i,rect:a}=this.layout();return[(e-a.left-r)/n,(t-a.top-i)/n]}hitTest(e,t){let[n,r]=this.toRig(e,t),i=this.rt.p2l_hit_test(this.rig,n,r);return i<0?null:this.hitAreas[i]}lookAt(e,t){this.rt.p2l_look_at(this.rig,e,t)}lipSync(e){this.rt.p2l_behaviors(this.rig,15),this.rt.p2l_lip_sync(this.rig,e)}setParameter(e,t){let n=this.parameters.indexOf(e);n>=0&&this.rt.p2l_set_parameter(this.rig,n,t)}start(){let e=performance.now(),t=n=>{this.update(Math.min((n-e)/1e3,.1)),e=n,this.draw(),this.animation=requestAnimationFrame(t)};this.animation=requestAnimationFrame(t)}stop(){this.animation&&cancelAnimationFrame(this.animation),this.animation=0}update(e){this.rt.p2l_update(this.rig,e)}draw(){let e=this.gl,t=this.rt,n=this.canvas,r=window.devicePixelRatio||1,i=Math.round(n.clientWidth*r),a=Math.round(n.clientHeight*r);if((n.width!==i||n.height!==a)&&(n.width=i,n.height=a),i===0||a===0)return;(this.targetWidth!==i||this.targetHeight!==a)&&this.resizeTargets(i,a),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,i,a),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.clearStencil(0),e.clear(e.COLOR_BUFFER_BIT|e.STENCIL_BUFFER_BIT);let o=Math.min(i/this.width,a/this.height)*this.view.zoom,s=2*o/i,c=-2*o/a,l=2*this.view.x*r/i,u=-2*this.view.y*r/a;this.transform=[s,c,-this.width*s/2+l,-this.height*c/2+u];for(let t of Object.values(this.programs))e.useProgram(t.program),t.loc.view&&e.uniform4f(t.loc.view,...this.transform),t.loc.targetSize&&e.uniform2f(t.loc.targetSize,i,a),t.loc.layerSize&&e.uniform2f(t.loc.layerSize,i,a);this.current=null,e.frontFace(e.CCW),e.cullFace(e.BACK),e.enable(e.SCISSOR_TEST);let d=t.p2l_render_commands(this.rig,this.commandsPointer,this.commandCapacity),f=new Int32Array(t.memory.buffer,this.commandsPointer,Math.min(d,this.commandCapacity)).slice(),p=[{framebuffer:null,used:null}];for(let t of f){let n=p[p.length-1];if(t>=0)this.drawCommand(t,n);else if(t<=-2){let r=this.layer(p.length-1);if(!r){e.bindFramebuffer(e.FRAMEBUFFER,n.framebuffer),p.push({pass:!0,framebuffer:n.framebuffer,used:n.used});continue}e.bindFramebuffer(e.FRAMEBUFFER,r.framebuffer),r.used&&(this.scissor(r.used),e.clear(e.COLOR_BUFFER_BIT)),r.used=null,r.part=-2-t,p.push(r)}else if(p.length>1){let t=p.pop(),n=p[p.length-1];if(t.pass){n.used=t.used;continue}e.bindFramebuffer(e.FRAMEBUFFER,n.framebuffer),this.compositeGroup(t,n)}}e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.CULL_FACE)}use(e){let t=this.programs[e];return this.current!==t&&(this.gl.useProgram(t.program),this.current=t),t.loc}scissor(e){this.gl.scissor(e[0],e[1],e[2]-e[0],e[3]-e[1])}meshRect(e){let t=this.meshVertices(e),[n,r,i,a]=this.transform,o=this.targetWidth,s=this.targetHeight,c=1/0,l=1/0,u=-1/0,d=-1/0;for(let e=0;e<t.length;e+=2){let n=t[e],r=t[e+1];n<c&&(c=n),n>u&&(u=n),r<l&&(l=r),r>d&&(d=r)}if(!(c<=u&&l<=d))return t.length>0&&t.some(e=>!Number.isFinite(e))?[0,0,o,s]:null;let f=e=>(e*n+i+1)/2*o,p=e=>(e*r+a+1)/2*s,m=f(c),h=f(u),g=p(l),_=p(d);return this.clip([Math.floor(Math.min(m,h))-1,Math.floor(Math.min(g,_))-1,Math.ceil(Math.max(m,h))+1,Math.ceil(Math.max(g,_))+1])}clip(e){let t=Math.max(0,e[0]),n=Math.max(0,e[1]),r=Math.min(this.targetWidth,e[2]),i=Math.min(this.targetHeight,e[3]);return t<r&&n<i?[t,n,r,i]:null}touch(e,t){let n=e.used;e.used=n?[Math.min(n[0],t[0]),Math.min(n[1],t[1]),Math.max(n[2],t[2]),Math.max(n[3],t[3])]:t.slice()}copyDestination(e){let t=this.gl;t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.destination),t.copyTexSubImage2D(t.TEXTURE_2D,0,e[0],e[1],e[0],e[1],e[2]-e[0],e[3]-e[1]),t.activeTexture(t.TEXTURE0)}blendFunction(e){let t=this.gl;t.enable(t.BLEND),e===1?t.blendFuncSeparate(t.ONE,t.ONE,t.ZERO,t.ONE):e===2?t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE):t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA)}stencilMasks(e,t,n){let r=this.gl;this.scissor(n),r.enable(r.STENCIL_TEST),r.clear(r.STENCIL_BUFFER_BIT),r.colorMask(!1,!1,!1,!1),r.disable(r.BLEND),r.disable(r.CULL_FACE),r.stencilFunc(r.ALWAYS,1,255),r.stencilOp(r.KEEP,r.KEEP,r.REPLACE),this.use(`mesh`);for(let t of e)this.drawMesh(t,1,.5);r.colorMask(!0,!0,!0,!0),r.stencilFunc(t?r.NOTEQUAL:r.EQUAL,1,255),r.stencilOp(r.KEEP,r.KEEP,r.KEEP)}drawCommand(e,t){let n=this.gl,r=this.rt,i=this.meshes[e],a=r.p2l_mesh_opacity(this.rig,e);if(!(a>0)||!i||!this.textures[i.texture]||i.vertices===0)return;let o=this.meshRect(e);if(!o)return;i.masks.length>0&&this.stencilMasks(i.masks,i.invertMask,o),this.scissor(o);let s;i.fixed?(s=this.use(`mesh`),this.blendFunction(i.blend)):(this.copyDestination(o),s=this.use(`meshComposite`),n.disable(n.BLEND),n.uniform1i(s.colorBlend,i.blend),n.uniform1i(s.alphaBlend,i.alphaBlend)),i.culling?n.enable(n.CULL_FACE):n.disable(n.CULL_FACE),r.p2l_mesh_colors(this.rig,e,this.colors,this.colors+12);let c=new Float32Array(r.memory.buffer,this.colors,6);n.uniform3f(s.multiply,c[0],c[1],c[2]),n.uniform3f(s.screen,c[3],c[4],c[5]),this.drawMesh(e,Math.min(a,1),0),i.masks.length>0&&n.disable(n.STENCIL_TEST),this.touch(t,o)}compositeGroup(e,t){let n=this.gl,r=this.rt,i=e.used,a=this.groups[e.part];if(!i||!a)return;let o=this.colors;if(!r.p2l_part_composite(this.rig,e.part,o,o+4,o+16))return;let s=new Float32Array(r.memory.buffer,o,7),c=Math.min(s[0],1);if(!(c>0))return;n.disable(n.CULL_FACE),a.masks.length>0&&this.stencilMasks(a.masks,a.invertMask,i),this.scissor(i);let l;a.fixed?(l=this.use(`group`),this.blendFunction(a.blend)):(this.copyDestination(i),l=this.use(`groupComposite`),n.disable(n.BLEND),n.uniform1i(l.colorBlend,a.blend),n.uniform1i(l.alphaBlend,a.alphaBlend)),n.uniform1f(l.opacity,c),n.uniform3f(l.multiply,s[1],s[2],s[3]),n.uniform3f(l.screen,s[4],s[5],s[6]),n.bindTexture(n.TEXTURE_2D,e.texture),n.disableVertexAttribArray(1),n.bindBuffer(n.ARRAY_BUFFER,this.quadBuffer),n.vertexAttribPointer(0,2,n.FLOAT,!1,0,0),n.drawArrays(n.TRIANGLE_STRIP,0,4),a.masks.length>0&&n.disable(n.STENCIL_TEST),this.touch(t,i)}drawMesh(e,t,n){let r=this.gl,i=this.meshes[e],a=i&&this.textures[i.texture];if(!a||i.vertices===0)return;let o=this.current.loc,s=this.rt.p2l_mesh_vertices(this.rig,e);r.bindBuffer(r.ARRAY_BUFFER,this.positionBuffer),r.bufferData(r.ARRAY_BUFFER,new Float32Array(this.rt.memory.buffer,s,i.vertices*2),r.STREAM_DRAW),r.vertexAttribPointer(0,2,r.FLOAT,!1,0,0),r.enableVertexAttribArray(1),r.bindBuffer(r.ARRAY_BUFFER,i.uvBuffer),r.vertexAttribPointer(1,2,r.FLOAT,!1,0,0),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,i.indexBuffer),r.bindTexture(r.TEXTURE_2D,a),r.uniform1f(o.opacity,t),r.uniform1f(o.maskThreshold,n),r.drawElements(r.TRIANGLES,i.indices.length,this.indexType,0)}},Hu=`/ui/assets/live2d/p2l_runtime.wasm`,Uu=`/ui/assets/live2d/nazuna.p2lrt`,Wu={auto:`自动`,smile:`微笑`,shy:`害羞`,surprised:`惊讶`,sleepy:`慵懒`,cheeky:`俏皮`},Gu=[`auto`,`smile`,`shy`,`surprised`,`sleepy`,`cheeky`];function Ku(e){return Wu[e]}var qu=null;async function Ju(e=Hu){return qu||=fetch(e).then(e=>{if(!e.ok)throw Error(`Live2D WASM 加载失败 (${e.status})`);return e.arrayBuffer()}).then(e=>WebAssembly.instantiate(e,{})).then(e=>e.instance.exports).catch(e=>{throw qu=null,e}),qu}function Yu(e,t,n){return Math.max(t,Math.min(n,e))}function Xu(e,t,n){let r=Yu((n-e)/Math.max(1e-5,t-e),0,1);return r*r*(3-2*r)}var Zu=class e{player;canvas;paramMap=new Map;rt;rigHandle;lastGesture=null;lastMood=null;expressionPreset=`auto`;smoothMouth=0;smoothHandPose=0;smoothVowels={a:0,i:0,u:0,e:0,o:0};elapsed=0;disposed=!1;constructor(e,t){this.player=e,this.canvas=t;let n=e;this.rt=n.rt??null,this.rigHandle=typeof n.rig==`number`?n.rig:0;try{e.parameterRanges().forEach((e,t)=>{this.paramMap.set(e.id,{index:t,min:e.min,max:e.max,def:e.default})})}catch{e.parameters.forEach((e,t)=>{this.paramMap.set(e,{index:t,min:-1,max:1,def:0})})}if(e.advancedFeatures)try{e.setAdvanced(e.advancedFeatures)}catch{}if(this.rt&&this.rigHandle)try{this.rt.p2l_behavior_strength?.(this.rigHandle,1,.85,.72),this.rt.p2l_blink_settings?.(this.rigHandle,2.5,5.5,.09,.045,.14)}catch{}this.setExpanded(!1);let r=this.findClip([`idle`,`Idle`,`breath`,`Breath`]);if(r){let t=e.clips.indexOf(r);this.rt?.p2l_play_layer&&this.rigHandle&&t>=0?this.rt.p2l_play_layer(this.rigHandle,0,t,1):e.play(r)}e.lipSync(0),e.lookAt(0,0)}static async loadFromUrl(t,n=Uu,r=Hu){let[i,a]=await Promise.all([Ju(r),fetch(n).then(e=>{if(!e.ok)throw Error(`Live2D 模型加载失败 (${e.status})`);return e.arrayBuffer()})]),o=await Vu.fromBytes(t,i,new Uint8Array(a));return new e(o,t)}static async loadFromBytes(t,n,r=Hu){if(n.byteLength<16||n.byteLength>67108864)throw Error(`Live2D (.p2lrt) 文件体积无效或超出 64 MB 上限。`);let i=await Ju(r),a=await Vu.fromBytes(t,i,new Uint8Array(n));return new e(a,t)}hasParam(e){return this.paramMap.has(e)}setOverride(e,t,n=1){let r=this.paramMap.get(e);if(!r||n<=.001)return;let i=Yu(t,r.min,r.max);this.rt?.p2l_set_parameter_override&&this.rigHandle?this.rt.p2l_set_parameter_override(this.rigHandle,r.index,i,Yu(n,0,1)):this.player.setParameter(e,r.def+(i-r.def)*Yu(n,0,1))}clearOverrides(){this.rt?.p2l_clear_parameter_overrides&&this.rigHandle&&this.rt.p2l_clear_parameter_overrides(this.rigHandle)}findClip(e){for(let t of e){let e=this.player.clips.find(e=>e===t);if(e)return e}for(let t of e){let e=t.toLowerCase(),n=this.player.clips.find(t=>t.toLowerCase().includes(e));if(n)return n}return null}findExpression(e){for(let t of e){let e=this.player.expressions.find(e=>e===t);if(e)return e}for(let t of e){let e=t.toLowerCase(),n=this.player.expressions.find(t=>t.toLowerCase().includes(e));if(n)return n}return null}setExpressionPreset(e){this.expressionPreset=e,this.syncBuiltinExpression(this.lastMood??`idle`)}getExpressionPreset(){return this.expressionPreset}syncBuiltinExpression(e){let t=null;this.expressionPreset===`auto`?e===`interrupted`?t=this.findExpression([`surprised`,`Surprised`]):e===`error`?t=this.findExpression([`sad`,`gloom`,`Sad`]):e===`speaking`&&(t=this.findExpression([`smile`,`Smile`])):this.expressionPreset===`smile`?t=this.findExpression([`smile`,`Smile`]):this.expressionPreset===`shy`?t=this.findExpression([`shy`,`Shy`]):this.expressionPreset===`surprised`?t=this.findExpression([`surprised`,`Surprised`]):this.expressionPreset===`sleepy`?t=this.findExpression([`sleepy`,`Sleepy`]):this.expressionPreset===`cheeky`&&(t=this.findExpression([`smile`,`Smile`]));try{this.player.expression(t)}catch{}}triggerGesture(e){if(this.disposed||this.hasParam(`ParamHandPose`))return;let t=e===`nod`?[`nod`,`Nod`,`HeadNod`,`点头`]:e===`wave`?[`wave`,`Wave`,`Greet`]:[],n=t.length?this.findClip(t):null;if(n){let e=this.player.clips.indexOf(n);this.rt?.p2l_play_layer&&this.rigHandle&&e>=0?this.rt.p2l_play_layer(this.rigHandle,1,e,2):this.player.play(n)}if(e===`wave`&&this.expressionPreset===`auto`){let e=this.findExpression([`smile`,`Smile`]);if(e)try{this.player.expression(e)}catch{}}}hitTest(e,t){if(this.disposed)return null;try{return this.player.hitTest(e,t)}catch{return null}}setExpanded(e){this.disposed||(this.player.view=e?{zoom:1.38,x:0,y:72}:{zoom:1.48,x:0,y:58})}applyPresetOverrides(e,t){e!==`auto`&&(e===`smile`?(this.setOverride(`ParamEyeLSmile`,.85,.85),this.setOverride(`ParamEyeRSmile`,.85,.85),this.setOverride(`ParamMouthForm`,.72,.85),this.setOverride(`ParamCheek`,.35,.75)):e===`shy`?(this.setOverride(`ParamCheek`,.96,1),this.setOverride(`ParamBrowLAngle`,.55,.8),this.setOverride(`ParamBrowRAngle`,.55,.8),this.setOverride(`ParamEyeLSmile`,.45,.7),this.setOverride(`ParamEyeRSmile`,.45,.7),this.setOverride(`ParamAngleZ`,-6.5,.65)):e===`surprised`?(this.setOverride(`ParamEyeLOpen`,1.35,.9),this.setOverride(`ParamEyeROpen`,1.35,.9),this.setOverride(`ParamBrowLY`,.72,.9),this.setOverride(`ParamBrowRY`,.72,.9),t||(this.setOverride(`ParamMouthOpenY`,.36,.85),this.setOverride(`ParamO`,.68,.85))):e===`sleepy`?(this.setOverride(`ParamEyeLOpen`,.46,.88),this.setOverride(`ParamEyeROpen`,.46,.88),this.setOverride(`ParamEyeLSquint`,.4,.7),this.setOverride(`ParamEyeRSquint`,.4,.7),this.setOverride(`ParamAngleY`,-6.5,.65),this.setOverride(`ParamAngleZ`,6,.65)):e===`cheeky`&&(this.setOverride(`ParamEyeLOpen`,0,.95),this.setOverride(`ParamEyeLSmile`,1,1),this.setOverride(`ParamEyeRSmile`,.35,.7),this.setOverride(`ParamCheek`,.58,.9),this.setOverride(`ParamMouthForm`,.6,.85),t||(this.setOverride(`ParamMouthOpenY`,.68,.9),this.setOverride(`ParamTongueOut`,.88,.95))))}applyGestureChoreography(e,t,n){let r=e.gesture,i=e.gestureProgress,a=e.mood===`speaking`&&this.smoothMouth>.04,o=0,s=0,c=0;r===`wave`&&i>.02&&i<.92?c=1:r===`think`&&i>.02&&i<.92?c=2:r||e.mood!==`thinking`&&e.mood!==`looking`||(c=2);let l=Math.abs(c-this.smoothHandPose)>1.05?22:12;if(n?this.smoothHandPose=c:(this.smoothHandPose+=(c-this.smoothHandPose)*(1-Math.exp(-t*l)),Math.abs(c-this.smoothHandPose)<.004&&(this.smoothHandPose=c)),this.setOverride(`ParamHandPose`,this.smoothHandPose,1),!r&&(e.mood===`thinking`||e.mood===`looking`)){let t=e.mood===`looking`?-1:1;return this.setOverride(`ParamThinkSway`,n?0:Math.sin(this.elapsed*2)*.55,.9),this.setOverride(`ParamAngleZ`,-9*t,.72),this.setOverride(`ParamAngleX`,11*t,.55),this.setOverride(`ParamAngleY`,5,.5),this.setOverride(`ParamBrowRY`,.32,.65),this.setOverride(`ParamBrowLAngle`,-.2,.6),{windBoostX:0,windBoostY:0}}if(!r)return{windBoostX:0,windBoostY:0};let u=Xu(0,.14,i)*(1-Xu(.84,1,i));if(r===`wave`){let e=n?.45:Math.sin((i-.1)*Math.PI*5.2);this.setOverride(`ParamWaveSwing`,e*.96*u,1),this.setOverride(`ParamAngleZ`,(10.5+e*2.8)*u,.88),this.setOverride(`ParamAngleY`,3.5*u,.5),this.setOverride(`ParamBodyAngleZ`,(4.5+e*1.4)*u,.75),this.setOverride(`ParamBodyAngleY`,Math.abs(e)*3*u,.55),this.setOverride(`ParamEyeLSmile`,.92*u,.95),this.setOverride(`ParamEyeRSmile`,.92*u,.95),this.setOverride(`ParamCheek`,.48*u,.9),this.setOverride(`ParamMouthForm`,.68*u,.85),o=e*22*u}else if(r===`nod`){let e=n?-.55*u:i<.18?Math.sin(i/.18*Math.PI)*.25:-Math.sin(Yu((i-.14)/.76,0,1)*Math.PI*2)*(1-i*.45),t=Yu(i-.08,0,1),r=n?-.3*u:-Math.sin(t*Math.PI*2)*.45*u;if(this.setOverride(`ParamAngleY`,e*20,.92),this.setOverride(`ParamBodyAngleY`,r*8,.72),this.setOverride(`ParamEyeLSmile`,.55*u,.8),this.setOverride(`ParamEyeRSmile`,.55*u,.8),i>.2&&i<.55&&!n){let e=Math.sin((i-.2)/.35*Math.PI);this.setOverride(`ParamEyeLOpen`,1-e*.75,.85),this.setOverride(`ParamEyeROpen`,1-e*.75,.85)}s=-e*16}else if(r===`think`){let e=n?.3:Math.sin(i*Math.PI*3)*.78;this.setOverride(`ParamThinkSway`,e*u,1),this.setOverride(`ParamAngleZ`,-11*u,.88),this.setOverride(`ParamAngleX`,12.5*u,.72),this.setOverride(`ParamAngleY`,6.5*u,.65),this.setOverride(`ParamBodyAngleZ`,-3.5*u,.6),this.setOverride(`ParamEyeBallX`,.52*u,.85),this.setOverride(`ParamEyeBallY`,.4*u,.85),this.setOverride(`ParamBrowRY`,.42*u,.8),this.setOverride(`ParamBrowLAngle`,-.26*u,.75),this.setOverride(`ParamMouthForm`,-.22*u,.7)}else if(r===`headpat`){let e=n?.5:Math.sin(i*Math.PI*3)**2,t=n?0:Math.sin(i*Math.PI*3);this.setOverride(`ParamAngleY`,(-9.5-7.5*e)*u,.95),this.setOverride(`ParamAngleZ`,t*8*u,.85),this.setOverride(`ParamBodyAngleY`,(-3.5-3*e)*u,.75),this.setOverride(`ParamEyeLOpen`,0,u),this.setOverride(`ParamEyeROpen`,0,u),this.setOverride(`ParamEyeLSmile`,1,u),this.setOverride(`ParamEyeRSmile`,1,u),this.setOverride(`ParamCheek`,.98*u,1),this.setOverride(`ParamMouthForm`,.85*u,.9),o=t*28*u,s=-e*20*u}else if(r===`poke`){let e=n?.5:Math.sin(i*Math.PI*2.5);this.setOverride(`ParamAngleZ`,(-11.5+e*2.5)*u,.9),this.setOverride(`ParamAngleX`,-9*u,.7),this.setOverride(`ParamBodyAngleZ`,-4.5*u,.7),this.setOverride(`ParamEyeLOpen`,0,u),this.setOverride(`ParamEyeLSmile`,1,u),this.setOverride(`ParamEyeROpen`,1.18,u*.85),this.setOverride(`ParamEyeRSmile`,.25,u*.6),this.setOverride(`ParamCheek`,.72*u,.95),this.setOverride(`ParamMouthForm`,.52*u,.85),a||(this.setOverride(`ParamMouthOpenY`,.74*u,.92),this.setOverride(`ParamTongueOut`,.96*u,.96)),o=-e*18*u}return{windBoostX:o,windBoostY:s}}applyMultiVowelLipSync(e,t,n){let r=e>.02,i=0,a=0,o=0,s=0,c=0;if(r){let t=n?.low??.35,r=n?.mid??.55,l=n?.high??.3,u=t+r+l+.001,d=t/u,f=r/u,p=l/u,m=Math.sin(this.elapsed*11.5);i=Yu((f*1.15+Math.max(0,m)*.25)*e*1.15,0,1),c=Yu((d*1.1+Math.max(0,-m)*.2)*e*.95,0,.9),a=Yu(p*1.25*e*.9,0,.85),s=Yu((f*.55+p*.45)*e*.75,0,.8),o=Yu(d*.7*e*.65,0,.7)}let l=1-Math.exp(-t*(r?20:14));this.smoothVowels.a+=(i-this.smoothVowels.a)*l,this.smoothVowels.i+=(a-this.smoothVowels.i)*l,this.smoothVowels.u+=(o-this.smoothVowels.u)*l,this.smoothVowels.e+=(s-this.smoothVowels.e)*l,this.smoothVowels.o+=(c-this.smoothVowels.o)*l,(r||this.smoothVowels.a>.015||this.smoothVowels.o>.015)&&(this.setOverride(`ParamA`,this.smoothVowels.a,.92),this.setOverride(`ParamI`,this.smoothVowels.i,.85),this.setOverride(`ParamU`,this.smoothVowels.u,.85),this.setOverride(`ParamE`,this.smoothVowels.e,.85),this.setOverride(`ParamO`,this.smoothVowels.o,.9),this.setOverride(`ParamJawOpen`,Yu(e*.75,0,1),.75))}updateAndDraw(e,t,n=!1,r){if(this.disposed||this.canvas.hidden)return;let i=Yu(t,.001,.1);n||(this.elapsed+=i);let a=Yu(e.mouth*1.35,0,1),o=a>this.smoothMouth?.58:.3;this.smoothMouth+=(a-this.smoothMouth)*o;let s=this.smoothMouth<.015?0:this.smoothMouth;this.player.lipSync(s),e.mood!==this.lastMood&&(this.lastMood=e.mood,this.syncBuiltinExpression(e.mood)),e.gesture&&e.gesture!==this.lastGesture&&this.triggerGesture(e.gesture),this.lastGesture=e.gesture,this.clearOverrides(),this.applyPresetOverrides(this.expressionPreset,s>.02),this.applyMultiVowelLipSync(s,i,r);let{windBoostX:c,windBoostY:l}=this.applyGestureChoreography(e,i,n),u=Yu(e.gazeX,-1,1),d=Yu(-e.gazeY,-1,1),f=e.mood===`thinking`?.22:e.mood===`looking`?-.18:0,p=e.mood===`thinking`?.16:e.mood===`interrupted`?-.12:0;if(this.player.lookAt(Yu(u*.85+f,-1,1),Yu(d*.78+p,-1,1)),!n){let e=u*14+Math.sin(this.elapsed*1.15)*(9+s*18)+c,t=Math.cos(this.elapsed*.85)*4+l;if(this.rt?.p2l_physics_wind&&this.rigHandle)try{this.rt.p2l_physics_wind(this.rigHandle,e*.015,t*.015)}catch{}if(this.player.advancedFeatures)try{this.player.wind(e,t)}catch{}}this.player.update(n?0:i),this.player.draw()}dispose(){if(!this.disposed){this.disposed=!0;try{this.player.dispose()}catch{}}}};function Qu(e){if(e.byteLength>67108864)throw Error(`模型超过 64 MB，请使用较小的 VRM。`);if(e.byteLength<20)throw Error(`这不是有效的 VRM 文件。`);let t=new DataView(e);if(t.getUint32(0,!0)!==1179937895||t.getUint32(4,!0)!==2||t.getUint32(8,!0)!==e.byteLength)throw Error(`VRM 文件头不完整。`);let n=t.getUint32(12,!0);if(t.getUint32(16,!0)!==1313821514||n>e.byteLength-20||n>16777216)throw Error(`无法读取 VRM 模型描述。`);let r;try{r=JSON.parse(new TextDecoder().decode(new Uint8Array(e,20,n)))}catch{throw Error(`VRM 模型描述损坏。`)}if(!r||typeof r!=`object`||Array.isArray(r))throw Error(`VRM 模型描述损坏。`);if(!r.extensions?.VRMC_vrm&&!r.extensions?.VRM)throw Error(`请选择 VRM 0.x 或 1.0 模型。`);for(let e of[`buffers`,`images`,`nodes`])if(r[e]!==void 0&&!Array.isArray(r[e]))throw Error(`VRM 资源列表格式错误。`);for(let e of[...r.buffers??[],...r.images??[]]){if(!e||typeof e!=`object`)throw Error(`VRM 资源格式错误。`);if(e.uri!==void 0&&(typeof e.uri!=`string`||!e.uri.startsWith(`data:`)))throw Error(`模型包含外部贴图或资源，请导出为自包含的 VRM 文件。`)}if((r.nodes?.length??0)>1e4)throw Error(`模型节点过多，暂不支持。`);return r}var $u=`modulepreload`,ed=function(e){return`/ui/`+e},td={},nd=function(e){return e.pathname.endsWith(`.css`)},rd=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},id=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=ed(t,n);let r=s(t),i=nd(r);return rd(td,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:$u,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},ad={offline:`幕布未启`,idle:`静候幕前`,thinking:`凝神思索`,looking:`凝视画面`,replying:`落字成句`,speaking:`声波共振`,interrupted:`刹那止声`,error:`链路受阻`},od={nod:`轻颔回应，双马尾随之轻摆`,wave:`七草荠抬手向你挥手致意`,think:`七草荠托腮凝思中…`,headpat:`轻轻摸了摸七草荠的头，脸颊微微泛红`,poke:`轻戳脸颊，七草荠俏皮地眨眼吐舌`},sd=class{element;analyser;onMoodChange;state=new Ou;renderer=null;scene=new Kn;camera=new Ao(35,1,.1,40);floor=null;driver=null;live2d=null;live2dCanvas=null;threeCanvas;modeToggleBtn=null;exprCycleBtn=null;gestureBtns=new Map;currentExpression=`auto`;builtinLive2dAvailable=!1;stageExpanded=!1;frameId=0;previous=0;paused=!1;generation=0;samples=new Float32Array(256);freqBins=new Uint8Array(128);media=matchMedia(`(prefers-reduced-motion: reduce)`);observer=null;lastMood=``;lastActiveGesture=null;peakMouth=0;status;name;note;mouthMeter;message;reset;file;constructor(e,t,n){this.element=e,this.analyser=t,this.onMoodChange=n;let r=t=>e.querySelector(`#${t}`);this.status=r(`avatar-status`),this.name=r(`avatar-name`),this.note=r(`avatar-note`),this.mouthMeter=r(`avatar-mouth`),this.message=r(`avatar-message`),this.reset=r(`avatar-reset`),this.file=r(`avatar-file`);let i=r(`avatar-canvas`);this.threeCanvas=i,this.live2dCanvas=e.querySelector(`#avatar-live2d-canvas`),this.modeToggleBtn=e.querySelector(`#avatar-mode-toggle`),this.exprCycleBtn=e.querySelector(`#avatar-expr-cycle`);for(let[t,n]of[[`avatar-nod`,`nod`],[`avatar-wave`,`wave`],[`avatar-think`,`think`],[`avatar-headpat`,`headpat`],[`avatar-poke`,`poke`]]){let r=e.querySelector(`#${t}`);r&&(this.gestureBtns.set(n,r),r.addEventListener(`click`,()=>this.act(n)))}this.exprCycleBtn?.addEventListener(`click`,()=>this.cycleExpression());try{this.renderer=new Cu({canvas:i,alpha:!0,antialias:!0,powerPreference:`low-power`}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)),this.renderer.setClearColor(0,0),this.renderer.outputColorSpace=Qe,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.2,this.camera.position.set(0,1.68,5.8),this.camera.lookAt(0,1.43,0),this.scene.add(new vo(16184575,8885681,2.5));let t=new Lo(16777215,3.1);t.position.set(-3,5,5),this.scene.add(t);let n=new Lo(10729727,1.9);n.position.set(4,3,-3),this.scene.add(n);let r=new pi(new _a(.82,48),new ti({color:7176104,transparent:!0,opacity:.18,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.y=-.015,r.scale.set(1,.65,1),this.floor=r,this.scene.add(r),this.replace(new Nu),this.observer=new ResizeObserver(()=>this.resize(i)),this.observer.observe(i),this.resize(i),this.resume(),e.dataset.renderer=`webgl`,this.tryLoadDefaultLive2D()}catch{e.dataset.renderer=`unavailable`,this.showMessage(`当前浏览器暂未启用 3D 舞台，可换 Chrome／Edge 打开；对话与声景不受影响。`),i.hidden=!0,e.querySelectorAll(`.avatar-actions button`).forEach(e=>{e.disabled=!0})}let a=e=>{e.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect();this.state.look((t.clientX-n.left)/n.width*2-1,(t.clientY-n.top)/n.height*2-1)}),e.addEventListener(`pointerleave`,()=>this.state.look(0,0)),e.addEventListener(`click`,t=>{if(this.live2d&&e===this.live2dCanvas){let e=(this.live2d.hitTest(t.clientX,t.clientY)??``).toLowerCase();e.includes(`head`)?this.act(`headpat`):e.includes(`face`)?this.act(`poke`):this.act(`wave`)}else this.act(`wave`)}),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.act(`wave`))})};a(i),this.live2dCanvas&&a(this.live2dCanvas),i.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),this.pause(),this.showMessage(`3D 舞台显示暂时中断，请刷新恢复，对话仍可继续。`)}),this.modeToggleBtn?.addEventListener(`click`,()=>{this.live2d?(this.activateThreeView(),this.element.dataset.model=`builtin`,this.name.textContent=`七草荠 · NAZUNA`,this.note.textContent=`已切换 2.5D 立绘模式 · 点击「切回 Live2D」可恢复骨骼物理`):this.builtinLive2dAvailable&&this.tryLoadDefaultLive2D()}),r(`avatar-import`).addEventListener(`click`,()=>this.file.click()),this.file.addEventListener(`change`,()=>{let e=this.file.files?.[0];this.file.value=``,e&&this.importFile(e)}),this.reset.addEventListener(`click`,()=>this.restore()),document.addEventListener(`visibilitychange`,()=>document.hidden?this.pause():this.resume()),window.addEventListener(`pagehide`,()=>{this.pause(),this.state.reset()}),window.addEventListener(`pageshow`,()=>this.resume())}resize(e){let{width:t,height:n}=e.getBoundingClientRect();t&&n&&this.renderer&&(this.camera.aspect=t/n,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,n,!1),this.renderer.render(this.scene,this.camera))}replace(e){this.driver?.dispose(),this.driver=e,this.scene.add(e.root),this.floor&&(this.floor.visible=!e.is2dPortrait)}showMessage(e){this.message.textContent=e,this.message.hidden=!e}updateExpressionButton(){if(!this.exprCycleBtn)return;let e=Ku(this.currentExpression);this.exprCycleBtn.textContent=`神态 · ${e}`,this.exprCycleBtn.classList.toggle(`is-active`,this.currentExpression!==`auto`),this.element.dataset.expression=this.currentExpression}cycleExpression(){let e=Gu[(Gu.indexOf(this.currentExpression)+1)%Gu.length];this.currentExpression=e,this.live2d?.setExpressionPreset(e),this.updateExpressionButton();let t=Ku(e);this.note.textContent=e===`auto`?`神态已恢复自动随心境流转`:`七草荠当前神态已切换为「${t}」`}act(e){let t=performance.now()/1e3;this.state.act(e,t),this.element.dataset.gestureStarted=t.toFixed(3),this.note.textContent=od[e]}activateLive2DView(e,t,n){this.live2d?.dispose(),this.live2d=e,this.live2d.setExpanded(this.stageExpanded),this.live2d.setExpressionPreset(this.currentExpression),this.live2dCanvas&&(this.live2dCanvas.hidden=!1),this.threeCanvas.hidden=!0,this.name.textContent=t,this.element.dataset.model=`live2d`,this.reset.disabled=n,this.modeToggleBtn&&(this.modeToggleBtn.hidden=!this.builtinLive2dAvailable,this.modeToggleBtn.textContent=`切回 2.5D`),this.exprCycleBtn&&(this.exprCycleBtn.hidden=!1),this.updateExpressionButton(),this.note.textContent=`Live2D 2.0 多手势骨骼与物理在线 · 点头发摸头、点脸颊俏皮眨眼、点衣袖挥手`}activateThreeView(){this.live2d?.dispose(),this.live2d=null,this.live2dCanvas&&(this.live2dCanvas.hidden=!0),this.threeCanvas.hidden=!1,this.resize(this.threeCanvas),this.modeToggleBtn&&this.builtinLive2dAvailable&&(this.modeToggleBtn.hidden=!1,this.modeToggleBtn.textContent=`切回 Live2D`),this.exprCycleBtn&&(this.exprCycleBtn.hidden=!0)}async tryLoadDefaultLive2D(){if(!this.live2dCanvas)return;let e=++this.generation;try{let t=await Zu.loadFromUrl(this.live2dCanvas,Uu);if(e!==this.generation){t.dispose();return}this.builtinLive2dAvailable=!0,this.activateLive2DView(t,`七草荠 · LIVE2D`,!0)}catch{this.builtinLive2dAvailable=!1}}setExpanded(e){this.stageExpanded=e,this.live2d?.setExpanded(e)}restore(){this.generation++,this.currentExpression=`auto`,this.replace(new Nu),this.name.textContent=`七草荠 · NAZUNA`,this.reset.disabled=!0,this.showMessage(``),this.note.textContent=`移光随眸，轻触致意 · 真实声波驱动共振光环`,this.element.dataset.model=`builtin`,this.updateExpressionButton(),this.builtinLive2dAvailable?this.tryLoadDefaultLive2D():this.activateThreeView()}async importFile(e){if(!this.renderer){this.showMessage(`3D 舞台不可用，暂时无法载入本地模型。`);return}let t=++this.generation;this.reset.disabled=!1;let n=e.name.toLowerCase(),r=n.endsWith(`.p2lrt`);this.showMessage(r?`正在解析本机 Live2D (.p2lrt) 模型…`:`正在解析本机 VRM 资产…`);try{if(r){if(!this.live2dCanvas)throw Error(`当前舞台不支持 Live2D 画布。`);let n=await e.arrayBuffer(),r=await Zu.loadFromBytes(this.live2dCanvas,n);if(t!==this.generation){r.dispose();return}this.activateLive2DView(r,e.name.replace(/\.p2lrt$/i,``).slice(0,40),!1),this.showMessage(``);return}if(e.size>67108864)throw Error(`模型体积超过 64 MB 上限，请选用较轻量的自包含 VRM。`);if(!n.endsWith(`.vrm`))throw Error(`请选择标准 .p2lrt（Live2D）或 .vrm 模型文件。`);let i=await e.arrayBuffer();if(Qu(i),t!==this.generation)return;let{loadVrm:a}=await id(async()=>{let{loadVrm:e}=await import(`./vrm-driver-tFAi81P2.js`);return{loadVrm:e}},[]),o=await a(i);if(t!==this.generation){o.dispose();return}this.activateThreeView(),this.replace(o),this.name.textContent=e.name.replace(/\.vrm$/i,``).slice(0,40),this.element.dataset.model=`vrm`,this.showMessage(``),this.note.textContent=`模型仅于本机载入 · 表情取决于资产支持`}catch(e){if(t!==this.generation)return;this.showMessage(e instanceof Error?e.message:`模型未能载入，已保留原有形象。`)}}connected(e){this.state.setConnected(e),this.renderer||(this.status.textContent=e?`3D 不可用`:`幕布未启`,this.onMoodChange?.(e?`idle`:`offline`))}begin(e,t){this.peakMouth=0,this.state.begin(e,t)}text(e){this.state.text(e)}complete(e){this.state.complete(e)}interrupt(e){this.state.interrupt(e,performance.now()/1e3),this.closeMouth()}fail(e){this.state.fail(e),this.closeMouth()}playback(e){this.state.playback(e),e||this.closeMouth()}replay(){this.peakMouth=0,this.state.replay()}resetConversation(){this.peakMouth=0,this.state.reset(),this.closeMouth()}closeMouth(){this.mouthMeter.value=0,this.element.dataset.mouth=`0`}pause(){this.paused=!0,cancelAnimationFrame(this.frameId),this.frameId=0}resume(){this.renderer&&!document.hidden&&(this.paused=!1,this.previous=0,this.frameId||=requestAnimationFrame(this.animate))}animate=e=>{if(this.paused||!this.renderer||(this.frameId=requestAnimationFrame(this.animate),e-this.previous<1e3/30))return;let t=this.previous?(e-this.previous)/1e3:1/30;this.previous=e;let n=this.analyser();n?n.getFloatTimeDomainData(this.samples):this.samples.fill(0);let r=this.state.frame(e/1e3,t,Tu(this.samples),this.media.matches);if(this.live2d){let e;n&&r.mood===`speaking`&&r.mouth>.02&&(n.getByteFrequencyData(this.freqBins),e=Du(this.freqBins)),this.live2d.updateAndDraw(r,Math.min(t,.1),this.media.matches,e)}else this.driver?.update(r,Math.min(t,.1),this.media.matches),this.renderer.render(this.scene,this.camera);this.mouthMeter.value=r.mouth,this.element.dataset.mouth=r.mouth.toFixed(3),this.peakMouth=Math.max(this.peakMouth,r.mouth),this.element.dataset.mouthPeak=this.peakMouth.toFixed(3),this.element.dataset.mood=r.mood,this.element.dataset.gesture=r.gesture??`none`,this.element.dataset.frameTime=(e/1e3).toFixed(3),this.element.dataset.gesturePhase=r.gesture&&r.gestureProgress>.3&&r.gestureProgress<.7?`active`:`rest`,r.gesture!==this.lastActiveGesture&&(this.gestureBtns.forEach((e,t)=>e.classList.toggle(`is-active`,t===r.gesture)),this.lastActiveGesture=r.gesture),r.mood!==this.lastMood&&(this.status.textContent=ad[r.mood],this.lastMood=r.mood,this.onMoodChange?.(r.mood))}},cd={apple:{id:`apple`,label:`Apple 液态玻璃`,refractionPx:26,edgeWidthPx:24,magnify:1.06,dispersion:.24,blurMix:.28,frost:.08,vibrancy:1.38,brightness:.03,colorFromBelow:.35,rimLight:.82,rimWidthPx:1.6,shadow:.32,mergeDistancePx:26},thick:{id:`thick`,label:`厚透镜折射`,refractionPx:48,edgeWidthPx:44,magnify:1.24,dispersion:.45,blurMix:.04,frost:.02,vibrancy:1.18,brightness:.025,colorFromBelow:.14,rimLight:.9,rimWidthPx:2.2,shadow:.44,mergeDistancePx:32},prism:{id:`prism`,label:`棱镜色散`,refractionPx:40,edgeWidthPx:36,magnify:1.14,dispersion:.92,blurMix:.03,frost:.015,vibrancy:1.28,brightness:.03,colorFromBelow:.12,rimLight:.95,rimWidthPx:1.85,shadow:.3,mergeDistancePx:30},frosted:{id:`frosted`,label:`柔和磨砂`,refractionPx:14,edgeWidthPx:16,magnify:1,dispersion:.06,blurMix:.9,frost:.22,vibrancy:1.4,brightness:.045,colorFromBelow:.55,rimLight:.52,rimWidthPx:1.3,shadow:.26,mergeDistancePx:18}},ld=new class{entries=new Map;register(e){return this.entries.set(e.id,e),()=>{this.entries.delete(e.id)}}update(e,t){let n=this.entries.get(e);n&&this.entries.set(e,{...n,...t})}list(){return Array.from(this.entries.values())}clear(){this.entries.clear()}},ud=[{id:`pale`,appearance:`light`,code:`SKY_01`,label:`表 · 晨间留白`,shortLabel:`晨间留白`},{id:`deep`,appearance:`dark`,code:`SKY_02`,label:`里 · 穹顶星云`,shortLabel:`穹顶星云`},{id:`eclipse`,appearance:`dark`,code:`SKY_03`,label:`蚀 · 水彩日蚀`,shortLabel:`水彩日蚀`},{id:`nebula`,appearance:`dark`,code:`SKY_04`,label:`染 · 湿染星云`,shortLabel:`湿染星云`},{id:`dawn`,appearance:`dark`,code:`SKY_05`,label:`曙 · 水彩曙弧`,shortLabel:`水彩曙弧`}],dd={offline:{plateCode:`PLATE_00`,moodTag:`STANDBY`,primaryPigment:`#2D5DA8`,secondaryPigment:`#7A8BA8`,foilAccentA:`#7FA8E8`,foilAccentB:`#4EE2EC`,signalAccent:`#7A8BA8`},idle:{plateCode:`PLATE_00`,moodTag:`STILLNESS`,primaryPigment:`#2D5DA8`,secondaryPigment:`#D85A7F`,foilAccentA:`#FF3BA7`,foilAccentB:`#4EE2EC`,signalAccent:`#E83B1E`},thinking:{plateCode:`PLATE_03`,moodTag:`QUIET RESONANCE`,primaryPigment:`#3C4B8E`,secondaryPigment:`#926DA8`,foilAccentA:`#B388FF`,foilAccentB:`#64FFDA`,signalAccent:`#7C6CE0`},looking:{plateCode:`PLATE_01`,moodTag:`VISION CAPTURE`,primaryPigment:`#0B7A8A`,secondaryPigment:`#34C6B4`,foilAccentA:`#00E5FF`,foilAccentB:`#B8F227`,signalAccent:`#009FB8`},replying:{plateCode:`PLATE_04`,moodTag:`STREAMING TEXT`,primaryPigment:`#3949D8`,secondaryPigment:`#D82674`,foilAccentA:`#FF2E93`,foilAccentB:`#00E5FF`,signalAccent:`#009FB8`},speaking:{plateCode:`PLATE_04`,moodTag:`VOICE TRANSIENT`,primaryPigment:`#D82674`,secondaryPigment:`#3949D8`,foilAccentA:`#FF2E93`,foilAccentB:`#00E5FF`,signalAccent:`#E83B1E`},interrupted:{plateCode:`PLATE_02`,moodTag:`RAZOR CUT`,primaryPigment:`#D43E28`,secondaryPigment:`#F0A13B`,foilAccentA:`#FF4D8D`,foilAccentB:`#FFD857`,signalAccent:`#E83B1E`},error:{plateCode:`PLATE_02`,moodTag:`SIGNAL FAULT`,primaryPigment:`#D43E28`,secondaryPigment:`#F0A13B`,foilAccentA:`#FF4D8D`,foilAccentB:`#FFD857`,signalAccent:`#E83B1E`}};function fd(e){let t=e.replace(`#`,``),n=Number.parseInt(t,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}function pd(e,t,n){return e+(t-e)*n}var md=[`#9FB0EA`,`#E9D3EC`,`#FCE9D8`,`#C4B3EA`,`#F4BDD3`,`#FBD9A8`,`#FFFFFF`].map(fd),hd=[`#24123A`,`#5C1A45`,`#8E2249`,`#8E559F`,`#EC506A`,`#F6A259`,`#FFE9F1`].map(fd),gd={sun:[-.18,.56,.025,1],eyeM:[.22,.44,.032,1],liftM:[Math.PI+.2,.62,.42,1],neb:[1.7,0,.9,1]},_d=[.93,.91,.86],vd={K_PAY:[2.3,2.08,1.62],K_ULT:[1.38,1.02,.17],K_TQ:[1.45,.32,.42],K_VIO:[.62,1.12,.34],K_ROS:[.14,1.2,.52],K_AMB:[.06,.55,1.35],K_YEL:[.03,.12,1.05]};function yd(e){return .2126*e[0]+.7152*e[1]+.0722*e[2]}function bd(e,t,n){let r=Math.max(e,t,n),i=Math.min(e,t,n),a=0,o=0,s=(r+i)/2;if(r!==i){let c=r-i;switch(o=s>.5?c/(2-r-i):c/(r+i),r){case e:a=(t-n)/c+(t<n?6:0);break;case t:a=(n-e)/c+2;break;default:a=(e-t)/c+4}a/=6}return[a,o,s]}function xd(e,t,n){let r=(e%1+1)%1;if(t===0)return[n,n,n];let i=n<.5?n*(1+t):n+t-n*t,a=2*n-i,o=e=>{let t=e;return t<0&&(t+=1),t>1&&--t,t<1/6?a+(i-a)*6*t:t<1/2?i:t<2/3?a+(i-a)*(2/3-t)*6:a};return[o(r+1/3),o(r),o(r-1/3)]}function Sd(e){return[e[0]**2.2,e[1]**2.2,e[2]**2.2]}function Cd(e,t,n=1.25){let r=yd(_d.map((e,n)=>e*Math.exp(-t[n]))),i=yd(e),a=e.map(e=>Math.max(.002,i+(e-i)*n)),o=r/Math.max(yd(a),1e-4);return a=a.map((e,t)=>Math.min(_d[t]*.97,Math.max(.004,e*o))),[-Math.log(a[0]/_d[0]),-Math.log(a[1]/_d[1]),-Math.log(a[2]/_d[2])]}function wd(e,t,n){return[e[0]+(t[0]-e[0])*n,e[1]+(t[1]-e[1])*n,e[2]+(t[2]-e[2])*n]}function Td(e,t){let n=fd(e),r=fd(t),i=Sd(n),a=Sd(r),[o,s,c]=bd(n[0],n[1],n[2]),l=Sd(xd(o+.085,s,c)),u=[(i[0]+a[0])*.5,(i[1]+a[1])*.5,(i[2]+a[2])*.5];return{K_PAY:wd(vd.K_PAY,Cd(i,vd.K_PAY,1),.18),K_ULT:Cd(i,vd.K_ULT),K_TQ:Cd(l,vd.K_TQ),K_VIO:Cd(u,vd.K_VIO,1.1),K_ROS:Cd(a,vd.K_ROS),K_AMB:[...vd.K_AMB],K_YEL:[...vd.K_YEL]}}var Ed=`#version 300 es
out vec2 vUv;
void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`,Dd=`#version 300 es
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
`,Od=`#version 300 es
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
`,kd=class{outerPlane;innerPlane;watermark;reticle;flashEl;pointer;rafId=0;tier=`high`;rx=-120;ry=-120;px=0;py=0;constructor(e,t,n,r,i,a){this.outerPlane=e,this.innerPlane=t,this.watermark=n,this.reticle=r,this.flashEl=i,this.pointer=a}setTier(e){this.tier=e,e!==`high`&&e!==`medium`?(this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=0,this.outerPlane&&(this.outerPlane.style.transform=``),this.innerPlane&&(this.innerPlane.style.transform=``),this.watermark&&(this.watermark.style.transform=``),this.reticle&&(this.reticle.style.opacity=`0`)):this.rafId||=requestAnimationFrame(this.loop)}setWatermark(e){this.watermark&&(this.watermark.textContent=e)}flash(){this.tier!==`reduced`&&this.flashEl&&(this.flashEl.classList.remove(`is-flashing`),this.flashEl.offsetWidth,this.flashEl.classList.add(`is-flashing`))}loop=()=>{if(this.tier!==`high`&&this.tier!==`medium`){this.rafId=0;return}if(this.rafId=requestAnimationFrame(this.loop),document.hidden)return;let e=this.pointer.active?(this.pointer.nx-.5)*2:0,t=this.pointer.active?(this.pointer.ny-.5)*2:0;if(this.px+=(e-this.px)*.06,this.py+=(t-this.py)*.06,this.outerPlane&&(this.outerPlane.style.transform=`translate3d(${(-this.px*8).toFixed(2)}px, ${(-this.py*6).toFixed(2)}px, 0)`),this.innerPlane&&(this.innerPlane.style.transform=`translate3d(${(this.px*10).toFixed(2)}px, ${(this.py*8).toFixed(2)}px, 0)`),this.watermark&&(this.watermark.style.transform=`translate3d(${(-this.px*15).toFixed(2)}px, ${(-this.py*11).toFixed(2)}px, 0)`),this.reticle){if(this.pointer.active){this.rx+=(this.pointer.x-this.rx)*.22,this.ry+=(this.pointer.y-this.ry)*.22;let e=1+Math.min(this.pointer.speed*.16,.4);this.reticle.style.opacity=`1`,this.reticle.style.transform=`translate3d(${this.rx.toFixed(1)}px, ${this.ry.toFixed(1)}px, 0) translate(-50%, -50%) scale(${e.toFixed(3)})`}else this.reticle.style.opacity=`0`}}};function Ad(e,t,n,r,i,a=44){let o=n,s=!1,c=!1,l=!1,u=0,d=0;e.classList.add(`liquid-segmented`),e.setAttribute(`role`,`tablist`),e.replaceChildren();let f=document.createElement(`div`);f.className=`liquid-segmented-knob`,f.setAttribute(`aria-hidden`,`true`),e.append(f);let p=t.map(t=>{let n=document.createElement(`button`);return n.type=`button`,n.className=`liquid-segmented-tab`,n.setAttribute(`role`,`tab`),n.dataset.value=t.id,n.textContent=t.label,e.append(n),n}),m=()=>Math.max(0,t.findIndex(e=>e.id===o)),h=(t,n,r=1)=>{let i=m(),a=p[i];p.forEach((e,t)=>{let n=t===i;e.setAttribute(`aria-selected`,String(n)),e.classList.toggle(`is-active`,n)});let o=c||l;f.classList.toggle(`is-lip-glass`,o),f.classList.toggle(`is-pressed`,c);let s=e.getBoundingClientRect();if(!a||!s.width)return;let u=a.getBoundingClientRect(),d=t??u.left-s.left,h=n??u.width;f.style.left=`${d.toFixed(1)}px`,f.style.width=`${h.toFixed(1)}px`,f.style.transform=o?`translateY(-50%) scaleX(${(1.07*r).toFixed(3)}) scaleY(1.26)`:`translateY(-50%) scale(1)`},g=()=>{l=!0,h(),window.clearTimeout(u),u=window.setTimeout(()=>{l=!1,h()},480)},_=n=>{let i=e.getBoundingClientRect();if(!i.width)return;let a=n-i.left,s=Math.abs(n-d);d=n;let c=m(),l=1/0;p.forEach((e,t)=>{let n=e.getBoundingClientRect(),r=n.left-i.left+n.width*.5,o=Math.abs(a-r);o<l&&(l=o,c=t)});let u=p[c]?.getBoundingClientRect().width||64,f=Math.max(3,Math.min(i.width-u-3,a-u*.5)),g=1+Math.min(s*.014,.18);t[c]&&t[c].id!==o&&(o=t[c].id,r(o)),h(f,u,g)};e.addEventListener(`pointerdown`,t=>{s=!0,c=!0,d=t.clientX,e.setPointerCapture(t.pointerId),_(t.clientX)}),e.addEventListener(`pointermove`,e=>{s&&_(e.clientX)});let v=()=>{s&&(s=!1,c=!1,g())};return e.addEventListener(`pointerup`,v),e.addEventListener(`pointercancel`,v),p.forEach((e,n)=>{e.addEventListener(`click`,()=>{let e=t[n];e&&(e.id!==o&&(o=e.id,r(o)),g())})}),ld.register({id:`${i}-track`,element:e,radius:`pill`,edgeShape:`convex`,mergeGroup:0,priority:a,overrideRefraction:18,overrideDispersion:.18,overrideBlurMix:.42,overrideFrost:.12}),ld.register({id:`${i}-knob`,element:null,manualRect:()=>{if(!c&&!l)return null;let e=f.getBoundingClientRect();return e.width<4||e.height<4?null:{x:e.left,y:e.top,width:e.width,height:e.height,radius:e.height*.5,active:!0}},radius:`pill`,edgeShape:`lip`,mergeGroup:0,priority:a+28,overrideRefraction:32,overrideDispersion:.62,overrideBlurMix:.02,overrideFrost:.02}),window.addEventListener(`resize`,()=>h()),requestAnimationFrame(()=>h()),{setValue(e){o=e,h()},refresh(){h()}}}function jd(e){let t=e.initialSky,n=e.initialPreset,r=!1,i=!1,a=!1,o=0,s=0,c=0,l=0,u=t=>{r=t,e.popover.hidden=!t,e.orb.setAttribute(`aria-expanded`,String(t)),e.orb.classList.toggle(`is-open`,t)},d=()=>{e.skyGrid.replaceChildren();for(let n of ud){let r=document.createElement(`button`);r.type=`button`,r.className=`dock-chip`,r.dataset.skyOption=n.id,r.textContent=n.label,r.classList.toggle(`is-active`,n.id===t),r.addEventListener(`click`,()=>{t=n.id,e.onSkyChange(n.id),d()}),e.skyGrid.append(r)}},f=()=>{e.presetGrid.replaceChildren();for(let t of[`apple`,`thick`,`prism`,`frosted`]){let r=cd[t],i=document.createElement(`button`);i.type=`button`,i.className=`dock-chip`,i.dataset.presetOption=t,i.textContent=r.label,i.classList.toggle(`is-active`,t===n),i.addEventListener(`click`,()=>{n=t,e.onPresetChange(t),f()}),e.presetGrid.append(i)}};d(),f(),u(!1),e.closeButton.addEventListener(`click`,()=>u(!1)),e.flashButton.addEventListener(`click`,()=>e.onFlash());let p=t=>{e.orb.style.transform=`translate3d(${c.toFixed(1)}px, ${l.toFixed(1)}px, 0) scale(${t})`};e.orb.addEventListener(`pointerdown`,t=>{i=!0,a=!1,o=t.clientX-c,s=t.clientY-l,e.orb.classList.add(`is-dragging`),e.orb.setPointerCapture(t.pointerId),p(1.09),e.onFoilImpulse(.75)}),e.orb.addEventListener(`pointermove`,e=>{if(!i)return;let t=e.clientX-o,n=e.clientY-s;Math.hypot(t-c,n-l)>4&&(a=!0),c=Math.max(-185,Math.min(80,t)),l=Math.max(-90,Math.min(35,n)),p(1.09)});let m=()=>{i&&(i=!1,e.orb.classList.remove(`is-dragging`),a||(u(!r),e.onFoilImpulse(.95)),c=0,l=0,p(1))};return e.orb.addEventListener(`pointerup`,m),e.orb.addEventListener(`pointercancel`,m),ld.register({id:`floating-dock-bar`,element:e.bar,radius:`pill`,edgeShape:`convex`,mergeGroup:1,priority:80,overrideRefraction:40,overrideDispersion:.68,overrideBlurMix:.1,overrideFrost:.04}),ld.register({id:`floating-dock-orb`,element:e.orb,radius:`pill`,edgeShape:`convex`,mergeGroup:1,priority:82,overrideRefraction:44,overrideDispersion:.78,overrideBlurMix:.06,overrideFrost:.03}),ld.register({id:`floating-dock-popover`,element:e.popover,radius:26,edgeShape:`convex`,mergeGroup:0,priority:92,overrideRefraction:20,overrideDispersion:.18,overrideBlurMix:.88,overrideFrost:.34}),{syncSky(e){t=e,d()},syncPreset(e){n=e,f()},close(){u(!1)}}}var Md=1,Nd=16e3,Pd=640;function Fd(e,t){if(!e.length||t<=0)return new Int16Array;if(t===Nd){let t=new Int16Array(e.length);for(let n=0;n<e.length;n++){let r=Math.max(-1,Math.min(1,e[n]));t[n]=Math.round(r<0?r*32768:r*32767)}return t}let n=t/Nd,r=Math.max(1,Math.floor(e.length/n)),i=new Int16Array(r);for(let t=0;t<r;t++){let r=t*n,a=Math.floor(r),o=r-a,s=e[Math.min(a,e.length-1)],c=e[Math.min(a+1,e.length-1)],l=Math.max(-1,Math.min(1,s+(c-s)*o));i[t]=Math.round(l<0?l*32768:l*32767)}return i}function Id(e){if(!e.length)return 0;let t=0;for(let n=0;n<e.length;n++){let r=e[n]/32768;t+=r*r}return Math.sqrt(t/e.length)}var Ld=class{player;callbacks;options;ws=null;state=`idle`;readyInfo=null;outputRate=24e3;activeRunId=``;activeTurnId=``;audioDoneReceived=!1;completionAckSent=!1;pendingContexts=[];inFlightChunks=0;userTurnCounter=0;activeUserKey=``;micStream=null;micContext=null;micProcessor=null;micSource=null;micSilentGain=null;micAvailable=!1;micMuted=!1;micResidual=[];pingTimer=null;lastErrorCode=``;constructor(e,t,n={}){this.player=e,this.callbacks=t,this.options=n}get connectionState(){return this.state}get isConnected(){return this.state===`connected`}get isActive(){return this.state===`connecting`||this.state===`connected`}get isMuted(){return this.micMuted}get hasMic(){return this.micAvailable}get ready(){return this.readyInfo}async connect(e,t,n,r){if(this.isActive)return;this.setState(`connecting`,null),this.lastErrorCode=``,this.resetTurnState(),this.player.isEnabled&&await this.player.unlock();let i=new URLSearchParams;try{let e=Intl.DateTimeFormat().resolvedOptions().timeZone;e&&i.set(`tz`,e)}catch{}t&&i.set(`voice`,t),r&&i.set(`lang`,r),n&&i.set(`ticket`,n);let a=typeof location<`u`?location:{protocol:`http:`,host:`127.0.0.1:8765`},o=a.protocol===`https:`?`wss:`:`ws:`,c=i.toString(),l=`${o}//${a.host}/v1/sessions/${encodeURIComponent(e)}/live${c?`?${c}`:``}`,u=this.options.socketFactory?this.options.socketFactory(l):new WebSocket(l);u.binaryType=`arraybuffer`,this.ws=u,this.player.onChunkEnded=e=>{this.handleChunkFinished(e)},u.onmessage=e=>{this.ws===u&&(e.data instanceof ArrayBuffer?this.handleBinaryAudio(new Uint8Array(e.data)):typeof Blob<`u`&&e.data instanceof Blob?e.data.arrayBuffer().then(e=>{this.ws===u&&this.handleBinaryAudio(new Uint8Array(e))}):typeof e.data==`string`&&this.handleJsonMessage(e.data))},u.onerror=()=>{this.ws===u&&(this.lastErrorCode||=`live_disconnected`)},u.onclose=e=>{if(this.ws!==u)return;let t=e.reason||this.lastErrorCode;this.cleanupResources(),this.setState(`idle`,null),e.code===4e3||t===`idle_timeout`?this.callbacks.onNotice?.(new s(`idle_timeout`)):t&&e.code!==1e3&&e.code!==1001&&this.callbacks.onNotice?.(new s(t))}}disconnect(){let e=this.ws;if(this.cleanupResources(),e&&e.readyState<=Md)try{e.close(1e3,`user_hangup`)}catch{}this.setState(`idle`,null)}setMicMuted(e){this.micMuted=e,this.micAvailable&&this.sendJson({action:`mic_state`,enabled:!e}),this.callbacks.onMicState?.({available:this.micAvailable,muted:this.micMuted,level:0})}setVoice(e){this.isConnected&&e&&this.sendJson({action:`change_voice`,voice_name:e})}setLanguage(e){this.isConnected&&this.sendJson({action:`change_language`,language:e})}interrupt(){this.isConnected&&this.sendJson({action:`interrupt`})}sendMockUtterance(e){this.isConnected&&this.sendJson({action:`mock.utterance`,text:e})}sendMockBargeIn(){this.isConnected&&this.sendJson({action:`mock.barge_in`})}setState(e,t){this.state=e,t!==void 0&&(this.readyInfo=t),this.callbacks.onState(e,this.readyInfo)}resetTurnState(){this.activeRunId=``,this.activeTurnId=``,this.audioDoneReceived=!1,this.completionAckSent=!1,this.pendingContexts=[],this.inFlightChunks=0,this.activeUserKey=``}sendJson(e){this.ws&&this.ws.readyState===Md&&this.ws.send(JSON.stringify(e))}handleJsonMessage(e){let t;try{t=JSON.parse(e)}catch{return}let n=String(t.action??``),r=t.data??{};if(this.callbacks.onEvent?.(n,r),n===`live.ready`){let e=r;this.outputRate=e.output_audio?.sample_rate||24e3,this.player.configure(this.outputRate,e.output_audio?.channels||1,`pcm_s16le`),this.setState(`connected`,e),this.startKeepalive(),this.options.micEnabled!==!1&&this.startMicrophone()}else if(n===`live.idle_timeout`)this.lastErrorCode=`idle_timeout`;else if(n===`error`){let e=r.error??{},t=String(e.code??`live_disconnected`);this.lastErrorCode=t,this.callbacks.onNotice?.(new s(t))}else if(n===`voice_changed`){let e=String(r.name??``);e&&this.callbacks.onVoiceChanged?.(e)}else if(n===`language_changed`){let e=String(r.language??``);(e===`zh`||e===`ja`||e===`en`)&&(this.readyInfo&&={...this.readyInfo,language:e},this.callbacks.onLanguageChanged?.(e))}else if(n===`input.speech.started`)this.callbacks.onUserSpeech(!0);else if(n===`input.speech.stopped`)this.callbacks.onUserSpeech(!1);else if(n===`input.transcript.updated`)this.activeUserKey||=(this.userTurnCounter++,`live-user-pending-${this.userTurnCounter}`),this.callbacks.onTranscript({role:`user`,key:this.activeUserKey,text:String(r.text??``),final:!1});else if(n===`input.transcript.done`){let e=r.turn?`live-user-${String(r.turn)}`:``,t=this.activeUserKey||void 0,n=e||t||`live-user-${++this.userTurnCounter}`;this.activeUserKey=``,this.callbacks.onTranscript({role:`user`,key:n,previousKey:t&&t!==n?t:void 0,text:String(r.text??``),final:!0})}else if(n===`input.transcript.revised`){let e=r.turn?`live-user-${String(r.turn)}`:`live-user-${this.userTurnCounter}`;this.callbacks.onTranscript({role:`user`,key:e,text:String(r.text??``),final:!0,revised:!0})}else if(n===`response.audio.started`){this.activeRunId=String(r.run_id??``),this.activeTurnId=String(r.turn_id??``),this.audioDoneReceived=!1,this.completionAckSent=!1,this.pendingContexts=[],this.inFlightChunks=0;let e=`${this.activeRunId}:${this.activeTurnId}`;this.player.begin(e,this.outputRate,!1),this.callbacks.onAssistantStart(this.activeRunId,this.activeTurnId)}else if(n===`response.audio.context`){let e={runId:String(r.run_id??this.activeRunId),turnId:String(r.turn_id??this.activeTurnId),chunkId:String(r.chunk_id??``),durationMs:typeof r.duration_ms==`number`?r.duration_ms:void 0};this.pendingContexts.push(e)}else if(n===`response.audio.done`){let e=String(r.run_id??``),t=String(r.turn_id??``);e===this.activeRunId&&t===this.activeTurnId&&(this.audioDoneReceived=!0,this.maybeCompletePlayback())}else if(n===`response.audio.stop`){let e=String(r.run_id??this.activeRunId),t=String(r.turn_id??this.activeTurnId),n=String(r.reason??`barge_in`),i=this.player.stopWithProgress();this.pendingContexts=[],this.inFlightChunks=0,this.audioDoneReceived=!1,this.completionAckSent=!0;for(let e of i.completed)this.sendJson({action:`playback.chunk.completed`,run_id:e.runId,turn_id:e.turnId,chunk_id:e.chunkId});e&&t&&this.sendJson({action:`playback.stopped`,run_id:e,turn_id:t,played_audio_ms:i.playedAudioMs}),this.callbacks.onAssistantInterrupt(e,t,n,i.playedAudioMs)}else if(n===`output.transcript.updated`){let e=String(r.run_id??this.activeRunId),t=String(r.turn_id??this.activeTurnId),n=`live-assistant-${e||t||`current`}`;this.callbacks.onTranscript({role:`assistant`,key:n,text:String(r.text??``),final:!1})}else if(n===`output.transcript.done`){let e=String(r.run_id??this.activeRunId),t=String(r.turn_id??this.activeTurnId),n=`live-assistant-${e||t||`current`}`;this.callbacks.onTranscript({role:`assistant`,key:n,text:String(r.text??``),final:!0})}else if(n===`response.interrupted`){let e=String(r.run_id??this.activeRunId),t=String(r.turn_id??this.activeTurnId),n=`live-assistant-${e||t||`current`}`,i=String(r.text??``);i&&this.callbacks.onTranscript({role:`assistant`,key:n,text:i,final:!0,interrupted:!0})}else if(n===`response.ended`){let e=String(r.run_id??this.activeRunId),t=String(r.turn_id??this.activeTurnId),n=String(r.status??`completed`);this.callbacks.onAssistantEnd(e,t,n)}}handleBinaryAudio(e){let t=this.pendingContexts.shift(),n=`${t?.runId||this.activeRunId}:${t?.turnId||this.activeTurnId}`,r=!1;if(this.player.isEnabled)try{r=this.player.pushPcm(n,e,t)}catch{r=!1}r?this.inFlightChunks++:t&&(this.sendJson({action:`playback.chunk.completed`,run_id:t.runId,turn_id:t.turnId,chunk_id:t.chunkId}),this.maybeCompletePlayback())}handleChunkFinished(e){this.isConnected&&(this.inFlightChunks=Math.max(0,this.inFlightChunks-1),this.sendJson({action:`playback.chunk.completed`,run_id:e.runId,turn_id:e.turnId,chunk_id:e.chunkId}),e.runId===this.activeRunId&&e.turnId===this.activeTurnId&&this.maybeCompletePlayback())}maybeCompletePlayback(){!this.audioDoneReceived||this.completionAckSent||this.inFlightChunks>0||!this.activeRunId||!this.activeTurnId||(this.completionAckSent=!0,this.sendJson({action:`playback.completed`,run_id:this.activeRunId,turn_id:this.activeTurnId}))}startKeepalive(){this.stopKeepalive(),this.pingTimer=setInterval(()=>{this.isConnected&&this.sendJson({action:`ping`,timestamp:Date.now()})},25e3)}stopKeepalive(){this.pingTimer!==null&&(clearInterval(this.pingTimer),this.pingTimer=null)}async startMicrophone(){if(!navigator.mediaDevices?.getUserMedia)this.micAvailable=!1,this.callbacks.onMicState?.({available:!1,muted:!0,level:0}),this.callbacks.onNotice?.(new s(`mic_denied`));else try{let e=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0,channelCount:1}});if(!this.isConnected){e.getTracks().forEach(e=>e.stop());return}this.micStream=e;let t=new AudioContext;this.micContext=t,await t.resume();let n=t.createMediaStreamSource(e);this.micSource=n;let r=t.createScriptProcessor(2048,1,1);this.micProcessor=r;let i=t.createGain();i.gain.value=0,this.micSilentGain=i,this.micResidual=[],r.onaudioprocess=e=>{if(!this.isConnected||!this.ws||this.ws.readyState!==Md)return;let n=Fd(e.inputBuffer.getChannelData(0),t.sampleRate);for(let e=0;e<n.length;e++)this.micResidual.push(this.micMuted?0:n[e]);for(;this.micResidual.length>=Pd;){let e=new Int16Array(Pd);for(let t=0;t<Pd;t++)e[t]=this.micResidual[t];this.micResidual.splice(0,Pd),this.micMuted||this.ws.send(e.buffer);let t=this.micMuted?0:Math.min(1,Id(e)*6);this.callbacks.onMicState?.({available:!0,muted:this.micMuted,level:t})}},n.connect(r),r.connect(i),i.connect(t.destination),this.micAvailable=!0,this.micMuted=!1,this.sendJson({action:`mic_state`,enabled:!0}),this.callbacks.onMicState?.({available:!0,muted:!1,level:0})}catch{this.micAvailable=!1,this.micMuted=!0,this.callbacks.onMicState?.({available:!1,muted:!0,level:0}),this.callbacks.onNotice?.(new s(`mic_denied`))}}stopMicrophone(){if(this.micProcessor){this.micProcessor.onaudioprocess=null;try{this.micProcessor.disconnect()}catch{}this.micProcessor=null}if(this.micSource){try{this.micSource.disconnect()}catch{}this.micSource=null}if(this.micSilentGain){try{this.micSilentGain.disconnect()}catch{}this.micSilentGain=null}this.micContext&&=(this.micContext.close().catch(()=>{}),null),this.micStream&&=(this.micStream.getTracks().forEach(e=>e.stop()),null),this.micAvailable=!1,this.micResidual=[],this.callbacks.onMicState?.({available:!1,muted:this.micMuted,level:0})}cleanupResources(){this.stopKeepalive(),this.stopMicrophone(),this.player.onChunkEnded=null,this.player.stop(),this.ws=null,this.resetTurnState()}},Rd=[`high`,`medium`,`low`,`reduced`,null];function zd(){if(typeof window>`u`)return`low`;if(window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches)return`reduced`;let e=navigator;if(e.connection?.saveData)return`low`;try{let e=document.createElement(`canvas`).getContext(`webgl2`);if(!e)return`low`;e.getExtension(`WEBGL_lose_context`)?.loseContext()}catch{return`low`}let t=navigator.hardwareConcurrency??8,n=e.deviceMemory??8,r=window.matchMedia?.(`(pointer: coarse)`).matches??!1,i=window.innerWidth<768;return t<=2||n<=2?`low`:r||i||t<=4||n<=4?`medium`:`high`}var Bd=class{onChange;detectedTier;override=null;fps=60;rafId=0;media=null;mediaListener=null;constructor(e){this.onChange=e,this.detectedTier=zd()}get snapshot(){return{tier:this.override??this.detectedTier,detectedTier:this.detectedTier,override:this.override,fps:this.fps}}start(){if(this.onChange(this.snapshot),typeof window>`u`)return;this.media=window.matchMedia?.(`(prefers-reduced-motion: reduce)`)??null,this.media&&(this.mediaListener=e=>{this.detectedTier=e.matches?`reduced`:zd(),this.onChange(this.snapshot)},this.media.addEventListener(`change`,this.mediaListener));let e=0,t=0,n=performance.now(),r=i=>{e+=1;let a=i-n;if(a>=1e3){let r=document.hidden||a>2400,o=Math.min(Math.round(e*1e3/a),144);e=0,n=i,r?t=0:(this.fps=o,o<20?(t+=1,t>=5&&(this.detectedTier=this.detectedTier===`high`?`medium`:this.detectedTier===`medium`?`low`:this.detectedTier,t=0)):t=0,this.onChange(this.snapshot))}this.rafId=requestAnimationFrame(r)};this.rafId=requestAnimationFrame(r)}cycleOverride(){let e=Rd.indexOf(this.override);this.override=Rd[(e+1)%Rd.length];let t=this.snapshot;return this.onChange(t),t}stop(){this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=0,this.media&&this.mediaListener&&this.media.removeEventListener(`change`,this.mediaListener)}},Vd=class{video;sample;policy;changed;invalidated;error;generation=0;stream=null;sourceId=``;epoch=0;sid=``;ready=!1;kind=`off`;policyQueue=Promise.resolve();constructor(e,t,n,r,i,a){this.video=e,this.sample=t,this.policy=n,this.changed=r,this.invalidated=i,this.error=a}get available(){return this.ready}get owner(){return this.sid}enqueue(e,t,n,r=!1){let i=this.policyQueue.catch(()=>{}).then(()=>this.policy(e,t,n,r));return this.policyQueue=i,i}clearLocal(){if(this.generation++,this.ready=!1,this.kind=`off`,this.stream)for(let e of this.stream.getTracks())e.onended=null,e.stop();return this.stream=null,this.video.srcObject=null,this.sample.getContext(`2d`)?.clearRect(0,0,this.sample.width,this.sample.height),this.invalidated(),this.changed({kind:`off`,label:`尚未择定视窗`,ready:!1}),this.generation}async stop(e=!1){let t=this.sid;if(this.clearLocal(),this.sid=``,this.sourceId=``,this.epoch=0,t)try{await this.enqueue(t,!1,void 0,e)}catch(e){this.error(e)}}async enable(e,t,n,r){if(r!==this.generation)return;let i=`browser-${crypto.randomUUID()}`;this.sid=e,this.sourceId=i,this.kind=t;let a=await this.enqueue(e,!0,i);r===this.generation&&(this.epoch=a.epoch,this.ready=!0,this.changed({kind:t,label:n,ready:!0}))}async useSample(e){let t=this.sid,n=this.clearLocal();t&&this.enqueue(t,!1).catch(this.error),Hd(this.sample),this.changed({kind:`choosing`,label:`正在铺展光学样张`,ready:!1});try{await this.enable(e,`sample`,`样张 · 光蚀画片`,n)}catch(e){n===this.generation&&(await this.stop(),this.error(e))}}async chooseWindow(e){if(!navigator.mediaDevices?.getDisplayMedia)throw new s(`capture_unavailable`);let t=this.sid,n=this.clearLocal();t&&this.enqueue(t,!1).catch(this.error),this.changed({kind:`choosing`,label:`等待择取系统窗口`,ready:!1});try{let t=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:5,max:10}},audio:!1});if(n!==this.generation){t.getTracks().forEach(e=>e.stop());return}this.stream=t,this.video.srcObject=t;let r=t.getVideoTracks()[0];if(!r)throw new s(`capture_not_ready`);if(r.onended=()=>{n===this.generation&&this.stop()},await this.video.play(),n!==this.generation)return;await this.enable(e,`window`,r.label||`已选系统窗口`,n)}catch(e){if(n!==this.generation||(await this.stop(),e instanceof DOMException&&e.name===`NotAllowedError`))return;this.error(e)}}snapshot(){if(!this.ready)throw new s(`capture_not_ready`);let e=this.kind===`sample`?this.sample:this.video,t=this.kind===`sample`?this.sample.width:this.video.videoWidth,n=this.kind===`sample`?this.sample.height:this.video.videoHeight;if(!t||!n)throw new s(`capture_not_ready`);let r=Math.min(1,1280/Math.max(t,n)),i=document.createElement(`canvas`);i.width=Math.max(1,Math.round(t*r)),i.height=Math.max(1,Math.round(n*r));let a=i.getContext(`2d`);if(!a)throw new s(`capture_not_ready`);a.drawImage(e,0,0,i.width,i.height);let o=i.toDataURL(`image/jpeg`,.76).split(`,`)[1];if(!o||o.length>275e4)throw new s(`image_too_large`);return{image_base64:o,mime_type:`image/jpeg`,source_id:this.sourceId,policy_epoch:this.epoch,captured_at:new Date().toISOString()}}};function Hd(e){e.width=1280,e.height=800;let t=e.getContext(`2d`);t.fillStyle=`#e8e4da`,t.fillRect(0,0,1280,800),t.fillStyle=`#f7f4ed`,t.beginPath(),t.roundRect(72,68,1136,664,28),t.fill(),t.fillStyle=`#d9d3c6`,t.fillRect(72,152,1136,2),t.fillStyle=`#e83b1e`,t.beginPath(),t.arc(124,112,8,0,Math.PI*2),t.fill(),t.fillStyle=`#2d5da8`,t.beginPath(),t.arc(152,112,8,0,Math.PI*2),t.fill(),t.fillStyle=`#009fb8`,t.beginPath(),t.arc(180,112,8,0,Math.PI*2),t.fill(),t.fillStyle=`#5c5f68`,t.font=`20px Consolas, monospace`,t.fillText(`ECHO // OPTICAL SAMPLE PLATE 01`,224,120),t.fillStyle=`#111318`,t.font=`bold 52px "Microsoft YaHei", sans-serif`,t.fillText(`光影之间，留一段静默。`,136,278),t.fillStyle=`#5c5f68`,t.font=`24px "Microsoft YaHei", sans-serif`,t.fillText(`以合成光学样张校验视窗采帧与多模态通路，不涉及系统桌面。`,136,334),[`翻阅未读完的画册`,`放一张轻盈的器乐黑胶`,`梳理今晚留下的思绪`].forEach((e,n)=>{let r=420+n*78;t.fillStyle=n===0?`#111318`:`#ece8df`,t.beginPath(),t.roundRect(136,r-28,1008,58,16),t.fill(),t.fillStyle=n===0?`#f8f6f2`:`#2c2f38`,t.font=`23px "Microsoft YaHei", sans-serif`,t.fillText(e,172,r+9),t.fillStyle=n===0?`#b8f227`:`#6c707a`,t.font=`19px Consolas, monospace`,t.fillText([`PLATE 01 · 15M`,`PLATE 02 · 40M`,`PLATE 03 · 10M`][n],946,r+8)})}var Ud=`companion:sfx-enabled`,Wd=class{factory;ctx=null;master=null;enabled=!0;volume=.45;lastPlayed=new Map;constructor(e){this.factory=e;try{if(typeof localStorage<`u`){let e=localStorage.getItem(Ud);(e===`0`||e===`false`)&&(this.enabled=!1)}}catch{}}get isEnabled(){return this.enabled}setEnabled(e){this.enabled=e;try{typeof localStorage<`u`&&localStorage.setItem(Ud,e?`1`:`0`)}catch{}}setVolume(e){this.volume=Math.max(0,Math.min(1,e)),this.master&&this.ctx&&this.master.gain.setTargetAtTime(this.volume*.36,this.ctx.currentTime,.02)}ensureContext(){if(!this.enabled||this.volume<=.005)return null;if(!this.ctx){let e=this.factory?null:typeof AudioContext<`u`?AudioContext:null;if(!this.factory&&!e)return null;try{this.ctx=this.factory?this.factory():new e,this.master=this.ctx.createGain(),this.master.gain.value=this.volume*.36,this.master.connect(this.ctx.destination)}catch{return null}}return this.ctx.state===`suspended`&&this.ctx.resume().catch(()=>{}),this.ctx}play(e){let t=typeof performance<`u`?performance.now():Date.now();if(t-(this.lastPlayed.get(e)??0)<35)return;this.lastPlayed.set(e,t);let n=this.ensureContext();if(!n||!this.master)return;let r=n.currentTime+.004;switch(e){case`click`:this.tone(n,1340,1180,r,.032,.16,`sine`),this.tone(n,2680,2400,r,.018,.05,`triangle`);break;case`send`:this.tone(n,659.25,659.25,r,.075,.17,`sine`),this.tone(n,987.77,995,r+.036,.11,.15,`triangle`);break;case`replyDone`:this.tone(n,880,880,r,.22,.13,`sine`),this.tone(n,1318.51,1318.51,r+.055,.26,.11,`sine`);break;case`callConnect`:this.tone(n,523.25,523.25,r,.18,.16,`sine`),this.tone(n,783.99,783.99,r+.075,.22,.16,`sine`),this.tone(n,1174.66,1174.66,r+.155,.3,.14,`triangle`);break;case`callHangup`:this.tone(n,783.99,760,r,.12,.16,`sine`),this.tone(n,523.25,493.88,r+.085,.22,.15,`sine`);break;case`langSwitch`:this.tone(n,739.99,739.99,r,.095,.17,`sine`),this.tone(n,1108.73,1114,r+.048,.17,.16,`triangle`),this.tone(n,2217.46,2217.46,r+.052,.09,.05,`sine`);break;case`micOn`:this.tone(n,520,780,r,.075,.16,`sine`);break;case`micOff`:this.tone(n,640,400,r,.08,.15,`sine`);break;case`bargeIn`:this.tone(n,420,210,r,.085,.2,`triangle`),this.noiseBurst(n,r,.045,1600,.09);break;case`skyShift`:this.tone(n,587.33,880,r,.28,.09,`sine`),this.tone(n,1174.66,1318.51,r+.04,.3,.06,`sine`),this.noiseBurst(n,r,.18,1850,.045);break;case`memorySave`:this.tone(n,587.33,587.33,r,.16,.14,`sine`),this.tone(n,739.99,739.99,r+.06,.18,.14,`sine`),this.tone(n,880,880,r+.12,.22,.14,`sine`),this.tone(n,1174.66,1174.66,r+.18,.28,.12,`triangle`);break;case`avatarReact`:this.tone(n,783.99,820,r,.08,.15,`sine`),this.tone(n,987.77,1046.5,r+.05,.13,.13,`sine`);break;case`error`:this.tone(n,250,220,r,.09,.17,`sine`),this.tone(n,196,174,r+.095,.12,.15,`sine`)}}tone(e,t,n,r,i,a,o){if(!this.master)return;let s=e.createOscillator(),c=e.createGain();s.type=o,s.frequency.setValueAtTime(t,r),n!==t&&s.frequency.exponentialRampToValueAtTime(Math.max(40,n),r+i);let l=Math.min(.006,i*.22);c.gain.setValueAtTime(1e-4,r),c.gain.linearRampToValueAtTime(a,r+l),c.gain.exponentialRampToValueAtTime(1e-4,r+i),s.connect(c),c.connect(this.master),s.start(r),s.stop(r+i+.015)}noiseBurst(e,t,n,r,i){if(!this.master)return;let a=Math.max(64,Math.floor(e.sampleRate*n)),o=e.createBuffer(1,a,e.sampleRate),s=o.getChannelData(0);for(let e=0;e<a;e++)s[e]=(Math.random()*2-1)*Math.sin(e/a*Math.PI);let c=e.createBufferSource();c.buffer=o;let l=e.createBiquadFilter();l.type=`bandpass`,l.frequency.setValueAtTime(r,t),l.Q.value=1.6;let u=e.createGain();u.gain.setValueAtTime(i,t),u.gain.exponentialRampToValueAtTime(1e-4,t+n),c.connect(l),l.connect(u),u.connect(this.master),c.start(t),c.stop(t+n+.01)}},Gd=14,Kd=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexPale;
uniform sampler2D uTexDeep;
uniform sampler2D uTexWc;
uniform sampler2D uTexWcPrev;
uniform float uPaleReady;
uniform float uDeepReady;
uniform float uWcReady;
uniform float uWcPrevReady;
uniform float uTransition;

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
    vec3 curWc = sampleWatercolour(uTexWc, uWcReady, vUv, wcPan);
    if (uWcPrevReady > 0.002 && uWcReady < 0.998) {
      vec3 prevWc = sampleWatercolour(uTexWcPrev, uWcPrevReady, vUv, wcPan);
      // Soft radial feathered cross-dissolve from previous watercolour to newly baked sky
      float rad = length((vUv - vec2(0.55, 0.42)) * vec2(aspect, 1.0));
      float mask = smoothstep(rad * 0.42 - 0.25, rad * 0.42 + 0.35, uWcReady * 1.35);
      wcCol = mix(prevWc, curWc, mask);
    } else {
      wcCol = curWc;
    }
  }

  vec3 sky = paleCol * uW0 + deepCol * uW1 + wcCol * uW2;

  // Silky optical atmospheric shimmer during sky transitions (never muddies or inverts)
  if (uTransition > 0.002) {
    float sweep = exp(-pow((vUv.x * 0.85 + (1.0 - vUv.y) * 0.45 - (1.15 - uTransition * 0.95)) * 4.2, 2.0));
    vec3 prism = mix(uFoilA, uFoilB, clamp(vUv.x * 0.75 + vUv.y * 0.25, 0.0, 1.0));
    vec3 sheen = mix(vec3(1.0, 0.96, 0.92), prism, 0.55);
    sky = mix(sky, min(vec3(1.0), sky + sheen * 0.28), sweep * uTransition * 0.55);
  }

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
`,qd=`#version 300 es
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
`,Jd=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uBg;
uniform sampler2D uBlur;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uIsDark;

uniform int uCount;
uniform vec4 uRects[${Gd}];
uniform vec4 uMeta[${Gd}];
uniform vec4 uOptics[${Gd}];

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

  for (int i = 0; i < ${Gd}; i++) {
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
`;function Yd(e,t,n){let r=e.createShader(t);if(!r)throw Error(`Unable to allocate WebGL2 shader`);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r)??`unknown`;throw e.deleteShader(r),Error(`Shader compile error: ${t}`)}return r}function Xd(e,t,n){let r=Yd(e,e.VERTEX_SHADER,t),i=Yd(e,e.FRAGMENT_SHADER,n),a=e.createProgram();if(!a)throw Error(`Unable to allocate WebGL2 program`);if(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),!e.getProgramParameter(a,e.LINK_STATUS)){let t=e.getProgramInfoLog(a)??`unknown`;throw e.deleteProgram(a),Error(`Program link error: ${t}`)}return a}function Zd(e,t,n,r,i){let a=e.createTexture();e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,i),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null);let o=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,a,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,null),{fbo:o,tex:a,width:t,height:n,wrapS:r,wrapT:i}}function Qd(e,t,n,r){(t.width!==n||t.height!==r)&&(t.width=n,t.height=r,e.bindTexture(e.TEXTURE_2D,t.tex),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,n,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindTexture(e.TEXTURE_2D,null))}function Z(e,t,n){return e.getUniformLocation(t,n)??e.getUniformLocation(t,`${n}[0]`)}var $d=class{host;fallbackEl;pointer;getAudioEnergy;onGpuStateChange;sky=`pale`;preset=`apple`;atmosphere=dd.idle;tier=`high`;foilImpulse=.25;transitionPulse=0;gpuActive=!1;teardownGl=null;visibilityListener=null;paused=!1;constructor(e,t,n,r,i){this.host=e,this.fallbackEl=t,this.pointer=n,this.getAudioEnergy=r,this.onGpuStateChange=i}setSky(e){this.sky!==e&&(this.transitionPulse=1),this.sky=e,this.fallbackEl.dataset.sky=e,this.triggerFoil(.85)}setPreset(e){this.preset=e,this.triggerFoil(.7)}setAtmosphere(e){this.atmosphere=e,this.triggerFoil(.65)}triggerFoil(e=.85){this.foilImpulse=Math.max(this.foilImpulse,e)}setTier(e){let t=this.tier===`high`||this.tier===`medium`,n=e===`high`||e===`medium`,r=this.tier!==e;if(this.tier=e,r||this.gpuActive!==n){if(!n)this.stopWebGL(!0),this.fallbackEl.hidden=!1,this.setGpuActive(!1);else if(!t||!this.teardownGl||r){this.stopWebGL(!0);let t=this.startWebGL(e);this.fallbackEl.hidden=t,this.setGpuActive(t)}}}get isGpuActive(){return this.gpuActive}setGpuActive(e){this.gpuActive=e,document.documentElement.dataset.glassMode=e?`gpu`:`fallback`,this.onGpuStateChange?.(e)}stopWebGL(e){this.teardownGl&&=(this.teardownGl(e),null),this.visibilityListener&&=(document.removeEventListener(`visibilitychange`,this.visibilityListener),null)}dispose(){this.stopWebGL(!0)}startWebGL(e){let t=document.createElement(`canvas`);t.className=`stage-gl-canvas`;let n=null;try{n=t.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`high-performance`,preserveDrawingBuffer:!1})}catch{return!1}if(!n)return!1;this.host.replaceChildren(t);let r,i,a,o,s;try{r=Xd(n,Ed,Dd),i=Xd(n,Ed,Od),a=Xd(n,Ed,Kd),o=Xd(n,Ed,qd),s=Xd(n,Ed,Jd)}catch{return this.host.replaceChildren(),!1}let c=n.createVertexArray();n.bindVertexArray(c),n.disable(n.DEPTH_TEST),n.disable(n.CULL_FACE);let l=Number(n.getParameter(n.MAX_TEXTURE_SIZE))||2048,u=Math.min(l,e===`high`?3072:2048),d=Math.min(l,e===`high`?1024:684),f=Math.min(l,e===`high`?1600:1152),p=Math.min(l,e===`high`?900:648),m=Zd(n,u,d,n.REPEAT,n.CLAMP_TO_EDGE),h=Zd(n,u,d,n.REPEAT,n.CLAMP_TO_EDGE),g=Zd(n,f,p,n.CLAMP_TO_EDGE,n.CLAMP_TO_EDGE),_=Zd(n,f,p,n.CLAMP_TO_EDGE,n.CLAMP_TO_EDGE),v=Zd(n,Math.max(1,window.innerWidth),Math.max(1,window.innerHeight),n.CLAMP_TO_EDGE,n.CLAMP_TO_EDGE),y=Zd(n,Math.max(1,Math.floor(window.innerWidth/2)),Math.max(1,Math.floor(window.innerHeight/2)),n.CLAMP_TO_EDGE,n.CLAMP_TO_EDGE),b=Zd(n,Math.max(1,Math.floor(window.innerWidth/2)),Math.max(1,Math.floor(window.innerHeight/2)),n.CLAMP_TO_EDGE,n.CLAMP_TO_EDGE),x={uOut:Z(n,r,`uOut`),uSide:Z(n,r,`uSide`),uSun:Z(n,r,`uSun`),uNeb:Z(n,r,`uNeb`),uEyeM:Z(n,r,`uEyeM`),uLiftM:Z(n,r,`uLiftM`),uClock:Z(n,r,`uClock`),uPalU:Z(n,r,`uPalU`),uPalM:Z(n,r,`uPalM`)};n.useProgram(r),n.uniform2f(x.uOut,u,d),n.uniform4fv(x.uSun,gd.sun),n.uniform4fv(x.uNeb,gd.neb),n.uniform4fv(x.uEyeM,gd.eyeM),n.uniform4fv(x.uLiftM,gd.liftM),n.uniform1f(x.uClock,0),n.uniform3fv(x.uPalU,new Float32Array(md.flat())),n.uniform3fv(x.uPalM,new Float32Array(hd.flat()));let S={uOut:Z(n,i,`uOut`),uSpan:Z(n,i,`uSpan`),uPhi:Z(n,i,`uPhi`),uMode:Z(n,i,`uMode`),uSeed:Z(n,i,`uSeed`),K_PAY:Z(n,i,`K_PAY`),K_ULT:Z(n,i,`K_ULT`),K_TQ:Z(n,i,`K_TQ`),K_VIO:Z(n,i,`K_VIO`),K_ROS:Z(n,i,`K_ROS`),K_AMB:Z(n,i,`K_AMB`),K_YEL:Z(n,i,`K_YEL`)};n.useProgram(i),n.uniform2f(S.uOut,f,p),n.uniform1f(S.uPhi,1.2),n.uniform1f(S.uSeed,1.7);let C={uTexPale:Z(n,a,`uTexPale`),uTexDeep:Z(n,a,`uTexDeep`),uTexWc:Z(n,a,`uTexWc`),uTexWcPrev:Z(n,a,`uTexWcPrev`),uPaleReady:Z(n,a,`uPaleReady`),uDeepReady:Z(n,a,`uDeepReady`),uWcReady:Z(n,a,`uWcReady`),uWcPrevReady:Z(n,a,`uWcPrevReady`),uTransition:Z(n,a,`uTransition`),uW0:Z(n,a,`uW0`),uW1:Z(n,a,`uW1`),uW2:Z(n,a,`uW2`),uTime:Z(n,a,`uTime`),uScroll:Z(n,a,`uScroll`),uResolution:Z(n,a,`uResolution`),uPointer:Z(n,a,`uPointer`),uFoilBoost:Z(n,a,`uFoilBoost`),uAudioEnergy:Z(n,a,`uAudioEnergy`),uPigmentA:Z(n,a,`uPigmentA`),uPigmentB:Z(n,a,`uPigmentB`),uFoilA:Z(n,a,`uFoilA`),uFoilB:Z(n,a,`uFoilB`),uSun:Z(n,a,`uSun`),uAuroraSteps:Z(n,a,`uAuroraSteps`)};n.useProgram(a),n.uniform1i(C.uTexPale,0),n.uniform1i(C.uTexDeep,1),n.uniform1i(C.uTexWc,2),n.uniform1i(C.uTexWcPrev,3),n.uniform4fv(C.uSun,gd.sun),n.uniform1i(C.uAuroraSteps,e===`high`?12:8);let w={uTex:Z(n,o,`uTex`),uDir:Z(n,o,`uDir`)};n.useProgram(o),n.uniform1i(w.uTex,0);let T={uBg:Z(n,s,`uBg`),uBlur:Z(n,s,`uBlur`),uResolution:Z(n,s,`uResolution`),uDpr:Z(n,s,`uDpr`),uIsDark:Z(n,s,`uIsDark`),uCount:Z(n,s,`uCount`),uRects:Z(n,s,`uRects`),uMeta:Z(n,s,`uMeta`),uOptics:Z(n,s,`uOptics`),uMagnify:Z(n,s,`uMagnify`),uVibrancy:Z(n,s,`uVibrancy`),uBrightness:Z(n,s,`uBrightness`),uColorFromBelow:Z(n,s,`uColorFromBelow`),uRimLight:Z(n,s,`uRimLight`),uRimWidth:Z(n,s,`uRimWidth`),uShadow:Z(n,s,`uShadow`),uMergeDist:Z(n,s,`uMergeDist`)};n.useProgram(s),n.uniform1i(T.uBg,0),n.uniform1i(T.uBlur,1);let E=new Float32Array(56),D=new Float32Array(56),O=new Float32Array(56),k=e===`high`?Math.min(window.devicePixelRatio||1,2):Math.min(window.devicePixelRatio||1,1.25),A=()=>{if(!n)return;k=e===`high`?Math.min(window.devicePixelRatio||1,2):Math.min(window.devicePixelRatio||1,1.25);let r=Math.max(1,window.innerWidth),i=Math.max(1,window.innerHeight),a=Math.max(1,Math.round(r*k)),o=Math.max(1,Math.round(i*k));t.width=a,t.height=o,Qd(n,v,a,o);let s=Math.max(1,Math.floor(a/2)),c=Math.max(1,Math.floor(o/2));Qd(n,y,s,c),Qd(n,b,s,c)};A();let j=0,ee=!1,te=0,M=!1,N=0,ne=!1,re=0,ie=!1,ae=``,oe=fd(this.atmosphere.primaryPigment),P=fd(this.atmosphere.secondaryPigment),se=fd(this.atmosphere.foilAccentA),ce=fd(this.atmosphere.foilAccentB),le=performance.now(),ue=le,de={x:.5,y:.5},fe=0,pe=.25,me=+(this.sky===`pale`),he=+(this.sky===`deep`),ge=+(this.sky!==`pale`&&this.sky!==`deep`),_e=0,ve=0,ye=0,be=0,xe=this.sky===`pale`?0:1,Se=e=>e===`nebula`?2:e===`dawn`?5:3,Ce=()=>{if(!n)return;if(!M&&(this.sky===`pale`||ne)){let t=Math.min(e===`high`?32:20,d-te);n.bindFramebuffer(n.FRAMEBUFFER,m.fbo),n.viewport(0,0,u,d),n.useProgram(r),n.uniform1f(x.uSide,0),n.enable(n.SCISSOR_TEST),n.scissor(0,te,u,t),n.drawArrays(n.TRIANGLES,0,3),n.disable(n.SCISSOR_TEST),te+=t,te>=d&&(M=!0);return}if(!ne&&(this.sky===`deep`||M)){let t=Math.min(e===`high`?28:16,d-N);n.bindFramebuffer(n.FRAMEBUFFER,h.fbo),n.viewport(0,0,u,d),n.useProgram(r),n.uniform1f(x.uSide,1),n.enable(n.SCISSOR_TEST),n.scissor(0,N,u,t),n.drawArrays(n.TRIANGLES,0,3),n.disable(n.SCISSOR_TEST),N+=t,N>=d&&(ne=!0);return}if((this.sky===`pale`||this.sky===`deep`)&&ie)return;let t=Se(this.sky),a=String(t);if(ae!==a){if(ie&&ye>.05){let e=g;g=_,_=e,be=ye}ae=a,re=0,ie=!1,ye=0;let e=Td(dd.idle.primaryPigment,dd.idle.secondaryPigment);n.useProgram(i),n.uniform1i(S.uMode,t),n.uniform2fv(S.uSpan,t===2?[92,51.75]:t===5?[124,69.75]:[98,55.125]),n.uniform3fv(S.K_PAY,e.K_PAY),n.uniform3fv(S.K_ULT,e.K_ULT),n.uniform3fv(S.K_TQ,e.K_TQ),n.uniform3fv(S.K_VIO,e.K_VIO),n.uniform3fv(S.K_ROS,e.K_ROS),n.uniform3fv(S.K_AMB,e.K_AMB),n.uniform3fv(S.K_YEL,e.K_YEL)}if(!ie){let t=Math.min(e===`high`?30:20,p-re);n.bindFramebuffer(n.FRAMEBUFFER,g.fbo),n.viewport(0,0,f,p),n.useProgram(i),n.enable(n.SCISSOR_TEST),n.scissor(0,re,f,t),n.drawArrays(n.TRIANGLES,0,3),n.disable(n.SCISSOR_TEST),re+=t,re>=p&&(ie=!0)}},we=()=>{let e=cd[this.preset],t=window.innerWidth,n=window.innerHeight,r=ld.list(),i=[];for(let a of r){let r=0,o=0,s=0,c=0,l=22;if(a.manualRect){let e=a.manualRect();if(!e||e.active===!1||e.width<2||e.height<2)continue;r=e.x,o=e.y,s=e.width,c=e.height,l=e.radius}else if(a.element){if(a.element.hidden)continue;let e=a.element.getBoundingClientRect();if(e.width<2||e.height<2||e.bottom<-40||e.top>n+40||e.right<-40||e.left>t+40)continue;r=e.left,o=e.top,s=e.width,c=e.height,l=a.radius===`pill`?c*.5:a.radius??24}else continue;i.push({cx:r+s*.5,cy:o+c*.5,hw:s*.5,hh:c*.5,radius:l,edgeShape:+(a.edgeShape===`lip`),mergeGroup:a.mergeGroup,priority:a.priority,edgeWidth:a.edgeShape===`lip`?Math.min(22,c*.48):e.edgeWidthPx,refraction:a.overrideRefraction??e.refractionPx,dispersion:a.overrideDispersion??e.dispersion,blurMix:a.overrideBlurMix??e.blurMix,frost:a.overrideFrost??e.frost})}i.sort((e,t)=>t.priority-e.priority);let a=i.slice(0,Gd).sort((e,t)=>e.priority-t.priority);for(let e=0;e<a.length;e++){let t=a[e],n=e*4;E[n]=t.cx,E[n+1]=t.cy,E[n+2]=t.hw,E[n+3]=t.hh,D[n]=t.radius,D[n+1]=t.edgeShape,D[n+2]=t.mergeGroup,D[n+3]=t.edgeWidth,O[n]=t.refraction,O[n+1]=t.dispersion,O[n+2]=t.blurMix,O[n+3]=t.frost}return a.length},Te=e=>{if(ee||this.paused||!n)return;j=requestAnimationFrame(Te);let t=Math.min((e-le)/1e3,.05);le=e,Ce();let r=+(this.sky===`pale`),i=+(this.sky===`deep`),c=+(this.sky!==`pale`&&this.sky!==`deep`),l=1-Math.exp(-t*3.4);me=pd(me,r,l),he=pd(he,i,l),ge=pd(ge,c,l),M&&(_e=Math.min(1,_e+t*2.8)),ne&&(ve=Math.min(1,ve+t*2.8)),ie&&(ye=Math.min(1,ye+t*2.4),ye>=.999&&(be=0)),xe=pd(xe,this.sky===`pale`?0:1,l),this.transitionPulse=Math.max(0,this.transitionPulse-t*1.75);let u=Math.sin(this.transitionPulse*Math.PI),d=fd(this.atmosphere.primaryPigment),f=fd(this.atmosphere.secondaryPigment),p=fd(this.atmosphere.foilAccentA),x=fd(this.atmosphere.foilAccentB),S=1-Math.exp(-t*3);for(let e=0;e<3;e++)oe[e]=pd(oe[e],d[e],S),P[e]=pd(P[e],f[e],S),se[e]=pd(se[e],p[e],S),ce[e]=pd(ce[e],x[e],S);let A=this.pointer.active?this.pointer.nx:.5,te=this.pointer.active?1-this.pointer.ny:.5;de.x=pd(de.x,A,.08),de.y=pd(de.y,te,.08);let N=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);fe=pd(fe,window.scrollY/N,.08),this.foilImpulse=Math.max(0,this.foilImpulse-t*1.4),pe=pd(pe,this.foilImpulse,.16);let re=v.width,ae=v.height,Se=y.width,Ee=y.height;n.bindFramebuffer(n.FRAMEBUFFER,v.fbo),n.viewport(0,0,re,ae),n.useProgram(a),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,m.tex),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,h.tex),n.activeTexture(n.TEXTURE2),n.bindTexture(n.TEXTURE_2D,g.tex),n.activeTexture(n.TEXTURE3),n.bindTexture(n.TEXTURE_2D,_.tex),n.uniform1f(C.uPaleReady,_e),n.uniform1f(C.uDeepReady,ve),n.uniform1f(C.uWcReady,ye),n.uniform1f(C.uWcPrevReady,be),n.uniform1f(C.uTransition,u),n.uniform1f(C.uW0,me),n.uniform1f(C.uW1,he),n.uniform1f(C.uW2,ge),n.uniform1f(C.uTime,(e-ue)*.001),n.uniform1f(C.uScroll,fe),n.uniform2f(C.uResolution,re,ae),n.uniform2f(C.uPointer,de.x,de.y),n.uniform1f(C.uFoilBoost,pe),n.uniform1f(C.uAudioEnergy,this.getAudioEnergy()),n.uniform3fv(C.uPigmentA,oe),n.uniform3fv(C.uPigmentB,P),n.uniform3fv(C.uFoilA,se),n.uniform3fv(C.uFoilB,ce),n.drawArrays(n.TRIANGLES,0,3),n.bindFramebuffer(n.FRAMEBUFFER,y.fbo),n.viewport(0,0,Se,Ee),n.useProgram(o),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,v.tex),n.uniform2f(w.uDir,2.4/Math.max(Se,1),0),n.drawArrays(n.TRIANGLES,0,3),n.bindFramebuffer(n.FRAMEBUFFER,b.fbo),n.viewport(0,0,Se,Ee),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,y.tex),n.uniform2f(w.uDir,0,2.4/Math.max(Ee,1)),n.drawArrays(n.TRIANGLES,0,3);let De=cd[this.preset],Oe=we();n.bindFramebuffer(n.FRAMEBUFFER,null),n.viewport(0,0,re,ae),n.useProgram(s),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,v.tex),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,b.tex),n.uniform2f(T.uResolution,re,ae),n.uniform1f(T.uDpr,k),n.uniform1f(T.uIsDark,xe),n.uniform1i(T.uCount,Oe),n.uniform4fv(T.uRects,E),n.uniform4fv(T.uMeta,D),n.uniform4fv(T.uOptics,O),n.uniform1f(T.uMagnify,De.magnify),n.uniform1f(T.uVibrancy,De.vibrancy),n.uniform1f(T.uBrightness,De.brightness),n.uniform1f(T.uColorFromBelow,De.colorFromBelow),n.uniform1f(T.uRimLight,De.rimLight),n.uniform1f(T.uRimWidth,De.rimWidthPx),n.uniform1f(T.uShadow,De.shadow),n.uniform1f(T.uMergeDist,De.mergeDistancePx),n.drawArrays(n.TRIANGLES,0,3)},Ee=e=>{e.preventDefault(),ee=!0,cancelAnimationFrame(j),this.fallbackEl.hidden=!1,this.setGpuActive(!1)},De=()=>{ee=!1,this.stopWebGL(!1);let e=this.startWebGL(this.tier);this.fallbackEl.hidden=e,this.setGpuActive(e)};return this.visibilityListener=()=>{document.hidden?(this.paused=!0,cancelAnimationFrame(j)):(this.paused=!1,le=performance.now(),ee||(j=requestAnimationFrame(Te)))},t.addEventListener(`webglcontextlost`,Ee),t.addEventListener(`webglcontextrestored`,De),window.addEventListener(`resize`,A),document.addEventListener(`visibilitychange`,this.visibilityListener),this.paused=document.hidden,this.paused||(j=requestAnimationFrame(Te)),this.teardownGl=e=>{if(cancelAnimationFrame(j),window.removeEventListener(`resize`,A),t.removeEventListener(`webglcontextlost`,Ee),t.removeEventListener(`webglcontextrestored`,De),n)try{[r,i,a,o,s].forEach(e=>n.deleteProgram(e)),[m,h,g,_,v,y,b].forEach(e=>{n.deleteFramebuffer(e.fbo),n.deleteTexture(e.tex)}),c&&n.deleteVertexArray(c),e&&n.getExtension(`WEBGL_lose_context`)?.loseContext()}catch{}t.parentNode===this.host&&this.host.removeChild(t)},!0}},ef=class{api;callbacks;current=null;creationQueue=Promise.resolve();constructor(e,t){this.api=e,this.callbacks=t}send(e,t,n,r){this.cancel();let i={localId:crypto.randomUUID(),id:null,text:t,hasScreen:n,cancelled:!1,terminal:!1,lastEvent:0,abort:new AbortController};return this.current=i,this.callbacks.created(i),this.creationQueue=this.creationQueue.catch(()=>{}).then(async()=>{try{if(i.cancelled)return;let t=await r();if(i.cancelled||this.current!==i)return;let n=await this.api.start(e,t);if(i.id=n.turn_id,i.cancelled||this.current!==i){await this.api.cancel(i.id);return}this.consume(i,n.events_url)}catch(e){i.cancelled||(i.terminal=!0,this.callbacks.error(i,e))}}),i}async consume(e,t){try{for await(let n of this.api.events(t,e.abort.signal)){if(e.cancelled||this.current!==e)return;if(n.code===`event_history_lost`)throw new s(`event_history_lost`);if(!(n.turn_id!==e.id||!Number.isInteger(n.id)||n.id<=e.lastEvent)&&(e.lastEvent=n.id,[`turn.completed`,`turn.failed`,`turn.cancelled`].includes(n.type)&&(e.terminal=!0),this.callbacks.event(e,n),e.terminal))break}if(!e.terminal&&!e.cancelled)throw new s(`incomplete_stream`)}catch(t){!e.cancelled&&this.current===e&&(e.terminal=!0,this.callbacks.error(e,t),e.id&&this.api.cancel(e.id).catch(()=>{}))}}cancel(e=!1){let t=this.current;t&&!t.cancelled&&(t.cancelled=!0,t.abort.abort(),this.callbacks.stopped(t),t.id&&!t.terminal&&this.api.cancel(t.id,e).catch(e=>this.callbacks.error(t,e)))}},Q=e=>document.getElementById(e),tf=Q(`message-input`),nf=Q(`send`),rf=Q(`interrupt`),af=Q(`dock-interrupt-btn`),of=Q(`dock-new-btn`),sf=Q(`dock-live-btn`),cf=Q(`live-toggle-btn`),lf=Q(`live-call-bar`),uf=Q(`live-call-avatar`),df=Q(`live-call-state`),ff=Q(`live-call-timer`),pf=Q(`live-mic-meter`),mf=Q(`live-lang-select`),hf=Q(`live-voice-select`),gf=Q(`live-mute-btn`),_f=Q(`live-barge-btn`),vf=Q(`live-mock-say`),yf=Q(`live-mock-barge`),bf=Q(`live-hangup-btn`),xf=Q(`live-lock-btn`),Sf=Q(`export-chat`),Cf=Q(`sound-enabled`),wf=Q(`sfx-enabled`),Tf=Q(`attach-screen`),Ef=Q(`replay`),Df=Q(`organize-memory`),Of=new u,$=new Wd;Q(`hud-avatar-mini`).src=e,Q(`stage-avatar-img`).src=e,Q(`live-call-avatar-img`).src=e;var kf=document.querySelector(`link[rel="icon"]`);kf&&(kf.type=`image/webp`,kf.href=e);var Af=null,jf=null,Mf=!1,Nf=!1,Pf=!1,Ff=0,If,Lf,Rf={playing:!1,queued:0,playedChunks:0,receivedSeconds:0},zf=[],Bf=0,Vf=``,Hf=0,Uf=0,Wf=[],Gf=[],Kf=[],qf=`idle`,Jf=!1,Yf=0,Xf=0,Zf=0,Qf=new Map,$f=new Map,ep=[`你好七草荠，我正在校验 MOSS-Live 全双工语音通道。`,`记住：我习惯在深夜听着雨声写代码。`,`今晚的天幕色彩很温柔，能跟我聊点轻松的话题吗？`],tp=Q(`waveform`),np=tp.getContext(`2d`),rp=new Float32Array(256),ip=matchMedia(`(prefers-reduced-motion: reduce)`),ap=`companion:stage-sky`,op=`companion:glass-preset`,sp=`companion:live-lang`,cp=`companion:volume`,lp=`companion:persona-id`,up=`companion:persona-prompt`,dp={zh:`中文`,ja:`日本語`,en:`English`},fp=[`zh`,`ja`,`en`],pp=[{id:`nazuna`,label:`夜行七草荠`,prompt:`你是七草荠（Nanakusa Nazuna），性格自由散漫、俏皮直率、带一点深夜漫步的慵懒与小得意。说话像熟识的夜行伙伴一样自然简短，偶尔轻轻吐槽，但真心关心对方。不要机械复述问题，也不要用客服腔或长篇大论。`},{id:`ja_tutor`,label:`日语陪练`,prompt:`你是七草荠（Nanakusa Nazuna），正在和朋友用轻松自然的东京日常日语聊天。回复简短有来有往，如果对方日语有更地道的说法，可以用玩笑口吻顺手点一句，保持自在不拘束的夜聊氛围。`},{id:`focus`,label:`静音伴读`,prompt:`你是七草荠，正安静地陪对方深夜工作或读书。语气比平时更柔和克制、短句清晰、少打扰，在对方卡壳或疲惫时给出轻巧的鼓励与提醒。`},{id:`coder`,label:`代码搭档`,prompt:`你是七草荠，同时是思维敏锐的深夜工程搭档。回答直击重点、逻辑利落，帮对方拆解 Bug 和设计思路时偶尔带点俏皮吐槽，不堆砌废话。`}];function mp(e,t,n){try{let n=localStorage.getItem(e);if(n&&t.includes(n))return n}catch{}return n}var hp=ud.map(e=>e.id),gp=[`apple`,`thick`,`prism`,`frosted`],_p=mp(ap,hp,`pale`),vp=mp(op,gp,`apple`),yp=mp(sp,fp,`zh`),bp=(()=>{try{return localStorage.getItem(lp)||`nazuna`}catch{return`nazuna`}})(),xp=(()=>{try{return localStorage.getItem(up)||pp[0].prompt}catch{return pp[0].prompt}})(),Sp=(()=>{try{let e=Number(localStorage.getItem(cp));return Number.isFinite(e)&&e>=0&&e<=100?e:45}catch{return 45}})(),Cp={x:0,y:0,nx:.56,ny:.45,speed:0,active:!1},wp=window.innerWidth*.55,Tp=window.innerHeight*.45,Ep=performance.now();window.addEventListener(`pointermove`,e=>{let t=performance.now(),n=Math.max(t-Ep,8),r=Math.min(Math.hypot((e.clientX-wp)/n,(e.clientY-Tp)/n),4);Cp.x=e.clientX,Cp.y=e.clientY,Cp.nx=e.clientX/Math.max(window.innerWidth,1),Cp.ny=e.clientY/Math.max(window.innerHeight,1),Cp.speed=r,Cp.active=!0,r>.75&&kp.triggerFoil(Math.min(1,.25+r*.14)),wp=e.clientX,Tp=e.clientY,Ep=t},{passive:!0}),window.addEventListener(`pointerleave`,()=>{Cp.active=!1,Cp.speed=0},{passive:!0});var Dp=new kd(document.getElementById(`draft-outer-plane`),document.getElementById(`draft-inner-plane`),document.getElementById(`drafting-watermark`),document.getElementById(`drafting-reticle`),document.getElementById(`broadcast-flash`),Cp);function Op(){return!Rf.playing||!qp.analyser?0:(qp.analyser.getFloatTimeDomainData(rp),Math.min(1,Tu(rp)*18))}var kp=new $d(Q(`stage-gl-host`),Q(`stage-fallback`),Cp,Op),Ap={offline:`待连`,idle:`静候`,thinking:`思索`,looking:`观屏`,replying:`落字`,speaking:`声纹`,interrupted:`截断`,error:`受阻`};function jp(e){let t=dd[e],n=document.documentElement.style;n.setProperty(`--atmo-a`,t.primaryPigment),n.setProperty(`--atmo-b`,t.secondaryPigment),n.setProperty(`--atmo-foil-a`,t.foilAccentA),n.setProperty(`--atmo-foil-b`,t.foilAccentB),n.setProperty(`--atmo-signal`,t.signalAccent),Q(`hud-plate`).textContent=`${t.plateCode} · ${Ap[e]}`,Dp.setWatermark(t.plateCode.slice(-2)),kp.setAtmosphere(t)}var Mp=Ad(Q(`sky-segmented`),ud.slice(0,4).map(e=>({id:e.id,label:e.shortLabel})),_p===`dawn`?`eclipse`:_p,e=>Pp(e,!0),`hud-sky`,44),Np=jd({bar:Q(`dock-bar`),orb:Q(`dock-orb`),popover:Q(`stage-popover`),skyGrid:Q(`dock-sky-grid`),presetGrid:Q(`dock-preset-grid`),closeButton:Q(`popover-close`),flashButton:Q(`flash-test-btn`),initialSky:_p,initialPreset:vp,onSkyChange:e=>Pp(e,!0),onPresetChange:e=>Fp(e),onFlash:()=>{Dp.flash(),kp.triggerFoil(1),$.play(`skyShift`)},onFoilImpulse:e=>kp.triggerFoil(e)});function Pp(e,t=!1){let n=_p!==e;_p=e;let r=e!==`pale`;document.documentElement.dataset.skyTheme=r?`dark`:`light`;let i=document.querySelector(`meta[name="theme-color"]`);i&&(i.content=r?`#12101c`:`#f3f0e9`),kp.setSky(e),Mp.setValue(e===`dawn`?`eclipse`:e),Np.syncSky(e),t&&(Dp.flash(),n&&$.play(`skyShift`));try{localStorage.setItem(ap,e)}catch{}Uf||Kp()}function Fp(e){let t=vp!==e;vp=e,kp.setPreset(e),Np.syncPreset(e),t&&$.play(`click`);try{localStorage.setItem(op,e)}catch{}}function Ip(){let e=Q(`dock-persona-grid`),t=Q(`persona-prompt-input`);e.replaceChildren();for(let n of pp){let r=document.createElement(`button`);r.type=`button`,r.className=`dock-chip`,r.classList.toggle(`is-active`,n.id===bp),r.textContent=n.label,r.addEventListener(`click`,()=>{bp=n.id,xp=n.prompt,t.value=n.prompt;try{localStorage.setItem(lp,bp),localStorage.setItem(up,xp)}catch{}$.play(`click`),Ip()}),e.append(r)}t.value!==xp&&(t.value=xp)}function Lp(e){yp=e,mf.value=e,document.querySelectorAll(`[data-live-lang]`).forEach(t=>{let n=t.dataset.liveLang===e;t.classList.toggle(`is-active`,n),t.setAttribute(`aria-pressed`,String(n))})}function Rp(e,t=!0){let n=yp!==e;Lp(e);try{localStorage.setItem(sp,e)}catch{}t&&(n?($.play(`langSwitch`),kp.triggerFoil(.65)):$.play(`click`),nm.isConnected?(df.textContent=`正在热切至 ${dp[e]}…`,nm.setLanguage(e)):Mf&&(Q(`turn-status`).textContent=`实时语音语言已切换为 ${dp[e]}`))}ld.register({id:`hud-brand-pill`,element:Q(`hud-brand-pill`),radius:`pill`,edgeShape:`convex`,mergeGroup:0,priority:55,overrideRefraction:22,overrideDispersion:.28}),ld.register({id:`hud-tier-btn`,element:Q(`tier-button`),radius:`pill`,edgeShape:`convex`,mergeGroup:0,priority:52,overrideRefraction:20,overrideDispersion:.22}),ld.register({id:`hud-status-pill`,element:Q(`hud-status-pill`),radius:`pill`,edgeShape:`convex`,mergeGroup:0,priority:54,overrideRefraction:22,overrideDispersion:.26}),ld.register({id:`stage-conversation`,element:Q(`conversation-panel`),radius:26,edgeShape:`convex`,mergeGroup:0,priority:20,overrideBlurMix:.78,overrideFrost:.28,overrideRefraction:20,overrideDispersion:.16}),ld.register({id:`inspector-screen`,element:Q(`screen-card`),radius:24,edgeShape:`convex`,mergeGroup:0,priority:22,overrideBlurMix:.82,overrideFrost:.3,overrideRefraction:18,overrideDispersion:.15}),ld.register({id:`inspector-audio`,element:Q(`audio-card`),radius:24,edgeShape:`convex`,mergeGroup:0,priority:24,overrideBlurMix:.82,overrideFrost:.3,overrideRefraction:18,overrideDispersion:.15}),ld.register({id:`inspector-telemetry`,element:Q(`telemetry-card`),radius:24,edgeShape:`convex`,mergeGroup:0,priority:26,overrideBlurMix:.82,overrideFrost:.3,overrideRefraction:18,overrideDispersion:.15});var zp=new Bd(e=>{Q(`tier-label`).textContent=e.override?`${e.tier.toUpperCase()}·MAN`:e.tier.toUpperCase(),Q(`fps-label`).textContent=`${e.fps}FPS`,kp.setTier(e.tier),Dp.setTier(e.tier)});Q(`tier-button`).addEventListener(`click`,()=>{zp.cycleOverride(),kp.triggerFoil(.6),$.play(`click`)});function Bp(){let e=new Date;Q(`hud-clock`).textContent=[e.getHours(),e.getMinutes(),e.getSeconds()].map(e=>String(e).padStart(2,`0`)).join(`:`)}Bp(),window.setInterval(Bp,1e3);var Vp=!1;function Hp(e){Vp=e,Q(`conversation-panel`).classList.toggle(`is-stage-focused`,e);let t=Q(`toggle-stage-focus`),n=Q(`dock-focus-btn`);t.setAttribute(`aria-pressed`,String(e)),t.textContent=e?`收拢幕布`:`展开幕布`,n.setAttribute(`aria-pressed`,String(e)),Lf?.setExpanded(e)}Q(`toggle-stage-focus`).addEventListener(`click`,()=>{$.play(`click`),Hp(!Vp)}),Q(`dock-focus-btn`).addEventListener(`click`,()=>{$.play(`click`),Hp(!Vp)});function Up(e){let t=e===`memory`;Q(`tab-btn-telemetry`).classList.toggle(`is-active`,!t),Q(`tab-btn-telemetry`).setAttribute(`aria-selected`,String(!t)),Q(`tab-btn-memory`).classList.toggle(`is-active`,t),Q(`tab-btn-memory`).setAttribute(`aria-selected`,String(t)),Q(`panel-telemetry`).hidden=t,Q(`panel-memory`).hidden=!t}Q(`tab-btn-telemetry`).addEventListener(`click`,()=>{$.play(`click`),Up(`telemetry`)}),Q(`tab-btn-memory`).addEventListener(`click`,()=>{$.play(`click`),Up(`memory`),Af&&Mf&&cm()}),Q(`dock-memory-btn`).addEventListener(`click`,()=>{$.play(`click`),Up(`memory`),Q(`telemetry-card`).scrollIntoView({behavior:ip.matches?`auto`:`smooth`,block:`nearest`}),Af&&Mf&&cm()});function Wp(e){Q(`notice-text`).textContent=d(e),Q(`notice`).hidden=!1,$.play(`error`)}function Gp(){let e=qf===`connecting`||qf===`connected`,t=qf===`connected`;nf.disabled=!Mf||Nf||!tf.value.trim(),tf.disabled=!Mf,Q(`new-session`).disabled=!Mf,Q(`mobile-new-session`).disabled=!Mf,of.disabled=!Mf,cf.disabled=!Mf,sf.disabled=!Mf,xf.hidden=!(jf?.mode===`live`&&o()),Sf.disabled=Q(`messages`).querySelectorAll(`.message`).length===0,cf.setAttribute(`aria-pressed`,String(e)),sf.setAttribute(`aria-pressed`,String(e)),cf.querySelector(`span`).textContent=t?`通话中`:e?`连接中…`:`语音通话`,sf.querySelector(`span`).textContent=e?`挂断通话`:`语音通话`,lf.hidden=!e,lf.classList.toggle(`is-connected`,t),uf.classList.toggle(`is-speaking`,Jf),hf.disabled=!t,mf.disabled=!t,gf.disabled=!t||!nm.hasMic,_f.disabled=!t||!Jf;let n=t&&nm.ready?.mode===`mock`;vf.hidden=!n,yf.hidden=!n,vf.disabled=!n,yf.disabled=!n||!Jf,Q(`choose-screen`).disabled=!Mf,Q(`sample-screen`).disabled=!Mf,Df.disabled=!Mf||Pf;let r=If?.current&&!If.current.terminal&&!If.current.cancelled,i=!!(r||Rf.playing||Jf);rf.disabled=!i,af.disabled=!i,Ef.disabled=!Mf||!zf.length||!Cf.checked||!!r||e}function Kp(){Uf=0;let e=tp.width,t=tp.height;np.clearRect(0,0,e,t);let n=getComputedStyle(document.documentElement),r=n.getPropertyValue(`--atmo-signal`).trim()||`#e83b1e`,i=n.getPropertyValue(`--ink-hairline-strong`).trim()||`rgba(17,19,24,0.28)`;np.strokeStyle=Rf.playing?r:i,np.lineWidth=Rf.playing?2.4:1.5,np.beginPath();let a=new Uint8Array(128);Rf.playing&&qp.analyser&&!ip.matches?qp.analyser.getByteTimeDomainData(a):a.fill(128);for(let n=0;n<a.length;n++){let r=t/2+(a[n]-128)*2.5,i=n/(a.length-1)*e;n===0?np.moveTo(i,r):np.lineTo(i,r)}np.stroke(),Rf.playing&&!ip.matches&&(Uf=requestAnimationFrame(Kp))}var qp=new f(e=>{Rf=e,Lf?.playback(e.playing);let t=jf?.mode===`live`?`七草荠声轨共振中`:`声波共振中（诊断音）`;Q(`audio-status`).textContent=Cf.checked?e.playing?t:e.playedChunks?`余韵已落`:`静候声波`:`声景已静默`,Q(`audio-chunks`).textContent=String(e.playedChunks),Gp(),Uf||Kp()});Lf=new sd(Q(`avatar-stage`),()=>qp.analyser,e=>jp(e));var Jp=new Vd(Q(`screen-video`),Q(`screen-sample`),(e,t,n,r)=>Of.policy(e,t,n,r),e=>{Nf=e.kind===`choosing`,Q(`screen-status`).textContent=Nf?`择取中`:e.ready?`本地预览中`:`未启视野`,Q(`screen-source-name`).textContent=e.label,Q(`screen-source-name`).parentElement.classList.toggle(`active`,e.ready),Q(`screen-placeholder`).hidden=e.ready,Q(`screen-video`).hidden=e.kind!==`window`||!e.ready,Q(`screen-sample`).hidden=e.kind!==`sample`||!e.ready,Q(`stop-screen`).disabled=e.kind===`off`,Tf.disabled=!e.ready,Tf.checked=e.ready,Q(`attachment-chip`).hidden=!e.ready,Gp()},()=>{If?.current?.hasScreen&&If.cancel(),Tf.checked=!1,Q(`attachment-chip`).hidden=!0},Wp);function Yp(t,n,r=!1,i=`http`){let a=document.createElement(`article`);a.className=`message message-${t}`,a.dataset.role=t,a.dataset.channel=i;let o=document.createElement(`div`);o.className=`message-header`;let s=document.createElement(`span`);if(s.className=t===`assistant`?`message-avatar is-portrait`:`message-avatar`,t===`assistant`){let t=document.createElement(`img`);t.src=e,t.alt=`七草荠`,s.append(t)}else s.textContent=`你`;let c=document.createElement(`span`),l=jf?.moss_live?.provider===`qwen`?`七草荠 · QWEN 3.1`:`七草荠 · MOSS-LIVE`,u=jf?.mode===`live`?`七草荠 · 实时`:`七草荠 · 离线演练`;c.textContent=t===`user`?i===`live`?`来访者 · LIVE 语音`:`来访者 · YOU`:i===`live`?l:u;let d=document.createElement(`button`);d.type=`button`,d.className=`message-copy-btn`,d.title=`复制本条文字`,d.setAttribute(`aria-label`,`复制本条文字`),d.innerHTML=`<svg class="icon"><use href="#i-copy" /></svg>`;let f=document.createElement(`time`);f.textContent=new Date().toLocaleTimeString(`zh-CN`,{hour:`2-digit`,minute:`2-digit`}),o.append(s,c,f,d);let p=document.createElement(`div`);p.className=`message-content`,p.textContent=n,d.addEventListener(`click`,()=>{let e=p.textContent?.trim();e&&navigator.clipboard&&navigator.clipboard.writeText(e).then(()=>{$.play(`click`),d.classList.add(`is-copied`),window.setTimeout(()=>d.classList.remove(`is-copied`),1100)}).catch(()=>{})});let m=document.createElement(`div`);if(m.className=`message-footer`,a.append(o,p,m),r&&t===`user`){let e=document.createElement(`div`);e.className=`message-image-label`,e.textContent=`附带视窗一帧 · FRAME ATTACHED`,a.append(e)}return Q(`messages`).append(a),Sf.disabled=!1,{content:p,footer:m}}function Xp(e=!1){let t=Q(`messages`);(e||t.scrollHeight-t.scrollTop-t.clientHeight<180)&&(t.scrollTop=t.scrollHeight)}function Zp(e){Hf++,Q(`event-count`).textContent=`${String(Hf).padStart(2,`0`)} EVENTS`,Q(`log-count`).textContent=String(Hf);let t=document.createElement(`li`),n=document.createElement(`span`);n.textContent=String(e.id).padStart(2,`0`),t.append(n,e.type);let r=Q(`event-log`);for(r.append(t);r.children.length>60;)r.firstElementChild?.remove();r.scrollTop=r.scrollHeight}function Qp(e){Hf++,Q(`event-count`).textContent=`${String(Hf).padStart(2,`0`)} EVENTS`,Q(`log-count`).textContent=String(Hf);let t=document.createElement(`li`),n=document.createElement(`span`);n.textContent=`WS`,t.append(n,e);let r=Q(`event-log`);for(r.append(t);r.children.length>60;)r.firstElementChild?.remove();r.scrollTop=r.scrollHeight}function $p(e){let t=Math.max(0,Math.floor(e/1e3));return`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function em(){Xf&&=(window.clearInterval(Xf),0),ff.textContent=`00:00`}function tm(){em(),Yf=Date.now(),ff.textContent=`00:00`,Xf=window.setInterval(()=>{ff.textContent=$p(Date.now()-Yf)},1e3)}var nm=new Ld(qp,{onState(e,t){let n=qf;if(qf=e,e===`connecting`)df.textContent=`正在握手 ${jf?.moss_live?.provider===`qwen`?`Qwen 3.1 实时语音`:`MOSS-Live`}…`,Q(`turn-status`).textContent=`正在拨通实时语音声道`,Q(`flow-state`).textContent=`WS 握手`,em();else if(e===`connected`)df.textContent=`${t?.mode===`mock`?`离线全双工演练`:t?.provider===`qwen`?`Qwen 3.1 实时在线（静默门控省流）`:`MOSS-Live 在线`} · 随时可开口`,Q(`turn-status`).textContent=t?.provider===`qwen`&&t?.mode===`live`?`Qwen 3.1 七草荠实时通话中`:`实时全双工语音通话中`,Q(`flow-state`).textContent=`全双工在线`,t?.voice&&[...hf.options].some(e=>e.value===t.voice)&&(hf.value=t.voice),t?.language&&fp.includes(t.language)&&Lp(t.language),tm(),kp.triggerFoil(.85),$.play(`callConnect`);else{let e=n===`connected`||n===`connecting`;Jf=!1,pf.value=0,em(),Lf?.playback(!1),Lf?.resetConversation(),e&&$.play(`callHangup`),Mf&&(Q(`turn-status`).textContent=`语音通话已挂断`,Q(`flow-state`).textContent=`待命`)}Gp()},onTranscript(e){if(Q(`empty-state`).hidden=!0,e.previousKey&&$f.has(e.previousKey)&&!$f.has(e.key)){let t=$f.get(e.previousKey);$f.delete(e.previousKey),$f.set(e.key,t)}let t=$f.get(e.key);t?t.content.textContent=e.text:(t=Yp(e.role,e.text,!1,`live`),$f.set(e.key,t)),e.role===`user`?t.footer.textContent=e.revised?`已修订实时转写`:e.final?`语音已识别`:`正在聆听转写…`:e.interrupted?t.footer.textContent?.startsWith(`已打断 · 已播`)||(t.footer.textContent=`已被打断 · 播放已停止`):t.footer.textContent=e.final?`全双工声轨落定`:`正在同步发声…`,Xp()},onUserSpeech(e){e?df.textContent=`正在聆听你的声音…`:(df.textContent=`七草荠正在构思回应…`,Lf?.begin(`live-think-${Date.now()}`,!1))},onAssistantStart(e){Jf=!0,Lf?.begin(e||`live-reply`,!1),Lf?.text(e||`live-reply`),df.textContent=`七草荠正在回应（随时可打断）`,kp.triggerFoil(.65),Gp()},onAssistantInterrupt(e,t,n,r){Jf=!1,Lf?.interrupt(e||`live-reply`),Dp.flash(),kp.triggerFoil(.95),$.play(`bargeIn`),df.textContent=`已打断 · 回报进度 ${r} ms`;let i=$f.get(`live-assistant-${e}`);i&&(i.footer.textContent=`已打断 · 已播 ${r} ms`),Gp()},onAssistantEnd(e,t,n){Jf=!1,n===`completed`&&(Lf?.complete(e||`live-reply`),df.textContent=`通话在线（${dp[yp]}）· 随时可开口`),Gp()},onVoiceChanged(e){[...hf.options].some(t=>t.value===e)&&(hf.value=e),$.play(`langSwitch`),df.textContent=`实时音色已热切`},onLanguageChanged(e){Lp(e),df.textContent=`已热切至 ${dp[e]} · 下句生效`,Q(`turn-status`).textContent=`实时语音已热切为 ${dp[e]}`},onMicState({available:e,muted:t,level:n}){pf.value=n,gf.disabled=qf!==`connected`||!e,gf.setAttribute(`aria-pressed`,String(t)),gf.querySelector(`span`).textContent=t?`取消静音`:`静音`;let r=gf.querySelector(`use`);r&&r.setAttribute(`href`,t?`#i-mic-off`:`#i-mic`)},onEvent(e){Qp(e)},onNotice(e){Wp(e)}});async function rm(){try{Kf=(await Of.mossVoices()).voices,hf.replaceChildren();let e=document.createElement(`option`);e.value=``,e.textContent=`默认音色`,hf.append(e);for(let e of Kf){let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,hf.append(t)}}catch{}}async function im(){if(Mf&&Af){if(nm.isActive)nm.disconnect();else{If.cancel();try{let e;(jf?.mode===`live`||o())&&(e=(await Of.liveTicket(Af.id)).ticket),await nm.connect(Af.id,hf.value||void 0,e,yp)}catch(e){Wp(e),Gp()}}}}function am(e){return typeof e==`number`?`${Math.round(e)} ms`:`—`}function om(){qp.stop(),zf=[],Bf=0,Vf=``,Gp()}If=new ef(Of,{created(e){Lf?.begin(e.localId,e.hasScreen),Q(`empty-state`).hidden=!0,Yp(`user`,e.text,e.hasScreen);let t=Yp(`assistant`,``);t.footer.textContent=`正在汇聚回应…`,Qf.set(e.localId,t),Q(`turn-status`).textContent=e.hasScreen?`正在凝视所附画面`:`正在构思回应`,Q(`flow-state`).textContent=`流式生成`;for(let e of[`first-text`,`first-audio`,`duration`])Q(e).textContent=`—`;Hf=0,Q(`event-count`).textContent=`00 EVENTS`,Q(`log-count`).textContent=`0`,Q(`event-log`).replaceChildren(),zf=[],Bf=0,Vf=``,qp.begin(e.localId),kp.triggerFoil(.7),Gp(),Xp(!0)},event(e,t){let n=Qf.get(e.localId);Zp(t);let r=t.data;if(t.type===`turn.started`){if(r.mode!==`mock`&&!o()){If.cancel(),Wp(new s(`test_ui_requires_mock`));return}qp.begin(t.turn_id);try{qp.configure(Number(r.sample_rate),Number(r.channels),String(r.audio_format))}catch(e){Wp(e)}n.footer.textContent=`管线已开启，正在落字…`}else if(t.type===`text.delta`&&typeof r.text==`string`)Lf?.text(e.localId),n.content.textContent+=r.text,Xp();else if(t.type===`audio.chunk`&&typeof r.audio_base64==`string`){if(Cf.checked)try{qp.push(t.turn_id,r.audio_base64),Bf+=r.audio_base64.length,Bf<=28e5?(zf.push(r.audio_base64),Vf=t.turn_id):(zf=[],Vf=``)}catch(e){om(),Wp(e)}}else t.type===`audio.clear`?om():t.type===`warning`?n.footer.textContent=`声景暂不可用，文字回应继续。`:t.type===`turn.completed`?(Lf?.complete(e.localId),$.play(`replyDone`),Q(`turn-status`).textContent=`本轮回应落定`,Q(`flow-state`).textContent=`已落定`,n.footer.textContent=r.audio_status===`failed`?`文字落定 · 声景未合成`:jf?.mode===`live`?`声轨已落定`:`离线演练完成`,Q(`first-text`).textContent=am(r.first_text_ms),Q(`first-audio`).textContent=am(r.first_audio_ms),Q(`duration`).textContent=am(r.duration_ms)):(t.type===`turn.cancelled`||t.type===`turn.failed`)&&(om(),t.type===`turn.cancelled`?Lf?.interrupt(e.localId):Lf?.fail(e.localId),Q(`turn-status`).textContent=t.type===`turn.cancelled`?`已刹那止声`:`本轮未能完成`,Q(`flow-state`).textContent=t.type===`turn.cancelled`?`已截断`:`异常`,n.footer.textContent=t.type===`turn.cancelled`?`已打断 · 播放队列已清空`:`本轮中断 · ${String(r.reason??``)}`,t.type===`turn.failed`&&n.footer.classList.add(`error`));Gp()},stopped(e){om(),Lf?.interrupt(e.localId),Dp.flash(),kp.triggerFoil(.9),$.play(`bargeIn`);let t=Qf.get(e.localId);t&&!e.terminal&&(t.footer.textContent=`已打断 · 播放队列已清空`),Q(`turn-status`).textContent=e.terminal?`声景已止`:`已刹那止声`,Q(`flow-state`).textContent=`已截断`,Q(`audio-status`).textContent=`声景已止`,Gp()},error(e,t){if(If.current!==e)return;om(),Lf?.fail(e.localId);let n=Qf.get(e.localId);n&&(n.footer.textContent=e.cancelled?`本地已止声，后端取消尚待确认。`:d(t),n.footer.classList.add(`error`)),Q(`turn-status`).textContent=`链路待检查`,Q(`flow-state`).textContent=`待检查`,Wp(t),Gp()}});function sm(){Q(`memory-count-badge`).textContent=String(Gf.length);let e=Q(`memory-proposals`);e.replaceChildren();let t=Wf.filter(e=>e.status===`pending`);if(t.length)for(let n of t){let t=document.createElement(`li`);t.className=`memory-item`;let r=document.createElement(`span`);r.className=`memory-item-text`,r.textContent=n.text;let i=document.createElement(`button`);i.type=`button`,i.className=`memory-item-btn`,i.textContent=`确认采纳`,i.addEventListener(`click`,()=>void um(n.id)),t.append(r,i),e.append(t)}else{let t=document.createElement(`li`);t.className=`memory-empty`,t.textContent=`发送「记住：……」后点击「整理本卷记忆」即可提取候选事实。`,e.append(t)}let n=Q(`memory-facts`);if(n.replaceChildren(),Gf.length)for(let e of Gf){let t=document.createElement(`li`);t.className=`memory-item`;let r=document.createElement(`span`);r.className=`memory-item-text`,r.textContent=e.text;let i=document.createElement(`div`);i.className=`memory-item-actions`;let a=document.createElement(`button`);a.type=`button`,a.className=`memory-item-btn`,a.textContent=`编辑`,a.addEventListener(`click`,()=>{$.play(`click`),t.replaceChildren();let n=document.createElement(`input`);n.type=`text`,n.className=`memory-edit-input`,n.value=e.text,n.maxLength=500;let r=document.createElement(`button`);r.type=`button`,r.className=`memory-item-btn`,r.textContent=`保存`;let i=document.createElement(`button`);i.type=`button`,i.className=`memory-item-btn danger`,i.textContent=`取消`;let a=()=>{let t=n.value.trim();!t||t===e.text?sm():dm(e.id,t)};r.addEventListener(`click`,a),i.addEventListener(`click`,()=>sm()),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),a()),e.key===`Escape`&&(e.preventDefault(),sm())}),t.append(n,r,i),n.focus(),n.select()});let o=document.createElement(`button`);o.type=`button`,o.className=`memory-item-btn danger`,o.textContent=`遗忘`,o.addEventListener(`click`,()=>void fm(e.id)),i.append(a,o),t.append(r,i),n.append(t)}else{let e=document.createElement(`li`);e.className=`memory-empty`,e.textContent=`尚无跨卷生效的长期记忆。`,n.append(e)}}async function cm(){if(Af)try{Gf=(await Of.facts(Af.id)).facts,sm()}catch(e){Wp(e)}}async function lm(){if(Af&&Mf&&!Pf){Pf=!0,Q(`memory-status`).textContent=`正在整理文字卷…`,Gp();try{let e=await Of.organizeMemory(Af.id);for(let t=0;t<120&&(e.status===`queued`||e.status===`running`);t++)await new Promise(e=>setTimeout(e,60)),e=await Of.memoryJob(e.id);e.status===`completed`?(Wf=e.proposals,Q(`memory-status`).textContent=e.proposal_count?`提取 ${e.proposal_count} 条候选`:`未发现新事实`,kp.triggerFoil(.8)):Q(`memory-status`).textContent=`整理未完成 (${e.error_code??e.status})`,sm()}catch(e){Q(`memory-status`).textContent=`整理失败`,Wp(e)}finally{Pf=!1,Gp()}}}async function um(e){try{await Of.acceptProposal(e),Wf=Wf.filter(t=>t.id!==e),Q(`memory-status`).textContent=`已写入长期记忆`,kp.triggerFoil(.85),$.play(`memorySave`),await cm()}catch(e){Wp(e)}}async function dm(e,t){try{await Of.editFact(e,t),Wf=[],Q(`memory-status`).textContent=`已修订长期记忆`,$.play(`memorySave`),await cm()}catch(e){Wp(e)}}async function fm(e){try{await Of.deleteFact(e),Wf=[],Q(`memory-status`).textContent=`已遗忘并失效旧上下文`,Dp.flash(),$.play(`click`),await cm()}catch(e){Wp(e)}}Df.addEventListener(`click`,()=>void lm());async function pm(){let e=++Ff;nm.disconnect(),Lf?.connected(!1),Mf=!1,Gp(),If.cancel(),await Jp.stop(),Q(`connection-status`).textContent=`正在接通`;try{if(jf=await Of.connect(),e!==Ff)return;Q(`live-auth-bar`).hidden=!0;let t=jf.mode===`live`,n=jf.moss_live?.provider!==`moss`;if(Q(`mode-badge-text`).textContent=t?n?`实时 · QWEN`:`实时 · MOSS`:`离线演练`,Q(`pipeline-badge`).textContent=t?n?`QWEN REALTIME`:`MOSS-LIVE`:`MOCK PIPELINE`,Q(`calibration-engine`).textContent=n?`DEEPSEEK FLASH × QWEN 3.1 REALTIME`:`DEEPSEEK FLASH × MOSS-LIVE 1.0`,jf.moss_live?.language&&fp.includes(jf.moss_live.language))try{localStorage.getItem(sp)||Lp(jf.moss_live.language)}catch{}if(Af)try{Af=await Of.restoreSession(Af.id)}catch(e){if(!(e instanceof s)||e.status!==404)throw e;Af=await Of.session({character_id:`nazuna`,system_prompt:xp}),vm()}else Af=await Of.session({character_id:`nazuna`,system_prompt:xp});if(e!==Ff)return;Mf=!0,Lf?.connected(!0),Q(`session-label`).textContent=`VOL.${Af.id.slice(0,8).toUpperCase()}`,Q(`connection-status`).textContent=`已接通`,Q(`notice`).hidden=!0,Gp(),cm(),rm()}catch(t){if(e!==Ff)return;t instanceof s&&(t.code===`test_ui_requires_mock`||t.status===401)&&(t.status===401&&o()&&a(),Q(`live-auth-bar`).hidden=!1),Q(`connection-status`).textContent=`尚未接通`,Wp(t),Gp()}}Q(`live-auth-bar`).addEventListener(`submit`,e=>{e.preventDefault();let t=Q(`live-token-input`),n=Q(`live-token-remember`),r=t.value.trim();r&&($.play(`click`),i(r,n.checked),t.value=``,pm())}),xf.addEventListener(`click`,()=>{$.play(`click`),a(),nm.disconnect(),pm()});function mm(){nm.isConnected&&Jf?jf?.mode===`mock`?nm.sendMockBargeIn():nm.interrupt():If.cancel()}function hm(){let e=[...Q(`messages`).querySelectorAll(`.message`)];if(!e.length)return;let t=[`# 回声 · ECHO 对话卷面 (${Q(`session-label`).textContent??``})`,`导出时间：${new Date().toLocaleString(`zh-CN`)}`,`语音语言：${dp[yp]}`,``];for(let n of e){let e=n.querySelector(`.message-header span:nth-of-type(2)`)?.textContent??n.dataset.role??``,r=n.querySelector(`time`)?.textContent??``,i=n.querySelector(`.message-content`)?.textContent?.trim()??``;t.push(`### ${e} (${r})`,``,i,``)}let n=new Blob([t.join(`
`)],{type:`text/markdown;charset=utf-8`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`echo-nazuna-${new Date().toISOString().slice(0,16).replace(/[:T]/g,`-`)}.md`,i.click(),URL.revokeObjectURL(r),$.play(`memorySave`)}function gm(){if(!Mf||Nf||!Af||!tf.value.trim())return;let e=tf.value.trim(),t=Af.id,n=Tf.checked&&Jp.available,r=Cf.checked,i=r?qp.unlock():Promise.resolve();i.catch(()=>{}),$.play(`send`),tf.value=``,Gp(),If.send(t,e,n,async()=>{if(await i,n&&Jp.owner!==t)throw new s(`capture_changed`);return{request_id:crypto.randomUUID(),text:e,speak:r,supersede:!0,...n?{screen:Jp.snapshot()}:{}}}),tf.focus()}Q(`composer`).addEventListener(`submit`,e=>{e.preventDefault(),gm()}),tf.addEventListener(`input`,Gp),tf.addEventListener(`keydown`,e=>{e.key===`Enter`&&!e.shiftKey&&!e.isComposing&&(e.preventDefault(),gm())}),document.addEventListener(`keydown`,e=>{if(e.key===`Escape`)e.preventDefault(),Np.close(),mm();else if(e.altKey&&!e.ctrlKey&&!e.metaKey){let t=e.key.toLowerCase();if(t===`l`)e.preventDefault(),Rp(fp[(fp.indexOf(yp)+1)%fp.length],!0);else if(t===`m`&&nm.isConnected&&nm.hasMic){e.preventDefault();let t=!nm.isMuted;nm.setMicMuted(t),$.play(t?`micOff`:`micOn`)}else t===`v`&&Mf&&(e.preventDefault(),im())}}),Q(`interrupt`).addEventListener(`click`,mm),af.addEventListener(`click`,mm),_f.addEventListener(`click`,mm),cf.addEventListener(`click`,()=>void im()),sf.addEventListener(`click`,()=>void im()),bf.addEventListener(`click`,()=>nm.disconnect()),gf.addEventListener(`click`,()=>{let e=!nm.isMuted;nm.setMicMuted(e),$.play(e?`micOff`:`micOn`)}),document.querySelectorAll(`[data-live-lang]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.liveLang;fp.includes(t)&&Rp(t,!0)})}),mf.addEventListener(`change`,()=>{let e=mf.value;fp.includes(e)&&Rp(e,!0)}),hf.addEventListener(`change`,()=>{hf.value&&nm.setVoice(hf.value)}),vf.addEventListener(`click`,()=>{let e=ep[Zf%ep.length];Zf++,$.play(`send`),nm.sendMockUtterance(e)}),yf.addEventListener(`click`,()=>nm.sendMockBargeIn()),Sf.addEventListener(`click`,hm),Q(`avatar-nod`).addEventListener(`click`,()=>$.play(`avatarReact`)),Q(`avatar-wave`).addEventListener(`click`,()=>$.play(`avatarReact`)),Q(`avatar-canvas`).addEventListener(`click`,()=>$.play(`avatarReact`)),Q(`avatar-live2d-canvas`).addEventListener(`click`,()=>$.play(`avatarReact`)),Q(`avatar-mode-toggle`).addEventListener(`click`,()=>$.play(`click`)),Q(`persona-apply-btn`).addEventListener(`click`,()=>{let e=Q(`persona-prompt-input`).value.trim();if(e){xp=e;try{localStorage.setItem(up,e)}catch{}$.play(`memorySave`),Np.close(),ym()}}),wf.checked=$.isEnabled,wf.addEventListener(`change`,()=>{$.setEnabled(wf.checked),wf.checked&&$.play(`langSwitch`)}),Q(`sfx-preview`).addEventListener(`click`,()=>{$.isEnabled||($.setEnabled(!0),wf.checked=!0),$.play(`memorySave`)}),Q(`reconnect`).addEventListener(`click`,()=>{$.play(`click`),pm()}),Q(`dismiss-notice`).addEventListener(`click`,()=>{$.play(`click`),Q(`notice`).hidden=!0}),document.querySelectorAll(`[data-prompt]`).forEach(e=>{e.addEventListener(`click`,()=>{$.play(`click`),tf.value=e.dataset.prompt,Gp(),tf.focus()})}),Q(`sample-screen`).addEventListener(`click`,()=>{$.play(`click`),Af&&Mf&&Jp.useSample(Af.id)}),Q(`choose-screen`).addEventListener(`click`,()=>{$.play(`click`),Af&&Mf&&Jp.chooseWindow(Af.id).catch(Wp)}),Q(`stop-screen`).addEventListener(`click`,()=>{$.play(`click`),Jp.stop()}),Tf.addEventListener(`change`,()=>{$.play(`click`),Q(`attachment-chip`).hidden=!Tf.checked}),Cf.addEventListener(`change`,()=>{qp.setEnabled(Cf.checked),Cf.checked?(qp.unlock().catch(Wp),$.play(`click`)):(zf=[],Vf=``),Gp()});var _m=Q(`volume`);_m.value=String(Sp),qp.setVolume(Sp/100),$.setVolume(Sp/100),Q(`volume-value`).textContent=`${Sp}%`,_m.addEventListener(`input`,e=>{let t=Number(e.target.value);qp.setVolume(t/100),$.setVolume(t/100),Q(`volume-value`).textContent=`${t}%`;try{localStorage.setItem(cp,String(t))}catch{}}),Ef.addEventListener(`click`,async()=>{let e=[...zf],t=Vf;try{if(await qp.unlock(),t!==Vf||!Cf.checked)return;Lf?.replay(),qp.begin(t);for(let n of e)qp.push(t,n);Q(`audio-status`).textContent=`正在重播上轮声轨`}catch(e){Wp(e)}});function vm(){Qf.clear(),$f.clear(),If.current=null,Wf=[],Lf?.resetConversation(),qp.begin(``),Q(`messages`).querySelectorAll(`.message`).forEach(e=>e.remove()),Q(`empty-state`).hidden=!1,Q(`turn-status`).textContent=`静候第一句落笔`,Q(`flow-state`).textContent=`待命`,Q(`event-log`).replaceChildren(),Q(`event-count`).textContent=`00 EVENTS`,Q(`log-count`).textContent=`0`;for(let e of[`first-text`,`first-audio`,`duration`])Q(e).textContent=`—`;sm()}async function ym(){let e=++Ff;nm.disconnect(),Lf?.connected(!1),Mf=!1,Gp(),If.cancel(),await Jp.stop();try{let t=await Of.session({character_id:`nazuna`,system_prompt:xp});if(e!==Ff)return;Af=t,Mf=!0,vm(),Dp.flash(),$.play(`skyShift`),Lf?.connected(!0),Q(`session-label`).textContent=`VOL.${Af.id.slice(0,8).toUpperCase()}`,Gp(),tf.focus(),cm()}catch(e){Wp(e),Gp()}}Q(`new-session`).addEventListener(`click`,()=>void ym()),Q(`mobile-new-session`).addEventListener(`click`,()=>void ym()),of.addEventListener(`click`,()=>void ym()),window.addEventListener(`pagehide`,()=>{nm.disconnect(),If.cancel(!0),Jp.stop(!0),qp.stop(),zp.stop(),kp.dispose()}),jp(`offline`),Pp(_p,!1),Fp(vp),Lp(yp),Ip(),zp.start(),Kp(),pm();export{Fo as $,ra as A,Vt as B,Vr as C,We as D,Ue as E,$e as F,ja as G,q as H,lo as I,_ as J,Aa as K,Ro as L,b as M,S as N,Qi as O,x as P,Ln as Q,so as R,zi as S,za as T,pi as U,G as V,ti as W,v as X,y as Y,Za as Z,rs as _,U as _t,is as a,Ht as at,ho as b,Tr as c,Qe as ct,J as d,Ti as dt,Ao as et,K as f,Mr as ft,po as g,Ta as gt,bn as h,go as ht,no as i,ns as it,na as j,Wi as k,Br as l,Oa as lt,it as m,an as mt,Au as n,la as nt,Ei as o,$a as ot,Lo as p,Mo as pt,g as q,X as r,ia as rt,sr as s,m as st,Qu as t,Po as tt,h as u,Ai as ut,Rn as v,W as vt,Ur as w,ji as x,Bo as y,to as yt,Yr as z};