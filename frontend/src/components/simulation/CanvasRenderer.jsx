import { mag, pickNice, w2s } from "./utils";

const FBD_COLORS = {
  gravity: "#f97316",
  tension: "#a78bfa",
  spring: "#2cb87a",
  drag: "#f43f5e",
  net: "rgba(255,255,255,0.95)",
  colA: "#e8643a",
  colB: "#4a9eff",
};
const ARROW_SCALE = 28;

function drawGrid(ctx, w, h, origin, scale) {
  ctx.clearRect(0, 0, w, h);
  const worldStep = pickNice(60 / scale);
  const pxStep = worldStep * scale;
  const offX = ((origin[0] % pxStep) + pxStep) % pxStep;
  const offY = ((origin[1] % pxStep) + pxStep) % pxStep;
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let x = offX; x <= w; x += pxStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = offY; y <= h; y += pxStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const [ox, oy] = origin;
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.setLineDash([4, 7]);
  if (oy >= 0 && oy <= h) {
    ctx.beginPath();
    ctx.moveTo(0, oy);
    ctx.lineTo(w, oy);
    ctx.stroke();
  }
  if (ox >= 0 && ox <= w) {
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, h);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.font = "600 11px 'DM Mono',monospace";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let x = offX; x <= w; x += pxStep) {
    const wx = (x - ox) / scale;
    if (Math.abs(wx) < worldStep * 0.1) continue;
    const lb = wx.toFixed(wx < 1 && wx > -1 ? 1 : 0);
    const yp = Math.min(Math.max(oy >= 0 && oy <= h ? oy + 14 : h - 4, 14), h - 4);
    ctx.fillText(lb, x - ctx.measureText(lb).width / 2, yp);
  }
  for (let y = offY; y <= h; y += pxStep) {
    const wy = -(y - oy) / scale;
    if (Math.abs(wy) < worldStep * 0.1) continue;
    const lb = wy.toFixed(wy < 1 && wy > -1 ? 1 : 0);
    const xp = Math.min(Math.max(ox >= 0 && ox <= w ? ox + 5 : 5, 5), w - ctx.measureText(lb).width - 5);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(lb, xp, y + 3);
  }
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "700 14px 'DM Mono',monospace";
  if (oy >= 0 && oy <= h) ctx.fillText("x (m)", w - 44, Math.min(Math.max(oy - 9, 13), h - 5));
  if (ox >= 0 && ox <= w) ctx.fillText("y (m)", Math.min(Math.max(ox + 5, 5), w - 34), 15);
}

