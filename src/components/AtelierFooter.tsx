"use client";
import Link from "next/link";
import { ArrowUpLeft, ArrowUp, Phone, Mail, MapPin } from "lucide-react";
import { useShop } from "@/components/ShopProvider";
import { targetUrl } from "@/lib/edition-two-content";

/** The home gallery has its own editorial footer, without altering other routes. */
export function AtelierFooter() {
  const {store}=useShop();
  const edition=store.settings.editorialConfig;
  return <footer className="site-footer atelier-footer" dir="rtl">
    <div className="atelier-shell">
      <div className="atelier-footer-topline">
        <span>THE ART OF SELECTING / DAIRA</span>
        <a href="#main-content" aria-label="بازگشت به بالای صفحه">بازگشت به بالا <ArrowUp size={16} strokeWidth={1.3}/></a>
      </div>
      <div className="atelier-footer-wordmark">
        <strong>DAIRA</strong>
        <div><span>چیزهای خوب،<br/>از انتخاب‌های دقیق شروع می‌شن.</span>
          <Link href="/products">کشف همه محصولات <ArrowUpLeft size={19}/></Link></div>
      </div>
      <div className="atelier-footer-divider"/>
      <div className="atelier-footer-grid">
        <div className="atelier-footer-about">
          <span className="atelier-footer-label">ABOUT THE STORE</span>
          <h3>{store.settings.storeName}</h3>
          <p>{store.settings.description || "مجموعه‌ای از انتخاب‌های ماندگار، با توجه به جزئیات، کیفیت و زیبایی."}</p>
        </div>
        {edition?.footerColumns?.length
          ? edition.footerColumns.map(column=><div className="atelier-footer-links" key={column.id}>
              <span className="atelier-footer-label">{column.title}</span>
              {column.links.filter(link=>link.target.kind!=="none").map(link=>
                <Link key={link.id} href={targetUrl(link.target,store)}>{link.label}</Link>)}
            </div>)
          : <>
            <div className="atelier-footer-links">
              <span className="atelier-footer-label">EXPLORE</span>
              <Link href="/">خانه</Link><Link href="/products">همه محصولات</Link>
              <Link href="/festival">جشنواره ویژه</Link><Link href="/cart">سبد خرید</Link>
            </div>
            <div className="atelier-footer-links">
              <span className="atelier-footer-label">HELP & INFORMATION</span>
              <Link href="/info/about">درباره ما</Link>
              <Link href="/faq">سؤالات متداول</Link>
              <Link href="/info/shipping">ارسال و مرجوعی</Link>
              <Link href="/info/privacy">حفظ حریم خصوصی</Link>
            </div>
          </>
        }
        <div className="atelier-footer-contact">
          <span className="atelier-footer-label">GET IN TOUCH</span>
          <p><Phone size={15}/><span>{store.settings.contactPhone || (store.live?"اطلاعات تماس ثبت نشده":"۰۲۱-۱۲۳۴۵۶۷۸")}</span></p>
          <p><Mail size={15}/><span>{store.settings.contactEmail || (store.live?"ایمیل ثبت نشده":"info@dayra-store.ir")}</span></p>
          <p><MapPin size={15}/><span>{store.settings.address || (store.live?"آدرس ثبت نشده":"تهران، ایران")}</span></p>
        </div>
      </div>
    </div>
    <div className="atelier-footer-bottom">
      <div className="atelier-shell">
        <span>© ۱۴۰۵ {store.settings.storeName} — تمام حقوق محفوظ است.</span>
        <span>{edition?.footer.bottomNote || "DAIRA STUDIO — EDITION 01"}</span>
      </div>
    </div>
  </footer>;
}
