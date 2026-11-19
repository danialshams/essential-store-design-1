import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * DAIRA Atelier original photo campaign.
 * Every displayed gallery image comes from the newly generated, bundled navy
 * editorial sheets. No image-CDN calls, old stock photography or paid services.
 *
 * In a production storefront with merchant-uploaded photos the original upload
 * remains untouched; this only replaces legacy demo image aliases.
 */
const dir = path.join(process.cwd(), "public/images");
await mkdir(dir, { recursive: true });

const validate = async (file, min = 6000) => {
  try { return (await stat(path.join(dir, file))).size >= min; }
  catch { return false; }
};
for (const [file,min] of [
  ["atelier-hero-cinema.webp",10000],
  ["atelier-gallery-sheet-1.webp",25000],
  ["atelier-gallery-sheet-2.webp",25000],
]) {
  if (!(await validate(file,min))) throw Error("[atelier] Required original photograph missing: " + file);
}

const library = [
  ["atelier-bag-a.webp",1,"BL"],
  ["atelier-bag-b.webp",2,"BL"],
  ["atelier-shoe-a.webp",1,"BR"],
  ["atelier-shoe-b.webp",2,"BR"],
  ["atelier-shirt-a.webp",2,"BR"],
  ["atelier-shirt-b.webp",1,"BR"],
  ["atelier-clothing-c.webp",2,"TL"],
  ["atelier-clothing-d.webp",1,"TL"],
  ["atelier-watch-a.webp",1,"BR"],
  ["atelier-watch-b.webp",2,"BR"],
  ["atelier-sunglasses.webp",1,"BL"],
  ["atelier-accessory.webp",2,"BL"],
  ["atelier-scene-a.webp",1,"TR"],
  ["atelier-scene-b.webp",2,"TR"],
  ["atelier-scene-c.webp",2,"TL"],
  ["atelier-festival.webp",2,"TR"],
];

const half = (meta, quadrant) => {
  const width = meta.width, height = meta.height, gutter = 3;
  const left = quadrant.endsWith("R") ? Math.floor(width/2)+gutter : gutter;
  const top = quadrant.startsWith("B") ? Math.floor(height/2)+gutter : gutter;
  return {
    left, top,
    width: Math.floor(width/2)-gutter*2,
    height: Math.floor(height/2)-gutter*2
  };
};

await Promise.all(library.map(async ([file,index,quadrant]) => {
  if (await validate(file,15000)) return;
  const sheet = path.join(dir,`atelier-gallery-sheet-${index}.webp`);
  const meta = await sharp(sheet).metadata();
  const isFestival = file==="atelier-festival.webp";
  const width = isFestival ? 1220 : 900;
  const height = isFestival ? 1300 : 1125;
  await sharp(sheet).extract(half(meta,quadrant))
    .resize(width,height,{fit:"cover",position:"attention"})
    .webp({quality:85,effort:5}).toFile(path.join(dir,file));
  console.log("[atelier] "+file);
}));

const heroSource = path.join(dir,"atelier-hero-cinema.webp");
if (!(await validate("atelier-hero-desktop.webp",18000))) {
  await sharp(heroSource).resize(1920,1080,{fit:"cover",position:"centre"})
    .webp({quality:89,effort:5}).toFile(path.join(dir,"atelier-hero-desktop.webp"));
  console.log("[atelier] atelier-hero-desktop.webp");
}
if (!(await validate("atelier-hero-mobile.webp",18000))) {
  const meta = await sharp(heroSource).metadata();
  const width = Math.min(695,meta.width);
  const portrait = await sharp(heroSource)
    .extract({left:0,top:0,width,height:meta.height})
    .resize(920,1110,{fit:"contain",background:"#071827"})
    .webp({quality:87}).toBuffer();
  await sharp({create:{width:920,height:1640,channels:4,background:"#071827"}})
    .composite([{input:portrait,left:0,top:0}])
    .webp({quality:88,effort:5}).toFile(path.join(dir,"atelier-hero-mobile.webp"));
  console.log("[atelier] atelier-hero-mobile.webp");
}
