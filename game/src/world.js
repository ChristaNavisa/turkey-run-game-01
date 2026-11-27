// Gobble Run — the run itself: score, distance, lives, stages and camera.
// One job: the state every system reads, and the rules that move it on.
import { GROUND_Y, MAX_LIVES, STAGE_LENGTH, STAGE_COUNT, STAGES, clamp } from './config.js';
import { createTurkey } from './turkey.js';
import { createFarmer } from './farmer.js';
import { buildStageLayout, createKnives } from './obstacles.js';

export function createGame(seed = 1) {
  const game = {
    seed,
    state: 'title',
    time: 0,
    turkey: createTurkey(),
    farmer: createFarmer(30),
    layout: buildStageLayout(0, seed),
    knives: createKnives(),
    stageIndex: 0,
    distance: 0,
    score: 0,
    lives: MAX_LIVES,
    cornEaten: 0,
    cameraX: 0,
    shake: 0,
    flash: 0,
    message: '',
    messageTimer: 0,
    best: 0,
    fade: 0,
    escapedAt: 0,
    runStartedAt: 0,
  };
  return game;
}

export function startRun(game) {
  game.state = 'playing';
  game.turkey = createTurkey();
  game.farmer = createFarmer(-140);
  game.layout = buildStageLayout(0, game.seed);
  game.knives = createKnives();
  game.stageIndex = 0;
  game.distance = 0;
  game.score = 0;
  game.lives = MAX_LIVES;
  game.cornEaten = 0;
  game.cameraX = 0;
  game.shake = 0;
  game.flash = 0;
  game.message = STAGES[0].hint;
  game.messageTimer = 3.5;
  game.fade = 0;
  game.runStartedAt = game.time;
}

export function stageDef(game) {
  return STAGES[game.stageIndex];
}

export function advanceStage(game, sfx) {
  game.stageIndex += 1;
  if (game.stageIndex >= STAGE_COUNT) {
    game.state = 'escaped';
    game.escapedAt = game.time;
    game.score += 1000 + game.lives * 500;
    game.best = Math.max(game.best, game.score);
    sfx.win();
    return;
  }
  const def = STAGES[game.stageIndex];
  game.layout = buildStageLayout(game.stageIndex, game.seed);
  game.knives = createKnives();
  const base = game.stageIndex * STAGE_LENGTH;
  game.turkey.x = base + 120;
  game.farmer = createFarmer(base - 140);
  game.message = def.name + ' — ' + def.hint;
  game.messageTimer = 3.5;
  game.fade = 0.6;
  sfx.gobble();
}

export function hurtTurkey(game, sfx, knockX) {
  if (game.turkey.invincible > 0 || game.state !== 'playing') return false;
  game.lives -= 1;
  game.turkey.invincible = 1.6;
  game.shake = 0.35;
  game.flash = 0.25;
  sfx.hurt();
  if (knockX) game.turkey.x += knockX;
  if (game.lives <= 0) {
    game.state = 'caught';
    game.best = Math.max(game.best, game.score);
    sfx.lose();
  }
  return true;
}

export function updateCamera(game, dt) {
  const target = clamp(game.turkey.x - 300, 0, 4000);
  game.cameraX += (target - game.cameraX) * Math.min(1, dt * 6);
  if (game.shake > 0) game.shake -= dt;
  if (game.flash > 0) game.flash -= dt;
  if (game.messageTimer > 0) game.messageTimer -= dt;
  if (game.fade > 0) game.fade -= dt * 1.4;
}

export function addScore(game, points) {
  game.score += points;
}

export function screenX(game, worldX) {
  return worldX - game.cameraX;
}
