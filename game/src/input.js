// input.js — keyboard and mouse, kept in one place so the game loop and the
// self-test both read the same shape: an object of booleans plus click events.

export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false, // Shift: slower, quieter steps
    interact: false, // E held: pick the lock, cut a camera feed
    throwQueued: null, // {x, y} in canvas coords, consumed by the game loop
    smokeQueued: false,
    anyKey: false,
  };
}

const KEYMAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
  KeyE: 'interact',
  KeyQ: 'smokeQueued',
};

export function attachInput(input, canvas) {
  window.addEventListener('keydown', (event) => {
    const field = KEYMAP[event.code];
    if (field) {
      // Q is a one-shot (a smoke puff), not a held key: ignore key repeat.
      if (field === 'smokeQueued' && event.repeat) return;
      input[field] = true;
      event.preventDefault();
    }
    input.anyKey = true;
  });
  window.addEventListener('keyup', (event) => {
    const field = KEYMAP[event.code];
    if (field) input[field] = false;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    if (event.button === 0) input.throwQueued = { x, y };
    if (event.button === 2) input.smokeQueued = true;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
    input.sneak = false;
    input.interact = false;
  });
}
