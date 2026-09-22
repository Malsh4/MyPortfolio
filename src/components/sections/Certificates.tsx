"use client";

import { useEffect, useRef, useState } from "react";
import Section, { SectionHeading } from "../ui/Section";
import { HudButton } from "../ui/HudButton";
import { IconArrow, IconCap, IconShield } from "../ui/Icons";
import { certificates } from "@/data/content";
import { sound } from "@/lib/sound";

export default function Certificates() {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const total = certificates.length;

  const step = () => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
  };

  const sync = () => {
    const el = track.current;
    if (!el) return;
    const s = step();
    setIndex(s ? Math.min(total - 1, Math.round(el.scrollLeft / s)) : 0);
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (dir: 1 | -1) => {
    sound.click();
    track.current?.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  return (
    <Section id="certificates" label="Certificates" className="overflow-hidden py-28 lg:py-40">
      {/* oversized background word */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-16 select-none whitespace-nowrap font-display text-[18vw] font-black uppercase leading-none text-white/[0.025] lg:top-24"
      >
        Credentials · Learning
      </p>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-10 lg:px-16">
        <SectionHeading code="04" title="Certificates" kicker="Always learning — most recently going deep on applied AI for research, content, and building apps." />

        <div data-reveal className="mb-8 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous certificates"
              onClick={() => go(-1)}
              disabled={edges.start}
              className="flex h-12 w-12 items-center justify-center border border-[var(--accent)]/40 bg-void/60 text-[var(--accent)] transition-all hud-cut hover:bg-[var(--accent)]/15 disabled:opacity-30"
            >
              <IconArrow dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next certificates"
              onClick={() => go(1)}
              disabled={edges.end}
              className="flex h-12 w-12 items-center justify-center border border-[var(--accent)]/40 bg-void/60 text-[var(--accent)] transition-all hud-cut hover:bg-[var(--accent)]/15 disabled:opacity-30"
            >
              <IconArrow />
            </button>
          </div>
          <HudButton href="/certificates" tag="CERTS">
            VIEW ALL &gt;
          </HudButton>
        </div>

        {/* Three cards per row on desktop, two on tablets, one on phones — contained to the content width. */}
        <ul
          ref={track}
          onScroll={sync}
          data-reveal
          className="flex snap-x snap-mandatory gap-8 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {certificates.map((c) => (
            <li
              key={c.title}
              onMouseEnter={() => sound.cardHover()}
              className="hud-panel hud-hover group flex min-h-64 shrink-0 basis-full snap-start flex-col p-6 sm:basis-[calc((100%-2rem)/2)] lg:basis-[calc((100%-4rem)/3)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]">
                    <IconCap />
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">
                    <IconShield /> {c.category.toUpperCase()}
                  </span>
                </div>
                <span className="border-b border-r border-[var(--accent)]/60 px-2.5 py-1 font-mono text-[11px] text-text/85">{c.date}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold leading-snug text-text">{c.title}</h3>
              <div className="mt-auto border-t border-white/10 pt-4">
                <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--accent)]">ISSUED BY</p>
                <p className="mt-1.5 text-sm text-text/85">{c.issuer}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3" aria-live="polite">
          <p className="font-display text-2xl font-black text-text/30">
            <span className="text-[var(--accent)] glow-text">{String(index + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-base">/</span>
            <span className="text-base">{String(total).padStart(2, "0")}</span>
          </p>
          <span className="relative h-px w-24 bg-white/15">
            <span
              className="absolute inset-y-0 left-0 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </span>
        </div>
      </div>
    </Section>
  );
}
