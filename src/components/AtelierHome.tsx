import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpLeft } from "lucide-react";
import type { StoreData } from "@/lib/live-store";
import { AtelierCategoryGallery } from "@/components/AtelierCategoryGallery";
import { AtelierMotion } from "@/components/AtelierMotion";
import { AtelierCountdown } from "@/components/AtelierCountdown";
import { festivalProducts, popularProducts, recentProducts } from "@/lib/luxury-catalog";
import { editionTwoDefaults } from "@/lib/admin/edition-two";
import { allocateEditorialMedia } from "@/lib/atelier-v3-media";
import { legacyTemplatePhoto, showcasePhoto } from "@/lib/showcase-photos";

export function AtelierHome({ store }: { store: StoreData }) {
  const edition = store.settings.editorialConfig;
  const configuredHero = edition?.hero?.find((item) => item.enabled);
  const customHero = Boolean(configuredHero?.imageUrl && !legacyTemplatePhoto(configuredHero.imageUrl) &&
    !configuredHero.imageUrl.includes("/images/luxury-") && !configuredHero.imageUrl.includes("/images/atelier-"));
  const heroDesktop = customHero ? showcasePhoto(configuredHero?.imageUrl) : "/images/atelier-v4-hero-desktop.webp";
  const heroMobile = customHero ? showcasePhoto(configuredHero?.mobileImageUrl || configuredHero?.imageUrl) : "/images/atelier-v4-hero-mobile.webp";
  const festival = edition?.festival ?? editionTwoDefaults.festival;
  const customFestival = Boolean(festival.imageUrl && !legacyTemplatePhoto(festival.imageUrl) &&
    !festival.imageUrl.includes("/images/luxury-") && !festival.imageUrl.includes("/images/atelier-"));
  const festivalImage = customFestival ? showcasePhoto(festival.imageUrl) : "/images/atelier-v4-campaign.webp";
  const sale = festivalProducts(store);
  const best = popularProducts(store);
  const newest = recentProducts(store);
  const available = store.products.filter(p=>p.inventory>0);
  const bestPool = available.slice().sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)));
  const newPool = available.slice().sort((a,b)=>Number(Boolean(b.newArrival))-Number(Boolean(a.newArrival)));
  const [saleMedia,bestMedia,newMedia]=allocateEditorialMedia([sale.slice(0,4),best,newest]);

  return <div className="atelier-home" dir="rtl">
    <AtelierMotion />
    <section className="atelier-hero" aria-label="کالکشن اصلی">
      <div className="atelier-hero-photo" data-cine-photo>
        <picture>
          <source media="(max-width: 760px)" srcSet={heroMobile} />
          <Image src={heroDesktop} alt="کمپین جدید پوشاک و اکسسوری" fill priority
            sizes="100vw" unoptimized className="atelier-hero-image" />
        </picture>
      </div>
      <div className="atelier-hero-shade" />
      <div className="atelier-hero-inner">
        <span className="atelier-hero-index" data-cine-reveal>DAIRA — EDITION 01 / 2026</span>
        <div className="atelier-hero-copy" data-cine-reveal>
          <span className="atelier-overline">THE ART OF SELECTING</span>
          <h1>انتخابی که<br /><em>شبیه توست.</em></h1>
          <p>استایل، در جزئیات.</p>
          <Link className="atelier-outline-cta" href="/products">کشف مجموعه <ArrowUpLeft size={18} /></Link>
        </div>
        <div className="atelier-hero-bottom">
          <span>COLLECTION / 001</span>
          <a href="#atelier-festival" aria-label="رفتن به جشنواره"><ArrowDown size={17} /><span>EXPLORE</span></a>
        </div>
      </div>
    </section>

    {festival.enabled !== false && <section className="atelier-festival" id="atelier-festival" aria-label="جشنواره ویژه">
      <div className="atelier-section-tag" data-cine-reveal><span>01 / PRIVATE SALE</span><span>جشنواره ویژه</span></div>
      <div className="atelier-campaign">
        <div className="atelier-campaign-art" data-cine-reveal data-cine-photo>
          <Image src={festivalImage} alt="کمپین ویژه جشنواره" fill
            sizes="(max-width:760px) 100vw, 52vw" unoptimized />
          <span className="atelier-campaign-mark">PRIVATE / 01</span>
        </div>
        <div className="atelier-campaign-copy" data-cine-reveal>
          <span className="atelier-overline">MIDNIGHT SELECTION</span>
          <h2>فرصت کوتاه.<br /><em>انتخاب ماندگار.</em></h2>
          <p>{festival.description || "منتخبی از انتخاب‌های خاص."}</p>
          {festival.showCountdown !== false && <div className="atelier-countdown">
            <AtelierCountdown endsAt={festival.endsAt || editionTwoDefaults.festival.endsAt}
              expiredText={festival.expiredText} />
          </div>}
          <Link className="atelier-filled-cta" href="/festival">مشاهده تمام محصولات جشنواره <ArrowUpLeft size={18} /></Link>
          <span className="atelier-campaign-count">{sale.length.toLocaleString("fa-IR")} محصول منتخب</span>
        </div>
      </div>
      <div className="atelier-shell">
        <header className="atelier-gallery-head" data-cine-reveal>
          <div><span>EXCLUSIVE PIECES</span><h3>منتخب جشنواره</h3></div>
          <Link href="/festival">تمام پیشنهادها <ArrowUpLeft size={17} /></Link>
        </header>
        <div data-festival-product-count={sale.length}>
          <AtelierCategoryGallery kind="sale" products={sale} initialProducts={sale.slice(0,4)} initialMedia={saleMedia} gridClassName="atelier-sale-grid" />
        </div>
      </div>
    </section>}

    <section className="atelier-best" id="best-sellers" aria-labelledby="atelier-best-title">
      <div className="atelier-shell">
        <div className="atelier-section-tag atelier-section-tag--dark" data-cine-reveal>
          <span>02 / MOST DESIRED</span><span>انتخاب‌های محبوب</span>
        </div>
        <header className="atelier-section-head" data-cine-reveal>
          <div><span className="atelier-overline">THE SIGNATURE SELECTION</span>
            <h2 id="atelier-best-title">پرفروش‌ترین‌ها،<br /><em>با نگاهی متفاوت.</em></h2></div>
          <Link href="/products?sort=popular">دیدن همه پرفروش‌ها <ArrowUpLeft size={19} /></Link>
        </header>
        <AtelierCategoryGallery kind="best" products={bestPool} initialProducts={best} initialMedia={bestMedia} gridClassName="atelier-best-gallery" />
      </div>
    </section>

    <section className="atelier-new" id="new-arrivals" aria-labelledby="atelier-new-title">
      <div className="atelier-shell">
        <div className="atelier-section-tag atelier-section-tag--dark" data-cine-reveal>
          <span>03 / THE NEW EDIT</span><span>تازه‌های مجموعه</span>
        </div>
        <header className="atelier-section-head atelier-section-head--new" data-cine-reveal>
          <div><span className="atelier-overline">NEW POINT OF VIEW</span>
            <h2 id="atelier-new-title">تازه از راه رسیده.<br /><em>برای فصل تازه.</em></h2></div>
          <Link href="/products?sort=new">مشاهده تازه‌ترین‌ها <ArrowUpLeft size={19} /></Link>
        </header>
        <AtelierCategoryGallery kind="new" products={newPool} initialProducts={newest} initialMedia={newMedia}
          gridClassName="atelier-new-products" layoutClassName="atelier-new-gallery"
          editorial={<div className="atelier-new-editorial" data-cine-reveal data-cine-photo>
            <Image src="/images/atelier-v4-editorial.webp" alt="ژورنال کالکشن جدید" unoptimized fill
              sizes="(max-width:760px) 100vw, 40vw" />
            <div><span>DAIRA / NEW SEASON</span>
              <strong>THE NEW<br/>PERSPECTIVE</strong>
              <Link href="/products?sort=new">دیدن کالکشن <ArrowUpLeft size={18}/></Link>
            </div>
          </div>} />
      </div>
    </section>
  </div>;
}
