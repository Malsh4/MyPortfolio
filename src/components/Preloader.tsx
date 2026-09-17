"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { sound } from "@/lib/sound";
import { loaderTaglines } from "@/data/content";
import Logo from "./Logo";

type Stage = "loading" | "ready" | "leaving" | "done";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [progress, setProgress] = useState(0);
  const [line, setLine] = useState(0);
  const sceneReady = useApp((s) => s.sceneReady);
  const setEntered = useApp((s) => s.setEntered);
  const setSoundOn = useApp((s) => s.setSoundOn);

  // Progress: a minimum reveal time, gated on fonts and the first rendered 3D frame.
  useEffect(() => {
    const state = { p: 0 };
    let fontsReady = false;
    document.fonts?.ready.then(() => (fontsReady = true));
    const tween = gsap.to(state, {
      p: 88,
      duration: 2.2,
      ease: "power2.out",
      onUpdate: () => setProgress(Math.round(state.p)),
    });
    const check = setInterval(() => {
      if (fontsReady && useApp.getState().sceneReady && !tween.isActive()) {
        clearInterval(check);
        gsap.to(state, {
          p: 100,
          duration: 0.6,
          ease: "power1.inOut",
          onUpdate: () => setProgress(Math.round(state.p)),
          onComplete: () => setStage("ready"),
        });
      }
    }, 120);
    // Never trap the visitor if WebGL is unavailable.
    const fallback = setTimeout(() => {
      if (!useApp.getState().sceneReady) useApp.getState().setSceneReady(true);
    }, 9000);
    return () => {
      tween.kill();
      clearInterval(check);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLine((l) => (l + 1) % loaderTaglines.length), 2300);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-draw]",
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.18 },
      );
      gsap.from(".pl-fade", { opacity: 0, y: 12, duration: 0.8, stagger: 0.1, delay: 0.3 });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (stage !== "ready") return;
      gsap.fromTo(".pl-ready", { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.12 });
      gsap.to(".pl-ready-title", { duration: 1, scrambleText: { text: "READY TO EXPLORE", chars: "01<>/#█▓", speed: 0.6 } });
    },
    { scope: root, dependencies: [stage] },
  );

  useGSAP(
    () => {
      const t = setTimeout(() => {
        gsap.fromTo(".pl-tagline", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 });
      }, 0);
      return () => clearTimeout(t);
    },
    { scope: root, dependencies: [line] },
  );

  const enter = (withSound: boolean) => {
    if (stage !== "ready") return;
    setStage("leaving");
    sound.init();
    sound.setEnabled(withSound);
    setSoundOn(withSound);
    try {
      localStorage.setItem("sound", withSound ? "on" : "off");
    } catch {}
    sound.intro();
    sound.startAmbient();

    const tl = gsap.timeline({ onComplete: () => setStage("done") });
    tl.to(".pl-btn", { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1 })
      .to(".pl-content", { opacity: 0, y: -24, filter: "blur(10px)", duration: 0.6, ease: "power2.in" }, "<0.1")
      .add(() => setEntered(true), "-=0.2")
      .to(root.current, { clipPath: "inset(50% 0 50% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.1");
  };

  if (stage === "done") return null;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-void bg-grid"
      style={{ clipPath: "inset(0% 0 0% 0)" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,61,242,0.12),transparent_60%)]" />
      <div className="pl-content relative flex w-full max-w-md flex-col items-center px-6 text-center">
        <Logo draw className="pl-fade h-20 w-20 text-magenta drop-shadow-[0_0_18px_rgba(255,61,242,0.7)]" />

        <div className="mt-10 h-8">
          {stage !== "loading" && (
            <h1 className="pl-ready pl-ready-title font-display text-xl font-bold tracking-[0.2em] text-magenta glow-text sm:text-2xl">
              READY TO EXPLORE
            </h1>
          )}
        </div>

        <p key={line} className="pl-tagline mt-4 h-12 font-sans text-base italic text-dim sm:text-lg">
          {loaderTaglines[line]}
        </p>

        {stage === "loading" ? (
          <div className="pl-fade mt-6 w-56">
            <div className="relative h-[2px] w-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-magenta shadow-[0_0_12px_#ff3df2]"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_#ff3df2]"
                style={{ left: `calc(${progress}% - 4px)` }}
              />
            </div>
            <p className="mt-3 font-mono text-xs text-dim" aria-live="polite">
              {String(progress).padStart(3, "0")}%
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4">
            <button
              type="button"
              data-sound="none"
              data-cursor="ENTER"
              onClick={() => enter(true)}
              className="pl-ready pl-btn group relative hud-cut border border-magenta/60 bg-gradient-to-b from-magenta/25 to-magenta/5 px-10 py-4 font-display text-sm font-bold tracking-[0.3em] text-text transition-colors hover:from-magenta/45 hover:to-magenta/15"
            >
              <span className="absolute left-2 top-2 h-1.5 w-1.5 rotate-45 bg-magenta" />
              <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rotate-45 bg-magenta" />
              ENTER THE WORLD
              <span className="absolute -bottom-3 right-4 bg-void px-2 font-mono text-[9px] tracking-[0.3em] text-magenta">
                READY
              </span>
            </button>
            <button
              type="button"
              data-sound="none"
              onClick={() => enter(false)}
              className="pl-ready mt-2 font-mono text-[11px] tracking-[0.25em] text-dim underline-offset-4 hover:text-text hover:underline"
            >
              ENTER WITHOUT SOUND
            </button>
          </div>
        )}
      </div>

      <div className="pl-fade absolute bottom-6 left-6 font-mono text-[10px] tracking-[0.3em] text-dim">
        SYS.BOOT // AD-2026
      </div>
      <div className="pl-fade absolute bottom-6 right-6 hidden font-mono text-[10px] tracking-[0.3em] text-dim sm:block">
        BEST WITH HEADPHONES 🎧
      </div>
    </div>
  );
}
