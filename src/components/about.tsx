import { Eyebrow } from "@/components/eyebrow";
import { PortraitImage } from "@/components/portrait-image";
import { Reveal } from "@/components/reveal";

const EXPERIENCE = [
  { label: "Role", value: "UI/UX Engineer Intern" },
  { label: "Company", value: "Epic Lanka (Pvt) Ltd" },
  { label: "Duration", value: "2025 — 2026 · 1 Year" },
];

export function About() {
  return (
    <section
      id="about"
      className="relative isolate flex min-h-dvh items-center overflow-hidden bg-background"
    >
      {/* Soft glow behind the figure */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(42% 60% at 84% 48%, rgba(253,249,240,0.85), transparent 70%)",
        }}
      />

      {/* Portrait — reuses /portrait.png, hides gracefully if missing */}
      <PortraitImage
        sizes="(max-width: 1024px) 0px, 30vw"
        className="pointer-events-none absolute bottom-0 right-[1%] top-24 z-10 hidden w-[30%] max-w-[460px] lg:block"
      />

      <div className="relative z-0 mx-auto w-full max-w-6xl px-6 py-28 sm:px-10 lg:py-32">
        <Reveal>
          <Eyebrow index="01">About</Eyebrow>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-7 max-w-4xl font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-normal leading-[1.25] text-foreground">
            Designing with <em className="italic text-accent">creativity</em>,
            building with <em className="italic text-accent">code</em>.
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-14 grid max-w-4xl gap-12 sm:grid-cols-2 sm:gap-16 lg:mt-20">
            <p className="max-w-md text-sm leading-relaxed text-muted sm:text-[0.95rem]">
              I&rsquo;m a final-year BSc Software Engineering student at
              CINEC Campus, with four research papers published at the CINEC
              International Research Symposium. My focus keeps pulling toward
              the UI/UX side of engineering — creativity, innovation, and
              turning ideas into real solutions. At heart, I&rsquo;m a
              frontend-development-based UI/UX engineer crafting immersive,
              intentional interfaces, where design thinking meets production
              code.
            </p>

            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent">
                Experience
              </p>
              <dl className="mt-6 border-b border-foreground/15">
                {EXPERIENCE.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between gap-6 border-t border-foreground/15 py-5"
                  >
                    <dt className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted">
                      {item.label}
                    </dt>
                    <dd className="text-right font-display text-lg text-foreground sm:text-xl">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
