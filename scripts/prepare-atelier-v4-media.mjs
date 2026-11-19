import sharp from "sharp";
import {mkdir,stat} from "node:fs/promises";
import path from "node:path";

/**
 * Self-contained, deterministic ATELIER IV image pipeline.
 *
 * All seven high-quality sapphire editorial source WebPs are committed to Git.
 * No runtime/external CDN requests. Missing or corrupt inputs fail the build.
 */
const dir=path.join(process.cwd(),"public","images");
await mkdir(dir,{recursive:true});
const full=(name)=>path.join(dir,name);
const required=[
  "atelier-v4-hero-desktop.webp","atelier-v4-hero-mobile.webp",
  "atelier-v4-campaign.webp","atelier-v4-editorial.webp",
  "atelier-v4-sheet-1.webp","atelier-v4-sheet-2.webp","atelier-v4-sheet-3.webp"
];
for(const name of required){
  let size=0;try{size=(await stat(full(name))).size}catch{}
  if(size<18000)throw Error("Required bundled editorial image is missing: "+name);
  const m=await sharp(full(name)).metadata();
  if(m.format!=="webp"||!m.width||!m.height)throw Error("Invalid WebP source: "+name);
  console.log("[ATELIER IV] verified "+name+" "+m.width+"x"+m.height);
}
const exists=async(name)=>{try{return(await stat(full(name))).size>12000}catch{return false}};
const sourceMeta=await Promise.all([1,2,3].map(n=>sharp(full("atelier-v4-sheet-"+n+".webp")).metadata()));
await Promise.all(Array.from({length:12},async(_,i)=>{
  const n=i+21;
  const stem="atelier-v4-item-"+String(n).padStart(2,"0");
  const portraitName=stem+".webp",wideName=stem+"-wide.webp";
  if(await exists(portraitName)&&await exists(wideName))return;
  const sheetNumber=Math.floor(i/4)+1;
  const quadrant=i%4;
  const meta=sourceMeta[sheetNumber-1];
  const cw=Math.floor(meta.width/2),ch=Math.floor(meta.height/2);
  const inset=Math.max(3,Math.floor(Math.min(cw,ch)*0.007));
  const source=await sharp(full("atelier-v4-sheet-"+sheetNumber+".webp")).extract({
    left:(quadrant%2)*cw+inset,
    top:Math.floor(quadrant/2)*ch+inset,
    width:cw-inset*2,
    height:ch-inset*2
  }).toBuffer();
  const portrait=await sharp(source).resize(900,1125,{fit:"cover",position:"attention"}).webp({quality:88,effort:5}).toBuffer();
  if(!(await exists(portraitName)))await sharp(portrait).toFile(full(portraitName));
  if(!(await exists(wideName))){
    const width=1350,height=760;
    const backdrop=await sharp(portrait).resize(width,height,{fit:"cover"}).blur(48).modulate({brightness:.44,saturation:.73}).toBuffer();
    const foreground=await sharp(portrait).resize(570,710,{fit:"contain"}).toBuffer();
    const fgMeta=await sharp(foreground).metadata();
    await sharp(backdrop).composite([{input:foreground,left:Math.round((width-fgMeta.width)/2),top:Math.round((height-fgMeta.height)/2)}]).webp({quality:86,effort:5}).toFile(full(wideName));
  }
  console.log("[ATELIER IV] "+portraitName+" + landscape");
}));
for(let n=21;n<=32;n++){
  const stem="atelier-v4-item-"+n;
  for(const suffix of [".webp","-wide.webp"]){
    const name=stem+suffix;
    const meta=await sharp(full(name)).metadata();
    if(meta.format!=="webp"||meta.width<800||meta.height<700)throw Error("Editorial image failed validation: "+name);
  }
}
console.log("[ATELIER IV] All 7 sources and 24 derived WebPs verified.");
