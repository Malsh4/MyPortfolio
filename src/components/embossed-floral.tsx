"use client";

import { useEffect, useRef } from "react";

const emboss =
  "drop-shadow(1px 1px 0.6px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 0.7px rgba(58,41,29,0.45))";

// Deterministic PRNG (fixed seed) — must produce identical output on the
// server and during client hydration, so Math.random() is not safe here.
function mulberry32(seed: number) {
  return function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Leaf = { x: number; y: number; rot: number; scale: number };
type Branch = { stem: string; leaves: Leaf[] };

function buildBranches(): Branch[] {
  const rand = mulberry32(20260707);
  const branches: Branch[] = [];

  // Dense grid spanning past every edge (including slightly beyond the
  // viewBox bounds) so no region of the canvas — including corners and
  // edges — ends up without nearby leaf coverage.
  const STEP_X = 165;
  const STEP_Y = 155;

  for (let gy = -30; gy <= 1030; gy += STEP_Y) {
    for (let gx = -30; gx <= 1630; gx += STEP_X) {
      const start = {
        x: gx + (rand() - 0.5) * 90,
        y: gy + (rand() - 0.5) * 80,
      };
      const angle = rand() * Math.PI * 2;
      const length = 75 + rand() * 95;
      const end = {
        x: start.x + Math.cos(angle) * length,
        y: start.y + Math.sin(angle) * length,
      };
      const bow = (rand() - 0.5) * 55;
      const mx = (start.x + end.x) / 2 - Math.sin(angle) * bow;
      const my = (start.y + end.y) / 2 + Math.cos(angle) * bow;
      const stem = `M${start.x.toFixed(0)},${start.y.toFixed(0)} Q${mx.toFixed(0)},${my.toFixed(0)} ${end.x.toFixed(0)},${end.y.toFixed(0)}`;

      const baseDeg = (angle * 180) / Math.PI;
      const leafCount = 3 + Math.floor(rand() * 3); // 3–5 leaves per cluster
      const leaves: Leaf[] = [];
      for (let i = 0; i < leafCount; i++) {
        const t = (i + 1) / (leafCount + 1);
        const side = i % 2 === 0 ? 1 : -1;
        leaves.push({
          x: start.x + (end.x - start.x) * t + (rand() - 0.5) * 20,
          y: start.y + (end.y - start.y) * t + (rand() - 0.5) * 20,
          rot: baseDeg + side * (28 + rand() * 26) + (rand() - 0.5) * 10,
          scale: 0.5 + rand() * 0.42,
        });
      }
      branches.push({ stem, leaves });
    }
  }
  return branches;
}

const BRANCHES = buildBranches();

/**
 * Embossed botanical illustration hidden by default and revealed only inside
 * a soft circular spotlight that trails the cursor. The artwork is one large
 * procedurally-scattered composition of dense, many-leaved branches (not a
 * tiled pattern), so hovering different points of the hero uncovers
 * genuinely different content rather than the same design appearing
 * everywhere. Skipped for touch input and prefers-reduced-motion.
 */
export function EmbossedFloral() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!canHover || reducedMotion) return;

    const root = layer.closest<HTMLElement>("[data-cursor-glow-root]");
    if (!root) return;

    layer.style.setProperty("mask-repeat", "no-repeat");
    layer.style.setProperty("-webkit-mask-repeat", "no-repeat");

    // Mask position tracks the pointer exactly — no easing/lag — so the
    // reveal always matches the current hover point with no perceptible
    // delay.
    const applyMaskAt = (x: number, y: number) => {
      const value = `radial-gradient(circle 230px at ${x}px ${y}px, black 0%, black 32%, transparent 78%)`;
      layer.style.setProperty("mask-image", value);
      layer.style.setProperty("-webkit-mask-image", value);
    };

    const positionFromEvent = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleEnter = (e: PointerEvent) => {
      const { x, y } = positionFromEvent(e);
      applyMaskAt(x, y);
      layer.style.opacity = "1";
    };
    const handleMove = (e: PointerEvent) => {
      const { x, y } = positionFromEvent(e);
      applyMaskAt(x, y);
    };
    const handleLeave = () => {
      layer.style.opacity = "0";
    };

    root.addEventListener("pointerenter", handleEnter);
    root.addEventListener("pointermove", handleMove);
    root.addEventListener("pointerleave", handleLeave);

    return () => {
      root.removeEventListener("pointerenter", handleEnter);
      root.removeEventListener("pointermove", handleMove);
      root.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        ref={layerRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out"
        style={{ filter: emboss }}
      >
        <svg
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <g id="ginkgo-leaf">
              <path d="M-48,-28 Q-40,-46 -35,-42 Q-28,-58 -19,-52 Q-12,-64 0,-55 Q12,-64 19,-52 Q28,-58 35,-42 Q40,-46 48,-28 Q30,-8 0,0 Q-30,-8 -48,-28 Z" />
              <path d="M0,0 L-48,-28" />
              <path d="M0,0 L-35,-42" />
              <path d="M0,0 L-19,-52" />
              <path d="M0,0 L0,-55" />
              <path d="M0,0 L19,-52" />
              <path d="M0,0 L35,-42" />
              <path d="M0,0 L48,-28" />
            </g>
          </defs>
          {BRANCHES.map((branch, bi) => (
            <g key={bi}>
              <path d={branch.stem} strokeWidth="1.5" />
              {branch.leaves.map((leaf, li) => (
                <use
                  key={li}
                  href="#ginkgo-leaf"
                  transform={`translate(${leaf.x.toFixed(1)},${leaf.y.toFixed(1)}) rotate(${leaf.rot.toFixed(1)}) scale(${leaf.scale.toFixed(2)})`}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
