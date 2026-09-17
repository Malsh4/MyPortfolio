"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { scrollToId, scrollToTop } from "@/lib/scroll";

/** On the home page: honour /#section links (e.g. coming back from a case study) once the visitor has entered. */
export default function HashScroll() {
  const entered = useApp((s) => s.entered);
  useEffect(() => {
    if (!entered) return;
    const id = window.location.hash.slice(1);
    const jump = () => {
      ScrollTrigger.refresh();
      if (id) scrollToId(id, true);
      else scrollToTop(true);
    };
    // Second pass corrects for pin spacers and reveal layouts that settle after the first frame.
    const timers = [setTimeout(jump, 120), setTimeout(jump, 700)];
    return () => timers.forEach(clearTimeout);
  }, [entered]);
  return null;
}
