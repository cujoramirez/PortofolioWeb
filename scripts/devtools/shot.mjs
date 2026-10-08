// Headless-Chrome screenshot helper over raw CDP (no deps).
import { guard } from './chrome-guard.mjs';
// usage: node shot.mjs <url> <outPrefix> [--w 1440] [--h 900] [--scheme dark|light] [--reduced]
//        [--scrolls 0,900,1800] [--full] [--wait 2500] [--dpr 1] [--eval "js"] [--init "js before load"] [--gpu]
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
  // --gpu: the Mac's own GPU (ANGLE Metal) instead of SwiftShader, for a truer picture of 3D and WebGL
  ...(flag('gpu') ? [] : ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']),
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
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: scheme },
  { name: 'prefers-reduced-motion', value: flag('reduced') ? 'reduce' : 'no-preference' },
] });
const initJs = opt('init', null);
if (initJs) await send('Page.addScriptToEvaluateOnNewDocument', { source: initJs });
await send('Page.navigate', { url });
await sleep(waitMs);
if (evalJs) { const r = await send('Runtime.evaluate', { expression: evalJs, awaitPromise: true, returnByValue: true }); logs.push(`[eval] ${JSON.stringify(r.result?.result?.value ?? r.result)}`); }

const files = [];
if (flag('full')) {
  const m = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
  const fullH = Math.min(m.result.result.value, 16000);
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: fullH, deviceScaleFactor: dpr, mobile: W < 600 });
  await sleep(1200);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const f = `${out}-full.png`; writeFileSync(f, Buffer.from(shot.result.data, 'base64')); files.push(f);
} else {
  for (const y of scrolls) {
    // "#id+120" scrolls so the element's top sits 120px below the viewport top (default offset 0)
    const m = /^#([A-Za-z]\w*)([+-]\d+)?$/.exec(y);
    const expr = m ? `(document.getElementById('${m[1]}').getBoundingClientRect().top + scrollY - (${m[2] ? Number(m[2]) : 0}))` : String(Number(y));
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${expr}); window.dispatchEvent(new Event('scroll'));` });
    await sleep(Number(opt('settle', 900)));
    const pre = opt('each', null);
    if (pre) { const r = await send('Runtime.evaluate', { expression: pre, awaitPromise: true, returnByValue: true }); const v = r.result?.result?.value; if (v !== undefined) logs.push(`[each ${y}] ${JSON.stringify(v)}`); await sleep(500); }
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const tag = y.replace(/[^\w+-]/g, '');
    const f = `${out}-${tag}.png`; writeFileSync(f, Buffer.from(shot.result.data, 'base64')); files.push(f);
  }
}
console.log(files.join('\n'));
if (logs.length) console.log('--- console ---\n' + logs.slice(0, 40).join('\n'));
ws.close(); chrome.kill('SIGKILL');
process.exit(0);
