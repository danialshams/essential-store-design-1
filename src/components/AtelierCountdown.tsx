"use client";
import {useEffect,useMemo,useState} from "react";

type Props={endsAt:string;expiredText?:string};
const digits=(value:number)=>Math.max(0,value).toLocaleString("fa-IR",{minimumIntegerDigits:2,useGrouping:false});

/** Each digit has its own stable cell; direction is explicit so RTL layout cannot scramble the timer. */
export function AtelierCountdown({endsAt,expiredText="زمان این جشنواره به پایان رسیده است"}:Props){
  const time=useMemo(()=>Date.parse(endsAt),[endsAt]);
  const [remaining,setRemaining]=useState<number|null>(null);
  useEffect(()=>{
    const update=()=>setRemaining(Number.isFinite(time)?Math.max(0,Math.floor((time-Date.now())/1000)):0);
    update();
    const id=window.setInterval(update,1000);
    return()=>window.clearInterval(id);
  },[time]);
  if(remaining===0)return <p className="atelier-timer-ended" role="status">{expiredText}</p>;
  const d=remaining===null?null:Math.floor(remaining/86400);
  const h=remaining===null?null:Math.floor(remaining%86400/3600);
  const m=remaining===null?null:Math.floor(remaining%3600/60);
  consts=remaining===null?null:remaining%60;
  const groups=[{id:"days",value:d,label:"روز"},{id:"hours",value:h,label:"ساعت"},{id:"minutes",value:m,label:"دقیقه"},{id:"seconds",value:s,label:"ثانیه"}];
  return <div className="atelier-timer" role="timer" aria-label="زمان باقی‌مانده تا پایان جشنواره" aria-live="off">
    <span className="atelier-timer-label">فرصت باقی‌مانده</span>
    <div className="atelier-timer-grid" dir="rtl">
      {groups.map(group=><div className="atelier-timer-unit" key={group.id}>
        <strong className="atelier-timer-digit" dir="ltr" suppressHydrationWarning>{group.value===null?"--":digits(group.value)}</strong>
        <span className="atelier-timer-caption">{group.label}</span>
      </div>)}
    </div>
  </div>;
}
