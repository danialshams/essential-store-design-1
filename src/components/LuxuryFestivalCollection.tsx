"use client";
import {useMemo,useState} from "react";
import {Search,SlidersHorizontal,RotateCcw} from "lucide-react";
import {ProductCard} from "@/components/ProductCard";
import type {Product} from "@/lib/catalog";

type Sort="discount"|"low"|"high"|"new";
export function LuxuryFestivalCollection({products}:{products:Product[]}){
 const [search,setSearch]=useState("");
 const [category,setCategory]=useState("");
 const [sort,setSort]=useState<Sort>("discount");
 const categories=useMemo(()=>[...new Map(products.map(p=>[p.category,p.categoryLabel])).entries()], [products]);
 const list=useMemo(()=>{
  const query=search.trim().toLocaleLowerCase("fa");
  return products.filter(p=>(!category||p.category===category)&&(!query||[p.name,p.subtitle,p.categoryLabel].join(" ").toLocaleLowerCase("fa").includes(query)))
    .slice().sort((a,b)=>sort==="low"?a.price-b.price:sort==="high"?b.price-a.price:sort==="new"?Number(Boolean(b.newArrival))-Number(Boolean(a.newArrival)):((b.comparePrice||b.price)-b.price)/(b.comparePrice||b.price)-((a.comparePrice||a.price)-a.price)/(a.comparePrice||a.price));
 },[products,search,category,sort]);
 const clear=()=>{setSearch("");setCategory("");setSort("discount")};
 return <>
  <div className="luxury-festival-controls" aria-label="فیلتر محصولات جشنواره">
    <label className="luxury-festival-search"><Search size={18}/><input aria-label="جستجو در محصولات جشنواره" value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجو در جشنواره..."/></label>
    <label className="luxury-festival-sort"><SlidersHorizontal size={17}/><span>مرتب‌سازی</span><select aria-label="مرتب‌سازی جشنواره" value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="discount">بیشترین تخفیف</option><option value="new">جدیدترین</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option></select></label>
  </div>
  <div className="luxury-festival-filters">
   <button type="button" aria-pressed={!category} className={!category?"active":""} onClick={()=>setCategory("")}>همه محصولات</button>
   {categories.map(([key,name])=><button type="button" key={key} aria-pressed={category===key} className={category===key?"active":""} onClick={()=>setCategory(key)}>{name}</button>)}
  </div>
  <p className="luxury-festival-results">{list.length.toLocaleString("fa-IR")} محصول پیدا شد</p>
  {list.length?<div className="luxury-product-grid">{list.map(p=><div className="luxury-product-wrap" key={p.id}><ProductCard product={p}/></div>)}</div>:<div className="luxury-empty-state"><p>محصولی با این مشخصات پیدا نشد.</p><button className="luxury-reset" type="button" onClick={clear}>پاک کردن فیلترها <RotateCcw size={16}/></button></div>}
 </>;
}
