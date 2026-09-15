"use client";

import { Component, Suspense, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { asset } from "@/lib/asset";

function FigureMesh() {
  const { scene } = useGLTF(asset("/models/portfolio-figure.glb"));
  return <primitive object={scene} scale={1.45} dispose={null} />;
}

class FigureBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Static Blender character; an independent boundary keeps the room usable if the asset fails. */
export default function PortfolioFigure() {
  return (
    <group position={[-3.3, 0.025, -4.8]} rotation={[0, 0.2, 0]}>
      <FigureBoundary><Suspense fallback={null}><FigureMesh /></Suspense></FigureBoundary>
      <pointLight position={[0, 2.6, 1.6]} intensity={9} distance={4} color="#ffe0bb" />
    </group>
  );
}
