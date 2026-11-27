// Gobble Run — fixed states for the maker's screenshots.
// One job: put the game into a readable title, chase, kitchen or end pose
// from a ?shot= URL, deterministically, so the screenshots are real renders
// of this code in a browser.
import { GROUND_Y, STAGE_LENGTH } from './config.js';
import { buildStageLayout, createKnives } from './obstacles.js';
import { createFarmer } from './farmer.js';
import { createTurkey } from './turkey.js';
import { startRun, advanceStage } from './world.js';

export function applyShot(game, shot) {
  if (shot === 'start') {
    game.state = 'title';
    game.turkey = createTurkey();
    game.turkey.x = 700;
    game.turkey.y = GROUND_Y - 54;
    game.farmer = createFarmer(180);
    game.farmer.state = 'patrol';
    return true;
  }
  if (shot === 'play') {
    startRun(game);
    // Mid-chase in the farmyard: Gus mid-jump over an oven, knives falling,
    // the farmer right behind him, corn ahead.
    game.turkey.x = 620;
    game.turkey.y = GROUND_Y - 200;
    game.turkey.vy = 120;
    game.turkey.onGround = false;
    game.farmer.x = 470;
    game.farmer.state = 'chase';
    game.farmer.spottedFlash = 1;
    game.knives.list = [
      { x: 700, y: 120, vy: 260, stuck: 0, spin: 1 },
      { x: 860, y: 40, vy: 200, stuck: 0, spin: 2 },
      { x: 560, y: GROUND_Y - 8, vy: 0, stuck: 0.9, spin: 0 },
    ];
    game.knives.timer = 2;
    game.score = 1240;
    game.distance = 420;
    game.layout.ovens = [{ x: 640, w: 92, h: 74, glow: 1 }];
    game.cameraX = 240;
    game.message = 'The farmer is right behind you — JUMP!';
    game.messageTimer = 99;
    return true;
  }
  if (shot === 'kitchen') {
    startRun(game);
    game.stageIndex = 2;
    game.layout = buildStageLayout(2, game.seed);
    const base = 2 * STAGE_LENGTH;
    game.knives.list = [
      { x: base + 700, y: 90, vy: 300, stuck: 0, spin: 1 },
      { x: base + 900, y: 200, vy: 260, stuck: 0, spin: 3 },
      { x: base + 540, y: GROUND_Y - 8, vy: 0, stuck: 0.9, spin: 0 },
    ];
    game.knives.timer = 2;
    game.turkey.x = base + 660;
    game.turkey.y = GROUND_Y - 54;
    game.farmer.x = base + 380;
    game.farmer.state = 'chase';
    game.farmer.spottedFlash = 1;
    game.score = 4860;
    game.distance = 2 * STAGE_LENGTH + 500;
    game.lives = 2;
    game.cameraX = base + 260;
    game.message = 'The kitchen! Ovens everywhere — reach the back door!';
    game.messageTimer = 99;
    return true;
  }
  if (shot === 'end' || shot === 'escaped') {
    startRun(game);
    game.score = 7320;
    game.distance = 3 * STAGE_LENGTH;
    game.cornEaten = 14;
    game.state = 'escaped';
    game.best = 7320;
    game.turkey.x = 700;
    return true;
  }
  if (shot === 'caught') {
    startRun(game);
    game.score = 2150;
    game.distance = 900;
    game.cornEaten = 6;
    game.lives = 0;
    game.state = 'caught';
    game.best = 2150;
    game.farmer.x = 640;
    game.turkey.x = 700;
    return true;
  }
  return false;
}
