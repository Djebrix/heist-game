// vision.js — pure geometry: line of sight, vision cones and wall blocking.
// No game state lives here, only shapes, so the guards, the cameras and the
// self-test all ask the same questions and get the same answers.

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// True when the segment a->b touches any wall rect (touching an edge counts).
export function segmentBlocked(ax, ay, bx, by, walls) {
  for (const w of walls) {
    if (segmentHitsRect(ax, ay, bx, by, w)) return true;
  }
  return false;
}

function segmentHitsRect(ax, ay, bx, by, r) {
  if (pointInRect(ax, ay, r) || pointInRect(bx, by, r)) return true;
  const dx = bx - ax;
  const dy = by - ay;
  // Slab test: parametrise the segment and find where it crosses the rect.
  let tMin = 0;
  let tMax = 1;
  const slabs = [
    [r.x - ax, r.x + r.w - ax, dx],
    [r.y - ay, r.y + r.h - ay, dy],
  ];
  for (const [lo, hi, d] of slabs) {
    if (d === 0) {
      if (lo > 0 || hi < 0) return false;
    } else {
      let t1 = lo / d;
      let t2 = hi / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      if (t1 > tMin) tMin = t1;
      if (t2 < tMax) tMax = t2;
      if (tMin > tMax) return false;
    }
  }
  return tMax >= 0 && tMin <= 1;
}

// Angle difference wrapped to [-PI, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// True when the watcher at (wx, wy) facing `facing` can see the point (tx, ty):
// inside range, inside the cone, and with a clear line of sight.
export function canSee(wx, wy, facing, range, halfAngle, tx, ty, walls) {
  const dx = tx - wx;
  const dy = ty - wy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 1) return true;
  const angle = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(angle, facing)) > halfAngle) return false;
  return !segmentBlocked(wx, wy, tx, ty, walls);
}

// Is the point inside any smoke cloud? Smoke blocks every watcher.
export function insideSmoke(px, py, smokes) {
  for (const s of smokes) {
    if (Math.hypot(px - s.x, py - s.y) <= s.radius) return true;
  }
  return false;
}

// Circle (px,py,r) pushed out of every wall rect it overlaps. Returns the
// corrected position; movement code calls this after each axis step.
export function resolveCircleWalls(px, py, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(px, w.x + w.w));
    const cy = Math.max(w.y, Math.min(py, w.y + w.h));
    const dx = px - cx;
    const dy = py - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 === 0) {
        // Centre inside the rect: push out along the smallest penetration.
        const pushL = px - w.x + r;
        const pushR = w.x + w.w - px + r;
        const pushT = py - w.y + r;
        const pushB = w.y + w.h - py + r;
        const m = Math.min(pushL, pushR, pushT, pushB);
        if (m === pushL) px = w.x - r;
        else if (m === pushR) px = w.x + w.w + r;
        else if (m === pushT) py = w.y - r;
        else py = w.y + w.h + r;
      } else {
        const d = Math.sqrt(d2);
        px = cx + (dx / d) * r;
        py = cy + (dy / d) * r;
      }
    }
  }
  return { x: px, y: py };
}
