import {loadStore} from "@/lib/live-store";
import {seoMeta,websiteSchema,jsonLd} from "@/lib/seo";
import {AtelierHome} from "@/components/AtelierHome";

export async function generateMetadata(){
 const store=await loadStore();
 return seoMeta(store,"/",{
  title:store.settings.seoTitle||store.settings.storeName,
  description:store.settings.seoDescription||store.settings.description
 });
}
export default async function Home(){
 const store=await loadStore();
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(websiteSchema(store))}}/>
  <AtelierHome store={store}/>
 </>;
}
