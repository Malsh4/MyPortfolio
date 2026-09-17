"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { codeTexture, dashboardTexture, designTexture } from "./textures";
import { accentNeon, neon } from "./shared";

const metal = new THREE.MeshStandardMaterial({ color: "#16152a", roughness: 0.35, metalness: 0.8 });
const dark = new THREE.MeshStandardMaterial({ color: "#0c0b17", roughness: 0.6, metalness: 0.4 });
const deskTop = new THREE.MeshStandardMaterial({ color: "#121022", roughness: 0.25, metalness: 0.6 });
const fabric = new THREE.MeshStandardMaterial({ color: "#1b1630", roughness: 0.9, metalness: 0.05 });

function Monitor({
  position,
  rotation = 0,
  size = [1.5, 0.86],
  map,
}: {
  position: [number, number, number];
  rotation?: number;
  size?: [number, number];
  map: THREE.Texture;
}) {
  const [w, h] = size;
  const screen = useMemo(
    () => new THREE.MeshBasicMaterial({ map, toneMapped: false, color: new THREE.Color(0.75, 0.75, 0.85) }),
    [map],
  );
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={metal} castShadow={false}>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
      </mesh>
      <mesh position={[0, 0, 0.027]} material={screen}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* glow strip under the bezel */}
      <mesh position={[0, -h / 2 - 0.035, 0.02]} material={accentNeon}>
        <boxGeometry args={[w * 0.6, 0.008, 0.01]} />
      </mesh>
      <mesh position={[0, -h / 2 - 0.2, -0.06]} material={metal}>
        <boxGeometry args={[0.07, 0.36, 0.05]} />
      </mesh>
      <mesh position={[0, -h / 2 - 0.37, 0]} material={metal}>
        <boxGeometry args={[0.36, 0.02, 0.22]} />
      </mesh>
    </group>
  );
}

export default function Workstation() {
  const code = useMemo(() => codeTexture(), []);
  const design = useMemo(() => designTexture(), []);
  const dash = useMemo(() => dashboardTexture(), []);
  const lampHead = useRef<THREE.Group>(null);
  const keyGlow = useMemo(() => neon("#a56bff", 0.7), []);
  const lampBulb = useMemo(() => neon("#ffb070", 1.4), []);

  useFrame((_, dt) => {
    code.offset.y -= dt * 0.018;
  });

  return (
    <group position={[0, 0, -6.55]}>
      {/* desk */}
      <mesh position={[0, 0.95, 0]} material={deskTop}>
        <boxGeometry args={[3.6, 0.07, 1.15]} />
      </mesh>
      <mesh position={[0, 0.9, 0.58]} material={accentNeon}>
        <boxGeometry args={[3.6, 0.012, 0.012]} />
      </mesh>
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.46, 0]} material={dark}>
          <boxGeometry args={[0.08, 0.92, 1.05]} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, -0.45]} material={dark}>
        <boxGeometry args={[3.3, 0.6, 0.04]} />
      </mesh>

      {/* monitors */}
      <Monitor position={[0, 1.62, -0.42]} map={code} size={[1.5, 0.86]} />
      <Monitor position={[-1.52, 1.62, -0.2]} rotation={0.42} map={design} size={[1.3, 0.76]} />
      <Monitor position={[1.52, 1.62, -0.2]} rotation={-0.42} map={dash} size={[1.3, 0.76]} />

      {/* keyboard + mouse */}
      <mesh position={[0, 1.0, 0.18]} material={dark}>
        <boxGeometry args={[0.95, 0.03, 0.3]} />
      </mesh>
      <mesh position={[0, 1.017, 0.18]} material={keyGlow}>
        <boxGeometry args={[0.9, 0.004, 0.26]} />
      </mesh>
      <mesh position={[0.72, 1.0, 0.2]} material={dark}>
        <boxGeometry args={[0.09, 0.03, 0.14]} />
      </mesh>

      {/* mug */}
      <mesh position={[-0.9, 1.05, 0.25]} material={fabric}>
        <cylinderGeometry args={[0.055, 0.05, 0.13, 16]} />
      </mesh>

      {/* desk lamp */}
      <group position={[-1.35, 0.99, -0.25]}>
        <mesh material={metal}>
          <cylinderGeometry args={[0.1, 0.12, 0.03, 20]} />
        </mesh>
        <mesh position={[0.08, 0.3, 0]} rotation={[0, 0, -0.3]} material={metal}>
          <cylinderGeometry args={[0.012, 0.012, 0.62, 8]} />
        </mesh>
        <group ref={lampHead} position={[0.2, 0.6, 0.05]} rotation={[0.3, 0, -0.9]}>
          <mesh material={metal}>
            <coneGeometry args={[0.1, 0.16, 20, 1, true]} />
          </mesh>
          <mesh position={[0, -0.05, 0]} material={lampBulb}>
            <sphereGeometry args={[0.04, 12, 12]} />
          </mesh>
        </group>
      </group>

      {/* chair */}
      <group position={[0.1, 0, 1.25]} rotation={[0, Math.PI + 0.25, 0]}>
        <mesh position={[0, 0.52, 0]} material={fabric}>
          <boxGeometry args={[0.6, 0.1, 0.58]} />
        </mesh>
        <mesh position={[0, 0.98, -0.28]} rotation={[-0.12, 0, 0]} material={fabric}>
          <boxGeometry args={[0.56, 0.8, 0.09]} />
        </mesh>
        <mesh position={[0, 0.98, -0.335]} rotation={[-0.12, 0, 0]} material={accentNeon}>
          <boxGeometry args={[0.02, 0.62, 0.01]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} material={metal}>
          <cylinderGeometry args={[0.035, 0.035, 0.44, 10]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i / 5) * Math.PI * 2) * 0.2, 0.05, Math.sin((i / 5) * Math.PI * 2) * 0.2]}
            rotation={[0, -(i / 5) * Math.PI * 2, 0]}
            material={metal}
          >
            <boxGeometry args={[0.4, 0.03, 0.05]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
