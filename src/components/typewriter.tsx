"use client";

import { useEffect, useState } from "react";

/**
 * Decorative typewriter effect that cycles through `words`, typing and
 * deleting each in turn. Purely visual — mark the parent `aria-hidden` and
 * provide the real text via an accompanying sr-only element.
 */
export function Typewriter({
  words,
  typingSpeed = 75,
  deletingSpeed = 40,
  pauseDuration = 1800,
  className = "",
}: {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing",
  );
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (reducedMotion || words.length === 0) return;
    const current = words[wordIndex];

    if (phase === "typing") {
      if (text.length < current.length) {
        const t = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typingSpeed,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pausing"), pauseDuration);
      return () => clearTimeout(t);
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), pauseDuration);
      return () => clearTimeout(t);
    }

    // deleting
    if (text.length > 0) {
      const t = setTimeout(
        () => setText(current.slice(0, text.length - 1)),
        deletingSpeed,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setWordIndex((i) => (i + 1) % words.length);
      setPhase("typing");
    }, deletingSpeed);
    return () => clearTimeout(t);
  }, [
    text,
    phase,
    wordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    reducedMotion,
  ]);

  const shown = reducedMotion ? words[0] : text;

  return (
    <span aria-hidden className={`inline-block text-left ${className}`}>
      {shown}
      {!reducedMotion && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[0.85em] w-[2px] animate-caret-blink translate-y-[0.1em] bg-accent align-middle"
        />
      )}
    </span>
  );
}
