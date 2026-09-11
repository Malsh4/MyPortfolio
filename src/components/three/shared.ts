import * as THREE from "three";

/** Live accent colour of the room; lerped toward the active section's colour every frame by CameraRig. */
export const accent = new THREE.Color("#ff3df2");
export const accentTarget = new THREE.Color("#ff3df2");

/** HDR multiplier for neon materials. Bloom tiers push colours above 1 so they glow; low tier stays in range. */
let boost = 2.4;
export const getBoost = () => boost;

type NeonEntry = { mat: THREE.MeshBasicMaterial; base: THREE.Color; strength: number };
const registry: NeonEntry[] = [];

/** Unlit neon material that glows under bloom. */
export function neon(color: THREE.ColorRepresentation, strength = 1, opts: THREE.MeshBasicMaterialParameters = {}) {
  const base = new THREE.Color(color);
  const mat = new THREE.MeshBasicMaterial({ toneMapped: false, ...opts });
  mat.color.copy(base).multiplyScalar(strength * boost);
  registry.push({ mat, base, strength });
  return mat;
}

export function setBoost(value: number) {
  boost = value;
  for (const e of registry) e.mat.color.copy(e.base).multiplyScalar(e.strength * boost);
}

export const accentNeon = new THREE.MeshBasicMaterial({ toneMapped: false });
export const accentNeonSoft = new THREE.MeshBasicMaterial({
  toneMapped: false,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

export function updateAccent(dt: number) {
  accent.lerp(accentTarget, 1 - Math.exp(-dt * 2.2));
  accentNeon.color.copy(accent).multiplyScalar(boost * 1.1);
  accentNeonSoft.color.copy(accent).multiplyScalar(boost * 0.6);
}

export const FONT_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/fonts/orbitron-700.woff`;
