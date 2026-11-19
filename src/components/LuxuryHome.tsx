import Link from "next/link";
import Image from "next/image";
import {ArrowLeft,ArrowUpLeft,ChevronLeft} from "lucide-react";
import type {Product} from "@/lib/catalog";
import type {StoreData} from "@/lib/live-store";
import {ProductCard} from "@/components/ProductCard";
import {FestivalCountdown} from "@/components/FestivalCountdown";
import {LuxuryIntro} from "@/components/LuxuryIntro";
import {LuxuryMotion} from "@/components/LuxuryMotion";
import {festivalProducts,popularProducts,recentProducts} from "@/lib/luxury-catalog";
import {editionTwoDefaults} from "@/lib/admin/edition-two";
import {legacyTemplatePhoto,showcasePhoto} from "@/lib/showcase-photos";

function ShopShelf({title,eyebrow,description,items,href,variant}:{title:string;eyebrow:string;description:string;items:Product[];href:string;variant:"best"|"new"}){
 return <section className={`luxury-shelf luxury-shelf--${variant}`} aria-label={title}>
  <div className="luxury-inner">
   <div className="luxury-section-head" data-lux-reveal>
    <div><span className="luxury-kicker">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
    <Link href={href} className="luxury-text-link">مشاهده همه <ArrowUpLeft size={17}/></Link>
   </div>
   <div className="luxury-product-grid">
    {items.map((p,i)=><div className="luxury-product-wrap" key={p.id} data-lux-reveal style={{transitionDelay:`${i*60}ms`}}><ProductCard product={p}/></div>)}
    {items.length===0&&<div className="luxury-empty">هنوز محصولی برای نمایش در این بخش وجود ندارد.</div>}
   </div>
  </div>
 </section>;
}
export function LuxuryHome({store}:{store:StoreData}){
 const edition=store.settings.editorialConfig;
 const configuredHero=edition?.hero?.find(x=>x.enabled);
 const standardHero=showcasePhoto(configuredHero?.imageUrl);
 const bespoke=Boolean(configuredHero?.imageUrl&&!legacyTemplatePhoto(configuredHero.imageUrl));
 const heroDesktop=bespoke?standardHero:"/images/luxury-hero.webp";
 const heroMobile=bespoke?showcasePhoto(configuredHero?.mobileImageUrl||configuredHero?.imageUrl):"/images/luxury-hero-mobile.webp";
 const fest=edition?.festival??editionTwoDefaults.festival;
 const festCustom=Boolean(fest.imageUrl&&!legacyTemplatePhoto(fest.imageUrl));
 const festivalImage=festCustom?showcasePhoto(fest.imageUrl):"/images/luxury-festival.webp";
 const sale=festivalProducts(store);
 const top=popularProducts(store);
 const fresh=recentProducts(store);
 return <div className="luxury-home">
  <LuxuryIntro label="DAIRA STORE"/><LuxuryMotion/>
  <section className="luxury-hero" aria-label="معرفی مجموعه">
   <div className="luxury-hero-media" data-lux-photo>
    <picture><source media="(max-width: 760px)" srcSet={heroMobile}/>
     <Image src={heroDesktop} alt="کمپین مد و پوشاک سرمه‌ای مجموعه" fill priority sizes="100vw" quality={88} unoptimized={heroDesktop.startsWith("http")} className="luxury-hero-img"/></picture>
   </div>
   <div className="luxury-hero-shade"/>
   <div className="luxury-hero-text" data-lux-reveal>
    <span className="luxury-hero-overline">DAIRA / SIGNATURE EDITION</span>
    <h1>استایل،<br/>فراتر از انتخاب.</h1>
    <p>مجموعه‌ای از انتخاب‌های ماندگار<br/>برای سلیقه‌های متفاوت.</p>
    <Link href="/products" className="luxury-outline-button">کشف محصولات <ArrowUpLeft size={20}/></Link>
   </div>
   <span className="luxury-hero-index">01 / 04</span>
   <span className="luxury-hero-scroll">SCROLL TO EXPLORE <i/></span>
  </section>
  {fest.enabled!==false&&<section className="luxury-festival" aria-labelledby="luxury-fest-title">
   <div className="luxury-inner">
    <div className="luxury-section-pretitle" data-lux-reveal><span>01 — THE EVENT</span><span>فرصت محدود</span></div>
    <div className="luxury-festival-feature">
     <div className="luxury-festival-media" data-lux-photo>
      <Image src={festivalImage} alt="کمپین جشنواره ویژه پوشاک و اکسسوری" fill sizes="(max-width: 760px) 100vw, 55vw" quality={86} unoptimized={festivalImage.startsWith("http")}/>
     </div>
     <div className="luxury-festival-copy" data-lux-reveal>
      <span className="luxury-kicker">MIDNIGHT PRIVATE SALE</span>
      <h2 id="luxury-fest-title">فرصتی برای<br/><i>انتخاب‌های خاص.</i></h2>
      <p>{fest.description||"مجموعه‌ای منتخب با قیمت‌های ویژه، فقط برای مدت محدود."}</p>
      {fest.showCountdown!==false&&<div className="luxury-countdown"><FestivalCountdown endsAt={fest.endsAt||editionTwoDefaults.festival.endsAt} expiredText={fest.expiredText}/></div>}
      <Link href="/festival" className="luxury-solid-button">مشاهده محصولات جشنواره <ArrowLeft size={17}/></Link>
      <span className="luxury-fest-count">{sale.length.toLocaleString("fa-IR")} محصول دارای تخفیف</span>
     </div>
    </div>
    <div className="luxury-festival-bottom" data-lux-reveal><p>منتخب‌های جشنواره</p><Link href="/festival">نمایش تمام پیشنهادها <ChevronLeft size={17}/></Link></div>
    <div className="luxury-product-grid luxury-festival-products">{sale.slice(0,4).map(p=><div className="luxury-product-wrap" key={p.id} data-lux-reveal><ProductCard product={p}/></div>)}{sale.length===0&&<p className="luxury-empty">جشنواره فعلاً محصول تخفیف‌دار فعالی ندارد.</p>}</div>
   </div>
  </section>}
  <ShopShelf title="پرفروش‌ترین محصولات" eyebrow="02 — BEST SELLERS" description="آن‌هایی که همیشه بیشتر از بقیه انتخاب می‌شوند." items={top} href="/products?sort=popular" variant="best"/>
  <ShopShelf title="تازه از راه رسیده" eyebrow="03 — NEW ARRIVALS" description="تازه‌ترین محصولات، برای نگاهی تازه به استایل." items={fresh} href="/products?sort=new" variant="new"/>
  <section className="luxury-outro" data-lux-reveal><div className="luxury-inner"><span>THE ART OF EVERYDAY STYLE</span><h2>هر انتخاب،<br/>امضای توست.</h2><Link href="/products">دیدن تمام محصولات <ArrowUpLeft size={20}/></Link></div></section>
 </div>;
}
