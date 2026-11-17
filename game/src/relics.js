// Eight relics, each a small permanent rule change. They hook the same four moments every fight
// has (fight starts, turn starts, a card resolves, the turn ends) so no relic needs its own code
// path inside the battle loop.
import { RULES } from './config.js';
import { gainNectar, gainWax, spawnBees, healSwarm, boostBees } from './hive.js';
import { state, toast } from './state.js';

export const RELICS = [
  {
    id: 'honey-spoon',
    name: 'HONEY SPOON',
    glyph: 'spoon',
    text: 'Your first GATHER card each turn gives +1 nectar.',
  },
  {
    id: 'broken-wing',
    name: 'BROKEN WING',
    glyph: 'wing',
    text: 'STING cards deal +3. You lose 1 swarm each turn.',
  },
  {
    id: 'wax-ladle',
    name: 'WAX LADLE',
    glyph: 'ladle',
    text: 'Every fight starts with 8 wax.',
  },
  {
    id: 'queen-scent',
    name: 'QUEEN SCENT',
    glyph: 'scent',
    text: 'Every fight starts with 1 bee in the air.',
  },
  {
    id: 'iron-comb',
    name: 'IRON COMB',
    glyph: 'iron',
    text: 'You keep 8 wax when your turn begins.',
  },
  {
    id: 'drone-horn',
    name: 'DRONE HORN',
    glyph: 'horn',
    text: 'Your bees hit for 2 more.',
  },
  {
    id: 'amber-lens',
    name: 'AMBER LENS',
    glyph: 'lens',
    text: 'Draw 1 extra card every turn.',
  },
  {
    id: 'ledger-stone',
    name: 'LEDGER STONE',
    glyph: 'stone',
    text: 'Gain +1 nectar max and heal 4 swarm.',
  },
  {
    id: 'comb-cistern',
    name: 'COMB CISTERN',
    glyph: 'ladle',
    text: 'Every fight starts with 6 nectar.',
  },
  {
    id: 'night-pollen',
    name: 'NIGHT POLLEN',
    glyph: 'scent',
    text: 'Every fight starts with 2 bees in the air.',
  },
  {
    id: 'wax-echo',
    name: 'WAX ECHO',
    glyph: 'spoon',
    text: 'Every turn starts with 4 wax.',
  },
  {
    id: 'nectar-veil',
    name: 'NECTAR VEIL',
    glyph: 'wing',
    text: 'Heal 2 swarm at the end of every turn.',
  },
  {
    id: 'long-wick',
    name: 'LONG WICK',
    glyph: 'lens',
    text: 'Gain 2 wax at the end of every turn.',
  },
  {
    id: 'forager-drum',
    name: 'FORAGER DRUM',
    glyph: 'horn',
    text: 'Your first GATHER card each fight gives +2 nectar.',
  },
];

export const RELICS_BY_ID = RELICS.reduce((map, relic) => {
  map[relic.id] = relic;
  return map;
}, {});

export function hasRelic(id) {
  return state.relics.some((relic) => relic.id === id);
}

export function grantRelic(id) {
  const relic = RELICS_BY_ID[id];
  if (!relic || hasRelic(id)) return null;
  if (state.relics.length >= RULES.relicSlots) return null;
  state.relics.push(relic);
  if (id === 'ledger-stone') {
    state.nectarMax += 1;
    healSwarm(4);
  }
  toast(`${relic.name} taken`);
  return relic;
}

export function relicDrawBonus() {
  return hasRelic('amber-lens') ? 1 : 0;
}

export function relicDamageBonus(suit) {
  if (suit === 'sting' && hasRelic('broken-wing')) return 3;
  return 0;
}

export function relicOnCombatStart() {
  state.relicFlags = { gather: false, drum: false, turnEnd: false };
  if (hasRelic('wax-ladle')) gainWax(8);
  if (hasRelic('queen-scent')) spawnBees(1);
  if (hasRelic('comb-cistern')) gainNectar(6);
  if (hasRelic('night-pollen')) spawnBees(2);
  if (hasRelic('drone-horn')) {
    state.beePower += 2;
    boostBees(0);
  }
}

export function relicOnTurnStart() {
  state.relicFlags = state.relicFlags || { gather: false, turnEnd: false };
  state.relicFlags.gather = false;
  if (hasRelic('iron-comb')) gainWax(8);
  if (hasRelic('wax-echo')) gainWax(4);
}

export function relicOnCardPlayed(card) {
  if (!card) return;
  if (card.suit === 'gather' && hasRelic('honey-spoon') && !state.relicFlags.gather) {
    state.relicFlags.gather = true;
    gainNectar(1, true);
  }
  if (card.suit === 'gather' && hasRelic('forager-drum') && !state.relicFlags.drum) {
    state.relicFlags.drum = true;
    gainNectar(2, true);
  }
}

export function relicOnTurnEnd() {
  if (hasRelic('broken-wing')) {
    state.swarm = Math.max(1, state.swarm - 1);
  }
  if (hasRelic('nectar-veil')) healSwarm(2);
  if (hasRelic('long-wick')) gainWax(2);
}

export function relicIds() {
  return state.relics.map((relic) => relic.id);
}
