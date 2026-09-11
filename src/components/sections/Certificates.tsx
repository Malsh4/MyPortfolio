"use client";

import Section, { SectionHeading } from "../ui/Section";
import { certificates } from "@/data/content";
import { asset } from "@/lib/asset";

export default function Certificates() {
  const featured = certificates.find((c) => c.highlight);
  const rest = certificates.filter((c) => !c.highlight);

  return (
    <Section id="certificates" label="Certificates" className="px-5 py-28 sm:px-10 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-7xl lg:pl-[30%]">
        <SectionHeading code="04" title="Certificates" kicker="Always learning — most recently going deep on applied AI for research, content, and building apps." />

        {featured && (
          <article data-reveal className="hud-panel grid gap-6 p-5 sm:p-7 md:grid-cols-[1.1fr_1fr]">
            {featured.image && (
              <a
                href={featured.verify ?? asset(featured.image)}
                target="_blank"
                rel="noreferrer"
                data-cursor="VERIFY"
                className="group relative block overflow-hidden border border-[var(--accent)]/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(featured.image)}
                  alt={`${featured.title} certificate`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent" />
              </a>
            )}
            <div className="flex flex-col">
              <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--accent)]">FEATURED · {featured.category.toUpperCase()}</p>
              <h3 className="mt-3 font-display text-2xl font-black leading-tight text-text sm:text-3xl">{featured.title}</h3>
              <p className="mt-2 text-sm text-dim">
                {featured.issuer} · {featured.date}
              </p>
              {featured.detail && <p className="mt-4 text-sm leading-relaxed text-text/75">{featured.detail}</p>}
              {featured.verify && (
                <a
                  href={featured.verify}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-xs tracking-[0.25em] text-[var(--accent)] hover:underline"
                >
                  VERIFY CREDENTIAL ↗
                </a>
              )}
            </div>
          </article>
        )}

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {rest.map((c, i) => (
            <li key={c.title} data-reveal data-delay={String((i % 2) * 0.08)} className="hud-panel flex flex-col p-5">
              <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.2em]">
                <span className="text-[var(--accent)]">{c.category.toUpperCase()}</span>
                <span className="border border-[var(--accent)]/40 px-2 py-0.5 text-text/80">{c.date.toUpperCase()}</span>
              </div>
              <h3 className="mt-3 font-display text-base font-bold leading-snug text-text">{c.title}</h3>
              <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-dim">ISSUED BY · {c.issuer.toUpperCase()}</p>
              {c.verify && (
                <a
                  href={c.verify}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 font-mono text-[10px] tracking-[0.25em] text-[var(--accent)] hover:underline"
                >
                  VERIFY ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
