import { create } from "zustand";
import type { SectionId } from "@/data/content";

export type Quality = "auto" | "low" | "medium" | "high";
export type Tier = "low" | "medium" | "high";
export type Mode = "home" | "case" | "gallery";

type State = {
  entered: boolean;
  soundOn: boolean;
  quality: Quality;
  tier: Tier;
  activeSection: SectionId;
  mode: Mode;
  /** True while the model-reveal stage fills the screen, so the room can stop rendering. */
  stageCover: boolean;
  setStageCover: (v: boolean) => void;
  menuOpen: boolean;
  sceneReady: boolean;
  caseAccent: string | null;
  setCaseAccent: (c: string | null) => void;
  setSceneReady: (v: boolean) => void;
  setEntered: (v: boolean) => void;
  setSoundOn: (v: boolean) => void;
  setQuality: (q: Quality) => void;
  setTier: (t: Tier) => void;
  setActiveSection: (s: SectionId) => void;
  setMode: (m: Mode) => void;
  setMenuOpen: (v: boolean) => void;
};

export const useApp = create<State>((set) => ({
  entered: false,
  soundOn: true,
  quality: "auto",
  tier: "medium",
  activeSection: "hero",
  mode: "home",
  menuOpen: false,
  sceneReady: false,
  stageCover: false,
  setStageCover: (stageCover) => set({ stageCover }),
  caseAccent: null,
  setCaseAccent: (caseAccent) => set({ caseAccent }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setEntered: (entered) => set({ entered }),
  setSoundOn: (soundOn) => set({ soundOn }),
  setQuality: (quality) => set({ quality }),
  setTier: (tier) => set({ tier }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setMode: (mode) => set({ mode }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));

/** Picks a starting render tier from the device before any frame is drawn. */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "medium";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (coarse || small || cores <= 4 || memory <= 4) return "low";
  if (cores >= 8 && memory >= 8) return "high";
  return "medium";
}
