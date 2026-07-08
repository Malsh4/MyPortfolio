import { PortraitImage } from "@/components/portrait-image";
import { Reveal } from "@/components/reveal";

const EMAIL = "amandi.desilva@studio.com";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-background"
    >
      <PortraitImage
        sizes="(max-width: 1024px) 0px, 30vw"
        className="pointer-events-none absolute bottom-0 left-1/2 top-20 z-0 hidden w-[360px] max-w-[38vw] -translate-x-1/2 lg:block"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-28 text-center sm:px-10">
        {/* Legibility scrim over the figure */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-[130%] w-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--color-background)_38%,transparent_74%)]"
        />

        <Reveal>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.35em] text-accent/80">
            (04) — Contact
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-6 font-display text-[clamp(2.75rem,9vw,7rem)] font-normal leading-[1.02] text-foreground">
            Let&rsquo;s create something{" "}
            <span className="italic text-accent">timeless.</span>
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <a
            href={`mailto:${EMAIL}`}
            className={`mt-10 inline-block border-b border-foreground/25 pb-2 font-display text-2xl text-foreground transition-colors hover:border-accent hover:text-accent sm:text-3xl ${focusRing}`}
          >
            {EMAIL}
          </a>
        </Reveal>

        <Reveal delay={220}>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-sm text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted transition-colors hover:text-foreground ${focusRing}`}
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <footer className="relative z-10 pb-8 text-center">
        <p className="text-xs tracking-wide text-muted/80">
          © 2026 Amandi De Silva — Designed &amp; built with care.
        </p>
      </footer>
    </section>
  );
}
