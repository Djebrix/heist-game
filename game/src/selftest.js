// selftest.js — a headless play-test that drives the real game step with
// scripted inputs and asserts the mechanics that have to work: movement,
// guard vision, wall blocking, smoke, loot, the lockpick, the kettle, the
// win, and the caught moment. It runs under ?selftest=1 and writes PASS/FAIL
// lines into the page; it is never part of normal play.

function stepFor(game, seconds, dt = 0.05) {
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) game.step(dt);
}

export function runSelfTest(game) {
  const results = [];
  const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `: ${detail}`}`);
  const s = () => game.state;
  const p = () => game.state.player;
  const guard = (id) => game.state.guards.find((g) => g.id === id);

  // 1. Movement: holding right walks the thief east.
  game.start();
  const x0 = p().x;
  game.input.right = true;
  stepFor(game, 0.5);
  game.input.right = false;
  check('movement', p().x > x0 + 60, `x ${x0} -> ${p().x}`);

  // 2. Guard vision: the thief standing in an open cone raises the alarm.
  game.start();
  const g = guard('g-vault');
  g.x = 560; g.y = 400; g.facing = 0; g.state = 'patrol';
  p().x = 700; p().y = 400;
  stepFor(game, 1);
  check('guard-vision-raises-alarm', s().alarm > 0, `alarm ${s().alarm}`);

  // 3. Wall blocking: the same guard, the thief behind the vault wall,
  // and the alarm must not move even though the thief is in the cone's arc.
  game.start();
  const g3 = guard('g-vault');
  g3.x = 560; g3.y = 400; g3.facing = -0.62; g3.state = 'investigate'; g3.investigateTimer = 10;
  p().x = 700; p().y = 300;
  stepFor(game, 1);
  check('wall-blocks-vision', s().alarm === 0, `alarm ${s().alarm}`);

  // 4. Loot: walking over a coin takes it and pays.
  game.start();
  p().x = 120; p().y = 400;
  stepFor(game, 0.1);
  check('loot-pickup', p().lootCount === 1 && p().lootValue === 50, `count ${p().lootCount} value ${p().lootValue}`);

  // 5. Lockpick: holding E at the case opens it; the kettle then takes.
  game.start();
  p().x = 800; p().y = 452;
  game.input.interact = true;
  stepFor(game, 3);
  game.input.interact = false;
  check('lockpick-opens-case', p().caseOpen, 'case stayed shut');
  p().x = 800; p().y = 400;
  stepFor(game, 0.1);
  check('kettle-collected', p().hasKettle, 'kettle not taken');

  // 6. Win: kettle in hand, standing in the getaway door.
  game.start();
  p().hasKettle = true;
  p().x = 640; p().y = 742;
  stepFor(game, 0.1);
  check('win-at-exit', s().phase === 'win', `phase ${s().phase}`);

  // 7. Caught: a nearly-full alarm tops out while the thief is watched.
  game.start();
  const g7 = guard('g-vault');
  g7.x = 560; g7.y = 400; g7.facing = 0; g7.state = 'patrol';
  p().x = 700; p().y = 400;
  s().alarm = 99;
  stepFor(game, 0.5);
  check('alarm-full-caught', s().phase === 'caught', `phase ${s().phase} alarm ${s().alarm}`);

  // 8. Smoke: the thief inside a smoke cloud is invisible to the same cone.
  game.start();
  const g8 = guard('g-vault');
  g8.x = 560; g8.y = 400; g8.facing = 0; g8.state = 'patrol';
  p().x = 700; p().y = 400;
  game.input.smokeQueued = true;
  stepFor(game, 1);
  check('smoke-blocks-vision', s().alarm === 0 && s().smokes.length === 1, `alarm ${s().alarm} smokes ${s().smokes.length}`);

  // 9. Pebble: a thrown pebble pulls a nearby guard over to look.
  game.start();
  p().x = 300; p().y = 400;
  game.input.throwQueued = { x: 150, y: 320 };
  stepFor(game, 0.1);
  check('pebble-lures-guard', guard('g-west-a').state === 'investigate', `state ${guard('g-west-a').state}`);

  // 10. Camera: standing in a sweeping camera cone raises the alarm.
  game.start();
  p().x = 780; p().y = 450;
  stepFor(game, 1);
  check('camera-raises-alarm', s().alarm > 0, `alarm ${s().alarm}`);

  return results;
}
