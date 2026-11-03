"use client";
import Link from "next/link";
import Image from "next/image";
import {ShoppingBag,Phone,Mail,Instagram,Send,MessageCircle,MapPin} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
export function Footer(){const {store}=useShop();return <footer className="site-footer"><div className="container footer-grid">
 <div className="footer-brand"><div className="brand"><span className="brand-icon">{store.settings.logoUrl?<Image src={store.settings.logoUrl} alt="" width={30} height={30} unoptimized/>:<ShoppingBag size={26}/>}</span><strong>{store.settings.storeName}</strong></div><p>{store.settings.description||"فروشگاهی آنلاین برای خرید آسان و مطمئن"}</p></div>
 <div><h4>دسترسی سریع</h4><Link href="/">خانه</Link><Link href="/products">محصولات</Link><Link href={`/category/${store.categories[0]?.id||"clothing"}`}>دسته‌بندی‌ها</Link><Link href="/cart">سبد خرید</Link></div>
 <div><h4>اطلاعات</h4><Link href="/info/about">درباره ما</Link><Link href="/blog">مقالات</Link><Link href="/info/faq">سؤالات متداول</Link><Link href="/info/terms">قوانین و مقررات</Link><Link href="/info/shipping">ارسال و مرجوعی</Link><Link href="/info/privacy">حریم خصوصی</Link></div>
 <div><h4>ارتباط با ما</h4><span><Phone size={17}/>{store.settings.contactPhone||(store.live?"اطلاعات تماس ثبت نشده":"۰۲۱-۱۲۳۴۵۶۷۸")}</span><span><Mail size={17}/>{store.settings.contactEmail||(store.live?"ایمیل ثبت نشده":"info@dayra-store.ir")}</span><span><MapPin size={17}/>{store.settings.address||(store.live?"آدرس ثبت نشده":"تهران، ایران")}</span></div>
 <div><h4>ما را در شبکه‌های اجتماعی دنبال کنید</h4><div className="social-icons"><span aria-label="اینستاگرام"><Instagram size={19}/></span><span aria-label="تلگرام"><Send size={19}/></span><span aria-label="پیام‌رسان"><MessageCircle size={19}/></span></div>{!store.live&&<small className="demo-footnote">نام فروشگاه و اطلاعات تماس، نمونه نمایشی هستند.</small>}</div>
 </div><div className="copyright"><div className="container">© ۱۴۰۵ {store.settings.storeName} — تمامی حقوق این فروشگاه محفوظ است. <span>طرح اقتصادی ۱ • ساخته‌شده با Next.js</span></div></div></footer>}
