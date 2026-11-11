/* Typed visual content model for Essential 01 standalone installation. */
export type Destination={kind:"none"|"home"|"products"|"product"|"category"|"page"|"article"|"external";id?:string;url?:string};
export type EdSlide={id:string;title:string;description:string;eyebrow:string;imageUrl:string;mobileImageUrl:string;ctaLabel:string;target:Destination;enabled:boolean};
export type EdImageText={title:string;description:string;imageUrl:string;mobileImageUrl?:string;secondaryImageUrl?:string;ctaLabel:string;target:Destination};
export type EdFestival=EdImageText&{enabled:boolean;eyebrow:string;productIds:string[];showCountdown:boolean;endsAt:string;expiredText:string};
export type EditionTwoConfig={
 version:2;announcement:string;hero:EdSlide[];sectionOrder:string[];
 categories:{title:string;items:Array<{categoryId:string;imageUrl?:string}>};
 featured:{title:string;description:string;productIds:string[]};
 campaign:EdImageText;story:EdImageText;festival:EdFestival;
 chapters:Array<{id:string;title:string;description:string;imageUrl:string;mobileImageUrl?:string}>;
 journal:{title:string;articleIds:string[]};
 benefits:Array<{id:string;title:string;description:string;icon:"truck"|"package"|"headphones"|"shield"}>;
 footer:{eyebrow:string;title:string;bottomNote:string};
 footerColumns:Array<{id:string;title:string;links:Array<{id:string;label:string;target:Destination}>}>;
 navigation:Array<{id:string;label:string;target:Destination}>;
};
const origin="/images/";
const photo=(file:string)=>origin+({"chapter-detail.webp":"hero-woman.webp","story-detail.webp":"bag.webp","campaign.webp":"sneakers.webp","story-portrait.webp":"hero-woman.webp","chapter-form.webp":"linen-shirt.webp","category-clothing.webp":"linen-shirt.webp","category-bags.webp":"bag.webp","category-shoes.webp":"sneakers.webp","category-accessories.webp":"sunglasses.webp"} as Record<string,string>)[file];
const products:Destination={kind:"products"};
const category:Destination={kind:"category",id:"bags"};
export const editionTwoDefaults:EditionTwoConfig={
 version:2,sectionOrder:["hero","festival","categories","featured","campaign","story","chapters","journal","benefits"],announcement:"ارسال رایگان برای خریدهای بالای ۳ میلیون تومان",
 hero:[
  {id:"hero-1",title:"فروشگاه ساده، سریع و حرفه‌ای",description:"خریدی مطمئن، آسان و لذت‌بخش از مجموعه‌ای متنوع از پوشاک، کیف، کفش و اکسسوری‌های باکیفیت.",eyebrow:"خریدی متفاوت، ساده و مطمئن",imageUrl:"/images/hero-woman.webp",mobileImageUrl:"/images/hero-mobile.webp",ctaLabel:"مشاهده محصولات",target:{kind:"products"},enabled:true}
 ],
 categories:{title:"دسته‌بندی محصولات",items:[{categoryId:"clothing",imageUrl:photo("category-clothing.webp")},{categoryId:"bags",imageUrl:photo("category-bags.webp")},{categoryId:"shoes",imageUrl:photo("category-shoes.webp")},{categoryId:"accessories",imageUrl:photo("category-accessories.webp")}]},
 featured:{title:"پرفروش‌ترین محصولات",description:"گزیده‌ای از بهترین انتخاب‌ها",productIds:[]},
 festival:{enabled:true,productIds:[],showCountdown:true,endsAt:"2026-12-31T20:29:59.000Z",expiredText:"زمان این جشنواره به پایان رسیده است",eyebrow:"SPECIAL WEEK / ESSENTIAL 01",title:"جشنواره تخفیف‌های منتخب",description:"منتخب این هفته را ببین و محصول دلخواهت را آسان پیدا کن.",imageUrl:"/images/hero-woman.webp",mobileImageUrl:"/images/hero-woman.webp",ctaLabel:"دیدن پیشنهادها",target:{kind:"products"}},
 campaign:{title:"کیف‌های جدید و خاص",description:"مناسب استایل روزمره و رسمی",imageUrl:"/images/bag.webp",ctaLabel:"مشاهده کیف‌ها",target:category},
 story:{title:"جدیدترین مدل‌های کفش",description:"ترکیبی از راحتی، کیفیت و استایل روز",imageUrl:"/images/sneakers.webp",secondaryImageUrl:"",ctaLabel:"مشاهده کفش‌ها",target:{kind:"category",id:"shoes"}},
 chapters:[
  {id:"chapter-form",title:"محصولات جدید و کاربردی",description:"گزینه‌های تازه برای انتخاب شما",imageUrl:"/images/linen-shirt.webp"},
  {id:"chapter-details",title:"استایل موردعلاقه‌ات را پیدا کن",description:"از بین محصولات جدید، انتخابی مناسب سلیقه‌ات داشته باش.",imageUrl:"/images/bag.webp"}
 ],
 journal:{title:"از نگاه ژورنال",articleIds:[]},
 benefits:[
  {id:"shipping",title:"ارسال سریع",description:"تحویل در کوتاه‌ترین زمان",icon:"truck"},
  {id:"products",title:"پرداخت امن",description:"اتصال به درگاه معتبر",icon:"package"},
  {id:"support",title:"پشتیبانی",description:"پاسخگویی سریع",icon:"headphones"},
  {id:"quality",title:"ضمانت اصالت",description:"تضمین کیفیت و اصالت کالا",icon:"shield"}
 ],
 footer:{eyebrow:"برای انتخاب راحت‌تر",title:"استایل موردعلاقه‌ات را پیدا کن",bottomNote:"از بین محصولات جدید، انتخابی مناسب سلیقه‌ات داشته باش."},
 footerColumns:[
  {id:"guide",title:"راهنمای خرید",links:[
   {id:"all-products",label:"همه محصولات",target:{kind:"products"}},
   {id:"shopping-cart",label:"سبد خرید",target:{kind:"page",id:"cart"}},
   {id:"my-account",label:"حساب من",target:{kind:"page",id:"account"}},
   {id:"delivery",label:"ارسال و مرجوعی",target:{kind:"page",id:"shipping"}},
   {id:"questions",label:"سؤالات متداول",target:{kind:"page",id:"faq"}}
  ]},
  {id:"brand",title:"درباره فروشگاه",links:[
   {id:"brand-story",label:"داستان ما",target:{kind:"page",id:"about"}},
   {id:"brand-blog",label:"ژورنال",target:{kind:"page",id:"blog"}},
   {id:"brand-contact",label:"ارتباط با ما",target:{kind:"page",id:"contact"}},
   {id:"brand-privacy",label:"حریم خصوصی",target:{kind:"page",id:"privacy"}},
   {id:"brand-terms",label:"قوانین و مقررات",target:{kind:"page",id:"terms"}}
  ]}
 ],
 navigation:[
  {id:"nav-home",label:"خانه",target:{kind:"home"}},
  {id:"nav-shop",label:"فروشگاه",target:products},
  {id:"nav-journal",label:"ژورنال",target:{kind:"page",id:"blog"}}
 ]
};
export type EdEntity={id:string;name:string;slug:string;imageUrl?:string;status?:string;price?:number;comparePrice?:number|null;inventory?:number};
export type EdCatalog={products:EdEntity[];categories:EdEntity[];articles:EdEntity[];pages:EdEntity[]};
export function resolveTarget(target:Destination,catalog:EdCatalog):string{
 switch(target.kind){
  case "home":return "/";
  case "products":return "/products";
  case "category":{const v=catalog.categories.find(x=>x.id===target.id||x.slug===target.id);return v?"/category/"+encodeURIComponent(v.slug):"/products";}
  case "product":{const v=catalog.products.find(x=>x.id===target.id);return v?"/product/"+encodeURIComponent(v.slug):"/products";}
  case "article":{const v=catalog.articles.find(x=>x.id===target.id);return v?"/blog/"+encodeURIComponent(v.slug):"/blog";}
  case "page":{if(target.id==="blog")return "/blog";if(target.id==="cart")return "/cart";if(target.id==="account")return "/account";const v=catalog.pages.find(x=>x.id===target.id||x.slug===target.id);return v?"/info/"+encodeURIComponent(v.slug):"/info/about";}
  case "external":return target.url?.startsWith("https://")?target.url:"#";
  default:return "#";
 }
}
export function editionTwoTitleFor(kind:string){return ({hero:"هیرو",categories:"دسته‌بندی‌ها",featured:"پرفروش‌ترین‌ها",campaign:"بنر کیف",festival:"جشنواره تخفیف‌ها",story:"بنر کفش",chapters:"بنرهای پایین",journal:"مقالات",benefits:"مزایا",footer:"فوتر و منو"} as Record<string,string>)[kind]||kind;}
