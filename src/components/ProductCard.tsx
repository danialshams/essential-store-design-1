"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {Heart,ShoppingCart,ArrowLeft} from "lucide-react";
import type {Product} from "@/lib/catalog";
import {toman} from "@/lib/catalog";
import {useShop} from "@/components/ShopProvider";
export function ProductCard({product,compact=false}:{product:Product;compact?:boolean}){
 const {add,isFavorite,toggleFavorite}=useShop();const router=useRouter();const available=product.variants?.length?product.variants.some(v=>v.inventory>0):product.inventory>0;
 return <article className={`product-card ${compact?"product-card--compact":""}`}>
   <div className="product-image-box">
    <Link href={`/product/${product.slug}`} aria-label={`مشاهده ${product.name}`}><Image src={product.image} alt={product.name} width={660} height={390} unoptimized={product.image.startsWith("http")} className="product-image" onLoad={event=>{const img=event.currentTarget;if(img.naturalWidth>0&&img.naturalHeight>0)img.closest<HTMLElement>(".product-image-box")?.style.setProperty("--natural-image-ratio",img.naturalWidth+" / "+img.naturalHeight)}}/></Link>
    {product.comparePrice&&product.comparePrice>product.price&&<span className="discount-tag">{Math.round((1-product.price/product.comparePrice)*100).toLocaleString("fa-IR")}٪ تخفیف</span>}
    <button className={`favorite-button ${isFavorite(product.id)?"is-favorite":""}`} aria-label={isFavorite(product.id)?"حذف از علاقه‌مندی‌ها":"افزودن به علاقه‌مندی‌ها"} onClick={()=>toggleFavorite(product.id)}><Heart size={18} fill={isFavorite(product.id)?"currentColor":"none"}/></button>
   </div>
   <div className="product-card-body"><Link href={`/product/${product.slug}`} className="product-card-title">{product.name}</Link><p>{product.subtitle}</p>
    <div className="product-card-prices">{product.comparePrice&&product.comparePrice>product.price&&<del>{toman(product.comparePrice)}</del>}<strong>{toman(product.price)}</strong></div>
    {available?<button className="card-add" onClick={()=>product.variants?.length?router.push(`/product/${product.slug}`):add(product)}>{product.variants?.length?"انتخاب گزینه‌ها":"افزودن به سبد خرید"}{product.variants?.length?<ArrowLeft size={17}/>:<ShoppingCart size={17}/>}</button>:<button disabled className="card-add disabled">ناموجود</button>}
   </div>
  </article>
}
