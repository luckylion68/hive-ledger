// The scene machine: title, battle, reward, end. It also owns what a cleared floor pays, which is
// the one place in the run where the player really chooses.
import { RULES } from './config.js';
import { state, bumpStat, toast } from './state.js';
import { startBattle, startRun } from './battle.js';
import { addCardToDeck } from './deck.js';
import { CARDS_BY_ID } from './cards.js';
import { RELICS, grantRelic, hasRelic } from './relics.js';
import { floorPaysRelic, isLastFloor, floorTitle } from './floors.js';
import { playSound } from './audio.js';

const RARITY_ORDER = ['common', 'rare', 'epic'];

export function goTitle() {
  state.scene = 'title';
  state.phase = 'idle';
  state.outcome = null;
}

export function beginRun(seed) {
  state.bestFloor = Math.max(state.bestFloor, 1);
  startRun(seed, ['wax-ladle', 'iron-comb']);
  state.scene = 'battle';
  playSound('start');
}

function pickRewardCards() {
  const slots = [];
  const pool = Object.values(CARDS_BY_ID);
  for (const rarity of RARITY_ORDER) {
    const candidates = pool.filter((card) => card.rarity === rarity);
    if (!candidates.length) continue;
    const chosen = state.rng.pick(candidates);
    if (chosen) slots.push(chosen.id);
  }
  while (slots.length < RULES.rewardChoices) {
    const extra = state.rng.pick(pool);
    if (extra) slots.push(extra.id);
  }
  return slots.slice(0, RULES.rewardChoices);
}

function offerRelic() {
  const unowned = RELICS.filter((relic) => !hasRelic(relic.id));
  if (!unowned.length || state.relics.length >= RULES.relicSlots) return null;
  const pick = state.rng.pick(unowned);
  return pick ? grantRelic(pick.id) : null;
}

export function onFloorCleared() {
  bumpStat('floorsCleared', 1);
  state.bestFloor = Math.max(state.bestFloor, state.floor);
  if (floorPaysRelic(state.floor)) offerRelic();
  if (isLastFloor(state.floor)) {
    state.outcome = 'win';
    state.scene = 'end';
    state.phase = 'over';
    playSound('win');
    return;
  }
  openReward();
}

export function openReward() {
  state.scene = 'reward';
  state.phase = 'reward';
  state.rewardChoices = pickRewardCards();
  state.rewardSource = floorTitle(state.floor);
  playSound('reward');
}

export function takeReward(index) {
  if (state.scene !== 'reward') return false;
  const id = state.rewardChoices[index];
  if (!id) return false;
  addCardToDeck(id);
  toast(`${CARDS_BY_ID[id].name} added`);
  playSound('take');
  advanceAfterReward();
  return true;
}

export function skipReward() {
  if (state.scene !== 'reward') return false;
  state.nectar = Math.min(state.nectarMax + 4, state.nectar + RULES.skipNectar);
  bumpStat('nectarGathered', RULES.skipNectar);
  toast(`+${RULES.skipNectar} nectar`);
  playSound('take');
  advanceAfterReward();
  return true;
}

function advanceAfterReward() {
  state.rewardChoices = [];
  startBattle(state.floor + 1);
  playSound('start');
}

export function onDefeat() {
  state.outcome = 'lose';
  state.scene = 'end';
  state.phase = 'over';
  state.bestFloor = Math.max(state.bestFloor, Math.max(0, state.floor - 1));
}

export function restartRun(seed) {
  state.outcome = null;
  state.nectarMax = RULES.startNectar;
  state.swarm = RULES.startSwarm;
  state.swarmMax = RULES.startSwarm;
  state.poison = 0;
  beginRun(seed);
}

export function sceneIs(name) {
  return state.scene === name;
}

export function rewardCards() {
  return state.rewardChoices.map((id) => CARDS_BY_ID[id]);
}
