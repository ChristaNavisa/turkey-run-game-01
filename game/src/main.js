// Gobble Run — the game loop and the rules that tie the pieces together.
// One job: run the state machine, collide things, and paint each frame.
import { VIEW_W, VIEW_H, GROUND_Y, STAGE_LENGTH, STAGE_COUNT, clamp } from './config.js';
import { SoundFX } from './audio.js';
import { Input, pointInRect } from './input.js';
import { createGame, startRun, stageDef, advanceStage, hurtTurkey, updateCamera, addScore } from './world.js';
import { updateTurkey, drawTurkey } from './turkey.js';
import { updateFarmer, drawFarmer } from './farmer.js';
import {
  updateKnives, knifeHitsTurkey, ovenHitsTurkey,
  drawOven, drawKnife, drawCorn, drawHaystack, drawFence, drawGate,
} from './obstacles.js';
import { drawBackground, drawHUD, drawTitle, drawEnd, buttonRects } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sfx = new SoundFX();
const input = new Input(canvas);
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || 1) || 1;
const game = createGame(seed);
game.sfxMuted = false;
// Test hook only: lets a local playtest read the run state. Not shown in-game.
window.__gobble = game;

const shot = params.get('shot');
let shotMode = false;
if (shot) shotMode = applyShot(game, shot);

let last = performance.now();
let mouse = { x: -1, y: -1 };
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});

function startFromMenu() {
  sfx.ensure();
  sfx.click();
  startRun(game);
}

function handleMenuClicks() {
  for (const c of input.consumeClicks()) {
    sfx.ensure();
    if (game.state === 'title' && pointInRect(c.x, c.y, buttonRects().start)) {
      startFromMenu();
      return;
    }
    if ((game.state === 'caught' || game.state === 'escaped') && pointInRect(c.x, c.y, buttonRects().again)) {
      startFromMenu();
      return;
    }
    if (game.state === 'playing') {
      // Clicking the field makes Gus hop.
      if (game.turkey.onGround) {
        game.turkey.vy = -780;
        game.turkey.onGround = false;
        sfx.flap();
      }
    }
  }
  if (input.wasPressed('enter')) {
    if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') {
      startFromMenu();
    }
  }
  if (input.wasPressed('m')) {
    game.sfxMuted = sfx.toggleMute();
  }
}

function updatePlaying(dt) {
  const t = game.turkey;
  updateTurkey(t, input, game, dt, sfx);
  // The farmer gives Gus a moment to get moving before he spots him.
  const canSpot = game.time - game.runStartedAt > 1.5;
  updateFarmer(game.farmer, t, stageDef(game), dt, sfx, canSpot);
  updateKnives(game.knives, game.cameraX, stageDef(game), dt, game.time);

  // Distance and score tick up as Gus runs right.
  const before = game.distance;
  game.distance = Math.max(game.distance, t.x - 120 + game.stageIndex * STAGE_LENGTH);
  if (game.distance > before) addScore(game, Math.floor((game.distance - before) * 0.4));

  // Corn pickups.
  for (const c of game.layout.corn) {
    if (!c.taken && Math.abs(c.x - t.x) < 34 && Math.abs(c.y - (t.y + 26)) < 44) {
      c.taken = true;
      game.cornEaten += 1;
      addScore(game, c.golden ? 250 : 100);
      sfx.pickup();
    }
  }
  // Knives: a hit costs a life and knocks Gus away.
  for (const k of game.knives.list) {
    if (k.stuck <= 0 && knifeHitsTurkey(k, t)) {
      k.stuck = 0.9;
      hurtTurkey(game, sfx, t.x < k.x ? -50 : 50);
    }
  }
  // Ovens: hot to touch — unless Gus is clearly jumping clean over one.
  for (const o of game.layout.ovens) {
    if (ovenHitsTurkey(o, t) && t.y + t.h > GROUND_Y - 20) {
      hurtTurkey(game, sfx, 0);
      if (game.state === 'playing') {
        t.vy = -520;
        t.y -= 10;
        t.onGround = false;
      }
    }
  }
  // Fences: solid little walls — jump them or get stopped.
  for (const f of game.layout.fences) {
    if (t.x + t.w / 2 > f.x - 10 && t.x - t.w / 2 < f.x + 10 && t.y + t.h > GROUND_Y - f.h + 6) {
      if (t.vy >= 0 && t.y + t.h > GROUND_Y - 8) {
        t.x = f.x - 10 - t.w / 2;
        t.vx = 0;
      }
    }
  }
  // The farmer catches Gus: a life, a shove, and the farmer loses the
  // trail for a moment so a narrow escape stays fair. Only when the hit
  // actually landed — while Gus is invincible the farmer must not be
  // shoved back every frame, or he gets pinned in place.
  if (Math.abs(game.farmer.x - t.x) < 42 && Math.abs(game.farmer.y - t.y) < 60 && !t.hidden) {
    const landed = hurtTurkey(game, sfx, t.x < game.farmer.x ? -70 : 70);
    if (landed && game.state === 'playing') {
      game.farmer.x -= 220;
      game.farmer.lastSeenX = t.x;
      game.farmer.state = 'search';
      game.farmer.searchTimer = 2.5;
      game.farmer.loseTimer = 0;
    }
  }
  // Gate: cross it and the next stage begins.
  if (t.x >= game.layout.gateX) {
    advanceStage(game, sfx);
  }
  updateCamera(game, dt);
}

function draw() {
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * game.shake * 30, (Math.random() - 0.5) * game.shake * 30);
  }
  const sx = (wx) => wx; // world coords: the camera translate handles the shift
  if (game.state === 'title') {
    drawTitle(ctx, game, mouse);
    // Gus and Farmer Hank posed on the title screen.
    drawTurkey(ctx, game.turkey, game.time);
    drawFarmer(ctx, game.farmer, game.time);
  } else if (game.state === 'caught') {
    drawEnd(ctx, game, mouse, 'caught');
    drawFarmer(ctx, game.farmer, game.time);
  } else if (game.state === 'escaped') {
    drawEnd(ctx, game, mouse, 'escaped');
    drawTurkey(ctx, game.turkey, game.time);
  } else {
    drawBackground(ctx, game);
    // World entities live in world coordinates: shift by the camera once.
    ctx.save();
    ctx.translate(-game.cameraX, 0);
    const at = (wx) => wx;
    for (const h of game.layout.haystacks) drawHaystack(ctx, h, at);
    for (const o of game.layout.ovens) drawOven(ctx, o, game.time, at);
    for (const f of game.layout.fences) drawFence(ctx, f, at);
    for (const c of game.layout.corn) drawCorn(ctx, c, game.time, at);
    drawGate(ctx, game.layout.gateX, game.stageIndex, at, game.time);
    for (const k of game.knives.list) drawKnife(ctx, k, at);
    if (!game.turkey.hidden) drawTurkey(ctx, game.turkey, game.time);
    else {
      // Hidden in the hay: just a tuft of feathers poking out.
      ctx.fillStyle = '#d9a441';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('…', game.turkey.x, GROUND_Y - 66);
    }
    drawFarmer(ctx, game.farmer, game.time);
    ctx.restore();
    drawHUD(ctx, game);
  }
  if (game.flash > 0) {
    ctx.fillStyle = `rgba(230, 57, 70, ${game.flash * 0.9})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (game.fade > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.7, game.fade)})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  ctx.restore();
}

function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.033);
  last = now;
  game.time += dt;
  handleMenuClicks();
  if (!shotMode && game.state === 'playing') updatePlaying(dt);
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

document.getElementById('loading').remove();
requestAnimationFrame(frame);
