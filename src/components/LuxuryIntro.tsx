"use client";
import {useEffect,useState} from "react";

let playedOnce=false;
/** Actual two-leaf 3D paper fold with illuminated crease, not a fade-out overlay. */
export function LuxuryIntro({label}:{label:string}){
 const [phase,setPhase]=useState<"intro"|"line"|"fold"|"done">("intro");
 useEffect(()=>{
  if(playedOnce||window.matchMedia("(prefers-reduced-motion: reduce)").matches){
   playedOnce=true;setPhase("done");return;
  }
  const original=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const a=window.setTimeout(()=>setPhase("line"),800);
  const b=window.setTimeout(()=>setPhase("fold"),1470);
  const c=window.setTimeout(()=>{playedOnce=true;setPhase("done");document.body.style.overflow=original},2650);
  return()=>{window.clearTimeout(a);window.clearTimeout(b);window.clearTimeout(c);document.body.style.overflow=original};
 },[]);
 if(phase==="done")return null;
 return <div className={`luxury-intro luxury-intro--${phase}`} role="presentation" aria-hidden="true">
   <div className="luxury-intro-perspective">
    <div className="luxury-intro-leaf luxury-intro-leaf--right"/>
    <div className="luxury-intro-leaf luxury-intro-leaf--left"/>
    <div className="luxury-intro-crease"/>
   </div>
   <div className="luxury-intro-content">
     <div className="luxury-intro-name">{label}</div>
     <div className="luxury-intro-rule"><i/></div>
     <span>THE ART OF SELECTION</span>
   </div>
 </div>;
}
