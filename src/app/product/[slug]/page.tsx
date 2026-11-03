import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {demoProducts,getProductBySlug} from "@/lib/catalog";
import {ProductDetails} from "@/components/ProductDetails";
export function generateStaticParams(){return demoProducts.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const product=getProductBySlug(slug);return {title:product?.name||"محصول",description:product?.description}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const product=getProductBySlug(slug);if(!product)notFound();return <ProductDetails product={product}/>}
