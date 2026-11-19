"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { GrabfoldBook, type GrabfoldBookHandle } from "grabfold/react";
import { webglFold } from "grabfold/webgl";

/** Persist the intro across route transitions, but do not block the visitor if WebGL fails. */
let played = false;
type Phase = "letters" | "line" | "turn" | "done";
const TITLE = "DAIRA STORE";

export function AtelierIntro() {
  const [phase, setPhase] = useState<Phase>("letters");
  const [ratio, setRatio] = useState(16 / 9);
  const [texture, setTexture] = useState<HTMLCanvasElement | null>(null);
  const book = useRef<GrabfoldBookHandle>(null);
  const started = useRef(false);
  const previousOverflow = useRef("");
  const finish = () => { played = true; document.body.style.overflow = previousOverflow.current; setPhase("done"); };
  const renderer = useMemo(
    () => texture ? webglFold({ texture: () => texture, radius: 0.17, segments: 64, cache: 2 }) : null,
    [texture],
  );

  useEffect(() => {
    if (played || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      played = true;
      setPhase("done");
      return;
    }
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setRatio(window.innerWidth / window.innerHeight);

    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = 900;
    const ctx = c.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 1600, 900);
      gradient.addColorStop(0, "#173b59");
      gradient.addColorStop(0.57, "#071827");
      gradient.addColorStop(1, "#040c18");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    setTexture(c);

    const a = window.setTimeout(() => setPhase("line"), 1120);
    const b = window.setTimeout(() => setPhase("turn"), 1860);
    const failsafe = window.setTimeout(() => {
      played = true;
      setPhase("done");
      document.body.style.overflow = previousOverflow.current;
    }, 5500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(failsafe);
      document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  useEffect(() => {
    if (phase !== "turn" || started.current) return;
    started.current = true;
    const root = document.querySelector<HTMLElement>(".atelier-grabfold .grabfold");
    if (!root) {
      window.setTimeout(() => finish(), 900);
      return;
    }
    const rect = root.getBoundingClientRect();
    const startX = rect.left + Math.max(7, Math.round(rect.width * .012));
    const startY = rect.top + Math.max(8, rect.height * 0.018);
    const mobilePointer = window.matchMedia("(pointer: coarse)").matches ? "touch" : "mouse";
    let frame = 0;
    let active = true;
    const dispatch = (type: string, x: number, y: number, buttons: number) => {
      root.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 173, pointerType: mobilePointer, isPrimary: true,
        button: 0, buttons, clientX: x, clientY: y,
      }));
    };
    // Grabfold right binding maps the visual left edge to the free paper corner.
    // Moving the held corner right and down produces a diagonal curl and reveals the actual hero beneath it.
    dispatch("pointerdown", startX, startY, 1);
    // Grabfold's synthetic pointer capture is unreliable in mobile emulation.
    // If no corner drag becomes active, use its supported WebGL turn API,
    // keeping a real curved sheet instead of a broken/static loader.
    const mobileFallback = window.setTimeout(() => {
      if (root.dataset.dragging !== "true" && root.dataset.turning !== "true" && book.current?.canNext()) {
        root.dataset.atelierFallback = "webgl";
        void book.current.next().catch(() => {});
      }
    }, 540);
    const start = performance.now();
    const duration = 1700;
    const animate = (now: number) => {
      if (!active) return;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = t * t * (3 - 2 * t);
      const x = startX + rect.width * 0.99 * eased;
      // Keep horizontal displacement greater than vertical from the FIRST frames:\n      // Grabfold otherwise interprets a tall phone\u0027s motion as scrolling, not turning.\n      const y = startY + Math.min(rect.height * 0.35, rect.width * 0.25) * Math.sin(Math.PI * eased * 0.83);
      dispatch("pointermove", x, y, 1);
      if (t < 1) {
        frame = requestAnimationFrame(animate);
        return;
      }
      dispatch("pointerup", x, y, 0);
      // If a particular device cannot support Grabfold's WebGL renderer,
      // do not leave the page frozen behind the loader.
      window.setTimeout(() => finish(), 350);
    };
    frame = requestAnimationFrame(animate);
    return () => { active = false; clearTimeout(mobileFallback); cancelAnimationFrame(frame); };
  }, [phase]);

  if (phase === "done") return null;
  return <div className={"atelier-intro atelier-intro--" + phase} aria-hidden="true" role="presentation">
    <div className="atelier-intro-paper">
      {renderer && <GrabfoldBook
        ref={book}
        className="atelier-grabfold"
        sheets={2}
        covers="none"
        binding="right"
        layout="single"
        fit="contain"
        pageRatio={ratio}
        defaultPosition={-1}
        duration={1700}
        thickness={0}
        center={false}
        gestures={true}
        peek={false}
        flick={false}
        keyboard={false}
        shadow={0.65}
        lift={20}
        gutter={0}
        foldRenderer={renderer}
        renderPage={(page) => <div className={page.kind === "front" && page.sheet === 0 ? "atelier-book-sheet" : "atelier-reveal-sheet"} />}
      />}
    </div>
    <div className="atelier-intro-copy">
      <div className="atelier-intro-title" dir="ltr">{[...TITLE].map((letter, index) =>
        <span key={index} style={{ animationDelay: (TITLE.length - 1 - index) * 72 + "ms" }}>
          {letter === " " ? "\u00a0" : letter}
        </span>
      )}</div>
      <span className="atelier-intro-caption">THE ART OF SELECTING</span>
      <i className="atelier-intro-rule" />
    </div>
  </div>;
}
