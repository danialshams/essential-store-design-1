/** Build-time real-photography pipeline. Uses NEW, un-recolored Pexels stock photos.
 * Explicitly replaces the prior hue-shifted image variants. Originals remain untouched.
 * Photography is bundled into the built site: no external CDN requests at runtime.
 * Administrator-uploaded assets are never transformed or replaced.
 * Pexels License: https://www.pexels.com/license/
 */
import {mkdir,copyFile,writeFile,access} from "node:fs/promises";
import {entries} from "./curated-photo-manifest.mjs";
import {join,dirname} from "node:path";

const realPhotoIds={
  "bag.webp": 36364967,
  "sneakers.webp": 7193626,
  "linen-shirt.webp": 5996399,
  "sunglasses.webp": 36824973,
  "classic-watch.webp": 20022436,
  "products/bag-main.webp": 36364968,
  "products/sneakers-main.webp": 1456733,
  "products/shirt-blue.webp": 8053645,
  "products/watch-main.webp": 35164843,
  "products/bag-everyday.webp": 36356649,
  "products/sneakers-urban.webp": 1461048,
  "products/shirt-beige.webp": 5996399,
  "products/sunglasses-main.webp": 8360305
};
const root=process.cwd(),photos={},queue=[...entries];
let fetched=0,retained=0,fallback=0;
const failures=[];
async function worker(){
 while(queue.length){
  const row=queue.shift();if(!row)break;
  const [key,unsplashId,fallbackFile,width,height]=row;
  const stockId=realPhotoIds[key];
  const legacyPath="/images/curated/"+key.replaceAll("/","-");
  const oldRecolorPath="/images/palette-cool-v1/"+key.replaceAll("/","-");
  const finalPath=stockId?"/images/real-photo-v2/"+key.replaceAll("/","-").replace(/\\.webp$/,".jpg"):legacyPath;
  // Both the canonical template URL and any previously published recolored URL resolve to a REAL photograph.
  photos["/images/"+key]=finalPath;
  photos[legacyPath]=finalPath;
  photos[oldRecolorPath]=finalPath;
  const destination=join(root,"public"+finalPath);
  await mkdir(dirname(destination),{recursive:true});
  try{await access(destination);retained++;continue;}catch{/* not yet present */}
  if(process.env.CURATED_PHOTOS_OFFLINE==="1"){
   await copyFile(join(root,"public/images",fallbackFile),destination);
   fallback++;continue;
  }
  try{
   const url=stockId
    ? "https://images.pexels.com/photos/"+stockId+"/pexels-photo-"+stockId+".jpeg?auto=compress&cs=tinysrgb&w="+width+"&h="+height+"&fit=crop"
    : "https://images.unsplash.com/"+unsplashId+"?fm=webp&fit=crop&crop=entropy&w="+width+"&h="+height+"&q=84";
   let body,downloadError;
   for(let attempt=0;attempt<3;attempt++){
    try{
     const response=await fetch(url,{signal:AbortSignal.timeout(14000)});
     if(!response.ok||!String(response.headers.get("content-type")).startsWith("image/"))
      throw Error("HTTP "+response.status);
     body=Buffer.from(await response.arrayBuffer());
     if(body.length<10000||body.length>6*1024*1024)throw Error("Unexpected image length "+body.length);
     break;
    }catch(error){downloadError=error;}
   }
   if(!body)throw downloadError||Error("Download failed");
   await writeFile(destination,body);fetched++;
  }catch(error){
   failures.push(key+": "+String(error?.message||error));
   // Never publish old manipulated photographs or an empty image.
   if(stockId&&process.env.VERCEL_ENV==="production")throw Error("Real studio photograph unavailable for "+key);
   await copyFile(join(root,"public/images",fallbackFile),destination);
   fallback++;
  }
 }
}
await Promise.all(Array.from({length:5},()=>worker()));
const output="/** AUTO-GENERATED at build time. New natural photography; no recoloring. */\\n"+
 "export const generatedShowcasePhotos:Record<string,string>="+JSON.stringify(photos,null,1)+";\\n";
await writeFile(join(root,"src/lib/generated-showcase-photos.ts"),output);
console.log("[real photography] "+fetched+" downloaded; "+retained+" retained; "+fallback+" original photo fallbacks");
if(failures.length)console.warn("[real photography] missing photo sources: "+failures.join("; "));
