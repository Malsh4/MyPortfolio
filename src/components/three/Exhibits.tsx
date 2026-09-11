"use client";

import { useMemo } from "react";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { certificates, projects } from "@/data/content";
import { asset } from "@/lib/asset";
import { FONT_URL, neon } from "./shared";

const frameMat = new THREE.MeshStandardMaterial({ color: "#14132a", roughness: 0.3, metalness: 0.85 });

function gradientMaterial(color: string) {
  return new THREE.ShaderMaterial({
    toneMapped: false,
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec2 vUv;
      void main() {
        vec3 base = vec3(0.03, 0.025, 0.06);
        float g = smoothstep(1.1, 0.0, length(vUv - vec2(0.85, 0.15)));
        float grid = step(0.97, fract(vUv.x * 18.0)) + step(0.96, fract(vUv.y * 11.0));
        vec3 col = base + uColor * g * 0.55 + uColor * grid * 0.06;
        col += uColor * smoothstep(0.02, 0.0, vUv.y) * 1.5;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/** Right wall: glowing frames for the featured projects. */
export function ProjectWall() {
  const featured = projects.slice(0, 3);
  const items = useMemo(
    () => featured.map((p) => ({ p, bg: gradientMaterial(p.color), edge: neon(p.color, 1.2) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const zs = [-0.6, 1.7, 4.0];
  return (
    <group position={[7.93, 2.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {items.map(({ p, bg, edge }, i) => (
        <group key={p.slug} position={[zs[i], 0, 0]}>
          <mesh material={frameMat} position={[0, 0, -0.03]}>
            <boxGeometry args={[2.12, 1.37, 0.05]} />
          </mesh>
          <mesh material={bg}>
            <planeGeometry args={[2.0, 1.25]} />
          </mesh>
          <mesh material={edge} position={[0, -0.7, 0.01]}>
            <boxGeometry args={[2.12, 0.02, 0.02]} />
          </mesh>
          <Text font={FONT_URL} fontSize={0.07} color="#b9b6d6" letterSpacing={0.2} anchorX="left" position={[-0.88, 0.47, 0.01]}>
            {`0${i + 1} // ${p.category.toUpperCase()}`}
          </Text>
          <Text font={FONT_URL} fontSize={0.2} maxWidth={1.7} color="#ffffff" anchorX="left" anchorY="top" position={[-0.88, 0.3, 0.01]}>
            {p.title.toUpperCase()}
          </Text>
          <Text font={FONT_URL} fontSize={0.075} maxWidth={1.7} color={p.color} anchorX="left" anchorY="top" position={[-0.88, -0.08, 0.01]}>
            {p.subtitle}
          </Text>
          <Text font={FONT_URL} fontSize={0.055} color="#8e8cab" anchorX="left" position={[-0.88, -0.48, 0.01]}>
            {p.tags.slice(0, 3).join("  ·  ")}
          </Text>
        </group>
      ))}
    </group>
  );
}

/** Left wall (front half): certificate frames lit in amber. */
export function CertWall() {
  const tex = useTexture(asset("/images/certificates/google-ai-professional.webp"));
  tex.colorSpace = THREE.SRGBColorSpace;
  const certMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) }), [tex]);
  const amber = useMemo(() => neon("#ffb547", 1.3), []);
  const plate = useMemo(() => gradientMaterial("#ffb547"), []);
  const others = certificates.filter((c) => !c.highlight && c.category === "Machine Learning");

  return (
    <group position={[-7.93, 2.05, 0]} rotation={[0, Math.PI / 2, 0]}>
      {/* main certificate with the real image */}
      <group position={[-4.9, 0.05, 0]}>
        <mesh material={frameMat} position={[0, 0, -0.03]}>
          <boxGeometry args={[2.0, 1.56, 0.05]} />
        </mesh>
        <mesh material={certMat}>
          <planeGeometry args={[1.86, 1.44]} />
        </mesh>
        <mesh material={amber} position={[0, -0.8, 0.01]}>
          <boxGeometry args={[2.0, 0.02, 0.02]} />
        </mesh>
      </group>
      {others.map((c, i) => (
        <group key={c.title} position={[-2.9 + i * 1.8, 0, 0]}>
          <mesh material={frameMat} position={[0, 0, -0.03]}>
            <boxGeometry args={[1.55, 1.1, 0.05]} />
          </mesh>
          <mesh material={plate}>
            <planeGeometry args={[1.45, 1.0]} />
          </mesh>
          <mesh material={amber} position={[0, -0.57, 0.01]}>
            <boxGeometry args={[1.55, 0.02, 0.02]} />
          </mesh>
          <Text font={FONT_URL} fontSize={0.06} color="#ffb547" letterSpacing={0.2} anchorX="left" position={[-0.62, 0.36, 0.01]}>
            CERTIFIED
          </Text>
          <Text font={FONT_URL} fontSize={0.1} maxWidth={1.25} lineHeight={1.2} color="#ffffff" anchorX="left" anchorY="top" position={[-0.62, 0.22, 0.01]}>
            {c.title}
          </Text>
          <Text font={FONT_URL} fontSize={0.065} color="#b9b6d6" anchorX="left" position={[-0.62, -0.36, 0.01]}>
            {c.issuer.toUpperCase()}
          </Text>
        </group>
      ))}
    </group>
  );
}
