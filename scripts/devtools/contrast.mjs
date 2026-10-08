// Text contrast against the real pixels behind it. Steps down the page; at each step the frame is
// captured with and without the text lines that are fully on screen and opaque. A line whose box
// does not change between the two is covered by something else and is skipped. For the rest, the
// line's computed colour is composited over each pixel behind it. Reports the worst lines under
// WCAG AA (4.5:1, or 3:1 for text of 24px, or 18.66px bold, and up).
// It uses the computed colour, as WCAG does, not anti-aliased glyph pixels (thin strokes never
// reach their full colour and read far too low). A layer drawn over the text, such as the
// Experience corridor's fog, is therefore not counted.
// usage: node contrast.mjs <url> [--w 1440] [--h 900] [--mobile] [--scheme dark|light] [--reduced] [--step 0.25] [--only "#about"]
// --reduced audits the posters: every line at rest in its readable place. Without it the page is
// sampled mid-choreography too, where layers cross each other and a low reading can be a line seen
// through something passing in front of it.
// Runs on the Mac's GPU so the background shader draws as it does in a browser. Add ?tier=high.
// The minimum is taken over the darkest 98 % of a line's pixels: a hairline crossing the box is not
// the backdrop the glyphs sit on.
import sharp from 'sharp';
import { flag, launch, opt, sleep } from './cdp.mjs';

const url = process.argv[2];
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));
const mobile = flag('mobile');
const scheme = opt('scheme', 'dark');
const step = Number(opt('step', 0.25));
const only = opt('only', 'main, #nav-root');

const c = await launch({ flags: ['--hide-scrollbars', `--window-size=${W},${H}`], timeout: 900000 });
const { send, evaluate } = c;
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile });
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: flag('reduced') ? 'reduce' : 'no-preference' }] });
const loaded = c.once('Page.loadEventFired');
await send('Page.navigate', { url });
await loaded;
await sleep(2500);
// Any in-page jump mounts every lazy scene first (src/lib/jump.ts).
await evaluate(`document.querySelector('a.nav__brand')?.click(); 0`);
for (let i = 0; i < 100; i++) {
  if (await evaluate(`![...document.querySelectorAll('section.scene')].some((s) => s.style.minHeight)`)) break;
  await sleep(150);
}
await sleep(1500);

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

// In the page: every on-screen, opaque text line with its colour; then hide those lines.
const COLLECT = `(() => {
  const out = [];
  const hidden = [];
  // a line passing under the fixed nav bar is behind glass, with the bar's bright progress line
  // across it: not where it is read
  const bar = document.querySelector('.nav__bar')?.getBoundingClientRect();
  const underNav = (el, r) => bar && !el.closest('#nav-root') && r.top < bar.bottom + 2 && r.bottom > bar.top && r.left < bar.right && r.right > bar.left;
  const opaque = (el) => { for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.97) return false; } return true; };
  for (const root of document.querySelectorAll(${JSON.stringify(only)})) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.data.trim()) continue;
      const el = node.parentElement;
      if (!el || el.closest('.sr-only, noscript, script, style, svg, dialog:not([open])') || !opaque(el)) continue;
      const cs = getComputedStyle(el);
      const m = cs.color.match(/[\\d.]+/g).map(Number);
      if ((m[3] ?? 1) === 0) continue; // gradient text: no single colour to test
      const range = document.createRange();
      range.selectNodeContents(node);
      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
      const label = (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase()) + (el.closest('section') ? ' in #' + el.closest('section').id : '');
      for (const r of range.getClientRects()) {
        if (r.width < 4 || r.height < 4 || r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth || underNav(el, r)) continue;
        out.push({ label, text: node.data.trim().slice(0, 28), color: m, large, x: Math.floor(r.left), y: Math.floor(r.top), w: Math.floor(r.width), h: Math.floor(r.height) });
      }
      if (!hidden.includes(el)) hidden.push(el);
    }
  }
  // Only the glyphs go: hiding the element would take a button's fill with its label, and the label
  // would then be measured against the page behind the button.
  window.__hidden = hidden.map((el) => [el, el.style.cssText]);
  hidden.forEach((el) => { for (const prop of ['color', '-webkit-text-fill-color']) el.style.setProperty(prop, 'transparent', 'important'); el.style.setProperty('text-shadow', 'none', 'important'); });
  return out;
})()`;
const RESTORE = `window.__hidden.forEach(([el, css]) => (el.style.cssText = css)); 0`;

const max = await evaluate('document.documentElement.scrollHeight - innerHeight');
const worst = new Map();
let lines = 0;
for (let y = 0; y <= max; y += Math.round(step * H)) {
  await evaluate(`window.scrollTo(0, ${y}); window.dispatchEvent(new Event('scroll')); 0`);
  await sleep(1100);
  const shot = async () => (await sharp(Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).result.data, 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true }));
  const withText = await shot();
  const found = await evaluate(COLLECT);
  await sleep(80);
  const { data, info } = await shot();
  await evaluate(RESTORE);
  for (const t of found) {
    const [tr, tg, tb, ta = 1] = t.color;
    const ratios = [];
    let changed = 0;
    for (let py = t.y; py < Math.min(info.height, t.y + t.h); py++) {
      for (let px = t.x; px < Math.min(info.width, t.x + t.w); px++) {
        const i = (py * info.width + px) * 3;
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (Math.abs(withText.data[i] - r) + Math.abs(withText.data[i + 1] - g) + Math.abs(withText.data[i + 2] - b) > 24) changed++;
        const a = lum(tr * ta + r * (1 - ta), tg * ta + g * (1 - ta), tb * ta + b * (1 - ta));
        const z = lum(r, g, b);
        ratios.push((Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05));
      }
    }
    if (changed < ratios.length * 0.02) continue; // covered, or not painted
    ratios.sort((p, q) => p - q);
    const ratio = ratios[Math.floor(ratios.length * 0.02)];
    lines++;
    const need = t.large ? 3 : 4.5;
    const key = `${t.label} "${t.text}"`;
    if (ratio < need && (!worst.has(key) || ratio < worst.get(key).ratio)) worst.set(key, { ratio, need, y });
  }
}
console.log(`${scheme} ${W} x ${H}: ${lines} text lines sampled`);
if (!worst.size) console.log('every line meets WCAG AA');
for (const [key, v] of [...worst].sort((a, b) => a[1].ratio - b[1].ratio)) console.log(`  ${v.ratio.toFixed(2)}:1 (needs ${v.need})  ${key}  at scroll ${v.y}`);
c.close();
process.exit(worst.size ? 1 : 0);
