// Idle-after-scroll audit: scroll, wait until the position stops moving, wait 1 s, then count
// requestAnimationFrame calls over 2.5 s (should be 0). Launches Chrome via chrome-guard.
// usage: node idle-scroll.mjs <url> [--mobile] [--distance 3000] [--rounds 3]
// Desktop sends wheel events; --mobile scrolls natively with scrollBy (no Lenis on touch).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { guard } from './chrome-guard.mjs';

const args = process.argv.slice(2);
const url = args[0];
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const mobile = args.includes('--mobile');
const distance = Number(opt('distance', 3000));
const rounds = Number(opt('rounds', 3));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 9700 + Math.floor(Math.random() * 90);
const chrome = guard(spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'idle-'))}`,
  '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' }));
setTimeout(() => { chrome.kill('SIGKILL'); console.error('TIMEOUT'); process.exit(2); }, 120000);

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(150);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result.value;

await send('Page.enable');
await send('Runtime.enable');
const W = mobile ? 390 : 1440, H = mobile ? 844 : 900;
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: mobile ? 2 : 1, mobile });
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__raf = 0; const _r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => { window.__raf++; return _r(cb); };` });
await send('Page.navigate', { url });
await sleep(4000);

for (let r = 0; r < rounds; r++) {
  // Desktop: real wheel input (drives Lenis). Phones scroll natively, so stepped scrollBy matches.
  const steps = Math.ceil(distance / 100);
  for (let s = 0; s < steps; s++) {
    if (mobile) await evaluate('window.scrollBy(0, 100)');
    else await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: W / 2, y: H / 2, deltaX: 0, deltaY: 100 });
    await sleep(16);
  }
  // Smooth scrolling keeps moving after the last input: wait until the position has settled.
  let last = -1, still = 0;
  while (still < 3) {
    const y = await evaluate('scrollY');
    still = y === last ? still + 1 : 0;
    last = y;
    await sleep(50);
  }
  const during = await evaluate('window.__raf');
  await sleep(1000);
  const start = await evaluate('window.__raf');
  await sleep(2500);
  const end = await evaluate('window.__raf');
  const y = await evaluate('Math.round(scrollY)');
  console.log(`round ${r + 1}: scrolled to ${y}px, rAF during scroll ${during}, idle rAF over 2.5 s (1 s after scroll): ${end - start}`);
}
ws.close(); chrome.kill('SIGKILL');
process.exit(0);
