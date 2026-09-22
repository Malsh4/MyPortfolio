"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getBoost } from "./shared";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Night skyline seen through the window: instanced towers with shader-lit windows, traffic, and a synthwave sun. */
export default function City({ count = 220, traffic = 40 }: { count?: number; traffic?: number }) {
  const towers = useRef<THREE.InstancedMesh>(null);
  const cars = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = Math.random();
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBoost: { value: 1 },
          uFog: { value: new THREE.Color("#0b0718") },
        },
        vertexShader: /* glsl */ `
          attribute float aSeed;
          varying vec3 vWorld; varying vec3 vN; varying float vSeed; varying float vDepth;
          void main() {
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
            vSeed = aSeed;
            vec4 mv = viewMatrix * wp;
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform float uBoost; uniform vec3 uFog;
          varying vec3 vWorld; varying vec3 vN; varying float vSeed; varying float vDepth;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          void main() {
            vec3 col = vec3(0.018, 0.016, 0.035);
            if (abs(vN.y) < 0.5) {
              float along = abs(vN.x) > 0.5 ? vWorld.z : vWorld.x;
              vec2 uv = vec2(along * 1.5, vWorld.y * 1.15);
              vec2 cell = floor(uv);
              vec2 f = fract(uv);
              float win = step(0.25, f.x) * step(f.x, 0.75) * step(0.3, f.y) * step(f.y, 0.75);
              float h = hash(cell + vSeed * 91.0);
              float lit = step(0.7, h);
              float flick = step(0.985, hash(cell + floor(uTime * 0.7 + vSeed * 10.0)));
              vec3 wc = h > 0.95 ? vec3(1.0, 0.24, 0.95) : h > 0.89 ? vec3(0.24, 0.96, 1.0) : vec3(1.0, 0.7, 0.42);
              col += win * max(lit - flick, 0.0) * wc * 0.9 * uBoost;
              // neon band on some towers
              float band = step(0.8, vSeed) * smoothstep(0.06, 0.0, abs(fract(vWorld.y * 0.05 + vSeed) - 0.5));
              col += band * mix(vec3(1.0, 0.24, 0.95), vec3(0.24, 0.96, 1.0), step(0.9, vSeed)) * 1.2 * uBoost;
            } else {
              col += vec3(0.03, 0.02, 0.06);
            }
            float fog = smoothstep(40.0, 220.0, vDepth) * 0.85;
            gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
          }
        `,
      }),
    [],
  );

  const sun = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float d = length(p);
            float disc = smoothstep(0.3, 0.295, d);
            float stripes = step(0.0, sin((vUv.y * 38.0) + uTime * 0.6)) + step(0.55, vUv.y);
            disc *= clamp(stripes, 0.0, 1.0);
            vec3 col = mix(vec3(1.0, 0.2, 0.75), vec3(1.0, 0.72, 0.3), vUv.y);
            float glow = smoothstep(0.5, 0.25, d) * 0.35;
            gl_FragColor = vec4(col * 0.85, (disc + glow * (1.0 - disc)) * 0.8);
          }
        `,
      }),
    [],
  );

  const sky = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: /* glsl */ `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          varying vec3 vP;
          void main() {
            float h = normalize(vP).y;
            vec3 top = vec3(0.012, 0.01, 0.04);
            vec3 mid = vec3(0.09, 0.03, 0.16);
            vec3 hor = vec3(0.2, 0.035, 0.2);
            vec3 col = mix(hor, mid, smoothstep(-0.05, 0.12, h));
            col = mix(col, top, smoothstep(0.12, 0.6, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = towers.current;
    if (!mesh) return;
    const r = rng(42);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const x = -26 - r() * 110;
      const z = -80 + r() * 150;
      const w = 3 + r() * 7;
      const d = 3 + r() * 7;
      const h = 18 + Math.pow(r(), 1.6) * 75;
      m.compose(new THREE.Vector3(x, -48, z), q, new THREE.Vector3(w, h, d));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);

  const carData = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: traffic }, () => ({
      x: -28 - r() * 90,
      y: -6 + r() * 20,
      z: -60 + r() * 110,
      speed: (6 + r() * 12) * (r() > 0.5 ? 1 : -1),
      axis: r() > 0.5 ? "x" : "z",
    }));
  }, [traffic]);

  useLayoutEffect(() => {
    const mesh = cars.current;
    if (!mesh) return;
    const c = new THREE.Color();
    carData.forEach((car, i) => {
      c.set(car.speed > 0 ? "#ffe6c7" : "#ff2a55").multiplyScalar(3);
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [carData]);

  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uBoost.value = getBoost() / 2.4 + 0.4;
    sun.uniforms.uTime.value = t;
    const mesh = cars.current;
    if (!mesh) return;
    carData.forEach((car, i) => {
      if (car.axis === "x") {
        car.x += car.speed * dt;
        if (car.x > -24) car.x = -120;
        if (car.x < -120) car.x = -24;
      } else {
        car.z += car.speed * dt;
        if (car.z > 60) car.z = -70;
        if (car.z < -70) car.z = 60;
      }
      tmp.position.set(car.x, car.y, car.z);
      tmp.rotation.set(0, car.axis === "x" ? 0 : Math.PI / 2, 0);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh material={sky} renderOrder={-2}>
        <sphereGeometry args={[320, 32, 16]} />
      </mesh>
      <mesh position={[-280, 6, -30]} rotation={[0, Math.PI / 2, 0]} material={sun} renderOrder={-1}>
        <planeGeometry args={[150, 150]} />
      </mesh>
      <instancedMesh ref={towers} args={[geometry, material, count]} frustumCulled={false} />
      <instancedMesh ref={cars} args={[undefined, undefined, traffic]} frustumCulled={false}>
        <boxGeometry args={[0.9, 0.16, 0.3]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
