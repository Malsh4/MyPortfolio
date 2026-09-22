"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useApp } from "@/lib/store";
import { sectionAccent } from "@/data/content";
import { REVEAL_CAM, TOUR_CENTER } from "../reveal/state";
import { accentTarget, updateAccent, view } from "./shared";

type Pose = { p: [number, number, number]; t: [number, number, number] };

// A pose facing `deg` degrees clockwise from the back wall, standing at `p`.
const facing = (deg: number, pitch = -0.04, p: [number, number, number] = TOUR_CENTER): Pose => {
  const r = (deg * Math.PI) / 180;
  return { p, t: [p[0] + Math.sin(r) * 6, p[1] + Math.sin(pitch) * 6, p[2] - Math.cos(r) * 6] };
};

/** Standing outside the closed front door, where the tour starts (hidden behind the hero). */
const OUTSIDE_POSE: Pose = facing(0, -0.02, [0, 2.0, 9]);

// Fixed poses for the other routes.
const ROUTE_POSES = {
  case: { p: [0, 1.62, -4.75], t: [0, 1.56, -7.2] },
  gallery: { p: [2.8, 2.0, -1.2], t: [-2, 1.4, -7] },
} satisfies Record<string, Pose>;

const top = (id: string) => {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
};

/**
 * The home page is a scroll-driven tour of the room. Each stop has a pose and the scroll position (`at`) where the
 * camera should have fully arrived; it travels there over the stretch since the previous stop (at most one screen,
 * unless `wholeLeg` spreads it over the full stretch, as for walking in while the hero scrolls away).
 * Once inside, the camera keeps turning right: the desk and monitors, the shelf corner (about), the hologram (skills),
 * the project screens (projects), past the door to the credential wall (certificates), the portal (reveal), and
 * finally the window (contact). The front door opens and closes with the first leg (see Door in Room).
 */
const TOUR: { pose: Pose; at: (vh: number) => number; wholeLeg?: boolean }[] = [
  { pose: OUTSIDE_POSE, at: () => 0 },
  // as the hero scrolls away: through the door and a few steps in, already close to the desk
  { pose: facing(0, -0.02, [0, 2.05, 1.8]), at: () => top("entry"), wholeLeg: true },
  // across the empty stretch before About: up to the desk, AMANDI sign and monitors, arriving just as the empty
  // stretch ends (About's top reaches the bottom of the screen)
  { pose: facing(0, 0.07, [0, 1.9, -2.8]), at: (vh) => top("about") - vh },
  // then turn right as About comes in
  { pose: facing(45), at: () => top("about") },
  { pose: facing(78), at: () => top("skills") },
  // the project screens right of the door, then the credential wall left of it, framed the same way: the wall
  // sits a little right of centre, clear of the section text on the left
  { pose: facing(146, 0.02, [0.9, 1.9, 0.9]), at: () => top("projects") },
  { pose: facing(198, 0.02, [-0.85, 1.9, 0.9]), at: () => top("certificates") },
  { pose: REVEAL_CAM, at: () => top("reveal") },
  // turns to the window as Contact comes up, finishing at the very end of the page; the model's headline travels
  // off with her (see RevealSection)
  { pose: facing(310, -0.02), at: (vh) => document.documentElement.scrollHeight - vh },
];

// Each stop as a heading, so blending between stops turns the camera rather than sliding its look-at point.
// Yaw is measured clockwise from facing the back wall and unwrapped so it only grows along the tour.
type Heading = { p: THREE.Vector3; yaw: number; pitch: number };
const HEADINGS: Heading[] = (() => {
  let prev = -Infinity;
  return TOUR.map(({ pose: { p, t } }) => {
    const dx = t[0] - p[0];
    const dz = t[2] - p[2];
    let yaw = Math.atan2(dx, -dz);
    while (yaw < prev - 0.35) yaw += Math.PI * 2; // keep turning right, never back
    prev = yaw;
    return { p: new THREE.Vector3(...p), yaw, pitch: Math.atan2(t[1] - p[1], Math.hypot(dx, dz)) };
  });
})();

const LOOK_DISTANCE = 6;
const smooth = (x: number) => x * x * (3 - 2 * x);

/** Moves the camera along the room tour as the page scrolls; the pointer only nudges where it looks. */
export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  const anchors = useRef<number[]>([]);
  const frame = useRef(0);
  const look = useMemo(() => new THREE.Vector3(...OUTSIDE_POSE.t), []);
  const vecs = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), []);

  useEffect(() => {
    view.camera = camera;
    camera.position.set(...OUTSIDE_POSE.p);
    camera.lookAt(look);
  }, [camera, look]);

  // Wider lens on portrait screens so the room still reads on phones.
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.fov = aspect < 0.8 ? 68 : aspect < 1.2 ? 56 : 45;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { mode, activeSection, caseAccent, revealActive } = useApp.getState();
    const vh = window.innerHeight;

    // Refresh stop positions periodically (cheap, and survives layout changes).
    if (frame.current++ % 30 === 0) anchors.current = TOUR.map((s) => s.at(vh));

    if (mode !== "home") {
      vecs.p.set(...ROUTE_POSES[mode].p);
      vecs.t.set(...ROUTE_POSES[mode].t);
    } else {
      const y = window.scrollY;
      vecs.p.copy(HEADINGS[0].p);
      let yaw = HEADINGS[0].yaw;
      let pitch = HEADINGS[0].pitch;
      for (let i = 1; i < TOUR.length; i++) {
        const a = anchors.current[i];
        if (!Number.isFinite(a)) continue;
        const since = a - (anchors.current[i - 1] ?? 0);
        const span = Math.max(1, TOUR[i].wholeLeg ? since : Math.min(vh, since));
        const w = smooth(THREE.MathUtils.clamp(1 - (a - y) / span, 0, 1));
        if (w <= 0) break;
        const h = HEADINGS[i];
        vecs.p.lerp(h.p, w);
        yaw += (h.yaw - yaw) * w;
        pitch += (h.pitch - pitch) * w;
      }
      vecs.t.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(LOOK_DISTANCE).add(vecs.p);
    }

    // The pointer only turns the view a touch; the visitor stays standing where they are.
    vecs.t.x += state.pointer.x * 0.18;
    vecs.t.y += state.pointer.y * 0.1;

    const ease = 1 - Math.exp(-dt * 3.2);
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
