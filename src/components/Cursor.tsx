"use client";

import { useEffect, useRef } from "react";
import { sound } from "@/lib/sound";

const INTERACTIVE = "a, button, [data-cursor], input, textarea, select, label";

/** Neon cursor: a precise dot plus a trailing ring that grows and glitches over interactive elements. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { ...pos };
    let current: Element | null = null;
    let raf = 0;
    let visible = false;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        trail.x = pos.x;
        trail.y = pos.y;
        dot.current?.style.setProperty("opacity", "1");
        ring.current?.style.setProperty("opacity", "1");
      }
    };

    const over = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.(INTERACTIVE) ?? null;
      if (target === current) return;
      current = target;
      const r = ring.current;
      if (!r) return;
      if (target) {
        r.dataset.active = "true";
        const text = target.getAttribute("data-cursor");
        if (label.current) label.current.textContent = text && text !== "true" ? text : "";
        if (target.getAttribute("data-sound") !== "none") sound.hover();
      } else {
        delete r.dataset.active;
        if (label.current) label.current.textContent = "";
      }
    };

    const down = () => ring.current?.setAttribute("data-down", "true");
    const up = () => ring.current?.removeAttribute("data-down");
    const leave = () => {
      visible = false;
      dot.current?.style.setProperty("opacity", "0");
      ring.current?.style.setProperty("opacity", "0");
    };

    const loop = () => {
      trail.x += (pos.x - trail.x) * 0.18;
      trail.y += (pos.y - trail.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute left-0 top-0 opacity-0" style={{ willChange: "transform" }}>
        <svg width="18" height="22" viewBox="0 0 18 22" className="-translate-x-[2px] -translate-y-[2px] drop-shadow-[0_0_6px_var(--accent)]">
          <path d="M1 1 L16 11.5 L9.5 12.5 L6.5 20 Z" fill="var(--accent)" stroke="#05050a" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        ref={ring}
        className="group absolute left-0 top-0 opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      >
        <div
          className="-translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ease-out
          group-data-[active]:h-16 group-data-[active]:w-16 group-data-[active]:[animation:glitch_0.35s_steps(2)_infinite]
          group-data-[down]:scale-75"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 70%, transparent)", boxShadow: "0 0 18px color-mix(in srgb, var(--accent) 35%, transparent)" }}
        >
          <span ref={label} className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}
