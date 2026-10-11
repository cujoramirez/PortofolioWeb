// Bundle budget: builds the site, then prints gzip sizes for the JS the page loads up front (the
// entry and its static imports) and for every lazy chunk. Exits 1 when a limit is passed.
// The first load and the HTML are also sized as Vercel sends them: its CDN compresses with Brotli
// at level 3 (matched to the byte on a deployment, 2026-10-11), which comes out 4 to 5 % larger
// than gzip at level 9. The limits apply to both.
// usage: node budget.mjs [--out <dir>] [--no-build] [--limit 125] [--html-limit 16]
//        [--sum "webgl=^(gl|relief)-:8"]   gzip total of the chunks a regex matches, optional KB limit
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const all = (k) => args.flatMap((a, i) => (a === `--${k}` ? [args[i + 1]] : []));
const root = resolve(import.meta.dirname, '../..');
const out = resolve(opt('out', join(tmpdir(), 'pf-dist')));
const limit = Number(opt('limit', 125));
const htmlLimit = Number(opt('html-limit', 16));

if (!args.includes('--no-build')) {
  // --emptyOutDir: Vite will not clear a folder outside the project, and stale hashed chunks
  // from an earlier build would be counted as lazy chunks.
  execFileSync('npx', ['vite', 'build', '--outDir', out, '--emptyOutDir', '--logLevel', 'warn'], { cwd: root, stdio: 'inherit' });
}
if (!existsSync(join(out, 'index.html'))) { console.error(`no build in ${out}`); process.exit(2); }

const gz = (file) => gzipSync(readFileSync(file), { level: 9 }).length;
const br = (file) => brotliCompressSync(readFileSync(file), { params: { [constants.BROTLI_PARAM_QUALITY]: 3 } }).length;
const kb = (n) => (n / 1024).toFixed(1).padStart(7);
const html = readFileSync(join(out, 'index.html'), 'utf8');
const jsDir = join(out, 'assets/js');
const chunks = readdirSync(jsDir).filter((f) => f.endsWith('.js'));

// Up front = the entry script plus everything it imports statically, followed chunk by chunk.
const eager = new Set();
const queue = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="\/assets\/js\/([^"]+\.js)"/g)].map((m) => m[1]);
while (queue.length) {
  const name = queue.pop();
  if (eager.has(name) || !chunks.includes(name)) continue;
  eager.add(name);
  const src = readFileSync(join(jsDir, name), 'utf8');
  // `import"./a.js"` and `import{x}from"./a.js"`, never the dynamic `import("./a.js")`
  for (const m of src.matchAll(/\b(?:import|export)\s*(?:[^"'()]*?\bfrom\s*)?["']\.\/([^"']+\.js)["']/g)) queue.push(m[1]);
}

const size = new Map(chunks.map((f) => [f, gz(join(jsDir, f))]));
const bySize = (a, b) => size.get(b) - size.get(a);
const first = [...eager].sort(bySize);
const lazy = chunks.filter((f) => !eager.has(f)).sort(bySize);
const firstTotal = first.reduce((n, f) => n + size.get(f), 0);
const firstSent = first.reduce((n, f) => n + br(join(jsDir, f)), 0);

console.log(`First-load JS (gzip), limit ${limit} KB`);
for (const f of first) console.log(`${kb(size.get(f))} KB  ${f}`);
console.log(`${kb(firstTotal)} KB  total\n${kb(firstSent)} KB  as Vercel sends it (Brotli 3)\n`);
console.log(`Lazy JS chunks (gzip): ${lazy.length}`);
for (const f of lazy) console.log(`${kb(size.get(f))} KB  ${f}`);
console.log(`${kb(lazy.reduce((n, f) => n + size.get(f), 0))} KB  total\n`);

const cssDir = join(out, 'assets');
const css = readdirSync(cssDir).filter((f) => f.endsWith('.css'));
console.log(`Lazy CSS (gzip): ${css.length}  (the entry stylesheet is inlined into the HTML)`);
for (const f of css) console.log(`${kb(gz(join(cssDir, f)))} KB  ${f}`);
const htmlSize = gz(join(out, 'index.html'));
const htmlSent = br(join(out, 'index.html'));
console.log(`\nHTML with inlined hero CSS (gzip), limit ${htmlLimit} KB\n${kb(htmlSize)} KB  index.html\n${kb(htmlSent)} KB  as Vercel sends it (Brotli 3)`);

let failed = false;
const check = (label, value, max) => {
  if (value <= max * 1024) return;
  failed = true;
  console.error(`OVER BUDGET: ${label} is ${(value / 1024).toFixed(1)} KB, limit ${max} KB`);
};
for (const spec of all('sum')) {
  const [, label, pattern, max] = /^([^=]+)=(.+?)(?::([\d.]+))?$/.exec(spec) ?? [];
  if (!label) { console.error(`bad --sum "${spec}"`); process.exit(2); }
  const hit = chunks.filter((f) => new RegExp(pattern).test(f));
  const total = hit.reduce((n, f) => n + size.get(f), 0);
  console.log(`\n${label} (gzip)${max ? `, limit ${max} KB` : ''}: ${hit.join(', ') || 'no chunk matches'}\n${kb(total)} KB  total`);
  if (max) check(label, total, Number(max));
}
check('first-load JS', firstTotal, limit);
check('first-load JS as Vercel sends it', firstSent, limit);
check('HTML', htmlSize, htmlLimit);
check('HTML as Vercel sends it', htmlSent, htmlLimit);
process.exit(failed ? 1 : 0);
