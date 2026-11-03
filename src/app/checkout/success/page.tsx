"use client";
import {Suspense} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {CheckCircle2,Package,ArrowLeft,Info} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {toman} from "@/lib/catalog";
function SuccessContent(){const params=useSearchParams(),{orders,ready}=useShop();const id=params.get("id"),order=orders.find(o=>o.id===id);return <div className="container"><div className="success-card"><span className="success-icon"><CheckCircle2 size={42}/></span><h1>سفارش نمایشی ثبت شد</h1><p>جریان نمونه ثبت سفارش را با موفقیت انجام دادی. این سفارش صرفاً در مرورگر ذخیره شده است و پرداخت بانکی یا ارسال کالا انجام نمی‌شود.</p>{order?<div className="order-success-info"><div><span>کد آزمایشی</span><strong dir="ltr">{order.id}</strong></div><div><span>وضعیت</span><strong>{order.status}</strong></div><div><span>مبلغ سفارش</span><strong>{toman(order.total)}</strong></div></div>:!ready?<p>در حال دریافت جزئیات...</p>:<p>جزئیات سفارش در حافظه این مرورگر یافت نشد.</p>}<div className="demo-warning"><Info size={18}/> برای سفارش واقعی باید سرویس پرداخت، ذخیره سفارش و مدیریت موجودی به سایت متصل شوند.</div><div className="success-actions"><Link className="button button-primary" href="/products">ادامه خرید <ArrowLeft size={17}/></Link><Link className="button button-outline" href="/account"><Package size={17}/> مشاهده سفارش‌های دمو</Link></div></div></div>}
export default function Success(){return <Suspense fallback={<div className="container page-loading">در حال بارگذاری...</div>}><SuccessContent/></Suspense>}
