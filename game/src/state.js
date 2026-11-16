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
    purchases: 0,
    omensTaken: 0,
    elitesFelled: 0,
  },
  // the run's shape, outside the fight: which sitting, which door, what it cost to open it
  ascension: 0,
  act: 1,
  coins: 0,
  pathOptions: [],
  pathPicked: -1,
  nodeLog: [],
  shopStock: [],
  shopHover: -1,
  omen: null,
  omenResult: '',
  omenHover: -1,
  campChoices: [],
  campHover: -1,
  campPicked: -1,
  campDone: false,
  nextFloorElite: false,
  bossBanner: '',
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
  // Two things can land on the player in one breath, and both want to be read. Stack a new number
  // above the young one it would otherwise sit on, so the pair reads as a tally rather than a smear.
  let top = y;
  for (let guard = 0; guard < 5; guard += 1) {
    const clash = state.floaters.some(
      (item) => item.age < 0.4 && Math.abs(item.x - x) < 46 && Math.abs(item.y - top) < 24
    );
    if (!clash) break;
    top -= 24;
  }
  state.floaters.push({ text, x, y: top, color, size, age: 0, life: 1.05, drift: -0.6 + Math.random() * 1.2 });
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
    purchases: 0,
    omensTaken: 0,
    elitesFelled: 0,
  };
  state.coins = 0;
  state.act = 1;
  state.pathOptions = [];
  state.pathPicked = -1;
  state.nodeLog = [];
  state.shopStock = [];
  state.shopHover = -1;
  state.omen = null;
  state.omenResult = '';
  state.omenHover = -1;
  state.campChoices = [];
  state.campHover = -1;
  state.campPicked = -1;
  state.campDone = false;
  state.nextFloorElite = false;
  state.bossBanner = '';
  state.uid = 1;
  void VIEW;
}
