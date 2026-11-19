import sharp from "sharp";
import {mkdir,stat} from "node:fs/promises";
import path from "node:path";

/**
 * Self-contained editorial production assets.
 * Every photo is rendered to its exact intended frame at build time, so the
 * browser never needs an external image CDN or scales the image past its frame.
 * Existing user-uploaded product images are never modified by this script.
 */
const dir=path.join(process.cwd(),"public/images");
await mkdir(dir,{recursive:true});
const file=n=>path.join(dir,n);
const exists=async(n,min=14000)=>{try{return (await stat(file(n))).size>min}catch{return false}};
const navy="#071827";
async function hero(name,source,width,height,inset){
  if(await exists(name))return;
  const original=await sharp(file(source)).resize(width-inset*2,height-inset*2,{fit:"contain",background:navy}).webp({quality:90}).toBuffer();
  await sharp({create:{width,height,channels:4,background:navy}})
    .composite([{input:original,left:inset,top:inset}])
    .webp({quality:91,effort:5}).toFile(file(name));
  console.log("[atelier-v4] "+name);
}
await hero("atelier-v4-hero-desktop.webp","atelier-v3-hero-desktop.webp",1920,1080,35);
await hero("atelier-v4-hero-mobile.webp","atelier-v3-hero-mobile.webp",920,1640,15);

const selected=[
  [21,"photo-1600269452121-4f2416e55c28"],
  [22,"photo-1608231387042-66d1773070a5"],
  [23,"photo-1523275335684-37898b6baf30"],
  [24,"photo-1577803645773-f96470509666"],
  [25,"photo-1496747611176-843222e1e57c"],
  [26,"photo-1524250502761-1ac6f2e30d43"],
  [27,"photo-1548036328-c9fa89d128fa"],
  [28,"photo-1554568218-0f1715e72254"],
  [29,"photo-1595777457583-95e059d581b8"],
  [30,"photo-1542272604-787c3835535d"],
  [31,"photo-1566150905458-1bf1fc113f0d"],
  [32,"photo-1503341455253-b2e723bb3dbb"]
];
async function download(id){
 const url="https://images.unsplash.com/"+id+"?auto=format&fit=crop&w=1650&h=1850&q=88";
 for(let retry=0;retry<3;retry++){
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(19000)});
   if(!r.ok)throw Error("HTTP "+r.status);
   const bytes=Buffer.from(await r.arrayBuffer());
   if(bytes.length<9000)throw Error("Image is unexpectedly small");
   return bytes;
  }catch(e){if(retry===2)return null;await new Promise(done=>setTimeout(done,650*(retry+1)));}
 }
 return null;
}
async function frame(buffer,width,height,quality){
 const bg=await sharp(buffer).resize(width,height,{fit:"cover",position:"attention"})
  .blur(55).modulate({brightness:.5,saturation:.65}).toBuffer();
 const foreground=await sharp(buffer).resize(width-28,height-28,{fit:"contain"}).toBuffer();
 const meta=await sharp(foreground).metadata();
 return sharp(bg).composite([{input:foreground,left:Math.floor((width-meta.width)/2),top:Math.floor((height-meta.height)/2)}])
  .webp({quality,effort:5}).toBuffer();
}
await Promise.all(selected.map(async ([n,id],index)=>{
 const stem="atelier-v4-item-"+String(n).padStart(2,"0");
 if(await exists(stem+".webp")&&await exists(stem+"-wide.webp"))return;
 const source=await download(id)||await sharp(file("atelier-v3-item-"+String(index+1).padStart(2,"0")+".webp")).toBuffer();
 if(!(await exists(stem+".webp")))await sharp(await frame(source,900,1125,88)).toFile(file(stem+".webp"));
 if(!(await exists(stem+"-wide.webp")))await sharp(await frame(source,1350,760,87)).toFile(file(stem+"-wide.webp"));
 console.log("[atelier-v4] "+stem);
}));
async function campaign(name,id,fallback,size){
 if(await exists(name))return;
 const source=await download(id)||await sharp(file(fallback)).toBuffer();
 await sharp(await frame(source,size[0],size[1],90)).toFile(file(name));
 console.log("[atelier-v4] "+name);
}
await campaign("atelier-v4-campaign.webp","photo-1515886657613-9f3515b0c78f","atelier-v3-campaign.webp",[1300,1440]);
await campaign("atelier-v4-editorial.webp","photo-1525507119028-ed4c629a60a3","atelier-v3-editorial.webp",[1100,1450]);
