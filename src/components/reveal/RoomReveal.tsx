"use client";

import { Suspense, useCallback, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useApp, type Tier } from "@/lib/store";
import { AVATAR_HEIGHT, ModelAvatar, PlaceholderAvatar, useClipPlanes } from "./Avatar";
import { BEATS, easeInOut, easeOut, phase, reveal, REVEAL_SPOT, REVEAL_YAW } from "./state";

const TEAL = new THREE.Color("#3df5ff");
const glow = (strength: number, opts: THREE.MeshBasicMaterialParameters = {}) =>
  new THREE.MeshBasicMaterial({ color: TEAL.clone().multiplyScalar(strength), toneMapped: false, ...opts });

const vert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

/** Soft light shaft from the ceiling onto the spot. */
function SpotCone() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uI: { value: 0 } },
        vertexShader: vert,
        fragmentShader: /* glsl */ `
          uniform float uI; varying vec2 vUv;
          void main(){ float a = pow(vUv.y, 1.4) * 0.07 * uI; gl_FragColor = vec4(vec3(0.7, 0.95, 1.0), a); }
        `,
      }),
    [],
  );
  useFrame(() => {
    mat.uniforms.uI.value = easeOut(phase(reveal.p, BEATS.floor));
  });
  return (
    <mesh position={[0, 2.7, 0.2]} material={mat}>
      <cylinderGeometry args={[0.3, 1.9, 5.4, 48, 1, true]} />
    </mesh>
  );
}

/** A glowing line that grows, then splits into a starfield doorway. */
function Portal() {
  const W = 1.5;
  const H = 2.5;
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const top = useRef<THREE.Mesh>(null);
  const bottom = useRef<THREE.Mesh>(null);
  const inside = useRef<THREE.Mesh>(null);
  const bar = useMemo(() => glow(2.4), []);
  const stars = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uOpen: { value: 0 }, uTime: { value: 0 } },
        vertexShader: vert,
        fragmentShader: /* glsl */ `
          uniform float uOpen; uniform float uTime; varying vec2 vUv;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main(){
            vec2 g = vUv * vec2(40.0, 66.0);
            vec2 id = floor(g); vec2 f = fract(g) - 0.5;
            float h = hash(id);
            float star = step(0.965, h) * smoothstep(0.18, 0.0, length(f)) * (0.5 + 0.5 * sin(uTime * 2.0 + h * 40.0));
            vec3 col = vec3(0.01, 0.02, 0.035) + vec3(0.02, 0.06, 0.07) * smoothstep(0.8, 0.0, length(vUv - 0.5));
            col += vec3(0.85, 1.0, 1.0) * star;
            float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
            gl_FragColor = vec4(col, uOpen * mix(0.85, 1.0, edge));
          }
        `,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const grow = easeOut(phase(reveal.p, BEATS.line));
    const open = easeInOut(phase(reveal.p, BEATS.open));
    const wobble = grow < 1 || open < 0.05 ? 1 + Math.sin(t * 22) * 0.25 * (1 - open) : 1;
    [left.current, right.current].forEach((m, i) => {
      if (!m) return;
      m.visible = grow > 0.001;
      m.scale.set(wobble, Math.max(grow, 0.001), 1);
      m.position.x = (i === 0 ? -1 : 1) * (W / 2) * open;
    });
    [top.current, bottom.current].forEach((m) => {
      if (!m) return;
      m.visible = open > 0.001;
      m.scale.x = Math.max(open, 0.001);
    });
    if (inside.current) {
      inside.current.visible = open > 0.001;
      inside.current.scale.x = Math.max(open, 0.001);
    }
    stars.uniforms.uOpen.value = open;
    stars.uniforms.uTime.value = t;
  });

  return (
    <group position={[0, H / 2 + 0.05, -0.4]}>
      <mesh ref={inside} material={stars}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh ref={left} material={bar}>
        <boxGeometry args={[0.035, H, 0.035]} />
      </mesh>
      <mesh ref={right} material={bar}>
        <boxGeometry args={[0.035, H, 0.035]} />
      </mesh>
      <mesh ref={top} position={[0, H / 2, 0]} material={bar}>
        <boxGeometry args={[W + 0.035, 0.035, 0.035]} />
      </mesh>
      <mesh ref={bottom} position={[0, -H / 2, 0]} material={bar}>
        <boxGeometry args={[W + 0.035, 0.035, 0.035]} />
      </mesh>
    </group>
  );
}

