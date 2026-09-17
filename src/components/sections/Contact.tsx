"use client";

import { useState } from "react";
import Section, { SectionHeading } from "../ui/Section";
import { HudButton } from "../ui/HudButton";
import { profile } from "@/data/content";
import { sound } from "@/lib/sound";
import { scrollToTop } from "@/lib/scroll";

const field =
  "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 font-mono text-sm text-text placeholder:text-dim/60 focus:border-[var(--accent)] focus:outline-none focus:ring-0";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  // Static hosting has no backend, so the form hands off to the visitor's mail app.
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    sound.granted();
    setStatus("sent");
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const links = [
    { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}` },
    { label: "LINKEDIN", value: "in/m-amandi-de-silva", href: profile.linkedin },
    { label: "GITHUB", value: "github.com/Malsh4", href: profile.github },
    { label: "LOCATION", value: profile.location, href: undefined },
  ];

  return (
    <Section id="contact" label="Contact" className="px-5 pb-10 pt-28 sm:px-10 lg:px-16 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/90 via-void/60 to-void/30" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading code="05" title="Contact" />
          <p data-reveal className="font-display text-3xl font-bold leading-tight text-text sm:text-4xl">
            Let&apos;s build something <span className="text-[var(--accent)] glow-text">people love</span> to use.
          </p>
          <p data-reveal className="mt-5 max-w-md text-lg text-text/70">
            Open to UI/UX and frontend roles, freelance projects, and creative collaborations. My inbox is always open.
          </p>
          <ul data-reveal className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {links.map((l) => (
              <li key={l.label} className="flex items-center justify-between gap-4 py-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-dim">{l.label}</span>
                {l.href ? (
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="truncate text-right text-text transition-colors hover:text-[var(--accent)]"
                  >
                    {l.value} ↗
                  </a>
                ) : (
                  <span className="text-right text-text">{l.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form data-reveal onSubmit={submit} className="hud-panel self-end p-6 sm:p-9" aria-label="Contact form">
          <div className="mb-6 flex items-center justify-between font-mono text-[10px] tracking-[0.3em]">
            <span className="text-[var(--accent)]">SECURE_CHANNEL</span>
            <span className="flex items-center gap-2 text-dim">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" /> ONLINE
            </span>
          </div>
          <div className="space-y-6">
            <label className="block">
              <span className="font-mono text-[10px] tracking-[0.3em] text-dim">&gt; YOUR NAME</span>
              <input name="name" required autoComplete="name" placeholder="Jane Doe" className={field} onKeyDown={() => sound.type()} />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-[0.3em] text-dim">&gt; YOUR EMAIL</span>
              <input name="email" type="email" required autoComplete="email" placeholder="jane@company.com" className={field} onKeyDown={() => sound.type()} />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-[0.3em] text-dim">&gt; MESSAGE</span>
              <textarea name="message" required rows={4} placeholder="Tell me about your project…" className={`${field} resize-none`} onKeyDown={() => sound.type()} />
            </label>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-dim" aria-live="polite">
              {status === "sent" ? (
                <span className="text-[var(--accent)]">TRANSMISSION READY — OPENING YOUR MAIL APP</span>
              ) : (
                <>
                  AWAITING INPUT<span className="animate-blink">_</span>
                </>
              )}
            </p>
            <HudButton type="submit" tag="SEND">
              TRANSMIT
            </HudButton>
          </div>
        </form>
      </div>

      <footer className="relative mx-auto mt-28 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] tracking-[0.25em] text-dim">
        <p>© {new Date().getFullYear()} {profile.name.toUpperCase()} · DESIGNED &amp; BUILT WITH NEXT.JS, R3F &amp; GSAP</p>
        <button type="button" onClick={() => scrollToTop()} className="hover:text-[var(--accent)]">
          BACK TO TOP ↑
        </button>
      </footer>
    </Section>
  );
}
