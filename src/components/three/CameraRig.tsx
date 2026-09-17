"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { sectionAccent, type SectionId } from "@/data/content";
import { BEATS, phase, reveal } from "../reveal/state";
import { accentTarget, updateAccent } from "./shared";

type Pose = { p: [number, number, number]; t: [number, number, number] };

// Where the camera sits (p) and looks (t) for each section of the page.
// Each pose keeps its subject on the side opposite the section's text.
const POSES: Record<SectionId | "case" | "gallery" | "intro", Pose> = {
  intro: { p: [0, 4.2, 15], t: [0, 1.2, -6] },
  hero: { p: [-1.6, 2.25, 7.0], t: [-4.6, 2.35, -7] },
  about: { p: [-0.2, 1.8, -2.8], t: [-1.9, 1.45, -7.2] },
  skills: { p: [1.6, 2.1, 0.9], t: [3.2, 1.75, -2.4] },
  projects: { p: [2.7, 1.95, 1.7], t: [8, 2.05, 1.7] },
  certificates: { p: [3.5, 2.4, -2.0], t: [-1, 1.3, -6.5] },
  contact: { p: [-4.3, 2.2, -2.6], t: [-20, 0.2, -5.2] },
  case: { p: [0, 1.62, -4.75], t: [0, 1.56, -7.2] },
  gallery: { p: [2.8, 2.0, -1.2], t: [-2, 1.4, -7] },
};

// Scroll stops in page order. "reveal" is the model interlude between Certificates and Contact.
const STOPS = ["hero", "about", "skills", "projects", "certificates", "reveal", "contact"] as const;
type Stop = (typeof STOPS)[number];

// Reveal: the camera faces the portal on the rug (see RoomReveal) and dollies closer as she materializes.
const REVEAL_FAR: Pose = { p: [0, 1.7, 3.4], t: [0, 1.2, -1.6] };
const REVEAL_NEAR: Pose = { p: [0, 1.5, 2.1], t: [0, 1.1, -1.6] };

const smooth = (x: number) => x * x * (3 - 2 * x);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Flies the camera between section poses as the page scrolls, with an intro dolly and pointer parallax. */
export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const entered = useApp((s) => s.entered);

  const intro = useRef({ v: 0 });
  const anchors = useRef<number[]>([]);
  const frame = useRef(0);
  const look = useMemo(() => new THREE.Vector3(...POSES.intro.t), []);
  const vecs = useMemo(
    () => ({
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
      kp: new THREE.Vector3(),
      kt: new THREE.Vector3(),
      tmp: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    camera.position.set(...POSES.intro.p);
    camera.lookAt(look);
  }, [camera, look]);

  useEffect(() => {
    if (!entered) return;
    const tween = gsap.to(intro.current, { v: 1, duration: 3.2, ease: "power3.inOut", delay: 0.2 });
    return () => {
      tween.kill();
    };
  }, [entered]);

  // Wider lens on portrait screens so the room still reads on phones.
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.fov = aspect < 0.8 ? 68 : aspect < 1.2 ? 56 : 45;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { mode, activeSection, caseAccent, revealActive } = useApp.getState();

    // Refresh section anchors periodically (cheap, and survives layout changes).
    if (frame.current++ % 30 === 0) {
      anchors.current = STOPS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
    }

    const setPose = (id: Stop, target: THREE.Vector3, look: THREE.Vector3) => {
      if (id === "reveal") {
        const d = easeInOut(Math.min(1, reveal.p / 0.85));
        target.set(...REVEAL_FAR.p).lerp(vecs.tmp.set(...REVEAL_NEAR.p), d);
        look.set(...REVEAL_FAR.t).lerp(vecs.tmp.set(...REVEAL_NEAR.t), d);
        // Scrolling on walks the camera across the room to the window wall while she stays where she is.
        const exit = smooth(phase(reveal.p, BEATS.exit));
        if (exit > 0) {
          target.lerp(vecs.tmp.set(...POSES.contact.p), exit);
          look.lerp(vecs.tmp.set(...POSES.contact.t), exit);
        }
      } else {
        target.set(...POSES[id].p);
        look.set(...POSES[id].t);
      }
    };

    if (mode !== "home") {
      vecs.p.set(...POSES[mode].p);
      vecs.t.set(...POSES[mode].t);
    } else {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setPose("hero", vecs.p, vecs.t);
      for (let i = 1; i < STOPS.length; i++) {
        const a = anchors.current[i];
        if (!Number.isFinite(a)) continue;
        // Contact swings in late, so the camera holds on the model while the reveal headline is still pinned.
        const lead = STOPS[i] === "contact" ? 0.2 : 1;
        const w = smooth(THREE.MathUtils.clamp(1 - (a - y) / (vh * lead), 0, 1));
        if (w <= 0) break;
        setPose(STOPS[i], vecs.kp, vecs.kt);
        vecs.p.lerp(vecs.kp, w);
        vecs.t.lerp(vecs.kt, w);
      }
    }

    // Intro dolly from outside the room.
    const k = intro.current.v;
    if (k < 1) {
      vecs.kp.set(...POSES.intro.p);
      vecs.kt.set(...POSES.intro.t);
      vecs.p.lerp(vecs.kp, 1 - k);
      vecs.t.lerp(vecs.kt, 1 - k);
    }

    // Pointer parallax.
    vecs.p.x += state.pointer.x * 0.28;
    vecs.p.y += state.pointer.y * 0.16;
    vecs.t.x += state.pointer.x * 0.35;
    vecs.t.y += state.pointer.y * 0.2;

    const ease = 1 - Math.exp(-dt * (k < 1 ? 8 : 3.2));
    camera.position.lerp(vecs.p, ease);
    look.lerp(vecs.t, ease);
    camera.lookAt(look);

    accentTarget.set(
      mode === "case" && caseAccent
        ? caseAccent
        : mode === "gallery"
          ? sectionAccent.certificates
          : mode === "home" && revealActive
            ? "#3df5ff"
            : sectionAccent[activeSection],
    );
    updateAccent(dt);
  });

  return null;
}
