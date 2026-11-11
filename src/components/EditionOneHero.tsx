"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ShoppingCart,LayoutGrid} from "lucide-react";
export type EssentialOneSlide={id:string;title:string;description:string;eyebrow:string;imageUrl:string;mobileImageUrl:string;ctaLabel:string;ctaHref:string};
export function EditionOneHero({slides}:{slides:EssentialOneSlide[]}){
 const [index,setIndex]=useState(0);
 useEffect(()=>{
  if(slides.length<2)return;
  const handle=window.setInterval(()=>{if(document.visibilityState==="visible")setIndex(v=>(v+1)%slides.length)},8500);
  return()=>window.clearInterval(handle);
 },[slides.length]);
 const slide=slides[index]||slides[0];
 if(!slide)return null;
 return <section className="hero" aria-labelledby="hero-title">
  <div className="hero-copy" key={slide.id}>
   <span className="hero-eyebrow">{slide.eyebrow}</span>
   <h1 id="hero-title">{slide.title}</h1>
   <p>{slide.description}</p>
   <div className="hero-actions">
    <Link className="button button-primary" href={slide.ctaHref}>{slide.ctaLabel||"مشاهده محصولات"} <ShoppingCart size={18}/></Link>
    <Link className="button button-outline" href="/#categories">دسته‌بندی‌ها <LayoutGrid size={17}/></Link>
   </div>
   {slides.length>1&&<div className="ed1-slide-dots" aria-label="انتخاب تصویر هیرو">{slides.map((item,i)=>
    <button type="button" key={item.id} aria-label={"نمایش اسلاید "+(i+1)} aria-pressed={i===index} className={i===index?"active":""} onClick={()=>setIndex(i)}/>)}</div>}
  </div>
  <div className="hero-photo" key={"photo-"+slide.id}>
   <Image src={slide.imageUrl} width={1136} height={412} alt={slide.title} priority={index===0} className="hero-desktop-photo" unoptimized={slide.imageUrl.startsWith("http")}/>
   <Image src={slide.mobileImageUrl||slide.imageUrl} width={668} height={522} alt="" priority={index===0} className="hero-mobile-photo" unoptimized={(slide.mobileImageUrl||slide.imageUrl).startsWith("http")}/>
  </div>
 </section>;
}
