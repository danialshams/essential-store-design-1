import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Build-time local media bundle for DAIRA Atelier.
 * These are NEW Unsplash-licensed photographs, independent of the old shop imagery.
 * No runtime third-party image dependency, no old-template fallback.
 */
const dir = path.join(process.cwd(), "public/images");
await mkdir(dir, { recursive: true });

const library = [
  ["atelier-bag-a.webp", "photo-1548036328-c9fa89d128fa"],
  ["atelier-bag-b.webp", "photo-1566150905458-1bf1fc113f0d"],
  ["atelier-shoe-a.webp", "photo-1600269452121-4f2416e55c28"],
  ["atelier-shoe-b.webp", "photo-1608231387042-66d1773070a5"],
  ["atelier-shirt-a.webp", "photo-1503341455253-b2e723bb3dbb"],
  ["atelier-shirt-b.webp", "photo-1554568218-0f1715e72254"],
  ["atelier-clothing-c.webp", "photo-1595777457583-95e059d581b8"],
  ["atelier-clothing-d.webp", "photo-1542272604-787c3835535d"],
  ["atelier-watch-a.webp", "photo-1523275335684-37898b6baf30"],
  ["atelier-watch-b.webp", "photo-1508685096489-7aacd43bd3b1"],
  ["atelier-sunglasses.webp", "photo-1577803645773-f96470509666"],
  ["atelier-accessory.webp", "photo-1564584217132-2271feaeb3c5"],
  ["atelier-scene-a.webp", "photo-1525507119028-ed4c629a60a3"],
  ["atelier-scene-b.webp", "photo-1524250502761-1ac6f2e30d43"],
  ["atelier-scene-c.webp", "photo-1496747611176-843222e1e57c"]
];
async function exists(file) {
  try { return (await stat(path.join(dir, file))).size > 20000; } catch { return false; }
}
async function download(id, width = 1000, height = 1250) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=88`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const binary = Buffer.from(await response.arrayBuffer());
      if (binary.length < 9000) throw new Error("image too small");
      return binary;
    } catch (error) {
      if (attempt === 2) throw new Error("Failed to fetch new image " + id + ": " + error.message);
      await new Promise(resolve => setTimeout(resolve, 700 + attempt * 700));
    }
  }
  throw new Error("Unreachable image: " + id);
}
await Promise.all(library.map(async ([file, photoId]) => {
  if (await exists(file)) return;
  const binary = await download(photoId);
  await sharp(binary).resize(900, 1150, { fit: "cover", position: "attention" })
    .webp({ quality: 83, effort: 4 }).toFile(path.join(dir, file));
  console.log("[DAIRA Atelier] " + file);
}));

/* Prepare a navy fashion editorial: selectively transform gold garment fabric
   in a NEW photograph while preserving naturally colored skin and the set.
   This is not a blue overlay on any previously used homepage image. */
const source = await download("photo-1771072426488-87e6bbcc0cf7", 1200, 1800);
const masterWidth = 1050;
const masterHeight = 1500;
const { data: pixels, info } = await sharp(source)
  .resize(masterWidth, masterHeight, { fit: "cover", position: "attention" })
  .removeAlpha().raw().toBuffer({ resolveWithObject: true });
for (let y = Math.floor(masterHeight * .20); y < masterHeight; y++) {
  for (let x = 0; x < masterWidth; x++) {
    const idx = (y * masterWidth + x) * info.channels;
    const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
    // Only the highly saturated yellow/gold clothing, not the face, skin or background.
    const chroma = Math.max(r,g,b) - Math.min(r,g,b);
    const gold = r > 90 && g > 65 && r > b * 1.6 && g > b * 1.42 && chroma > 58 && r >= g * .94;
    if (!gold) continue;
    const luminance = r * .30 + g * .55 + b * .15;
    pixels[idx] = Math.max(12, Math.round(luminance * .20));
    pixels[idx+1] = Math.max(25, Math.round(luminance * .34));
    pixels[idx+2] = Math.max(40, Math.round(luminance * .58));
  }
}
const portrait = await sharp(pixels, { raw: { width: masterWidth, height: masterHeight, channels: info.channels } })
  .webp({ quality: 87 }).toBuffer();

function gradient(width, height, mobile) {
  const direction = mobile ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  const stops = mobile
    ? '<stop offset="0%" stop-color="#071827" stop-opacity="0"/><stop offset="58%" stop-color="#071827" stop-opacity=".06"/><stop offset="100%" stop-color="#071827" stop-opacity="1"/>'
    : '<stop offset="0%" stop-color="#071827" stop-opacity="0"/><stop offset="43%" stop-color="#071827" stop-opacity=".3"/><stop offset="72%" stop-color="#071827" stop-opacity=".93"/><stop offset="100%" stop-color="#071827" stop-opacity="1"/>';
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height +
    '"><defs><linearGradient id="g" ' + direction + '>' + stops +
    '</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>');
}
async function compose(file, width, height, imageWidth, imageHeight, left, top, mobile) {
  if (await exists(file)) return;
  const model = await sharp(portrait).resize(imageWidth, imageHeight, { fit: "contain", background: "#071827" })
    .webp({ quality: 86 }).toBuffer();
  await sharp({ create: { width, height, channels: 4, background: "#071827" } })
    .composite([
      { input: model, left, top },
      { input: gradient(width, height, mobile), left: 0, top: 0 }
    ]).webp({ quality: 89, effort: 5 }).toFile(path.join(dir, file));
  console.log("[DAIRA Atelier] " + file);
}
await compose("atelier-hero-desktop.webp", 1920, 1080, 1020, 1080, 0, 0, false);
await compose("atelier-hero-mobile.webp", 920, 1640, 920, 1460, 0, 0, true);
await compose("atelier-festival.webp", 1220, 1300, 920, 1300, 150, 0, true);
