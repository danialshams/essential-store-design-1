import Link from "next/link";
import {ArrowLeft,ChevronLeft} from "lucide-react";
import {loadStore} from "@/lib/live-store";
import {festivalProducts} from "@/lib/luxury-catalog";
import {ProductCard} from "@/components/ProductCard";
import {seoMeta,breadcrumbsSchema,jsonLd} from "@/lib/seo";

export async function generateMetadata(){
 const store=await loadStore();
 return seoMeta(store,"/festival",{title:"جشنواره فروش ویژه",description:"محصولات دارای تخفیف جشنواره "+store.settings.storeName});
}
export default async function FestivalPage(){
 const store=await loadStore();
 const items=festivalProducts(store);
 return <div className="luxury-festival-page">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbsSchema(store,[{name:"خانه",path:"/"},{name:"جشنواره",path:"/festival"}]))}}/>
  <header className="luxury-festival-page-head">
   <div className="luxury-inner"><div className="luxury-crumb"><Link href="/">خانه</Link><ChevronLeft size={16}/><span>جشنواره</span></div>
    <span className="luxury-kicker">EXCLUSIVE SELECTION</span><h1>جشنواره انتخاب‌های خاص</h1>
    <p>تمام محصولات تخفیف‌دار جشنواره را یکجا ببین.</p>
    <span className="luxury-page-count">{items.length.toLocaleString("fa-IR")} محصول منتخب</span>
   </div>
  </header>
  <div className="luxury-inner luxury-festival-page-content">
   {items.length?<div className="luxury-product-grid">{items.map(p=><div className="luxury-product-wrap" key={p.id}><ProductCard product={p}/></div>)}</div>:
    <div className="luxury-empty-state"><h2>در حال حاضر جشنواره فعالی وجود ندارد.</h2><p>محصولات دارای تخفیف را به‌محض فعال‌شدن اینجا می‌بینی.</p><Link href="/products">مشاهده همه محصولات <ArrowLeft size={18}/></Link></div>}
  </div>
 </div>;
}
