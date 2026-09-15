"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { asset } from "@/lib/asset";
import { scrollToId } from "@/lib/scroll";
import { sound } from "@/lib/sound";
import { profile } from "@/data/content";
import { HudButton } from "../ui/HudButton";
import { BEATS, phase, reveal } from "./state";

const Stage = dynamic(() => import("./Stage"), { ssr: false });

/**
 * "Materialization" interlude before Contact: a dark stage where a portal opens and Amandi's 3D model
 * builds up from the feet as the visitor scrolls, followed by a call to connect.
 */
export default function RevealSection() {
  const section = useRef<HTMLElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const entered = useApp((s) => s.entered);
  const tier = useApp((s) => s.tier);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null | undefined>(undefined);
  const [modelReady, setModelReady] = useState(false);
  const onModelReady = useCallback(() => setModelReady(true), []);

  // Mount the stage's canvas only when the visitor gets close, and render it only while visible.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: "150% 0px" });
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  // Use the real model when public/models/amandi.glb exists, otherwise a placeholder figure.
  useEffect(() => {
    if (!mounted || modelUrl !== undefined) return;
    const url = asset(profile.avatarModel);
    fetch(url, { method: "HEAD" })
      .then((r) => setModelUrl(r.ok && !(r.headers.get("content-type") ?? "").includes("text/html") ? url : null))
      .catch(() => setModelUrl(null));
  }, [mounted, modelUrl]);

  useGSAP(
    () => {
      if (!entered) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onToggle: (self) => useApp.getState().setStageCover(self.isActive),
        },
        onUpdate: () => {
          const b = phase(reveal.p, BEATS.build);
          if (readout.current) readout.current.textContent = String(Math.round(b * 100)).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${b})`;
        },
      });
      tl.to(reveal, { p: 1, duration: 1 }, 0)
        .fromTo(".rv-hud", { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.02)
        .fromTo(".rv-title span", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.06, stagger: 0.02 }, BEATS.title)
        .fromTo(".rv-cta", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.06 }, BEATS.cta);
      return () => useApp.getState().setStageCover(false);
    },
    { scope: section, dependencies: [entered] },
  );

  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [mounted]);

  const loading = modelUrl === undefined || (modelUrl !== null && !modelReady);

  return (
    <section ref={section} id="reveal" aria-label="Meet Amandi in 3D" className="relative h-[300vh] bg-black" style={{ "--accent": "#3df5ff" } as React.CSSProperties}>
      {/* fade from the room into darkness */}
      <div className="pointer-events-none absolute inset-x-0 -top-[40vh] h-[40vh] bg-gradient-to-b from-transparent to-black" aria-hidden="true" />

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {mounted && <Stage tier={tier} active={inView} modelUrl={modelUrl ?? null} onModelReady={onModelReady} />}
        </div>

        {/* HUD */}
        <div className="rv-hud pointer-events-none absolute inset-0 opacity-0">
          <div className="absolute left-5 top-24 font-mono text-[10px] leading-relaxed tracking-[0.3em] text-dim sm:left-10 lg:left-16">
            <p className="text-[var(--accent)]">HOLO_LINK // 05</p>
            <p>SUBJECT: {profile.name.toUpperCase()}</p>
            <p>MODE: REALTIME PROJECTION</p>
          </div>
          <div className="absolute right-5 top-24 hidden text-right font-mono text-[10px] leading-relaxed tracking-[0.3em] text-dim sm:block sm:right-10 lg:right-24">
            <p>RENDER_TIER: {tier.toUpperCase()}</p>
            <p>{loading ? "AWAITING_SYNC…" : "SYNC: LOCKED"}</p>
          </div>
          <div className="absolute bottom-10 left-5 w-44 font-mono text-[10px] tracking-[0.3em] text-dim sm:left-10 lg:left-16">
            <p>
              MATERIALIZING <span ref={readout} className="text-[var(--accent)]">000</span>%
            </p>
            <span className="mt-2 block h-px w-full bg-white/15">
              <span ref={bar} className="block h-full origin-left scale-x-0 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            </span>
          </div>
          {loading && (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
              <span className="h-12 w-12 animate-spin rounded-full border border-[var(--accent)]/20 border-t-[var(--accent)]" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-[var(--accent)]">AWAITING_SYNC…</span>
            </div>
          )}
        </div>

        {/* headline + call to action */}
        <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center px-5 text-center">
          <h2 className="rv-title font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-text [text-shadow:0_4px_30px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden">
              <span className="inline-block">The human</span>
            </span>
            <span className="block overflow-hidden">
              <span className="inline-block text-[var(--accent)] glow-text">behind the pixels</span>
            </span>
          </h2>
          <div className="rv-cta hud-panel mt-6 max-w-md px-6 py-5 opacity-0">
            <p className="text-sm leading-relaxed text-text/80">
              Looking for a designer who also builds what she designs? Let&apos;s turn your idea into something people love to use.
            </p>
            <HudButton
              className="mt-5"
              tag="OPEN"
              onClick={() => {
                sound.whoosh();
                scrollToId("contact");
              }}
            >
              LET&apos;S CONNECT
            </HudButton>
          </div>
        </div>
      </div>
    </section>
  );
}
