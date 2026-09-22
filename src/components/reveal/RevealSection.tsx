"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { asset } from "@/lib/asset";
import { scrollToId } from "@/lib/scroll";
import { sound } from "@/lib/sound";
import { profile } from "@/data/content";
import { HudButton } from "../ui/HudButton";
import * as THREE from "three";
import { view } from "../three/shared";
import { BEATS, BUILD_SECONDS, phase, PORTAL_SECONDS, REVEAL_CAM, REVEAL_HIP, reveal } from "./state";

/**
 * "Materialization" interlude before Contact. The camera turns to the portal by the left wall; once the section is in
 * view the portal opens and Amandi's 3D model builds up by itself (see RoomReveal), with the headline and call to
 * action arriving alongside her. The view holds still while pinned, then the tour turns on to the window for Contact.
 */
export default function RevealSection() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
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
        end: "bottom top",
        onToggle: (self) => useApp.getState().setRevealActive(self.isActive),
      });

      const readoutUpdate = () => {
        const b = phase(reveal.p, BEATS.build);
        if (readout.current) readout.current.textContent = String(Math.round(b * 100)).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${b})`;
      };

      // Once the section comes into view it all plays by itself: the portal (the neon box) opens first, then the
      // model builds up with the headline and call to action arriving alongside her. Nothing waits on scrolling.
      const seq = gsap.timeline({ paused: true, onUpdate: readoutUpdate });
      const B = PORTAL_SECONDS;
      seq
        .fromTo(reveal, { portal: 0 }, { portal: 1, duration: B, ease: "power1.inOut" }, 0)
        .fromTo(".rv-hud", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
        .fromTo(reveal, { build: 0 }, { build: 1, duration: BUILD_SECONDS, ease: "power1.inOut" }, B)
        .fromTo(".rv-title span", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" }, B + 0.1)
        .fromTo(".rv-cta", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, B + 0.3)
        // sounds: the portal snapping open, the hologram building, then she says hi as she waves
        .call(() => sound.portal(), [], 0.05)
        .call(() => sound.materialize(BUILD_SECONDS), [], B)
        .call(() => sound.say("Hi! I'm Amandi.", { pitch: 1.2 }), [], B + BUILD_SECONDS + 0.2);

      ScrollTrigger.create({
        trigger: section.current,
        start: "top 70%",
        onEnter: () => seq.play(),
        onLeaveBack: () => seq.pause(0),
      });

      // The headline and call to action stay attached to the model: never hidden, and when the pin releases they
      // don't scroll away on their own. Each frame, cancel the page scroll and follow her hips on screen, so as the
      // view turns to the window for Contact they travel off with her.
      const hip = new THREE.Vector3();
      const ref = new THREE.PerspectiveCamera();
      const follow = () => {
        const el = section.current;
        const cam = view.camera;
        if (!el || !stage.current) return;
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const rect = el.getBoundingClientRect();
        if (rect.top > vh || rect.bottom < -2 * vh) return;
        const scrolledPast = Math.max(0, vh - rect.bottom);
        let dx = 0;
        let dy = 0;
        let fade = 1;
        if (cam) {
          // where her hips are now, against where they sit when the camera faces her
          ref.fov = cam.fov;
          ref.aspect = cam.aspect;
          ref.position.set(...REVEAL_CAM.p);
          ref.lookAt(...REVEAL_CAM.t);
          ref.updateMatrixWorld();
          ref.updateProjectionMatrix();
          hip.set(...REVEAL_HIP).project(ref);
          const rx = hip.x;
          const ry = hip.y;
          hip.set(...REVEAL_HIP).project(cam);
          if (hip.z < 1) {
            dx = ((hip.x - rx) / 2) * vw;
            dy = (-(hip.y - ry) / 2) * vh;
            // only once she herself has left the screen, let the wide headline go too (no stray sliver at the edge)
            fade = THREE.MathUtils.clamp(1 - (Math.abs(hip.x) - 1.05) / 0.35, 0, 1);
          } else {
            dx = -vw; // behind the camera: well off screen
            fade = 0;
          }
        }
        stage.current.style.transform = `translate3d(${dx.toFixed(1)}px, ${(scrolledPast + dy).toFixed(1)}px, 0)`;
        stage.current.style.opacity = String(fade);
        stage.current.style.visibility = fade > 0 ? "" : "hidden";
      };
      gsap.ticker.add(follow);

      return () => {
        gsap.ticker.remove(follow);
        seq.kill();
        useApp.getState().setRevealActive(false);
        reveal.portal = 0;
        reveal.build = 0;
      };
    },
    { scope: section, dependencies: [entered] },
  );

  const loading = modelUrl === undefined || (modelUrl !== null && !modelReady);

  return (
    <section ref={section} id="reveal" aria-label="Meet Amandi in 3D" className="relative h-[150vh]" style={{ "--accent": "#3df5ff" } as React.CSSProperties}>
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
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

        {/* headline + call to action, sitting at the model's hips */}
        <div className="absolute inset-x-0 top-[50%] flex flex-col items-center px-5 text-center sm:top-[52%]">
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
