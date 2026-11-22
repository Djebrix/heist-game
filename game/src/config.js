// config.js — every tuning number for Jade Kettle Heist lives here, so the
// rest of the game reads intent instead of magic numbers.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

export const PLAYER = {
  radius: 14,
  speed: 205,
  sneakSpeed: 120,
  pebbles: 6,
  smoke: 2,
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 78,
  chaseSpeed: 132,
  investigateSpeed: 105,
  visionRange: 235,
  visionHalfAngle: 0.61, // ~35 degrees each side
  catchDistance: 30,
  suspicionPerSecond: 1.15, // fills a guard's own suspicion in under a second
};

export const CAMERA = {
  range: 265,
  halfAngle: 0.52,
  sweepSpeed: 0.55, // radians per second of the sweep centre
  sweepArc: 0.85, // radians either side of the base facing
  disableSeconds: 1.5,
};

export const ALARM = {
  guardPerSecond: 30,
  cameraPerSecond: 22,
  decayPerSecond: 7,
  huntThreshold: 55, // above this, guards leave patrol and hunt the player
  max: 100,
};

export const LOOT = {
  coin: 50,
  caddy: 150,
  figurine: 300,
  kettle: 1000,
  lockpickSeconds: 2.5,
  timeBonusStart: 600,
  timeBonusPerSecond: 2,
  pebbleBonus: 25,
  smokeBonus: 50,
};

export const SMOKE = {
  radius: 95,
  durationSeconds: 4,
};

export const PEBBLE = {
  throwRange: 420,
  lureRadius: 270,
  investigateSeconds: 3,
};

export const PALETTE = {
  floorA: '#16282c',
  floorB: '#132227',
  floorLine: '#1d3338',
  wall: '#6e1d1d',
  wallTop: '#8a2626',
  wallTrim: '#d4a24a',
  cover: '#1e3d2f',
  coverTrim: '#c9a227',
  planter: '#1c3a26',
  exitZone: '#2f6b4f',
  exitGlow: '#57d98a',
  coneGuard: 'rgba(255, 186, 74, 0.20)',
  coneGuardEdge: 'rgba(255, 186, 74, 0.45)',
  coneCamera: 'rgba(255, 82, 82, 0.17)',
  coneCameraEdge: 'rgba(255, 82, 82, 0.5)',
  coneAlert: 'rgba(255, 60, 60, 0.30)',
  lootGlow: '#ffd76a',
  kettleGlow: '#4be3a0',
  player: '#2b3a67',
  playerScarf: '#ffb03a',
  guardBody: '#a12727',
  guardHat: '#5d1414',
  cameraBody: '#3a3f46',
  hudBack: 'rgba(8, 14, 16, 0.82)',
  hudText: '#f2e6c8',
  hudDanger: '#ff5a4e',
  hudGold: '#ffd76a',
};
