"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { sound } from "@/lib/sound";

type Props = {
  children: React.ReactNode;
  tag?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  className?: string;
  type?: "button" | "submit";
};

/** Angled sci-fi button with corner diamonds and a small status tag. */
export function HudButton({ children, tag, href, external, onClick, variant = "solid", className = "", type = "button" }: Props) {
  const cls = `group relative inline-flex items-center justify-center hud-cut border px-7 py-3.5 font-display text-xs font-bold tracking-[0.28em] transition-all duration-300 ${
    variant === "solid"
      ? "border-[var(--accent)]/70 bg-gradient-to-b from-[var(--accent)]/25 to-[var(--accent)]/5 text-text hover:from-[var(--accent)]/45 hover:to-[var(--accent)]/15 hover:shadow-[0_0_28px_-6px_var(--accent)]"
      : "border-white/15 bg-void/40 text-text/85 backdrop-blur-sm hover:border-[var(--accent)]/70 hover:text-text"
  } ${className}`;
  const inner = (
    <>
      <span className="absolute left-2 top-2 h-1.5 w-1.5 rotate-45 bg-[var(--accent)] opacity-80" />
      <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rotate-45 bg-[var(--accent)] opacity-80" />
      <span className="relative">{children}</span>
      {tag && (
        <span className="absolute -bottom-2.5 right-3 bg-void px-1.5 font-mono text-[8px] tracking-[0.3em] text-[var(--accent)]">{tag}</span>
      )}
    </>
  );
  const handle = () => {
    sound.click();
    onClick?.();
  };
  if (href) {
    if (external || href.startsWith("mailto:") || href.startsWith("http")) {
      return (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" onClick={handle} className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} onClick={handle} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={handle} className={cls}>
      {inner}
    </button>
  );
}

/** Press-and-hold circular button that "unlocks" a link; keyboard activation opens it immediately. */
export function HoldButton({ href, label = "HOLD", size = 64 }: { href: string; label?: string; size?: number }) {
  const router = useRouter();
  const ring = useRef<SVGCircleElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const state = useRef({ p: 0 });
  const done = useRef(false);
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;

  const render = () => ring.current?.setAttribute("stroke-dashoffset", String(circ * (1 - state.current.p)));

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    done.current = false;
    sound.chargeStart();
    tween.current?.kill();
    tween.current = gsap.to(state.current, {
      p: 1,
      duration: 0.9 * (1 - state.current.p),
      ease: "none",
      onUpdate: render,
      onComplete: () => {
        done.current = true;
        sound.granted();
        router.push(href);
      },
    });
  };
  const cancel = () => {
    if (done.current) return;
    sound.chargeStop();
    tween.current?.kill();
    tween.current = gsap.to(state.current, { p: 0, duration: 0.35, ease: "power2.out", onUpdate: render });
  };

  return (
    <button
      type="button"
      data-sound="none"
      data-cursor="HOLD"
      aria-label="Open case study (press and hold, or press Enter)"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.detail === 0) {
          sound.granted();
          router.push(href);
        }
      }}
      className="relative flex shrink-0 select-none items-center justify-center rounded-full border border-[var(--accent)]/40 bg-void/60 transition-transform active:scale-95"
      style={{ width: size, height: size, touchAction: "none" }}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle
          ref={ring}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          style={{ filter: "drop-shadow(0 0 6px var(--accent))" }}
        />
      </svg>
      <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-text">{label}</span>
    </button>
  );
}
