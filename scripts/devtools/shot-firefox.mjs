// Firefox screenshots, from the real application driven over WebDriver BiDi (no driver to install).
// usage: node shot-firefox.mjs <url> <outPrefix> [--w 1440] [--h 900] [--scheme dark|light]
//        [--scrolls 0,900,#id+60] [--wait 3500] [--settle 1500] [--eval "js"] [--window] [--software]
// --window    a visible window on the Mac's GPU, not headless
// --software  graphics acceleration off, as Firefox runs where it does not trust the driver
//             (common on Linux): the page then shows how it behaves with no GPU behind it
// Needs Firefox in /Applications or in ~/Library/Caches/pf-browsers (the app from mozilla.org,
// copied there; Playwright's own Firefox build does not start on this macOS). Prints the page's
// console warnings and errors. The browser and its throwaway profile always go (hard timeout too).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));
const dark = opt('scheme', 'dark') === 'dark';

const app = ['/Applications/Firefox.app', join(homedir(), 'Library/Caches/pf-browsers/Firefox.app')].find(existsSync);
if (!app) { console.error('no Firefox.app in /Applications or ~/Library/Caches/pf-browsers'); process.exit(2); }

const profile = mkdtempSync(join(tmpdir(), 'pf-firefox-'));
const prefs = [
  ['browser.shell.checkDefaultBrowser', false], ['datareporting.policy.dataSubmissionEnabled', false], ['browser.aboutwelcome.enabled', false],
  ['browser.startup.homepage', 'about:blank'], ['startup.homepage_welcome_url', 'about:blank'], ['app.update.enabled', false],
  ['layout.css.prefers-color-scheme.content-override', dark ? 0 : 1], ['ui.systemUsesDarkTheme', dark ? 1 : 0],
  ...(flag('software') ? [['gfx.webrender.software', true], ['gfx.webrender.software.opengl', false], ['layers.acceleration.disabled', true]] : []),
];
writeFileSync(join(profile, 'user.js'), prefs.map(([k, v]) => `user_pref(${JSON.stringify(k)}, ${JSON.stringify(v)});`).join('\n'));

// Started from a terminal's child, Firefox inherits the terminal's bundle identifier and stops
// with "Could not find profile folder".
const env = { ...process.env };
delete env.__CFBundleIdentifier;
const port = 9400 + Math.floor(Math.random() * 400);
const firefox = spawn(join(app, 'Contents/MacOS/firefox'), [...(flag('window') ? [] : ['--headless']), '--no-remote', '--profile', profile, '--remote-debugging-port', String(port), `--width=${W}`, `--height=${H}`, 'about:blank'], { stdio: 'ignore', env });
const close = (code = 0) => { firefox.kill('SIGKILL'); setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); }, 400); };
setTimeout(() => { console.error('TIMEOUT'); close(2); }, Number(process.env.SHOT_TIMEOUT || 120000));
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => close(130));

let ws;
for (let i = 0; i < 80 && !ws; i++) {
  await sleep(250);
  try { const w = new WebSocket(`ws://127.0.0.1:${port}/session`); await new Promise((res, rej) => { w.addEventListener('open', res, { once: true }); w.addEventListener('error', rej, { once: true }); }); ws = w; } catch {}
}
if (!ws) { console.error('Firefox did not open its debugging port'); close(2); }
let id = 0; const pending = new Map(); const notes = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.type === 'error' ? p.rej(new Error(`${m.error}: ${m.message}`)) : p.res(m.result); }
  else if (m.method === 'log.entryAdded' && m.params.level !== 'info' && m.params.level !== 'debug') notes.push(`${m.params.level}: ${String(m.params.text).slice(0, 240)}`);
});
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
await send('session.new', { capabilities: {} });
await send('session.subscribe', { events: ['log.entryAdded'] });
const context = (await send('browsingContext.getTree', {})).contexts[0].context;
await send('browsingContext.setViewport', { context, viewport: { width: W, height: H } });
const run = async (expression) => (await send('script.evaluate', { expression, target: { context }, awaitPromise: true, resultOwnership: 'none' })).result?.value;

await send('browsingContext.navigate', { context, url, wait: 'complete' });
await sleep(Number(opt('wait', 3500)));
if (opt('eval')) await run(`(${opt('eval')}, 0)`);
for (const spot of String(opt('scrolls', '0')).split(',')) {
  const at = /^#([\w-]+)([+-]\d+)?$/.exec(spot);
  await run(at ? `(window.scrollTo({ top: document.getElementById(${JSON.stringify(at[1])}).getBoundingClientRect().top + scrollY + ${Number(at[2] ?? 0)}, behavior: 'instant' }), 0)` : `(window.scrollTo({ top: ${Number(spot)}, behavior: 'instant' }), 0)`);
  await sleep(Number(opt('settle', 1500)));
  const file = `${out}-${spot.replace('#', '')}.png`;
  writeFileSync(file, Buffer.from((await send('browsingContext.captureScreenshot', { context })).data, 'base64'));
  console.log(file);
}
console.log((await run('navigator.userAgent')).match(/Firefox\/[\d.]+/)?.[0], flag('software') ? '(no graphics acceleration)' : '');
if (notes.length) console.log('--- console ---\n' + [...new Set(notes)].slice(0, 20).join('\n'));
close(0);
