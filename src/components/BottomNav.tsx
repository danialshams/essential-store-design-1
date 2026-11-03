"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {House,LayoutGrid,ShoppingCart,UserRound} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
export function BottomNav(){const path=usePathname(),{count}=useShop();const entries=[{href:"/",label:"خانه",icon:House},{href:"/products",label:"دسته‌ها",icon:LayoutGrid},{href:"/cart",label:"سبد خرید",icon:ShoppingCart},{href:"/account",label:"حساب من",icon:UserRound}];return <nav className="mobile-bottom-nav" aria-label="ناوبری سریع موبایل">{entries.map(x=>{const I=x.icon;const selected=x.href==="/"?path===x.href:path.startsWith(x.href)||x.href==="/products"&&(path.startsWith("/product/")||path.startsWith("/category/"));return <Link className={selected?"bottom-item active":"bottom-item"} href={x.href} key={x.href} aria-current={selected?"page":undefined}><span className="bottom-icon"><I size={23} strokeWidth={selected?2.2:1.75}/>{x.href==="/cart"&&count>0&&<span className="bottom-count">{count}</span>}</span><small>{x.label}</small></Link>})}</nav>}
