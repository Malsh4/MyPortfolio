import { CursorGlow } from "@/components/cursor-glow";
import { EmbossedFloral } from "@/components/embossed-floral";
import { Portrait } from "@/components/portrait";
import { Typewriter } from "@/components/typewriter";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Hero() {
  return (
    <section
      id="top"
      data-cursor-glow-root
      className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 12%, rgba(253,249,240,0.75), transparent 72%)",
        }}
      />

      <CursorGlow />
      <EmbossedFloral />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
        {/* Accessible heading (the large text below is decorative) */}
        <h1 className="sr-only">
          Amandi De Silva — UI/UX Engineer and Frontend Developer
        </h1>

        {/* Name (decorative display type) */}
        <div aria-hidden className="z-10 mt-6 flex flex-col items-center">
          <span
            className="animate-fade-up block font-display font-medium leading-[0.86] text-foreground text-[clamp(3.25rem,13vw,11rem)]"
            style={{ animationDelay: "160ms" }}
          >
            Amandi
          </span>
          <span
            className="animate-fade-up -mt-[0.06em] block font-script leading-[0.9] text-outline text-[clamp(4rem,17vw,13rem)]"
            style={{ animationDelay: "260ms" }}
          >
            De Silva
          </span>
        </div>

        {/* Portrait overlay (swap in public/portrait.png) */}
        <Portrait />

        {/* Role + intro */}
        <div
          className="animate-fade-up relative z-30 mt-12 flex flex-col items-center sm:mt-16"
          style={{ animationDelay: "480ms" }}
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--color-background)_30%,transparent_72%)]"
          />
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-8 bg-accent/50 sm:w-12" />
            <Typewriter
              words={["UI/UX Engineer", "Frontend Developer"]}
              className="min-w-[13ch] text-base font-medium uppercase tracking-[0.2em] text-foreground/90 sm:text-xl md:text-2xl"
            />
            <span aria-hidden className="h-px w-8 bg-accent/50 sm:w-12" />
          </div>
        </div>

        {/* Download CV */}
        <a
          href="/resume.pdf"
          download
          className={`animate-fade-up relative z-30 mt-9 inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-18px_rgba(58,41,29,0.55)] sm:mt-10 ${focusRing}`}
          style={{ animationDelay: "620ms" }}
        >
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.6]"
          >
            <path
              d="M10 3v9m0 0-3.5-3.5M10 12l3.5-3.5M4 15.5h12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download CV
        </a>

        {/* Scroll cue */}
        <a
          href="#about"
          className={`animate-fade-in absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 rounded-sm ${focusRing}`}
          style={{ animationDelay: "900ms" }}
        >
          <span className="pl-[0.32em] text-[0.6rem] font-medium uppercase tracking-[0.32em] text-muted">
            Scroll
          </span>
          <span
            aria-hidden
            className="flex h-9 w-5 items-start justify-center rounded-full border border-accent/60 pt-1.5 sm:h-10 sm:w-6"
          >
            <span className="h-1.5 w-1 animate-scroll-wheel rounded-full bg-accent" />
          </span>
        </a>
      </div>
    </section>
  );
}
