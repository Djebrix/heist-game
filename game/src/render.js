// render.js — everything the eye sees, drawn on one canvas: the teahouse
// floor at night, the red lacquer walls, the amber vision cones, the guards,
// the thief, the loot, and the HUD. Colour is the language: gold is loot,
// amber is a guard's sight, red is a camera's, dark green is safe cover.

import { CANVAS_W, CANVAS_H, PALETTE, GUARD, CAMERA } from './config.js';
import { WALLS, COVER, LEVEL } from './level.js';
import { angleDiff } from './vision.js';

function drawFloor(ctx, time) {
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Wide plank lines and a faint checker, so the floor reads as wood, not void.
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let y = 40; y < CANVAS_H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.floorB;
  for (let y = 40; y < CANVAS_H; y += 160) {
    for (let x = ((y / 80) % 2) * 160; x < CANVAS_W; x += 320) {
      ctx.fillRect(x, y, 160, 80);
    }
  }
  // Warm lantern pools: fixed glows that make the room feel lit, not flat.
  for (const [lx, ly, lr] of [[320, 280, 260], [960, 520, 280], [640, 90, 220], [1120, 400, 200]]) {
    const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, lr);
    g.addColorStop(0, 'rgba(255, 176, 58, 0.07)');
    g.addColorStop(1, 'rgba(255, 176, 58, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
  }
}

function drawExit(ctx, hasKettle, time) {
  const e = LEVEL.exit;
  const pulse = 0.55 + Math.sin(time * 3) * 0.15;
  ctx.fillStyle = hasKettle ? `rgba(87, 217, 138, ${pulse})` : 'rgba(87, 217, 138, 0.25)';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = PALETTE.exitGlow;
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x + 1, e.y + 1, e.w - 2, e.h - 2);
  ctx.fillStyle = '#eafff1';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('GETAWAY', e.x + e.w / 2, e.y + e.h / 2 + 5);
}

function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 5);
    ctx.strokeStyle = PALETTE.wallTrim;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }
}

