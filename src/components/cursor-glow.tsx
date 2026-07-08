"use client";

import { useEffect, useRef } from "react";

/**
 * Warm ambient glow that trails the cursor with a soft lag. Activates only
 * while the pointer is over the nearest ancestor tagged
 * `data-cursor-glow-root`. Skipped for touch input and prefers-reduced-motion.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!canHover || reducedMotion) return;

    const root = glow.closest<HTMLElement>("[data-cursor-glow-root]");
    if (!root) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const applyTransform = () => {
      glow.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
    };

    const setFromEvent = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };

    const loop = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      applyTransform();
      raf = requestAnimationFrame(loop);
    };

    const handleEnter = (e: PointerEvent) => {
      setFromEvent(e);
      current.x = target.x;
      current.y = target.y;
      applyTransform();
      glow.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const handleMove = (e: PointerEvent) => setFromEvent(e);
    const handleLeave = () => {
      glow.style.opacity = "0";
      cancelAnimationFrame(raf);
      raf = 0;
    };

    root.addEventListener("pointerenter", handleEnter);
    root.addEventListener("pointermove", handleMove);
    root.addEventListener("pointerleave", handleLeave);

    return () => {
      root.removeEventListener("pointerenter", handleEnter);
      root.removeEventListener("pointermove", handleMove);
      root.removeEventListener("pointerleave", handleLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[38rem] w-[38rem] rounded-full opacity-0 blur-[110px] transition-opacity duration-500 ease-out"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 45%, transparent) 0%, color-mix(in srgb, var(--color-accent) 16%, transparent) 38%, transparent 70%)",
        }}
      />
    </div>
  );
}
