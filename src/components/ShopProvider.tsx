"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {Product} from "@/lib/catalog";
import {demoProducts} from "@/lib/catalog";

export type CartLine={id:string;productId:string;variantId?:string;quantity:number};
export type DemoOrder={id:string;createdAt:string;status:"در انتظار اتصال پرداخت";customerName:string;phone:string;email?:string;province?:string;city:string;address:string;postalCode?:string;shippingMethod?:string;note?:string;items:CartLine[];subtotal:number;shipping:number;discount:number;total:number};
type ShopContextType={
 lines:CartLine[];favorites:string[];orders:DemoOrder[];ready:boolean;count:number;notice:string;
 add:(product:Product,variantId?:string,quantity?:number)=>void;
 setQuantity:(id:string,quantity:number)=>void;
 remove:(id:string)=>void;
 clear:()=>void;
 isFavorite:(id:string)=>boolean;
 toggleFavorite:(id:string)=>void;
 checkout:(order:Omit<DemoOrder,"id"|"createdAt">)=>DemoOrder;
 notify:(message:string)=>void;
 dismiss:()=>void;
};
const ShopContext=createContext<ShopContextType|null>(null);
function readLocal<T>(key:string,fallback:T):T{
 try{const result=window.localStorage.getItem(key);return result?JSON.parse(result) as T:fallback}catch{return fallback}
}
export function ShopProvider({children}:{children:ReactNode}){
 const [lines,setLines]=useState<CartLine[]>([]);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [orders,setOrders]=useState<DemoOrder[]>([]);
 const [ready,setReady]=useState(false);
 const [notice,setNotice]=useState("");
 useEffect(()=>{setLines(readLocal("essential-cart-v1",[]));setFavorites(readLocal("essential-fav-v1",[]));setOrders(readLocal("essential-orders-v1",[]));setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("essential-cart-v1",JSON.stringify(lines))},[ready,lines]);
 useEffect(()=>{if(ready)localStorage.setItem("essential-fav-v1",JSON.stringify(favorites))},[ready,favorites]);
 useEffect(()=>{if(ready)localStorage.setItem("essential-orders-v1",JSON.stringify(orders))},[ready,orders]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),3800);return()=>clearTimeout(timer)},[notice]);
 const notify=useCallback((message:string)=>setNotice(message),[]);
 const dismiss=useCallback(()=>setNotice(""),[]);
 const add=useCallback((product:Product,variantId?:string,quantity=1)=>{
  if(product.inventory<=0){notify("این محصول فعلاً ناموجود است");return}
  const variant=product.variants?.find(v=>v.id===variantId);
  const limit=Math.max(0,variant?variant.inventory:product.inventory);
  if(limit===0){notify("تنوع انتخاب‌شده ناموجود است");return}
  const id=product.id+"|"+(variantId||"");
  setLines(old=>{
   const current=old.find(x=>x.id===id),updated=Math.min(limit,(current?.quantity||0)+Math.max(1,quantity));
   return current?old.map(x=>x.id===id?{...x,quantity:updated}:x):[...old,{id,productId:product.id,variantId,quantity:Math.min(limit,Math.max(1,quantity))}];
  });
  notify("محصول به سبد خرید اضافه شد");
 },[notify]);
 const setQuantity=useCallback((id:string,quantity:number)=>{
  if(quantity<=0){setLines(old=>old.filter(x=>x.id!==id));return}
  setLines(old=>old.map(x=>{
   if(x.id!==id)return x;
   const p=demoProducts.find(p=>p.id===x.productId),v=p?.variants?.find(v=>v.id===x.variantId);
   const limit=Math.max(1,v?v.inventory:p?.inventory||1);
   return {...x,quantity:Math.min(limit,quantity)};
  }));
 },[]);
 const remove=useCallback((id:string)=>setLines(old=>old.filter(x=>x.id!==id)),[]);
 const clear=useCallback(()=>setLines([]),[]);
 const toggleFavorite=useCallback((id:string)=>{setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);},[]);
 const checkout=useCallback((data:Omit<DemoOrder,"id"|"createdAt">)=>{
  const order:DemoOrder={...data,id:"DEMO-"+Date.now().toString(36).toUpperCase(),createdAt:new Date().toISOString()};
  setOrders(old=>[order,...old]);setLines([]);
  return order;
 },[]);
 const value=useMemo<ShopContextType>(()=>({lines,favorites,orders,ready,count:lines.reduce((n,x)=>n+x.quantity,0),notice,add,setQuantity,remove,clear,isFavorite:(id:string)=>favorites.includes(id),toggleFavorite,checkout,notify,dismiss}),[lines,favorites,orders,ready,notice,add,setQuantity,remove,clear,toggleFavorite,checkout,notify,dismiss]);
 return <ShopContext.Provider value={value}>{children}{notice&&<div className="toast" role="status"><span className="toast-dot"/>{notice}<button aria-label="بستن اعلان" onClick={dismiss}>×</button></div>}</ShopContext.Provider>
}
export function useShop(){const state=useContext(ShopContext);if(!state)throw new Error("ShopProvider missing");return state}
