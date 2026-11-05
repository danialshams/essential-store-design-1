"use client";
import Link from "next/link";
import Image from "next/image";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {ShoppingBag,ShoppingCart,UserRound,Search,Menu,X,ChevronDown,Truck,Heart,ArrowLeft} from "lucide-react";

import {useShop} from "@/components/ShopProvider";
import {targetUrl} from "@/lib/edition-two-content";
export function Header(){
 const path=usePathname(),router=useRouter(),{count,store}=useShop(),categories=store.categories,editorial=store.settings.editorialConfig;
 const [menuOpen,setMenuOpen]=useState(false),[categoryOpen,setCategoryOpen]=useState(false),[search,setSearch]=useState("");
 const searchRef=useRef<HTMLInputElement|null>(null);
 useEffect(()=>{setMenuOpen(false);setCategoryOpen(false)},[path]);
 useEffect(()=>{document.body.style.overflow=menuOpen?"hidden":"";return()=>{document.body.style.overflow=""}},[menuOpen]);
 function submit(event:FormEvent){event.preventDefault();router.push("/products"+(search.trim()?"?q="+encodeURIComponent(search.trim()):""))}
 const active=(href:string)=>path===href||href==="/products"&&path.startsWith("/product");
 return <>
  <div className="announcement"><Truck size={17} strokeWidth={1.8}/><span>{editorial?.announcement|| (store.live?"روش و هزینه ارسال در صفحه تسویه‌حساب مشخص می‌شود":"ارسال رایگان برای خریدهای بالای ۳ میلیون تومان")}</span></div>
  <header className="site-header">
   <div className="container header-inner">
    <button aria-label="باز کردن فهرست" className="icon-action hamburger" onClick={()=>setMenuOpen(true)}><Menu size={25}/></button>
    <Link href="/" className="brand" aria-label={`${store.settings.storeName}، صفحه اصلی`}><span className="brand-icon">{store.settings.logoUrl?<Image src={store.settings.logoUrl} alt="" width={32} height={32} unoptimized/>:<ShoppingBag size={25} strokeWidth={1.9}/>}</span><strong>{store.settings.storeName}</strong></Link>
    <nav className="desktop-links" aria-label="فهرست اصلی">
     {editorial?.navigation.length?editorial.navigation.filter(item=>item.target.kind!=="none").map(item=>{
      const href=targetUrl(item.target,store);
      return <Link key={item.id} className={active(href)?"current":""} href={href}>{item.label}</Link>;
     }):<><Link className={active("/")?"current":""} href="/">خانه</Link>
      <Link className={active("/products")?"current":""} href="/products">محصولات</Link>
      <Link className={active("/info/about")?"current":""} href="/info/about">درباره ما</Link>
      <Link className={active("/info/contact")?"current":""} href="/info/contact">تماس</Link></>}
     <div className="category-nav"><button className={categoryOpen?"nav-expanded":""} aria-expanded={categoryOpen} onClick={()=>setCategoryOpen(v=>!v)}>دسته‌بندی‌ها <ChevronDown size={14}/></button>
       {categoryOpen&&<div className="category-popover" onMouseLeave={()=>setCategoryOpen(false)}>{categories.map(c=><Link href={"/category/"+c.id} key={c.id}>{c.name}<ArrowLeft size={15}/></Link>)}</div>}
     </div>
    </nav>
    <form onSubmit={submit} role="search" className="header-search"><Search size={19}/><input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجوی محصول، برند یا دسته‌بندی ..." aria-label="جستجوی محصولات"/><button aria-label="جستجو" type="submit">جستجو</button></form>
    <div className="header-actions">
     <Link className="icon-action account-action" href="/account" aria-label="حساب من"><UserRound size={23}/></Link>
     <Link className="icon-action cart-action" href="/cart" aria-label={`سبد خرید (${count} کالا)`}><ShoppingCart size={24}/>{count>0&&<span className="cart-badge">{count.toLocaleString("fa-IR")}</span>}</Link>
    </div>
   </div>
   <div className="mobile-search-drawer container"><form onSubmit={submit}><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="محصول موردنظرت رو جستجو کن"/><button type="submit">بگرد</button></form></div>
  </header>
  {menuOpen&&<div className="mobile-menu-layer"><button className="mobile-menu-backdrop" aria-label="بستن فهرست" onClick={()=>setMenuOpen(false)}/><aside className="mobile-drawer" aria-label="منوی موبایل"><div className="mobile-drawer-top"><span className="brand"><span className="brand-icon">{store.settings.logoUrl?<Image src={store.settings.logoUrl} alt="" width={32} height={32} unoptimized/>:<ShoppingBag size={24}/>}</span><strong>{store.settings.storeName}</strong></span><button className="icon-action" aria-label="بستن فهرست" onClick={()=>setMenuOpen(false)}><X size={22}/></button></div><nav>
   {editorial?.navigation.length?editorial.navigation.filter(x=>x.target.kind!=="none").map(x=><Link key={x.id} href={targetUrl(x.target,store)}>{x.label}</Link>):<><Link href="/">خانه</Link><Link href="/products">همه محصولات</Link></>}
   {categories.map(c=><Link key={c.id} href={"/category/"+c.id}>{c.name}</Link>)}
   {!editorial&&<><Link href="/account">حساب من</Link><Link href="/info/about">درباره ما</Link><Link href="/info/contact">تماس با ما</Link></>}
   </nav><div className="drawer-foot"><Heart size={17}/> خریدی ساده، امن و دلنشین</div></aside></div>}
 </>
}
