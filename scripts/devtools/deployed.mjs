// A deployment as Vercel serves it: is every built file there, with the headers vercel.json asks
// for, and what does the first load weigh on the wire. Reads only.
// usage: node deployed.mjs <origin> [--dist <dir>] [--env .env.local]
//        node deployed.mjs <origin> --relay 4188     a loopback copy for perf.mjs and the other tools
// A preview sits behind Vercel Authentication. `vercel curl` gets through by creating a permanent
// bypass secret on the project, which is the owner's to decide. This sends the short-lived token
// that `vercel env pull` leaves in .env.local instead, to that deployment only, and never prints
// it. The public site needs no token. The relay forwards GET and HEAD and answers anything else
// itself (an analytics beacon would otherwise be recorded as a visit).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { Agent, request } from 'node:https';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const root = resolve(import.meta.dirname, '../..');
const host = new URL(args[0]).host;
const dist = resolve(opt('dist', join(tmpdir(), 'pf-dist')));
const envFile = resolve(root, opt('env', '.env.local'));
const kb = (n) => (n / 1024).toFixed(1);

let token = '';
if (existsSync(envFile)) {
  const line = readFileSync(envFile, 'utf8').split('\n').find((l) => l.startsWith('VERCEL_OIDC_TOKEN='));
  token = line ? line.slice(line.indexOf('=') + 1).trim().replace(/^"|"$/g, '') : '';
}
if (token) {
  const left = Math.round((JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).exp * 1000 - Date.now()) / 60000);
  console.log(left > 0 ? `token from ${relative(root, envFile)}: ${left} min left` : `token from ${relative(root, envFile)} has expired: vercel env pull .env.local --yes`);
}
const agent = new Agent({ keepAlive: true, maxSockets: 12 });
const signed = (headers) => (token ? { ...headers, 'x-vercel-trusted-oidc-idp-token': token } : headers);

if (args.includes('--relay')) {
  const port = Number(opt('relay', 4188));
  const drop = new Set(['connection', 'keep-alive', 'transfer-encoding', 'alt-svc', 'strict-transport-security']);
  createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      console.log(`answered here: ${req.method} ${req.url}`);
      req.resume();
      res.writeHead(204).end();
      return;
    }
    const headers = signed({ ...req.headers, host });
    for (const k of ['connection', 'referer', 'origin']) delete headers[k];
    const up = request({ host, path: req.url, method: req.method, headers, agent }, (r) => {
      const out = [];
      for (let i = 0; i < r.rawHeaders.length; i += 2) if (!drop.has(r.rawHeaders[i].toLowerCase())) out.push(r.rawHeaders[i], r.rawHeaders[i + 1]);
      if (r.statusCode >= 300 && r.statusCode !== 304) console.log(`${r.statusCode} ${req.url}`);
      res.writeHead(r.statusCode, out);
      r.pipe(res);
    });
    up.on('error', (e) => { console.log(`${req.url}: ${e.message}`); res.writeHead(502).end(); });
    up.end();
  }).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port} -> ${host} (Ctrl+C to stop)`));
} else {
  const get = (path, method = 'GET', sign = true) => new Promise((done, fail) => {
    const base = { 'accept-encoding': 'gzip, deflate, br, zstd', 'user-agent': 'pf-deployed-check' };
    const req = request({ host, path, method, headers: sign ? signed(base) : base, agent }, (r) => {
      let bytes = 0; let head = 0;
      for (let i = 0; i < r.rawHeaders.length; i += 2) head += r.rawHeaders[i].length + r.rawHeaders[i + 1].length + 4;
      r.on('data', (c) => { bytes += c.length; });
      r.on('end', () => done({ status: r.statusCode, h: r.headers, bytes, head }));
    });
    req.on('error', fail);
    req.end();
  });
  if (!existsSync(join(dist, 'index.html'))) { console.error(`no build in ${dist}`); process.exit(2); }

  const open = await get('/', 'GET', false);
  const page = await get('/');
  console.log(`${host}: / is ${open.status} without the token${token ? `, ${page.status} with it` : ''}`);
  if (page.status !== 200) process.exit(1);
  const failed = [];
  const want = (label, value, test) => { if (!test(value ?? '')) failed.push(`${label}: ${value ?? '(none)'}`); };
  want('x-content-type-options', page.h['x-content-type-options'], (v) => v === 'nosniff');
  want('referrer-policy', page.h['referrer-policy'], (v) => v === 'strict-origin-when-cross-origin');
  want('content-security-policy', page.h['content-security-policy'], (v) => v.includes("frame-ancestors 'self'"));
  want('content-encoding of the page', page.h['content-encoding'], (v) => v !== '');

  const files = [];
  const walk = (dir) => { for (const name of readdirSync(dir)) { const full = join(dir, name); if (statSync(full).isDirectory()) walk(full); else files.push('/' + relative(dist, full)); } };
  walk(dist);
  let next = 0; let found = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < files.length) {
      const path = files[next++];
      const r = await get(encodeURI(path), 'HEAD');
      if (r.status !== 200) { failed.push(`${r.status} ${path}`); continue; }
      found++;
      const hashed = /^\/(assets|img|seq)\//.test(path);
      if (hashed && r.h['cache-control'] !== 'public, max-age=31536000, immutable') failed.push(`cache-control of ${path}: ${r.h['cache-control']}`);
      if (r.h['x-content-type-options'] !== 'nosniff') failed.push(`no nosniff on ${path}`);
    }
  }));
  console.log(`files of ${dist} on the deployment: ${found} of ${files.length}`);

  // what the page needs before it can run: the entry script and its preloads, as the CDN sends them
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const scripts = [...new Set([...html.matchAll(/<(?:script[^>]+src|link[^>]+rel="modulepreload"[^>]+href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]))];
  let wire = 0;
  for (const path of scripts) { const r = await get(path); wire += r.bytes + r.head; console.log(`  ${kb(r.bytes + r.head).padStart(6)} KB ${r.h['content-encoding'] ?? 'identity'}  ${path}`); }
  console.log(`  ${kb(wire).padStart(6)} KB first-load JS on the wire; the page itself ${kb(page.bytes + page.head)} KB ${page.h['content-encoding']}`);
  for (const path of ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js']) { const r = await get(path); console.log(`  ${kb(r.bytes + r.head).padStart(6)} KB ${r.status}  ${path} (Vercel's own)`); }

  console.log(failed.length ? `\n${failed.length} problem(s):\n  ${failed.slice(0, 30).join('\n  ')}` : '\nheaders and files as expected');
  agent.destroy();
  process.exit(failed.length ? 1 : 0);
}
