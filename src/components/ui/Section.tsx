"use client";

import { useRef, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { sectionAccent, type SectionId } from "@/data/content";

/**
 * Scroll-in animations for everything inside `scope`, started once the visitor has entered:
 * data-reveal (fade up, optional data-delay), data-split (per-character heading reveal), data-scramble (HUD text).
 */
export function useReveal(scope: RefObject<HTMLElement | null>, extra?: () => void) {
  const entered = useApp((s) => s.entered);
  useGSAP(
    () => {
      if (!entered || !scope.current) return;
      const el = scope.current;
      extra?.();

      el.querySelectorAll<HTMLElement>("[data-split]").forEach((h) => {
        const split = SplitText.create(h, { type: "chars,lines", mask: "lines" });
        gsap.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.025,
          scrollTrigger: { trigger: h, start: "top 88%" },
        });
      });

      el.querySelectorAll<HTMLElement>("[data-scramble]").forEach((s) => {
        gsap.to(s, {
          duration: 1.2,
          scrambleText: { text: s.textContent ?? "", chars: "01<>/_#", speed: 0.5 },
          scrollTrigger: { trigger: s, start: "top 92%" },
        });
      });

      el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((r) => {
        gsap.from(r, {
          y: 50,
          opacity: 0,
          filter: "blur(6px)",
          duration: 1,
          ease: "power3.out",
          delay: Number(r.dataset.delay ?? 0),
          scrollTrigger: { trigger: r, start: "top 90%" },
        });
      });
    },
    { scope, dependencies: [entered] },
  );
}

/** Home page section: reports itself as active while it crosses the viewport centre, and animates its children in. */
export default function Section({
  id,
  className = "",
  children,
  label,
}: {
  id: SectionId;
  className?: string;
  children: React.ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useReveal(ref, () => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => self.isActive && useApp.getState().setActiveSection(id),
    });
  });

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className={`relative ${className}`}
      style={{ "--accent": sectionAccent[id] } as React.CSSProperties}
    >
      {children}
    </section>
  );
}

export function SectionHeading({ code, title, kicker }: { code: string; title: string; kicker?: string }) {
  return (
    <header className="mb-10 sm:mb-14">
      <p className="hud-label mb-4 flex items-center gap-3">
        <span className="inline-block h-px w-10 bg-[var(--accent)]" />
        <span data-scramble>{`SEC_${code} // ${title.toUpperCase()}`}</span>
      </p>
      <h2 data-split className="font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-text sm:text-7xl lg:text-8xl">
        {title}
      </h2>
      <div className="mt-3 h-[3px] w-32 bg-gradient-to-r from-[var(--accent)] to-transparent shadow-[0_0_12px_var(--accent)]" />
      {kicker && (
        <p data-reveal className="mt-6 max-w-xl text-lg text-dim">
          {kicker}
        </p>
      )}
    </header>
  );
}
