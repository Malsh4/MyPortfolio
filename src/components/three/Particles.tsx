"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { dotTexture } from "./textures";

/** Floating dust motes drifting through the room's light. */
export default function Particles({ count = 500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 1] = Math.random() * 5.2;
      pos[i * 3 + 2] = -7 + Math.random() * 12;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMap: { value: dotTexture() },
        uPixel: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uPixel; attribute float aSeed; varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y = mod(p.y + uTime * (0.05 + aSeed * 0.08), 5.2);
          p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.25;
          p.z += cos(uTime * 0.25 + aSeed * 12.0) * 0.25;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (14.0 + aSeed * 22.0) * uPixel / -mv.z;
          vAlpha = 0.25 + 0.55 * abs(sin(uTime * 0.8 + aSeed * 30.0));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; varying float vAlpha;
        void main() {
          vec4 t = texture2D(uMap, gl_PointCoord);
          gl_FragColor = vec4(vec3(0.85, 0.8, 1.0) * 1.4, t.a * vAlpha);
        }
      `,
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
