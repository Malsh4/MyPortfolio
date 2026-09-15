"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Tier } from "@/lib/store";
import { AVATAR_HEIGHT, ModelAvatar, PlaceholderAvatar, useClipPlanes } from "./Avatar";
import { BEATS, easeInOut, easeOut, phase, reveal } from "./state";

const TEAL = new THREE.Color("#3df5ff");
const glow = (strength: number, opts: THREE.MeshBasicMaterialParameters = {}) =>
  new THREE.MeshBasicMaterial({ color: TEAL.clone().multiplyScalar(strength), toneMapped: false, ...opts });

const vert = /* glsl */ `varying vec2 vUv; varying vec3 vPos; void main(){ vUv = uv; vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

function Floor() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uLight: { value: 0 } },
        vertexShader: vert,
        fragmentShader: /* glsl */ `
          uniform float uLight; varying vec2 vUv;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
            return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
          void main(){
            vec2 p = (vUv - 0.5) * 40.0;
            float d = length(p);
            float n = noise(p * 1.6) * 0.6 + noise(p * 5.0) * 0.3 + noise(p * 14.0) * 0.1;
            float cracks = smoothstep(0.02, 0.0, abs(noise(p * 0.9) - 0.5)) * 0.35;
            float spot = smoothstep(5.5, 0.0, d);
            vec3 base = mix(vec3(0.05, 0.07, 0.075), vec3(0.16, 0.2, 0.2), n) - cracks * 0.12;
            vec3 col = base * spot * uLight * 1.4 + vec3(0.0, 0.05, 0.05) * smoothstep(1.4, 0.0, d) * uLight;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );
  useFrame(() => {
    mat.uniforms.uLight.value = easeOut(phase(reveal.p, BEATS.floor));
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <planeGeometry args={[40, 40]} />
    </mesh>
  );
}

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
          void main(){ float a = pow(1.0 - vUv.y, 0.8) * 0.06 * uI; gl_FragColor = vec4(vec3(0.7, 0.95, 0.95), a); }
        `,
      }),
    [],
  );
  useFrame(() => {
    mat.uniforms.uI.value = phase(reveal.p, BEATS.floor);
  });
  return (
    <mesh position={[0, 3.6, 0.3]} material={mat}>
      <cylinderGeometry args={[0.25, 3.2, 7.2, 48, 1, true]} />
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
    <group ref={group} position={[0, 0.012, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
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

/** Scan ring + holo beams that ride the build line up the body. */
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
  const scanMat = useMemo(() => glow(3, { transparent: true }), []);

  useFrame((state) => {
    const b = phase(reveal.p, BEATS.build);
    const y = -0.05 + b * (AVATAR_HEIGHT + 0.15);
    planes.set(y);
    const active = b > 0 && b < 1 ? 1 : 0;
    const fadeOut = 1 - phase(reveal.p, [BEATS.build[1], BEATS.build[1] + 0.06]);
    if (scan.current) {
      scan.current.position.y = y;
      scan.current.visible = active === 1;
    }
    scanMat.opacity = 0.9;
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

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const look = useMemo(() => new THREE.Vector3(0, 1.05, 0), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    const portrait = size.width / size.height < 0.9;
    const k = easeInOut(Math.min(1, reveal.p / 0.85));
    const far = portrait ? 9.5 : 7.6;
    const near = portrait ? 7.2 : 5.3;
    target.set(state.pointer.x * 0.3, 1.45 - k * 0.1 + state.pointer.y * 0.1, far - (far - near) * k);
    camera.position.lerp(target, 1 - Math.exp(-Math.min(dt, 0.05) * 4));
    camera.lookAt(look);
  });
  return null;
}

function Scene({ modelUrl, onModelReady, tier }: { modelUrl: string | null; onModelReady: () => void; tier: Tier }) {
  const planes = useClipPlanes();
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 8, 22]} />
      {/* Soft studio reflections so skin, hair and fabric read naturally */}
      <Environment frames={1} resolution={128}>
        <Lightformer form="rect" intensity={1.6} color="#fff1e4" position={[0, 3, 4]} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#3df5ff" position={[0, 2, -3]} rotation={[0, Math.PI, 0]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#a56bff" position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[3, 3, 1]} />
      </Environment>
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 6.5, 2.6]} angle={0.42} penumbra={0.7} intensity={70} distance={14} decay={2} color="#eafcff" />
      <directionalLight position={[1.4, 2.4, 4]} intensity={1.1} color="#ffe6d2" />
      <pointLight position={[0, 1.4, -0.9]} color="#3df5ff" intensity={6} distance={4} decay={2} />
      <pointLight position={[1.8, 1.2, 2.5]} color="#a56bff" intensity={2.5} distance={6} decay={2} />
      <Floor />
      <SpotCone />
      <Portal />
      <FloorRings />
      <Materializer planes={planes} />
      <group position={[0, 0, 0.25]}>
        {modelUrl ? (
          <Suspense fallback={null}>
            <ModelAvatar url={modelUrl} planes={planes} onReady={onModelReady} withGhost={tier !== "low"} />
          </Suspense>
        ) : (
          <PlaceholderAvatar planes={planes} />
        )}
      </group>
      <Rig />
    </>
  );
}

export default function Stage({
  tier,
  active,
  modelUrl,
  onModelReady,
}: {
  tier: Tier;
  active: boolean;
  modelUrl: string | null;
  onModelReady: () => void;
}) {
  const dpr: [number, number] = tier === "high" ? [1, 2] : tier === "medium" ? [1, 1.5] : [0.75, 1];
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: tier !== "low", powerPreference: "high-performance" }}
      camera={{ fov: 38, near: 0.1, far: 60, position: [0, 1.5, 7.6] }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Scene modelUrl={modelUrl} onModelReady={onModelReady} tier={tier} />
      {tier !== "low" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
