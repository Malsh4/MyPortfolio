"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Section from "../ui/Section";
import { HudButton } from "../ui/HudButton";
import { IconDownload, IconGithub, IconLinkedin, IconMail } from "../ui/Icons";
import { certificates, profile, projects } from "@/data/content";
import { asset } from "@/lib/asset";
import { gsap } from "@/lib/gsap";
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
      className="group relative h-32 w-32 shrink-0 sm:h-40 sm:w-40"
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="orbit" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text className="fill-text font-mono text-[14px] font-medium tracking-[0.3em]">
          <textPath href="#orbit">EXPLORE WORK • CASE STUDIES • PORTFOLIO • </textPath>
        </text>
      </svg>
      <span className="absolute inset-[27%] rounded-full border border-[var(--accent)]/50 shadow-[0_0_24px_-4px_var(--accent)]" />
      <span className="absolute inset-[33%] flex items-center justify-center rounded-full bg-void/80 text-text transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:text-void">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
    </button>
  );
}

/** Portrait that stays in shadow until the cursor's light passes over it. */
function SpotlightPortrait({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const lit = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = scope.current;
    const layer = lit.current;
    const orb = glow.current;
    if (!host || !layer || !orb) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { x: host.clientWidth * 0.68, y: host.clientHeight * 0.32, power: 0 };
    const apply = () => {
      layer.style.setProperty("--mx", `${state.x}px`);
      layer.style.setProperty("--my", `${state.y}px`);
      layer.style.setProperty("--power", String(state.power));
      orb.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
      orb.style.opacity = String(state.power);
    };
    apply();

    const toX = gsap.quickTo(state, "x", { duration: 0.6, ease: "power3.out", onUpdate: apply });
    const toY = gsap.quickTo(state, "y", { duration: 0.6, ease: "power3.out", onUpdate: apply });
    let idle: ReturnType<typeof setTimeout> | undefined;
    const wake = () => {
      gsap.to(state, { power: 1, duration: 0.5, ease: "power2.out", overwrite: "auto", onUpdate: apply });
      clearTimeout(idle);
      idle = setTimeout(() => gsap.to(state, { power: 0.25, duration: 2.2, ease: "power2.inOut", onUpdate: apply }), 2200);
    };

    const fine = window.matchMedia("(pointer: fine)").matches;
    let auto: gsap.core.Timeline | null = null;
    if (!fine || reduced) {
      // Touch screens: the light drifts across the portrait on its own.
      gsap.to(state, { power: 0.85, duration: 1.2, onUpdate: apply });
      if (!reduced) {
        auto = gsap
          .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 3.5, onUpdate: apply } })
          .to(state, { x: () => host.clientWidth * 0.7, y: () => host.clientHeight * 0.3 })
          .to(state, { x: () => host.clientWidth * 0.45, y: () => host.clientHeight * 0.5 });
      }
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      toX(e.clientX - r.left);
      toY(e.clientY - r.top);
      wake();
    };
    host.addEventListener("pointermove", move);
    return () => {
      host.removeEventListener("pointermove", move);
      clearTimeout(idle);
      auto?.kill();
    };
  }, [scope]);

  const img = asset(profile.heroImage);
  const pic = "absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 select-none object-contain sm:left-[64%] lg:left-[68%]";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* shadowed base */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" draggable={false} className={pic} style={{ filter: "brightness(0.16) contrast(1.15) saturate(0.35)" }} />
      {/* lit copy, masked by the cursor light */}
      <div
        ref={lit}
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle calc(170px + 170px * var(--power, 0)) at var(--mx) var(--my), rgba(0,0,0,var(--power,0)) 0%, rgba(0,0,0,calc(var(--power,0) * 0.55)) 45%, transparent 75%)",
          maskImage:
            "radial-gradient(circle calc(170px + 170px * var(--power, 0)) at var(--mx) var(--my), rgba(0,0,0,var(--power,0)) 0%, rgba(0,0,0,calc(var(--power,0) * 0.55)) 45%, transparent 75%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" draggable={false} className={pic} style={{ filter: "brightness(1.02) contrast(1.08) saturate(1.05)" }} />
      </div>
      {/* light source */}
      <div ref={glow} className="absolute left-0 top-0 opacity-0" style={{ willChange: "transform" }}>
        <div className="h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,61,242,0.22),transparent_65%)] mix-blend-screen" />
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd6f7] shadow-[0_0_18px_6px_rgba(255,120,230,0.8),0_0_60px_18px_rgba(255,61,242,0.45)]" />
      </div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const featured = projects.find((p) => p.slug === profile.featuredProject) ?? projects[0];
  const socials = [
    { href: profile.github, label: "GitHub", Icon: IconGithub },
    { href: profile.linkedin, label: "LinkedIn", Icon: IconLinkedin },
    { href: `mailto:${profile.email}`, label: "Email", Icon: IconMail },
  ];
  const counters = [
    { v: String(projects.length).padStart(2, "0"), k: "PROJ" },
    { v: String(certificates.length).padStart(2, "0"), k: "CERT" },
    { v: "1+", k: "EXP" },
  ];

  return (
    <Section id="hero" label="Introduction" className="min-h-[100svh]">
      <div ref={ref} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-void">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_40%,rgba(165,107,255,0.10),transparent_60%)]" aria-hidden="true" />
        <SpotlightPortrait scope={ref} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/55 to-transparent sm:via-void/30" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" aria-hidden="true" />

        {/* left social rail */}
        <ul className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex">
          <li className="h-16 w-px bg-white/15" aria-hidden="true" />
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label={label} className="text-dim transition-colors hover:text-[var(--accent)]">
                <Icon />
              </a>
            </li>
          ))}
          <li className="h-16 w-px bg-white/15" aria-hidden="true" />
        </ul>

        {/* right counter rail */}
        <ul className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-8 xl:flex" aria-label="At a glance">
          {counters.map((c) => (
            <li key={c.k} className="flex flex-col items-center gap-2 [writing-mode:vertical-rl]">
              <span className="font-display text-sm font-bold text-[var(--accent)]">{c.v}</span>
              <span className="font-mono text-[9px] tracking-[0.35em] text-dim">{c.k}</span>
            </li>
          ))}
        </ul>

        <div className="relative z-10 w-full px-5 pb-28 pt-28 sm:px-10 lg:px-24 xl:px-28">
          <p className="hud-label mb-5 flex items-center gap-3">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
            <span data-scramble>PORTFOLIO_2026 // SRI LANKA</span>
          </p>

          <h1
            data-split
            className="hero-name font-display text-[13vw] font-bold leading-[1] tracking-tight text-white sm:text-[8.5vw] lg:text-[6.4vw] xl:text-[6rem]"
          >
            Amandi De Silva
          </h1>

          <p data-reveal className="mt-6 max-w-3xl font-display text-lg font-medium uppercase tracking-[0.06em] text-text sm:text-2xl lg:text-[1.9rem]">
            Crafting interfaces people <span className="text-[var(--accent)] glow-text">love to use</span>
          </p>

          <p data-reveal data-delay="0.15" className="mt-5 max-w-lg text-base leading-relaxed text-text/75 sm:text-lg">
            UI/UX engineer &amp; creative frontend developer turning user research into intuitive, accessible, and immersive
            products with Figma, React, Next.js, and WebGL.
          </p>

          <div data-reveal data-delay="0.3" className="mt-8 flex flex-wrap items-center gap-4">
            <HudButton href={`mailto:${profile.email}`} tag="MAIL">
              <span className="flex items-center gap-2.5">
                <IconMail className="h-3.5 w-3.5" /> HIRE ME
              </span>
            </HudButton>
            <HudButton href={asset(profile.resume)} external tag="PDF" variant="ghost">
              <span className="flex items-center gap-2.5 text-amber">
                <IconDownload className="h-3.5 w-3.5" /> RESUME
              </span>
            </HudButton>
          </div>

          <div data-reveal data-delay="0.45" className="mt-10">
            <OrbitBadge />
          </div>
        </div>

        {/* right info column */}
        <dl
          data-reveal
          data-delay="0.5"
          className="relative z-10 mx-5 mb-24 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:mx-10 lg:absolute lg:bottom-24 lg:right-24 lg:m-0 lg:flex lg:flex-col lg:items-end lg:gap-7 lg:border-0 lg:pt-0 lg:text-right xl:right-28"
        >
          <div className="lg:border-r lg:border-white/15 lg:pr-5">
            <dt className="font-mono text-[10px] tracking-[0.3em] text-dim">BASED IN</dt>
            <dd className="mt-1.5 font-display text-lg font-medium uppercase text-text sm:text-xl">Sri Lanka</dd>
          </div>
          <div className="lg:border-r lg:border-white/15 lg:pr-5">
            <dt className="font-mono text-[10px] tracking-[0.3em] text-dim">SPECIALIZING IN</dt>
            <dd className="mt-1.5 font-display text-lg font-medium uppercase text-text sm:text-xl">UI/UX Engineering</dd>
          </div>
          <div className="col-span-2 lg:border-r lg:border-white/15 lg:pr-5">
            <dt className="font-mono text-[10px] tracking-[0.3em] text-dim">FEATURED WORK</dt>
            <dd className="mt-1.5 font-display text-lg font-bold uppercase text-amber sm:text-xl">
              <Link href={`/projects/${featured.slug}`} className="transition-[text-shadow] hover:[text-shadow:0_0_18px_#ffb547]">
                {featured.title}
              </Link>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => scrollToId("about")}
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-dim transition-colors hover:text-text sm:flex"
        >
          SCROLL DOWN
          <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden="true" className="animate-bounce text-[var(--accent)]">
            <path d="M2 3 17 18 32 3" stroke="currentColor" strokeWidth="2" />
            <path d="M10 3 17 10 24 3" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          </svg>
        </button>
      </div>
    </Section>
  );
}
