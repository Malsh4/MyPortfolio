/** Scroll-driven progress of the reveal sequence (0 → 1), written by GSAP and read every frame by the stage. */
export const reveal = { p: 0 };

// Sequence beats, as fractions of the scroll through the section.
export const BEATS = {
  floor: [0.0, 0.08],
  line: [0.06, 0.18],
  open: [0.18, 0.32],
  rings: [0.28, 0.4],
  build: [0.38, 0.8],
  title: 0.8,
  cta: 0.9,
} as const;

/** Local 0 → 1 progress of `p` inside the range [a, b]. */
export const phase = (p: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
