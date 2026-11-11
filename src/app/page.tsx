import {Fragment,type ReactNode} from "react";
import Link from "next/link";
import Image from "next/image";
import {ChevronLeft,Truck,ShieldCheck,Headphones,Medal,PackageCheck,ArrowLeft} from "lucide-react";
import {loadStore} from "@/lib/live-store";
import {ProductCard} from "@/components/ProductCard";
import {SectionHeading} from "@/components/SectionHeading";
import {EditionOneHero,type EssentialOneSlide} from "@/components/EditionOneHero";
import {targetUrl} from "@/lib/edition-two-content";
import {editionTwoDefaults} from "@/lib/admin/edition-two";
import type {StoreData} from "@/lib/live-store";

const benefitIcons={truck:Truck,package:PackageCheck,headphones:Headphones,shield:ShieldCheck};
const fallbackBenefits=[
 {id:"shipping",title:"ارسال سریع",description:"تحویل در کوتاه‌ترین زمان",icon:"truck" as const},
 {id:"pay",title:"پرداخت امن",description:"زیرساخت قابل اتصال به درگاه معتبر",icon:"shield" as const},
 {id:"support",title:"پشتیبانی",description:"پاسخگویی سریع و حرفه‌ای",icon:"headphones" as const},
 {id:"quality",title:"ضمانت اصالت",description:"تضمین اصالت و کیفیت کالا",icon:"package" as const}
];
function Promotion({title,description,image,href,label}:{title:string;description:string;image:string;href:string;label:string}){
 return <Link className="promo-banner ed1-managed-promo" href={href}>
  <div><h3>{title}</h3><p>{description}</p><span>{label} <ChevronLeft size={14}/></span></div>
  {image&&<Image src={image} alt="" width={410} height={200} unoptimized={image.startsWith("http")}/>}
 </Link>;
}
export default async function Home(){
 const store:StoreData=await loadStore();
 const edition=store.settings.editorialConfig;
  const festival=edition?.festival??editionTwoDefaults.festival;
 const discounted=store.products.filter(p=>p.inventory>0&&typeof p.comparePrice==="number"&&p.comparePrice>p.price);
 const saleProducts=(festival.productIds?.length?
  festival.productIds.map(id=>discounted.find(p=>p.id===id)).filter((p):p is StoreData["products"][number]=>Boolean(p)):
  discounted).slice(0,8);
 const allowedOrder=editionTwoDefaults.sectionOrder;
 const sectionOrder=[...new Set([...(edition?.sectionOrder||allowedOrder).filter(id=>allowedOrder.includes(id)),...allowedOrder])];

 const sections=[...(store.settings.homeSections||[])].filter(s=>s.enabled).sort((a,b)=>a.position-b.position);
 const homeHero=sections[0];
 const baseSlide:EssentialOneSlide={id:"fallback",eyebrow:"خریدی متفاوت، ساده و مطمئن",
  title:homeHero?.title||store.settings.seoTitle||"فروشگاه ساده، سریع و حرفه‌ای",
  description:homeHero?.description||store.settings.description||"خریدی مطمئن، آسان و لذت‌بخش",
  imageUrl:homeHero?.imageUrl||"/images/hero-woman.webp",
  mobileImageUrl:homeHero?.mobileImageUrl||"/images/hero-mobile.webp",
  ctaLabel:homeHero?.ctaLabel||"مشاهده محصولات",ctaHref:homeHero?.ctaHref?.startsWith("/")?homeHero.ctaHref:"/products"};
 const slides=edition?edition.hero.filter(x=>x.enabled).map((x):EssentialOneSlide=>({
  id:x.id,title:x.title,description:x.description,eyebrow:x.eyebrow,imageUrl:x.imageUrl||baseSlide.imageUrl,
  mobileImageUrl:x.mobileImageUrl||x.imageUrl||baseSlide.mobileImageUrl,ctaLabel:x.ctaLabel,
  ctaHref:targetUrl(x.target,store)})):[baseSlide];
 const categories=edition?edition.categories.items.map(item=>({
  category:store.categories.find(c=>c.dbId===item.categoryId||c.id===item.categoryId),
  image:item.imageUrl})).filter(x=>Boolean(x.category)):store.categories.map(category=>({category,image:undefined}));
 const featured=store.products.filter(p=>p.featured).slice(0,4);
 const products=edition?.featured.productIds.length?edition.featured.productIds.map(id=>store.products.find(p=>p.id===id)).filter((p):p is StoreData["products"][number]=>Boolean(p)).slice(0,4):featured;
 const best=products.length?products:store.products.slice(0,4);
 const benefits=edition?.benefits??fallbackBenefits;
 const journal=edition?.journal.articleIds.length?edition.journal.articleIds.map(id=>store.articles.find(a=>a.id===id)).filter((a):a is StoreData["articles"][number]=>Boolean(a)).slice(0,2):store.articles.slice(0,2);
 const homepageSections:Record<string,ReactNode>={
hero:(<>
<EditionOneHero slides={slides}/>
</>),
categories:(<>
<section className="category-section" id="categories" aria-label="دسته‌بندی محصولات">
   {edition&&<SectionHeading title={edition.categories.title}/>}
   <div className="category-strip">{categories.map(entry=>{
    const cat=entry.category!;const photo=entry.image||cat.image;
    return <Link className="category-tile" href={"/category/"+cat.id} key={cat.id}>
     <span className="category-tile-label">{cat.name}<ChevronLeft size={16}/></span>
     <Image src={photo} alt="" width={240} height={120} unoptimized={photo.startsWith("http")}/>
    </Link>})}</div>
  </section>
</>),
featured:(<>
<section className="products-section" aria-labelledby="best-sellers-title">
   <SectionHeading title={edition?.featured.title||"پرفروش‌ترین محصولات"}/>
   {edition?.featured.description&&<p className="ed1-featured-caption">{edition.featured.description}</p>}
   <div className="product-grid">{best.map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>
</>),
festival:(<>
{festival.enabled&&<section className="ed1-sale-festival" aria-labelledby="ed1-festival-title">
 <div className="ed1-sale-header">
   <div><span className="ed1-festival-kicker">{festival.eyebrow||"SPECIAL OFFERS"}</span>
     <h2 id="ed1-festival-title">{festival.title}</h2><p>{festival.description}</p></div>
   {festival.target.kind!=="none"&&<Link className="ed1-festival-button" href={targetUrl(festival.target,store)}>{festival.ctaLabel||"دیدن همه محصولات"} <ChevronLeft size={18}/></Link>}
 </div>
 <div className="ed1-sale-products">
   {saleProducts.map(p=><div className="ed1-sale-item" key={p.id}><ProductCard product={p}/></div>)}
   {!saleProducts.length&&<p className="ed1-sale-empty" role="status">فعلاً محصول فعال با تخفیف وجود ندارد؛ با تعیین قیمت قبل از تخفیف در پنل، محصول در این بخش نمایش داده می‌شود.</p>}
 </div>
</section>}
</>),
campaign:(<>
<>{edition?edition.campaign.target.kind!=="none"&&
 <section className="promotions-section" aria-label="کمپین تصویری"><SectionHeading title="کمپین فروشگاه"/><div className="promo-grid"><Promotion title={edition.campaign.title} description={edition.campaign.description} image={edition.campaign.imageUrl||"/images/bag.webp"} href={targetUrl(edition.campaign.target,store)} label={edition.campaign.ctaLabel}/></div></section>:
 !store.live&&<section className="promotions-section"><SectionHeading title="انتخاب ویژه"/><div className="promo-grid"><Promotion title="کیف‌های جدید و خاص" description="برای استایل روزمره" image="/images/bag.webp" href="/category/bags" label="مشاهده کیف‌ها"/></div></section>}</>
</>),
story:(<>
<>{edition?edition.story.target.kind!=="none"&&
 <section className="promotions-section" aria-label="داستان محصول"><SectionHeading title="داستان انتخاب"/><div className="promo-grid"><Promotion title={edition.story.title} description={edition.story.description} image={edition.story.imageUrl||"/images/sneakers.webp"} href={targetUrl(edition.story.target,store)} label={edition.story.ctaLabel}/></div></section>:
 !store.live&&<section className="promotions-section"><SectionHeading title="کفش‌های منتخب"/><div className="promo-grid"><Promotion title="جدیدترین کفش‌ها" description="راحتی و استایل" image="/images/sneakers.webp" href="/category/shoes" label="مشاهده کفش‌ها"/></div></section>}</>
</>),
chapters:(<>
{edition?edition.chapters.map(s=><section className="bottom-promo ed1-managed-chapter" key={s.id}>
   <div><span>انتخاب ویژه</span><h2>{s.title}</h2><p>{s.description}</p></div>
   {s.imageUrl&&<Image src={s.imageUrl} alt="" width={240} height={130} unoptimized={s.imageUrl.startsWith("http")}/>}
  </section>):sections.slice(1).map(s=><section className="bottom-promo" key={s.id}><div><span>فروشگاه</span><h2>{s.title}</h2><p>{s.description}</p></div>{s.imageUrl&&<Image src={s.imageUrl} alt="" width={240} height={130} unoptimized={s.imageUrl.startsWith("http")}/>}</section>)}
</>),
journal:(<>
{edition&&journal.length>0&&<section className="products-section ed1-journal" aria-label="مقالات منتخب">
   <SectionHeading title={edition.journal.title} href="/blog" linkLabel="همه مقالات"/>
   <div className="ed1-journal-grid">{journal.map(a=><Link href={"/blog/"+a.slug} key={a.slug} className="ed1-journal-card">
    {a.coverUrl&&<Image src={a.coverUrl} alt="" width={440} height={215} unoptimized={a.coverUrl.startsWith("http")}/>}
    <div><h3>{a.title}</h3><p>{a.summary}</p><span>مطالعه مقاله <ChevronLeft size={15}/></span></div>
   </Link>)}</div>
  </section>}
</>),
benefits:(<>
<section className="benefits" aria-label="مزایای خرید">{benefits.map(item=>{
   const Icon=benefitIcons[item.icon]||Medal;
   return <div key={item.id}><Icon/><span><strong>{item.title}</strong><small>{item.description}</small></span></div>;
  })}</section>
</>),
};
return <div className="container">
 {sectionOrder.map(id=><Fragment key={id}>{homepageSections[id]}</Fragment>)}
 {store.banners.length>0&&<section className="promotions-section"><SectionHeading title="بنرهای فروشگاه"/><div className="promo-grid">{store.banners.map(b=>
   <Promotion key={b.id} title={b.title} description={b.subtitle} image={b.imageUrl||""} href={b.target?targetUrl(b.target,store):b.linkUrl||"/products"} label="مشاهده"/>)}</div></section>}
 <section className="bottom-promo"><div><span>{edition?.footer.eyebrow||"برای انتخاب راحت‌تر"}</span>
   <h2>{edition?.footer.title||"استایل موردعلاقه‌ات را پیدا کن"}</h2><p>{edition?.footer.bottomNote||"از بین محصولات جدید، انتخابی مناسب سلیقه‌ات داشته باش."}</p></div>
   <Link href="/products" className="button button-outline">دیدن همه محصولات <ArrowLeft size={17}/></Link>
  </section>
</div>;
}
