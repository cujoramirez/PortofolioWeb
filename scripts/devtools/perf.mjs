// Page-load, idle, interaction and scroll audits over raw CDP. The phone preset is Lighthouse's
// devtools "mobileSlow4G"; --desktop is 1350 x 940, unthrottled.
// usage: node perf.mjs <url> [--desktop] [--runs 3] [--reduced] [--actions] [--scroll] [--speed 1200] [--cpu 4] [--software]
// default    LCP (element + time), CLS, JS/CSS/image bytes transferred, long tasks, rAF callbacks
//            and running infinite animations during a 2.5 s idle window after load.
// --actions  scripted interactions (hover, globe drag, project dialog, theme toggle, search
//            palette; the menu sheet on the phone preset). After each: the 2.5 s idle window,
//            starting 1 s after the last input, and the interaction's INP with its three phases.
//            Runs under 4x CPU throttle on both presets.
// --scroll   one full-page scroll gesture: frame-interval percentiles and the ten longest
//            animation frames with their top script and forced style/layout time (Chrome only).
// Add ?tier=high to the URL for --actions and --scroll: headless Chrome counts as a low-tier
// device and would be measured as the static poster.
import { WEBGL, flag, launch, opt, sleep } from './cdp.mjs';

const url = process.argv[2];
const runs = Number(opt('runs', 3));
const desktop = flag('desktop');
const [W, H] = desktop ? [1350, 940] : [412, 823];
const kb = (n) => (n / 1024).toFixed(1);

const COUNTERS = `
    window.__perf = { lcp: null, lcpEl: '', cls: 0, longTasks: 0, longTaskMs: 0, raf: 0 };
    const _raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { window.__perf.raf++; window.__perf.lastRaf = performance.now(); return _raf(cb); };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.lcp = e.startTime; const el = e.element; window.__perf.lcpEl = el ? (el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0,2).join('.') : '') + ' ' + (el.currentSrc || el.src || (el.textContent || '').slice(0, 40)).toString().slice(0, 70)) : '(no element)'; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.longTasks++; window.__perf.longTaskMs += e.duration; } }).observe({ type: 'longtask', buffered: true });
`;
// Timers, event timing, long animation frames and a frame-interval recorder (on the unwrapped
// rAF, so recording does not count as page activity).
const MORE = `
    Object.assign(window.__perf, { lastRaf: 0, timers: 0, intervals: new Map(), events: [], loaf: [], pace: null });
    const counted = (fn) => (typeof fn === 'function' ? function (...a) { window.__perf.timers++; return fn.apply(this, a); } : fn);
    const _st = window.setTimeout.bind(window), _si = window.setInterval.bind(window), _ci = window.clearInterval.bind(window);
    window.setTimeout = (fn, ms, ...a) => _st(counted(fn), ms, ...a);
    window.setInterval = (fn, ms, ...a) => { const id = _si(counted(fn), ms, ...a); window.__perf.intervals.set(id, ms); return id; };
    window.clearInterval = (id) => { window.__perf.intervals.delete(id); return _ci(id); };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__perf.events.push({ n: e.name, s: e.startTime, d: e.duration, ps: e.processingStart, pe: e.processingEnd, id: e.interactionId }); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { const top = [...e.scripts].sort((a, b) => b.duration - a.duration)[0]; window.__perf.loaf.push({ s: e.startTime, d: e.duration, b: e.blockingDuration, forced: e.scripts.reduce((n, x) => n + x.forcedStyleAndLayoutDuration, 0), url: top ? top.sourceURL : '', fn: top ? (top.sourceFunctionName || top.invoker) : '' }); } }).observe({ type: 'long-animation-frame', buffered: true }); } catch {}
    window.__perf.startPace = () => { const p = window.__perf; p.pace = []; const tick = (t) => { if (!p.pace) return; p.pace.push(t); _raf(tick); }; _raf(tick); };
    window.__perf.stopPace = () => { const out = window.__perf.pace; window.__perf.pace = null; return out; };
`;

