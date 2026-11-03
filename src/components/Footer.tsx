import Link from "next/link";
import {ShoppingBag,Phone,Mail,Instagram,Send,MessageCircle,MapPin} from "lucide-react";
export function Footer(){return <footer className="site-footer"><div className="container footer-grid">
 <div className="footer-brand"><div className="brand"><span className="brand-icon"><ShoppingBag size={26}/></span><strong>دایرا استور</strong></div><p>دایرا استور، فروشگاهی آنلاین برای خرید آسان و مطمئن انواع پوشاک، کیف، کفش و اکسسوری.</p></div>
 <div><h4>دسترسی سریع</h4><Link href="/">خانه</Link><Link href="/products">محصولات</Link><Link href="/category/clothing">دسته‌بندی‌ها</Link><Link href="/cart">سبد خرید</Link></div>
 <div><h4>اطلاعات</h4><Link href="/info/about">درباره ما</Link><Link href="/info/faq">سؤالات متداول</Link><Link href="/info/terms">قوانین و مقررات</Link><Link href="/info/shipping">ارسال و مرجوعی</Link><Link href="/info/privacy">حریم خصوصی</Link></div>
 <div><h4>ارتباط با ما</h4><span><Phone size={17}/>۰۲۱-۱۲۳۴۵۶۷۸</span><span><Mail size={17}/>info@dayra-store.ir</span><span><MapPin size={17}/>تهران، ایران</span></div>
 <div><h4>ما را در شبکه‌های اجتماعی دنبال کنید</h4><div className="social-icons"><span aria-label="اینستاگرام"><Instagram size={19}/></span><span aria-label="تلگرام"><Send size={19}/></span><span aria-label="پیام‌رسان"><MessageCircle size={19}/></span></div><small className="demo-footnote">نام فروشگاه و اطلاعات تماس، نمونه نمایشی هستند.</small></div>
 </div><div className="copyright"><div className="container">© ۱۴۰۵ دایرا استور — تمامی حقوق این فروشگاه محفوظ است. <span>طرح اقتصادی ۱ • ساخته‌شده با Next.js</span></div></div></footer>}
