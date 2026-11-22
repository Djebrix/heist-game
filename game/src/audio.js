// audio.js — every sound is synthesised with WebAudio oscillators, so the
// game ships no audio files and makes no network request. Sound starts only
// after the first user gesture, as browsers require.

let ctx = null;
let muted = false;

function ensureContext() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ensureContext();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function blip(freq, duration, type, volume, slideTo) {
  if (muted) return;
  const ac = ensureContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + duration);
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sfx = {
  pickup() {
    blip(880, 0.12, 'sine', 0.18, 1320);
  },
  kettle() {
    blip(523, 0.35, 'triangle', 0.22, 784);
    setTimeout(() => blip(1046, 0.3, 'sine', 0.15), 90);
  },
  pebble() {
    blip(300, 0.08, 'square', 0.08, 180);
    setTimeout(() => blip(140, 0.06, 'square', 0.1), 120);
  },
  smoke() {
    blip(220, 0.4, 'sawtooth', 0.06, 90);
  },
  spotted() {
    blip(196, 0.18, 'square', 0.16, 147);
  },
  alarmTick() {
    blip(1200, 0.07, 'square', 0.07);
  },
  caught() {
    blip(220, 0.5, 'sawtooth', 0.2, 55);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.25, 'triangle', 0.18), i * 110));
  },
  click() {
    blip(660, 0.05, 'sine', 0.12);
  },
  disable() {
    blip(440, 0.15, 'sine', 0.15, 880);
  },
};
