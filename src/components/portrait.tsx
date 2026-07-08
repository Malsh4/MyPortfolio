"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Centered portrait layer that overlaps the name typography.
 *
 * Drop a transparent-background cutout at `public/portrait.png` and it appears
 * automatically. Until then (or if the file is missing) it hides itself so the
 * hero never shows a broken image.
 */
export function Portrait() {
  const [available, setAvailable] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const el = wrapRef.current;
    if (!el) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 18;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!available) return null;

  return (
    <div
      aria-hidden
      className="animate-rise pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center"
      style={{ animationDelay: "320ms" }}
    >
      <div
        ref={wrapRef}
        className="relative h-[78vh] max-h-[860px] w-full max-w-[640px] transition-transform duration-300 ease-out will-change-transform"
      >
        <Image
          src="/portrait.png"
          alt="Portrait of Amandi De Silva"
          fill
          priority
          sizes="(max-width: 768px) 90vw, 640px"
          className="object-contain object-bottom"
          onError={() => setAvailable(false)}
        />
      </div>
    </div>
  );
}
