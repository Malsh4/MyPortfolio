// Beats of the materialization sequence, as fractions of `reveal.p`. The portal (floor → rings) opens by itself;
// the model build that follows is driven by scrolling.
export const BEATS = {
  floor: [0.0, 0.1],
  line: [0.08, 0.22],
  open: [0.22, 0.4],
  rings: [0.34, 0.48],
  build: [0.48, 1.0],
} as const;

/**
 * Reveal state, written by GSAP and read every frame by the stage.
 * - `portal`: 0 → 1, timed, plays once the section comes into view.
 * - `build`: 0 → 1, timed, plays straight after the portal has opened.
 * - `p`: the combined sequence progress that the stage reads.
 */
export const reveal = {
  portal: 0,
  build: 0,
  get p() {
    const opened = this.portal * BEATS.build[0];
    return this.build > 0 ? Math.max(opened, BEATS.build[0] + this.build * (1 - BEATS.build[0])) : opened;
  },
};

/** How long the portal takes to open, then the model to build, in seconds. */
export const PORTAL_SECONDS = 1.4;
export const BUILD_SECONDS = 2.4;

/** Local 0 → 1 progress of `p` inside the range [a, b]. */
export const phase = (p: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The middle of the room, where the camera stands and turns for the whole home-page tour. */
export const TOUR_CENTER: [number, number, number] = [0, 1.9, -0.3];

// Where the portal stands: against the left wall, the second-to-last stop of the tour. It is placed so the camera,
// standing near the middle of the room and facing REVEAL_HEADING, frames it from REVEAL_DISTANCE away; the portal faces back
// towards the camera (local +z points at it).
const REVEAL_HEADING = (262 * Math.PI) / 180; // clockwise from facing the back wall
const REVEAL_DISTANCE = 5;
const REVEAL_CAM_HEIGHT = 1.5;
export const REVEAL_SPOT: [number, number, number] = [
  TOUR_CENTER[0] + Math.sin(REVEAL_HEADING) * REVEAL_DISTANCE,
  0,
  TOUR_CENTER[2] - Math.cos(REVEAL_HEADING) * REVEAL_DISTANCE,
];
export const REVEAL_YAW = Math.atan2(-Math.sin(REVEAL_HEADING), Math.cos(REVEAL_HEADING));
const toWorld = (x: number, y: number, z: number): [number, number, number] => [
  REVEAL_SPOT[0] + x * Math.cos(REVEAL_YAW) + z * Math.sin(REVEAL_YAW),
  REVEAL_SPOT[1] + y,
  REVEAL_SPOT[2] - x * Math.sin(REVEAL_YAW) + z * Math.cos(REVEAL_YAW),
];
/** Her hips, in world space: the headline is anchored here. */
export const REVEAL_HIP = toWorld(0, 0.95, 0.25);
export const REVEAL_CAM = { p: toWorld(0, REVEAL_CAM_HEIGHT, REVEAL_DISTANCE), t: toWorld(0, 1.1, 0) };
