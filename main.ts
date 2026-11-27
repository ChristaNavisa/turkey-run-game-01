// Gobble Run — the hand-in program for turkey-run-game-01 (Node 22, stdlib).
// It copies this repository's game/ and screenshots/ beside it into the
// output directory and writes /output/dossier.json with the vendored
// make.fun library, exactly the shape the gate rebuilds and compares.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in a broken entry: the game must exist
// and screenshots/ must hold 3 or 4 images before anything is copied.
const gameIndex = join(here, 'game', 'index.html');
if (!existsSync(gameIndex)) throw new Error('missing game/index.html');
const shotDir = join(here, 'screenshots');
const shotCount = existsSync(shotDir)
  ? readdirSync(shotDir).filter((n) => !n.startsWith('.')).length
  : 0;
if (shotCount < 3 || shotCount > 4) throw new Error(`screenshots/ holds ${shotCount} images, need 3 or 4`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files in all,
// or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
