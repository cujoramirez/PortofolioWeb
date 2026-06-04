// Generates the social-preview image (public/og-image.jpg, 1200x630) and favicon set from the
// portrait + logo. Re-run with `node scripts/generate-og.mjs` after changing either source image.
import sharp from 'sharp';

const PORTRAIT = 'src/assets/GadingAdityaPerdana.png';
const LOGO = 'src/assets/GadingLogo.png';

const W = 1200;
const H = 630;
const PHOTO_W = 470;

// Branded backdrop + name/role on the left (system font; this is a preview image, not the site).
const base = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0b0d"/><stop offset="100%" stop-color="#0e1729"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="150" cy="60" r="340" fill="#3b82f6" opacity="0.13"/>
  <circle cx="690" cy="610" r="240" fill="#22d3ee" opacity="0.10"/>
  <text x="82" y="232" font-family="Helvetica,Arial,sans-serif" font-size="30" font-weight="600" fill="#22d3ee" letter-spacing="4">AI RESEARCHER</text>
  <text x="78" y="324" font-family="Helvetica,Arial,sans-serif" font-size="70" font-weight="700" fill="#ffffff">Gading Aditya</text>
  <text x="78" y="400" font-family="Helvetica,Arial,sans-serif" font-size="70" font-weight="700" fill="#ffffff">Perdana</text>
  <text x="82" y="470" font-family="Helvetica,Arial,sans-serif" font-size="28" fill="#cbd5e1">Computer Vision &#183; Deep Learning &#183; 5 Publications</text>
  <text x="82" y="512" font-family="Helvetica,Arial,sans-serif" font-size="28" fill="#cbd5e1">Apple Developer Academy Scholar &#183; BINUS</text>
</svg>`);

const photo = await sharp(PORTRAIT)
  .resize(PHOTO_W, H, { fit: 'cover', position: sharp.strategy.attention })
  .toBuffer();

// Fade the photo's left edge into the dark panel so there is no hard seam.
const blend = Buffer.from(`<svg width="170" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="b" x1="0" x2="1">
    <stop offset="0%" stop-color="#0a0b0d" stop-opacity="1"/><stop offset="100%" stop-color="#0a0b0d" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="170" height="${H}" fill="url(#b)"/></svg>`);

await sharp(base)
  .composite([
    { input: photo, left: W - PHOTO_W, top: 0 },
    { input: blend, left: W - PHOTO_W, top: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/og-image.jpg');

await sharp(LOGO).resize(32, 32).png().toFile('public/favicon-32x32.png');
await sharp(LOGO).resize(16, 16).png().toFile('public/favicon-16x16.png');
await sharp(LOGO).resize(180, 180).png().toFile('public/apple-touch-icon.png');

console.log('Generated public/og-image.jpg + favicons');
