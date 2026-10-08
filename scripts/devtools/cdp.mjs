// Shared launcher for the newer headless tools: one Chrome through chrome-guard, one page, raw CDP.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { guard } from './chrome-guard.mjs';

export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// SwiftShader WebGL, as in shot.mjs: without these headless Chrome reports no usable WebGL.
export const WEBGL = ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

const args = process.argv.slice(2);
export const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
export const flag = (k) => args.includes(`--${k}`);

export async function launch({ flags = [], timeout = 120000 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
  const port = 9300 + Math.floor(Math.random() * 600);
  const chrome = guard(spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
    ...flags, 'about:blank'], { stdio: 'ignore' }));
  const kill = setTimeout(() => { chrome.kill('SIGKILL'); console.error('TIMEOUT'); process.exit(2); }, timeout);
  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
    if (!wsUrl) await sleep(150);
  }
  if (!wsUrl) throw new Error('chrome did not start');
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map(); const listeners = new Set();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) for (const fn of listeners) fn(m);
  });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    const err = r.result?.exceptionDetails;
    if (err) throw new Error(`page threw: ${err.exception?.description ?? err.text}`);
    return r.result?.result?.value;
  };
  // Without this a CDP Escape key press turns the headless page `hidden`: no frame is produced
  // afterwards, pending transitions never start, and every idle check reads a false 0.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  const once = (method) => new Promise((res) => { const off = on((m) => { if (m.method === method) { off(); res(m.params); } }); });
  const close = () => {
    clearTimeout(kill); ws.close(); chrome.kill('SIGKILL');
    // Chrome may still be flushing the profile as it dies: a failed removal only leaves a temp dir.
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  };
  return { send, evaluate, on, once, close };
}
