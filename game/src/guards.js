// guards.js — the six stewards: patrol, suspicion, investigation, chase.
// A guard never teleports and never knows where the thief is unless it (or
// a camera) actually saw them, or the alarm is high enough to raise the hunt.

import { GUARD, ALARM } from './config.js';
import { angleDiff, canSee, insideSmoke, resolveCircleWalls } from './vision.js';
import { SOLIDS } from './level.js';

function moveTowards(g, tx, ty, speed, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return 0;
  const step = Math.min(d, speed * dt);
  g.x += (dx / d) * step;
  g.y += (dy / d) * step;
  g.facing = Math.atan2(dy, dx);
  return d - step;
}

export function guardSeesPlayer(g, player, smokes) {
  if (insideSmoke(player.x, player.y, smokes)) return false;
  return canSee(g.x, g.y, g.facing, GUARD.visionRange, GUARD.visionHalfAngle, player.x, player.y, SOLIDS);
}

export function updateGuard(g, dt, player, alarm, smokes) {
  g.seenNow = guardSeesPlayer(g, player, smokes);

  if (g.seenNow) {
    g.suspicion = Math.min(1, g.suspicion + GUARD.suspicionPerSecond * dt);
    g.lastSeenX = player.x;
    g.lastSeenY = player.y;
  } else {
    g.suspicion = Math.max(0, g.suspicion - dt * 0.55);
  }

  // A guard that is sure of what it saw gives chase; a half-sure guard
  // walks over to look; a calm guard patrols.
  if (g.suspicion >= 1) {
    g.state = 'chase';
  } else if (g.state === 'chase' && g.suspicion <= 0.25 && alarm < ALARM.huntThreshold) {
    g.state = 'patrol';
  }

  if (g.state === 'chase') {
    // Chase the last place the thief was seen, not the thief's live position:
    // breaking sight is how you shake a guard.
    const remaining = moveTowards(g, g.lastSeenX, g.lastSeenY, GUARD.chaseSpeed, dt);
    if (remaining < 8 && !g.seenNow) {
      g.state = 'investigate';
      g.investigateX = g.lastSeenX;
      g.investigateY = g.lastSeenY;
      g.investigateTimer = 2.5;
    }
  } else if (g.state === 'investigate') {
    g.investigateTimer -= dt;
    // Look around while investigating: sweep the facing back and forth.
    g.facing += Math.sin(g.investigateTimer * 3) * dt * 1.2;
    if (g.investigateTimer <= 0) g.state = 'patrol';
  } else {
    // Patrol: walk the waypoints, pausing a beat at each end to look around.
    if (g.pauseTimer > 0) {
      g.pauseTimer -= dt;
      g.facing += dt * 0.9; // slow scan while paused
    } else {
      const target = g.waypoints[g.waypointIndex];
      const remaining = moveTowards(g, target.x, target.y, GUARD.patrolSpeed, dt);
      if (remaining < 6) {
        g.waypointIndex = (g.waypointIndex + 1) % g.waypoints.length;
        g.pauseTimer = 0.9;
      }
    }
  }

  const fixed = resolveCircleWalls(g.x, g.y, GUARD.radius, SOLIDS);
  g.x = fixed.x;
  g.y = fixed.y;
}

// A thrown pebble lands: every guard close enough walks over to look.
export function lureGuards(guards, x, y, lureRadius, investigateSeconds) {
  for (const g of guards) {
    if (Math.hypot(g.x - x, g.y - y) <= lureRadius && g.state !== 'chase') {
      g.state = 'investigate';
      g.investigateX = x;
      g.investigateY = y;
      g.investigateTimer = investigateSeconds;
    }
  }
}

// Alarm raised while the hunt is on: guards converge on the last seen spot.
export function huntPlayer(guards, player, dt) {
  for (const g of guards) {
    if (g.state === 'patrol') {
      g.state = 'investigate';
      g.investigateX = player.x;
      g.investigateY = player.y;
      g.investigateTimer = 1.5;
    }
  }
}

export function guardCatchesPlayer(g, player) {
  return Math.hypot(g.x - player.x, g.y - player.y) <= GUARD.catchDistance;
}
