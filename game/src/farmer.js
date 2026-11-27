// Gobble Run — Farmer Hank: patrol, spot, chase, search and corner.
// One job: the farmer's brain and his own art.
import { GROUND_Y, clamp } from './config.js';

export function createFarmer(x) {
  return {
    x,
    y: GROUND_Y - 78,
    w: 52,
    h: 78,
    vx: 0,
    state: 'patrol',
    patrolDir: 1,
    lastSeenX: x,
    loseTimer: 0,
    searchTimer: 0,
    walkPhase: 0,
    spottedFlash: 0,
  };
}

export function updateFarmer(f, turkey, stageDef, dt, sfx, canSpot = true) {
  const dist = turkey.x - f.x;
  const absDist = Math.abs(dist);
  const canSee = canSpot && !turkey.hidden && absDist < 430 && Math.abs(turkey.y - f.y) < 200;
  if (f.spottedFlash > 0) f.spottedFlash -= dt;

  if (f.state === 'patrol') {
    f.vx = 95 * f.patrolDir;
    f.x += f.vx * dt;
    if (f.x < 30) f.patrolDir = 1;
    if (f.x > 900) f.patrolDir = -1;
    if (canSee) {
      f.state = 'chase';
      f.spottedFlash = 1.2;
      sfx.alarm();
    }
  } else if (f.state === 'chase') {
    const speed = stageDef.farmerChase;
    f.vx = Math.sign(dist || 1) * speed;
    f.x += f.vx * dt;
    f.lastSeenX = turkey.x;
    if (!canSee) {
      f.loseTimer += dt;
      if (f.loseTimer > 2.2) {
        f.state = 'search';
        f.searchTimer = 3;
        f.loseTimer = 0;
      }
    } else {
      f.loseTimer = 0;
    }
  } else if (f.state === 'search') {
    // He stomps to where he last saw the bird and looks around.
    const to = f.lastSeenX - f.x;
    if (Math.abs(to) > 12) {
      f.vx = Math.sign(to) * 150;
      f.x += f.vx * dt;
    } else {
      f.vx = 0;
      f.searchTimer -= dt;
      f.patrolDir = Math.sin(Date.now() / 700) > 0 ? 1 : -1;
      if (f.searchTimer <= 0) f.state = 'patrol';
    }
    if (canSee) {
      f.state = 'chase';
      f.spottedFlash = 1.2;
      sfx.alarm();
    }
  }
  f.walkPhase += dt * Math.abs(f.vx) * 0.06;
  f.x = clamp(f.x, -200, 5200);
  return f;
}

export function drawFarmer(ctx, f, time) {
  ctx.save();
  ctx.translate(f.x, f.y);
  const dir = f.vx >= 0 ? 1 : -1;
  const swing = Math.sin(f.walkPhase) * 8;
  const angry = f.state === 'chase';

  // Legs in denim overalls, stomping.
  ctx.strokeStyle = '#2b4a7f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, 58);
  ctx.lineTo(-8 + swing, 78);
  ctx.moveTo(8, 58);
  ctx.lineTo(8 - swing, 78);
  ctx.stroke();

  // Body: red plaid shirt and overall straps.
  ctx.fillStyle = angry ? '#c1121f' : '#b23a48';
  ctx.beginPath();
  ctx.ellipse(0, 38, 24, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b4a7f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-12, 20);
  ctx.lineTo(-8, 52);
  ctx.moveTo(12, 20);
  ctx.lineTo(8, 52);
  ctx.stroke();

  // Arms reaching forward, grabbing at the turkey.
  ctx.strokeStyle = '#e8b88a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.lineTo(26 * dir, 40 + Math.sin(time * 6) * 3);
  ctx.moveTo(-10, 30);
  ctx.lineTo(-22 * dir, 42);
  ctx.stroke();

  // Head with a big nose and a moustache.
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(0, 6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d2b1f';
  ctx.beginPath();
  ctx.ellipse(2 * dir, 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(6 * dir, 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d130c';
  ctx.beginPath();
  ctx.arc(7 * dir, 2, 1.6, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    // Angry brows.
    ctx.strokeStyle = '#1d130c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(2 * dir, -3);
    ctx.lineTo(10 * dir, 0);
    ctx.stroke();
  }

  // Straw hat, slightly squashed from the chase.
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.ellipse(0, -6, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(0, -12, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(12, -8);
  ctx.stroke();

  // "!" bubble while he is chasing.
  if (angry) {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(26, -26, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 26, -20);
  }
  ctx.restore();
}