async function load() {
  const c = await launch({ timeout: 90000 });
  const { send } = c;
  const bytes = { js: 0, css: 0, img: 0, font: 0, other: 0 }; const types = new Map();
  c.on((m) => {
    if (m.method === 'Network.responseReceived') types.set(m.params.requestId, m.params.type);
    if (m.method === 'Network.loadingFinished') {
      const t = types.get(m.params.requestId); const n = m.params.encodedDataLength;
      if (t === 'Script') bytes.js += n; else if (t === 'Stylesheet') bytes.css += n; else if (t === 'Image') bytes.img += n; else if (t === 'Font') bytes.font += n; else bytes.other += n;
    }
  });
  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  if (!desktop) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1.75, mobile: true });
    await send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 1474.56 * 1024 / 8, uploadThroughput: 675 * 1024 / 8 });
    await send('Emulation.setCPUThrottlingRate', { rate: 4 });
  } else {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: flag('reduced') ? 'reduce' : 'no-preference' }, { name: 'prefers-color-scheme', value: 'dark' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: COUNTERS });
  const t0 = Date.now();
  const loaded = c.once('Page.loadEventFired');
  await send('Page.navigate', { url });
  await loaded;
  const loadMs = Date.now() - t0;
  await sleep(desktop ? 2500 : 6000); // let lazy chunks + fonts settle
  const r1 = await c.evaluate('window.__perf.raf');
  await sleep(2500);
  const res = await c.evaluate(`(() => { const p = window.__perf; const anims = document.getAnimations().filter(a => a.playState === 'running' && (a.effect?.getComputedTiming?.().iterations === Infinity)).map(a => (a.animationName || a.constructor.name) + '@' + (a.effect?.target?.className?.toString?.().slice(0,30) || a.effect?.target?.tagName)); return { lcp: p.lcp, lcpEl: p.lcpEl, cls: p.cls, longTasks: p.longTasks, longTaskMs: Math.round(p.longTaskMs), raf: p.raf, anims }; })()`);
  c.close();
  return { ...res, idleRaf: res.raf - r1, loadMs, bytes };
}

/** A loaded page with every lazy scene mounted, for the interaction and scroll audits. */
async function open(cpu) {
  // The Mac's own GPU unless --software: under SwiftShader a dialog's backdrop blur alone takes
  // ~500 ms to present, which would be reported as the interaction's INP.
  const c = await launch({ flags: [...(flag('software') ? WEBGL : []), '--hide-scrollbars', `--window-size=${W},${H}`], timeout: 300000 });
  const { send, evaluate } = c;
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: desktop ? 1 : 1.75, mobile: !desktop });
  if (!desktop) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: flag('reduced') ? 'reduce' : 'no-preference' }, { name: 'prefers-color-scheme', value: 'dark' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: COUNTERS + MORE });
  const loaded = c.once('Page.loadEventFired');
  await send('Page.navigate', { url });
  await loaded;
  await sleep(2500);
  // The page is quiet once it stops requesting frames.
  const quiet = async (max = 5000) => {
    let last = -1, still = 0;
    for (const t0 = Date.now(); still < 4 && Date.now() - t0 < max; ) {
      const n = await evaluate('window.__perf.raf');
      still = n === last ? still + 1 : 0;
      last = n;
      await sleep(70);
    }
  };
  const mountAll = async () => {
    // Any in-page jump mounts every lazy scene first (src/lib/jump.ts).
    await evaluate(`document.querySelector('a.nav__brand')?.click(); 0`);
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`![...document.querySelectorAll('section.scene')].some((s) => s.style.minHeight)`)) break;
      await sleep(150);
    }
    await sleep(1200);
    await quiet();
  };
  if (cpu > 1) await send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const renderer = await evaluate(`(() => { const gl = document.createElement('canvas').getContext('webgl'); const info = gl && gl.getExtension('WEBGL_debug_renderer_info'); return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)).replace(/^ANGLE \\((.*)\\)$/, '$1') : 'no WebGL'; })()`);
  return { ...c, quiet, mountAll, renderer };
}

