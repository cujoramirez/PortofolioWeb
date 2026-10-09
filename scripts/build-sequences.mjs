import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const opt = (key, fallback) => { const i = args.indexOf(`--${key}`); return i < 0 ? fallback : args[i + 1]; };
const input = resolve(opt('input-dir', 'src/assets/footage'));
const output = resolve(opt('output-dir', 'public/seq'));
const manifestPath = resolve(opt('manifest', 'src/data/sequences.json'));
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const manifest = {};
const keys = ['FightRoom', '67Cam', 'DALX'];
const version = 'sequence-v2-60x960-36x640-long-side';

for (const key of keys) {
  const clip = ['mov', 'mp4'].map((ext) => join(input, `${key}.${ext}`)).find(existsSync);
  if (!clip) continue;
  const hash = createHash('sha256').update(version).update(readFileSync(clip)).digest('hex').slice(0, 10);
  const folder = `${key.toLowerCase()}-${hash}`;
  const dir = join(output, folder);
  const old = previous[key];
  if (old?.hash === hash && [old.desktop, old.phone].every((set) => [...set.avif, ...set.webp].every((url) => existsSync(join(output, folder, basename(url)))))) {
    manifest[key] = old;
    console.log(`${key}: unchanged`);
    continue;
  }
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', clip], { encoding: 'utf8' }));
  const duration = Number(probe.format.duration);
  if (!(duration > 0)) throw new Error(`${key}: no video duration`);
  const video = probe.streams.find((s) => s.codec_type === 'video');
  if (!video) throw new Error(`${key}: no video stream`);
  // A phone recording is tall. Sized by width, a 590 x 1280 clip came out 960 x 2082 and no
  // quality fitted the budget: the long side takes the target size instead.
  const turned = Math.abs(Number(video.side_data_list?.find((d) => d.rotation != null)?.rotation ?? video.tags?.rotate ?? 0)) % 180 === 90;
  const tall = turned ? video.width > video.height : video.height > video.width;
  const temp = mkdtempSync(join(tmpdir(), 'pf-sequence-'));
  mkdirSync(dir, { recursive: true });
  const entry = { hash, source: `src/assets/footage/${basename(clip)}`, duration, desktop: null, phone: null };
  try {
    for (const [name, count, size, limit] of [['desktop', 60, 960, 1_200_000], ['phone', 36, 640, 500_000]]) {
      const frames = join(temp, name);
      mkdirSync(frames);
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', clip, '-an', '-vf', `fps=${count / duration},scale=${tall ? `-2:${size}` : `${size}:-2`}`, '-frames:v', String(count), join(frames, '%03d.png')]);
      const files = readdirSync(frames).filter((f) => f.endsWith('.png')).sort();
      if (files.length !== count) throw new Error(`${key}: extracted ${files.length}, expected ${count}`);
      let set;
      // A visitor fetches one format, so the heavier of the two is what must fit the budget.
      for (const quality of [40, 28, 18, 10]) {
        const total = { avif: 0, webp: 0 };
        const avif = [], webp = [];
        for (let i = 0; i < files.length; i++) {
          const base = `${name}-${String(i).padStart(3, '0')}`;
          for (const format of ['avif', 'webp']) {
            const pipeline = sharp(join(frames, files[i]));
            const data = await (format === 'avif' ? pipeline.avif({ quality, effort: 2 }) : pipeline.webp({ quality: Math.min(75, quality + 15), effort: 3 })).toBuffer();
            writeFileSync(join(dir, `${base}.${format}`), data);
            total[format] += data.length;
            (format === 'avif' ? avif : webp).push(`/seq/${folder}/${base}.${format}`);
          }
        }
        const meta = await sharp(join(frames, files[0])).metadata();
        set = { count, width: meta.width, height: meta.height, bytes: Math.max(total.avif, total.webp), avif, webp };
        if (set.bytes <= limit) break;
      }
      if (set.bytes > limit) throw new Error(`${key} ${name}: ${set.bytes} bytes exceeds ${limit}`);
      entry[name] = set;
      console.log(`${key} ${name}: ${set.count} frames, ${set.width} x ${set.height}, ${set.bytes} bytes`);
    }
    manifest[key] = entry;
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw error;
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
mkdirSync(resolve(manifestPath, '..'), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
if (!Object.keys(manifest).length) console.log('No footage supplied; project stills remain.');
