"use client";

import Section, { SectionHeading } from "../ui/Section";
import { sound } from "@/lib/sound";
import { achievements, education, experience, languages, profile, stats } from "@/data/content";

export default function About() {
  const hover = () => sound.cardHover();
  return (
    <Section id="about" label="About me" className="px-5 py-28 sm:px-10 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading code="01" title="About" />
            <p data-reveal className="font-display text-2xl font-bold leading-snug text-text sm:text-3xl">
              I design and build interfaces where <span className="text-[var(--accent)] glow-text">empathy</span> meets{" "}
              <span className="text-[var(--accent)] glow-text">engineering</span>.
            </p>
            <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-text/75">
              {profile.summary}
            </p>
            <p data-reveal className="mt-4 max-w-xl text-lg leading-relaxed text-text/75">
              I love the whole journey — talking to users, mapping flows, prototyping in Figma, then bringing it to life in code
              with motion and 3D. Fintech, mobile, and immersive web are where I feel most at home.
            </p>

            <dl data-reveal className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((s) => (
                <div key={s.label} onMouseEnter={hover} className="hud-panel hud-hover group flex flex-col-reverse p-5">
                  <dt className="mt-2 font-mono text-[10px] tracking-[0.2em] text-dim transition-colors group-hover:text-text">{s.label.toUpperCase()}</dt>
                  <dd className="font-display text-3xl font-black text-[var(--accent)] glow-text transition-transform duration-500 group-hover:translate-x-1 sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-6 lg:pt-40">
            <article data-reveal onMouseEnter={hover} className="hud-panel hud-hover group p-6 sm:p-8">
              <p className="hud-label mb-5">EXPERIENCE.LOG</p>
              {experience.map((job) => (
                <div key={job.company}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-text">{job.role}</h3>
                    <span className="font-mono text-[11px] tracking-[0.15em] text-dim">{job.period}</span>
                  </div>
                  <p className="mt-1 text-[var(--accent)]">{job.company}</p>
                  <ul className="mt-4 space-y-2.5">
                    {job.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm leading-relaxed text-text/75 transition-colors hover:text-text">
                        <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-[var(--accent)] transition-shadow group-hover:shadow-[0_0_8px_var(--accent)]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>

            <article data-reveal onMouseEnter={hover} className="hud-panel hud-hover group p-6 sm:p-8">
              <p className="hud-label mb-5">EDUCATION.DAT</p>
              <ul className="space-y-5">
                {education.map((e) => (
                  <li key={e.title}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-text">{e.title}</h3>
                      <span className="font-mono text-[11px] tracking-[0.15em] text-dim">{e.period}</span>
                    </div>
                    <p className="mt-1 text-sm text-text/70">
                      {e.place} · <span className="text-[var(--accent)]">{e.note}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <div className="mt-20">
          <p data-reveal className="hud-label mb-6">
            RECOGNITION // ACHIEVEMENTS
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((a, i) => (
              <li key={a.title} data-reveal data-delay={String(i * 0.08)} onMouseEnter={hover} className="hud-panel hud-hover group p-6">
                <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--accent)]">{`0${i + 1}`}</span>
                <h3 className="mt-3 font-display text-base font-bold leading-snug text-text transition-colors group-hover:text-[var(--accent)]">{a.title}</h3>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">{a.org}</p>
                <p className="mt-3 text-sm leading-relaxed text-text/70">{a.text}</p>
              </li>
            ))}
          </ul>
          <p data-reveal className="mt-6 font-mono text-xs tracking-[0.2em] text-dim">
            LANGUAGES: <span className="text-text">{languages.join(" · ").toUpperCase()}</span> · RESEARCH: 4 PAPERS PRESENTED AT
            THE CINEC INTERNATIONAL RESEARCH SYMPOSIUM (2023–2025)
          </p>
        </div>
      </div>
    </Section>
  );
}
