"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { detectTier, useApp, type Quality } from "@/lib/store";
import { projects, sectionAccent, type SectionId } from "@/data/content";
import { sound } from "@/lib/sound";
import SmoothScroll from "./SmoothScroll";
import Preloader from "./Preloader";
import Cursor from "./Cursor";
import Hud from "./hud/Hud";

const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

// How much the 3D room is dimmed behind each section: `solid` darkens everything, `side` darkens the text column.
const SCRIM: Record<SectionId, { solid: number; side: number }> = {
  hero: { solid: 0.85, side: 0 },
  about: { solid: 0.3, side: 0.8 },
  skills: { solid: 0.18, side: 0.75 },
  projects: { solid: 0.28, side: 0.45 },
  certificates: { solid: 0.3, side: 0.45 },
  contact: { solid: 0.2, side: 0.7 },
};

/** Light dimming layer between the room and the page: the room stays visible, the text column gets the most shade. */
function BackdropScrim() {
  const active = useApp((s) => s.activeSection);
  const mode = useApp((s) => s.mode);
  const revealActive = useApp((s) => s.revealActive);
  const level = mode !== "home" || revealActive ? { solid: 0, side: 0 } : SCRIM[active];
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <div className="absolute inset-0 bg-void transition-opacity duration-1000 ease-out" style={{ opacity: level.solid }} />
      <div
        className="absolute inset-0 bg-gradient-to-r from-void via-void/75 to-transparent transition-opacity duration-1000 ease-out"
        style={{ opacity: level.side }}
      />
    </div>
  );
}

/** Persistent client chrome shared by every route: 3D room, HUD, cursor, loader, smooth scroll. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const quality = useApp((s) => s.quality);
  const active = useApp((s) => s.activeSection);

  useEffect(() => {
    try {
      const q = localStorage.getItem("quality") as Quality | null;
      if (q) useApp.getState().setQuality(q);
      if (localStorage.getItem("sound") === "off") {
        useApp.getState().setSoundOn(false);
        sound.setEnabled(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    useApp.getState().setTier(quality === "auto" ? detectTier() : quality);
  }, [quality]);

  useEffect(() => {
    const mode = pathname.includes("/projects/") ? "case" : pathname.includes("/certificates") ? "gallery" : "home";
    useApp.getState().setMode(mode);
    useApp.getState().setMenuOpen(false);
  }, [pathname]);

  // Global accent colour: the project's colour on case studies, otherwise the active section's.
  useEffect(() => {
    const slug = pathname.match(/\/projects\/([^/]+)/)?.[1];
    const project = slug ? projects.find((p) => p.slug === slug) : undefined;
    const color = project ? project.color : pathname.includes("/certificates") ? sectionAccent.certificates : sectionAccent[active];
    document.documentElement.style.setProperty("--accent", color);
  }, [active, pathname]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[200] -translate-y-24 bg-void px-4 py-2 font-mono text-xs text-text focus:translate-y-0"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Scene />
      </div>
      <BackdropScrim />
      <div className="fx-overlay fx-vignette" aria-hidden="true" />
      <div className="fx-overlay fx-scanlines" aria-hidden="true" />
      <div className="fx-overlay fx-grain" aria-hidden="true" />
      <Hud />
      <main id="main" className="relative z-10">
        {children}
      </main>
      <Cursor />
      <Preloader />
    </>
  );
}
