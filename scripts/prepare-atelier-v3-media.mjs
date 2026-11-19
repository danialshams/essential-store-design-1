import sharp from "sharp";
import {mkdir,stat} from "node:fs/promises";
import path from "node:path";

/** Generate frame-specific photo outputs from six original locally bundled WebP campaigns. */
const root=path.join(process.cwd(),"public","images");
await mkdir(root,{recursive:true});
const sources=["atelier-v3-hero-desktop.webp","atelier-v3-hero-mobile.webp","atelier-v3-campaign.webp","atelier-v3-editorial.webp","atelier-v3-products-a.webp","atelier-v3-products-b.webp"];
for(const name of sources){
 const p=path.join(root,name);
 try{if((await stat(p)).size<25000)throw Error("Too small");}
 catch(e){throw Error("Required original WebP campaign asset is missing or damaged: "+name)}
}
const exists=async(file)=>{try{return (await stat(path.join(root,file))).size>9000}catch{return false}};
const atlases=[await sharp(path.join(root,"atelier-v3-products-a.webp")).metadata(),await sharp(path.join(root,"atelier-v3-products-b.webp")).metadata()];
await Promise.all(Array.from({length:20},async(_,index)=>{
 const num=index+1;
 const name=`atelier-v3-item-${String(num).padStart(2,"0")}.webp`;
 const wide=name.replace(".webp","-wide.webp");
 if(await exists(name)&&await exists(wide))return;
 const source=index<12?"atelier-v3-products-a.webp":"atelier-v3-products-b.webp";
 const sheet=index<12?atlases[0]:atlases[1];
 const pos=index<12?index:index-12;
 const x=pos%4,y=Math.floor(pos/4);
 const tw=Math.floor(sheet.width/4),th=Math.floor(sheet.height/(index<12?3:2));
 const raw=await sharp(path.join(root,source)).extract({left:x*tw,top:y*th,width:tw,height:th}).resize(880,1100,{fit:"cover",position:"centre"}).webp({quality:90,effort:5}).toBuffer();
 if(!(await exists(name)))await sharp(raw).toFile(path.join(root,name));
 if(!(await exists(wide))){
  const w=1350,h=760;
  const background=await sharp(raw).resize(w,h,{fit:"cover"}).blur(48).modulate({brightness:.4}).toBuffer();
  const foreground=await sharp(raw).resize({width:Math.round(h*.76),height:Math.round(h*.93),fit:"contain"}).toBuffer();
  const fm=await sharp(foreground).metadata();
  await sharp(background).composite([{input:foreground,left:Math.floor((w-fm.width)/2),top:Math.floor((h-fm.height)/2)}]).webp({quality:87,effort:5}).toFile(path.join(root,wide));
 }
 console.log("[atelier/v3] "+name);
}));
