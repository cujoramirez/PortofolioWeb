// Real-Safari screenshots through safaridriver (WebDriver). Unlike Playwright's WebKit, this renders
// CSS 3D (preserve-3d) exactly as Safari does. Needs Safari > Settings > Developer > "Allow remote
// automation" once. Opens its own automation window (no access to the user's tabs), then closes it.
// usage: node shot-safari.mjs <url> <outPrefix> [--w 1440] [--h 900] (inner viewport, approximated)
//        [--theme dark|light] [--scrolls 0,900,#id+60] [--wait 2500] [--settle 900] [--eval "js"] [--each "js"]
// Color scheme and reduced motion follow macOS; --theme sets the site's stored theme instead.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));
const port = 4400 + Math.floor(Math.random() * 400);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const driver = spawn('safaridriver', ['-p', String(port)], { stdio: 'ignore' });
let session = null;
const base = `http://127.0.0.1:${port}`;
const debug = !!process.env.SHOT_DEBUG;
const wd = async (method, path, body) => {
  if (debug) console.error(new Date().toISOString().slice(17, 23), method, path.replace(/\/session\/[^/]+/, ''));
  const res = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json();
  if (json.value?.error) throw new Error(`${json.value.error}: ${json.value.message}`);
  return json.value;
};
const s = (path) => `/session/${session}${path}`;
const run = (js) => wd('POST', s('/execute/sync'), { script: `return (${js});`, args: [] });
const runAsync = (js) =>
  wd('POST', s('/execute/async'), { script: `const done = arguments[arguments.length - 1]; Promise.resolve(${js}).then(done, (e) => done(String(e)));`, args: [] });

const close = async (code) => {
  clearTimeout(kill);
  if (session) await wd('DELETE', `/session/${session}`).catch(() => {});
  driver.kill('SIGTERM');
  process.exit(code);
};
const kill = setTimeout(() => { console.error('TIMEOUT'); close(2); }, Number(process.env.SHOT_TIMEOUT || 120000));
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => close(130));

try {
  for (let i = 0; i < 40 && !session; i++) {
    try {
      session = (await wd('POST', '/session', { capabilities: { alwaysMatch: { browserName: 'safari' } } })).sessionId;
    } catch (e) {
      if (debug) console.error(String(e.message).slice(0, 300));
      if (/remote automation/.test(e.message)) throw e;
      await sleep(150);
    }
  }
  // size the window so the inner viewport lands near W x H
  await wd('POST', s('/window/rect'), { x: 0, y: 0, width: W, height: H + 100 });
  const inner = await run('[innerWidth, innerHeight]');
  await wd('POST', s('/window/rect'), { x: 0, y: 0, width: W + (W - inner[0]), height: H + 100 + (H - inner[1]) });
  const theme = opt('theme', null);
  if (theme) {
    await wd('POST', s('/url'), { url });
    await run(`localStorage.setItem('theme', '${theme}')`);
  }
  await wd('POST', s('/url'), { url });
  await sleep(Number(opt('wait', 2500)));
  // Safari applies the site's saved zoom after navigation. Sizing its blank page first left a
  // requested 1190 x 680 check at 1034 x 591 when localhost had the owner's 115% zoom.
  for (let i = 0; i < 3; i++) {
    const view = await run('[innerWidth, innerHeight]');
    if (Math.abs(view[0] - W) <= 1 && Math.abs(view[1] - H) <= 1) break;
    const rect = await wd('GET', s('/window/rect'));
    const ratio = rect.width / view[0];
    await wd('POST', s('/window/rect'), {
      x: 0, y: 0,
      width: Math.round(rect.width + (W - view[0]) * ratio),
      height: Math.round(rect.height + (H - view[1]) * ratio),
    });
    await sleep(350);
  }
  const logs = [`[viewport] ${JSON.stringify(await run('[innerWidth, innerHeight, devicePixelRatio]'))}`];
  // Safari makes no frames while the display sleeps: rAF, GSAP's ticker and ResizeObserver stall.
  const frames = await runAsync('new Promise((r) => { let n = 0; const tick = () => { n++; requestAnimationFrame(tick); }; requestAnimationFrame(tick); setTimeout(() => r(n), 500); })');
  logs.push(`[frames in 0.5 s] ${frames}${frames ? '' : ' (display asleep: these shots show stale states; wake it and hold it with caffeinate -d)'}`);
  const evalJs = opt('eval', null);
  if (evalJs) logs.push(`[eval] ${JSON.stringify(await runAsync(evalJs))}`);
  const files = [];
  for (const y of opt('scrolls', '0').split(',')) {
    const m = /^#([A-Za-z]\w*)([+-]\d+)?$/.exec(y);
    const expr = m ? `(document.getElementById('${m[1]}').getBoundingClientRect().top + scrollY - (${m[2] ? Number(m[2]) : 0}))` : String(Number(y));
    await run(`(window.scrollTo(0, ${expr}), window.dispatchEvent(new Event('scroll')), 0)`);
    await sleep(Number(opt('settle', 900)));
    const each = opt('each', null);
    if (each) { logs.push(`[each ${y}] ${JSON.stringify(await runAsync(each))}`); await sleep(400); }
    const png = await wd('GET', s('/screenshot'));
    const f = `${out}-${y.replace(/[^\w+-]/g, '')}.png`;
    writeFileSync(f, Buffer.from(png, 'base64'));
    files.push(f);
  }
  if (theme) await run(`localStorage.removeItem('theme')`);
  console.log(files.join('\n'));
  console.log('--- log ---\n' + logs.join('\n'));
  await close(0);
} catch (e) {
  console.error(String(e));
  await close(1);
}
