"use client";
import {useCallback,useEffect,useState,type ReactNode} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowUp,ArrowDown,ArrowUpLeft,Check,Eye,Loader2,Monitor,Smartphone,
 Plus,GripVertical,Trash2,Truck,Headphones,PackageCheck,ShieldCheck,NotebookPen,Undo2,ExternalLink,Save} from "lucide-react";
import {adminFetch,DEMO_MODE} from "@/lib/admin/demo-api";
import {DestinationPicker,MediaField,EntityChoices} from "@/components/admin/EditionTwoControls";
import {editionTwoDefaults,editionTwoTitleFor,type EditionTwoConfig,type EdCatalog,type EdImageText,type Destination} from "@/lib/admin/edition-two";
import {FestivalCountdown} from "@/components/FestivalCountdown";
import {FestivalProductManager} from "@/components/admin/FestivalProductManager";
import {showcasePhoto} from "@/lib/showcase-photos";

type Part="hero"|"categories"|"featured"|"campaign"|"festival"|"story"|"chapters"|"journal"|"benefits"|"footer";
const parts:Part[]=["hero","categories","featured","campaign","festival","story","chapters","journal","benefits","footer"];
const empty:EdCatalog={products:[],categories:[],articles:[],pages:[]};
const photo=(url:string)=>showcasePhoto(url||"/images/hero-woman.webp");
function dateTimeLocal(iso:string){
 const date=new Date(iso);if(!Number.isFinite(date.getTime()))return "";
 const pad=(n:number)=>String(n).padStart(2,"0");
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function fallbackName(id:string,catalog:EdCatalog){return catalog.categories.find(x=>x.id===id||x.slug===id)?.name||
 ({bags:"کیف",clothing:"پوشاک",shoes:"کفش",accessories:"اکسسوری"} as Record<string,string>)[id]||"کالکشن";}
function Field({label,value,onChange,multiline=false,placeholder=""}:{label:string;value:string;onChange:(s:string)=>void;multiline?:boolean;placeholder?:string}){
 return <label className="ed2-field"><span className="ed2-field-label">{label}</span>
 {multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder}/>:
 <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}</label>;
}
function MoveControls({index,total,onUp,onDown,onRemove}:{index:number;total:number;onUp:()=>void;onDown:()=>void;onRemove?:()=>void}){
 return <div className="ed2-move-actions">
  <button type="button" aria-label="انتقال به بالا" title="بالا" disabled={!index} onClick={onUp}><ArrowUp size={16}/></button>
  <button type="button" aria-label="انتقال به پایین" title="پایین" disabled={index>=total-1} onClick={onDown}><ArrowDown size={16}/></button>
  {onRemove&&<button type="button" className="ed2-remove" aria-label="حذف" title="حذف" onClick={onRemove}><Trash2 size={16}/></button>}
 </div>;
}
function swap<T>(arr:T[],index:number,next:number){
 if(next<0||next>=arr.length)return;
 [arr[index],arr[next]]=[arr[next],arr[index]];
}
function BenefitIcon({name}:{name:string}){
 return name==="truck"?<Truck/>:name==="package"?<PackageCheck/>:name==="shield"?<ShieldCheck/>:<Headphones/>;
}
function Editable({id,selected,select,children,className="",rank=99}:{id:Part;selected:Part;select:(id:Part)=>void;children:ReactNode;className?:string;rank?:number}){
 return <section role="button" tabIndex={0} aria-label={"ویرایش "+editionTwoTitleFor(id)}
  aria-pressed={selected===id} style={{order:rank}} className={"ed2-preview-section "+className+(selected===id?" is-selected":"")}
  onClick={()=>select(id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(id)}}}>
  {children}<span className="ed2-section-hint">ویرایش {editionTwoTitleFor(id)}</span>
 </section>;
}
function VisualPreview({value,catalog,selected,onSelect,viewport,slideIndex}:{value:EditionTwoConfig;catalog:EdCatalog;selected:Part;onSelect:(id:Part)=>void;viewport:"desktop"|"mobile";slideIndex:number}){
 const hero=value.hero[slideIndex]||value.hero[0];
 const candidates=catalog.products.filter(p=>(p.inventory??1)>0);
 const discounted=candidates.filter(p=>typeof p.price==="number"&&typeof p.comparePrice==="number"&&p.comparePrice>p.price);
 const explicit=value.festival.productIds?.map(id=>candidates.find(p=>p.id===id)).filter((p):p is EdCatalog["products"][number]=>Boolean(p))||[];
 const saleItems=(value.festival.productIds?.length?explicit:[
  ...discounted,...candidates.filter(p=>!discounted.some(d=>d.id===p.id))
 ]).slice(0,12);
 const sectionRank=(key:string)=>Math.max(0,(value.sectionOrder||editionTwoDefaults.sectionOrder).indexOf(key))+1;
 const products=(value.featured.productIds.length?value.featured.productIds.map(id=>catalog.products.find(x=>x.id===id)).filter((x):x is EdCatalog["products"][number]=>Boolean(x)):catalog.products).slice(0,4);
 const articleItems=(value.journal.articleIds.length?value.journal.articleIds.map(id=>catalog.articles.find(x=>x.id===id)).filter((x):x is EdCatalog["articles"][number]=>Boolean(x)):catalog.articles).slice(0,2);
 return <div className={"ed2-preview-screen ed1-visual-page "+(viewport==="mobile"?"is-mobile":"is-desktop")} dir="rtl">
  <div className="ed1-mini-announcement"><Truck size={13}/>{value.announcement||"ارسال سریع با روش دلخواه"}</div>
  <div className="ed1-mini-header"><strong>ESSENTIAL 01</strong><span>خانه　 دسته‌بندی‌ها　 محصولات</span><span>⌕　♧</span></div>
  <Editable id="hero" rank={sectionRank("hero")} selected={selected} select={onSelect} className="ed1-mini-hero-block">
   <div className="ed1-mini-hero"><div className="ed1-mini-hero-copy">
    <small>{hero.eyebrow}</small><h2>{hero.title}</h2><p>{hero.description}</p>
    <span className="ed1-mini-button">{hero.ctaLabel||"مشاهده محصولات"} <ArrowLeft size={15}/></span>
   </div><div className="ed1-mini-hero-picture"><img src={photo(viewport==="mobile"?hero.mobileImageUrl||hero.imageUrl:hero.imageUrl)} alt=""/></div></div>
  </Editable>
  <Editable id="categories" rank={sectionRank("categories")} selected={selected} select={onSelect}>
   <div className="ed1-mini-section-head"><h2>{value.categories.title}</h2><small>دسته‌بندی‌ها</small></div>
   <div className="ed1-mini-categories">{value.categories.items.map((item,i)=><div key={i}>
    <img src={photo(item.imageUrl||catalog.categories.find(x=>x.id===item.categoryId)?.imageUrl||"")} alt=""/>
    <strong>{fallbackName(item.categoryId,catalog)}</strong></div>)}</div>
  </Editable>
  <Editable id="featured" rank={sectionRank("featured")} selected={selected} select={onSelect}>
   <div className="ed1-mini-section-head"><h2>{value.featured.title}</h2><small>{value.featured.description}</small></div>
   <div className="ed1-mini-products">{products.map(p=><div key={p.id}>
    <div>{p.imageUrl?<img src={p.imageUrl} alt=""/>:<PackageCheck size={23}/>}</div><strong>{p.name}</strong></div>)}</div>
  </Editable>
  <div className="ed1-mini-promo-pair">
   <Editable id="campaign" rank={sectionRank("campaign")} selected={selected} select={onSelect} className="ed1-mini-promo">
    <div><h2>{value.campaign.title}</h2><p>{value.campaign.description}</p><small>{value.campaign.ctaLabel} ←</small></div>
    <img src={photo(value.campaign.imageUrl)} alt=""/>
   </Editable>
   <Editable id="story" rank={sectionRank("story")} selected={selected} select={onSelect} className="ed1-mini-promo">
    <div><h2>{value.story.title}</h2><p>{value.story.description}</p><small>{value.story.ctaLabel} ←</small></div>
    <img src={photo(value.story.imageUrl)} alt=""/>
   </Editable>
  </div>

  <Editable id="festival" rank={sectionRank("festival")} selected={selected} select={onSelect} className={"ed1-preview-festival "+(!value.festival.enabled?"ed2-festival-disabled":"")}>
    <div className="ed1-preview-campaign-banner">
      <div className="ed1-preview-campaign-copy">
        <span className="ed1-preview-sale-pill">جشنواره فروش ویژه</span>
        <small>{value.festival.eyebrow}</small>
        <h2>{value.festival.title}</h2><p>{value.festival.description}</p>
        {value.festival.showCountdown&&<FestivalCountdown endsAt={value.festival.endsAt} expiredText={value.festival.expiredText}/>}
        <span className="ed1-preview-sale-cta">{value.festival.ctaLabel} ←</span>
      </div>
      <div className="ed1-preview-campaign-image"><img src={photo(viewport==="mobile"?value.festival.mobileImageUrl||value.festival.imageUrl:value.festival.imageUrl)} alt=""/></div>
    </div>
    <div className="ed2-preview-sale-items">
      {saleItems.map(p=><div className="ed2-preview-sale-item" key={p.id}>
        {p.imageUrl?<img src={photo(p.imageUrl)} alt=""/>:<PackageCheck size={20}/>}
        <strong>{p.name}</strong><small>{p.comparePrice&&p.price&&p.comparePrice>p.price?Math.round((1-p.price/p.comparePrice)*100).toLocaleString("fa-IR")+"٪ تخفیف":"منتخب جشنواره"}</small>
        <div className="ed2-preview-sale-prices">{p.comparePrice&&p.price&&p.comparePrice>p.price&&<s>{p.comparePrice.toLocaleString("fa-IR")} تومان</s>}<b>{(p.price||0).toLocaleString("fa-IR")} تومان</b></div>
      </div>)}
      {!saleItems.length&&<small>محصول تخفیف‌دار فعال ثبت نشده است.</small>}
    </div>
  </Editable>
  <Editable id="chapters" rank={sectionRank("chapters")} selected={selected} select={onSelect}>
   <div className="ed1-mini-section-head"><h2>بنرهای تکمیلی</h2><small>بخش‌های پایین صفحه</small></div>
   <div className="ed1-mini-chapters">{value.chapters.map(c=><div key={c.id}>
    <div><h2>{c.title}</h2><p>{c.description}</p></div><img src={photo(c.imageUrl)} alt=""/></div>)}</div>
  </Editable>
  <Editable id="journal" rank={sectionRank("journal")} selected={selected} select={onSelect}>
   <div className="ed1-mini-section-head"><h2>{value.journal.title}</h2><small>مطالب تازه</small></div>
   <div className="ed1-mini-products">{articleItems.map(p=><div key={p.id}>
    <div>{p.imageUrl?<img src={p.imageUrl} alt=""/>:<NotebookPen size={23}/>}</div><strong>{p.name}</strong></div>)}</div>
  </Editable>
  <Editable id="benefits" rank={sectionRank("benefits")} selected={selected} select={onSelect}>
   <div className="ed1-mini-benefits">{value.benefits.map(b=><div key={b.id}>
    <BenefitIcon name={b.icon}/><span><strong>{b.title}</strong><small>{b.description}</small></span></div>)}</div>
  </Editable>
  <Editable id="footer" selected={selected} select={onSelect} className="ed1-mini-footer">
   <div className="ed1-mini-final"><small>{value.footer.eyebrow}</small><h2>{value.footer.title}</h2><p>{value.footer.bottomNote}</p></div>
   <div className="ed1-mini-footer-columns"><div><strong>ESSENTIAL 01</strong><p>خرید ساده و مطمئن</p></div>
    {value.footerColumns.map(c=><div key={c.id}><strong>{c.title}</strong>{c.links.map(l=><small key={l.id}>{l.label}</small>)}</div>)}</div>
  </Editable>
 </div>;
}
export function EditionTwoHomeEditor(){
 const [value,setValue]=useState<EditionTwoConfig|null>(null),[catalog,setCatalog]=useState<EdCatalog>(empty);
 const [selected,setSelected]=useState<Part>("hero"),[slideIndex,setSlideIndex]=useState(0),[chapterIndex,setChapterIndex]=useState(0);
 const [viewport,setViewport]=useState<"desktop"|"mobile">("desktop");
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[publishing,setPublishing]=useState(false);
 const [dirty,setDirty]=useState(false),[hasDraft,setHasDraft]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const [dragging,setDragging]=useState<string|null>(null);
 const load=useCallback(async()=>{
  try{
   const r=await adminFetch("/api/admin/edition-2");
   const data=await r.json();
   if(!r.ok)throw Error(data.error||"اطلاعات صفحه اصلی دریافت نشد");
   const incoming=data.draft||{};
   const legacy=!incoming.festival?.endsAt;
   const order=incoming.sectionOrder?.length===editionTwoDefaults.sectionOrder.length?[...incoming.sectionOrder]:[...editionTwoDefaults.sectionOrder];
   if(legacy){for(const id of ["hero","festival"]){const i=order.indexOf(id);if(i>=0)order.splice(i,1)}order.unshift("hero","festival");}
   setValue({...editionTwoDefaults,...incoming,
    festival:{...editionTwoDefaults.festival,...(incoming.festival||{}),enabled:legacy?true:incoming.festival.enabled},
    sectionOrder:order});setCatalog(data.catalog||empty);setHasDraft(Boolean(data.hasUnpublishedDraft));setDirty(false);
  }catch(e){setError(e instanceof Error?e.message:"خطا در بارگذاری صفحه")}finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{if(!message)return;const timer=window.setTimeout(()=>setMessage(""),7000);return()=>window.clearTimeout(timer)},[message]);
 useEffect(()=>{
  const before=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=""}};
  window.addEventListener("beforeunload",before);return()=>window.removeEventListener("beforeunload",before);
 },[dirty]);
 function edit(fn:(config:EditionTwoConfig)=>void){
  setValue(old=>{if(!old)return old;const copy:EditionTwoConfig=structuredClone(old);fn(copy);return copy});
  setDirty(true);setMessage("");setError("");
 }
 async function saveDraft(){
  if(!value||saving)return false;setSaving(true);setError("");setMessage("");
  try{
   const r=await adminFetch("/api/admin/edition-2",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});
   const body=await r.json();if(!r.ok)throw Error(body.error||"ذخیره ناموفق بود");
   setDirty(false);setHasDraft(true);setMessage("پیش‌نویس ذخیره شد؛ سایت اصلی هنوز تغییری نکرده است.");return true;
  }catch(e){setError(e instanceof Error?e.message:"ذخیره ناموفق بود");return false}
  finally{setSaving(false)}
 }
 async function publish(){
  if(publishing)return;
  setPublishing(true);setError("");setMessage("");
  try{
   if(dirty&&!await saveDraft())return;
   const r=await adminFetch("/api/admin/edition-2",{method:"POST"});
   const body=await r.json();if(!r.ok)throw Error(body.error||"انتشار انجام نشد");
   if(!DEMO_MODE){
    const verification=await adminFetch("/api/admin/edition-2");
    if(!verification.ok)throw Error("انتشار ارسال شد اما تأیید وضعیت نهایی ممکن نبود.");
    const confirmed=await verification.json();
    if(!confirmed.published||confirmed.published.festival?.enabled!==value?.festival.enabled||
      confirmed.published.festival?.title!==value?.festival.title||
      confirmed.published.festival?.endsAt!==value?.festival.endsAt||
      confirmed.published.festival?.showCountdown!==value?.festival.showCountdown||
      JSON.stringify(confirmed.published.festival?.productIds||[])!==JSON.stringify(value?.festival.productIds||[])||
      JSON.stringify(confirmed.published.sectionOrder||[])!==JSON.stringify(value?.sectionOrder||[])){
      throw Error("انتشار در پایگاه داده هنوز تأیید نشده؛ پیش از تکرار، وضعیت سایت را بررسی کنید.");
    }
   }
   setDirty(false);setHasDraft(false);setMessage(DEMO_MODE?
    "در نسخه نمایشی انتشار شبیه‌سازی شد؛ سایت واقعی تغییر نکرد.":"تغییرات منتشر شدند. نمایش در فروشگاه ممکن است چند ثانیه زمان ببرد.");
  }catch(e){setError(e instanceof Error?e.message:"انتشار ناموفق بود")}
  finally{setPublishing(false)}
 }
 function reorderSections(source:string,target:string){
   if(source===target)return;
   edit(v=>{
     const known=editionTwoDefaults.sectionOrder;
     const order=[...new Set([...(v.sectionOrder||[]).filter(k=>known.includes(k)),...known])];
     const from=order.indexOf(source),to=order.indexOf(target);
     if(from<0||to<0)return;
     order.splice(from,1);
     order.splice(to,0,source);
     v.sectionOrder=order;
   });
 }
 function moveSection(key:string,delta:number){
   const order=value?.sectionOrder?.length?value.sectionOrder:editionTwoDefaults.sectionOrder;
   const index=order.indexOf(key),target=order[index+delta];
   if(target)reorderSections(key,target);
 }
  function editorField(kind:"campaign"|"story"|"festival",field:keyof EdImageText,x:unknown){
  edit(v=>{(v[kind] as unknown as Record<string,unknown>)[field]=x});
 }
 function moveHero(i:number,delta:number){edit(v=>swap(v.hero,i,i+delta));setSlideIndex(Math.max(0,Math.min((value?.hero.length||1)-1,i+delta)))}
 if(loading)return <div className="ed2-editor-loading"><Loader2 className="ed2-spin"/><span>در حال آماده‌سازی صفحه‌ساز...</span></div>;
 if(!value)return <div role="alert" className="ed2-error">{error}<button className="ed2-button" onClick={()=>void load()}>تلاش مجدد</button></div>;
 const current=value.hero[Math.min(slideIndex,value.hero.length-1)];
 const target=(x:Destination,fn:(t:Destination)=>void)=><DestinationPicker value={x} onChange={fn} catalog={catalog}/>;
 const photoField=(label:string,url:string,fn:(x:string)=>void)=><MediaField label={label} value={url||""} onChange={fn} catalog={catalog}
  extras={[...value.hero.flatMap(x=>[x.imageUrl,x.mobileImageUrl]),value.festival.imageUrl,value.festival.mobileImageUrl||"",value.campaign.imageUrl,value.story.imageUrl,value.story.secondaryImageUrl||"",...value.chapters.map(x=>x.imageUrl)]}/>;
 return <div className="ed2-editor-page">
  <div className="ed2-page-heading"><div><small>EDITION 01 / VISUAL CONTENT MANAGER</small><h1>مدیریت صفحه اصلی</h1>
   <p>روی هر بخش از پیش‌نمایش بزنید و همان قسمت را ویرایش کنید. چیدمان و انیمیشن‌ها ثابت می‌مانند.</p></div>
   <div className="ed2-page-actions"><Link className="ed2-button ed2-button-soft" href="/" target="_blank" rel="noreferrer">مشاهده سایت <ExternalLink size={16}/></Link>
    <button className="ed2-button ed2-button-outline" disabled={saving||publishing||(!dirty&&hasDraft)} onClick={()=>void saveDraft()}>{saving?"در حال ذخیره": "ذخیره پیش‌نویس"} <Save size={16}/></button>
    <button className="ed2-button ed2-button-dark" disabled={saving||publishing||(!dirty&&!hasDraft)} onClick={()=>void publish()}>{publishing?"در حال انتشار":"انتشار تغییرات"} <Check size={16}/></button></div>
  </div>
  {DEMO_MODE&&<div className="ed2-demo-hint">حالت آزمایشی: تغییرات فقط در همین نشست پنل نمایش داده می‌شوند و فروشگاه زنده را تغییر نمی‌دهند.</div>}
  {dirty&&<div className="ed2-draft-hint">تغییرات ذخیره‌نشده دارید.</div>}
  {error&&<div className="ed2-message error" role="alert">{error}</div>}
  {message&&<div className="ed2-message success ed2-toast-confirmed" role="status" aria-live="polite"><Check size={18}/><span>{message}</span><button type="button" onClick={()=>setMessage("")} aria-label="بستن اعلان">×</button></div>}

  <section className="ed2-section-arrangement" aria-label="تغییر ترتیب سکشن‌های صفحه اصلی">
   <div className="ed2-arrange-heading"><div><strong>چیدمان سکشن‌های صفحه اصلی</strong>
     <small>با کشیدن کارت‌ها یا فلش‌ها، بخش‌ها را جابه‌جا کنید؛ برای اعمال در فروشگاه دکمه «انتشار تغییرات» را بزنید.</small></div>
     <span>ترتیب فعلی صفحه</span>
   </div>
   <div className="ed2-section-arrangement-list">
     {(value.sectionOrder?.length?value.sectionOrder:editionTwoDefaults.sectionOrder).map((key,index,order)=>
       <div className={"ed2-sort-row "+(dragging===key?"is-dragging":"")} key={key} draggable
        onDragStart={e=>{setDragging(key);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",key)}}
        onDragEnd={()=>setDragging(null)}
        onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move"}}
        onDrop={e=>{e.preventDefault();const from=e.dataTransfer.getData("text/plain")||dragging;if(from)reorderSections(from,key);setDragging(null)}}>
         <GripVertical size={17} aria-hidden="true"/>
         <span className="ed2-sort-number">{String(index+1).padStart(2,"0")}</span>
         <button className="ed2-sort-name" type="button" onClick={()=>setSelected(key as Part)}>{editionTwoTitleFor(key)}</button>
         {key==="festival"&&<span className="ed2-sort-sale-tag">تخفیف</span>}
         <div className="ed2-sort-actions">
           <button type="button" aria-label={"بالا بردن "+editionTwoTitleFor(key)} disabled={index===0} onClick={()=>moveSection(key,-1)}><ArrowUp size={15}/></button>
           <button type="button" aria-label={"پایین بردن "+editionTwoTitleFor(key)} disabled={index===order.length-1} onClick={()=>moveSection(key,1)}><ArrowDown size={15}/></button>
         </div>
       </div>
     )}
   </div>
  </section>
  <div className="ed2-builder-layout">
   <div className="ed2-preview-column">
    <div className="ed2-preview-toolbar"><div><strong>پیش‌نمایش فروشگاه</strong><small>برای ویرایش، بخش موردنظر را انتخاب کنید.</small></div>
     <div className="ed2-viewport-switch" role="group" aria-label="اندازه نمایش">
      <button type="button" className={viewport==="desktop"?"active":""} aria-label="نمای دسکتاپ" aria-pressed={viewport==="desktop"} onClick={()=>setViewport("desktop")}><Monitor size={17}/><span>دسکتاپ</span></button>
      <button type="button" className={viewport==="mobile"?"active":""} aria-label="نمای موبایل" aria-pressed={viewport==="mobile"} onClick={()=>setViewport("mobile")}><Smartphone size={17}/><span>موبایل</span></button></div>
    </div>
    <div className="ed2-preview-viewport"><VisualPreview value={value} catalog={catalog} selected={selected} onSelect={setSelected} viewport={viewport} slideIndex={Math.min(slideIndex,value.hero.length-1)}/></div>
   </div>
   <div className="ed2-settings-column">
    <nav className="ed2-part-selector" aria-label="بخش‌های صفحه اصلی">{parts.map(p=><button type="button" key={p} className={selected===p?"active":""} onClick={()=>setSelected(p)}>{editionTwoTitleFor(p)}</button>)}</nav>
    <div className="ed2-inspector">
     <div className="ed2-inspector-title"><small>تنظیمات بخش</small><h2>{editionTwoTitleFor(selected)}</h2><p>تغییرات را در پیش‌نمایش کنار فرم مشاهده کنید.</p></div>
     {selected==="hero"&&<div className="ed2-inspector-body">
       <div className="ed2-mini-heading"><strong>تصاویر هیرو</strong><span>{value.hero.length} اسلاید</span></div>
       <div className="ed2-slide-select">{value.hero.map((slide,i)=><button type="button" key={slide.id}
        className={slideIndex===i?"selected":""} onClick={()=>setSlideIndex(i)}><span>0{i+1}</span><img src={photo(slide.imageUrl)} alt=""/><small>{slide.title.split("\n")[0]}</small></button>)}</div>
       <div className="ed2-row-between"><label className="ed2-check"><input type="checkbox" checked={current.enabled} onChange={e=>edit(v=>{v.hero[slideIndex].enabled=e.target.checked})}/> نمایش این اسلاید</label>
        <MoveControls index={slideIndex} total={value.hero.length} onUp={()=>moveHero(slideIndex,-1)} onDown={()=>moveHero(slideIndex,1)}
         onRemove={value.hero.length>1?()=>{edit(v=>{v.hero.splice(slideIndex,1)});setSlideIndex(0)}:undefined}/></div>
       <Field label="عنوان اصلی" multiline value={current.title} onChange={x=>edit(v=>{v.hero[slideIndex].title=x})}/>
       <Field label="توضیح کوتاه" multiline value={current.description} onChange={x=>edit(v=>{v.hero[slideIndex].description=x})}/>
       <Field label="عنوان کوچک بالای تصویر" value={current.eyebrow} onChange={x=>edit(v=>{v.hero[slideIndex].eyebrow=x})}/>
       {photoField("تصویر دسکتاپ",current.imageUrl,x=>edit(v=>{v.hero[slideIndex].imageUrl=x}))}
       {photoField("تصویر موبایل",current.mobileImageUrl,x=>edit(v=>{v.hero[slideIndex].mobileImageUrl=x}))}
       <Field label="متن دکمه" value={current.ctaLabel} onChange={x=>edit(v=>{v.hero[slideIndex].ctaLabel=x})}/>
       {target(current.target,x=>edit(v=>{v.hero[slideIndex].target=x}))}
       <button type="button" className="ed2-button ed2-button-soft ed2-add-full" disabled={value.hero.length>=6}
        onClick={()=>{edit(v=>v.hero.push({...structuredClone(v.hero[v.hero.length-1]),id:crypto.randomUUID(),title:"تصویر هیرو جدید"}));setSlideIndex(value.hero.length)}}>
        افزودن اسلاید جدید <Plus size={17}/></button>
      </div>}
     {selected==="categories"&&<div className="ed2-inspector-body">
       <Field label="عنوان سکشن" value={value.categories.title} onChange={x=>edit(v=>{v.categories.title=x})}/>
       <div className="ed2-hint">کالکشن‌ها دقیقاً با همین ترتیب در صفحه اصلی نمایش داده می‌شوند.</div>
       {value.categories.items.map((item,i)=><div className="ed2-collection-editor" key={i}>
        <div className="ed2-mini-heading"><strong>کالکشن {i+1}</strong><MoveControls index={i} total={value.categories.items.length}
         onUp={()=>edit(v=>swap(v.categories.items,i,i-1))} onDown={()=>edit(v=>swap(v.categories.items,i,i+1))}
         onRemove={()=>edit(v=>{v.categories.items.splice(i,1)})}/></div>
        <label className="ed2-field"><span className="ed2-field-label">دسته‌بندی موجود</span>
         <select value={item.categoryId} onChange={e=>edit(v=>{v.categories.items[i].categoryId=e.target.value})}>
          <option value={item.categoryId}>{fallbackName(item.categoryId,catalog)}</option>
          {catalog.categories.filter(x=>x.id!==item.categoryId&&x.slug!==item.categoryId).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        {photoField("تصویر کالکشن",item.imageUrl||"",x=>edit(v=>{v.categories.items[i].imageUrl=x}))}
       </div>)}
       <button className="ed2-button ed2-button-soft ed2-add-full" type="button" disabled={value.categories.items.length>=8||!catalog.categories.length}
         onClick={()=>edit(v=>v.categories.items.push({categoryId:catalog.categories.find(c=>!v.categories.items.some(x=>x.categoryId===c.id))?.id||catalog.categories[0].id}))}>افزودن کالکشن <Plus size={16}/></button>
      </div>}
     {selected==="featured"&&<div className="ed2-inspector-body">
       <Field label="عنوان سکشن" value={value.featured.title} onChange={x=>edit(v=>{v.featured.title=x})}/>
       <Field label="توضیحات سکشن" multiline value={value.featured.description} onChange={x=>edit(v=>{v.featured.description=x})}/>
       <EntityChoices label="انتخاب و ترتیب محصولات" items={catalog.products} selected={value.featured.productIds}
        onChange={items=>edit(v=>{v.featured.productIds=items})} max={4}/>
       <div className="ed2-hint">اگر محصولی انتخاب نکنید، چهار محصول ویژه فروشگاه نمایش داده می‌شود. ترتیب انتخاب از بالا به پایین است.</div>
      </div>}
     {(selected==="campaign"||selected==="story")&&<div className="ed2-inspector-body">
       <Field label="عنوان بخش" multiline value={value[selected].title} onChange={x=>editorField(selected,"title",x)}/>
       <Field label="توضیحات" multiline value={value[selected].description} onChange={x=>editorField(selected,"description",x)}/>
       {photoField("تصویر اصلی",value[selected].imageUrl,x=>editorField(selected,"imageUrl",x))}
       {selected==="story"&&photoField("تصویر کوچک روی تصویر اصلی",value.story.secondaryImageUrl||"",x=>editorField("story","secondaryImageUrl",x))}
       <Field label="متن دکمه" value={value[selected].ctaLabel} onChange={x=>editorField(selected,"ctaLabel",x)}/>
       {target(value[selected].target,x=>editorField(selected,"target",x))}
      </div>}
     {selected==="festival"&&<div className="ed2-inspector-body ed2-festival-inspector">
       <label className="ed2-festival-enable"><input type="checkbox" checked={value.festival.enabled}
         onChange={e=>edit(v=>{v.festival.enabled=e.target.checked})}/>
         <span>نمایش جشنواره در صفحه اصلی</span><small>{value.festival.enabled?"فعال":"غیرفعال"}</small>
       </label>
       <div className="ed2-hint">این بخش مستقل از هیرو و بنرهای قبلی است. خاموش‌کردن آن، اطلاعات کمپین را برای استفاده بعدی حفظ می‌کند.</div>

       <div className="ed2-festival-discount-advice">
        فقط محصولاتی که در پنل محصولات «قیمت قبل از تخفیف» بالاتر از «قیمت فروش» دارند و موجود هستند، در جشنواره نمایش داده می‌شوند.
        اگر محصولی انتخاب نکنید، تمام محصولات واجد شرایط به‌صورت خودکار نشان داده می‌شوند.
       </div>
       <FestivalProductManager catalog={catalog} selected={value.festival.productIds||[]}
        onChange={ids=>edit(v=>{v.festival.productIds=ids})}
        onCreated={item=>setCatalog(current=>({...current,products:[item,...current.products]}))} max={12}/>
       <Field label="برچسب کوتاه جشنواره" value={value.festival.eyebrow} onChange={x=>edit(v=>{v.festival.eyebrow=x})}/>
       <Field label="عنوان کمپین" multiline value={value.festival.title} onChange={x=>editorField("festival","title",x)}/>
       <Field label="توضیحات" multiline value={value.festival.description} onChange={x=>editorField("festival","description",x)}/>
       {photoField("تصویر جشنواره",value.festival.imageUrl,x=>editorField("festival","imageUrl",x))}
       {photoField("تصویر موبایل (اختیاری)",value.festival.mobileImageUrl||"",x=>editorField("festival","mobileImageUrl",x))}
       <label className="ed2-festival-enable"><input type="checkbox" checked={value.festival.showCountdown}
         onChange={e=>edit(v=>{v.festival.showCountdown=e.target.checked})}/>
         <span>نمایش تایمر معکوس جشنواره</span><small>{value.festival.showCountdown?"فعال":"غیرفعال"}</small></label>
       <label className="ed2-field"><span className="ed2-field-label">تاریخ و ساعت پایان جشنواره</span>
        <input type="datetime-local" value={dateTimeLocal(value.festival.endsAt)}
         onChange={e=>{const date=new Date(e.target.value);if(e.target.value&&Number.isFinite(date.getTime()))edit(v=>{v.festival.endsAt=date.toISOString()})}}/>
       </label>
       <Field label="متن بعد از اتمام زمان جشنواره" value={value.festival.expiredText}
         onChange={x=>edit(v=>{v.festival.expiredText=x})}/>
       <Field label="متن دکمه" value={value.festival.ctaLabel} onChange={x=>editorField("festival","ctaLabel",x)}/>
       {target(value.festival.target,x=>editorField("festival","target",x))}
      </div>}
     {selected==="chapters"&&<div className="ed2-inspector-body">
       <div className="ed2-hint">دو فصل تصویری و انیمیشن اسکرول آن‌ها ثابت هستند؛ فقط عکس‌ها و متن‌ها تغییر می‌کنند.</div>
       <div className="ed2-subtabs">{value.chapters.map((c,i)=><button key={c.id} className={chapterIndex===i?"active":""} type="button" onClick={()=>setChapterIndex(i)}>فصل {i+1}</button>)}</div>
       <Field label="عنوان فصل" multiline value={value.chapters[chapterIndex].title} onChange={x=>edit(v=>{v.chapters[chapterIndex].title=x})}/>
       <Field label="توضیحات فصل" multiline value={value.chapters[chapterIndex].description} onChange={x=>edit(v=>{v.chapters[chapterIndex].description=x})}/>
       {photoField("تصویر فصل",value.chapters[chapterIndex].imageUrl,x=>edit(v=>{v.chapters[chapterIndex].imageUrl=x}))}
       {photoField("تصویر ویژه موبایل (اختیاری)",value.chapters[chapterIndex].mobileImageUrl||"",x=>edit(v=>{v.chapters[chapterIndex].mobileImageUrl=x}))}
      </div>}
     {selected==="journal"&&<div className="ed2-inspector-body">
       <Field label="عنوان ژورنال" value={value.journal.title} onChange={x=>edit(v=>{v.journal.title=x})}/>
       <EntityChoices label="انتخاب دو مقاله صفحه اصلی" items={catalog.articles} selected={value.journal.articleIds}
        onChange={items=>edit(v=>{v.journal.articleIds=items})} max={2}/>
       <Link className="ed2-button ed2-button-soft ed2-add-full" href="/admin/articles">مدیریت و انتشار مقالات <ArrowLeft size={17}/></Link>
      </div>}
     {selected==="benefits"&&<div className="ed2-inspector-body">
       {value.benefits.map((b,i)=><div className="ed2-collection-editor" key={b.id}>
        <div className="ed2-mini-heading"><strong>مزیت {i+1}</strong><MoveControls index={i} total={value.benefits.length}
          onUp={()=>edit(v=>swap(v.benefits,i,i-1))} onDown={()=>edit(v=>swap(v.benefits,i,i+1))}
          onRemove={()=>edit(v=>{v.benefits.splice(i,1)})}/></div>
        <Field label="عنوان" value={b.title} onChange={x=>edit(v=>{v.benefits[i].title=x})}/>
        <Field label="توضیح" value={b.description} onChange={x=>edit(v=>{v.benefits[i].description=x})}/>
        <label className="ed2-field"><span className="ed2-field-label">آیکن</span><select value={b.icon} onChange={e=>edit(v=>{v.benefits[i].icon=e.target.value as typeof b.icon})}>
         <option value="truck">ارسال</option><option value="package">محصول</option><option value="headphones">پشتیبانی</option><option value="shield">ضمانت</option></select></label>
       </div>)}
       <button type="button" className="ed2-button ed2-button-soft ed2-add-full" disabled={value.benefits.length>=6}
        onClick={()=>edit(v=>v.benefits.push({id:crypto.randomUUID(),title:"مزیت جدید",description:"توضیح کوتاه",icon:"shield"}))}>افزودن مزیت <Plus size={17}/></button>
      </div>}
     {selected==="footer"&&<div className="ed2-inspector-body">
       <Field label="نوار اطلاع‌رسانی بالای سایت" value={value.announcement} onChange={x=>edit(v=>{v.announcement=x})}/>
       <Field label="عنوان کوچک فوتر" value={value.footer.eyebrow} onChange={x=>edit(v=>{v.footer.eyebrow=x})}/>
       <Field label="تیتر اصلی فوتر" multiline value={value.footer.title} onChange={x=>edit(v=>{v.footer.title=x})}/>
       <Field label="متن انتهای فوتر" value={value.footer.bottomNote} onChange={x=>edit(v=>{v.footer.bottomNote=x})}/>
       <div className="ed2-mini-heading"><strong>منوی اصلی</strong><span>{value.navigation.length} لینک</span></div>
       {value.navigation.map((nav,i)=><div className="ed2-collection-editor" key={nav.id}>
        <div className="ed2-mini-heading"><strong>لینک {i+1}</strong><MoveControls index={i} total={value.navigation.length}
         onUp={()=>edit(v=>swap(v.navigation,i,i-1))} onDown={()=>edit(v=>swap(v.navigation,i,i+1))}
         onRemove={()=>edit(v=>{v.navigation.splice(i,1)})}/></div>
        <Field label="نام نمایشی" value={nav.label} onChange={x=>edit(v=>{v.navigation[i].label=x})}/>
        {target(nav.target,x=>edit(v=>{v.navigation[i].target=x}))}
       </div>)}
       <button type="button" className="ed2-button ed2-button-soft ed2-add-full" disabled={value.navigation.length>=12}
        onClick={()=>edit(v=>v.navigation.push({id:crypto.randomUUID(),label:"لینک جدید",target:{kind:"none"}}))}>افزودن لینک منو <Plus size={17}/></button>

       <div className="ed2-mini-heading"><strong>ستون‌های لینک فوتر</strong><span>{value.footerColumns.length} ستون</span></div>
       <p className="ed2-hint">ستون‌ها و لینک‌ها دقیقاً با همین ترتیب در فوتر فروشگاه نمایش داده می‌شوند. مقصد را از فهرست موجود انتخاب کنید.</p>
       {value.footerColumns.map((col,i)=><div className="ed2-collection-editor" key={col.id}>
         <div className="ed2-mini-heading"><strong>ستون {i+1}</strong>
          <MoveControls index={i} total={value.footerColumns.length}
           onUp={()=>edit(v=>swap(v.footerColumns,i,i-1))}
           onDown={()=>edit(v=>swap(v.footerColumns,i,i+1))}
           onRemove={()=>edit(v=>{v.footerColumns.splice(i,1)})}/>
         </div>
         <Field label="عنوان ستون" value={col.title} onChange={x=>edit(v=>{v.footerColumns[i].title=x})}/>
         {col.links.map((entry,j)=><div className="ed2-collection-editor" key={entry.id}>
           <div className="ed2-mini-heading"><strong>لینک {j+1}</strong>
            <MoveControls index={j} total={col.links.length}
             onUp={()=>edit(v=>swap(v.footerColumns[i].links,j,j-1))}
             onDown={()=>edit(v=>swap(v.footerColumns[i].links,j,j+1))}
             onRemove={()=>edit(v=>{v.footerColumns[i].links.splice(j,1)})}/>
           </div>
           <Field label="متن لینک" value={entry.label} onChange={x=>edit(v=>{v.footerColumns[i].links[j].label=x})}/>
           {target(entry.target,x=>edit(v=>{v.footerColumns[i].links[j].target=x}))}
         </div>)}
         <button className="ed2-button ed2-button-soft ed2-add-full" type="button" disabled={col.links.length>=10}
          onClick={()=>edit(v=>{v.footerColumns[i].links.push({id:crypto.randomUUID(),label:"لینک جدید",target:{kind:"none"}})})}>
          افزودن لینک به این ستون <Plus size={15}/>
         </button>
       </div>)}
       <button className="ed2-button ed2-button-soft ed2-add-full" type="button" disabled={value.footerColumns.length>=4}
        onClick={()=>edit(v=>v.footerColumns.push({id:crypto.randomUUID(),title:"ستون جدید",links:[]}))}>
        افزودن ستون جدید <Plus size={17}/>
       </button>
       <Link className="ed2-button ed2-button-soft ed2-add-full" href="/admin/settings">تنظیمات تماس و شبکه‌های اجتماعی <ArrowLeft size={17}/></Link>
      </div>}
    </div>
   </div>
  </div>
 </div>;
}
