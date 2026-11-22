// level.js — the Vermilion Teahouse, one floor, three routes to the vault.
// Walls are solid rectangles (they block movement and sight). Cover blocks
// are solid too, but low: they block movement and sight exactly like walls,
// which is what makes a table a hiding place. Every coordinate is hand-placed.

export const LEVEL = {
  name: 'The Vermilion Teahouse',
  target: 'the Jade Kettle',
  // Player enters through the south-west service door.
  playerStart: { x: 120, y: 726 },
  // The getaway door, bottom centre of the south wall.
  exit: { x: 600, y: 724, w: 80, h: 36 },
  // The kettle sits in a locked glass case in the middle of the vault.
  kettleCase: { x: 800, y: 400, radius: 34 },
  kettle: { x: 800, y: 400 },
};

export const WALLS = [
  // Outer shell (the exit gap is left in the bottom wall, x 600..680).
  { x: 0, y: 0, w: 1280, h: 40 },
  { x: 0, y: 760, w: 600, h: 40 },
  { x: 680, y: 760, w: 600, h: 40 },
  { x: 0, y: 0, w: 40, h: 800 },
  { x: 1240, y: 0, w: 40, h: 800 },
  // Vault room, centre. North wall has a gap (x 750..810) for the north route;
  // west and east walls each have a door gap (y 380..440).
  { x: 600, y: 240, w: 150, h: 24 },
  { x: 810, y: 240, w: 190, h: 24 },
  { x: 600, y: 536, w: 400, h: 24 },
  { x: 600, y: 240, w: 24, h: 140 },
  { x: 600, y: 440, w: 24, h: 120 },
  { x: 976, y: 240, w: 24, h: 140 },
  { x: 976, y: 440, w: 24, h: 120 },
  // North corridor divider: a gap at x 280..360 leads down into the west hall.
  { x: 40, y: 140, w: 240, h: 20 },
  { x: 360, y: 140, w: 240, h: 20 },
  // Pillars flanking the vault's west door and east door.
  { x: 540, y: 300, w: 28, h: 28 },
  { x: 540, y: 472, w: 28, h: 28 },
  { x: 1032, y: 300, w: 28, h: 28 },
  { x: 1032, y: 472, w: 28, h: 28 },
];

// Low cover: tea tables in the west hall, planters in the east garden.
// They read as safe cover at a glance (dark green, gold rim) and break sight.
export const COVER = [
  { x: 160, y: 180, w: 120, h: 60, kind: 'table' },
  { x: 160, y: 560, w: 120, h: 60, kind: 'table' },
  { x: 360, y: 180, w: 120, h: 60, kind: 'table' },
  { x: 360, y: 560, w: 120, h: 60, kind: 'table' },
  { x: 260, y: 360, w: 80, h: 80, kind: 'table' },
  { x: 1040, y: 180, w: 120, h: 50, kind: 'planter' },
  { x: 1040, y: 570, w: 120, h: 50, kind: 'planter' },
  { x: 1120, y: 360, w: 80, h: 80, kind: 'planter' },
];

// Everything solid: walls plus cover.
export const SOLIDS = [...WALLS, ...COVER];

// Loot scattered along all three routes, so every route pays.
export const LOOT_SPAWNS = [
  { id: 'coin1', kind: 'coin', x: 120, y: 400 },
  { id: 'coin2', kind: 'coin', x: 1180, y: 400 },
  { id: 'coin3', kind: 'coin', x: 640, y: 90 },
  { id: 'coin4', kind: 'coin', x: 300, y: 720 },
  { id: 'caddy1', kind: 'caddy', x: 220, y: 190 },
  { id: 'caddy2', kind: 'caddy', x: 420, y: 610 },
  { id: 'caddy3', kind: 'caddy', x: 1100, y: 200 },
  { id: 'fig1', kind: 'figurine', x: 1100, y: 600 },
  { id: 'fig2', kind: 'figurine', x: 200, y: 90 },
];

// Six guards, one patrol each. Waypoints are walked in order, ping-pong.
export const GUARD_SPAWNS = [
  { id: 'g-west-a', name: 'Lantern Steward', waypoints: [{ x: 110, y: 150 }, { x: 110, y: 650 }] },
  { id: 'g-west-b', name: 'Tea Master', waypoints: [{ x: 500, y: 150 }, { x: 500, y: 650 }] },
  { id: 'g-north', name: 'Corridor Warden', waypoints: [{ x: 200, y: 90 }, { x: 1080, y: 90 }] },
  { id: 'g-vault', name: 'Vault Keeper', waypoints: [{ x: 560, y: 340 }, { x: 560, y: 480 }] },
  { id: 'g-garden', name: 'Garden Watcher', waypoints: [{ x: 1180, y: 150 }, { x: 1180, y: 650 }] },
  { id: 'g-south', name: 'Door Sentry', waypoints: [{ x: 150, y: 720 }, { x: 1150, y: 720 }] },
];

// Three wall cameras. `base` is the middle of the sweep; the cone swings
// `sweepArc` either side of it. Each has a wall panel the thief can disable.
export const CAMERA_SPAWNS = [
  {
    id: 'cam-vault', x: 780, y: 252, base: Math.PI / 2, // faces south, into the vault
    panel: { x: 700, y: 300 },
  },
  {
    id: 'cam-garden', x: 1224, y: 150, base: Math.PI * 0.78, // faces south-west
    panel: { x: 1180, y: 240 },
  },
  {
    id: 'cam-west', x: 56, y: 150, base: 0.15, // faces east across the hall
    panel: { x: 120, y: 240 },
  },
];

export function buildLoot() {
  return LOOT_SPAWNS.map((s) => ({ ...s, taken: false }));
}

export function buildGuards() {
  return GUARD_SPAWNS.map((s) => ({
    id: s.id,
    name: s.name,
    waypoints: s.waypoints,
    waypointIndex: 0,
    x: s.waypoints[0].x,
    y: s.waypoints[0].y,
    facing: 0,
    state: 'patrol', // patrol | investigate | chase
    suspicion: 0, // 0..1, fills while the guard sees the thief
    investigateX: 0,
    investigateY: 0,
    investigateTimer: 0,
    pauseTimer: 0,
    lastSeenX: 0,
    lastSeenY: 0,
    seenNow: false,
  }));
}

export function buildCameras() {
  return CAMERA_SPAWNS.map((s) => ({
    id: s.id,
    x: s.x,
    y: s.y,
    base: s.base,
    panel: s.panel,
    sweepPhase: 0,
    facing: s.base,
    disabled: false,
    disableProgress: 0,
    seenNow: false,
  }));
}
