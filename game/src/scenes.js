// The scene machine: title, battle, reward, path, shop, camp, omen, end. It owns what a cleared floor
// pays and every door the keeper gets to pick, which is where the run's choices actually live.
import { RULES } from './config.js';
import { state, bumpStat, toast } from './state.js';
import { startBattle, startRun } from './battle.js';
import { addCardToDeck } from './deck.js';
import { CARDS_BY_ID } from './cards.js';
import { RELICS, grantRelic, hasRelic } from './relics.js';
import { floorPaysRelic, floorPaysCard, isLastFloor, floorTitle, isBossFloor } from './floors.js';
import { playSound } from './audio.js';
import { healSwarm } from './hive.js';
import { ascensionOf } from './ascension.js';
import { rollPath, floorCoins, bossNameOf } from './run.js';
import { rollShop, buySlot } from './shop.js';
import { temperChoices, mendSwarm, temperCard, feedComb } from './camp.js';
import { rollOmen, takeOmenOption } from './omens.js';

const RARITY_ORDER = ['common', 'rare', 'epic'];

export function goTitle() {
  state.scene = 'title';
  state.phase = 'idle';
  state.outcome = null;
}

export function beginRun(seed, ascension = 0) {
  state.ascension = ascension;
  state.bestFloor = Math.max(state.bestFloor, 1);
  startRun(seed, ['wax-ladle', 'iron-comb'], ascension);
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
  healSwarm(4);
  state.coins += floorCoins(state.floor, state.ascension);
  // the road promised a relic for the elite, so the elite pays one whether or not the floor would
  if (floorPaysRelic(state.floor) || state.nextFloorElite) offerRelic();
  if (state.nextFloorElite) {
    bumpStat('elitesFelled', 1);
    state.nextFloorElite = false;
  }
  if (isLastFloor(state.floor)) {
    state.outcome = 'win';
    state.scene = 'end';
    state.phase = 'over';
    playSound('win');
    return;
  }
  if (floorPaysCard(state.floor)) {
    openReward();
  } else {
    openPath();
  }
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
  openPath();
}

/** The fork: three doors, and the only place the keeper decides what the next floor is worth. */
export function openPath() {
  const next = state.floor + 1;
  state.pathOptions = rollPath(next, state.rng);
  state.pathPicked = -1;
  state.bossBanner = isBossFloor(next) ? bossNameOf(next) : '';
  state.scene = 'path';
  state.phase = 'path';
  playSound('reward');
}

export function choosePath(index) {
  if (state.scene !== 'path') return false;
  const node = state.pathOptions[index];
  if (!node) return false;
  state.pathPicked = index;
  state.nodeLog.push(node.id);
  state.coins += node.coins || 0;
  playSound('click');
  const next = state.floor + 1;
  if (node.kind === 'battle') {
    startBattle(next, { elite: node.id === 'raid' });
    return true;
  }
  if (node.kind === 'shop') {
    state.shopStock = rollShop(state.rng, state.ascension);
    state.shopHover = -1;
    state.scene = 'shop';
    state.phase = 'shop';
    return true;
  }
  if (node.kind === 'camp') {
    state.campChoices = temperChoices();
    state.campDone = false;
    state.campHover = -1;
    state.scene = 'camp';
    state.phase = 'camp';
    return true;
  }
  if (node.kind === 'omen') {
    state.omen = rollOmen(state.rng);
    state.omenResult = '';
    state.omenHover = -1;
    state.scene = 'omen';
    state.phase = 'omen';
    return true;
  }
  return false;
}

/** Out of a side room and into the next floor's fight. */
export function leaveNode() {
  const next = state.floor + 1;
  startBattle(next, {});
  playSound('start');
}

export function buyShopSlot(index) {
  if (state.scene !== 'shop') return false;
  return buySlot(index);
}

export function takeCampMend() {
  if (state.scene !== 'camp' || state.campDone) return false;
  mendSwarm();
  state.campDone = true;
  return true;
}

export function takeCampTemper(index) {
  if (state.scene !== 'camp' || state.campDone) return false;
  const card = state.campChoices[index];
  if (!card) return false;
  temperCard(card);
  state.campDone = true;
  return true;
}

export function takeCampFeed() {
  if (state.scene !== 'camp' || state.campDone) return false;
  feedComb();
  state.campDone = true;
  return true;
}

export function answerOmen(index) {
  if (state.scene !== 'omen' || state.omenResult) return false;
  const result = takeOmenOption(index);
  state.omenResult = result;
  bumpStat('omensTaken', 1);
  playSound('take');
  return true;
}

export function onDefeat() {
  state.outcome = 'lose';
  state.scene = 'end';
  state.phase = 'over';
  state.bestFloor = Math.max(state.bestFloor, Math.max(0, state.floor - 1));
}

export function restartRun(seed) {
  state.outcome = null;
  const asc = ascensionOf(state.ascension);
  state.nectarMax = RULES.startNectar;
  state.swarmMax = RULES.startSwarm + asc.startSwarm;
  state.swarm = state.swarmMax;
  state.poison = 0;
  beginRun(seed, state.ascension);
}

export function sceneIs(name) {
  return state.scene === name;
}

export function rewardCards() {
  return state.rewardChoices.map((id) => CARDS_BY_ID[id]);
}
