// cameras.js — the three wall cameras: a cone that sweeps back and forth on
// a fixed mount, and a wall panel the thief can hold E beside to cut the feed.
// A disabled camera stays dead for the rest of the run.

import { CAMERA } from './config.js';
import { canSee, insideSmoke } from './vision.js';
import { SOLIDS } from './level.js';

export function updateCamera(cam, dt, player, smokes) {
  if (cam.disabled) {
    cam.seenNow = false;
    return;
  }
  cam.sweepPhase += CAMERA.sweepSpeed * dt;
  cam.facing = cam.base + Math.sin(cam.sweepPhase) * CAMERA.sweepArc;
  cam.seenNow =
    !insideSmoke(player.x, player.y, smokes) &&
    canSee(cam.x, cam.y, cam.facing, CAMERA.range, CAMERA.halfAngle, player.x, player.y, SOLIDS);
}

// The thief stands by a camera's panel and holds E: progress fills, and at
// the end the camera goes dark. Moving away or letting go drains progress.
export function updateCameraDisable(cam, dt, player, holdingInteract) {
  if (cam.disabled) return false;
  const near = Math.hypot(player.x - cam.panel.x, player.y - cam.panel.y) <= 46;
  if (near && holdingInteract) {
    cam.disableProgress += dt;
    if (cam.disableProgress >= CAMERA.disableSeconds) {
      cam.disabled = true;
      cam.disableProgress = 0;
      return true;
    }
  } else {
    cam.disableProgress = Math.max(0, cam.disableProgress - dt * 2);
  }
  return false;
}
