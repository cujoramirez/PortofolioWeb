// Safari-engine screenshots via Playwright's WebKit (same options as shot.mjs).
// usage: node shot-webkit.mjs <url> <outPrefix> [--w 1440] [--h 900] [--scheme dark|light] [--reduced]
//        [--scrolls 0,900,#id+60] [--wait 2500] [--settle 900] [--dpr 1] [--eval "js"] [--each "js"]
// Needs `npx playwright-core install webkit` once. The browser always closes (hard timeout too).
import { webkit } from 'playwright-core';

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));

const browser = await webkit.launch();
const kill = setTimeout(async () => { console.error('TIMEOUT'); await browser.close().catch(() => {}); process.exit(2); }, Number(process.env.SHOT_TIMEOUT || 90000));
const close = async (code) => { clearTimeout(kill); await browser.close().catch(() => {}); process.exit(code); };
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => close(130));

try {
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: Number(opt('dpr', 1)),
    isMobile: W < 600,
    hasTouch: W < 600,
    colorScheme: opt('scheme', 'dark'),
    reducedMotion: flag('reduced') ? 'reduce' : 'no-preference',
  });
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[exception] ${e.message}`));
  await page.goto(url);
  await page.waitForTimeout(Number(opt('wait', 2500)));
  const evalJs = opt('eval', null);
  if (evalJs) logs.push(`[eval] ${JSON.stringify(await page.evaluate(evalJs))}`);
  const files = [];
  for (const y of opt('scrolls', '0').split(',')) {
    const m = /^#([A-Za-z]\w*)([+-]\d+)?$/.exec(y);
    const expr = m ? `(document.getElementById('${m[1]}').getBoundingClientRect().top + scrollY - (${m[2] ? Number(m[2]) : 0}))` : String(Number(y));
    await page.evaluate(`window.scrollTo(0, ${expr}); window.dispatchEvent(new Event('scroll'));`);
    await page.waitForTimeout(Number(opt('settle', 900)));
    const each = opt('each', null);
    if (each) { const v = await page.evaluate(each); if (v !== undefined) logs.push(`[each ${y}] ${JSON.stringify(v)}`); await page.waitForTimeout(500); }
    const f = `${out}-${y.replace(/[^\w+-]/g, '')}.png`;
    await page.screenshot({ path: f });
    files.push(f);
  }
  console.log(files.join('\n'));
  if (logs.length) console.log('--- console ---\n' + logs.slice(0, 30).join('\n'));
  await close(0);
} catch (e) {
  console.error(e);
  await close(1);
}
