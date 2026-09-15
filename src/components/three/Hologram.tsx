"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { skillGroups } from "@/data/content";
import { accentNeon, accentNeonSoft, neon } from "./shared";

const metal = new THREE.MeshStandardMaterial({ color: "#15142a", roughness: 0.3, metalness: 0.85 });

/** Skill projector: a spinning wireframe core with the five skill disciplines orbiting it. */
export default function Hologram({ position }: { position: [number, number, number] }) {
  const core = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  const wire = useMemo(() => neon("#3df5ff", 1.2, { wireframe: true, transparent: true, opacity: 0.9 }), []);
  const inner = useMemo(() => neon("#a56bff", 1.4, { transparent: true, opacity: 0.55 }), []);
  const beam = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#3df5ff") } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
          void main() {
            float fade = pow(1.0 - vUv.y, 1.6);
            float lines = 0.55 + 0.45 * sin(vUv.y * 60.0 - uTime * 4.0);
            gl_FragColor = vec4(uColor * 1.6, fade * lines * 0.35);
          }
        `,
      }),
    [],
  );
  const chips = useMemo(() => skillGroups.map((g) => ({ ...g, mat: neon(g.color, 1.3) })), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y += dt * 0.5;
      core.current.rotation.x = Math.sin(t * 0.4) * 0.3;
      core.current.position.y = 1.75 + Math.sin(t * 1.2) * 0.06;
    }
    if (orbit.current) orbit.current.rotation.y -= dt * 0.25;
    if (ring.current) ring.current.rotation.z += dt * 0.8;
    beam.uniforms.uTime.value = t;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.17, 0]} material={metal}>
        <cylinderGeometry args={[0.62, 0.72, 0.34, 40]} />
      </mesh>
      <mesh position={[0, 0.345, 0]} rotation={[-Math.PI / 2, 0, 0]} material={accentNeon}>
        <ringGeometry args={[0.5, 0.54, 48]} />
      </mesh>
      <mesh ref={ring} position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} material={accentNeonSoft}>
        <ringGeometry args={[0.2, 0.46, 6, 1, 0, Math.PI * 1.4]} />
      </mesh>
      <mesh position={[0, 1.3, 0]} material={beam}>
        <cylinderGeometry args={[1.05, 0.5, 1.9, 40, 1, true]} />
      </mesh>

      <group ref={core} position={[0, 1.75, 0]}>
        <mesh material={wire}>
          <icosahedronGeometry args={[0.46, 1]} />
        </mesh>
        <mesh material={inner}>
          <icosahedronGeometry args={[0.2, 0]} />
        </mesh>
      </group>

      <group ref={orbit} position={[0, 1.7, 0]}>
        {chips.map((c, i) => {
          const a = (i / chips.length) * Math.PI * 2;
          const r = 1.05;
          return (
            <group key={c.code} position={[Math.cos(a) * r, Math.sin(i * 1.7) * 0.25, Math.sin(a) * r]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh material={c.mat} rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[0.07, 0]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
