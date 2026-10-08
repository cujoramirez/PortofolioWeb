// Page-load + idle audit over raw CDP with Lighthouse's devtools "mobileSlow4G" preset.
import { guard } from './chrome-guard.mjs';
// usage: node perf.mjs <url> [--runs 3] [--desktop] [--reduced]
// Reports: LCP (element + time), CLS, JS/CSS/image bytes transferred, long tasks,
// rAF callbacks and running infinite animations during a 2.5 s idle window after load.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args[0];
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const runs = Number(opt('runs', 3));
const desktop = flag('desktop');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function once() {
  const profile = mkdtempSync(join(tmpdir(), 'perf-'));
  const port = 9800 + Math.floor(Math.random() * 150);
  const chrome = guard(spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', 'about:blank'], { stdio: 'ignore' }));
  const kill = setTimeout(() => { chrome.kill('SIGKILL'); console.error('TIMEOUT'); process.exit(2); }, 90000);
  let ws;
  for (let i = 0; i < 60; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {}
    await sleep(150);
  }
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map(); const bytes = { js: 0, css: 0, img: 0, font: 0, other: 0 }; const types = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Network.responseReceived') types.set(m.params.requestId, m.params.type);
    if (m.method === 'Network.loadingFinished') {
      const t = types.get(m.params.requestId); const n = m.params.encodedDataLength;
      if (t === 'Script') bytes.js += n; else if (t === 'Stylesheet') bytes.css += n; else if (t === 'Image') bytes.img += n; else if (t === 'Font') bytes.font += n; else bytes.other += n;
    }
  });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  if (!desktop) {
    await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 823, deviceScaleFactor: 1.75, mobile: true });
    await send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 1474.56 * 1024 / 8, uploadThroughput: 675 * 1024 / 8 });
    await send('Emulation.setCPUThrottlingRate', { rate: 4 });
  } else {
    await send('Emulation.setDeviceMetricsOverride', { width: 1350, height: 940, deviceScaleFactor: 1, mobile: false });
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: flag('reduced') ? 'reduce' : 'no-preference' }, { name: 'prefers-color-scheme', value: 'dark' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__perf = { lcp: null, lcpEl: '', cls: 0, longTasks: 0, longTaskMs: 0, raf: 0 };
    const _raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { window.__perf.raf++; return _raf(cb); };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.lcp = e.startTime; const el = e.element; window.__perf.lcpEl = el ? (el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0,2).join('.') : '') + ' ' + (el.currentSrc || el.src || (el.textContent || '').slice(0, 40)).toString().slice(0, 70)) : '(no element)'; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.longTasks++; window.__perf.longTaskMs += e.duration; } }).observe({ type: 'longtask', buffered: true });
  ` });
  const t0 = Date.now();
  await send('Page.navigate', { url });
  await new Promise((res) => { const h = (e) => { const m = JSON.parse(e.data); if (m.method === 'Page.loadEventFired') { ws.removeEventListener('message', h); res(); } }; ws.addEventListener('message', h); });
  const loadMs = Date.now() - t0;
  await sleep(desktop ? 2500 : 6000); // let lazy chunks + fonts settle
  const r1 = (await send('Runtime.evaluate', { expression: 'window.__perf.raf', returnByValue: true })).result.result.value;
  await sleep(2500);
  const res = (await send('Runtime.evaluate', { expression: `(() => { const p = window.__perf; const anims = document.getAnimations().filter(a => a.playState === 'running' && (a.effect?.getComputedTiming?.().iterations === Infinity)).map(a => (a.animationName || a.constructor.name) + '@' + (a.effect?.target?.className?.toString?.().slice(0,30) || a.effect?.target?.tagName)); return { lcp: p.lcp, lcpEl: p.lcpEl, cls: p.cls, longTasks: p.longTasks, longTaskMs: Math.round(p.longTaskMs), raf: p.raf, anims }; })()`, returnByValue: true })).result.result.value;
  ws.close(); clearTimeout(kill); chrome.kill('SIGKILL');
  return { ...res, idleRaf: res.raf - r1, loadMs, bytes };
}

const results = [];
for (let i = 0; i < runs; i++) results.push(await once());
const kb = (n) => (n / 1024).toFixed(1);
for (const r of results) console.log(`LCP ${r.lcp?.toFixed(0)} ms  CLS ${r.cls.toFixed(3)}  load ${r.loadMs} ms  longTasks ${r.longTasks} (${r.longTaskMs} ms)  JS ${kb(r.bytes.js)} KB  CSS ${kb(r.bytes.css)} KB  img ${kb(r.bytes.img)} KB  font ${kb(r.bytes.font)} KB  idle rAF/2.5s ${r.idleRaf}  infinite anims ${r.anims.length}`);
const lcps = results.map((r) => r.lcp).sort((a, b) => a - b);
console.log(`median LCP ${lcps[Math.floor(lcps.length / 2)].toFixed(0)} ms  | LCP element: ${results[0].lcpEl}`);
if (results[0].anims.length) console.log('infinite animations:', results[0].anims.slice(0, 8).join(', '));
process.exit(0);
