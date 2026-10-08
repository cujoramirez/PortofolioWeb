// Lists layout-shift sources during load (mobile emulation, throttled like perf.mjs; --desktop for 1350 x 940).
import { guard } from './chrome-guard.mjs';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const url = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9700 + Math.floor(Math.random() * 90);
const chrome = guard(spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cls-'))}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' }));
let ws; for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(150); }
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pend = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Network.enable');
// --desktop: 1350 x 940, unthrottled (as perf.mjs --desktop)
if (process.argv.includes('--desktop')) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1350, height: 940, deviceScaleFactor: 1, mobile: false });
} else {
  await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 823, deviceScaleFactor: 1.75, mobile: true });
  await send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 1474.56 * 1024 / 8, uploadThroughput: 675 * 1024 / 8 });
  await send('Emulation.setCPUThrottlingRate', { rate: 4 });
}
await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__shifts = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).map((s) => { const n = s.node; const d = n && n.nodeType === 1 ? n.tagName + (n.id ? '#' + n.id : '') + '.' + String(n.className || '').split(' ').slice(0, 2).join('.') : (n ? '#text:' + (n.textContent || '').slice(0, 30) : '?'); return d + ' ' + JSON.stringify([Math.round(s.previousRect.x), Math.round(s.currentRect.x), Math.round(s.previousRect.y), Math.round(s.currentRect.y), Math.round(s.currentRect.width), Math.round(s.currentRect.height)]); }) }); }).observe({ type: 'layout-shift', buffered: true });` });
await send('Page.navigate', { url });
await sleep(9000);
const r = await send('Runtime.evaluate', { expression: 'JSON.stringify(window.__shifts)', returnByValue: true });
for (const s of JSON.parse(r.result.result.value)) console.log(s.t, s.v, s.src.join(' | ').slice(0, 400));
chrome.kill('SIGKILL'); process.exit(0);