async function actions() {
  const c = await open(Number(opt('cpu', 4)));
  const { send, evaluate, quiet } = c;
  await c.mountAll();

  const point = (sel) => evaluate(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.getClientRects().length); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
  const bring = async (sel) => {
    await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - (innerHeight - r.height) / 2); window.dispatchEvent(new Event('scroll')); })(); 0`);
    await quiet();
  };
  const mouse = (type, { x, y }, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, ...extra });
  const touch = (type, pts) => send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const press = async (sel) => {
    const p = await point(sel);
    if (!p) return false;
    if (desktop) {
      await mouse('mouseMoved', p);
      await mouse('mousePressed', p, { button: 'left', buttons: 1, clickCount: 1 });
      await mouse('mouseReleased', p, { button: 'left', clickCount: 1 });
    } else {
      await touch('touchStart', [p]);
      await touch('touchEnd', []);
    }
    return true;
  };
  const key = async (k, code, vk, modifiers = 0) => {
    for (const type of ['rawKeyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers });
  };
  const escape = () => key('Escape', 'Escape', 27);
  const isOpen = (sel) => evaluate(`Boolean(document.querySelector(${JSON.stringify(sel)}))`);
  // A resting place for the pointer that hovers nothing interactive.
  const away = { x: 3, y: Math.round(H / 2) };

  const list = [];
  if (desktop) {
    list.push(['hover a More work card, then leave', async () => {
      await bring('.wall__card');
      const p = await point('.wall__card');
      for (let i = 0; i <= 8; i++) { await mouse('mouseMoved', { x: p.x - 80 + i * 20, y: p.y - 40 + i * 10 }); await sleep(30); }
      await mouse('mouseMoved', away);
      return '';
    }]);
  }
  list.push(['drag the Toolbox globe', async () => {
    await bring('.globe');
    const p = await point('.globe');
    if (desktop) {
      await mouse('mouseMoved', p);
      await mouse('mousePressed', p, { button: 'left', buttons: 1, clickCount: 1 });
      for (let i = 1; i <= 12; i++) { await mouse('mouseMoved', { x: p.x + i * 18, y: p.y }, { button: 'left', buttons: 1 }); await sleep(16); }
      await mouse('mouseReleased', { x: p.x + 216, y: p.y }, { button: 'left', clickCount: 1 });
      await mouse('mouseMoved', away);
    } else {
      await touch('touchStart', [p]);
      for (let i = 1; i <= 12; i++) { await touch('touchMove', [{ x: p.x + i * 12, y: p.y }]); await sleep(16); }
      await touch('touchEnd', []);
    }
    return '';
  }]);
  list.push(['open and close a project dialog', async () => {
    await bring('.wall__card');
    await press('.wall__card');
    await sleep(700);
    const opened = await isOpen('dialog.project-dialog[open]');
    if (desktop) await escape(); else await press('dialog.project-dialog[open] .dialog__head .icon-btn');
    if (desktop) await mouse('mouseMoved', away);
    await sleep(100);
    return `opened ${opened}, closed ${!(await isOpen('dialog.project-dialog[open]'))}`;
  }]);
  if (!desktop) {
    list.push(['open and close the menu sheet', async () => {
      await press('.nav__menu');
      await sleep(1700);
      const opened = await isOpen('dialog.menu[open]');
      await press('.menu__close');
      return `opened ${opened}`;
    }]);
  }
  list.push(['toggle the theme', async () => {
    const before = await evaluate('document.documentElement.dataset.theme');
    await press('.nav__tools [aria-label^="Switch to"]');
    if (desktop) await mouse('mouseMoved', away);
    await sleep(900);
    return `${before} -> ${await evaluate('document.documentElement.dataset.theme')}`;
  }]);
  list.push(['open and close search (Ctrl+K)', async () => {
    await key('k', 'KeyK', 75, 2);
    await sleep(900);
    const opened = await isOpen('dialog[open]');
    await escape();
    await sleep(100);
    return `opened ${opened}, closed ${!(await isOpen('dialog[open]'))}`;
  }]);

  console.log(`Per-action idle check and INP, ${desktop ? 'desktop' : 'phone'} ${W} x ${H}, CPU x${opt('cpu', 4)}, ${c.renderer}`);
  let worst = null;
  for (const [name, run] of list) {
    await quiet();
    const t0 = await evaluate('performance.now()');
    const note = await run();
    const tLast = await evaluate('performance.now()');
    await sleep(1000);
    const a = await evaluate('({ raf: window.__perf.raf, timers: window.__perf.timers })');
    await sleep(2500);
    const b = await evaluate(`(() => { const p = window.__perf; return { raf: p.raf, timers: p.timers, lastRaf: p.lastRaf, hidden: document.visibilityState !== 'visible',
      running: document.getAnimations().filter((x) => x.playState === 'running').map((x) => (x.animationName || x.transitionProperty || x.constructor.name) + '@' + (x.effect?.target?.className?.toString?.().slice(0, 30) || x.effect?.target?.tagName)),
      intervals: [...p.intervals.values()].filter((ms) => ms < 60000),
      events: p.events.filter((e) => e.s >= ${t0}) }; })()`);
    // An interaction's latency is its slowest event; the phases come from that event.
    const slowest = b.events.sort((x, y) => y.d - x.d)[0];
    const inp = slowest ? `INP ${slowest.d.toFixed(0)} ms (${slowest.n}: delay ${(slowest.ps - slowest.s).toFixed(0)}, processing ${(slowest.pe - slowest.ps).toFixed(0)}, presentation ${Math.max(0, slowest.s + slowest.d - slowest.pe).toFixed(0)})` : 'INP under 16 ms or no click, tap or key';
    if (slowest && (!worst || slowest.d > worst.d)) worst = { ...slowest, name };
    const settled = Math.max(0, b.lastRaf - tLast);
    console.log(`${name}${note ? ` [${note}]` : ''}\n  idle rAF/2.5s ${b.raf - a.raf}  timer callbacks ${b.timers - a.timers}  running animations ${b.running.length}  short intervals ${b.intervals.length}  last frame ${settled.toFixed(0)} ms after the last input\n  ${inp}`);
    if (b.running.length) console.log(`  running: ${b.running.slice(0, 6).join(', ')}`);
    // A hidden page requests no frames at all, so its zero means nothing.
    if (b.hidden) { console.error('  INVALID: the page was hidden during this window'); process.exitCode = 3; }
  }
  if (worst) console.log(`worst INP: ${worst.d.toFixed(0)} ms, "${worst.name}" (${worst.n}: delay ${(worst.ps - worst.s).toFixed(0)}, processing ${(worst.pe - worst.ps).toFixed(0)}, presentation ${Math.max(0, worst.s + worst.d - worst.pe).toFixed(0)})  target 100, limit 200`);
  c.close();
}

async function scrollRun() {
  const cpu = Number(opt('cpu', desktop ? 1 : 4));
  const c = await open(cpu);
  const { send, evaluate, quiet } = c;
  await quiet();
  const speed = Number(opt('speed', 1200));
  await evaluate('window.__perf.startPace(); 0');
  const t0 = await evaluate('performance.now()');
  // Wheel input on desktop (drives Lenis), touch drags on the phone preset (native scrolling).
  const chunk = Math.round((desktop ? 3 : 0.7) * H);
  let y = 0, stuck = 0;
  for (let i = 0; i < 400 && stuck < 3; i++) {
    await send('Input.synthesizeScrollGesture', { x: Math.round(W / 2), y: Math.round(H * 0.85), yDistance: -chunk, speed, gestureSourceType: desktop ? 'mouse' : 'touch' });
    const [now, max] = await evaluate('[scrollY, document.documentElement.scrollHeight - innerHeight]');
    if (now >= max - 2) { y = now; break; }
    stuck = now <= y + 2 ? stuck + 1 : 0;
    y = now;
  }
  await quiet();
  const t1 = await evaluate('performance.now()');
  const pace = await evaluate('window.__perf.stopPace()');
  const loaf = (await evaluate('window.__perf.loaf')).filter((e) => e.s >= t0);
  const gaps = pace.slice(1).map((t, i) => t - pace[i]).sort((a, b) => a - b);
  const pct = (p) => gaps[Math.min(gaps.length - 1, Math.floor((p / 100) * gaps.length))].toFixed(1);
  const over = (ms) => gaps.filter((g) => g > ms).length;
  console.log(`Full-page scroll, ${desktop ? 'desktop' : 'phone'} ${W} x ${H}, CPU x${cpu}, ${c.renderer}, ${speed} px/s: reached ${Math.round(y)}px in ${((t1 - t0) / 1000).toFixed(1)} s, ${pace.length} frames`);
  console.log(`frame interval ms: p50 ${pct(50)}  p75 ${pct(75)}  p90 ${pct(90)}  p95 ${pct(95)}  p99 ${pct(99)}  max ${gaps[gaps.length - 1].toFixed(1)}  | over 34 ms: ${over(34)} (${((100 * over(34)) / gaps.length).toFixed(1)} %)  over 50 ms: ${over(50)}`);
  const blocking = Math.max(0, ...loaf.map((e) => e.b));
  console.log(`long animation frames: ${loaf.length}, longest blockingDuration ${blocking.toFixed(0)} ms (limit 100)`);
  for (const e of loaf.sort((a, b) => b.d - a.d).slice(0, 10)) {
    console.log(`  ${e.d.toFixed(0).padStart(4)} ms  blocking ${e.b.toFixed(0).padStart(3)}  forced style/layout ${e.forced.toFixed(0).padStart(3)}  at ${(e.s - t0).toFixed(0).padStart(6)} ms  ${e.url.split('/').pop() || '(no script)'} ${e.fn}`);
  }
  c.close();
}

if (flag('actions')) await actions();
if (flag('scroll')) await scrollRun();
if (!flag('actions') && !flag('scroll')) {
  const results = [];
  for (let i = 0; i < runs; i++) results.push(await load());
  for (const r of results) console.log(`LCP ${r.lcp?.toFixed(0)} ms  CLS ${r.cls.toFixed(3)}  load ${r.loadMs} ms  longTasks ${r.longTasks} (${r.longTaskMs} ms)  JS ${kb(r.bytes.js)} KB  CSS ${kb(r.bytes.css)} KB  img ${kb(r.bytes.img)} KB  font ${kb(r.bytes.font)} KB  idle rAF/2.5s ${r.idleRaf}  infinite anims ${r.anims.length}`);
  const lcps = results.map((r) => r.lcp).sort((a, b) => a - b);
  console.log(`median LCP ${lcps[Math.floor(lcps.length / 2)].toFixed(0)} ms  | LCP element: ${results[0].lcpEl}`);
  if (results[0].anims.length) console.log('infinite animations:', results[0].anims.slice(0, 8).join(', '));
}
process.exit(process.exitCode ?? 0);
