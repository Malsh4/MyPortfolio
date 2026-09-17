"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { asset } from "@/lib/asset";
import { scrollToId } from "@/lib/scroll";
import { sound } from "@/lib/sound";
import { profile } from "@/data/content";
import { HudButton } from "../ui/HudButton";
import { BEATS, phase, reveal } from "./state";

/**
 * "Materialization" interlude before Contact. The camera settles in the room in front of the rug, where a portal
 * opens and Amandi's 3D model builds up from the feet as the visitor scrolls (see three/…/RoomReveal).
 */
export default function RevealSection() {
  const section = useRef<HTMLElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const entered = useApp((s) => s.entered);
  const tier = useApp((s) => s.tier);
  const modelUrl = useApp((s) => s.revealModel);
  const modelReady = useApp((s) => s.revealModelReady);

  // Start loading the model when the visitor gets close; fall back to a placeholder figure if the file is missing.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || useApp.getState().revealModel !== undefined) return;
        near.disconnect();
        const url = asset(profile.avatarModel);
        fetch(url, { method: "HEAD" })
          .then((r) => useApp.getState().setRevealModel(r.ok && !(r.headers.get("content-type") ?? "").includes("text/html") ? url : null))
          .catch(() => useApp.getState().setRevealModel(null));
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(el);
    return () => near.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!entered) return;
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => useApp.getState().setRevealActive(self.isActive),
      });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 1 },
        onUpdate: () => {
          const b = phase(reveal.p, BEATS.build);
          if (readout.current) readout.current.textContent = String(Math.round(b * 100)).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${b})`;
        },
      });
      tl.to(reveal, { p: 1, duration: 1 }, 0)
        .fromTo(".rv-hud", { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.02)
        .fromTo(".rv-title span", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.06, stagger: 0.02 }, BEATS.title)
        .fromTo(".rv-cta", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.06 }, BEATS.cta)
        .to([".rv-title", ".rv-cta", ".rv-hud"], { opacity: 0, duration: BEATS.exit[1] - BEATS.exit[0] }, BEATS.exit[0]);
      return () => {
        useApp.getState().setRevealActive(false);
        reveal.p = 0;
      };
    },
    { scope: section, dependencies: [entered] },
  );

  const loading = modelUrl === undefined || (modelUrl !== null && !modelReady);

  return (
    <section ref={section} id="reveal" aria-label="Meet Amandi in 3D" className="relative h-[300vh]" style={{ "--accent": "#3df5ff" } as React.CSSProperties}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft vignette so the room frames the portal without competing with the text */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(4,4,10,0.55)_100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void/70 to-transparent lg:h-1/4" aria-hidden="true" />

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
          <div className="absolute bottom-28 left-5 w-44 font-mono text-[10px] tracking-[0.3em] text-dim sm:bottom-24 sm:left-10 lg:bottom-28 lg:left-16">
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
        <div className="absolute inset-x-0 bottom-[8%] flex flex-col items-center px-5 text-center">
          <h2 className="rv-title font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-text [text-shadow:0_4px_30px_rgba(0,0,0,0.9)] sm:text-5xl lg:text-6xl">
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
