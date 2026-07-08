"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { label: "Home", href: "#top", id: "top" },
  { label: "About", href: "#about", id: "about" },
  { label: "Works", href: "#works", id: "works" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Contact", href: "#contact", id: "contact" },
];

/**
 * Minimal vertical index navigation pinned to the right edge.
 * Each section is a tick mark; its label slides in on hover/focus, and the
 * tick for the section currently in view stays highlighted as you scroll.
 */
export function IndexNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Index"
      className="animate-fade-in fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 md:flex lg:right-10"
      style={{ animationDelay: "700ms" }}
    >
      <ul className="flex flex-col items-end gap-4">
        {SECTIONS.map((section) => {
          const active = section.id === activeId;
          return (
            <li key={section.label}>
              <a
                href={section.href}
                aria-current={active ? "true" : undefined}
                className="group flex items-center justify-end gap-3 rounded-sm py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  className={`text-[0.6rem] font-medium uppercase tracking-[0.3em] transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
                    active
                      ? "translate-x-0 text-accent opacity-100"
                      : "-translate-x-1 text-muted opacity-0"
                  }`}
                >
                  {section.label}
                </span>
                <span
                  aria-hidden
                  className={`h-px transition-all duration-300 group-hover:w-10 group-hover:bg-foreground group-focus-visible:w-10 group-focus-visible:bg-foreground ${
                    active ? "w-10 bg-accent" : "w-6 bg-foreground/40"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
