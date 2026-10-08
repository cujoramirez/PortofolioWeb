// Pin map and dead-zone scan. Mounts every lazy scene through the page's own jump, then prints the
// page height, each section's height and how far it stays pinned (pin spacer height minus the
// pinned child's height). With --dead it also steps through every pinned stretch and lists the
// runs where the picture does not change.
// usage: node pins.mjs <url> [--w 1440] [--h 900] [--mobile] [--dead] [--step 0.1] [--min 0.25] [--faint 0.15] [--only about,papers]
// Add ?tier=high to the URL: headless Chrome counts as a low-tier device and would get no pins.
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { WEBGL, flag, launch, opt, sleep } from './cdp.mjs';

const url = process.argv[2];
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));
const mobile = flag('mobile');
const step = Number(opt('step', 0.1)), min = Number(opt('min', 0.25));
const faintBelow = Number(opt('faint', 0.15));
const only = opt('only', '').split(',').filter(Boolean);

const c = await launch({ flags: [...WEBGL, '--hide-scrollbars', `--window-size=${W},${H}`], timeout: 900000 });
const { send, evaluate } = c;
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile });
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__raf = 0; const _r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => { window.__raf++; return _r(cb); };` });
const loaded = c.once('Page.loadEventFired');
await send('Page.navigate', { url });
await loaded;
await sleep(2500);

// The page is quiet once it stops requesting frames (scrub tweens and Lenis have caught up).
async function quiet(max = 4000) {
  let last = -1, still = 0;
  for (const t0 = Date.now(); still < 4 && Date.now() - t0 < max; ) {
    const n = await evaluate('window.__raf');
    still = n === last ? still + 1 : 0;
    last = n;
    await sleep(60);
  }
}
const scrollTo = (y) => evaluate(`window.scrollTo(0, ${y}); window.dispatchEvent(new Event('scroll')); 0`);

// Any in-page jump mounts every lazy scene first (src/lib/jump.ts); the brand link jumps to the top.
await evaluate(`document.querySelector('a.nav__brand')?.click(); 0`);
for (let i = 0; i < 100; i++) {
  if (await evaluate(`![...document.querySelectorAll('section.scene')].some((s) => s.style.minHeight)`)) break;
  await sleep(150);
}
await evaluate('document.fonts.ready.then(() => 0)');
await sleep(1500);
await scrollTo(0);
await quiet();

const map = await evaluate(`(() => {
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  return {
    vh: innerHeight, vw: innerWidth, page: document.documentElement.scrollHeight,
    scenes: [...document.querySelectorAll('section.scene')].map((s) => ({
      id: s.id, top: top(s), height: s.offsetHeight,
      state: [...s.classList].filter((k) => /^is-/.test(k) && !/^is-(motion|active|desktop|tablet|mobile)$/.test(k)).join(' '),
      pins: [...s.querySelectorAll('.pin-spacer, .hero__spacer')]
        .map((sp) => ({ top: top(sp), len: sp.offsetHeight - (sp.firstElementChild?.offsetHeight ?? 0) }))
        .filter((p) => p.len > 1),
    })),
  };
})()`);

const vh = (px) => (px / map.vh).toFixed(2);
console.log(`${map.vw} x ${map.vh}  page ${map.page}px = ${vh(map.page)} vh`);
console.log('scene          height vh  pinned vh  state');
let pinned = 0;
for (const s of map.scenes) {
  const len = s.pins.reduce((n, p) => n + p.len, 0);
  pinned += len;
  console.log(`${s.id.padEnd(14)} ${vh(s.height).padStart(9)}  ${vh(len).padStart(9)}  ${s.state}`);
}
console.log(`Pinned / page: ${vh(pinned)} / ${vh(map.page)} vh (${((100 * pinned) / map.page).toFixed(0)} %)`);

if (flag('dead')) {
  // The nav's progress line and the background repaint on every scroll step by design; hidden,
  // a frame only changes when the scene itself does.
  await evaluate(`document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '#nav-root, .bends, .cursor-label { visibility: hidden !important }' })); 0`);
  const maxY = map.page - map.vh;
  const px = step * map.vh;
  console.log(`\nDead-zone scan: ${step} vh steps, runs of ${min} vh or more with an unchanged frame`);
  console.log('first strip: one character per step, "." unchanged, "+" changed, "s" the page snapped away from the step');
  console.log('second strip: how much changed, 0 (nothing) to 9 (a new picture)');
  for (const s of map.scenes) {
    if (!s.pins.length || (only.length && !only.includes(s.id))) continue;
    // Half a viewport either side covers pins that do not start with the spacer at the viewport top.
    const from = Math.max(0, Math.min(...s.pins.map((p) => p.top)) - 0.5 * map.vh);
    const to = Math.min(maxY, Math.max(...s.pins.map((p) => p.top + p.len)) + 0.5 * map.vh);
    const samples = [];
    for (let y = from; y <= to + 0.5; y += px) {
      await scrollTo(Math.round(y));
      await quiet();
      const at = await evaluate('scrollY');
      const png = Buffer.from((await send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).result.data, 'base64');
      const grey = await sharp(png).greyscale().resize(96, 60, { fit: 'fill', kernel: 'linear' }).raw().toBuffer();
      // 5 bits per pixel: anti-aliasing noise does not count as a change
      const hash = createHash('sha1').update(grey.map((v) => v >> 3)).digest('hex');
      const prev = samples[samples.length - 1];
      // mean grey-level difference from the previous step, 0 to 255
      const moved = prev ? grey.reduce((n, v, i) => n + Math.abs(v - prev.grey[i]), 0) / grey.length : Infinity;
      samples.push({ y, hash, grey, moved, snapped: Math.abs(at - y) > 2 });
    }
    // Runs of consecutive steps that pass `still`, at least `min` viewport heights long.
    const runsOf = (still) => {
      const runs = [];
      let start = -1;
      samples.forEach((sm, i) => {
        const ok = i > 0 && !sm.snapped && !samples[i - 1].snapped && still(sm, samples[i - 1]);
        if (ok && start < 0) start = i - 1;
        if ((!ok || i === samples.length - 1) && start >= 0) {
          const end = ok ? i : i - 1;
          if ((end - start) * step >= min - 1e-9) runs.push([samples[start].y, samples[end].y]);
          start = -1;
        }
      });
      return runs;
    };
    const strip = samples.map((sm, i) => (sm.snapped ? 's' : i > 0 && sm.hash === samples[i - 1].hash ? '.' : '+')).join('');
    // 0 = identical, then one digit per doubling from 0.05 grey levels: 9 is a whole new picture
    const amount = samples.map((sm, i) => (i === 0 ? '-' : sm.moved === 0 ? '0' : String(Math.max(1, Math.min(9, 1 + Math.floor(Math.log2(sm.moved / 0.05))))))).join('');
    console.log(`\n${s.id}: scroll ${Math.round(from)} to ${Math.round(to)}px\n${strip}\n${amount}`);
    const where = ([a, b]) => `${vh(b - a)} vh: scroll ${Math.round(a)} to ${Math.round(b)}px (${vh(a - s.top)} to ${vh(b - s.top)} vh into #${s.id})`;
    const dead = runsOf((sm, prev) => sm.hash === prev.hash);
    const faint = runsOf((sm) => sm.moved < faintBelow);
    if (!dead.length) console.log('  no dead run');
    for (const r of dead) console.log(`  unchanged for ${where(r)}`);
    for (const r of faint.filter((f) => !dead.some((d) => d[0] === f[0] && d[1] === f[1]))) console.log(`  barely changing (under ${faintBelow} grey levels a step) for ${where(r)}`);
  }
}
c.close();
process.exit(0);
