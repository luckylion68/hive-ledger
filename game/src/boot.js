// Boot: size the canvas to the window without letterboxing bars, run the loop, pick the painter for
// the current scene, and answer ?shot= by staging a real position for the screenshot runner.
import { VIEW } from './config.js';
import { state, advanceEffects } from './state.js';
import { bindInput } from './input.js';
import { goTitle } from './scenes.js';
import { stageShot } from './shots.js';
import { drawBattleScene, drawRewardScene, drawEndScene } from './render-battle.js';
import { drawTitleScene } from './render-cover.js';
import { initAudio } from './audio.js';

const canvas = document.getElementById('stage');
const announce = document.getElementById('announce');
const ctx = canvas.getContext('2d', { alpha: false });
let deviceScale = 1;

function fit() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const box = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  const cssWidth = Math.round(VIEW.width * box);
  const cssHeight = Math.round(VIEW.height * box);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  deviceScale = canvas.width / VIEW.width;
}

function paint() {
  ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  ctx.save();
  switch (state.scene) {
    case 'battle':
      drawBattleScene(ctx);
      break;
    case 'reward':
      drawRewardScene(ctx);
      break;
    case 'end':
      drawEndScene(ctx);
      break;
    case 'title':
    default:
      drawTitleScene(ctx);
      break;
  }
  ctx.restore();
  if (state.fade > 0.01) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.fade);
    ctx.fillStyle = '#0a0703';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.restore();
  }
}

function announceState() {
  if (!announce) return;
  if (state.scene === 'title') {
    announce.textContent = `HIVE LEDGER. Best floor ${state.bestFloor} of 8. Click to begin.`;
    return;
  }
  if (state.scene === 'reward') {
    announce.textContent = `Floor ${state.floor} cleared. Choose one of ${state.rewardChoices.length} cards, or skip for nectar.`;
    return;
  }
  if (state.scene === 'end') {
    announce.textContent =
      state.outcome === 'win'
        ? 'The hive holds. Press R or click play again.'
        : `The comb is lost on floor ${state.floor}. Press R to restart.`;
    return;
  }
  announce.textContent = `Floor ${state.floor} of 8. Swarm ${state.swarm} of ${state.swarmMax}. Nectar ${state.nectar} of ${state.nectarMax}. Wax ${state.wax}. Combo ${state.combo}. Hand ${state.hand.length} cards.`;
}

let last = 0;
let announced = -1;

function frame(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  if (!state.frozen) {
    advanceEffects(dt);
    state.fade = Math.max(0, state.fade - dt * 3.2);
  }
  paint();
  const stamp = [
    state.scene,
    state.floor,
    state.turn,
    state.swarm,
    state.nectar,
    state.wax,
    state.hand.length,
    state.rewardChoices.length,
  ].join(':');
  if (stamp !== announced) {
    announced = stamp;
    announceState();
  }
  window.requestAnimationFrame(frame);
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

window.addEventListener('resize', () => {
  fit();
  paint();
});

fit();
state.bestFloor = 6;

if (shot) {
  const seed = Number(params.get('seed') || 7) || 7;
  state.fade = 0;
  const staged = stageShot(shot, seed);
  window.__shotName = shot;
  window.__shotState = staged;
  paint();
  window.requestAnimationFrame(() => {
    paint();
    window.requestAnimationFrame(() => {
      announceState();
      window.__shotReady = true;
    });
  });
} else {
  goTitle();
  bindInput(canvas);
  canvas.addEventListener('pointerdown', () => initAudio(), { once: true });
  window.requestAnimationFrame(frame);
}
