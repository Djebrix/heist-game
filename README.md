# Jade Kettle Heist — 6 guards, 9 loot, 3 routes, 1 kettle

[![bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Djebrix/heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Djebrix/heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A complete, original top-down stealth heist game that runs offline in a desktop browser from static files. You are the thief in the Vermilion Teahouse at night: cross one big room past **6 patrolling stewards** with sweeping vision cones and **3 wall cameras**, steal **9 pieces of loot** plus the **Jade Kettle** from its locked glass case, and walk out through the GETAWAY door before the alarm tops out.

## Play

- **WASD / arrows** — move (Shift to sneak, slower and safer)
- **Click** — throw a pebble (6 carried): stewards walk over to investigate the noise
- **Right-click / Q** — smoke puff (2 carried): a cloud no watcher can see through
- **Hold E** — pick the kettle case lock (2.5 s, standing still in the open) or cut a camera's feed at its brass wall panel
- **Win** — grab the kettle and reach the GETAWAY door; **lose** — the alarm meter hits 100 or a chasing steward catches you

## Depth

- **3 routes to the vault**: the west tea hall (tables as cover), the north corridor (drops in through the vault's north door), the east garden (planters, camera-heavy)
- **Tools cost something**: pebbles and smoke are counted, the lockpick costs time standing in a camera's sweep
- **Patrols you must read**: every guard pauses and scans at each waypoint; cameras sweep on a rhythm; the alarm decays when nobody sees you, so breaking sight is how you shake a chase
- **Scoring**: loot value + time bonus + leftover-tool bonus

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network requests, no libraries — plain ES modules under `game/src/`, one file per job (`config.js`, `level.js`, `vision.js`, `guards.js`, `cameras.js`, `player.js`, `render.js`, `input.js`, `audio.js`, `main.js`, `shots.js`, `selftest.js`). Sounds are synthesised with WebAudio.

## Screenshots

`?shot=cover` / `?shot=kettle` / `?shot=chase` / `?shot=getaway` render deterministic frozen tableaus for the screenshots in `screenshots/`. `?selftest=1` runs the headless play-test (movement, vision, wall blocking, smoke, loot, lockpick, win, caught) and reports PASS/FAIL in the page.

## License

MIT — see [LICENSE](LICENSE).
