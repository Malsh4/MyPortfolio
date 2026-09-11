import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { duration: immediate ? 0 : 1.8, immediate, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
}

export function scrollToTop(immediate = false) {
  if (instance) instance.scrollTo(0, { immediate, duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}
