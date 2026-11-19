import type {Product} from "@/lib/catalog";

const photo=(n:number)=>`/images/atelier-v3-item-${String(n).padStart(2,"0")}.webp`;
const categories:Record<string,number[]>={
  bags:[1,2,3,4],
  shoes:[5,6,7,8,19],
  clothing:[9,10,11,12,17,18],
  accessories:[13,14,15,16,20]
};
const all=Array.from({length:20},(_,i)=>i+1);
/**
 * Assign a distinct editorial photograph to every visible gallery slot.
 * User-uploaded product media is never replaced; only bundled/demo product images get an editorial variant.
 */
export function allocateEditorialMedia(groups:Product[][]):string[][]{
  const used=new Set<number>();
  return groups.map(group=>group.map(product=>{
    const p=product.image||"";
    const bundled=p.startsWith("/images/")||p.includes("essential-store-design-1.vercel.app/images/");
    if(!bundled&&p)return p;
    const set=categories[product.category]||all;
    let selected=set.find(id=>!used.has(id));
    if(selected===undefined)selected=all.find(id=>!used.has(id));
    if(selected===undefined)selected=set[0]||1;
    used.add(selected);
    return photo(selected);
  }));
}
