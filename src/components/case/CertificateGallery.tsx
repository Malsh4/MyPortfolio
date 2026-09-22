"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReveal } from "../ui/Section";
import { IconExpand, IconShield } from "../ui/Icons";
import { certificates, type Certificate } from "@/data/content";
import { asset } from "@/lib/asset";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToTop } from "@/lib/scroll";
import { sound } from "@/lib/sound";
import Logo from "../Logo";

function Lightbox({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cert.title}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-void/90 p-4 backdrop-blur-md sm:p-10"
      data-lenis-prevent
    >
      <figure onClick={(e) => e.stopPropagation()} className="hud-panel relative w-full max-w-5xl p-3 sm:p-5">
        <button
          ref={close}
          type="button"
          onClick={onClose}
          data-cursor="CLOSE"
          className="absolute right-4 top-4 z-10 border border-[var(--accent)]/50 bg-void/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] text-text transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/15 hover:text-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:text-[var(--accent)]"
        >
          CLOSE ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(cert.image!)} alt={`${cert.title} certificate`} className="max-h-[78vh] w-full object-contain" />
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-[0.15em] text-dim">
          <span className="text-text">{cert.title}</span>
          <span>
            {cert.issuer} · {cert.date}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

function CertCard({ c, i, onExpand }: { c: Certificate; i: number; onExpand: (c: Certificate) => void }) {
  return (
    // Five rows on a subgrid, so cards side by side line up row for row even when one title wraps further.
    <article data-reveal data-delay={String((i % 2) * 0.08)} onMouseEnter={() => sound.cardHover()} className="hud-panel row-span-5 grid grid-rows-subgrid gap-0 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="flex items-center gap-2 border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] text-[var(--accent)]">
          <IconShield /> {c.category.toUpperCase()}
        </span>
        <span className="font-mono text-xs tracking-[0.25em] text-dim">{c.date}</span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold leading-tight text-text sm:text-3xl">{c.title}</h2>
          <p className="mt-2 text-sm font-medium text-text/70">{c.issuer}</p>
        </div>
        {c.image && (
          <button
            type="button"
            aria-label={`Enlarge ${c.title}`}
            onClick={() => onExpand(c)}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 bg-void/60 text-text/80 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <IconExpand />
          </button>
        )}
      </div>

      <div className="mt-6 border border-white/10 bg-black/40 p-4 sm:p-6">
        {c.image ? (
          <button type="button" onClick={() => onExpand(c)} data-cursor="VIEW" className="block w-full" aria-label={`View ${c.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(c.image)} alt={`${c.title} certificate`} loading="lazy" className="mx-auto aspect-[4/3] w-full max-w-lg object-cover shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:scale-[1.02]" />
          </button>
        ) : (
          <div className="mx-auto flex aspect-[4/3] w-full max-w-lg flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_70%)] text-center">
            <Logo className="h-14 w-14 text-[var(--accent)] opacity-70" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-dim">CERTIFICATE IMAGE · COMING SOON</p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="font-mono text-[9px] tracking-[0.35em] text-dim">FOCUS AREA</p>
        <p className="mt-1.5 text-sm text-text/85">{c.focus}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <dl className="flex gap-10">
          <div>
            <dt className="font-mono text-[9px] tracking-[0.35em] text-dim">ISSUED</dt>
            <dd className="mt-1.5 text-sm text-text/85">{c.date}</dd>
          </div>
          {c.credentialId && (
            <div>
              <dt className="font-mono text-[9px] tracking-[0.35em] text-dim">CREDENTIAL ID</dt>
              <dd className="mt-1.5 font-mono text-sm text-text/85">{c.credentialId}</dd>
            </div>
          )}
        </dl>
        {c.verify && (
          <a
            href={c.verify}
            target="_blank"
            rel="noreferrer"
            className="relative hud-cut border border-[var(--accent)]/60 bg-gradient-to-b from-[var(--accent)]/20 to-transparent px-6 py-3 font-display text-[11px] font-bold tracking-[0.3em] text-text transition-colors hover:from-[var(--accent)]/40"
          >
            VERIFY ↗
            <span className="absolute -bottom-2.5 right-3 bg-void px-1.5 font-mono text-[8px] tracking-[0.3em] text-[var(--accent)]">OPEN</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function CertificateGallery() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Certificate | null>(null);

  useEffect(() => {
    scrollToTop(true);
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, []);

  useReveal(ref);

  return (
    <article ref={ref} className="relative" style={{ "--accent": "#ffb547" } as React.CSSProperties}>
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-void/70 via-void/85 to-void/95" aria-hidden="true" />
      <header className="relative px-5 pb-12 pt-32 sm:px-10 lg:px-16 lg:pt-40">
        <div className="mx-auto max-w-7xl">
          <Link href="/#certificates" className="font-mono text-[11px] tracking-[0.3em] text-dim transition-colors hover:text-[var(--accent)]">
            ← BACK TO PORTFOLIO
          </Link>
          <p className="hud-label mt-10 flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-[var(--accent)]" />
            <span data-scramble>{`ARCHIVE // ${certificates.length} CREDENTIALS`}</span>
          </p>
          <h1 data-split className="mt-5 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-text sm:text-7xl lg:text-8xl">
            All Certificates
          </h1>
          <p data-reveal className="mt-6 max-w-xl text-lg text-dim">
            Every course and credential, with the original certificate and a link to verify it.
          </p>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-7xl gap-6 px-5 pb-28 sm:px-10 lg:grid-cols-2 lg:px-16">
        {certificates.map((c, i) => (
          <CertCard
            key={c.title}
            c={c}
            i={i}
            onExpand={(cert) => {
              sound.click();
              setOpen(cert);
            }}
          />
        ))}
      </div>

      {open && <Lightbox cert={open} onClose={() => setOpen(null)} />}
    </article>
  );
}
