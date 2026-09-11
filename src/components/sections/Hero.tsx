"use client";

import Section from "../ui/Section";
import { HudButton } from "../ui/HudButton";
import { profile } from "@/data/content";
import { asset } from "@/lib/asset";
import { scrollToId } from "@/lib/scroll";
import { sound } from "@/lib/sound";

function OrbitBadge() {
  return (
    <button
      type="button"
      data-cursor="VIEW"
      aria-label="Scroll to projects"
      onClick={() => {
        sound.whoosh();
        scrollToId("projects");
      }}
      className="group relative h-32 w-32 shrink-0 sm:h-36 sm:w-36"
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="orbit" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-text font-mono text-[15px] tracking-[0.32em]">
          <textPath href="#orbit">• EXPLORE MY WORK • VIEW CASE STUDIES </textPath>
        </text>
      </svg>
      <span className="absolute inset-[30%] flex items-center justify-center rounded-full border border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)] transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:text-void">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
    </button>
  );
}

export default function Hero() {
  return (
    <Section id="hero" label="Introduction" className="flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 sm:px-10 lg:px-16">
      {profile.heroImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50 [mask-image:linear-gradient(to_left,black_30%,transparent_85%)]"
          style={{ backgroundImage: `url(${asset(profile.heroImage)})` }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/85 via-void/35 to-transparent" aria-hidden="true" />

      <div className="relative max-w-5xl">
        <p className="hud-label mb-6 flex items-center gap-3">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          <span data-scramble>PORTFOLIO_2026 // BATTARAMULLA, LK</span>
        </p>

        <p data-reveal className="mb-3 font-mono text-sm tracking-[0.3em] text-dim">
          HI, I&apos;M <span className="text-text">{profile.name.toUpperCase()}</span>
        </p>

        <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight">
          <span data-split className="block text-[11vw] text-text sm:text-[7vw] xl:text-[6.2rem]">
            Designing
          </span>
          <span data-split className="block text-[11vw] text-[var(--accent)] glow-text sm:text-[7vw] xl:text-[6.2rem]">
            Human-first
          </span>
          <span data-split className="block text-[11vw] text-outline sm:whitespace-nowrap sm:text-[7vw] xl:text-[6.2rem]">
            Digital worlds
          </span>
        </h1>

        <p data-reveal data-delay="0.3" className="mt-8 max-w-xl text-base leading-relaxed text-text/80 sm:text-lg">
          UI/UX engineer &amp; creative frontend developer crafting intuitive, accessible, and immersive experiences —
          from user research and Figma prototypes to React, Next.js, and WebGL.
        </p>

        <div data-reveal data-delay="0.45" className="mt-9 flex flex-wrap items-center gap-4">
          <HudButton href={`mailto:${profile.email}`} tag="MAIL">
            HIRE ME
          </HudButton>
          <HudButton href={asset(profile.resume)} external tag="PDF" variant="ghost">
            RESUME
          </HudButton>
        </div>
      </div>

      <div data-reveal data-delay="0.6" className="relative mt-14 flex flex-wrap items-end justify-between gap-8">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 font-mono text-[11px] tracking-[0.2em] sm:flex sm:gap-12">
          <div>
            <dt className="text-dim">BASED IN</dt>
            <dd className="mt-1 text-text">SRI LANKA</dd>
          </div>
          <div>
            <dt className="text-dim">SPECIALIZING IN</dt>
            <dd className="mt-1 text-text">UI/UX + CREATIVE DEV</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-dim">CURRENTLY</dt>
            <dd className="mt-1 text-text">{profile.role.toUpperCase()}</dd>
          </div>
        </dl>
        <div className="flex items-end gap-8">
          <div className="hidden flex-col items-center gap-3 sm:flex">
            <span className="font-mono text-[10px] tracking-[0.3em] text-dim [writing-mode:vertical-rl]">SCROLL</span>
            <span className="relative h-14 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-[var(--accent)]" />
            </span>
          </div>
          <OrbitBadge />
        </div>
      </div>
    </Section>
  );
}