function drawCover(ctx) {
  for (const c of COVER) {
    ctx.fillStyle = c.kind === 'table' ? PALETTE.cover : PALETTE.planter;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = PALETTE.coverTrim;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    if (c.kind === 'table') {
      // Tea setting: two cups and a pot, so a table reads as a table.
      ctx.fillStyle = '#d4a24a';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2e6c8';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2 - 22, c.y + c.h / 2, 4, 0, Math.PI * 2);
      ctx.arc(c.x + c.w / 2 + 22, c.y + c.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Planter: three leaf tufts.
      ctx.fillStyle = '#4d8a4f';
      for (const [ox, oy] of [[-18, 0], [0, -6], [18, 2]]) {
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2 + ox, c.y + c.h / 2 + oy, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawCone(ctx, x, y, facing, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawLoot(ctx, loot, time) {
  for (const item of loot) {
    if (item.taken) continue;
    const bob = Math.sin(time * 2.5 + item.x) * 2;
    const glow = ctx.createRadialGradient(item.x, item.y + bob, 2, item.x, item.y + bob, 30);
    glow.addColorStop(0, 'rgba(255, 215, 106, 0.5)');
    glow.addColorStop(1, 'rgba(255, 215, 106, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(item.x - 30, item.y + bob - 30, 60, 60);
    ctx.fillStyle = PALETTE.lootGlow;
    ctx.strokeStyle = '#8a6a1d';
    ctx.lineWidth = 1.5;
    if (item.kind === 'coin') {
      ctx.beginPath();
      ctx.arc(item.x, item.y + bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8a6a1d';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', item.x, item.y + bob + 4);
    } else if (item.kind === 'caddy') {
      ctx.fillRect(item.x - 9, item.y + bob - 8, 18, 16);
      ctx.strokeRect(item.x - 9, item.y + bob - 8, 18, 16);
      ctx.fillStyle = '#8a6a1d';
      ctx.fillRect(item.x - 9, item.y + bob - 2, 18, 3);
    } else {
      // Jade figurine: a small green statue on a gold base.
      ctx.fillStyle = '#3fae7c';
      ctx.beginPath();
      ctx.arc(item.x, item.y + bob - 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.lootGlow;
      ctx.fillRect(item.x - 10, item.y + bob + 4, 20, 4);
    }
  }
}

function drawKettleCase(ctx, state, time) {
  const c = LEVEL.kettleCase;
  // Glass case: a pale outline and a glint, so the target reads as protected.
  ctx.strokeStyle = state.player.caseOpen ? 'rgba(200, 230, 255, 0.25)' : 'rgba(200, 230, 255, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(200, 230, 255, 0.06)';
  ctx.fill();
  if (!state.player.hasKettle) {
    const pulse = 0.5 + Math.sin(time * 3) * 0.25;
    const glow = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, 58);
    glow.addColorStop(0, `rgba(75, 227, 160, ${pulse})`);
    glow.addColorStop(1, 'rgba(75, 227, 160, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(c.x - 58, c.y - 58, 116, 116);
    // The Jade Kettle itself: body, spout, handle, lid.
    ctx.fillStyle = '#2fae7c';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0d5c3d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c.x - 11, c.y - 4);
    ctx.lineTo(c.x - 22, c.y - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c.x + 13, c.y, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.lootGlow;
    ctx.beginPath();
    ctx.arc(c.x, c.y - 13, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (state.player.lockpicking) {
    drawProgressRing(ctx, c.x, c.y, c.radius + 10, state.player.lockpickProgress / 2.5, '#4be3a0');
  }
  // "HOLD E" hint when the thief is close and the case is shut.
  const near = Math.hypot(state.player.x - c.x, state.player.y - c.y) <= c.radius + 30;
  if (near && !state.player.caseOpen) {
    ctx.fillStyle = '#f2e6c8';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLD E — PICK THE LOCK', c.x, c.y - c.radius - 14);
  }
}

function drawProgressRing(ctx, x, y, r, frac, colour) {
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac));
  ctx.strokeStyle = colour;
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawGuards(ctx, guards, time) {
  for (const g of guards) {
    // Vision cone first, under the guard.
    const fill = g.state === 'chase' ? PALETTE.coneAlert : PALETTE.coneGuard;
    const edge = g.state === 'chase' ? 'rgba(255, 60, 60, 0.6)' : PALETTE.coneGuardEdge;
    drawCone(ctx, g.x, g.y, g.facing, GUARD.visionRange, GUARD.visionHalfAngle, fill, edge);
    // Body: crimson robe, dark hat, a paper lantern in hand.
    ctx.fillStyle = PALETTE.guardBody;
    ctx.beginPath();
    ctx.arc(g.x, g.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d1414';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.guardHat;
    ctx.beginPath();
    ctx.arc(g.x, g.y - 3, 8, Math.PI, 0);
    ctx.fill();
    // Lantern glow ahead of the guard, in the facing direction.
    const lx = g.x + Math.cos(g.facing) * 20;
    const ly = g.y + Math.sin(g.facing) * 20;
    ctx.fillStyle = '#ffcf6e';
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fill();
    // Suspicion: a "?" that grows into a "!" as the guard gets sure.
    if (g.suspicion > 0.15) {
      ctx.fillStyle = g.suspicion >= 1 ? '#ff5a4e' : '#ffd76a';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.suspicion >= 1 ? '!' : '?', g.x, g.y - 24);
    }
    if (g.state === 'investigate') {
      ctx.fillStyle = '#ffd76a';
      ctx.font = 'bold 16px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', g.x, g.y - 24);
    }
  }
}

function drawCameras(ctx, cameras, time) {
  for (const cam of cameras) {
    if (!cam.disabled) {
      drawCone(ctx, cam.x, cam.y, cam.facing, CAMERA.range, CAMERA.halfAngle, PALETTE.coneCamera, PALETTE.coneCameraEdge);
    }
    // Mount: a small dark box on the wall, with a red eye when live.
    ctx.fillStyle = PALETTE.cameraBody;
    ctx.fillRect(cam.x - 9, cam.y - 7, 18, 14);
    ctx.fillStyle = cam.disabled ? '#666' : '#ff3b30';
    ctx.beginPath();
    ctx.arc(cam.x + (cam.disabled ? 0 : Math.cos(cam.facing) * 5), cam.y + (cam.disabled ? 0 : Math.sin(cam.facing) * 5), 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Panel: a small brass plate on the wall nearby; holding E here kills it.
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(cam.panel.x - 7, cam.panel.y - 5, 14, 10);
    ctx.fillStyle = '#3a2c08';
    ctx.font = 'bold 9px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAM', cam.panel.x, cam.panel.y + 22);
    if (cam.disableProgress > 0 && !cam.disabled) {
      drawProgressRing(ctx, cam.panel.x, cam.panel.y, 16, cam.disableProgress / 1.5, '#ffd76a');
    }
    if (cam.disabled) {
      ctx.fillStyle = '#9aa0a6';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText('OFFLINE', cam.x, cam.y - 16);
    }
  }
}

function drawPebbles(ctx, pebbles) {
  for (const p of pebbles) {
    ctx.fillStyle = '#cfc4a8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 106, 0.8)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10 + p.age * 18, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSmoke(ctx, smokes) {
  for (const s of smokes) {
    const alpha = Math.min(0.75, (s.ttl / 4) * 0.75 + 0.2);
    const g = ctx.createRadialGradient(s.x, s.y, 8, s.x, s.y, s.radius);
    g.addColorStop(0, `rgba(190, 200, 205, ${alpha})`);
    g.addColorStop(1, 'rgba(190, 200, 205, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx, player, time) {
  const bob = player.moving ? Math.sin(time * 12) * 1.5 : 0;
  // Shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 11, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cloak: dark indigo, with an amber scarf that says "thief" at a glance.
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10182e';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.playerScarf;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob, 14, player.facing - 0.9, player.facing + 0.9);
  ctx.lineWidth = 5;
  ctx.strokeStyle = PALETTE.playerScarf;
  ctx.stroke();
  // Eyes in the facing direction.
  const ex = player.x + Math.cos(player.facing) * 6;
  const ey = player.y + bob + Math.sin(player.facing) * 6;
  ctx.fillStyle = '#f2e6c8';
  ctx.beginPath();
  ctx.arc(ex, ey, 3, 0, Math.PI * 2);
  ctx.fill();
  if (player.hasKettle) {
    // The kettle rides on the thief's back: a green glint everyone can see.
    ctx.fillStyle = '#4be3a0';
    ctx.beginPath();
    ctx.arc(player.x - Math.cos(player.facing) * 12, player.y - Math.sin(player.facing) * 12, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, state) {
  const p = state.player;
  ctx.fillStyle = PALETTE.hudBack;
  ctx.fillRect(0, 0, CANVAS_W, 52);
  ctx.strokeStyle = '#3a2c08';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 52);
  ctx.lineTo(CANVAS_W, 52);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('JADE KETTLE HEIST', 16, 22);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#c9b98a';
  ctx.fillText(state.objective, 16, 41);

  // Alarm meter: the single most important number in the game.
  const ax = 330;
  const aw = 300;
  ctx.fillStyle = '#0a0f10';
  ctx.fillRect(ax, 14, aw, 16);
  const frac = state.alarm / 100;
  const alarmColour = frac < 0.4 ? '#57d98a' : frac < 0.7 ? '#ffb03a' : '#ff5a4e';
  ctx.fillStyle = alarmColour;
  ctx.fillRect(ax, 14, aw * frac, 16);
  ctx.strokeStyle = '#f2e6c8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ax + 0.5, 14.5, aw - 1, 15);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('ALARM', ax, 44);
  if (state.spotted) {
    ctx.fillStyle = '#ff5a4e';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('SPOTTED!', ax + 90, 44);
  }

  // Loot, tools, time.
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.hudGold;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`LOOT $${p.lootValue}`, 680, 22);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '13px Georgia, serif';
  ctx.fillText(`${p.lootCount}/10 taken`, 680, 41);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`PEBBLES ${p.pebbles}`, 830, 22);
  ctx.fillText(`SMOKE ${p.smoke}`, 830, 41);
  const mins = Math.floor(state.elapsed / 60);
  const secs = Math.floor(state.elapsed % 60);
  ctx.fillText(`TIME ${mins}:${String(secs).padStart(2, '0')}`, 990, 22);
  ctx.fillStyle = p.hasKettle ? '#4be3a0' : '#c9b98a';
  ctx.fillText(p.hasKettle ? 'KETTLE: STOLEN — RUN!' : 'KETTLE: IN THE VAULT', 990, 41);

  // Controls reminder, small, bottom-left.
  ctx.fillStyle = 'rgba(242, 230, 200, 0.65)';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('WASD move · Shift sneak · Click throw pebble · Right-click / Q smoke · Hold E pick lock / cut camera · M mute', 16, CANVAS_H - 12);
}

function drawBanner(ctx, title, lines, colour) {
  ctx.fillStyle = 'rgba(5, 9, 10, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = colour;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText(title, CANVAS_W / 2, 300);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '18px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 350 + i * 30));
}

export function render(ctx, state, time) {
  drawFloor(ctx, time);
  drawExit(ctx, state.player.hasKettle, time);
  drawLoot(ctx, state.loot, time);
  drawKettleCase(ctx, state, time);
  drawWalls(ctx);
  drawCover(ctx);
  drawCameras(ctx, state.cameras, time);
  drawGuards(ctx, state.guards, time);
  drawPebbles(ctx, state.pebbles);
  drawSmoke(ctx, state.smokes);
  drawPlayer(ctx, state.player, time);
  drawHud(ctx, state);

  // Red pulse at the screen edge while the alarm is hot: tension you feel.
  if (state.alarm > 55 && state.phase === 'playing') {
    const pulse = (state.alarm - 55) / 45 * (0.25 + Math.sin(time * 6) * 0.12);
    ctx.strokeStyle = `rgba(255, 60, 60, ${pulse})`;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, CANVAS_W - 14, CANVAS_H - 14);
  }

  if (state.phase === 'menu') {
    drawBanner(ctx, 'JADE KETTLE HEIST', [
      'The Vermilion Teahouse keeps its Jade Kettle behind glass, six stewards,',
      'and three watch-cameras. Cross the room, pick the lock, and walk out rich.',
      '',
      'WASD move · Shift sneak · Click throw a pebble · Right-click / Q smoke',
      'Hold E to pick the lock or cut a camera feed · Grab the kettle, reach GETAWAY',
      '',
      'Click or press Enter to begin',
    ], '#ffd76a');
  } else if (state.phase === 'caught') {
    drawBanner(ctx, 'BUSTED!', [
      state.caughtReason,
      `Loot carried: $${state.player.lootValue}  ·  Time: ${Math.floor(state.elapsed)}s`,
      '',
      'Press R to try again',
    ], '#ff5a4e');
  } else if (state.phase === 'win') {
    drawBanner(ctx, 'CLEAN GETAWAY!', [
      `The Jade Kettle is yours. Loot $${state.player.lootValue} · ${state.player.lootCount}/10 taken`,
      `Time bonus $${state.timeBonus} · Tool bonus $${state.toolBonus} · TOTAL $${state.finalScore}`,
      '',
      'Press R to steal it all over again',
    ], '#4be3a0');
  }
}