function drawTrail(ctx, worldTrail, origin, scale, colRgb) {
  const n = worldTrail.length;
  for (let i = 1; i < n; i += 1) {
    const t = i / n;
    const [sx, sy] = w2s(worldTrail[i][0], worldTrail[i][1], origin, scale);
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(t * 4, 0.8), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colRgb},${(t * 0.62).toFixed(2)})`;
    ctx.fill();
  }
}

function drawBall(ctx, sx, sy, col, r = 11) {
  ctx.beginPath();
  ctx.arc(sx, sy, r + 7, 0, Math.PI * 2);
  ctx.fillStyle = col.glow;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fillStyle = col.ball;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx - r * 0.28, sy - r * 0.28, r * 0.27, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  ctx.fill();
}

function drawAnchor(ctx, sx, sy) {
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  for (let i = -3; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(sx + i * 5 - 4, sy - 8);
    ctx.lineTo(sx + i * 5 - 12, sy - 16);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 8);
  ctx.lineTo(sx + 18, sy - 8);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx, sy, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawSpringCoil(ctx, x1, y1, x2, y2, col) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const n = 10;
  const amp = 10;
  const margin = 0.07;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + dx * margin, y1 + dy * margin);
  for (let i = 0; i <= n * 2; i += 1) {
    const t = margin + (i / (n * 2)) * (1 - 2 * margin);
    const a = i % 2 === 0 ? amp : -amp;
    ctx.lineTo(x1 + dx * t + px * a, y1 + dy * t + py * a);
  }
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = col.ball;
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.72;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawRod(ctx, x1, y1, x2, y2, col) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = col.ball;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawGround(ctx, origin, scale, w, groundY = -3) {
  const [, oy] = origin;
  const sy = oy - groundY * scale;
  if (sy < 0 || sy > 800) return;
  ctx.strokeStyle = "rgba(255,200,100,0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, sy);
  ctx.lineTo(w, sy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "700 13px 'DM Mono',monospace";
  ctx.fillStyle = "rgba(255,200,100,0.85)";
  ctx.fillText(`ground y = ${groundY} m`, 6, sy - 6);
}

function drawVelArrow(ctx, sx, sy, vx, vy) {
  const speed = mag(vx, vy);
  if (speed < 0.05) return;
  const s = Math.min(speed * 6, 72);
  const nx = vx / speed;
  const ny = vy / speed;
  const ex = sx + nx * s;
  const ey = sy - ny * s;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const ang = Math.atan2(-(ey - sy), ex - sx);
  const hs = 7;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - hs * Math.cos(ang - 0.4), ey + hs * Math.sin(ang - 0.4));
  ctx.lineTo(ex - hs * Math.cos(ang + 0.4), ey + hs * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fill();
}

function fbdArrow(ctx, sx, sy, fx, fy, color, label, scale) {
  const mf = Math.sqrt(fx * fx + fy * fy);
  if (mf < 0.001) return;
  const sr = scale / 90;
  const len = Math.min(Math.max(mf * ARROW_SCALE * sr, 6), 80);
  const nx = fx / mf;
  const ny = fy / mf;
  const ex = sx + nx * len;
  const ey = sy - ny * len;
  const alpha = Math.min(0.35 + (mf / 20) * 0.55, 0.85);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  const ang = Math.atan2(ey - sy, ex - sx);
  const hs = 7;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - hs * Math.cos(ang - 0.4), ey - hs * Math.sin(ang - 0.4));
  ctx.lineTo(ex - hs * Math.cos(ang + 0.4), ey - hs * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = "700 13px 'DM Mono',monospace";
  ctx.fillStyle = color;
  ctx.fillText(label, ex + Math.cos(ang) * 4 + (fx > 0 ? 3 : -25), ey + Math.sin(ang) * 4 - 4);
  ctx.globalAlpha = 1;
}

function drawFBD(ctx, state, origin, scale, experiment, phys, collFrame) {
  if (!state) return;
  ctx.save();
  ctx.lineCap = "round";

  if (experiment === "collision" && collFrame) {
    const [sax, say] = w2s(collFrame.ax, collFrame.ay, origin, scale);
    fbdArrow(ctx, sax, say, 0, -collFrame.a_fg, FBD_COLORS.gravity, "Fg", scale);
    if (collFrame.a_fd > 0.01) {
      const sa = mag(collFrame.avx, collFrame.avy);
      if (sa > 0) {
        fbdArrow(
          ctx,
          sax,
          say,
          (-collFrame.a_fd * collFrame.avx) / sa,
          (-collFrame.a_fd * collFrame.avy) / sa,
          FBD_COLORS.drag,
          "Fd",
          scale
        );
      }
    }
    if (collFrame.colliding) fbdArrow(ctx, sax, say, collFrame.a_fcx, collFrame.a_fcy, FBD_COLORS.colA, "Fc", scale);

    const [sbx, sby] = w2s(collFrame.bx, collFrame.by, origin, scale);
    fbdArrow(ctx, sbx, sby, 0, -collFrame.b_fg, FBD_COLORS.gravity, "Fg", scale);
    if (collFrame.b_fd > 0.01) {
      const sb = mag(collFrame.bvx, collFrame.bvy);
      if (sb > 0) {
        fbdArrow(
          ctx,
          sbx,
          sby,
          (-collFrame.b_fd * collFrame.bvx) / sb,
          (-collFrame.b_fd * collFrame.bvy) / sb,
          FBD_COLORS.drag,
          "Fd",
          scale
        );
      }
    }
    if (collFrame.colliding) fbdArrow(ctx, sbx, sby, collFrame.b_fcx, collFrame.b_fcy, FBD_COLORS.colB, "Fc", scale);

    ctx.restore();
    return;
  }

  const { x: px, y: py } = state.position;
  const { x: vx, y: vy } = state.velocity;
  const m = state.mass ?? phys?.mass ?? 1;
  const g = phys?.gravity ?? 9.81;
  const [sx, sy] = w2s(px, py, origin, scale);

  if (experiment === "projectile") {
    const drag = phys?.drag_coeff ?? 0.1;
    const gf = m * g;
    const dfx = -drag * vx;
    const dfy = -drag * vy;
    fbdArrow(ctx, sx, sy, 0, -gf, FBD_COLORS.gravity, "Fg", scale);
    if (drag > 0.001) fbdArrow(ctx, sx, sy, dfx, dfy, FBD_COLORS.drag, "Fd", scale);
    fbdArrow(ctx, sx, sy, dfx, -gf + dfy, FBD_COLORS.net, "ΣF", scale);
  } else if (experiment === "spring") {
    const k = phys?.k ?? 12;
    const rl = phys?.rest_length ?? 1;
    const damp = phys?.damping ?? 0.3;
    const dist = mag(px, py);
    const stretch = dist - rl;
    const dirx = dist > 0 ? px / dist : 0;
    const diry = dist > 0 ? py / dist : 0;
    const sfx = -k * stretch * dirx;
    const sfy = -k * stretch * diry;
    const dfx = -damp * vx;
    const dfy = -damp * vy;
    const gf = m * g;
    fbdArrow(ctx, sx, sy, 0, -gf, FBD_COLORS.gravity, "Fg", scale);
    fbdArrow(ctx, sx, sy, sfx, sfy, FBD_COLORS.spring, "Fs", scale);
    if (damp > 0.001) fbdArrow(ctx, sx, sy, dfx, dfy, FBD_COLORS.drag, "Fd", scale);
    fbdArrow(ctx, sx, sy, sfx + dfx, sfy + dfy - gf, FBD_COLORS.net, "ΣF", scale);
  } else if (experiment === "pendulum") {
    const L = phys?.length ?? 1.5;
    const damp = phys?.damping ?? 0.08;
    const dist = mag(px, py) || L;
    const rx = px / dist;
    const ry = py / dist;
    const vtx = vx - (vx * rx + vy * ry) * rx;
    const vty = vy - (vx * rx + vy * ry) * ry;
    const vtm = mag(vtx, vty);
    const ten = m * (vtm * vtm / L) - m * g * (-ry);
    const tfx = -rx * ten;
    const tfy = -ry * ten;
    const dfx = -damp * vtx;
    const dfy = -damp * vty;
    const gf = m * g;
    fbdArrow(ctx, sx, sy, 0, -gf, FBD_COLORS.gravity, "Fg", scale);
    fbdArrow(ctx, sx, sy, tfx, tfy, FBD_COLORS.tension, "T", scale);
    if (damp > 0.001) fbdArrow(ctx, sx, sy, dfx, dfy, FBD_COLORS.drag, "Fd", scale);
    fbdArrow(ctx, sx, sy, tfx + dfx, tfy + dfy - gf, FBD_COLORS.net, "ΣF", scale);
  }

  const legend = {
    projectile: [
      { c: FBD_COLORS.gravity, l: "Gravity (Fg)" },
      { c: FBD_COLORS.drag, l: "Drag (Fd)" },
      { c: FBD_COLORS.net, l: "Net (ΣF)" },
    ],
    spring: [
      { c: FBD_COLORS.gravity, l: "Gravity (Fg)" },
      { c: FBD_COLORS.spring, l: "Spring (Fs)" },
      { c: FBD_COLORS.drag, l: "Damping (Fd)" },
      { c: FBD_COLORS.net, l: "Net (ΣF)" },
    ],
    pendulum: [
      { c: FBD_COLORS.gravity, l: "Gravity (Fg)" },
      { c: FBD_COLORS.tension, l: "Tension (T)" },
      { c: FBD_COLORS.drag, l: "Damping (Fd)" },
      { c: FBD_COLORS.net, l: "Net (ΣF)" },
    ],
    collision: [
      { c: FBD_COLORS.gravity, l: "Gravity (Fg)" },
      { c: FBD_COLORS.drag, l: "Drag (Fd)" },
      { c: FBD_COLORS.colA, l: "Collision force A" },
      { c: FBD_COLORS.colB, l: "Collision force B" },
    ],
  }[experiment] || [];

  // legend background panel for contrast against the physics scene
  const legendW = Math.max(...legend.map(l => ctx.measureText(l.l).width)) + 40;
  ctx.fillStyle = "rgba(10,11,16,0.62)";
  ctx.fillRect(8, 16, legendW, legend.length * 17 + 10);

  ctx.font = "700 12.5px 'DM Mono',monospace";
  legend.forEach((l, i) => {
    ctx.fillStyle = l.c;
    ctx.fillRect(15, 29 + i * 17 - 5, 9, 3);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(l.l, 30, 29 + i * 17);
  });
  ctx.restore();
}

function drawDoublePendulum(ctx, meta, origin, scale) {
  if (!meta) return;
  const [ox, oy] = origin;
  const [s1x, s1y] = w2s(meta.p1x, meta.p1y, origin, scale);
  const [s2x, s2y] = w2s(meta.p2x, meta.p2y, origin, scale);
  drawAnchor(ctx, ox, oy);
  drawRod(ctx, ox, oy, s1x, s1y, { ball: "#4a9eff" });
  drawRod(ctx, ox, oy + 0, s1x, s1y + 0, { ball: "#4a9eff" });
  ctx.beginPath();
  ctx.moveTo(s1x, s1y);
  ctx.lineTo(s2x, s2y);
  ctx.strokeStyle = "#a78bfa";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
  drawBall(ctx, s1x, s1y, { ball: "#4a9eff", glow: "#4a9eff22" }, 10);
  drawBall(ctx, s2x, s2y, { ball: "#a78bfa", glow: "#a78bfa22" }, 10);
}

function drawCollisionScene(ctx, frame, origin, scale, showGround, groundY, w) {
  if (!frame) return;
  if (showGround) drawGround(ctx, origin, scale, w, groundY);
  const [sax, say] = w2s(frame.ax, frame.ay, origin, scale);
  const [sbx, sby] = w2s(frame.bx, frame.by, origin, scale);
  const ra = Math.max(4, frame.ar * scale);
  const rb = Math.max(4, frame.br * scale);

  ctx.beginPath();
  ctx.arc(sax, say, ra + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#e8643a22";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sax, say, ra, 0, Math.PI * 2);
  ctx.fillStyle = "#e8643a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sax - ra * 0.28, say - ra * 0.28, ra * 0.27, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(sbx, sby, rb + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#4a9eff22";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sbx, sby, rb, 0, Math.PI * 2);
  ctx.fillStyle = "#4a9eff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sbx - rb * 0.28, sby - rb * 0.28, rb * 0.27, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  ctx.fill();

  if (frame.colliding) {
    const cx = (sax + sbx) / 2;
    const cy = (say + sby) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, (ra + rb) * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  drawVelArrow(ctx, sax, say, frame.avx, frame.avy);
  drawVelArrow(ctx, sbx, sby, frame.bvx, frame.bvy);

  ctx.font = "700 13.5px 'DM Mono',monospace";
  const labelA = `A  ${mag(frame.avx, frame.avy).toFixed(2)} m/s`;
  const labelB = `B  ${mag(frame.bvx, frame.bvy).toFixed(2)} m/s`;
  ctx.fillStyle = "rgba(10,11,16,0.55)";
  ctx.fillRect(sax + ra + 3, say - 18, ctx.measureText(labelA).width + 8, 18);
  ctx.fillRect(sbx + rb + 3, sby - 18, ctx.measureText(labelB).width + 8, 18);
  ctx.fillStyle = "#e8643a";
  ctx.fillText(labelA, sax + ra + 6, say - 4);
  ctx.fillStyle = "#4a9eff";
  ctx.fillText(labelB, sbx + rb + 6, sby - 4);

  if (frame.a_on_ground) {
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sax, say, ra + 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (frame.b_on_ground) {
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sbx, sby, rb + 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function renderFrame(
  ctx,
  w,
  h,
  state,
  worldTrail,
  origin,
  scale,
  experiment,
  showGround,
  groundY,
  showFBD,
  phys,
  colors
) {
  drawGrid(ctx, w, h, origin, scale);

  if (!state) return;
  const col = colors[experiment] || colors.projectile;
  const [ox, oy] = origin;

  if (experiment === "double_pendulum") {
    drawTrail(ctx, worldTrail, origin, scale, col.trail);
    drawDoublePendulum(ctx, state._meta, origin, scale);
    return;
  }

  if (experiment === "collision") {
    drawTrail(ctx, worldTrail, origin, scale, col.trail);
    drawCollisionScene(ctx, state._collision, origin, scale, showGround, groundY, w);
    if (showFBD) drawFBD(ctx, state, origin, scale, experiment, phys, state._collision);
    return;
  }

  const [sx, sy] = w2s(state.position.x, state.position.y, origin, scale);
  if (experiment === "spring" && showGround) drawGround(ctx, origin, scale, w, 0);

  drawTrail(ctx, worldTrail, origin, scale, col.trail);

  if (experiment === "spring") {
    drawAnchor(ctx, ox, oy);
    drawSpringCoil(ctx, ox, oy, sx, sy, col);
  }
  if (experiment === "pendulum") {
    drawAnchor(ctx, ox, oy);
    drawRod(ctx, ox, oy, sx, sy, col);
  }

  drawBall(ctx, sx, sy, col, experiment === "pendulum" ? 13 : 11);
  drawVelArrow(ctx, sx, sy, state.velocity.x, state.velocity.y);
  if (showFBD) drawFBD(ctx, state, origin, scale, experiment, phys, null);

  const posLabel = `(${state.position.x.toFixed(2)}, ${state.position.y.toFixed(2)}) m`;
  ctx.font = "700 13px 'DM Mono',monospace";
  ctx.fillStyle = "rgba(10,11,16,0.55)";
  ctx.fillRect(sx + 12, sy - 24, ctx.measureText(posLabel).width + 8, 18);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(posLabel, sx + 16, sy - 10);
}