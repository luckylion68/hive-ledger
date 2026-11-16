// The market between floors. Amber is the only thing you cannot grow back, so every purchase is a
// real trade: a card you will draw forever, a relic that changes a rule, or swarm you get to keep.
import { state, toast, bumpStat } from './state.js';
import { CARDS_BY_ID } from './cards.js';
import { RELICS, grantRelic, hasRelic } from './relics.js';
import { addCardToDeck } from './deck.js';
import { ascensionOf } from './ascension.js';
import { healSwarm } from './hive.js';
import { playSound } from './audio.js';

const CARD_PRICE = { common: 34, rare: 48, epic: 64 };
const RELIC_PRICE = 84;
const MEND_PRICE = 40;
const MEND_AMOUNT = 14;

function markup(ascension) {
  return ascensionOf(ascension).coinPay || 1;
}

/**
 * Five slots: three cards from the whole ledger, one relic, and a poultice. Cards and the relic are
 * drawn without replacement so a market never shows the same thing twice.
 */
export function rollShop(rng, ascension) {
  const scale = markup(ascension);
  const cardPool = rng.shuffle(Object.values(CARDS_BY_ID));
  const slots = [];
  for (const card of cardPool.slice(0, 3)) {
    slots.push({
      type: 'card',
      id: card.id,
      name: card.name,
      price: Math.round((CARD_PRICE[card.rarity] || 40) * scale),
      sold: false,
    });
  }
  const relicPool = rng.shuffle(RELICS.filter((relic) => !hasRelic(relic.id)));
  if (relicPool.length) {
    const relic = relicPool[0];
    slots.push({
      type: 'relic',
      id: relic.id,
      name: relic.name,
      price: Math.round(RELIC_PRICE * scale),
      sold: false,
    });
  }
  slots.push({
    type: 'mend',
    id: 'mend',
    name: 'POULTICE',
    price: Math.round(MEND_PRICE * scale),
    sold: false,
  });
  return slots;
}

export function canAfford(slot) {
  return Boolean(slot) && !slot.sold && state.coins >= slot.price;
}

export function buySlot(index) {
  const slot = state.shopStock[index];
  if (!slot || slot.sold) return false;
  if (state.coins < slot.price) {
    toast('Not enough amber');
    playSound('deny');
    return false;
  }
  state.coins -= slot.price;
  slot.sold = true;
  bumpStat('purchases', 1);
  if (slot.type === 'card') {
    addCardToDeck(slot.id);
    toast(`${slot.name} added`);
  } else if (slot.type === 'relic') {
    grantRelic(slot.id);
    toast(`${slot.name} taken`);
  } else {
    healSwarm(MEND_AMOUNT);
    toast(`+${MEND_AMOUNT} swarm`);
  }
  playSound('take');
  return true;
}

export function shopSoldOut() {
  return state.shopStock.every((slot) => slot.sold);
}
