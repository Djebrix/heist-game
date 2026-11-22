// main.js — the game itself: state, the fixed update step, win/lose, and the
// alarm. Everything else is a module with one job; this file wires them up
// and owns the phase machine (menu → playing → caught | win).

import { CANVAS_W, CANVAS_H, ALARM, LOOT, PEBBLE } from './config.js';
import { LEVEL, buildLoot, buildGuards, buildCameras } from './level.js';
import { createPlayer, updatePlayer, collectLoot, updateLockpick, collectKettle, throwPebble, useSmoke, playerInExit } from './player.js';
import { updateGuard, lureGuards, huntPlayer, guardCatchesPlayer } from './guards.js';
import { updateCamera, updateCameraDisable } from './cameras.js';
import { createInput, attachInput } from './input.js';
import { render } from './render.js';
import { sfx, unlockAudio, toggleMute } from './audio.js';
import { applyShot } from './shots.js';
import { runSelfTest } from './selftest.js';

export function createGame() {
  const state = freshState();
  const input = createInput();
  const game = { state, input };

  function freshState() {
    return {
      phase: 'menu', // menu | playing | caught | win
      player: createPlayer(),
      guards: buildGuards(),
      cameras: buildCameras(),
      loot: buildLoot(),
      pebbles: [],
      smokes: [],
      alarm: 0,
      elapsed: 0,
      spotted: false,
      huntRaised: false,
      objective: 'Steal the Jade Kettle from the vault',
      caughtReason: '',
      finalScore: 0,
      timeBonus: 0,
      toolBonus: 0,
    };
  }

  game.start = function start() {
    Object.assign(state, freshState());
    state.phase = 'playing';
  };

  game.step = function step(dt) {
    if (state.phase !== 'playing') return;
    const p = state.player;
    state.elapsed += dt;

    // Tools first: a thrown pebble, a puff of smoke.
    if (input.throwQueued) {
      const pebble = throwPebble(p, input.throwQueued.x, input.throwQueued.y);
      if (pebble) {
        state.pebbles.push(pebble);
        lureGuards(state.guards, pebble.x, pebble.y, PEBBLE.lureRadius, PEBBLE.investigateSeconds);
        sfx.pebble();
      }
      input.throwQueued = null;
    }
    if (input.smokeQueued) {
      const cloud = useSmoke(p);
      if (cloud) {
        state.smokes.push(cloud);
        sfx.smoke();
      }
      input.smokeQueued = false;
    }

    updatePlayer(p, dt, input);

    // The lockpick and the camera panels both run off the held E key.
    if (updateLockpick(p, dt, input.interact)) sfx.kettle();
    for (const cam of state.cameras) {
      if (updateCameraDisable(cam, dt, p, input.interact)) sfx.disable();
    }

    const picked = collectLoot(p, state.loot);
    if (picked) sfx.pickup();
    if (collectKettle(p)) {
      sfx.kettle();
      state.objective = 'Kettle stolen — reach the GETAWAY door, south wall';
    }

    // Watchers: guards and cameras decide what they see this frame.
    let anyoneSees = false;
    for (const g of state.guards) {
      updateGuard(g, dt, p, state.alarm, state.smokes);
      if (g.seenNow) anyoneSees = true;
    }
    for (const cam of state.cameras) {
      updateCamera(cam, dt, p, state.smokes);
      if (cam.seenNow) anyoneSees = true;
    }
    if (anyoneSees && !state.spotted) sfx.spotted();
    state.spotted = anyoneSees;

    // The alarm: rises while anyone watches, drains while nobody does.
    const guardWatching = state.guards.some((g) => g.seenNow);
    const cameraWatching = state.cameras.some((c) => c.seenNow);
    if (guardWatching) state.alarm += ALARM.guardPerSecond * dt;
    if (cameraWatching) state.alarm += ALARM.cameraPerSecond * dt;
    if (!guardWatching && !cameraWatching) state.alarm -= ALARM.decayPerSecond * dt;
    state.alarm = Math.max(0, Math.min(ALARM.max, state.alarm));

    // Past the hunt threshold the whole house converges on the last seen spot.
    if (state.alarm >= ALARM.huntThreshold && !state.huntRaised) {
      state.huntRaised = true;
      huntPlayer(state.guards, p, dt);
    } else if (state.alarm < 30) {
      state.huntRaised = false;
    }

    // Pebble ripples and smoke clouds age out.
    for (const peb of state.pebbles) peb.age += dt;
    state.pebbles = state.pebbles.filter((peb) => peb.age < 0.9);
    for (const s of state.smokes) s.ttl -= dt;
    state.smokes = state.smokes.filter((s) => s.ttl > 0);

    // Lose: the alarm tops out, or a chasing steward lays hands on the thief.
    if (state.alarm >= ALARM.max) {
      state.phase = 'caught';
      state.caughtReason = 'The alarm hit full — the teahouse locked every door.';
      sfx.caught();
      return;
    }
    for (const g of state.guards) {
      if (g.state === 'chase' && guardCatchesPlayer(g, p)) {
        state.phase = 'caught';
        state.caughtReason = `The ${g.name} laid hands on you in the open.`;
        sfx.caught();
        return;
      }
    }

    // Win: kettle in hand, standing in the getaway door.
    if (p.hasKettle && playerInExit(p)) {
      state.phase = 'win';
      state.timeBonus = Math.max(0, LOOT.timeBonusStart - Math.floor(state.elapsed) * LOOT.timeBonusPerSecond);
      state.toolBonus = p.pebbles * LOOT.pebbleBonus + p.smoke * LOOT.smokeBonus;
      state.finalScore = p.lootValue + state.timeBonus + state.toolBonus;
      sfx.win();
    }
  };

  return game;
}

export function startGame() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const game = createGame();
  attachInput(game.input, canvas);

  // Deterministic screenshot mode: build one frozen tableau and render it
  // once, so headless Chrome captures the exact frame every time.
  const shot = params.get('shot');
  if (shot) {
    applyShot(game, shot);
    render(ctx, game.state, 1.0);
    document.title = 'SHOT READY';
    window.__shotReady = true;
    return game;
  }

  // Headless self-test: drives the real update step with scripted inputs
  // and writes PASS/FAIL lines into the page for the test runner to read.
  if (params.get('selftest') === '1') {
    const results = runSelfTest(game);
    const pre = document.getElementById('selftest');
    pre.textContent = results.join('\n');
    document.title = results.every((r) => r.startsWith('PASS')) ? 'SELFTEST:PASS' : 'SELFTEST:FAIL';
    window.__shotReady = true;
    return game;
  }

  // Normal play.
  let last = performance.now();
  let time = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    game.step(dt);
    render(ctx, game.state, time);
    requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', (event) => {
    unlockAudio();
    if (event.code === 'Enter' && game.state.phase === 'menu') {
      game.start();
      sfx.click();
    }
    if (event.code === 'KeyR' && (game.state.phase === 'caught' || game.state.phase === 'win')) {
      game.start();
      sfx.click();
    }
    if (event.code === 'KeyM') toggleMute();
  });
  canvas.addEventListener('mousedown', () => {
    unlockAudio();
    if (game.state.phase === 'menu') {
      game.start();
      sfx.click();
    }
  });

  requestAnimationFrame(frame);
  return game;
}
