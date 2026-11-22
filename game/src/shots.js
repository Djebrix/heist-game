// shots.js — the four frozen tableaus the screenshots are taken from. Each
// one places the thief, the stewards and the cameras by hand so a single
// frame shows the whole game: the room, the cones, the cameras, the loot and
// the alarm meter. Nothing here moves; the frame is rendered exactly once.

import { LEVEL } from './level.js';

function guardAt(state, id, x, y, facing, guardState, suspicion) {
  const g = state.guards.find((gg) => gg.id === id);
  if (!g) return;
  g.x = x;
  g.y = y;
  g.facing = facing;
  g.state = guardState;
  g.suspicion = suspicion;
  g.seenNow = suspicion >= 1;
}

function cameraAt(state, id, facing) {
  const c = state.cameras.find((cc) => cc.id === id);
  if (!c) return;
  c.facing = facing;
  c.seenNow = false;
}

function takeLoot(state, ids, value) {
  for (const id of ids) {
    const item = state.loot.find((l) => l.id === id);
    if (item) item.taken = true;
  }
  state.player.lootCount = ids.length;
  state.player.lootValue = value;
}

export function applyShot(game, name) {
  const s = game.state;
  s.phase = 'playing';

  if (name === 'cover') {
    // Mid-heist, the frame that has to sell the game: the thief slipping
    // past the vault door while a steward's cone sweeps onto them.
    s.player.x = 690;
    s.player.y = 470;
    s.player.facing = -0.4;
    s.elapsed = 74;
    s.alarm = 35;
    s.spotted = true;
    takeLoot(s, ['coin1', 'caddy1', 'coin3'], 250);
    guardAt(s, 'g-vault', 560, 400, 0, 'chase', 1);
    guardAt(s, 'g-west-b', 500, 600, -1.2, 'patrol', 0.4);
    guardAt(s, 'g-north', 700, 90, Math.PI / 2, 'patrol', 0);
    guardAt(s, 'g-garden', 1180, 300, Math.PI, 'patrol', 0);
    guardAt(s, 'g-west-a', 110, 300, 0.5, 'investigate', 0.6);
    guardAt(s, 'g-south', 900, 720, Math.PI, 'patrol', 0);
    cameraAt(s, 'cam-vault', Math.PI / 2);
    cameraAt(s, 'cam-garden', Math.PI * 0.78);
    cameraAt(s, 'cam-west', 0.15);
    s.cameras.find((c) => c.id === 'cam-vault').seenNow = true;
    return;
  }

  if (name === 'kettle') {
    // At the glass case, lockpick in hand, a steward closing in from the west.
    s.player.x = 800;
    s.player.y = 452;
    s.player.facing = -Math.PI / 2;
    s.player.lockpicking = true;
    s.player.lockpickProgress = 1.6;
    s.elapsed = 128;
    s.alarm = 12;
    takeLoot(s, ['coin1', 'caddy1', 'coin3', 'caddy2', 'fig2'], 650);
    guardAt(s, 'g-vault', 560, 400, 0, 'patrol', 0.7);
    guardAt(s, 'g-north', 780, 90, Math.PI / 2, 'patrol', 0);
    guardAt(s, 'g-garden', 1180, 500, -Math.PI / 2, 'patrol', 0);
    guardAt(s, 'g-west-a', 110, 500, 0.3, 'patrol', 0);
    guardAt(s, 'g-west-b', 500, 300, 1.4, 'investigate', 0.5);
    guardAt(s, 'g-south', 400, 720, 0, 'patrol', 0);
    cameraAt(s, 'cam-vault', Math.PI / 2);
    cameraAt(s, 'cam-garden', Math.PI * 0.7);
    cameraAt(s, 'cam-west', 0.4);
    return;
  }

  if (name === 'chase') {
    // The getaway run: kettle stolen, alarm nearly full, stewards converging
    // on the door while the thief sprints for it.
    s.player.x = 620;
    s.player.y = 690;
    s.player.facing = Math.PI / 2;
    s.player.hasKettle = true;
    s.player.lootValue = 1650;
    s.player.lootCount = 6;
    s.player.pebbles = 1;
    s.player.smoke = 0;
    s.elapsed = 187;
    s.alarm = 86;
    s.spotted = true;
    s.objective = 'Kettle stolen — reach the GETAWAY door, south wall';
    takeLoot(s, ['coin1', 'caddy1', 'coin3', 'caddy2', 'fig2', 'coin4'], 1650);
    s.smokes.push({ x: 560, y: 640, radius: 95, ttl: 2.5 });
    guardAt(s, 'g-south', 760, 720, Math.PI, 'chase', 1);
    guardAt(s, 'g-vault', 620, 560, Math.PI / 2, 'chase', 1);
    guardAt(s, 'g-west-b', 480, 660, 0.8, 'chase', 1);
    guardAt(s, 'g-north', 640, 300, Math.PI / 2, 'investigate', 0.8);
    guardAt(s, 'g-garden', 1100, 700, -2.2, 'patrol', 0.3);
    guardAt(s, 'g-west-a', 200, 700, 0, 'patrol', 0);
    cameraAt(s, 'cam-vault', Math.PI / 2);
    cameraAt(s, 'cam-garden', Math.PI * 0.78);
    cameraAt(s, 'cam-west', 0.15);
    return;
  }

  if (name === 'getaway') {
    // The payoff screen: clean getaway, score broken down.
    s.phase = 'win';
    s.player.hasKettle = true;
    s.player.lootValue = 1950;
    s.player.lootCount = 8;
    s.player.pebbles = 3;
    s.player.smoke = 1;
    s.player.x = 640;
    s.player.y = 742;
    s.elapsed = 203;
    s.alarm = 41;
    s.timeBonus = 194;
    s.toolBonus = 125;
    s.finalScore = 2269;
    takeLoot(s, ['coin1', 'caddy1', 'coin3', 'caddy2', 'fig2', 'coin4', 'caddy3', 'fig1'], 1950);
    guardAt(s, 'g-south', 900, 720, Math.PI, 'patrol', 0);
    guardAt(s, 'g-vault', 560, 400, 0, 'patrol', 0);
    guardAt(s, 'g-west-b', 500, 300, 1.2, 'patrol', 0);
    guardAt(s, 'g-north', 400, 90, 0, 'patrol', 0);
    guardAt(s, 'g-garden', 1180, 400, Math.PI, 'patrol', 0);
    guardAt(s, 'g-west-a', 110, 400, 0.5, 'patrol', 0);
    cameraAt(s, 'cam-vault', Math.PI / 2);
    cameraAt(s, 'cam-garden', Math.PI * 0.78);
    cameraAt(s, 'cam-west', 0.15);
    return;
  }

  // Unknown shot name: fall back to the cover tableau.
  applyShot(game, 'cover');
}
