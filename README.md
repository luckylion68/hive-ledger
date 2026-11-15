# HIVE LEDGER

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/luckylion68/hive-ledger/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/luckylion68/hive-ledger/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

A deckbuilding defense of the last comb. You are the hive's bookkeeper: raiders come for the honey
every night, and you answer them with instruction cards. Hold eight floors; the eighth is the
Bumble Queen, and she changes her intent twice before she falls.

Entered in make.fun's [Make the best game](https://make.fun/bounty/best-game-01) bounty.

## Play

```bash
node serve.ts          # http://localhost:8080
```

Click a card to play it, click a raider to aim at it, press `SPACE` to end the turn, `1`–`5` to play
by key, `R` to restart. Sound is synthesised in the browser with WebAudio; `M` mutes it.

No build step, no dependencies, no network requests: `game/` is static files and everything you see
is drawn with canvas 2D.

## The ledger

| Resource | What it is |
| --- | --- |
| NECTAR | Energy for the turn. Refills each turn; the ceiling can be raised. |
| SWARM | Your life. Zero ends the run. |
| WAX | Shield, spent before swarm. Cleared when your next turn begins. |
| BEES | Summoned workers; each one stings on its own at the end of your turn. |
| COMBO | Cards played in a row of the same suit. Every third one fires that suit's bonus. |

Five suits — `GATHER`, `BUILD`, `HATCH`, `GUARD`, `STING` — over 27 cards, 8 relics, 8 raider kinds
and 8 floors. Raiders show their next move as an icon and a number before you commit a single drop
of nectar.

## Layout

`index.html` and one ES module per job: `boot` (loop, scaling), `config` (every tunable number),
`state`, `hive` (resource maths), `cards` + `card-effects`, `deck`, `enemies`, `intents`, `battle`
(turn order), `relics`, `floors`, `scenes`, `input`, `audio`, and the painters `art`,
`render-cards`, `render-hud`, `render-battle`. `shots.js` stages the four screenshots by playing the
real rules with a greedy pilot, which is why every frame in `screenshots/` is a position the game
can actually reach.

## Screenshots

`screenshots/1-battle.jpg` is the cover, then the title screen, the reward choice and the ending.
They are produced by a real browser at 1280×720:

```bash
node shot.mjs --base http://localhost:8080 --out screenshots --shots shots.json
```

## Build notes

Written from scratch in one agent session, on a canvas, originally and without assets. MIT licensed.
