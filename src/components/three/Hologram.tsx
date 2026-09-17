"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { siBlender, siCss, siFigma, siHtml5, siJavascript, siNextdotjs, siReact, siUnity, type SimpleIcon } from "simple-icons";
import { accentNeon, accentNeonSoft, neon } from "./shared";

const metal = new THREE.MeshStandardMaterial({ color: "#15142a", roughness: 0.3, metalness: 0.85 });

// Technologies orbiting the projector. Brands whose logo colour is black/white get a readable tint.
const TECH: { icon: SimpleIcon; color?: string }[] = [
  { icon: siFigma },
  { icon: siReact },
  { icon: siJavascript },
  { icon: siHtml5 },
  { icon: siCss, color: "#2f9bff" },
  { icon: siNextdotjs, color: "#ffffff" },
  { icon: siUnity, color: "#ffffff" },
  { icon: siBlender },
];

/** Glowing badge texture: dark hex tile with a brand-coloured rim and the brand logo in the middle. */
function iconTexture(icon: SimpleIcon, tint?: string) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const color = tint ?? `#${icon.hex}`;

  const hex = new Path2D();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const x = size / 2 + Math.cos(a) * 112;
    const y = size / 2 + Math.sin(a) * 112;
    if (i === 0) hex.moveTo(x, y);
    else hex.lineTo(x, y);
  }
  hex.closePath();

  ctx.fillStyle = "rgba(8, 8, 20, 0.88)";
  ctx.fill(hex);
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.lineWidth = 7;
  ctx.strokeStyle = color;
  ctx.stroke(hex);

  // simple-icons paths are drawn on a 24×24 grid.
  const s = 5.4;
  ctx.save();
  ctx.translate(size / 2 - 12 * s, size / 2 - 12 * s);
  ctx.scale(s, s);
  ctx.shadowBlur = 3;
  ctx.fillStyle = color;
  ctx.fill(new Path2D(icon.path));
  ctx.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Skill projector: a spinning wireframe core with the tech stack orbiting it as glowing logo badges. */
export default function Hologram({ position }: { position: [number, number, number] }) {
  const core = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const badges = useRef<(THREE.Group | null)[]>([]);

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
  const icons = useMemo(
    () =>
      TECH.map(({ icon, color }) => ({
        key: icon.slug,
        mat: new THREE.MeshBasicMaterial({
          map: iconTexture(icon, color),
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          color: new THREE.Color(1.35, 1.35, 1.35),
        }),
      })),
    [],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y += dt * 0.5;
      core.current.rotation.x = Math.sin(t * 0.4) * 0.3;
      core.current.position.y = 1.75 + Math.sin(t * 1.2) * 0.06;
    }
    if (orbit.current) orbit.current.rotation.y -= dt * 0.25;
    if (ring.current) ring.current.rotation.z += dt * 0.8;
    badges.current.forEach((b, i) => {
      if (b) b.position.y = Math.sin(t * 1.1 + i * 1.3) * 0.12;
    });
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
        {icons.map((c, i) => {
          const a = (i / icons.length) * Math.PI * 2;
          const r = 1.15;
          return (
            <group key={c.key} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
              <group ref={(el) => void (badges.current[i] = el)}>
                <Billboard>
                  <mesh material={c.mat}>
                    <planeGeometry args={[0.34, 0.34]} />
                  </mesh>
                </Billboard>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
