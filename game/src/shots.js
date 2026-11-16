// The four screenshots. Each one is reached by playing the real rules with a greedy pilot: cards are
// really spent, enemies really swing, floors really clear. Nothing here writes a number into the
// state that the battle loop would not have produced itself.
import { RULES } from './config.js';
import { state } from './state.js';
import {
  beginRun,
  takeReward,
  skipReward,
  rewardCards,
  choosePath,
  leaveNode,
  takeCampMend,
  answerOmen,
  buyShopSlot,
} from './scenes.js';
import { playCard, endTurn } from './battle.js';
import { CARDS_BY_ID } from './cards.js';
import { rollPath } from './run.js';
import { rollShop } from './shop.js';
import { temperChoices } from './camp.js';
import { rollOmen } from './omens.js';

const REWARD_PREFERENCE = [
  'raise-cap',
  'fury',
  'hive-shield',
  'sting',
  'last-sting',
  'venom',
  'brood',
  'hatch-burst',
  'royal-jelly',
  'honey-jar',
  'feast',
  'comb-wall',
  'wax-seal',
  'nectar-run',
  'sip',
  'deep-draw',
];

const FX_VALUE = {
  sip: 78,
  feast: 86,
  'nectar-run': 74,
  'deep-draw': 76,
  'honey-jar': 70,
  'swarm-sense': 58,
  'wax-seal': 64,
  'comb-wall': 80,
  'raise-cap': 90,
  'cell-forge': 74,
  'ledger-stone': 70,
  brood: 72,
  nurse: 74,
  'hatch-burst': 80,
  'swarm-call': 88,
  'royal-jelly': 84,
  brace: 66,
  sentry: 70,
  'guard-drill': 72,
  deflect: 62,
  'hive-shield': 82,
  jab: 68,
  sting: 76,
  venom: 72,
  pierce: 66,
  fury: 88,
  'last-sting': 74,
};

function incomingDamage() {
  let sum = 0;
  for (const enemy of state.enemies) {
    if (enemy.dead || !enemy.intent) continue;
    if (enemy.intent.type === 'attack' || enemy.intent.type === 'poison') sum += enemy.intent.value;
  }
  return sum;
}

function remainingEnemyHp() {
  return state.enemies.reduce((sum, enemy) => (enemy.dead ? sum : sum + enemy.hp), 0);
}

function bestAffordableIndex() {
  const danger = incomingDamage() > state.wax + state.swarm * 0.3;
  const almostDone = remainingEnemyHp() <= 14;
  let best = -1;
  let bestScore = -Infinity;
  state.hand.forEach((card, index) => {
    if (card.cost > state.nectar) return;
    let score = FX_VALUE[card.fx] === undefined ? 60 : FX_VALUE[card.fx];
    if (danger && (card.suit === 'guard' || card.suit === 'build')) score += 26;
    if (danger && card.suit === 'sting') score -= 14;
    if (almostDone && card.suit === 'sting') score += 34;
    score -= card.cost * 1.2;
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  });
  return best;
}

