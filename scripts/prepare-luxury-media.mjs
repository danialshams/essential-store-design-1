/** Premium site-owned editorial photography. All photos are fetched at BUILD time:
 * no third-party photo host is needed at runtime. Only licensed Unsplash photographs.
 * If a temporary source is unavailable we preserve existing local fallback images.
 */
import {mkdir,copyFile,access,writeFile} from "node:fs/promises";
import {join} from "node:path";
const publicDir=join(process.cwd(),"public/images");
const rows=[
 ["luxury-hero.webp","photo-1539109136881-3be0616acf4b",1920,1080,"hero-woman.webp"],
 ["luxury-hero-mobile.webp","photo-1539109136881-3be0616acf4b",850,1280,"hero-mobile.webp"],
 ["luxury-festival.webp","photo-1509631179647-0177331693ae",1140,1240,"hero-woman.webp"],
 ["luxury-bag.webp","photo-1547949003-9792a18a2601",800,1000,"bag.webp"],
 ["luxury-shoe.webp","photo-1600185365926-3a2ce3cdb9eb",800,1000,"sneakers.webp"],
 ["luxury-clothing.webp","photo-1598032895397-b9472444bf93",800,1000,"linen-shirt.webp"],
 ["luxury-watch.webp","photo-1524592094714-0f0654e20314",800,1000,"classic-watch.webp"],
 ["luxury-sunglasses.webp","photo-1572635196237-14b3f281503f",800,1000,"sunglasses.webp"]
];
const failures=[];
for(const [file,id,w,h,fallback] of rows){
 const dest=join(publicDir,file);
 try{await access(dest);continue;}catch{}
 try{
  const url=`https://images.unsplash.com/${id}?fm=webp&fit=crop&w=${w}&h=${h}&q=83`;
  const res=await fetch(url,{signal:AbortSignal.timeout(16000),headers:{"User-Agent":"DairaStoreShowcase/1.0"}});
  if(!res.ok||!String(res.headers.get("content-type")).startsWith("image/"))throw Error("Image HTTP "+res.status);
  const bytes=Buffer.from(await res.arrayBuffer());
  if(bytes.length<6000||bytes.length>5e6)throw Error("Invalid image payload");
  await writeFile(dest,bytes);
  console.log("[luxury media] bundled "+file+" ("+bytes.length+" bytes)");
 }catch(error){
  failures.push(file+" "+String(error?.message||error));
  // Graceful local fallback keeps pages functional even if third-party source is down.
  await copyFile(join(publicDir,fallback),dest);
 }
}
if(failures.length)console.warn("[luxury media] substituted local assets for: "+failures.join("; "));
