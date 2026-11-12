import type {Metadata,Viewport} from "next";
import {StoreChrome} from "@/components/StoreChrome";
import {loadStore} from "@/lib/live-store";
import "./globals.css";
import "./festival.css";
import "./visual-upgrade.css";
import "./product-theme-polish.css";
export async function generateMetadata():Promise<Metadata>{const store=await loadStore();return {title:{default:store.settings.seoTitle||store.settings.storeName,template:`%s | ${store.settings.storeName}`},description:store.settings.seoDescription||store.settings.description,robots:{index:store.live,follow:store.live}};}
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#ffffff"};
export const dynamic="force-dynamic";
export default async function RootLayout({children}:{children:React.ReactNode}){const store=await loadStore();return <html lang="fa" dir="rtl"><body><StoreChrome store={store}>{children}</StoreChrome></body></html>}