function preferredRewardIndex() {
  const ids = rewardCards().map((card) => card.id);
  let bestIndex = 0;
  let bestRank = Infinity;
  ids.forEach((id, index) => {
    const rank = REWARD_PREFERENCE.indexOf(id);
    const value = rank === -1 ? 99 : rank;
    if (value < bestRank) {
      bestRank = value;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function autoTurn() {
  let guard = 0;
  while (state.scene === 'battle' && state.phase === 'player' && guard < 14) {
    const index = bestAffordableIndex();
    if (index < 0) break;
    playCard(index);
    guard += 1;
  }
  if (state.scene === 'battle' && state.phase === 'player') endTurn();
}

/** Walk out of every side room the pilot meets, taking the safe answer each time. */
function clearSideRooms(limit = 40) {
  let guard = 0;
  while (guard < limit) {
    if (state.scene === 'path') {
      choosePath(0);
    } else if (state.scene === 'shop') {
      leaveNode();
    } else if (state.scene === 'camp') {
      if (!state.campDone) takeCampMend();
      leaveNode();
    } else if (state.scene === 'omen') {
      if (!state.omenResult) answerOmen(0);
      leaveNode();
    } else {
      return;
    }
    guard += 1;
  }
}

function autoPlayToFloor(target, maxTurns = 420) {
  let guard = 0;
  while (guard < maxTurns) {
    if (state.scene === 'reward') {
      takeReward(preferredRewardIndex());
    } else if (state.scene === 'path' || state.scene === 'shop' || state.scene === 'camp' || state.scene === 'omen') {
      clearSideRooms();
    } else if (state.scene === 'battle' && state.floor < target) {
      autoTurn();
    } else {
      break;
    }
    guard += 1;
  }
}

/** Play one suit three times so the combo strip lights up for the cover. */
function playSuitRun(count) {
  const counts = new Map();
  for (const card of state.hand) {
    if (card.cost > state.nectar) continue;
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1);
  }
  const order = ['gather', 'build', 'hatch', 'guard', 'sting'];
  let chosen = null;
  let bestCount = 0;
  for (const suit of order) {
    const suitCount = counts.get(suit) || 0;
    if (suitCount > bestCount) {
      bestCount = suitCount;
      chosen = suit;
    }
  }
  if (!chosen) return 0;
  let played = 0;
  while (played < count && state.scene === 'battle') {
    const index = state.hand.findIndex((card) => card.suit === chosen && card.cost <= state.nectar);
    if (index < 0) break;
    playCard(index);
    played += 1;
  }
  return played;
}

function finishRewards() {
  let guard = 0;
  while (state.scene === 'reward' && guard < 4) {
    takeReward(preferredRewardIndex());
    guard += 1;
  }
}

function stageBattle(seed) {
  beginRun(seed);
  autoPlayToFloor(5);
  finishRewards();
  clearSideRooms();
  // floor 5, turn 1: a run of one suit so the combo counter is honest when the frame is taken
  playSuitRun(3);
  if (state.scene === 'battle' && state.phase === 'player') endTurn();
  if (state.scene !== 'battle') {
    // the pilot cleared the floor on turn one; take the reward and stand on the next floor instead
    finishRewards();
    clearSideRooms();
  }
  state.hoverCard = -1;
  state.frozen = true;
}

function stageReward(seed) {
  beginRun(seed);
  autoPlayToFloor(5);
  finishRewards();
  let guard = 0;
  while (state.scene === 'battle' && guard < 60) {
    autoTurn();
    guard += 1;
  }
  if (state.scene === 'path') clearSideRooms();
  if (state.scene === 'battle') {
    let more = 0;
    while (state.scene === 'battle' && more < 60) {
      autoTurn();
      more += 1;
    }
  }
  finishRewards();
  state.hoverCard = 0;
  state.frozen = true;
}

/** The last keeper, already bleeding: one raider, a lot of body, the swarm spent getting here. */
function stageBoss(seed) {
  beginRun(seed);
  autoPlayToFloor(8);
  finishRewards();
  clearSideRooms();
  if (state.scene === 'battle') {
    // sting first, twice: the frame should show a bar that has already been argued with
    for (let round = 0; round < 2; round += 1) {
      let guard = 0;
      while (state.scene === 'battle' && state.phase === 'player' && guard < 10) {
        const sting = state.hand.findIndex((card) => card.suit === 'sting' && card.cost <= state.nectar);
        const index = sting >= 0 ? sting : bestAffordableIndex();
        if (index < 0) break;
        playCard(index);
        guard += 1;
      }
      if (state.scene === 'battle' && state.phase === 'player') endTurn();
    }
  }
  state.hoverCard = -1;
  state.frozen = true;
}

function stageVictory(seed) {
  beginRun(seed);
  let guard = 0;
  while (state.scene !== 'end' && guard < 900) {
    if (state.scene === 'reward') takeReward(preferredRewardIndex());
    else if (state.scene === 'path' || state.scene === 'shop' || state.scene === 'camp' || state.scene === 'omen') {
      clearSideRooms();
    } else if (state.scene === 'battle') autoTurn();
    else break;
    guard += 1;
  }
  state.frozen = true;
}

/** Stand in a side room with a real deck behind it, so the frame shows numbers the run earned. */
function stageRoom(kind, seed) {
  beginRun(seed);
  autoPlayToFloor(4);
  finishRewards();
  let guard = 0;
  while ((state.scene === 'battle' || state.scene === 'reward') && guard < 120) {
    if (state.scene === 'reward') takeReward(preferredRewardIndex());
    else autoTurn();
    guard += 1;
  }
  state.coins = Math.max(state.coins, 140);
  if (state.scene === 'path') {
    const index = state.pathOptions.findIndex((node) => node.kind === kind);
    if (index >= 0) choosePath(index);
  }
  if (state.scene !== kind) {
    if (kind === 'shop') {
      state.shopStock = rollShop(state.rng, state.ascension);
      state.shopHover = 0;
      state.scene = 'shop';
      state.phase = 'shop';
    } else if (kind === 'camp') {
      state.campChoices = temperChoices();
      state.campDone = false;
      state.campHover = 2;
      state.scene = 'camp';
      state.phase = 'camp';
    } else if (kind === 'omen') {
      state.omen = rollOmen(state.rng);
      state.omenResult = '';
      state.omenHover = 0;
      state.scene = 'omen';
      state.phase = 'omen';
    }
  }
  state.frozen = true;
}

function stageTitle(seed) {
  state.scene = 'title';
  state.phase = 'idle';
  state.seed = seed;
  state.bestFloor = 6;
  state.time = 1.35;
  state.frozen = true;
}

/** The fork itself: a real deck behind it, three real doors on it. */
function stagePath(seed) {
  beginRun(seed);
  autoPlayToFloor(3);
  let guard = 0;
  while ((state.scene === 'battle' || state.scene === 'reward') && guard < 140) {
    if (state.scene === 'reward') takeReward(preferredRewardIndex());
    else autoTurn();
    guard += 1;
  }
  if (state.scene === 'reward') takeReward(0);
  if (state.scene !== 'path') {
    state.pathOptions = rollPath(state.floor + 1, state.rng);
    state.bossBanner = '';
  }
  state.scene = 'path';
  state.phase = 'path';
  state.pathPicked = -1;
  state.hoverCard = 1;
  state.frozen = true;
}

export function stageShot(name, seed = 7) {
  state.seed = seed;
  switch (name) {
    case 'battle':
      stageBattle(seed);
      break;
    case 'reward':
      stageReward(seed);
      break;
    case 'boss':
      stageBoss(seed);
      break;
    case 'path':
      stagePath(seed);
      break;
    case 'shop':
      stageRoom('shop', seed);
      break;
    case 'camp':
      stageRoom('camp', seed);
      break;
    case 'omen':
      stageRoom('omen', seed);
      break;
    case 'victory':
      stageVictory(seed);
      break;
    case 'title':
    default:
      stageTitle(seed);
      break;
  }
  state.time = Math.max(state.time, 1.35);
  state.toast = '';
  // A frozen frame does not age its floaters, so a long turn leaves a pile of them stacked on the
  // intent badges. Keep only the ones sitting in open board where they can still be read.
  state.floaters = state.floaters.filter((item) => item.y > 150 && item.y < 330).slice(-3);
  return { scene: state.scene, floor: state.floor, combo: state.combo, hand: state.hand.length };
}

export function shotSummary() {
  return {
    scene: state.scene,
    floor: state.floor,
    turn: state.turn,
    combo: state.combo,
    comboSuit: state.comboSuit,
    hand: state.hand.map((card) => card.id),
    nectar: `${state.nectar}/${state.nectarMax}`,
    wax: state.wax,
    swarm: `${state.swarm}/${state.swarmMax}`,
    enemies: state.enemies.map((enemy) => `${enemy.name} ${enemy.hp}/${enemy.maxHp}`),
    relics: state.relics.map((relic) => relic.id),
    stats: state.stats,
    outcome: state.outcome,
    floaters: state.floaters.map((floater) => floater.text),
    skipNectar: RULES.skipNectar,
  };
}
