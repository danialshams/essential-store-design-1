import {NextResponse} from "next/server";
import {demoProducts,remoteCatalog} from "@/lib/catalog";
export const revalidate=60;
/** Public, read-only product catalog. Checkout API is deliberately not emulated here. */
export async function GET(){const live=await remoteCatalog();return NextResponse.json({products:live??demoProducts,demo:live===null},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=180"}})}
