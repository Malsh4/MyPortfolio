import * as THREE from "three";

// Procedural canvas textures, so the room ships without any image assets.

const PALETTE = ["#ff3df2", "#3df5ff", "#a56bff", "#ffb547", "#5dff9d", "#8e8cab"];

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function finish(c: HTMLCanvasElement, opts: { repeatY?: boolean } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (opts.repeatY) {
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 0.5);
  }
  return t;
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Tileable "code editor" texture; scroll it by animating texture.offset.y. */
export function codeTexture() {
  const [c, ctx] = canvas(640, 1280);
  const r = rand(7);
  ctx.fillStyle = "#0a0b17";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#12132a";
  ctx.fillRect(0, 0, 56, c.height);
  const lineH = 26;
  let indent = 0;
  for (let i = 0; i < c.height / lineH; i++) {
    const y = i * lineH + 8;
    ctx.fillStyle = "#3b3a5c";
    ctx.font = "14px monospace";
    ctx.fillText(String(i + 1).padStart(3, " "), 10, y + 14);
    if (r() < 0.12) continue;
    if (r() < 0.25) indent = Math.max(0, indent + (r() < 0.5 ? 1 : -1));
    let x = 72 + indent * 28;
    const tokens = 1 + Math.floor(r() * 5);
    for (let k = 0; k < tokens && x < c.width - 40; k++) {
      const w = 24 + r() * 110;
      ctx.fillStyle = PALETTE[Math.floor(r() * PALETTE.length)];
      ctx.globalAlpha = 0.85;
      roundRect(ctx, x, y + 5, w, 11, 5);
      ctx.fill();
      x += w + 10;
    }
    ctx.globalAlpha = 1;
  }
  return finish(c, { repeatY: true });
}

/** Figma-style design board with mobile screens. */
export function designTexture() {
  const [c, ctx] = canvas(1024, 600);
  ctx.fillStyle = "#111022";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#23213d";
  for (let x = 180; x < 860; x += 20) for (let y = 40; y < 600; y += 20) ctx.fillRect(x, y, 2, 2);
  // top bar + side panels
  ctx.fillStyle = "#1a1830";
  ctx.fillRect(0, 0, c.width, 36);
  ctx.fillRect(0, 36, 170, c.height);
  ctx.fillRect(864, 36, 160, c.height);
  ctx.fillStyle = "#ff3df2";
  ctx.fillRect(14, 12, 12, 12);
  ctx.fillStyle = "#8e8cab";
  ctx.font = "13px sans-serif";
  ctx.fillText("Portfolio / Mobile — Flows", 36, 23);
  const layers = ["Onboarding", "Home", "Live map", "Tickets", "Profile", "Components", "Tokens"];
  layers.forEach((l, i) => {
    ctx.fillStyle = i === 2 ? "#3df5ff" : "#8e8cab";
    ctx.fillText(`▸ ${l}`, 16, 70 + i * 28);
  });
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "#2a2745";
    ctx.fillRect(880, 60 + i * 34, 60 + ((i * 37) % 70), 10);
  }
  // phones
  const phones = [
    { x: 205, accent: "#ff3df2", title: "Home" },
    { x: 425, accent: "#3df5ff", title: "Live map" },
    { x: 645, accent: "#a56bff", title: "Tickets" },
  ];
  phones.forEach((p, i) => {
    ctx.fillStyle = "#07070f";
    roundRect(ctx, p.x, 70, 190, 400, 22);
    ctx.fill();
    ctx.strokeStyle = i === 1 ? "#3df5ff" : "#34315a";
    ctx.lineWidth = i === 1 ? 3 : 1.5;
    ctx.stroke();
    ctx.fillStyle = "#e9e7f5";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(p.title, p.x + 18, 112);
    ctx.fillStyle = p.accent;
    roundRect(ctx, p.x + 18, 128, 154, 80, 12);
    ctx.fill();
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = "#1b1a31";
      roundRect(ctx, p.x + 18, 222 + k * 52, 154, 42, 10);
      ctx.fill();
      ctx.fillStyle = "#4c4872";
      ctx.fillRect(p.x + 64, 236 + k * 52, 80, 6);
      ctx.fillRect(p.x + 64, 248 + k * 52, 50, 5);
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.arc(p.x + 40, 243 + k * 52, 11, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = p.accent;
    roundRect(ctx, p.x + 18, 432, 154, 26, 13);
    ctx.fill();
  });
  // prototype arrows
  ctx.strokeStyle = "#3df5ff";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(395, 170);
  ctx.bezierCurveTo(410, 120, 420, 120, 425, 160);
  ctx.moveTo(615, 300);
  ctx.bezierCurveTo(630, 250, 640, 250, 645, 290);
  ctx.stroke();
  ctx.setLineDash([]);
  return finish(c);
}

/** Research dashboard: charts and usability metrics. */
export function dashboardTexture() {
  const [c, ctx] = canvas(1024, 600);
  const r = rand(21);
  ctx.fillStyle = "#0b0a17";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#8e8cab";
  ctx.font = "bold 18px monospace";
  ctx.fillText("USABILITY_TESTS // SESSION 07", 30, 44);
  // line chart
  ctx.strokeStyle = "#23213d";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(30, 90 + i * 45);
    ctx.lineTo(620, 90 + i * 45);
    ctx.stroke();
  }
  const draw = (color: string, amp: number, off: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    for (let x = 0; x <= 590; x += 10) {
      const y = 250 - Math.sin(x / 70 + off) * amp - x * 0.18 - r() * 12;
      if (x === 0) ctx.moveTo(30 + x, y);
      else ctx.lineTo(30 + x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };
  draw("#3df5ff", 30, 0);
  draw("#ff3df2", 22, 2);
  // bars
  for (let i = 0; i < 12; i++) {
    const h = 40 + r() * 150;
    ctx.fillStyle = i % 3 === 0 ? "#ff3df2" : "#a56bff";
    ctx.fillRect(40 + i * 48, 560 - h, 30, h);
  }
  // gauges
  [["#3df5ff", 0.82, "TASK SUCCESS"], ["#ffb547", 0.64, "EASE OF USE"]].forEach(([col, v, label], i) => {
    const cx = 820;
    const cy = 170 + i * 250;
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#1d1b33";
    ctx.beginPath();
    ctx.arc(cx, cy, 90, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();
    ctx.strokeStyle = col as string;
    ctx.shadowColor = col as string;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, 90, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * (v as number)));
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e9e7f5";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round((v as number) * 100)}`, cx, cy + 12);
    ctx.font = "13px monospace";
    ctx.fillStyle = "#8e8cab";
    ctx.fillText(label as string, cx, cy + 118);
    ctx.textAlign = "left";
  });
  return finish(c);
}

/** Sci-fi wall panel seams for walls and ceiling. */
export function panelTexture() {
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = "#0d0c1a";
  ctx.fillRect(0, 0, 512, 512);
  const r = rand(3);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.008 + r() * 0.02})`;
    ctx.fillRect(r() * 512, r() * 512, 40 + r() * 200, 40 + r() * 200);
  }
  ctx.strokeStyle = "rgba(160,150,255,0.14)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 510, 510);
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 256);
  ctx.stroke();
  ctx.fillStyle = "rgba(160,150,255,0.25)";
  [[12, 12], [500, 12], [12, 500], [500, 500], [12, 268], [500, 268]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Soft round sprite for particles. */
export function dotTexture() {
  const [c, ctx] = canvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return finish(c);
}
