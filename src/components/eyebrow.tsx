import type { ReactNode } from "react";

/** Shared section eyebrow — e.g. "(02) — Selected Works". */
export function Eyebrow({
  index,
  children,
  className = "",
}: {
  index: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.72rem] font-medium uppercase tracking-[0.25em] text-accent ${className}`}
    >
      ({index}) — {children}
    </p>
  );
}
