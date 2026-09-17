"use client";

import Section, { SectionHeading } from "../ui/Section";
import { skillGroups } from "@/data/content";

export default function Skills() {
  const all = skillGroups.flatMap((g) => g.items);
  return (
    <Section id="skills" label="Skills" className="py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <SectionHeading
            code="02"
            title="Skills"
            kicker="Five disciplines, one workflow — from the first user interview to the last line of shader code."
          />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:max-w-[62%]">
          {skillGroups.map((g, i) => (
            <li
              key={g.code}
              data-reveal
              data-delay={String(i * 0.07)}
              className={`hud-panel group p-6 transition-transform duration-500 hover:-translate-y-1 ${i === skillGroups.length - 1 ? "sm:col-span-2" : ""}`}
              style={{ "--accent": g.color } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--accent)]">{`MODULE_${g.code}`}</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-text">{g.title}</h3>
                  <p className="mt-1 text-sm text-dim">{g.blurb}</p>
                </div>
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rotate-45 border border-[var(--accent)]/50 transition-transform duration-700 group-hover:rotate-[225deg]" />
                  <span className="font-display text-[11px] font-bold text-[var(--accent)]">{g.code}</span>
                </span>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="border border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] px-2.5 py-1 font-mono text-[11px] tracking-wide text-text/85 transition-colors group-hover:border-[var(--accent)]/50"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                STATUS: ACTIVE
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-20 overflow-hidden border-y border-white/10 bg-void/50 py-5 backdrop-blur-sm" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...all, ...all].map((s, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-2xl font-bold uppercase text-text/25 sm:text-4xl">
              {s}
              <span className="h-2 w-2 rotate-45 bg-[var(--accent)]/70" />
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
