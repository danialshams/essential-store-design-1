"use client";
import {useMemo,useState,type ReactNode} from "react";
import type {Product} from "@/lib/catalog";
import {AtelierTile} from "@/components/AtelierTile";

type Shelf="sale"|"best"|"new";
type Props={
  kind:Shelf;
  products:Product[];
  initialProducts:Product[];
  initialMedia:string[];
  gridClassName:string;
  layoutClassName?:string;
  editorial?:ReactNode;
};

const curated:Record<string,number[]>={
  bags:[27,31,1,2,3,4],
  shoes:[21,22,5,6,7,8,19],
  clothing:[25,26,29,30,28,32,9,10,11,12,17,18],
  accessories:[23,24,13,14,15,16,20]
};
const photo=(n:number)=>"/images/atelier-"+(n<=20?"v3":"v4")+"-item-"+String(n).padStart(2,"0")+".webp";
const isDemoImage=(p:Product)=>p.image.startsWith("/images/")||p.image.includes("essential-store-design-1.vercel.app/images/");
const priority:Record<Shelf,number>={sale:0,best:1,new:2};

/** Minimal editorial filters. Every tab is built from actual in-stock products,
 * not hardcoded labels or empty collections. Only four pieces appear at a time.
 */
export function AtelierCategoryGallery({kind,products,initialProducts,initialMedia,gridClassName,layoutClassName,editorial}:Props){
  const [category,setCategory]=useState("all");
  const categories=useMemo(()=>{
    const seen=new Map<string,string>();
    products.filter(p=>p.inventory>0).forEach(p=>{
      if(!seen.has(p.category))seen.set(p.category,p.categoryLabel||p.category);
    });
    return [...seen].map(([value,label])=>({value,label}));
  },[products]);

  const visible=useMemo(()=>category==="all"
    ? initialProducts.slice(0,4)
    : products.filter(p=>p.inventory>0&&p.category===category).slice(0,4),
  [category,products,initialProducts]);

  const images=useMemo(()=>{
    if(category==="all")return visible.map((p,index)=>initialMedia[index]||p.image);
    const used=new Set<number>();
    return visible.map((p,index)=>{
      if(!isDemoImage(p))return p.image;
      const full=curated[p.category]||[];
      const groupSize=Math.ceil(full.length/3);
      const offset=priority[kind]*groupSize;
      const favored=full.slice(offset,offset+groupSize);
      const selection=[...favored,...full];
      const chosen=selection.find(n=>!used.has(n));
      if(chosen===undefined)return p.image;
      used.add(chosen);
      return photo(chosen);
    });
  },[category,kind,visible,initialMedia]);

  const gallery=<div key={category} className={gridClassName+" atelier-category-grid atelier-category-grid--"+kind+" atelier-category-grid--count-"+visible.length} role="region" aria-label={"محصولات "+(category==="all"?"همه دسته‌ها":categories.find(c=>c.value===category)?.label||category)}>
    {visible.map((p,index)=>{
      const tile=<AtelierTile key={category+"-"+p.id} product={p} editorialImage={images[index]} index={index}
        shape={kind==="best"?(index===0?"feature":index===2?"landscape":"portrait"):kind==="sale"?(index===0?"portrait":"standard"):"standard"}/>;
      return kind==="sale"
        ? <div className="luxury-product-wrap luxury-sale-item" key={category+"-"+p.id}>{tile}</div>
        : tile;
    })}
  </div>;

  return <div className={"atelier-category-collection atelier-category-collection--"+kind}>
    <nav className={"atelier-category-tabs atelier-category-tabs--"+kind} aria-label={"دسته‌بندی "+(kind==="sale"?"جشنواره":kind==="best"?"پرفروش‌ترین‌ها":"جدیدترین‌ها")} data-atelier-filter={kind}>
      <button type="button" data-category-id="all" aria-pressed={category==="all"}
        className={category==="all"?"is-active":""} onClick={()=>setCategory("all")}>همه</button>
      {categories.map(item=><button key={item.value} type="button" data-category-id={item.value} aria-pressed={category===item.value}
        className={category===item.value?"is-active":""} onClick={()=>setCategory(item.value)}>{item.label}</button>)}
    </nav>
    <span role="status" className="atelier-a11y-only">{category==="all"?"همه محصولات":categories.find(c=>c.value===category)?.label}، {visible.length.toLocaleString("fa-IR")} محصول</span>
    {layoutClassName?<div className={layoutClassName}>
      {editorial}
      {gallery}
    </div>:gallery}
  </div>;
}
