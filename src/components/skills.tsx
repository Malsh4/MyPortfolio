import { Eyebrow } from "@/components/eyebrow";
import { PortraitImage } from "@/components/portrait-image";
import { Reveal } from "@/components/reveal";

const TECH: { group: string; items: string[] }[] = [
  { group: "Design", items: ["Figma", "Framer", "Prototyping", "Design Systems", "Motion"] },
  {
    group: "Frontend",
    items: ["React", "TypeScript", "Next.js", "GSAP", "Tailwind", "Three.js"],
  },
  { group: "Foundations", items: ["Accessibility", "Responsive", "UX Research"] },
];

const CERTS: { title: string; meta: string }[] = [
  { title: "Google UX Design", meta: "Professional Certificate · 2024" },
  { title: "Meta Frontend Developer", meta: "Professional Certificate · 2023" },
  { title: "NN/g Interaction Design", meta: "Certification · 2022" },
];

export function Skills() {
  return (
    <section
      id="skills"
      className="relative isolate overflow-hidden bg-background py-28 lg:py-36"
    >
      <PortraitImage
        sizes="(max-width: 1280px) 0px, 22vw"
        className="pointer-events-none absolute bottom-0 left-[1%] top-16 z-0 hidden w-[22%] max-w-[340px] xl:block"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal>
          <Eyebrow index="03">Capabilities</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(3rem,8vw,7rem)] font-normal leading-none text-foreground">
            Skills
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-14 lg:mt-20 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          {/* Technologies */}
          <Reveal delay={80}>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent">
              Technologies
            </p>
            <div className="mt-8 flex flex-col gap-8">
              {TECH.map((group) => (
                <div key={group.group}>
                  <h3 className="font-display text-xl text-foreground">
                    {group.group}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-3">
                    {group.items.map((item) => (
                      <li key={item}>
                        <span className="inline-block rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-accent/50 hover:text-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Certifications */}
          <Reveal delay={160}>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent">
              Certifications
            </p>
            <ul className="mt-8 border-b border-foreground/15">
              {CERTS.map((cert) => (
                <li
                  key={cert.title}
                  className="border-t border-foreground/15 py-6"
                >
                  <h3 className="font-display text-xl text-foreground sm:text-2xl">
                    {cert.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{cert.meta}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