function FloorRings() {
  const group = useRef<THREE.Group>(null);
  const dashes = useRef<THREE.Mesh>(null);
  const ring = useMemo(() => glow(2, { transparent: true, opacity: 1 }), []);
  const soft = useMemo(() => glow(1.2, { transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  useFrame((_, dt) => {
    const k = easeOut(phase(reveal.p, BEATS.rings));
    if (group.current) {
      group.current.visible = k > 0.001;
      group.current.scale.setScalar(0.4 + 0.6 * k);
    }
    ring.opacity = k;
    soft.opacity = 0.35 * k;
    if (dashes.current) dashes.current.rotation.z += dt * 0.6;
  });
  return (
    <group ref={group} position={[0, 0.025, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh material={ring}>
        <ringGeometry args={[0.72, 0.75, 64]} />
      </mesh>
      <mesh ref={dashes} material={ring}>
        <ringGeometry args={[0.56, 0.6, 24, 1, 0, Math.PI * 1.6]} />
      </mesh>
      <mesh material={soft}>
        <circleGeometry args={[0.55, 48]} />
      </mesh>
    </group>
  );
}

/** Scan ring + holo beams that ride the build line up the body. Clip planes are in world space (floor = 0). */
function Materializer({ planes }: { planes: ReturnType<typeof useClipPlanes> }) {
  const scan = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.Mesh>(null);
  const beams = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uH: { value: 0 }, uI: { value: 0 }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; varying float vY; void main(){ vUv = uv; vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uH; uniform float uI; uniform float uTime; varying vec2 vUv; varying float vY;
          void main(){
            float lines = smoothstep(0.35, 0.5, abs(fract(vUv.x * 48.0) - 0.5));
            float y = vY + 1.0;
            float below = smoothstep(uH + 0.02, uH - 0.25, y);
            float flicker = 0.75 + 0.25 * sin(uTime * 30.0 + vUv.x * 90.0);
            float a = lines * below * (1.0 - y / 2.2) * uI * flicker * 0.55;
            gl_FragColor = vec4(vec3(0.24, 1.0, 0.9) * 1.8, a);
          }
        `,
      }),
    [],
  );
  const scanMat = useMemo(() => glow(3, { transparent: true, opacity: 0.9 }), []);

  useFrame((state) => {
    const b = phase(reveal.p, BEATS.build);
    const y = -0.05 + b * (AVATAR_HEIGHT + 0.15);
    // Once she is fully built, push the planes out of the way so nothing is left clipped.
    planes.set(b >= 1 ? 1e4 : y);
    const fadeOut = 1 - phase(b, [0.9, 1]);
    if (scan.current) {
      scan.current.position.y = y;
      scan.current.visible = b > 0 && b < 1;
    }
    beams.uniforms.uH.value = y;
    beams.uniforms.uI.value = b > 0 ? fadeOut : 0;
    beams.uniforms.uTime.value = state.clock.elapsedTime;
    if (cage.current) cage.current.visible = b > 0 && fadeOut > 0;
  });

  return (
    <group position={[0, 0, 0.25]}>
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]} material={scanMat}>
        <ringGeometry args={[0.36, 0.42, 64]} />
      </mesh>
      <mesh ref={cage} position={[0, 1.0, 0]} material={beams}>
        <cylinderGeometry args={[0.6, 0.6, 2.0, 64, 1, true]} />
      </mesh>
    </group>
  );
}

/**
 * The portal + materializing avatar, standing on the rug in the front-left corner of the room. Mounted once the
 * visitor nears the reveal section, and only drawn while the reveal has started, so it never shows up elsewhere.
 */
export default function RoomReveal({ tier }: { tier: Tier }) {
  const modelUrl = useApp((s) => s.revealModel);
  const root = useRef<THREE.Group>(null);
  const planes = useClipPlanes();
  const gl = useThree((s) => s.gl);
  gl.localClippingEnabled = true;
  const onReady = useCallback(() => useApp.getState().setRevealModelReady(true), []);

  useFrame(() => {
    if (root.current) root.current.visible = reveal.p > 0.002;
  });

  if (modelUrl === undefined) return null;

  // Group sits on the floor (y = 0), which the world-space clip planes rely on.
  return (
    <group ref={root} position={REVEAL_SPOT} rotation={[0, REVEAL_YAW, 0]} visible={false}>
      {/* key light for skin and fabric, plus a cyan rim from the portal */}
      <pointLight position={[0.9, 2.3, 1.6]} color="#ffe9da" intensity={9} distance={5} decay={2} />
      <pointLight position={[-1.1, 1.6, 1.2]} color="#b9a7ff" intensity={3} distance={4} decay={2} />
      <pointLight position={[0, 1.4, -0.9]} color="#3df5ff" intensity={5} distance={3.5} decay={2} />
      <SpotCone />
      <Portal />
      <FloorRings />
      <Materializer planes={planes} />
      <group position={[0, 0, 0.25]}>
        {modelUrl ? (
          <Suspense fallback={null}>
            <ModelAvatar url={modelUrl} planes={planes} onReady={onReady} withGhost={tier !== "low"} />
          </Suspense>
        ) : (
          <PlaceholderAvatar planes={planes} />
        )}
      </group>
    </group>
  );
}
