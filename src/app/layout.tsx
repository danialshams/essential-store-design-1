import type {Metadata,Viewport} from "next";
import {ShopProvider} from "@/components/ShopProvider";
import {Header} from "@/components/Header";
import {BottomNav} from "@/components/BottomNav";
import {Footer} from "@/components/Footer";
import "./globals.css";
export const metadata:Metadata={title:{default:"دایرا استور | فروشگاهی ساده، سریع و حرفه‌ای",template:"%s | دایرا استور"},description:"خرید آنلاین پوشاک، کیف، کفش و اکسسوری در فروشگاه نمونه دایرا استور. قالب اقتصادی شماره یک.",robots:{index:false,follow:false}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#ffffff"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><ShopProvider><Header/><main id="main-content">{children}</main><Footer/><BottomNav/></ShopProvider></body></html>}
