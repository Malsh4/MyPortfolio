"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Grid, Lightformer, MeshReflectorMaterial, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Tier } from "@/lib/store";
import { useApp } from "@/lib/store";
import { sound } from "@/lib/sound";
import Workstation from "./Workstation";
import RoomReveal from "../reveal/RoomReveal";
import { REVEAL_SPOT } from "../reveal/state";
import Hologram from "./Hologram";
import City from "./City";
import Particles from "./Particles";
import { codeTexture, dashboardTexture, designTexture, panelTexture } from "./textures";
import { FONT_URL, accentNeon, accentNeonSoft, neon } from "./shared";

// Room bounds: a 12 m x 13 m studio. Furniture keeps its size; walls sit close enough that the room feels lived in.
const H = 4.8; // ceiling height
const XW = 6; // side walls at x = ±XW
const ZB = -7.5; // back wall
const FRONT_Z = 5.5; // front wall (with the door)
const DEPTH = FRONT_Z - ZB;
const ZMID = (FRONT_Z + ZB) / 2;

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
  const ceiling = useWallMaterial(2 * XW, DEPTH);
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ZMID]}>
        <planeGeometry args={[2 * XW, DEPTH]} />
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
        position={[0, 0.005, ZMID]}
        args={[2 * XW, DEPTH]}
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
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, ZMID]} material={ceiling}>
        <planeGeometry args={[2 * XW, DEPTH]} />
      </mesh>
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, H - 0.04, ZMID]} material={accentNeon}>
          <boxGeometry args={[0.05, 0.03, DEPTH - 2]} />
        </mesh>
      ))}

      {/* back wall */}
      <Wall size={[2 * XW, H]} position={[0, H / 2, ZB]} />
      {/* right wall */}
      <Wall size={[DEPTH, H]} position={[XW, H / 2, ZMID]} rotation={[0, -Math.PI / 2, 0]} />
      {/* left wall, built around the window opening (z -6.8 → -0.4, y 0.9 → 4.3) */}
      <Wall size={[-6.8 - ZB, H]} position={[-XW, H / 2, (ZB - 6.8) / 2]} rotation={[0, Math.PI / 2, 0]} />
      <Wall size={[FRONT_Z + 0.4, H]} position={[-XW, H / 2, (FRONT_Z - 0.4) / 2]} rotation={[0, Math.PI / 2, 0]} />
      <Wall size={[6.4, 0.9]} position={[-XW, 0.45, -3.6]} rotation={[0, Math.PI / 2, 0]} />
      <Wall size={[6.4, H - 4.3]} position={[-XW, (H + 4.3) / 2, -3.6]} rotation={[0, Math.PI / 2, 0]} />

      {/* corner + baseboard light strips */}
      {[-XW + 0.05, XW - 0.05].map((x) => (
        <mesh key={x} position={[x, H / 2, ZB + 0.05]} material={accentNeon}>
          <boxGeometry args={[0.04, H, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, ZB + 0.04]} material={accentNeonSoft}>
        <boxGeometry args={[2 * XW, 0.03, 0.02]} />
      </mesh>
      <mesh position={[XW - 0.04, 0.04, ZMID]} material={accentNeonSoft}>
        <boxGeometry args={[0.02, 0.03, DEPTH]} />
      </mesh>
    </group>
  );
}

const doorLeaf = new THREE.MeshStandardMaterial({ color: "#1d1a30", roughness: 0.55, metalness: 0.45 });
const doorInset = new THREE.MeshStandardMaterial({ color: "#26223d", roughness: 0.5, metalness: 0.5 });
const doorMetal = new THREE.MeshStandardMaterial({ color: "#8d8aa6", roughness: 0.25, metalness: 0.95 });
const doorCasing = new THREE.MeshStandardMaterial({ color: "#0f0d1c", roughness: 0.4, metalness: 0.7 });

function StickyNote({ position, color, text, tilt }: { position: [number, number, number]; color: string; text: string; tilt: number }) {
  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh>
        <planeGeometry args={[0.2, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.9} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <Text font={FONT_URL} fontSize={0.024} maxWidth={0.17} lineHeight={1.3} textAlign="center" color="#1a1426" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
        {text}
      </Text>
    </group>
  );
}

/**
 * The front door: a closed door with a casing, handles, a "do not disturb" sign, sticky notes and a poster on the
 * inside. It slides open into the wall while the camera is outside or passing through, and closes once it's in.
 */
function Door() {
  const hinge = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const frameGlow = useMemo(() => neon("#3df5ff", 0.8), []);
  const signGlow = useMemo(() => neon("#ff3df2", 1.3), []);
  const codeGlow = useMemo(() => neon("#3df5ff", 1.2), []);
  const slide = useRef(0);
  const isOpen = useRef(false);
  const W = DOOR_W - 0.04;
  const Hd = DOOR_H - 0.02;

  useFrame((_, dt) => {
    // Open once the visitor starts scrolling, until the camera has made it inside.
    const outside = camera.position.z > FRONT_Z - 0.9;
    const open = outside && window.scrollY > 4;
    if (open !== isOpen.current) {
      isOpen.current = open;
      sound.door(open);
    }
    // It slides sideways into the wall, so nothing swings past the camera on the way through.
    slide.current = THREE.MathUtils.damp(slide.current, open ? 1 : 0, 5, Math.min(dt, 0.05));
    if (hinge.current) hinge.current.position.x = -DOOR_W / 2 - slide.current * (DOOR_W + 0.1);
  });

  return (
    <group>
      {/* casing, plus a thin steady cyan line around the opening */}
      {[-DOOR_W / 2 - 0.06, DOOR_W / 2 + 0.06].map((x) => (
        <mesh key={x} position={[x, DOOR_H / 2, FRONT_Z]} material={doorCasing}>
          <boxGeometry args={[0.12, DOOR_H + 0.06, 0.3]} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H + 0.06, FRONT_Z]} material={doorCasing}>
        <boxGeometry args={[DOOR_W + 0.24, 0.12, 0.3]} />
      </mesh>
      {[-DOOR_W / 2 - 0.125, DOOR_W / 2 + 0.125].map((x) => (
        <mesh key={x} position={[x, DOOR_H / 2, FRONT_Z - 0.16]} material={frameGlow}>
          <boxGeometry args={[0.015, DOOR_H + 0.1, 0.015]} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H + 0.125, FRONT_Z - 0.16]} material={frameGlow}>
        <boxGeometry args={[DOOR_W + 0.265, 0.015, 0.015]} />
      </mesh>

      {/* porch light over the door, outside, so the entrance reads before the camera steps in */}
      <mesh position={[0, DOOR_H + 0.38, FRONT_Z + 0.2]} material={frameGlow}>
        <boxGeometry args={[0.5, 0.05, 0.12]} />
      </mesh>
      <pointLight position={[0, DOOR_H + 0.3, FRONT_Z + 0.9]} color="#a9e6ff" intensity={9} distance={6} decay={2} />

      {/* the leaf; opening slides it sideways into the wall */}
      <group ref={hinge} position={[-DOOR_W / 2, 0, FRONT_Z]}>
        <group position={[DOOR_W / 2, 0, 0]}>
          <mesh position={[0, Hd / 2, 0]} material={doorLeaf}>
            <boxGeometry args={[W, Hd, 0.06]} />
          </mesh>
          {/* raised panels on both faces */}
          {[-1, 1].map((side) =>
            [0.72, 1.95].map((y) => (
              <mesh key={`${side}-${y}`} position={[0, y, side * 0.032]} material={doorInset}>
                <boxGeometry args={[W - 0.3, y < 1 ? 0.95 : 1.05, 0.01]} />
              </mesh>
            )),
          )}
          {/* lever handles on both faces, by the free edge */}
          {[-1, 1].map((side) => (
            <group key={side} position={[W / 2 - 0.14, 1.05, side * 0.05]}>
              <mesh material={doorMetal} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
              </mesh>
              <mesh material={doorMetal} position={[-0.07, 0, side * 0.025]}>
                <boxGeometry args={[0.15, 0.025, 0.025]} />
              </mesh>
            </group>
          ))}

          {/* outside: a small nameplate */}
          <group position={[0, 1.62, 0.04]}>
            <mesh material={doorCasing}>
              <boxGeometry args={[0.62, 0.16, 0.01]} />
            </mesh>
            <Text font={FONT_URL} fontSize={0.05} letterSpacing={0.18} anchorX="center" anchorY="middle" position={[0, 0, 0.007]} material={codeGlow}>
              AMANDI · STUDIO
            </Text>
          </group>

          {/* inside (facing the room): hanging sign, sticky notes and a poster */}
          <group position={[0, 0, -0.04]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 2.22, 0]} material={doorMetal}>
              <sphereGeometry args={[0.012, 8, 8]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.16, 2.1, 0.002]} rotation={[0, 0, side * 0.95]}>
                <boxGeometry args={[0.004, 0.36, 0.002]} />
                <meshBasicMaterial color="#b9b3d6" />
              </mesh>
            ))}
            <group position={[0, 1.88, 0.004]} rotation={[0, 0, -0.04]}>
              <mesh>
                <planeGeometry args={[0.72, 0.24]} />
                <meshStandardMaterial color="#120f20" roughness={0.6} />
              </mesh>
              <Text font={FONT_URL} fontSize={0.052} letterSpacing={0.08} anchorX="center" anchorY="middle" position={[0, 0.035, 0.002]} material={signGlow}>
                DO NOT DISTURB
              </Text>
              <Text font={FONT_URL} fontSize={0.028} letterSpacing={0.2} anchorX="center" anchorY="middle" position={[0, -0.05, 0.002]} color="#cfc8ff">
                CODING IN PROGRESS
              </Text>
            </group>

            <StickyNote position={[-0.38, 1.4, 0.004]} color="#ffd84d" text="fix bug #42" tilt={0.08} />
            <StickyNote position={[-0.12, 1.47, 0.004]} color="#ff7ad9" text="ship it!" tilt={-0.1} />
            <StickyNote position={[0.2, 1.38, 0.004]} color="#7df9ff" text="git push --force? NO" tilt={0.05} />
            <StickyNote position={[-0.28, 1.14, 0.004]} color="#9dff7a" text="refill coffee" tilt={-0.06} />

            <group position={[0.22, 0.72, 0.004]} rotation={[0, 0, 0.03]}>
              <mesh>
                <planeGeometry args={[0.48, 0.62]} />
                <meshStandardMaterial color="#0d0b18" roughness={0.7} />
              </mesh>
              <Text font={FONT_URL} fontSize={0.16} anchorX="center" anchorY="middle" position={[0, 0.1, 0.002]} material={codeGlow}>
                {"</>"}
              </Text>
              <Text font={FONT_URL} fontSize={0.03} lineHeight={1.5} textAlign="center" anchorX="center" anchorY="middle" position={[0, -0.16, 0.002]} color="#cfc8ff">
                {"EAT · SLEEP\nCODE · REPEAT"}
              </Text>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Block({ size, position }: { size: [number, number, number]; position: [number, number, number] }) {
  const mat = useWallMaterial(size[0], size[1]);
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  );
}

