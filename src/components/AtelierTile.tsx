"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpLeft, Heart, ShoppingBag } from "lucide-react";
import { toman, type Product } from "@/lib/catalog";
import { useShop } from "@/components/ShopProvider";

type Shape = "standard" | "feature" | "portrait" | "landscape";

/** The public demo editorial uses a consistent art-directed portfolio.
 * Merchant-uploaded custom images remain untouched. The product record,
 * variant, price, availability and purchase target all stay live.
 */
const stagedImages:Record<string,string[]> = {
  bags:["/images/atelier-v4-item-27.webp","/images/atelier-v4-item-31.webp","/images/atelier-v3-item-01.webp","/images/atelier-v3-item-02.webp","/images/atelier-v3-item-03.webp","/images/atelier-v3-item-04.webp"],
  shoes:["/images/atelier-v4-item-21.webp","/images/atelier-v4-item-22.webp","/images/atelier-v3-item-05.webp","/images/atelier-v3-item-06.webp","/images/atelier-v3-item-07.webp","/images/atelier-v3-item-08.webp","/images/atelier-v3-item-19.webp"],
  clothing:["/images/atelier-v4-item-25.webp","/images/atelier-v4-item-26.webp","/images/atelier-v4-item-29.webp","/images/atelier-v4-item-30.webp","/images/atelier-v3-item-09.webp","/images/atelier-v3-item-10.webp","/images/atelier-v3-item-11.webp","/images/atelier-v3-item-12.webp","/images/atelier-v3-item-17.webp","/images/atelier-v3-item-18.webp"],
  accessories:["/images/atelier-v4-item-23.webp","/images/atelier-v4-item-24.webp","/images/atelier-v3-item-13.webp","/images/atelier-v3-item-14.webp","/images/atelier-v3-item-15.webp","/images/atelier-v3-item-16.webp","/images/atelier-v3-item-20.webp"],
};
function editorialPhoto(product:Product):string{
  const source=product.image || "";
  const isBundledDemo=source.startsWith("/images/") ||
    (source.includes("essential-store-design-1") && source.includes("/images/"));
  if(!isBundledDemo)return source;
  const choices=stagedImages[product.category]||[];
  if(!choices.length)return source;
  const sum=[...String(product.id)].reduce((n,ch)=>n*31+ch.charCodeAt(0),7)>>>0;
  return choices[sum%choices.length];
}

/** This is a gallery tile, deliberately independent from the original ProductCard. */
export function AtelierTile({ product, shape = "standard", index = 0, editorialImage }: { product: Product; shape?: Shape; index?: number; editorialImage?: string }) {
  const router = useRouter();
  const { add, isFavorite, toggleFavorite } = useShop();
  const available = product.variants?.length ? product.variants.some((v) => v.inventory > 0) : product.inventory > 0;
  const sale = Boolean(product.comparePrice && product.comparePrice > product.price);
  const selected=editorialImage||editorialPhoto(product);
  const imageSrc=shape==="landscape" && /^\/images\/atelier-v[34]-item-/.test(selected)
    ?selected.replace(/\.webp$/,"-wide.webp"):selected;
  return <article className={"atelier-tile atelier-tile--" + shape} data-cine-reveal data-cine-tile style={{ "--tile-index": index } as React.CSSProperties}>
    <div className="atelier-tile-photo">
      <Link href={"/product/" + product.slug} aria-label={"مشاهده " + product.name}>
        <Image src={imageSrc} alt={imageSrc===product.image?(product.seoImageAlt||product.name):("تصویر ژورنالی دسته "+product.categoryLabel)} fill
          sizes={shape === "feature" ? "(max-width:760px) 100vw, 50vw" : "(max-width:760px) 48vw, 26vw"}
          className="atelier-tile-img" unoptimized={imageSrc.startsWith("http") || imageSrc.startsWith("/images/atelier-")} />
        <span className="atelier-tile-photo-shade" />
      </Link>
      {sale && <span className="atelier-tile-off">{Math.round((1 - product.price / product.comparePrice!) * 100).toLocaleString("fa-IR")}٪ OFF</span>}
      <button className={"atelier-tile-fav " + (isFavorite(product.id) ? "is-active" : "")}
        aria-label={isFavorite(product.id) ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"} type="button"
        onClick={() => toggleFavorite(product.id)}>
        <Heart size={17} strokeWidth={1.5} fill={isFavorite(product.id) ? "currentColor" : "none"} />
      </button>
      <span className="atelier-tile-view">مشاهده جزئیات <ArrowUpLeft size={15} /></span>
    </div>
    <div className="atelier-tile-caption">
      <div className="atelier-tile-names">
        <span>{product.categoryLabel}</span>
        <Link href={"/product/" + product.slug}>{product.name}</Link>
      </div>
      <div className="atelier-tile-action">
        <div className="atelier-tile-price">
          {sale && <del>{toman(product.comparePrice!)}</del>}
          <strong>{toman(product.price)}</strong>
        </div>
        <button type="button" disabled={!available}
          aria-label={available ? "افزودن یا انتخاب " + product.name : "ناموجود"}
          onClick={() => product.variants?.length ? router.push("/product/" + product.slug) : add(product)}>
          <ShoppingBag size={18} strokeWidth={1.4} />
        </button>
      </div>
    </div>
  </article>;
}
