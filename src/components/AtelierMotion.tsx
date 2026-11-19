"use client";
import { useEffect } from "react";
export function AtelierMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    let stopped = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (stopped) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(".atelier-hero-image", { scale: 1.055 }, { scale: 1, duration: 2.35, ease: "power2.out" });
        gsap.fromTo(".atelier-hero-copy>*",
          { autoAlpha: 0, y: 44, filter: "blur(9px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.13, ease: "power3.out", stagger: 0.15, delay: 0.12, clearProps: "filter" });
        gsap.utils.toArray<HTMLElement>(".atelier-home [data-cine-reveal]").forEach(el => {
          if (el.closest(".atelier-hero")) return;
          gsap.fromTo(el, { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out", clearProps: "transform,opacity,visibility",
              scrollTrigger: { trigger: el, start: "top 93%", once: true } });
        });
        gsap.utils.toArray<HTMLElement>(".atelier-home [data-cine-photo]").forEach(el => {
          if (el.closest(".atelier-hero")) return;
          const img = el.querySelector("img");
          if (!img) return;
          gsap.fromTo(img, { scale: 1.07 },
            { scale: 1, duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 93%", once: true } });
        });
        gsap.utils.toArray<HTMLElement>(".atelier-home .atelier-tile-photo").forEach(el => {
          gsap.fromTo(el, { clipPath: "inset(0% 0% 13% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true } });
        });
        if (document.querySelector(".atelier-hero-image"))
          gsap.to(".atelier-hero-image", { yPercent: 5, ease: "none",
            scrollTrigger: { trigger: ".atelier-hero", start: "top top", end: "bottom top", scrub: 1.8 } });
      });
    }).catch(() => { /* Content stays readable when animation is unavailable. */ });
    return () => { stopped = true; ctx?.revert(); };
  }, []);
  return null;
}
