"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { BEATS, phase, reveal } from "./state";

export const AVATAR_HEIGHT = 1.72;

/** Solid material shows below the scan line, hologram ghost above it — so the body builds up from the feet. */
export function useClipPlanes() {
  return useMemo(
    () => ({
      below: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      above: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      set(y: number) {
        this.below.constant = y;
        this.above.constant = -y;
      },
    }),
    [],
  );
}

type Planes = ReturnType<typeof useClipPlanes>;

function ghostMaterial(plane: THREE.Plane, wireframe = true) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color("#3df5ff").multiplyScalar(wireframe ? 1.6 : 0.9),
    wireframe,
    transparent: true,
    opacity: wireframe ? 0.16 : 0.09,
    blending: wireframe ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    clippingPlanes: [plane],
  });
}

const IDLE = "BreathingIdle";
const WAVE = "GreetingWave";

/** Scales any model to a standing height of AVATAR_HEIGHT with its feet at y = 0. */
function normalize(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = size.y > 0 ? AVATAR_HEIGHT / size.y : 1;
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(root);
  const c = b2.getCenter(new THREE.Vector3());
  root.position.set(-c.x, -b2.min.y, -c.z);
}

/**
 * Amandi's GLB, cloned into a solid body plus a soft hologram ghost that share the same animation.
 * She breathes while materializing, waves once fully built, and waves again if the visitor scrolls back through.
 */
export function ModelAvatar({ url, planes, onReady, withGhost }: { url: string; planes: Planes; onReady: () => void; withGhost: boolean }) {
  const gltf = useGLTF(url);
  const { solid, ghost, mixers } = useMemo(() => {
    const solid = cloneSkinned(gltf.scene);
    const ghost = withGhost ? cloneSkinned(gltf.scene) : null;
    normalize(solid);
    if (ghost) normalize(ghost);
    solid.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const cloned = mats.map((mat) => {
        const c = mat.clone();
        c.clippingPlanes = [planes.below];
        c.clipShadows = true;
        return c;
      });
      m.material = Array.isArray(m.material) ? cloned : cloned[0];
      m.frustumCulled = false;
    });
    if (ghost) {
      // Dense meshes read as noise in wireframe, so the ghost is a soft additive glow instead.
      const gm = ghostMaterial(planes.above, false);
      ghost.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.material = gm;
        m.frustumCulled = false;
      });
    }
    const mixers = [solid, ghost].filter((r): r is THREE.Object3D => !!r).map((root) => new THREE.AnimationMixer(root));
    return { solid, ghost, mixers };
  }, [gltf, planes, withGhost]);

  const current = useRef<string | null>(null);
  const waved = useRef(false);

  const clipFor = (name: string) =>
    THREE.AnimationClip.findByName(gltf.animations, name) ??
    gltf.animations.find((a) => a.name !== "ReferencePose") ??
    gltf.animations[0];

  const play = (name: string, once = false) => {
    const clip = clipFor(name);
    if (!clip) return;
    const prevClip = current.current ? clipFor(current.current) : null;
    mixers.forEach((m) => {
      const next = m.clipAction(clip);
      next.reset();
      next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
      next.clampWhenFinished = once;
      next.fadeIn(0.45).play();
      if (prevClip && prevClip !== clip) m.clipAction(prevClip).fadeOut(0.45);
    });
    current.current = clip.name;
  };

  useEffect(() => {
    play(IDLE);
    const lead = mixers[0];
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action.getClip().name === WAVE) play(IDLE);
    };
    lead?.addEventListener("finished", onFinished);
    onReady();
    return () => {
      lead?.removeEventListener("finished", onFinished);
      mixers.forEach((m) => m.stopAllAction());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixers, onReady]);

  useFrame((_, dt) => {
    const built = phase(reveal.p, BEATS.build);
    if (built >= 1 && !waved.current) {
      waved.current = true;
      play(WAVE, true);
    } else if (built <= 0 && waved.current) {
      waved.current = false;
    }
    mixers.forEach((m) => m.update(Math.min(dt, 0.05)));
  });

  return (
    <group>
      <primitive object={solid} />
      {ghost && <primitive object={ghost} />}
    </group>
  );
}

/** Stand-in figure used until /models/amandi.glb is added. */
export function PlaceholderAvatar({ planes }: { planes: Planes }) {
  const solidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dfe6ea",
        roughness: 0.35,
        metalness: 0.2,
        clippingPlanes: [planes.below],
      }),
    [planes],
  );
  const ghostMat = useMemo(() => ghostMaterial(planes.above), [planes]);
  const breathe = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (breathe.current) breathe.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.006;
  });

  const body = (mat: THREE.Material) => (
    <group>
      <mesh material={mat} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      <mesh material={mat} position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.1, 12]} />
      </mesh>
      <mesh material={mat} position={[0, 1.18, 0]}>
        <capsuleGeometry args={[0.17, 0.34, 8, 16]} />
      </mesh>
      <mesh material={mat} position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.15, 0.08, 8, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={mat} position={[s * 0.25, 1.1, 0]} rotation={[0, 0, s * 0.12]}>
            <capsuleGeometry args={[0.045, 0.5, 6, 12]} />
          </mesh>
          <mesh material={mat} position={[s * 0.1, 0.45, 0]}>
            <capsuleGeometry args={[0.07, 0.72, 6, 12]} />
          </mesh>
          <mesh material={mat} position={[s * 0.1, 0.03, 0.05]}>
            <boxGeometry args={[0.1, 0.06, 0.24]} />
          </mesh>
        </group>
      ))}
    </group>
  );

  return (
    <group ref={breathe}>
      {body(solidMat)}
      {body(ghostMat)}
    </group>
  );
}
