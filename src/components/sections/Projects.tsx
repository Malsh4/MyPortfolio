"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Section, { SectionHeading } from "../ui/Section";
import { HoldButton } from "../ui/HudButton";
import ProjectCover from "../ui/ProjectCover";
import { projects } from "@/data/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";

export default function Projects() {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const entered = useApp((s) => s.entered);

  // Desktop: vertical scroll drives a pinned horizontal track. Mobile: native swipe.
  useGSAP(
    () => {
      if (!entered) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth + 64;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setIndex(Math.min(projects.length - 1, Math.round(self.progress * (projects.length - 1)))),
          },
        });
      });
      return () => mm.revert();
    },
    { dependencies: [entered] },
  );

  const onSwipe = (e: React.UIEvent<HTMLUListElement>) => {
    if (window.innerWidth >= 1024) return;
    const el = e.currentTarget;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    setIndex(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
  };

  return (
    <Section id="projects" label="Projects" className="py-28 lg:py-0">
      <div ref={pin} className="lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-6 px-5 sm:px-10 lg:px-16">
          <SectionHeading code="03" title="Projects" kicker="Selected work across fintech, mobility, marketplaces and immersive 3D. Hold to open a case study." />
          <p className="mb-14 font-display text-3xl font-black text-text/30" aria-live="polite">
            <span className="text-[var(--accent)] glow-text">{String(index + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")}
          </p>
        </div>

        <ul
          ref={track}
          onScroll={onSwipe}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] sm:px-10 lg:w-max lg:snap-none lg:gap-6 lg:overflow-visible lg:px-16 lg:pb-0"
        >
          {projects.map((p, i) => (
            <li
              key={p.slug}
              className="hud-panel group flex w-[84vw] max-w-[420px] shrink-0 snap-center flex-col sm:w-[380px] lg:w-[400px]"
              style={{ "--accent": p.color } as React.CSSProperties}
            >
              <div className="relative h-48 overflow-hidden sm:h-52">
                <ProjectCover project={p} className="transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between font-mono text-[10px] tracking-[0.2em]">
                  <span className="border border-white/20 bg-void/70 px-2 py-1 text-text/80">{`[${String(i + 1).padStart(2, "0")}]`}</span>
                  <span className="flex items-center gap-1.5 border border-[var(--accent)]/40 bg-void/70 px-2 py-1 text-[var(--accent)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]" />
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="font-mono text-[10px] tracking-[0.25em] text-dim">{`${p.category.toUpperCase()} · ${p.period.toUpperCase()}`}</p>
                <h3 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-text">
                  <Link href={`/projects/${p.slug}`} className="transition-colors hover:text-[var(--accent)]">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm font-medium text-[var(--accent)]">{p.subtitle}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text/70">{p.summary}</p>
                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">{p.role.toUpperCase()}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 3).map((t) => (
                        <li key={t} className="border border-white/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-dim">
                          {t.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <HoldButton href={`/projects/${p.slug}`} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
