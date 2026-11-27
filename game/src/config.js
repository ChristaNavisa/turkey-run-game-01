// Gobble Run — tuning and stage data for the turkey escape game.
// One job: every number the game balances on lives here, so tuning never
// hides inside the movement or drawing code.
export const VIEW_W = 960;
export const VIEW_H = 600;
export const GROUND_Y = 520;
export const GRAVITY = 2200;
export const TURKEY_RUN_SPEED = 305;
export const TURKEY_JUMP_VELOCITY = -780;
export const TURKEY_DASH_SPEED = 640;
export const DASH_TIME = 0.18;
export const DASH_COOLDOWN = 1.2;
export const MAX_LIVES = 3;
export const STAGE_LENGTH = 1600;
export const STAGE_COUNT = 3;

export const PALETTE = {
  skyTop: '#f7b267',
  skyMid: '#f4845f',
  skyBot: '#e76f51',
  barnSkyTop: '#8d5a3b',
  barnSkyBot: '#5c3a26',
  kitchenTop: '#7d4a2d',
  kitchenBot: '#3f2418',
  groundFarm: '#7a5230',
  groundBarn: '#6b4423',
  groundKitchen: '#4a3226',
  grass: '#c98a2e',
  cream: '#fff3d6',
  ink: '#2b1a12',
  accent: '#e63946',
  gold: '#ffb703',
};

export const STAGES = [
  {
    name: 'FARMYARD',
    sub: 'Stage 1 — the farmyard at dawn',
    sky: ['#f7b267', '#f4845f', '#e76f51'],
    ground: '#7a5230',
    knifeEvery: 1.5,
    farmerChase: 258,
    corn: 7,
    ovens: 1,
    hay: 3,
    hint: 'Run right! Jump the fences, dodge the knives.',
  },
  {
    name: 'THE BARN',
    sub: 'Stage 2 — through the old barn',
    sky: ['#a9713f', '#7d4a2d', '#5c3a26'],
    ground: '#6b4423',
    knifeEvery: 1.15,
    farmerChase: 272,
    corn: 8,
    ovens: 2,
    hay: 3,
    hint: 'The farmer is faster now. Hide in the hay!',
  },
  {
    name: 'THE KITCHEN',
    sub: 'Stage 3 — past the oven, out the back door',
    sky: ['#8a4b2a', '#5e2f1c', '#3f2418'],
    ground: '#4a3226',
    knifeEvery: 0.85,
    farmerChase: 288,
    corn: 9,
    ovens: 3,
    hay: 2,
    hint: 'Ovens everywhere! Reach the back door to escape.',
  },
];

export function stageForDistance(distance) {
  const index = Math.min(STAGE_COUNT - 1, Math.floor(distance / STAGE_LENGTH));
  return { index, def: STAGES[index], inStage: distance - index * STAGE_LENGTH };
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
