"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useApp } from "@/lib/store";
import { sectionAccent, sections, type SectionId } from "@/data/content";
import { accentTarget, updateAccent } from "./shared";

type Pose = { p: [number, number, number]; t: [number, number, number] };

// Where the camera sits (p) and looks (t) for each section of the page.
const POSES: Record<SectionId | "case" | "intro", Pose> = {
  intro: { p: [0, 4.2, 15], t: [0, 1.2, -6] },
  hero: { p: [-1.6, 2.25, 7.0], t: [-4.6, 2.35, -7] },
  about: { p: [-1.7, 1.75, -3.3], t: [0.25, 1.5, -7.2] },
  skills: { p: [1.0, 2.1, 0.7], t: [4.6, 1.75, -2.4] },
  projects: { p: [2.7, 1.95, 1.7], t: [8, 2.05, 1.7] },
  certificates: { p: [-2.6, 1.95, 3.2], t: [-8, 2.0, 3.2] },
  contact: { p: [-4.3, 2.2, -2.6], t: [-20, 0.2, -5.2] },
  case: { p: [0, 1.62, -4.75], t: [0, 1.56, -7.2] },
};

const smooth = (x: number) => x * x * (3 - 2 * x);

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
    const { mode, activeSection, caseAccent } = useApp.getState();

    // Refresh section anchors periodically (cheap, and survives layout changes).
    if (frame.current++ % 30 === 0) {
      anchors.current = sections.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
    }

    if (mode === "case") {
      vecs.p.set(...POSES.case.p);
      vecs.t.set(...POSES.case.t);
    } else {
      const y = window.scrollY;
      const vh = window.innerHeight;
      vecs.p.set(...POSES.hero.p);
      vecs.t.set(...POSES.hero.t);
      for (let i = 1; i < sections.length; i++) {
        const a = anchors.current[i];
        if (!Number.isFinite(a)) continue;
        const w = smooth(THREE.MathUtils.clamp(1 - (a - y) / vh, 0, 1));
        if (w <= 0) break;
        const pose = POSES[sections[i].id];
        vecs.kp.set(...pose.p);
        vecs.kt.set(...pose.t);
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

    accentTarget.set(mode === "case" && caseAccent ? caseAccent : sectionAccent[activeSection]);
    updateAccent(dt);
  });

  return null;
}
