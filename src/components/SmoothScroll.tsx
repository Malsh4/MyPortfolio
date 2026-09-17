"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/scroll";
import { useApp } from "@/lib/store";

export default function SmoothScroll() {
  const entered = useApp((s) => s.entered);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: reduced ? 0 : 1.25,
      smoothWheel: !reduced,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
    });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Keep the page locked behind the loader until the visitor enters.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (entered) {
      lenis.start();
      document.documentElement.style.overflow = "";
    } else {
      lenis.stop();
      document.documentElement.style.overflow = "hidden";
    }
  }, [entered]);

  return null;
}
