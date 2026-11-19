import type {Product} from "@/lib/catalog";
import type {StoreData} from "@/lib/live-store";

/** A festival is a real set of discounted, purchasable products—not a random shelf. */
export function festivalProducts(store:StoreData):Product[]{
 const config=store.settings.editorialConfig?.festival;
 if(config?.enabled===false)return [];
 const valid=(p:Product)=>p.inventory>0&&p.comparePrice!==undefined&&p.comparePrice>p.price&&p.price>0;
 const selected=config?.productIds?.map(id=>store.products.find(p=>p.id===id)).filter((p):p is Product=>Boolean(p)&&valid(p!))||[];
 const rest=store.products.filter(valid);
 const seen=new Set<string>();
 return [...selected,...rest].filter(p=>seen.has(p.id)?false:(seen.add(p.id),true));
}
export function popularProducts(store:StoreData):Product[]{
 const active=store.products.filter(p=>p.inventory>0);
 const featured=active.filter(p=>p.featured);
 return (featured.length?featured:active).slice(0,4);
}
export function recentProducts(store:StoreData):Product[]{
 const active=store.products.filter(p=>p.inventory>0);
 const fresh=active.filter(p=>p.newArrival);
 return (fresh.length?fresh:active.slice().reverse()).slice(0,4);
}
