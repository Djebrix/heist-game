// player.js — the thief: WASD movement, pebble throws, smoke, and the slow
// lockpick at the kettle case. Every tool costs something: pebbles and smoke
// are counted, the lockpick costs time standing still in the open.

import { PLAYER, LOOT, PEBBLE, SMOKE } from './config.js';
import { resolveCircleWalls } from './vision.js';
import { SOLIDS, LEVEL } from './level.js';

export function createPlayer() {
  return {
    x: LEVEL.playerStart.x,
    y: LEVEL.playerStart.y,
    facing: 0,
    moving: false,
    sneaking: false,
    pebbles: PLAYER.pebbles,
    smoke: PLAYER.smoke,
    lootValue: 0,
    lootCount: 0,
    hasKettle: false,
    lockpickProgress: 0,
    lockpicking: false,
    caseOpen: false,
  };
}

export function updatePlayer(player, dt, input) {
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  const len = Math.hypot(dx, dy);
  player.moving = len > 0;
  player.sneaking = input.sneak;
  if (len > 0) {
    dx /= len;
    dy /= len;
    const speed = input.sneak ? PLAYER.sneakSpeed : PLAYER.speed;
    // Holding E to pick a lock roots the thief in place: the cost of the tool.
    const moving = player.lockpicking ? 0 : speed * dt;
    player.x += dx * moving;
    player.y += dy * moving;
    player.facing = Math.atan2(dy, dx);
  }
  const fixed = resolveCircleWalls(player.x, player.y, PLAYER.radius, SOLIDS);
  player.x = fixed.x;
  player.y = fixed.y;
}

// Pick up any loose loot within reach. The kettle is separate: it only
// becomes takeable once its case has been picked open.
export function collectLoot(player, loot) {
  let picked = null;
  for (const item of loot) {
    if (!item.taken && Math.hypot(player.x - item.x, player.y - item.y) <= 30) {
      item.taken = true;
      player.lootValue += LOOT[item.kind];
      player.lootCount += 1;
      picked = item;
    }
  }
  return picked;
}

export function updateLockpick(player, dt, holdingInteract) {
  const nearCase =
    Math.hypot(player.x - LEVEL.kettleCase.x, player.y - LEVEL.kettleCase.y) <=
    LEVEL.kettleCase.radius + 26;
  player.lockpicking = false;
  if (player.caseOpen || !nearCase || !holdingInteract) {
    player.lockpickProgress = Math.max(0, player.lockpickProgress - dt * 2);
    return false;
  }
  player.lockpicking = true;
  player.lockpickProgress += dt;
  if (player.lockpickProgress >= LOOT.lockpickSeconds) {
    player.caseOpen = true;
    player.lockpickProgress = 0;
    return true;
  }
  return false;
}

export function collectKettle(player) {
  if (!player.caseOpen || player.hasKettle) return false;
  if (Math.hypot(player.x - LEVEL.kettle.x, player.y - LEVEL.kettle.y) <= 34) {
    player.hasKettle = true;
    player.lootValue += LOOT.kettle;
    player.lootCount += 1;
    return true;
  }
  return false;
}

export function throwPebble(player, tx, ty) {
  if (player.pebbles <= 0) return null;
  const dx = tx - player.x;
  const dy = ty - player.y;
  const d = Math.hypot(dx, dy);
  if (d < 4) return null;
  const reach = Math.min(d, PEBBLE.throwRange);
  player.pebbles -= 1;
  return {
    x: player.x + (dx / d) * reach,
    y: player.y + (dy / d) * reach,
    age: 0,
  };
}

export function useSmoke(player) {
  if (player.smoke <= 0) return null;
  player.smoke -= 1;
  return { x: player.x, y: player.y, radius: SMOKE.radius, ttl: SMOKE.durationSeconds };
}

export function playerInExit(player) {
  const e = LEVEL.exit;
  return player.x >= e.x && player.x <= e.x + e.w && player.y >= e.y && player.y <= e.y + e.h;
}
