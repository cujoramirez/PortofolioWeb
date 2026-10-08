// Generates the social-preview image (public/og-image.jpg, 1200x630) from the current headshot
// cutout, in the site's visual system (dark plate, dot grid, one accent line).
// Usage: node scripts/generate-og.mjs [--favicons]   (--favicons also rebuilds the icons from the logo)
import sharp from 'sharp';

const PORTRAIT = 'src/assets/GadingAdityaPerdana.png';
const LOGO = 'src/assets/GadingLogo.png';
const W = 1200;
const H = 630;
const INK = '#f2f4f7';
const INK2 = 'rgba(242,244,247,0.7)';
const ACCENT = '#3b82f6';

const dots = Array.from({ length: Math.ceil((H - 48) / 22) }, (_, r) =>
  Array.from({ length: Math.ceil((W - 48) / 22) }, (_, c) => `<circle cx="${36 + c * 22}" cy="${36 + r * 22}" r="1.2" fill="rgba(242,244,247,0.09)"/>`).join(''),
).join('');

const base = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#0a0b0d"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="28" fill="#141518" stroke="rgba(242,244,247,0.12)"/>
  ${dots}
  <text x="76" y="190" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="96" font-weight="800" letter-spacing="-3" fill="${INK}">Gading Aditya</text>
  <text x="76" y="284" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="96" font-weight="800" letter-spacing="-3" fill="${INK}">Perdana</text>
  <rect x="80" y="344" width="56" height="3" fill="${ACCENT}"/>
  <text x="78" y="404" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="34" font-weight="600" fill="${INK}">Software and AI developer</text>
  <text x="78" y="456" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="25" fill="${INK2}">I build apps and AI systems.</text>
  <text x="78" y="494" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="25" fill="${INK2}">Computer Science, BINUS University</text>
  <text x="78" y="532" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="25" fill="${INK2}">Apple Developer Academy scholar, Jakarta</text>
</svg>`);

// The cutout, head-and-shoulders, bottom-anchored inside the plate on the right.
const PH = H - 48 - 20;
const photo = await sharp(PORTRAIT).extract({ left: 60, top: 100, width: 1480, height: 1480 }).resize(PH, PH).png().toBuffer();

await sharp(base)
  .composite([{ input: photo, left: W - 24 - PH + 30, top: H - 24 - PH }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('Generated public/og-image.jpg');

if (process.argv.includes('--favicons')) {
  await sharp(LOGO).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(LOGO).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(LOGO).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('Generated favicons');
}
