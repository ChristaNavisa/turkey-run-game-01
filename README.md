# Gobble Run — The Great Turkey Escape

[![turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/ChristaNavisa/turkey-run-game-01/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/ChristaNavisa/turkey-run-game-01/reward.svg)](https://make.fun/c/turkey-run-game-01)

Thanksgiving is coming. Farmer Hank has the oven hot and the carving knife
out — and Gus the turkey is not going to be dinner. Run, jump, dash and
hide through the farmyard, the old barn and the kitchen, and slip out the
back door to freedom.

## Play

Open `game/index.html` in a desktop browser (or `node serve.ts` and visit
http://localhost:8080). No network request, no build step.

- **← → / A D** — run
- **SPACE / W / ↑** — jump (click also jumps)
- **SHIFT** — dash
- **↓ / S near a haystack** — hide from the farmer
- **M** — mute

Grab corn for points, dodge falling carving knives, don't touch the ovens,
and don't let Farmer Hank catch you. Reach the gate at the end of each of
the 3 stages to escape. 3 lives — get caught 3 times and it's dinner time.

## Entry

An entry for the [Make the best turkey escape game](https://make.fun/c/turkey-run-game-01)
bounty on make.fun. `main.ts` (Node 22) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
make.fun library in `vendor/makefun-game.ts`.

## License

MIT — see [LICENSE](LICENSE).
