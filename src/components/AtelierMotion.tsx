"use client";
import {useEffect} from "react";

/** Gallery choreography — the masks reveal exactly framed media; images themselves never outgrow the frame. */
export function AtelierMotion(){
  useEffect(()=>{
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced)return;
    let cancelled=false;
    let context:{revert:()=>void}|undefined;
    let started=false;
    const reveal=async()=>{
      if(started||cancelled)return;
      started=true;
      try{
        const [{gsap},{ScrollTrigger}]=await Promise.all([import("gsap"),import("gsap/ScrollTrigger")]);
        if(cancelled)return;
        gsap.registerPlugin(ScrollTrigger);
        context=gsap.context(()=>{
          const hero=document.querySelector<HTMLElement>(".atelier-hero-photo");
          const heroCopy=document.querySelector<HTMLElement>(".atelier-hero-copy");
          if(hero){
            gsap.fromTo(hero,{clipPath:"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:1.65,ease:"power3.inOut",clearProps:"clipPath"});
          }
          if(heroCopy){
            const elements=heroCopy.querySelectorAll(":scope > *");
            gsap.fromTo(elements,{opacity:0,y:24,filter:"blur(9px)"},{opacity:1,y:0,filter:"blur(0px)",duration:1.05,ease:"power3.out",stagger:.13,delay:.45,clearProps:"opacity,transform,filter"});
          }
          const media=gsap.utils.toArray<HTMLElement>(".atelier-home .atelier-campaign-art,.atelier-home .atelier-tile-photo,.atelier-home .atelier-new-editorial");
          const masks=["inset(50% 50% 50% 50%)","inset(0% 100% 0% 0%)","inset(100% 0% 0% 0%)","inset(0% 0% 0% 100%)","polygon(0 0, 0 0, 0 0, 0 0)"];
          media.forEach((el,index)=>{
            const init=masks[index%masks.length];
            const end=init.startsWith("polygon")?"polygon(0 0, 100% 0, 100% 100%, 0 100%)":"inset(0% 0% 0% 0%)";
            gsap.fromTo(el,{clipPath:init},{clipPath:end,duration:1.15,ease:"power3.inOut",clearProps:"clipPath",scrollTrigger:{trigger:el,start:"top 91%",once:true}});
          });
          const titleGroups=gsap.utils.toArray<HTMLElement>(".atelier-section-head,.atelier-gallery-head,.atelier-section-tag,.atelier-campaign-copy");
          titleGroups.forEach((el)=>{
            const targets=el.matches(".atelier-section-head,.atelier-campaign-copy")?el.querySelectorAll("h1,h2,h3,p,.atelier-overline,a"):el.querySelectorAll("h3,span,a");
            if(!targets.length)return;
            gsap.fromTo(targets,{opacity:0,y:23,filter:"blur(7px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.83,ease:"power3.out",stagger:.11,clearProps:"all",scrollTrigger:{trigger:el,start:"top 89%",once:true}});
          });
          ScrollTrigger.refresh();
        });
      }catch{
        // The content stays visible and interactive without animation.
      }
    };
    if(!document.querySelector(".atelier-intro"))void reveal();
    window.addEventListener("atelier:intro-complete",reveal,{once:true});
    // Failsafe for a loader that completes via CSS rather than the custom event.
    const safety=window.setTimeout(()=>{if(!started)void reveal()},5700);
    return()=>{cancelled=true;window.clearTimeout(safety);window.removeEventListener("atelier:intro-complete",reveal);context?.revert()};
  },[]);
  return null;
}
