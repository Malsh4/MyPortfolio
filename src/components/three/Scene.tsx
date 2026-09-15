"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "@/lib/store";
import Room from "./Room";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import { setBoost } from "./shared";

function ReadySignal() {
  const done = useRef(0);
  useFrame(() => {
    if (++done.current === 3) useApp.getState().setSceneReady(true);
  });
  return null;
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Scene() {
  const tier = useApp((s) => s.tier);
  const quality = useApp((s) => s.quality);
  const stageCover = useApp((s) => s.stageCover);
  const [antialias] = useState(() => tier !== "low");
  const [supported] = useState(webglAvailable);

  useEffect(() => {
    setBoost(tier === "low" ? 1.15 : 2.4);
  }, [tier]);

  useEffect(() => {
    if (!supported) useApp.getState().setSceneReady(true);
  }, [supported]);

  if (!supported) {
    return <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_30%,#2a0f3d,#04040a_70%)]" />;
  }

  const dpr: [number, number] = tier === "high" ? [1, 2] : tier === "medium" ? [1, 1.5] : [0.75, 1];

  return (
    <Canvas
      dpr={dpr}
      frameloop={stageCover ? "never" : "always"}
      gl={{ antialias, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 45, near: 0.1, far: 700, position: [0, 4.2, 15] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={["#05040c"]} />
      <fog attach="fog" args={["#0b0718", 22, 160]} />
      <Suspense fallback={null}>
        <Room tier={tier} />
        <ReadySignal />
      </Suspense>
      <CameraRig />
      {tier !== "low" && <Effects tier={tier} />}
      {quality === "auto" && (
        <PerformanceMonitor
          flipflops={2}
          onDecline={() => {
            const t = useApp.getState().tier;
            useApp.getState().setTier(t === "high" ? "medium" : "low");
          }}
        />
      )}
    </Canvas>
  );
}
