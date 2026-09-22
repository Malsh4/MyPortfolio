"use client";

import { useMemo } from "react";
import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { Tier } from "@/lib/store";

export default function Effects({ tier }: { tier: Tier }) {
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);

  if (tier === "high") {
    return (
      <EffectComposer multisampling={4} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.72} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={offset} radialModulation modulationOffset={0.35} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.7} />
    </EffectComposer>
  );
}
