import {generatedShowcasePhotos} from "@/lib/generated-showcase-photos";
/** Media safety: all template images resolve to files bundled in /public/images/.
 * This is required for locations where Unsplash/CDN requests are blocked.
 * Merchant-uploaded images from other origins are preserved unchanged.
 */
const bundled:Record<string,string>={
 "/images/hero-woman.webp":"/images/hero-woman.webp",
 "/images/hero-mobile.webp":"/images/hero-mobile.webp",
 "/images/bag.webp":"/images/bag.webp",
 "/images/sneakers.webp":"/images/sneakers.webp",
 "/images/linen-shirt.webp":"/images/linen-shirt.webp",
 "/images/sunglasses.webp":"/images/sunglasses.webp",
 "/images/classic-watch.webp":"/images/classic-watch.webp",
 "/images/products/bag-main.webp":"/images/bag.webp",
 "/images/products/sneakers-main.webp":"/images/sneakers.webp",
 "/images/products/shirt-blue.webp":"/images/linen-shirt.webp",
 "/images/products/watch-main.webp":"/images/classic-watch.webp",
 "/images/products/bag-everyday.webp":"/images/bag.webp",
 "/images/products/sneakers-urban.webp":"/images/sneakers.webp",
 "/images/products/shirt-beige.webp":"/images/linen-shirt.webp",
 "/images/products/sunglasses-main.webp":"/images/sunglasses.webp"
};
const previouslyExternal:Record<string,string>={
 "photo-1483985988355-763728e1935b":"/images/hero-woman.webp",
 "photo-1529139574466-a303027c1d8b":"/images/hero-mobile.webp",
 "photo-1584917865442-de89df76afd3":"/images/bag.webp",
 "photo-1525966222134-fcfa99b8ae77":"/images/sneakers.webp",
 "photo-1489987707025-afc232f7ea0f":"/images/linen-shirt.webp",
 "photo-1511499767150-a48a237f0083":"/images/sunglasses.webp",
 "photo-1524805444758-089113d48a6d":"/images/classic-watch.webp",
 "photo-1549298916-b41d501d3772":"/images/sneakers.webp",
 "photo-1602810318383-e386cc2a3ccf":"/images/linen-shirt.webp",
 "photo-1590874103328-eac38a683ce7":"/images/bag.webp",
 "photo-1620799140188-3b2a02fd9a77":"/images/linen-shirt.webp"
};
const luxuryTemplateMap:Record<string,string>={
 "/images/hero-woman.webp":"/images/luxury-hero.webp",
 "/images/hero-mobile.webp":"/images/luxury-hero-mobile.webp",
 "/images/bag.webp":"/images/luxury-bag.webp",
 "/images/sneakers.webp":"/images/luxury-shoe.webp",
 "/images/linen-shirt.webp":"/images/luxury-clothing.webp",
 "/images/classic-watch.webp":"/images/luxury-watch.webp",
 "/images/sunglasses.webp":"/images/luxury-sunglasses.webp",
 "/images/products/shirt-blue.webp":"/images/luxury-clothing.webp",
 "/images/products/bag-main.webp":"/images/luxury-bag.webp",
 "/images/products/bag-everyday.webp":"/images/luxury-bag.webp",
 "/images/products/sneakers-main.webp":"/images/luxury-shoe.webp",
 "/images/products/sneakers-urban.webp":"/images/luxury-shoe.webp",
 "/images/products/shirt-beige.webp":"/images/luxury-clothing.webp",
 "/images/products/watch-main.webp":"/images/luxury-watch.webp",
 "/images/products/sunglasses-main.webp":"/images/luxury-sunglasses.webp"
};
export function showcasePhoto(raw:string|null|undefined):string{
 if(!raw)return "";
 let key=raw;
 if(raw.startsWith("https://essential-store-design-")){
  try{
   const url=new URL(raw);
   if(url.pathname.startsWith("/images/"))key=url.pathname;
  }catch{return raw}
 }
 if(raw.startsWith("https://images.unsplash.com/")){
  try{
   const url=new URL(raw);
   const known=previouslyExternal[url.pathname.slice(1)];
   if(known)return luxuryTemplateMap[known]||generatedShowcasePhotos[known]||known;
  }catch{return raw}
 }
 const original=generatedShowcasePhotos[key]||bundled[key]||key;
 const mapped=key.startsWith("/images/real-photo-")?"/images/"+key.slice(key.lastIndexOf("/")+1).replace(".webp.jpg",".webp"):key;
 return luxuryTemplateMap[key]||luxuryTemplateMap[mapped]||original;
}
export const legacyTemplatePhoto=(raw:string|null|undefined):boolean=>{
 if(!raw)return false;
 return Object.prototype.hasOwnProperty.call(bundled,raw)||
   (raw.startsWith("https://images.unsplash.com/")&&Boolean(previouslyExternal[new URL(raw).pathname.slice(1)]))||
   (raw.startsWith("https://essential-store-design-")&&Object.prototype.hasOwnProperty.call(bundled,new URL(raw).pathname));
};