const DOOR_W = 1.5;
const DOOR_H = 2.7;

/** Front wall with the door the tour enters through. */
function FrontWall() {
  const side = (2 * XW - DOOR_W) / 2;
  return (
    <group>
      <Block size={[side, H, 0.2]} position={[-(DOOR_W + side) / 2, H / 2, FRONT_Z]} />
      <Block size={[side, H, 0.2]} position={[(DOOR_W + side) / 2, H / 2, FRONT_Z]} />
      <Block size={[DOOR_W, H - DOOR_H, 0.2]} position={[0, (H + DOOR_H) / 2, FRONT_Z]} />
      <Door />
      {/* front corner strips and baseboard, matching the back of the room */}
      {[-XW + 0.05, XW - 0.05].map((x) => (
        <mesh key={x} position={[x, H / 2, FRONT_Z - 0.12]} material={accentNeon}>
          <boxGeometry args={[0.04, H, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, FRONT_Z - 0.11]} material={accentNeonSoft}>
        <boxGeometry args={[2 * XW, 0.03, 0.02]} />
      </mesh>
    </group>
  );
}

/** Framed certificates on the front wall, left of the door (seen from inside): the Certificates stop of the tour. */
function CredentialWall() {
  const frame = useMemo(() => neon("#ffb547", 1.2), []);
  const paper = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1626", roughness: 0.6, metalness: 0.2, emissive: "#2a2034", emissiveIntensity: 0.6 }), []);
  const ink = useMemo(() => neon("#ffe2b0", 0.35), []);
  const seal = useMemo(() => neon("#ffb547", 0.9), []);
  const frames: [number, number][] = [
    [2.0, 2.9],
    [3.45, 2.9],
    [4.9, 2.9],
    [2.72, 1.75],
    [4.17, 1.75],
  ];
  const w = 1.2;
  const h = 0.9;
  return (
    <group position={[0, 0, FRONT_Z - 0.11]} rotation={[0, Math.PI, 0]}>
      {frames.map(([x, y]) => (
        // the group is turned to face into the room, so +x here is world -x
        <group key={`${x}-${y}`} position={[x, y, 0]}>
          <mesh material={paper}>
            <boxGeometry args={[w, h, 0.02]} />
          </mesh>
          {[h / 2, -h / 2].map((fy) => (
            <mesh key={fy} position={[0, fy, 0.015]} material={frame}>
              <boxGeometry args={[w + 0.03, 0.025, 0.02]} />
            </mesh>
          ))}
          {[w / 2, -w / 2].map((fx) => (
            <mesh key={fx} position={[fx, 0, 0.015]} material={frame}>
              <boxGeometry args={[0.025, h, 0.02]} />
            </mesh>
          ))}
          {/* title and text lines */}
          <mesh position={[0, 0.22, 0.012]} material={ink}>
            <planeGeometry args={[0.62, 0.05]} />
          </mesh>
          {[0.05, -0.04, -0.13].map((ly, i) => (
            <mesh key={ly} position={[0, ly, 0.012]} material={ink}>
              <planeGeometry args={[i === 0 ? 0.7 : 0.5, 0.018]} />
            </mesh>
          ))}
          <mesh position={[0.36, -0.27, 0.012]} material={seal}>
            <circleGeometry args={[0.07, 24]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Three project screens on the front wall, right of the door (seen from inside): the Projects stop of the tour. */
function ProjectScreens() {
  const frame = useMemo(() => neon("#ff3df2", 1.2), []);
  const screens = useMemo(
    () =>
      [codeTexture(), designTexture(), dashboardTexture()].map(
        (map) => new THREE.MeshBasicMaterial({ map, toneMapped: false, color: new THREE.Color(0.7, 0.7, 0.8) }),
      ),
    [],
  );
  const w = 1.3;
  const h = 0.82;
  const spots: [number, number][] = [
    [-2.05, 2.5],
    [-3.5, 2.5],
    [-4.95, 2.5],
  ];
  return (
    <group position={[0, 0, FRONT_Z - 0.11]} rotation={[0, Math.PI, 0]}>
      {spots.map(([x, y], i) => (
        <group key={x} position={[x, y, 0]}>
          <mesh material={screens[i]}>
            <planeGeometry args={[w, h]} />
          </mesh>
          {[h / 2, -h / 2].map((fy) => (
            <mesh key={fy} position={[0, fy, 0.01]} material={frame}>
              <boxGeometry args={[w + 0.03, 0.025, 0.02]} />
            </mesh>
          ))}
          {[w / 2, -w / 2].map((fx) => (
            <mesh key={fx} position={[fx, 0, 0.01]} material={frame}>
              <boxGeometry args={[0.025, h, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
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
    <group position={[-XW, yc, zc]}>
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
  // A deliberate "power on" blink, with a buzz on each flash, as the visitor walks up to the desk.
  const blink = useRef({ armed: true, t: -1, lastOn: false });

  useFrame((state, dt) => {
    const b = blink.current;
    const entry = useApp.getState().mode === "home" ? document.getElementById("entry") : null;
    if (entry) {
      const top = entry.getBoundingClientRect().top;
      if (b.armed && top < -0.35 * window.innerHeight) {
        b.armed = false;
        b.t = 0;
      } else if (!b.armed && top > 0) b.armed = true; // scrolled back up: blink again next time
    }

    flicker.current -= dt;
    let k = 1;
    if (b.t >= 0) {
      b.t += dt;
      const on = b.t > 1.05 || (b.t > 0.15 && b.t < 0.23) || (b.t > 0.42 && b.t < 0.5) || (b.t > 0.62 && b.t < 0.68) || b.t > 0.85;
      if (on && !b.lastOn) sound.neonBuzz();
      b.lastOn = on;
      k = on ? 1 : 0.08;
      if (b.t > 1.2) b.t = -1;
    } else if (flicker.current < 0) {
      if (Math.random() < 0.012) flicker.current = 0.12 + Math.random() * 0.2;
    } else {
      k = Math.random() > 0.5 ? 0.25 : 1;
    }
    sign.color.copy(base).multiplyScalar(k);
    halo.uniforms.uI.value = k;
  });

  return (
    <group position={[0, 3.45, ZB + 0.06]}>
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
        <mesh key={z} position={[XW - 0.05, 2.4, z]} material={accentNeon}>
          <boxGeometry args={[0.03, 3.2, 0.05]} />
        </mesh>
      ))}
      <mesh position={[-XW + 0.05, 3.3, 3.2]} material={amber}>
        <boxGeometry args={[0.03, 0.03, 5]} />
      </mesh>
      <mesh position={[-3.6, 3.95, ZB + 0.05]} material={accentNeonSoft}>
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
    <group position={[XW - 0.25, 0, -5.4]} rotation={[0, -Math.PI / 2, 0]}>
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
    <group position={[REVEAL_SPOT[0], 0.01, REVEAL_SPOT[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[1.2, 64]} />
        <meshStandardMaterial color="#07060d" roughness={1} metalness={0} envMapIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.002]} material={accentNeonSoft}>
        <ringGeometry args={[1.12, 1.16, 64]} />
      </mesh>
    </group>
  );
}

const propDark = new THREE.MeshStandardMaterial({ color: "#14121f", roughness: 0.6, metalness: 0.4 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#1d6b52", roughness: 0.7, emissive: "#0b3b2e", emissiveIntensity: 0.6 });
const fabricMat = new THREE.MeshStandardMaterial({ color: "#2a1f4a", roughness: 0.95 });

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leaves = [0, 1.3, 2.5, 3.8, 5.1];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} material={propDark}>
        <cylinderGeometry args={[0.22, 0.16, 0.44, 20]} />
      </mesh>
      {leaves.map((a, i) => (
        <mesh key={a} material={leafMat} position={[Math.cos(a) * 0.1, 0.75 + (i % 2) * 0.12, Math.sin(a) * 0.1]} rotation={[Math.cos(a) * 0.5, a, Math.sin(a) * 0.5]} scale={[0.12, 0.5, 0.04]}>
          <sphereGeometry args={[1, 10, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Poster({ position, color, lines }: { position: [number, number, number]; color: string; lines: string }) {
  const glow = useMemo(() => neon(color, 1.1), [color]);
  return (
    <group position={position}>
      <mesh material={propDark}>
        <planeGeometry args={[1.0, 1.35]} />
      </mesh>
      {[0.675, -0.675].map((y) => (
        <mesh key={y} position={[0, y, 0.01]} material={glow}>
          <boxGeometry args={[1.02, 0.02, 0.01]} />
        </mesh>
      ))}
      {[0.5, -0.5].map((x) => (
        <mesh key={x} position={[x, 0, 0.01]} material={glow}>
          <boxGeometry args={[0.02, 1.35, 0.01]} />
        </mesh>
      ))}
      <Text font={FONT_URL} fontSize={0.12} lineHeight={1.35} letterSpacing={0.06} textAlign="center" anchorX="center" anchorY="middle" position={[0, 0, 0.02]} material={glow}>
        {lines}
      </Text>
    </group>
  );
}

const shelfWood = new THREE.MeshStandardMaterial({ color: "#1b1729", roughness: 0.55, metalness: 0.35 });
const BOOK_COLORS = ["#3a2f6b", "#1f3d5a", "#5a2150", "#2b2b45", "#403c7a", "#1f5a4c", "#6b3a2f", "#27415e"];

/** A tall bookshelf packed with books and a few keepsakes; its back faces local -z, against a wall. */
function Bookshelf({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const glow = useMemo(() => neon("#ff3df2", 0.8), []);
  const W = 1.6;
  const Hs = 2.3;
  const D = 0.38;
  const shelves = [0.06, 0.62, 1.18, 1.74, 2.26];
  // deterministic "random" book rows, so the shelf looks the same on every render
  const rows = useMemo(
    () =>
      shelves.slice(0, 4).map((y, row) => {
        const books: { x: number; w: number; h: number; c: string; tilt: number }[] = [];
        let x = -W / 2 + 0.06;
        let i = row * 7;
        while (x < W / 2 - 0.12) {
          const w = 0.05 + ((i * 37) % 5) * 0.012;
          const h = 0.3 + ((i * 53) % 7) * 0.025;
          if ((i * 13) % 9 === 0 && row !== 1) x += 0.22; // leave a gap now and then
          if (x + w > W / 2 - 0.06) break;
          books.push({ x: x + w / 2, w, h, c: BOOK_COLORS[(i * 5) % BOOK_COLORS.length], tilt: (i * 29) % 11 === 0 ? 0.18 : 0 });
          x += w + 0.008;
          i++;
        }
        return { y: y + 0.02, books };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-W / 2, W / 2].map((x) => (
        <mesh key={x} position={[x, Hs / 2, 0]} material={shelfWood}>
          <boxGeometry args={[0.04, Hs, D]} />
        </mesh>
      ))}
      <mesh position={[0, Hs / 2, -D / 2 + 0.01]} material={shelfWood}>
        <boxGeometry args={[W, Hs, 0.02]} />
      </mesh>
      {shelves.map((y) => (
        <mesh key={y} position={[0, y, 0]} material={shelfWood}>
          <boxGeometry args={[W, 0.035, D]} />
        </mesh>
      ))}
      {/* thin glow under the top shelf */}
      <mesh position={[0, 2.23, D / 2 - 0.01]} material={glow}>
        <boxGeometry args={[W - 0.1, 0.01, 0.01]} />
      </mesh>
      {rows.map(({ y, books }) =>
        books.map((b, j) => (
          <mesh key={`${y}-${j}`} position={[b.x, y + b.h / 2, 0]} rotation={[0, 0, b.tilt]}>
            <boxGeometry args={[b.w, b.h, D * 0.72]} />
            <meshStandardMaterial color={b.c} roughness={0.75} />
          </mesh>
        )),
      )}
      {/* keepsakes on the top */}
      <mesh position={[-0.45, 2.36, 0]} material={shelfWood}>
        <boxGeometry args={[0.22, 0.16, 0.22]} />
      </mesh>
      <mesh position={[0.4, 2.4, 0]}>
        <icosahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#b98cff" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BeanBag({ position, color, rotation = 0 }: { position: [number, number, number]; color: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.3, 0]} scale={[0.62, 0.34, 0.58]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* backrest */}
      <mesh position={[0, 0.52, -0.26]} scale={[0.5, 0.34, 0.3]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

/** Round side table with a mug and a closed laptop. */
function SideTable({ position }: { position: [number, number, number] }) {
  const rim = useMemo(() => neon("#3df5ff", 0.8), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.48, 0]} material={shelfWood}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 28]} />
      </mesh>
      <mesh position={[0, 0.465, 0]} material={rim}>
        <torusGeometry args={[0.32, 0.006, 6, 40]} />
      </mesh>
      <mesh position={[0, 0.24, 0]} material={shelfWood}>
        <cylinderGeometry args={[0.03, 0.03, 0.46, 10]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={shelfWood}>
        <cylinderGeometry args={[0.18, 0.2, 0.03, 20]} />
      </mesh>
      <mesh position={[0.12, 0.55, 0.05]}>
        <cylinderGeometry args={[0.045, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#e8e2ff" roughness={0.4} />
      </mesh>
      <mesh position={[-0.08, 0.51, -0.04]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.22]} />
        <meshStandardMaterial color="#6d6a82" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Everyday things that make the studio feel lived in: rug, PC, plants, lamp, posters, a bean bag. */
function Props() {
  const rim = useMemo(() => neon("#3df5ff", 0.9), []);
  const lampGlow = useMemo(() => neon("#ffd2a0", 1.4), []);
  return (
    <group>
      {/* rug under the desk */}
      <mesh position={[0, 0.008, -5.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 2.6]} />
        <meshStandardMaterial color="#1a1030" roughness={1} />
      </mesh>
      <mesh position={[0, 0.011, -5.6]} rotation={[-Math.PI / 2, 0, 0]} material={accentNeonSoft}>
        <ringGeometry args={[1.28, 1.3, 4, 1, Math.PI / 4]} />
      </mesh>

      {/* PC tower beside the desk */}
      <group position={[2.05, 0, -6.45]}>
        <mesh position={[0, 0.3, 0]} material={propDark}>
          <boxGeometry args={[0.24, 0.6, 0.5]} />
        </mesh>
        <mesh position={[-0.125, 0.3, 0]} material={rim}>
          <boxGeometry args={[0.005, 0.5, 0.4]} />
        </mesh>
      </group>

      {/* floor lamp on the far side of the desk */}
      <group position={[-2.7, 0, -6.8]}>
        <mesh position={[0, 0.02, 0]} material={propDark}>
          <cylinderGeometry args={[0.2, 0.22, 0.04, 20]} />
        </mesh>
        <mesh position={[0, 0.85, 0]} material={propDark}>
          <cylinderGeometry args={[0.018, 0.018, 1.7, 8]} />
        </mesh>
        <mesh position={[0, 1.75, 0]} material={lampGlow}>
          <cylinderGeometry args={[0.16, 0.24, 0.26, 20, 1, true]} />
        </mesh>
      </group>

      {/* posters either side of the sign */}
      <Poster position={[-3.5, 2.1, ZB + 0.03]} color="#3df5ff" lines={"HELLO\nWORLD\n</>"} />
      <Poster position={[3.5, 2.1, ZB + 0.03]} color="#ff3df2" lines={"THINK\nDESIGN\nBUILD"} />

      {/* plants in the corners */}
      <Plant position={[-5.3, 0, -6.8]} scale={1.2} />
      <Plant position={[5.3, 0, 4.8]} />
      <Plant position={[-5.3, 0, 4.8]} scale={0.9} />

      {/* bookshelf against the left wall, between the plant in the front corner and the portal */}
      <Bookshelf position={[-XW + 0.2, 0, 3.3]} rotation={Math.PI / 2} />
      {/* lounge spot under the window: bean bag and a side table */}
      <BeanBag position={[-4.6, 0, -2.3]} color="#1d4a52" rotation={1.4} />
      <SideTable position={[-4.7, 0, -1.4]} />
    </group>
  );
}

// The skills hologram: right of the middle of the room, so it sits beside the skill cards.
const HOLOGRAM: [number, number, number] = [3.8, 0, 0.2];

function Lights({ tier }: { tier: Tier }) {
  const accentLight = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (accentLight.current) accentLight.current.color.copy(accentNeon.color).multiplyScalar(0.45);
  });
  return (
    <>
      <ambientLight intensity={0.45} color="#6a5a9e" />
      <hemisphereLight args={["#3a2c6e", "#07050d", 0.7]} />
      <pointLight position={[0, 3.4, -6.6]} color="#ff3df2" intensity={20} distance={10} decay={2} />
      <pointLight position={[HOLOGRAM[0], 1.8, HOLOGRAM[2]]} color="#3df5ff" intensity={14} distance={8} decay={2} />
      {/* wash for the front wall: project screens (magenta) and credential wall (amber) */}
      <pointLight position={[3.5, 3.0, FRONT_Z - 1.6]} color="#ff3df2" intensity={9} distance={6} decay={2} />
      <pointLight position={[-3.5, 3.0, FRONT_Z - 1.6]} color="#ffb547" intensity={9} distance={6} decay={2} />
      <pointLight position={[-4.8, 3.0, -3.6]} color="#7a5cff" intensity={18} distance={10} decay={2} />
      <pointLight ref={accentLight} position={[0, H - 0.3, 0]} intensity={22} distance={12} decay={2} />
      {tier !== "low" && (
        <>
          <pointLight position={[0, 1.7, -6.2]} color="#8a9cff" intensity={6} distance={4} decay={2} />
          <pointLight position={[-1.2, 1.55, -6.6]} color="#ffb070" intensity={4} distance={3} decay={2} />
          <pointLight position={[4.8, 3.6, 1.7]} color="#ff3df2" intensity={12} distance={7} decay={2} />
          <pointLight position={[-4.8, 3.6, 3.2]} color="#ffb547" intensity={12} distance={7} decay={2} />
        </>
      )}
    </>
  );
}

export default function Room({ tier }: { tier: Tier }) {
  return (
    <group>
      <Environment frames={1} resolution={128}>
        <Lightformer form="rect" intensity={3} color="#ff3df2" position={[0, 3.6, ZB]} scale={[9, 1.5, 1]} />
        <Lightformer form="rect" intensity={2} color="#3df5ff" position={[XW, 3, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#7a5cff" position={[-XW, 3, -3]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, H + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
      </Environment>
      <Lights tier={tier} />
      <Structure tier={tier} />
      <Window />
      <FrontWall />
      <CredentialWall />
      <ProjectScreens />
      <NeonSign />
      <Shelf />
      <Rug />
      <Workstation />
      <RoomReveal tier={tier} />
      <Hologram position={HOLOGRAM} />
      <Props />
      <WallLights />
      <City count={tier === "low" ? 110 : 220} traffic={tier === "low" ? 16 : 40} />
      <Particles count={tier === "low" ? 100 : tier === "medium" ? 200 : 320} />
    </group>
  );
}

