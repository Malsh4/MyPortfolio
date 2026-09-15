"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Grid, Lightformer, MeshReflectorMaterial, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Tier } from "@/lib/store";
import Workstation from "./Workstation";
import PortfolioFigure from "./PortfolioFigure";
import Hologram from "./Hologram";
import City from "./City";
import Particles from "./Particles";
import { panelTexture } from "./textures";
import { FONT_URL, accentNeon, accentNeonSoft, neon } from "./shared";

const H = 5.5; // ceiling height

function useWallMaterial(w: number, h: number) {
  return useMemo(() => {
    const t = panelTexture();
    t.repeat.set(w / 3, h / 3);
    return new THREE.MeshStandardMaterial({ map: t, color: "#bdb6ff", roughness: 0.75, metalness: 0.35 });
  }, [w, h]);
}

function Wall({ size, position, rotation = [0, 0, 0] }: { size: [number, number]; position: [number, number, number]; rotation?: [number, number, number] }) {
  const mat = useWallMaterial(size[0], size[1]);
  return (
    <mesh position={position} rotation={rotation} material={mat}>
      <planeGeometry args={size} />
    </mesh>
  );
}

function Structure({ tier }: { tier: Tier }) {
  const ceiling = useWallMaterial(16, 18);
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
        <planeGeometry args={[16, 18]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            blur={[300, 90]}
            resolution={512}
            mixBlur={1}
            mixStrength={14}
            roughness={0.85}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#08070f"
            metalness={0.6}
            mirror={0.45}
          />
        ) : (
          <meshStandardMaterial color="#09080f" roughness={0.32} metalness={0.7} />
        )}
      </mesh>
      <Grid
        position={[0, 0.005, 1]}
        args={[16, 18]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#151126"
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor="#2f1f4a"
        fadeDistance={22}
        fadeStrength={1.4}
      />

      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 1]} material={ceiling}>
        <planeGeometry args={[16, 18]} />
      </mesh>
      {[-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, H - 0.04, 0]} material={accentNeon}>
          <boxGeometry args={[0.05, 0.03, 14]} />
        </mesh>
      ))}

      {/* back wall */}
      <Wall size={[16, H]} position={[0, H / 2, -8]} />
      {/* right wall */}
      <Wall size={[18, H]} position={[8, H / 2, 1]} rotation={[0, -Math.PI / 2, 0]} />
      {/* left wall, built around the window opening (z -6.8 → -0.4, y 0.9 → 4.3) */}
      <Wall size={[1.2, H]} position={[-8, H / 2, -7.4]} rotation={[0, Math.PI / 2, 0]} />
      <Wall size={[10.4, H]} position={[-8, H / 2, 4.8]} rotation={[0, Math.PI / 2, 0]} />
      <Wall size={[6.4, 0.9]} position={[-8, 0.45, -3.6]} rotation={[0, Math.PI / 2, 0]} />
      <Wall size={[6.4, 1.2]} position={[-8, 4.9, -3.6]} rotation={[0, Math.PI / 2, 0]} />

      {/* corner + baseboard light strips */}
      {[
        [-7.95, -7.95],
        [7.95, -7.95],
      ].map(([x, z]) => (
        <mesh key={x} position={[x, H / 2, z]} material={accentNeon}>
          <boxGeometry args={[0.04, H, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, -7.96]} material={accentNeonSoft}>
        <boxGeometry args={[16, 0.03, 0.02]} />
      </mesh>
      <mesh position={[7.96, 0.04, 1]} material={accentNeonSoft}>
        <boxGeometry args={[0.02, 0.03, 18]} />
      </mesh>
    </group>
  );
}

function Window() {
  const frame = useMemo(() => neon("#3df5ff", 1.1), []);
  const glass = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#6a7cff", transparent: true, opacity: 0.05, depthWrite: false }),
    [],
  );
  const zc = -3.6;
  const w = 6.4;
  const h = 3.4;
  const yc = 2.6;
  return (
    <group position={[-8, yc, zc]}>
      {[h / 2, -h / 2].map((y) => (
        <mesh key={y} position={[0.02, y, 0]} material={frame}>
          <boxGeometry args={[0.04, 0.04, w]} />
        </mesh>
      ))}
      {[-w / 2, -w / 6, w / 6, w / 2].map((z) => (
        <mesh key={z} position={[0.02, 0, z]} material={frame}>
          <boxGeometry args={[0.04, h, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={glass}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0.2, -h / 2 - 0.04, 0]}>
        <boxGeometry args={[0.4, 0.06, w + 0.2]} />
        <meshStandardMaterial color="#15132a" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function NeonSign() {
  const sign = useMemo(() => neon("#ff3df2", 1.5), []);
  const sub = useMemo(() => neon("#3df5ff", 1.1), []);
  const halo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uI: { value: 1 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uI; varying vec2 vUv;
          void main(){ vec2 p = (vUv - 0.5) * vec2(1.0, 2.6); float d = length(p);
            gl_FragColor = vec4(vec3(1.0, 0.24, 0.95), smoothstep(0.5, 0.0, d) * 0.28 * uI); }
        `,
      }),
    [],
  );
  const base = useMemo(() => sign.color.clone(), [sign]);
  const flicker = useRef(0);

  useFrame((state, dt) => {
    flicker.current -= dt;
    let k = 1;
    if (flicker.current < 0) {
      if (Math.random() < 0.012) flicker.current = 0.12 + Math.random() * 0.2;
    } else {
      k = Math.random() > 0.5 ? 0.25 : 1;
    }
    sign.color.copy(base).multiplyScalar(k);
    halo.uniforms.uI.value = k;
  });

  return (
    <group position={[0, 3.75, -7.94]}>
      <mesh position={[0, 0, -0.01]} material={halo}>
        <planeGeometry args={[6.5, 2.5]} />
      </mesh>
      <Text font={FONT_URL} fontSize={0.72} letterSpacing={0.12} anchorX="center" anchorY="middle" material={sign}>
        AMANDI
      </Text>
      <mesh position={[0, -0.6, 0]} material={sub}>
        <boxGeometry args={[2.6, 0.018, 0.01]} />
      </mesh>
    </group>
  );
}

/** Minimal architectural light strips in place of wall exhibits, so the room reads calm behind content. */
function WallLights() {
  const amber = useMemo(() => neon("#ffb547", 0.9), []);
  return (
    <group>
      {[-0.6, 1.7, 4.0].map((z) => (
        <mesh key={z} position={[7.95, 2.4, z]} material={accentNeon}>
          <boxGeometry args={[0.03, 3.2, 0.05]} />
        </mesh>
      ))}
      <mesh position={[-7.95, 2.4, 3.2]} material={amber}>
        <boxGeometry args={[0.03, 0.03, 5]} />
      </mesh>
      <mesh position={[-4.7, 2.4, -7.95]} material={accentNeonSoft}>
        <boxGeometry args={[3, 0.02, 0.02]} />
      </mesh>
    </group>
  );
}

function Shelf() {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#141228", roughness: 0.5, metalness: 0.6 }), []);
  const cube = useRef<THREE.Mesh>(null);
  const orb = useMemo(() => neon("#3df5ff", 1.3), []);
  const wire = useMemo(() => neon("#ffb547", 1.2, { wireframe: true }), []);
  const bookColors = ["#3a2f6b", "#1f3d5a", "#5a2150", "#2b2b45", "#403c7a"];
  useFrame((_, dt) => {
    if (cube.current) {
      cube.current.rotation.x += dt * 0.4;
      cube.current.rotation.y += dt * 0.6;
    }
  });
  return (
    <group position={[4.9, 0, -7.75]}>
      {[1.1, 1.9, 2.7].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]} material={wood}>
            <boxGeometry args={[3.2, 0.05, 0.4]} />
          </mesh>
          <mesh position={[0, y - 0.03, 0.2]} material={accentNeonSoft}>
            <boxGeometry args={[3.2, 0.01, 0.01]} />
          </mesh>
        </group>
      ))}
      {bookColors.map((c, i) => (
        <mesh key={i} position={[-1.3 + i * 0.13, 1.1 + 0.2, 0]} rotation={[0, 0, i === 4 ? 0.25 : 0]}>
          <boxGeometry args={[0.1, 0.36, 0.28]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.9, 1.1 + 0.18, 0]} material={orb}>
        <sphereGeometry args={[0.13, 20, 20]} />
      </mesh>
      <mesh ref={cube} position={[-0.6, 1.9 + 0.25, 0]} material={wire}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
      {bookColors.slice(0, 3).map((c, i) => (
        <mesh key={`b${i}`} position={[0.6 + i * 0.12, 1.9 + 0.17, 0]}>
          <boxGeometry args={[0.09, 0.3, 0.26]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.2, 2.7 + 0.2, 0]}>
        <torusKnotGeometry args={[0.12, 0.035, 80, 10]} />
        <meshStandardMaterial color="#b98cff" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

function Rug() {
  return (
    <group position={[0, 0.01, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[2.3, 64]} />
        <meshStandardMaterial color="#07060d" roughness={1} metalness={0} envMapIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.002]} material={accentNeonSoft}>
        <ringGeometry args={[2.2, 2.26, 64]} />
      </mesh>
    </group>
  );
}

function Lights({ tier }: { tier: Tier }) {
  const accentLight = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (accentLight.current) accentLight.current.color.copy(accentNeon.color).multiplyScalar(0.45);
  });
  return (
    <>
      <ambientLight intensity={0.45} color="#6a5a9e" />
      <hemisphereLight args={["#3a2c6e", "#07050d", 0.7]} />
      <pointLight position={[0, 3.6, -6.9]} color="#ff3df2" intensity={22} distance={11} decay={2} />
      <pointLight position={[4.6, 1.8, -2.4]} color="#3df5ff" intensity={14} distance={8} decay={2} />
      <pointLight position={[-6.6, 3.2, -3.6]} color="#7a5cff" intensity={20} distance={11} decay={2} />
      <pointLight ref={accentLight} position={[0, 5, 1.5]} intensity={26} distance={14} decay={2} />
      {tier !== "low" && (
        <>
          <pointLight position={[0, 1.7, -6.2]} color="#8a9cff" intensity={6} distance={4} decay={2} />
          <pointLight position={[-1.2, 1.55, -6.6]} color="#ffb070" intensity={4} distance={3} decay={2} />
          <pointLight position={[6.4, 3.8, 1.7]} color="#ff3df2" intensity={14} distance={8} decay={2} />
          <pointLight position={[-6.4, 3.8, 3.2]} color="#ffb547" intensity={14} distance={8} decay={2} />
        </>
      )}
    </>
  );
}

export default function Room({ tier }: { tier: Tier }) {
  return (
    <group>
      <Environment frames={1} resolution={128}>
        <Lightformer form="rect" intensity={3} color="#ff3df2" position={[0, 4, -8]} scale={[10, 1.5, 1]} />
        <Lightformer form="rect" intensity={2} color="#3df5ff" position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#7a5cff" position={[-8, 3, -3]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
      </Environment>
      <Lights tier={tier} />
      <Structure tier={tier} />
      <Window />
      <NeonSign />
      <Shelf />
      <Rug />
      <Workstation />
      <PortfolioFigure />
      <Hologram position={[4.6, 0, -2.4]} />
      <WallLights />
      <City count={tier === "low" ? 110 : 220} traffic={tier === "low" ? 16 : 40} />
      <Particles count={tier === "low" ? 100 : tier === "medium" ? 200 : 320} />
    </group>
  );
}

