// Sound is synthesised on the spot with WebAudio: no files, no downloads, and every action in the
// fight gets its own short voice. The context is created on the first gesture, as browsers demand.
let context = null;
let master = null;
// Nothing is synthesised until a real gesture has unlocked audio, so the page never logs an
// autoplay warning and the screenshot run stays quiet.
let armed = false;

function audioContext() {
  if (context) return context;
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
    master = context.createGain();
    master.gain.value = 0.22;
    master.connect(context.destination);
  } catch (error) {
    context = null;
  }
  return context;
}

export function initAudio() {
  armed = true;
  const ctx = audioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return Boolean(ctx);
}

export function setMuted(muted) {
  if (master) master.gain.value = muted ? 0 : 0.22;
}

function tone(spec) {
  const ctx = context;
  if (!ctx || !master) return;
  const now = ctx.currentTime + (spec.delay || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.type || 'sine';
  osc.frequency.setValueAtTime(spec.from, now);
  if (spec.to && spec.to !== spec.from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, spec.to), now + spec.dur);
  }
  const peak = spec.gain === undefined ? 0.5 : spec.gain;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + spec.dur + 0.02);
}

function noise(spec) {
  const ctx = context;
  if (!ctx || !master) return;
  const length = Math.max(1, Math.floor(ctx.sampleRate * spec.dur));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const fade = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fade * fade;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = spec.freq || 900;
  filter.Q.value = spec.q || 1.1;
  const gain = ctx.createGain();
  gain.gain.value = spec.gain === undefined ? 0.4 : spec.gain;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(ctx.currentTime + (spec.delay || 0));
}

const VOICES = {
  card() {
    tone({ type: 'triangle', from: 420, to: 640, dur: 0.09, gain: 0.32 });
    noise({ dur: 0.05, freq: 2400, gain: 0.1 });
  },
  sting() {
    tone({ type: 'sawtooth', from: 300, to: 90, dur: 0.16, gain: 0.3 });
    noise({ dur: 0.12, freq: 1400, gain: 0.24 });
  },
  hurt() {
    tone({ type: 'square', from: 150, to: 70, dur: 0.2, gain: 0.3 });
    noise({ dur: 0.16, freq: 420, gain: 0.22 });
  },
  wax() {
    tone({ type: 'triangle', from: 700, to: 900, dur: 0.1, gain: 0.22 });
  },
  draw() {
    tone({ type: 'sine', from: 880, to: 980, dur: 0.06, gain: 0.16 });
  },
  turn() {
    tone({ type: 'sine', from: 520, to: 430, dur: 0.12, gain: 0.2 });
  },
  combo() {
    tone({ type: 'square', from: 520, to: 660, dur: 0.08, gain: 0.2 });
    tone({ type: 'square', from: 660, to: 880, dur: 0.1, gain: 0.2, delay: 0.07 });
    tone({ type: 'square', from: 880, to: 1180, dur: 0.12, gain: 0.18, delay: 0.14 });
  },
  deny() {
    tone({ type: 'square', from: 160, to: 120, dur: 0.14, gain: 0.2 });
  },
  mite() {
    noise({ dur: 0.18, freq: 620, q: 2.4, gain: 0.24 });
  },
  reward() {
    tone({ type: 'triangle', from: 440, to: 560, dur: 0.14, gain: 0.24 });
    tone({ type: 'triangle', from: 660, to: 830, dur: 0.18, gain: 0.22, delay: 0.1 });
  },
  take() {
    tone({ type: 'triangle', from: 740, to: 1000, dur: 0.12, gain: 0.24 });
  },
  start() {
    tone({ type: 'sine', from: 240, to: 600, dur: 0.28, gain: 0.22 });
    noise({ dur: 0.2, freq: 1800, gain: 0.1, delay: 0.05 });
  },
  win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => tone({ type: 'triangle', from: freq, to: freq, dur: 0.3, gain: 0.24, delay: i * 0.12 }));
  },
  lose() {
    const notes = [392, 330, 262, 196];
    notes.forEach((freq, i) => tone({ type: 'sawtooth', from: freq, to: freq * 0.98, dur: 0.34, gain: 0.2, delay: i * 0.15 }));
  },
  click() {
    tone({ type: 'square', from: 300, to: 260, dur: 0.05, gain: 0.14 });
  },
};

export function playSound(name) {
  if (!armed || stateIsMuted()) return;
  const voice = VOICES[name];
  if (!voice) return;
  if (!context) {
    const ctx = audioContext();
    if (!ctx) return;
  }
  try {
    voice();
  } catch (error) {
    /* A silent browser is better than a broken frame. */
  }
}

let mutedFlag = false;

function stateIsMuted() {
  return mutedFlag;
}

export function toggleMute() {
  mutedFlag = !mutedFlag;
  setMuted(mutedFlag);
  return mutedFlag;
}

export function isMuted() {
  return mutedFlag;
}
