// Gobble Run — every danger and pickup on the ground: falling carving
// knives, hot ovens, fences, haystacks to hide in, and corn to grab.
// One job: spawn, move, draw and collide the stuff between Gus and freedom.
import { GROUND_Y, STAGE_LENGTH, clamp } from './config.js';

export function mulberry(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildStageLayout(stageIndex, seed) {
  const rand = mulberry(seed + stageIndex * 7919);
  const base = stageIndex * STAGE_LENGTH;
  const corn = [];
  const ovens = [];
  const hay = [];
  const fences = [];
  const cornCount = 7 + stageIndex;
  for (let i = 0; i < cornCount; i++) {
    corn.push({
      x: base + 220 + rand() * (STAGE_LENGTH - 420),
      y: GROUND_Y - 30 - rand() * 90,
      golden: rand() < 0.22,
      taken: false,
      bob: rand() * 6,
    });
  }
  const ovenCount = 1 + stageIndex;
  for (let i = 0; i < ovenCount; i++) {
    ovens.push({ x: base + 500 + i * 420 + rand() * 120, w: 92, h: 74, glow: rand() * 6 });
  }
  const hayCount = 3 - Math.min(1, stageIndex - 1 < 0 ? 0 : stageIndex - 1);
  for (let i = 0; i < 3; i++) {
    hay.push({ x: base + 320 + i * 480 + rand() * 90, w: 86, h: 62 });
  }
  for (let i = 0; i < 4; i++) {
    fences.push({ x: base + 380 + i * 340 + rand() * 60, w: 14, h: 46 });
  }
  return { corn, ovens, haystacks: hay, fences, gateX: base + STAGE_LENGTH - 60 };
}

export function createKnives() {
  return { list: [], timer: 2.5 };
}

export function updateKnives(knives, cameraX, stageDef, dt, time) {
  knives.timer -= dt;
  if (knives.timer <= 0) {
    knives.timer = stageDef.knifeEvery * (0.8 + Math.random() * 0.5);
    const x = cameraX + 120 + Math.random() * 760;
    knives.list.push({ x, y: -30, vy: 0, stuck: 0, spin: Math.random() * 6 });
  }
  for (const k of knives.list) {
    if (k.stuck > 0) {
      k.stuck -= dt;
      continue;
    }
    k.vy += 1500 * dt;
    k.y += k.vy * dt;
    if (k.y > GROUND_Y - 8) {
      k.y = GROUND_Y - 8;
      k.stuck = 0.9;
    }
  }
  knives.list = knives.list.filter((k) => k.stuck > -1.2 && k.x > cameraX - 200 && k.x < cameraX + 1400);
  return knives;
}

export function knifeHitsTurkey(k, t) {
  return k.y + 40 > t.y && k.y < t.y + t.h && Math.abs(k.x - t.x) < 30;
}

export function ovenHitsTurkey(o, t) {
  return t.x + t.w / 2 > o.x - o.w / 2 && t.x - t.w / 2 < o.x + o.w / 2 && t.y + t.h > GROUND_Y - o.h;
}

export function drawOven(ctx, o, time, screenX) {
  const x = screenX(o.x);
  const y = GROUND_Y - o.h;
  // Heat shimmer glow.
  const glow = 0.5 + Math.sin(time * 5 + o.glow) * 0.2;
  ctx.fillStyle = `rgba(255, 120, 40, ${0.25 * glow})`;
  ctx.beginPath();
  ctx.ellipse(x, y + o.h / 2, o.w * 0.85, o.h * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Oven body with a glowing door and a pie cooling on top.
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(x - o.w / 2, y, o.w, o.h);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x - o.w / 2, y, o.w, 10);
  ctx.fillStyle = `rgba(255, ${140 + Math.floor(60 * glow)}, 30, 0.95)`;
  ctx.fillRect(x - o.w / 2 + 12, y + 22, o.w - 24, 34);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - o.w / 2 + 12, y + 22, o.w - 24, 34);
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.ellipse(x, y - 8, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e63946';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', x, y - 22);
}

export function drawKnife(ctx, k, screenX) {
  const x = screenX(k.x);
  ctx.save();
  ctx.translate(x, k.y + 20);
  ctx.rotate(k.stuck > 0 ? 0.12 : k.spin * 0.15);
  // Carving knife: silver blade, dark handle, stuck point-down.
  ctx.fillStyle = '#c0c8d0';
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(7, -4);
  ctx.lineTo(4, 8);
  ctx.lineTo(-4, 8);
  ctx.lineTo(-7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-4, 8, 8, 14);
  ctx.restore();
  // Warning shadow on the ground while it falls.
  if (k.stuck <= 0) {
    ctx.fillStyle = 'rgba(230, 57, 70, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y + 4, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCorn(ctx, c, time, screenX) {
  if (c.taken) return;
  const x = screenX(c.x);
  const y = c.y + Math.sin(time * 3 + c.bob) * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = c.golden ? '#ffb703' : '#ffd166';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 14, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.golden ? '#b8860b' : '#c98a2e';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4, -10);
    ctx.lineTo(i * 4, 10);
    ctx.stroke();
  }
  ctx.fillStyle = '#5da24a';
  ctx.beginPath();
  ctx.ellipse(-8, 8, 7, 4, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawHaystack(ctx, h, screenX) {
  const x = screenX(h.x);
  const y = GROUND_Y - h.h;
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(x - h.w / 2, GROUND_Y);
  ctx.quadraticCurveTo(x - h.w / 2, y + 8, x, y);
  ctx.quadraticCurveTo(x + h.w / 2, y + 8, x + h.w / 2, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 14, y + 14);
    ctx.quadraticCurveTo(x + i * 16, y + 34, x + i * 12, GROUND_Y - 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#2b1a12';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIDE!', x, y - 8);
}

export function drawFence(ctx, f, screenX) {
  const x = screenX(f.x);
  const y = GROUND_Y - f.h;
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 14);
  ctx.lineTo(x + 18, y + 14);
  ctx.moveTo(x - 18, y + 34);
  ctx.lineTo(x + 18, y + 34);
  ctx.stroke();
  ctx.fillStyle = '#6f4520';
  ctx.fillRect(x - 8, y, 6, f.h);
  ctx.fillRect(x + 2, y, 6, f.h);
}

export function drawGate(ctx, gateX, stageIndex, screenX, time) {
  const x = screenX(gateX);
  const label = stageIndex < 2 ? 'NEXT STAGE →' : 'FREEDOM →';
  ctx.fillStyle = '#2b4a7f';
  ctx.fillRect(x - 6, GROUND_Y - 150, 12, 150);
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(x - 52, GROUND_Y - 190, 104, 44);
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 52, GROUND_Y - 190, 104, 44);
  ctx.fillStyle = '#e63946';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, GROUND_Y - 164);
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.moveTo(x + 46, GROUND_Y - 168 + Math.sin(time * 4) * 3);
  ctx.lineTo(x + 60, GROUND_Y - 160 + Math.sin(time * 4) * 3);
  ctx.lineTo(x + 46, GROUND_Y - 152 + Math.sin(time * 4) * 3);
  ctx.closePath();
  ctx.fill();
}
