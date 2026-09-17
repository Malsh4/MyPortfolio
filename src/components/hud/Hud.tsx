"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp, type Quality } from "@/lib/store";
import { sound } from "@/lib/sound";
import { scrollToId, scrollToTop } from "@/lib/scroll";
import { profile, sections } from "@/data/content";
import Logo from "../Logo";

export default function Hud() {
  const root = useRef<HTMLDivElement>(null);
  const entered = useApp((s) => s.entered);
  const mode = useApp((s) => s.mode);
  const menuOpen = useApp((s) => s.menuOpen);
  const setMenuOpen = useApp((s) => s.setMenuOpen);

  useGSAP(
    () => {
      if (!entered) return;
      gsap.fromTo(".hud-item", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.6, ease: "power3.out" });
    },
    { scope: root, dependencies: [entered] },
  );

  return (
    <div ref={root} className={entered ? "" : "invisible"}>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-6">
        <HomeLink />
        <button
          type="button"
          data-sound="none"
          data-cursor="MENU"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => {
            sound.menu(!menuOpen);
            setMenuOpen(!menuOpen);
          }}
          className="hud-item pointer-events-auto group relative flex h-12 items-center gap-3 border border-[var(--accent)]/40 bg-void/60 px-4 backdrop-blur-md transition-colors hud-cut hover:bg-[var(--accent)]/10"
        >
          <span className="font-mono text-[11px] tracking-[0.3em] text-text">{menuOpen ? "CLOSE" : "MENU"}</span>
          <span className="flex w-5 flex-col gap-[5px]">
            <span className={`h-[2px] bg-[var(--accent)] transition-transform duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-[2px] bg-[var(--accent)] transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-[2px] bg-[var(--accent)] transition-transform duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </header>

      {mode === "home" && <SectionRail />}
      <QualityPicker />
      <SoundToggle />
      <Menu />
    </div>
  );
}

function HomeLink() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === "";
  return (
    <Link
      href="/"
      aria-label={`${profile.name} — home`}
      data-cursor="HOME"
      onClick={(e) => {
        if (onHome) {
          e.preventDefault();
          scrollToTop();
        }
      }}
      className="hud-item pointer-events-auto flex items-center gap-3"
    >
      <Logo className="h-10 w-10 text-[var(--accent)] drop-shadow-[0_0_10px_var(--accent)] transition-colors duration-700" />
      <span className="hidden font-mono text-[10px] leading-tight tracking-[0.3em] text-dim sm:block">
        AMANDI
        <br />
        DE SILVA
      </span>
    </Link>
  );
}

function SectionRail() {
  const active = useApp((s) => s.activeSection);
  return (
    <nav aria-label="Sections" className="hud-item fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-end gap-4">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToId(s.id)}
                className="group flex items-center gap-3"
                aria-current={on ? "true" : undefined}
                aria-label={s.label}
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.25em] transition-all duration-500 ${
                    on ? "text-[var(--accent)] opacity-100" : "text-dim opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {s.label.toUpperCase()}
                </span>
                <span
                  className={`block h-[2px] transition-all duration-500 ${on ? "w-8 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" : "w-4 bg-white/30 group-hover:w-6"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function QualityPicker() {
  const quality = useApp((s) => s.quality);
  const tier = useApp((s) => s.tier);
  const setQuality = useApp((s) => s.setQuality);
  const options: Quality[] = ["auto", "low", "medium", "high"];
  return (
    <div className="hud-item fixed bottom-5 left-5 z-40 hidden sm:block sm:bottom-6 sm:left-8">
      <p className="mb-2 font-mono text-[9px] tracking-[0.3em] text-dim">
        VISUAL_PRESET · <span className="text-[var(--accent)]">{tier.toUpperCase()}</span>
      </p>
      <div role="radiogroup" aria-label="3D quality" className="flex gap-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={quality === o}
            onClick={() => {
              setQuality(o);
              try {
                localStorage.setItem("quality", o);
              } catch {}
            }}
            className={`border px-2 py-1 font-mono text-[9px] tracking-[0.2em] transition-colors ${
              quality === o
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-text"
                : "border-white/10 text-dim hover:border-white/30 hover:text-text"
            }`}
          >
            {o === "medium" ? "MED" : o.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function SoundToggle() {
  const soundOn = useApp((s) => s.soundOn);
  const setSoundOn = useApp((s) => s.setSoundOn);
  return (
    <button
      type="button"
      data-cursor={soundOn ? "MUTE" : "SOUND"}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute sound" : "Turn sound on"}
      onClick={() => {
        const next = !soundOn;
        sound.init();
        sound.setEnabled(next);
        if (next) sound.startAmbient();
        setSoundOn(next);
        try {
          localStorage.setItem("sound", next ? "on" : "off");
        } catch {}
      }}
      className="hud-item fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/50 bg-void/70 backdrop-blur-md transition-colors hover:bg-[var(--accent)]/10 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16"
    >
      <span className="absolute inset-1.5 rounded-full border border-[var(--accent)]/20" />
      <span className="absolute inset-0 animate-spin-slow rounded-full border-t border-[var(--accent)]/70" />
      <span className="flex h-5 items-center gap-[3px]">
        {[0.9, 0.5, 1.1, 0.7, 1].map((d, i) => (
          <span
            key={i}
            className="block h-full w-[2px] origin-center bg-[var(--accent)]"
            style={{
              animation: soundOn ? `eq ${d}s ease-in-out ${i * 0.12}s infinite` : "none",
              transform: soundOn ? undefined : "scaleY(0.2)",
            }}
          />
        ))}
      </span>
    </button>
  );
}

function Menu() {
  const menuOpen = useApp((s) => s.menuOpen);
  const setMenuOpen = useApp((s) => s.setMenuOpen);
  const mode = useApp((s) => s.mode);
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenuOpen]);

  useGSAP(
    () => {
      if (!panel.current) return;
      if (menuOpen) {
        gsap.set(panel.current, { display: "flex" });
        gsap.fromTo(panel.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.inOut" });
        gsap.fromTo(".menu-link", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: "power3.out" });
      } else {
        gsap.to(panel.current, {
          clipPath: "inset(100% 0 0% 0)",
          duration: 0.6,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(panel.current, { display: "none" });
          },
        });
      }
    },
    { dependencies: [menuOpen], scope: panel },
  );

  const go = (id: string) => {
    setMenuOpen(false);
    sound.whoosh();
    if (mode === "home") {
      setTimeout(() => scrollToId(id), 350);
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <div
      ref={panel}
      id="site-menu"
      aria-hidden={!menuOpen}
      className="fixed inset-0 z-[45] hidden flex-col justify-between bg-void/95 bg-grid px-6 pb-10 pt-28 backdrop-blur-xl sm:px-16"
    >
      <nav aria-label="Main">
        <ul className="flex flex-col gap-1 sm:gap-2">
          {sections.map((s) => (
            <li key={s.id} className="overflow-hidden">
              <button
                type="button"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => go(s.id)}
                className="menu-link group flex items-baseline gap-4 py-1 text-left sm:gap-8"
              >
                <span className="font-mono text-xs text-[var(--accent)]">{s.code}</span>
                <span className="font-display text-4xl font-bold uppercase tracking-wide text-text/85 transition-all duration-300 group-hover:translate-x-3 group-hover:text-[var(--accent)] group-hover:[text-shadow:0_0_24px_var(--accent)] sm:text-6xl lg:text-7xl">
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="menu-link flex flex-wrap items-end justify-between gap-6 font-mono text-xs tracking-[0.2em] text-dim">
        <div className="flex flex-wrap gap-6">
          <a tabIndex={menuOpen ? 0 : -1} href={`mailto:${profile.email}`} className="hover:text-[var(--accent)]">EMAIL ↗</a>
          <a tabIndex={menuOpen ? 0 : -1} href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)]">LINKEDIN ↗</a>
          <a tabIndex={menuOpen ? 0 : -1} href={profile.github} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)]">GITHUB ↗</a>
        </div>
        <p>{profile.location.toUpperCase()}</p>
      </div>
    </div>
  );
}
