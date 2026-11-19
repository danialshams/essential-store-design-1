"use client";
import {useEffect} from "react";
export function LuxuryMotion(){
 useEffect(()=>{
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let ctx: {revert:()=>void}|undefined;
  let cancelled=false;
  import("gsap").then(async({gsap})=>{
   const {ScrollTrigger}=await import("gsap/ScrollTrigger");
   if(cancelled)return;
   gsap.registerPlugin(ScrollTrigger);
   ctx=gsap.context(()=>{
    gsap.utils.toArray<HTMLElement>(".luxury-home [data-lux-reveal]").forEach(el=>{
     gsap.fromTo(el,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:0.95,ease:"power3.out",clearProps:"transform,opacity,visibility",scrollTrigger:{trigger:el,start:"top 91%",once:true}});
    });
    gsap.utils.toArray<HTMLElement>(".luxury-home [data-lux-photo]").forEach(el=>{
     gsap.fromTo(el,{scale:1.07},{scale:1,duration:1.4,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 95%",once:true}});
    });
   });
  }).catch(()=>{ /* Preserve SSR visibility if JS animation imports fail. */ });
  return()=>{cancelled=true;ctx?.revert()};
 },[]);
 return null;
}
