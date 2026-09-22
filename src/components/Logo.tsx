/** Original "AD" monogram inside a cut-corner hexagon. */
export default function Logo({ className = "", draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        data-draw={draw || undefined}
        d="M32 3 L57 17.5 V46.5 L32 61 L7 46.5 V17.5 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        pathLength={1}
      />
      <path
        data-draw={draw || undefined}
        d="M17 44 L26 20 L35 44 M20.5 35 H31.5"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
        pathLength={1}
      />
      <path
        data-draw={draw || undefined}
        d="M38 20 H42 C49 20 52 25 52 32 C52 39 49 44 42 44 H38 Z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="miter"
        pathLength={1}
      />
    </svg>
  );
}
