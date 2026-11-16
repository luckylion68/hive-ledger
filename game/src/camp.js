// One quiet hour before the next floor. The camp asks the same question the whole game asks: do you
// take the safe thing now, or spend it on something that only pays off later.
import { state, toast } from './state.js';
import { healSwarm } from './hive.js';
import { RULES } from './config.js';
import { defineCard } from './cards.js';
import { playSound } from './audio.js';

export const CAMP_MEND = 16;

/** Three cards from the deck that can still be tempered, drawn without repeats. */
export function temperChoices() {
  const upgradable = state.deck.filter((card) => !card.plus);
  if (!upgradable.length) return [];
  const seen = new Set();
  const out = [];
  const pool = upgradable.slice();
  // deterministic-ish spread so the same deck does not always offer the same three
  for (let i = 0; i < pool.length && out.length < 3; i += 1) {
    const card = pool[(i * 3 + state.floor) % pool.length];
    if (!card || seen.has(card.uid)) continue;
    seen.add(card.uid);
    out.push(card);
  }
  return out;
}

export function mendSwarm() {
  healSwarm(CAMP_MEND);
  toast(`+${CAMP_MEND} swarm`);
  playSound('take');
  return true;
}

export function temperCard(card) {
  if (!card || card.plus) return false;
  card.plus = true;
  card.name = `${card.name}+`;
  toast(`${card.name} tempered`);
  playSound('combo');
  return true;
}

export function feedComb() {
  if (state.nectarMax >= RULES.nectarCap) {
    healSwarm(CAMP_MEND);
    toast('Comb is full: +16 swarm');
    playSound('take');
    return true;
  }
  state.nectarMax += 1;
  state.nectar = state.nectarMax;
  toast('Nectar cap +1');
  playSound('take');
  return true;
}

/** Built fresh each time so a preview card never aliases the one in the deck. */
export function previewCard(card) {
  const copy = defineCard(card.id);
  copy.name = `${card.name}+`;
  copy.plus = true;
  return copy;
}
