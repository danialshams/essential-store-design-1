"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpLeft, Heart, ShoppingBag } from "lucide-react";
import { toman, type Product } from "@/lib/catalog";
import { useShop } from "@/components/ShopProvider";

type Shape = "standard" | "feature" | "portrait" | "landscape";

/** This is a gallery tile, deliberately independent from the original ProductCard. */
export function AtelierTile({ product, shape = "standard", index = 0 }: { product: Product; shape?: Shape; index?: number }) {
  const router = useRouter();
  const { add, isFavorite, toggleFavorite } = useShop();
  const available = product.variants?.length ? product.variants.some((v) => v.inventory > 0) : product.inventory > 0;
  const sale = Boolean(product.comparePrice && product.comparePrice > product.price);
  return <article className={"atelier-tile atelier-tile--" + shape} data-cine-reveal data-cine-tile style={{ "--tile-index": index } as React.CSSProperties}>
    <div className="atelier-tile-photo">
      <Link href={"/product/" + product.slug} aria-label={"مشاهده " + product.name}>
        <Image src={product.image} alt={product.seoImageAlt || product.name} fill
          sizes={shape === "feature" ? "(max-width:760px) 100vw, 50vw" : "(max-width:760px) 48vw, 26vw"}
          className="atelier-tile-img" unoptimized={product.image.startsWith("http")} />
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
