// Film an interaction: after load (+ --eval setup), run --act (not awaited) and capture frames at
// --times (ms after the act). --slow 0.25 plays GSAP at a quarter speed so frames land mid-motion.
// usage: node film.mjs <url> <outPrefix> [--w] [--h] [--scheme] [--reduced] [--mobile] [--eval "setup js"]
//        --act "js" [--times 0,150,300] [--slow 1] [--wait 2500]
import { guard } from './chrome-guard.mjs';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));
const scheme = opt('scheme', 'dark');
const scrolls = opt('scrolls', '0').split(',');
const waitMs = Number(opt('wait', 2500));
const dpr = Number(opt('dpr', 1));
const evalJs = opt('eval', null);

setTimeout(() => { try { chrome.kill("SIGKILL"); } catch {} console.error("TIMEOUT"); process.exit(2); }, Number(process.env.SHOT_TIMEOUT || 75000));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = guard(spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-frame-rate-limit',
  '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' }));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error('chrome did not start');
}

const ws = new WebSocket(await getWs());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map(); const logs = [];
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.consoleAPICalled') logs.push(`[${msg.params.type}] ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (msg.method === 'Runtime.exceptionThrown') logs.push(`[exception] ${msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text}`);
});
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: dpr, mobile: W < 600 });
if (flag('mobile')) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: scheme },
  { name: 'prefers-reduced-motion', value: flag('reduced') ? 'reduce' : 'no-preference' },
] });
await send('Page.navigate', { url });
await sleep(waitMs);
if (evalJs) { const r = await send('Runtime.evaluate', { expression: evalJs, awaitPromise: true, returnByValue: true }); logs.push(`[eval] ${JSON.stringify(r.result?.result?.value ?? r.result)}`); }

const files = [];
const slow = Number(opt('slow', 1));
// dev builds expose gsap as window.__gsap (src/lib/gsap.ts)
if (slow !== 1) await send('Runtime.evaluate', { expression: `window.__gsap && window.__gsap.globalTimeline.timeScale(${slow})` });
const act = opt('act', '');
const times = opt('times', '0,200,400,600,800').split(',').map(Number);
const t0 = Date.now();
await send('Runtime.evaluate', { expression: `setTimeout(() => { ${act} }, 0); 0` });
for (const t of times) {
  const wait = t0 + t - Date.now();
  if (wait > 0) await sleep(wait);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const f = `${out}-${String(t).padStart(5, '0')}.png`; writeFileSync(f, Buffer.from(shot.result.data, 'base64')); files.push(f);
}
console.log(files.join('\n'));
if (logs.length) console.log('--- console ---\n' + logs.slice(0, 40).join('\n'));
ws.close(); chrome.kill('SIGKILL');
process.exit(0);
