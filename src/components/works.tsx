import { Eyebrow } from "@/components/eyebrow";
import { PortraitImage } from "@/components/portrait-image";
import { Reveal } from "@/components/reveal";

type Project = {
  title: string;
  tag: "Design" | "Development";
  year: string;
  placeholder: string;
  desc: string;
};

const PROJECTS: Project[] = [
  {
    title: "Aurelia Banking App",
    tag: "Design",
    year: "2025",
    placeholder: "product shot",
    desc: "End-to-end product design for a private banking experience.",
  },
  {
    title: "Lumen Design System",
    tag: "Development",
    year: "2025",
    placeholder: "system preview",
    desc: "A 60-component React system — fully tokenized and accessible.",
  },
  {
    title: "Maison Editorial",
    tag: "Design",
    year: "2024",
    placeholder: "editorial shot",
    desc: "Art direction and UX for a luxury fashion publication.",
  },
  {
    title: "Pulse Analytics",
    tag: "Development",
    year: "2024",
    placeholder: "dashboard",
    desc: "Real-time data UI built in React and D3, tuned for clarity.",
  },
  {
    title: "Halo Wellness",
    tag: "Design",
    year: "2023",
    placeholder: "app screens",
    desc: "Brand and product design for a mindful habit-building app.",
  },
  {
    title: "Folio Engine",
    tag: "Development",
    year: "2023",
    placeholder: "live site",
    desc: "Scroll-driven, GPU-smooth marketing site framework.",
  },
];

const stripes = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(176,141,90,0.13) 0px, rgba(176,141,90,0.13) 10px, rgba(176,141,90,0.04) 10px, rgba(176,141,90,0.04) 20px)",
};

function Tag({ tag }: { tag: Project["tag"] }) {
  const isDesign = tag === "Design";
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] ${
        isDesign
          ? "bg-primary text-on-primary"
          : "border border-foreground/25 text-muted"
      }`}
    >
      {tag}
    </span>
  );
}

function WorkCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface/60 transition duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-28px_rgba(58,41,29,0.45)]">
      <div
        className="flex aspect-[4/3] items-center justify-center border-b border-border/70"
        style={stripes}
      >
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-accent/60">
          [ {project.placeholder} ]
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Tag tag={project.tag} />
        <h3 className="mt-4 font-display text-2xl leading-snug text-foreground">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{project.desc}</p>
        <span className="mt-5 font-mono text-xs tracking-wider text-accent/80">
          {project.year}
        </span>
      </div>
    </article>
  );
}

export function Works() {
  return (
    <section
      id="works"
      className="relative isolate overflow-hidden bg-background py-28 lg:py-36"
    >
      <PortraitImage
        sizes="(max-width: 1280px) 0px, 18vw"
        className="pointer-events-none absolute bottom-0 left-[1%] top-28 z-0 hidden w-[18%] max-w-[280px] xl:block"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <Eyebrow index="02">Selected Works</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,6.5rem)] font-normal leading-none text-foreground">
              Works
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:justify-self-end">
            <p className="max-w-sm text-sm leading-relaxed text-muted sm:text-[0.95rem] lg:text-right">
              A blend of design systems and shipped frontends — equal parts pixel
              and product.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <Reveal key={project.title} delay={(i % 3) * 90} className="h-full">
              <WorkCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
