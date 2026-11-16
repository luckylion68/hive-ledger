// The shape of a run between the fights. After every floor the keeper picks what to do before the
// next one: press on light, take the elite raid for a relic, or spend a stop at the market, the camp
// or an omen. The fights themselves stay in battle.js; this file only decides what is on offer.
import { isBossFloor } from './floors.js';
import { ascensionOf } from './ascension.js';

export const NODE_KINDS = {
  hunt: {
    id: 'hunt',
    kind: 'battle',
    name: 'HUNT',
    tag: 'press straight on',
    detail: 'the floor as it comes',
    risk: 'LOW',
    coins: 4,
  },
  raid: {
    id: 'raid',
    kind: 'battle',
    name: 'RAID',
    tag: 'take the elite head-on',
    detail: 'one elite, and a relic for it',
    risk: 'HIGH',
    coins: 14,
  },
  market: {
    id: 'market',
    kind: 'shop',
    name: 'MARKET',
    tag: 'spend amber',
    detail: 'cards, relics, or cut a card',
    risk: 'NONE',
    coins: 0,
  },
  camp: {
    id: 'camp',
    kind: 'camp',
    name: 'CAMP',
    tag: 'one quiet hour',
    detail: 'mend the swarm, or temper a card',
    risk: 'NONE',
    coins: 0,
  },
  omen: {
    id: 'omen',
    kind: 'omen',
    name: 'OMEN',
    tag: 'ask the comb a question',
    detail: 'two answers, one is a price',
    risk: 'ODDS',
    coins: 0,
  },
};

/** How many amber a cleared floor pays before the node bonus, scaled by how hard the sitting is. */
const FLOOR_COINS = [0, 6, 8, 20, 10, 12, 24, 14, 30];

export function floorCoins(floor, ascension) {
  const base = FLOOR_COINS[Math.min(FLOOR_COINS.length - 1, Math.max(0, floor))] || 0;
  return Math.round(base * (ascensionOf(ascension).coinPay || 1));
}

/**
 * The three doors on offer before the next floor. A boss floor narrows the choice to preparation,
 * because you cannot skip a boss and you cannot make it an elite: what is left is whether you go in
 * rested or better armed.
 */
export function rollPath(nextFloor, rng) {
  if (isBossFloor(nextFloor)) {
    return [NODE_KINDS.camp, NODE_KINDS.market, NODE_KINDS.omen];
  }
  const others = [NODE_KINDS.raid, NODE_KINDS.market, NODE_KINDS.camp, NODE_KINDS.omen];
  const picked = [];
  const pool = others.slice();
  while (picked.length < 2 && pool.length) {
    const index = rng.int(0, pool.length - 1);
    picked.push(pool.splice(index, 1)[0]);
  }
  return [NODE_KINDS.hunt, ...picked];
}

export function nodeById(id) {
  return NODE_KINDS[id] || NODE_KINDS.hunt;
}

/** The line the run summary prints: every door taken, in order. */
export function pathTrace(nodes) {
  return nodes.map((id) => nodeById(id).name).join(' · ');
}

export const BOSS_NAMES = {
  3: 'THE HORNET GENERAL',
  6: 'THE WAX WARDEN',
  8: 'THE BUMBLE QUEEN',
};

export function bossNameOf(floor) {
  return BOSS_NAMES[floor] || '';
}
