// The single mutable run. Modules read and write this object instead of passing a context around,
// which keeps the battle rules short; every field here is part of what the HUD draws.
import { RULES, VIEW } from './config.js';

export const state = {
  scene: 'title',
  phase: 'idle',
  seed: 7,
  rng: null,
  floor: 1,
  nectar: RULES.startNectar,
  nectarMax: RULES.startNectar,
  swarm: RULES.startSwarm,
  swarmMax: RULES.startSwarm,
  wax: 0,
  bees: 0,
  beePower: RULES.beePower,
  poison: 0,
  combo: 0,
  comboSuit: null,
  comboPulse: 0,
  turnsThisFloor: 1,
  turn: 1,
  relics: [],
  deck: [],
  drawPile: [],
  discardPile: [],
  hand: [],
  enemies: [],
  target: 0,
  rewardChoices: [],
  rewardSource: '#000000',
  outcome: null,
  stats: {
    nectarGathered: 0,
    cardsPlayed: 0,
    enemiesFelled: 0,
    turns: 0,
    bestCombo: 0,
    floorsCleared: 0,
    damageTaken: 0,
    waxBuilt: 0,
  },
  floaters: [],
  shake: 0,
  time: 0,
  hoverCard: -1,
  hoverRelic: -1,
  hoverEnd: false,
  hoverSkip: false,
  hoverPlayAgain: false,
  hoverEnemy: -1,
  muted: false,
  frozen: false,
  fade: 1,
  toast: '',
  toastAge: 0,
  bestFloor: 6,
  lastPlayed: null,
  buzz: 0,
  uid: 1,
};

export function nextUid() {
  state.uid += 1;
  return state.uid;
}

export function bumpStat(key, amount = 1) {
  state.stats[key] = (state.stats[key] || 0) + amount;
}

export function addFloater(text, x, y, color, size = 26) {
  state.floaters.push({ text, x, y, color, size, age: 0, life: 1.05, drift: -0.6 + Math.random() * 1.2 });
  if (state.floaters.length > 14) state.floaters.shift();
}

export function addShake(power) {
  state.shake = Math.min(14, state.shake + power);
}

export function toast(text) {
  state.toast = text;
  state.toastAge = 0;
}

export function advanceEffects(dt) {
  for (const floater of state.floaters) floater.age += dt;
  state.floaters = state.floaters.filter((floater) => floater.age < floater.life);
  state.shake *= Math.pow(0.0025, dt);
  if (state.shake < 0.12) state.shake = 0;
  state.comboPulse = Math.max(0, state.comboPulse - dt * 2.2);
  state.buzz = Math.max(0, state.buzz - dt * 1.5);
  if (state.toast) {
    state.toastAge += dt;
    if (state.toastAge > 2.4) state.toast = '';
  }
  state.time += dt;
}

export function resetRun(seed) {
  state.scene = 'battle';
  state.phase = 'player';
  state.seed = seed;
  state.floor = 1;
  state.nectarMax = RULES.startNectar;
  state.nectar = RULES.startNectar;
  state.swarmMax = RULES.startSwarm;
  state.swarm = RULES.startSwarm;
  state.wax = 0;
  state.bees = 0;
  state.beePower = RULES.beePower;
  state.poison = 0;
  state.combo = 0;
  state.comboSuit = null;
  state.turn = 1;
  state.turnsThisFloor = 1;
  state.relics = [];
  state.deck = [];
  state.drawPile = [];
  state.discardPile = [];
  state.hand = [];
  state.enemies = [];
  state.rewardChoices = [];
  state.outcome = null;
  state.floaters = [];
  state.shake = 0;
  state.lastPlayed = null;
  state.toast = '';
  state.stats = {
    nectarGathered: 0,
    cardsPlayed: 0,
    enemiesFelled: 0,
    turns: 0,
    bestCombo: 0,
    floorsCleared: 0,
    damageTaken: 0,
    waxBuilt: 0,
  };
  state.uid = 1;
  void VIEW;
}
