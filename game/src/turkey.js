// Gobble Run — the player turkey: movement, dash, hide and its own art.
// One job: everything about Gus the turkey, the bird you play.
import { GROUND_Y, TURKEY_RUN_SPEED, TURKEY_JUMP_VELOCITY, TURKEY_DASH_SPEED, DASH_TIME, DASH_COOLDOWN, clamp } from './config.js';

export function createTurkey() {
  return {
    x: 120,
    y: GROUND_Y - 54,
    w: 46,
    h: 54,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: true,
    dashTimer: 0,
    dashCooldown: 0,
    hidden: false,
    hideTimer: 0,
    hideCooldown: 0,
    invincible: 0,
    runPhase: 0,
    gobbleTimer: 2,
  };
}

export function updateTurkey(t, input, world, dt, sfx) {
  const left = input.held('arrowleft', 'a');
  const right = input.held('arrowright', 'd');
  const wantJump = input.wasPressed(' ', 'arrowup', 'w');
  const wantDash = input.wasPressed('shift');
  const wantHide = input.wasPressed('arrowdown', 's');

  if (t.dashCooldown > 0) t.dashCooldown -= dt;
  if (t.invincible > 0) t.invincible -= dt;
  if (t.hideCooldown > 0) t.hideCooldown -= dt;

  // Hiding: press Down next to a haystack and the turkey ducks inside it.
  if (wantHide && t.onGround && !t.hidden && t.hideCooldown <= 0) {
    const hay = world.layout.haystacks.find((h) => Math.abs(h.x - t.x) < 70);
    if (hay) {
      t.hidden = true;
      t.hideTimer = 2.6;
      t.hideCooldown = 5;
      sfx.hide();
    }
  }
  if (t.hidden) {
    t.hideTimer -= dt;
    t.vx = 0;
    if (t.hideTimer <= 0) t.hidden = false;
  } else {
    let move = 0;
    if (left) move -= 1;
    if (right) move += 1;
    if (move !== 0) t.facing = move;
    t.vx = move * TURKEY_RUN_SPEED;
    if (wantDash && t.dashCooldown <= 0 && move !== 0) {
      t.dashTimer = DASH_TIME;
      t.dashCooldown = DASH_COOLDOWN;
      sfx.dash();
    }
    if (t.dashTimer > 0) {
      t.dashTimer -= dt;
      t.vx = t.facing * TURKEY_DASH_SPEED;
    }
    if (wantJump && t.onGround) {
      t.vy = TURKEY_JUMP_VELOCITY;
      t.onGround = false;
      sfx.flap();
    }
  }

  t.vy += 2200 * dt;
  t.x += t.vx * dt;
  t.y += t.vy * dt;
  if (t.x < 40) t.x = 40;
  if (t.y + t.h >= GROUND_Y) {
    t.y = GROUND_Y - t.h;
    t.vy = 0;
    t.onGround = true;
  }
  if (Math.abs(t.vx) > 10 && t.onGround) t.runPhase += dt * Math.abs(t.vx) * 0.045;

  // A nervous gobble every few seconds while the farmer is close.
  t.gobbleTimer -= dt;
  if (t.gobbleTimer <= 0) {
    if (world.farmer && world.farmer.state === 'chase') sfx.gobble();
    t.gobbleTimer = 2 + Math.random() * 2;
  }
  return t;
}

export function drawTurkey(ctx, t, time) {
  ctx.save();
  ctx.translate(t.x, t.y);
  if (t.invincible > 0 && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = 0.35;
  const bob = t.onGround ? Math.sin(t.runPhase) * 2 : 0;
  const legSwing = t.onGround ? Math.sin(t.runPhase) * 7 : 6;

  // Fan tail, fanned out behind the bird.
  ctx.fillStyle = '#8b5a2b';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32 - (t.facing > 0 ? 0 : 0));
    ctx.beginPath();
    ctx.ellipse(-16, -18 + bob, 7, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#d9a441';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-16, -30 + bob, 3, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Legs, scrambling.
  ctx.strokeStyle = '#e07b39';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 44);
  ctx.lineTo(-6 + legSwing, 54);
  ctx.moveTo(6, 44);
  ctx.lineTo(6 - legSwing, 54);
  ctx.stroke();

  // Body: a plump brown oval.
  ctx.fillStyle = '#6f4520';
  ctx.beginPath();
  ctx.ellipse(0, 20 + bob, 23, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.ellipse(0, 26 + bob, 17, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing, tucked and flapping a little.
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath();
  ctx.ellipse(-4, 18 + bob, 13, 9, -0.4 + Math.sin(time * 9) * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head, turned toward where Gus runs.
  const hx = t.facing * 12;
  ctx.strokeStyle = '#c96f4a';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(6, 2 + bob);
  ctx.lineTo(10 + hx, -16 + bob);
  ctx.stroke();
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.arc(12 + hx, -20 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle and a very worried eye.
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(20 + hx, -22 + bob);
  ctx.lineTo(30 + hx, -18 + bob);
  ctx.lineTo(20 + hx, -15 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.ellipse(16 + hx, -10 + bob, 3, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(15 + hx, -23 + bob, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d130c';
  ctx.beginPath();
  ctx.arc(16 + hx, -23 + bob, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function turkeyCenter(t) {
  return { x: t.x, y: t.y + t.h / 2 };
}
