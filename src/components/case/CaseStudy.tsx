"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReveal } from "../ui/Section";
import { HoldButton } from "../ui/HudButton";
import ProjectCover from "../ui/ProjectCover";
import { projects } from "@/data/content";
import { asset } from "@/lib/asset";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToTop } from "@/lib/scroll";
import { useApp } from "@/lib/store";

export default function CaseStudy({ slug }: { slug: string }) {
  const ref = useRef<HTMLElement>(null);
  const index = projects.findIndex((p) => p.slug === slug);
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];

  useEffect(() => {
    scrollToTop(true);
    useApp.getState().setCaseAccent(p.color);
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => {
      clearTimeout(t);
      useApp.getState().setCaseAccent(null);
    };
  }, [p.color]);

  useReveal(ref);

  const meta = [
    { k: "ROLE", v: p.role },
    { k: "TIMELINE", v: p.period },
    { k: "PLATFORM", v: p.platform },
    { k: "STATUS", v: p.status },
  ];

  return (
    <article ref={ref} className="relative" style={{ "--accent": p.color } as React.CSSProperties}>
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-void/60 via-void/80 to-void/95" aria-hidden="true" />

      {/* hero */}
      <header className="relative px-5 pb-16 pt-32 sm:px-10 lg:px-16 lg:pt-40">
        <div className="mx-auto max-w-7xl">
          <Link href="/#projects" className="font-mono text-[11px] tracking-[0.3em] text-dim transition-colors hover:text-[var(--accent)]">
            ← BACK TO PROJECTS
          </Link>
          <p className="hud-label mt-10 flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-[var(--accent)]" />
            <span data-scramble>{`CASE_STUDY // ${String(index + 1).padStart(2, "0")} · ${p.category.toUpperCase()}`}</span>
          </p>
          <h1 data-split className="mt-5 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-text sm:text-7xl lg:text-8xl">
            {p.title}
          </h1>
          <p data-reveal className="mt-4 font-display text-xl font-bold text-[var(--accent)] glow-text sm:text-2xl">
            {p.subtitle}
          </p>
          <dl data-reveal className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
            {meta.map((m) => (
              <div key={m.k} className="bg-void/80 p-5 backdrop-blur-md">
                <dt className="font-mono text-[10px] tracking-[0.3em] text-dim">{m.k}</dt>
                <dd className="mt-2 text-sm text-text">{m.v}</dd>
              </div>
            ))}
          </dl>
          <div data-reveal className="hud-panel mt-6 h-64 sm:h-96">
            <ProjectCover project={p} />
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl space-y-24 px-5 pb-24 sm:px-10 lg:px-16">
        {/* overview */}
        <section aria-labelledby="overview" className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="overview" data-reveal className="hud-label text-sm">
            01 // OVERVIEW
          </h2>
          <div className="space-y-6">
            <p data-reveal className="font-display text-2xl font-bold leading-snug text-text sm:text-3xl">
              {p.summary}
            </p>
            <div data-reveal className="hud-panel p-6 sm:p-8">
              <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--accent)]">THE CHALLENGE</p>
              <p className="mt-3 leading-relaxed text-text/80">{p.challenge}</p>
            </div>
          </div>
        </section>

        {/* goals */}
        <section aria-labelledby="goals" className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="goals" data-reveal className="hud-label text-sm">
            02 // GOALS
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {p.goals.map((g, i) => (
              <li key={g} data-reveal data-delay={String(i * 0.06)} className="flex gap-4 border border-white/10 bg-void/60 p-5 backdrop-blur-sm">
                <span className="font-display text-sm font-black text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-text/85">{g}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* process */}
        <section aria-labelledby="process">
          <h2 id="process" data-reveal className="hud-label mb-10 text-sm">
            03 // PROCESS
          </h2>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {p.process.map((s, i) => (
              <li key={s.title} data-reveal data-delay={String(i * 0.08)} className="hud-panel relative p-6">
                <span className="font-mono text-[10px] tracking-[0.3em] text-dim">{`PHASE_${String(i + 1).padStart(2, "0")}`}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-[var(--accent)]">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* features */}
        <section aria-labelledby="features" className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="features" data-reveal className="hud-label text-sm">
            04 // KEY FEATURES
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {p.features.map((f) => (
              <li key={f.title} data-reveal className="border-l-2 border-[var(--accent)] bg-void/60 py-4 pl-5 pr-4 backdrop-blur-sm">
                <h3 className="font-display text-base font-bold text-text">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text/70">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {p.gallery && p.gallery.length > 0 && (
          <section aria-label="Screens" className="grid gap-4 sm:grid-cols-2">
            {p.gallery.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} data-reveal src={asset(src)} alt={`${p.title} screen`} loading="lazy" className="w-full border border-white/10" />
            ))}
          </section>
        )}

        {/* stack + outcome */}
        <section aria-labelledby="outcome" className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="outcome" data-reveal className="hud-label text-sm">
            05 // STACK &amp; OUTCOME
          </h2>
          <div className="space-y-8">
            <ul data-reveal className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <li key={t} className="border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 font-mono text-xs tracking-wide text-text">
                  {t}
                </li>
              ))}
            </ul>
            <p data-reveal className="font-display text-xl font-bold leading-snug text-text sm:text-2xl">
              {p.outcome}
            </p>
          </div>
        </section>

        {/* next */}
        <section aria-label="Next project" data-reveal className="hud-panel flex flex-wrap items-center justify-between gap-6 p-6 sm:p-10" style={{ "--accent": next.color } as React.CSSProperties}>
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-dim">NEXT_CASE_STUDY</p>
            <Link href={`/projects/${next.slug}`} className="mt-2 block font-display text-3xl font-black uppercase text-text transition-colors hover:text-[var(--accent)] sm:text-5xl">
              {next.title}
            </Link>
            <p className="mt-1 text-[var(--accent)]">{next.subtitle}</p>
          </div>
          <HoldButton href={`/projects/${next.slug}`} size={84} />
        </section>
      </div>
    </article>
  );
}
