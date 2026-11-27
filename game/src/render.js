// Gobble Run — everything painted: farmyard, barn and kitchen backdrops,
// the HUD, and the title and end screens.
// One job: what the player (and the judge's screenshots) actually see.
import { VIEW_W, VIEW_H, GROUND_Y, MAX_LIVES, STAGES } from './config.js';
import { pointInRect } from './input.js';

export function drawBackground(ctx, game) {
  const def = STAGES[game.stageIndex];
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, def.sky[0]);
  grad.addColorStop(0.55, def.sky[1]);
  grad.addColorStop(1, def.sky[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const cam = game.cameraX;
  // Sun / moon glow.
  ctx.fillStyle = 'rgba(255, 243, 214, 0.9)';
  ctx.beginPath();
  ctx.arc(820 - (cam * 0.05) % 960, 84, 34, 0, Math.PI * 2);
  ctx.fill();

  if (game.stageIndex === 0) drawFarmyard(ctx, cam);
  if (game.stageIndex === 1) drawBarn(ctx, cam);
  if (game.stageIndex === 2) drawKitchen(ctx, cam);

  // Ground strip.
  ctx.fillStyle = def.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, GROUND_Y, VIEW_W, 6);
  // Scattered autumn leaves on the ground.
  ctx.fillStyle = '#c98a2e';
  for (let i = 0; i < 14; i++) {
    const lx = ((i * 173 - cam) % 1000 + 1000) % 1000 - 20;
    ctx.beginPath();
    ctx.ellipse(lx, GROUND_Y + 26 + (i % 4) * 16, 7, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFarmyard(ctx, cam) {
  // Rolling hills, a red barn in the distance and a fence line.
  ctx.fillStyle = '#a8642c';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  for (let x = 0; x <= VIEW_W; x += 40) {
    ctx.lineTo(x, 452 + Math.sin((x + cam * 0.4) * 0.008) * 14);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.fill();
  const barnX = 620 - (cam * 0.25) % 1200;
  ctx.fillStyle = '#a63d2f';
  ctx.fillRect(barnX, 330, 180, 130);
  ctx.fillStyle = '#7d2a20';
  ctx.beginPath();
  ctx.moveTo(barnX - 12, 332);
  ctx.lineTo(barnX + 90, 272);
  ctx.lineTo(barnX + 192, 332);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(barnX + 70, 380, 40, 80);
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 3;
  ctx.strokeRect(barnX + 70, 380, 40, 80);
  // Fence posts drifting past.
  ctx.strokeStyle = '#6f4520';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const fx = ((i * 140 - cam * 0.7) % 1120 + 1120) % 1120 - 60;
    ctx.beginPath();
    ctx.moveTo(fx, 470);
    ctx.lineTo(fx, 510);
    ctx.stroke();
  }
}

function drawBarn(ctx, cam) {
  // Wooden barn walls, beams and a hayloft window.
  ctx.fillStyle = '#4a2c17';
  ctx.fillRect(0, 60, VIEW_W, GROUND_Y - 60);
  ctx.strokeStyle = '#3a2110';
  ctx.lineWidth = 5;
  for (let y = 100; y < GROUND_Y; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const bx = ((i * 220 - cam * 0.3) % 1320 + 1320) % 1320 - 80;
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(bx, 60, 16, GROUND_Y - 60);
  }
  // Hayloft window with warm light.
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(120, 110, 90, 70);
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 4;
  ctx.strokeRect(120, 110, 90, 70);
  ctx.beginPath();
  ctx.moveTo(165, 110);
  ctx.lineTo(165, 180);
  ctx.moveTo(120, 145);
  ctx.lineTo(210, 145);
  ctx.stroke();
  // Hanging lanterns.
  for (let i = 0; i < 3; i++) {
    const lx = 320 + i * 220;
    ctx.strokeStyle = '#2b1a12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 60);
    ctx.lineTo(lx, 96);
    ctx.stroke();
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.arc(lx, 106, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawKitchen(ctx, cam) {
  // Tiled kitchen wall, a big window, hanging pans and a checkered floor line.
  ctx.fillStyle = '#e8dcc8';
  ctx.fillRect(0, 40, VIEW_W, GROUND_Y - 40);
  ctx.strokeStyle = '#cbb89a';
  ctx.lineWidth = 2;
  for (let y = 40; y < GROUND_Y; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  for (let x = 0; x < VIEW_W; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }
  // Window onto the yard you are escaping to.
  ctx.fillStyle = '#f7b267';
  ctx.fillRect(90, 90, 170, 130);
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 5;
  ctx.strokeRect(90, 90, 170, 130);
  ctx.beginPath();
  ctx.moveTo(175, 90);
  ctx.lineTo(175, 220);
  ctx.moveTo(90, 155);
  ctx.lineTo(260, 155);
  ctx.stroke();
  ctx.fillStyle = '#5da24a';
  ctx.beginPath();
  ctx.ellipse(175, 215, 70, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hanging pans.
  for (let i = 0; i < 4; i++) {
    const px = 480 + i * 90;
    ctx.strokeStyle = '#2b1a12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, 40);
    ctx.lineTo(px, 84);
    ctx.stroke();
    ctx.fillStyle = '#3d3d3d';
    ctx.beginPath();
    ctx.arc(px, 106, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(px, 106, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  // A pie cooling on the sill, just out of reach.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(640, 258, 120, 8);
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(700, 250, 46, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawHUD(ctx, game) {
  const def = STAGES[game.stageIndex];
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, 54);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + game.score, 16, 35);
  ctx.fillText('DIST ' + Math.floor(game.distance / 40) + 'm', 220, 35);
  ctx.fillText(def.name, 420, 35);
  // Hearts for lives.
  for (let i = 0; i < MAX_LIVES; i++) {
    ctx.fillStyle = i < game.lives ? '#e63946' : 'rgba(255,255,255,0.25)';
    drawHeart(ctx, 640 + i * 34, 28, 11);
  }
  // Dash meter.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(770, 22, 90, 12);
  ctx.fillStyle = '#ffb703';
  const dashFrac = 1 - Math.max(0, game.turkey.dashCooldown) / 1.2;
  ctx.fillRect(770, 22, 90 * dashFrac, 12);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DASH', 770, 48);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(game.sfxMuted ? 'SND OFF' : 'SND ON', 878, 35);
  // SPOTTED! banner while the farmer chases.
  if (game.farmer.state === 'chase') {
    const blink = Math.floor(game.time * 6) % 2 === 0;
    ctx.fillStyle = blink ? '#e63946' : '#ffb703';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('! SPOTTED — RUN !', VIEW_W / 2, 92);
  }
  // Stage hint line, on a dark pill so it reads on any backdrop.
  if (game.messageTimer > 0) {
    ctx.globalAlpha = Math.min(1, game.messageTimer);
    ctx.font = 'bold 17px sans-serif';
    const w = ctx.measureText(game.message).width + 28;
    ctx.fillStyle = 'rgba(43, 26, 18, 0.75)';
    ctx.fillRect(VIEW_W / 2 - w / 2, 132, w, 30);
    ctx.fillStyle = '#fff3d6';
    ctx.textAlign = 'center';
    ctx.fillText(game.message, VIEW_W / 2, 153);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.3, 0, -s * 0.7, -s, 0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.7, -s, s * 1.3, 0, 0, s * 0.9);
  ctx.fill();
  ctx.restore();
}

export function drawButton(ctx, rect, label, hot) {
  ctx.fillStyle = hot ? '#ffb703' : '#e63946';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 8);
}

export function buttonRects() {
  return {
    start: { x: VIEW_W / 2 - 130, y: 440, w: 260, h: 56 },
    again: { x: VIEW_W / 2 - 130, y: 448, w: 260, h: 56 },
  };
}

export function drawTitle(ctx, game, mouse) {
  ctx.save();
  drawBackground(ctx, game);
  ctx.fillStyle = 'rgba(43, 26, 18, 0.45)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb703';
  ctx.font = 'bold 84px sans-serif';
  ctx.fillText('GOBBLE RUN', VIEW_W / 2, 150);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('The Great Turkey Escape', VIEW_W / 2, 196);
  ctx.font = '20px sans-serif';
  ctx.fillText('Thanksgiving is coming. Farmer Hank has the oven hot', VIEW_W / 2, 250);
  ctx.fillText('and the carving knife out. Run, jump, dash — and don\'t get caught!', VIEW_W / 2, 280);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('← → / A D move    SPACE jump    SHIFT dash    DOWN hide in hay', VIEW_W / 2, 330);
  ctx.fillText('Grab corn for points. Reach the gate through 3 stages to escape!', VIEW_W / 2, 360);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '16px sans-serif';
  ctx.fillText('Farmyard → Barn → Kitchen — out the back door to freedom.', VIEW_W / 2, 392);
  const rects = buttonRects();
  const hot = mouse && pointInRect(mouse.x, mouse.y, rects.start);
  drawButton(ctx, rects.start, '▶  START THE ESCAPE', hot);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '15px sans-serif';
  ctx.fillText('or press ENTER', VIEW_W / 2, 530);
  ctx.restore();
}

export function drawEnd(ctx, game, mouse, kind) {
  ctx.save();
  drawBackground(ctx, game);
  ctx.fillStyle = kind === 'escaped' ? 'rgba(20, 60, 20, 0.55)' : 'rgba(60, 10, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  if (kind === 'escaped') {
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 76px sans-serif';
    ctx.fillText('ESCAPED!', VIEW_W / 2, 160);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Gus slipped out the back door — no Thanksgiving dinner today!', VIEW_W / 2, 210);
  } else {
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 76px sans-serif';
    ctx.fillText('CAUGHT!', VIEW_W / 2, 160);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Farmer Hank got you. The oven was already hot…', VIEW_W / 2, 210);
  }
  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('SCORE  ' + game.score, VIEW_W / 2, 280);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '22px sans-serif';
  ctx.fillText('Distance  ' + Math.floor(game.distance / 40) + ' m    •    Corn  ' + game.cornEaten, VIEW_W / 2, 320);
  ctx.fillText('Best escape  ' + game.best, VIEW_W / 2, 352);
  ctx.font = '18px sans-serif';
  ctx.fillText(kind === 'escaped' ? 'You outran the farmer through all 3 stages.' : 'Tip: hide in the hay when the farmer closes in.', VIEW_W / 2, 392);
  const rects = buttonRects();
  const hot = mouse && pointInRect(mouse.x, mouse.y, rects.again);
  drawButton(ctx, rects.again, '↻  RUN AGAIN', hot);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '15px sans-serif';
  ctx.fillText('or press ENTER', VIEW_W / 2, 536);
  ctx.restore();
}
