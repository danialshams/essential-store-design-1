import {notFound} from "next/navigation";
import {Suspense} from "react";
import type {Metadata} from "next";
import {findCategory,categories} from "@/lib/catalog";
import {ProductCollection} from "@/components/ProductCollection";
export function generateStaticParams(){return categories.map(c=>({slug:c.id}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;return {title:findCategory(slug)?.name||"دسته‌بندی"}}
export default async function Category({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!findCategory(slug))notFound();return <Suspense fallback={<div className="container page-loading">در حال بارگذاری...</div>}><ProductCollection category={slug}/></Suspense>}
