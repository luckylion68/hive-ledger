// Omens: the rooms where the comb asks a question and both answers cost something. They exist so the
// run has decisions that are not about the next fight, and so a run can go sideways in a way the
// player chose rather than one the dice chose.
import { state, toast } from './state.js';
import { CARDS } from './cards.js';
import { RELICS, grantRelic, hasRelic } from './relics.js';
import { addCardToDeck } from './deck.js';
import { healSwarm, hurtSwarm } from './hive.js';
import { RULES } from './config.js';

function randomCard(rng) {
  const pick = rng.pick(CARDS);
  return pick ? pick.id : null;
}

function randomRelic(rng) {
  const unowned = RELICS.filter((relic) => !hasRelic(relic.id));
  const pick = rng.pick(unowned);
  return pick ? pick.id : null;
}

function giveCard(rng) {
  const id = randomCard(rng);
  if (!id) return '';
  addCardToDeck(id);
  return `A card joins the ledger.`;
}

export const OMENS = [
  {
    id: 'drifting-comb',
    name: 'A DRIFTING COMB',
    text: 'A slab of comb floats past, still warm, nobody guarding it.',
    options: [
      {
        label: 'EAT WHAT YOU CAN',
        hint: '+10 swarm',
        apply: () => {
          healSwarm(10);
          return 'The comb goes down easy. +10 swarm.';
        },
      },
      {
        label: 'CUT THE WAX OUT',
        hint: '+45 amber',
        apply: () => {
          state.coins += 45;
          return 'You pare it into bricks worth carrying. +45 amber.';
        },
      },
    ],
  },
  {
    id: 'tired-forager',
    name: 'THE TIRED FORAGER',
    text: 'A forager sits against the wall with an empty satchel, too tired to stand.',
    options: [
      {
        label: 'SIT WITH HER',
        hint: 'a relic',
        apply: (rng) => {
          const id = randomRelic(rng);
          if (!id) {
            state.coins += 50;
            return 'She has nothing to give but thanks, and a coin. +50 amber.';
          }
          grantRelic(id);
          return 'She presses something into your hand before you go.';
        },
      },
      {
        label: 'TAKE THE SATCHEL',
        hint: '+65 amber, -8 swarm',
        apply: () => {
          state.coins += 65;
          hurtSwarm(8, { pierce: true });
          return 'She does not fight you. That is worse. +65 amber, -8 swarm.';
        },
      },
    ],
  },
  {
    id: 'cracked-cell',
    name: 'A CRACKED CELL',
    text: 'One wall of the comb has split open. Something inside is still moving.',
    options: [
      {
        label: 'REACH IN',
        hint: 'a new card',
        apply: (rng) => {
          const line = giveCard(rng);
          hurtSwarm(5, { pierce: true });
          return `${line} -5 swarm for the trouble.`;
        },
      },
      {
        label: 'SEAL IT SHUT',
        hint: '+10 max swarm',
        apply: () => {
          state.swarmMax += 10;
          healSwarm(10);
          return 'You pour wax until it holds. +10 max swarm.';
        },
      },
    ],
  },
  {
    id: 'silent-hive',
    name: 'THE SILENT HIVE',
    text: 'A hive with no hum at all. The cells are full and the keepers are not.',
    options: [
      {
        label: 'STRIP IT',
        hint: 'two cards, -10 swarm',
        apply: (rng) => {
          giveCard(rng);
          giveCard(rng);
          hurtSwarm(10, { pierce: true });
          return 'Two cards, and something in the dark notices. -10 swarm.';
        },
      },
      {
        label: 'LEAVE IT ALONE',
        hint: '+14 swarm',
        apply: () => {
          healSwarm(14);
          return 'You take the quiet instead. +14 swarm.';
        },
      },
    ],
  },
  {
    id: 'queens-shadow',
    name: "THE QUEEN'S SHADOW",
    text: 'Her shape crosses the wall. It is not attached to anything.',
    options: [
      {
        label: 'LOOK AT IT',
        hint: '+1 nectar cap',
        apply: () => {
          if (state.nectarMax >= RULES.nectarCap) {
            healSwarm(12);
            return 'The comb is already full. +12 swarm instead.';
          }
          state.nectarMax += 1;
          state.nectar = state.nectarMax;
          return 'You hold its gaze and the room gets bigger. +1 nectar cap.';
        },
      },
      {
        label: 'BOW YOUR HEAD',
        hint: '+8 swarm',
        apply: () => {
          healSwarm(8);
          return 'It passes. +8 swarm.';
        },
      },
    ],
  },
  {
    id: 'wax-in-veins',
    name: 'WAX IN THE VEINS',
    text: 'A pool of wax has gone hard around something that used to be a keeper.',
    options: [
      {
        label: 'TAKE IT INTO YOURS',
        hint: '+14 max swarm, -1 nectar cap',
        apply: () => {
          state.swarmMax += 14;
          healSwarm(14);
          state.nectarMax = Math.max(3, state.nectarMax - 1);
          state.nectar = Math.min(state.nectar, state.nectarMax);
          return 'You are harder to kill and slower to move. +14 max swarm, -1 nectar cap.';
        },
      },
      {
        label: 'BURN IT OFF',
        hint: '+55 amber',
        apply: () => {
          state.coins += 55;
          return 'The wax runs and sets into bricks. +55 amber.';
        },
      },
    ],
  },
  {
    id: 'ledger-of-debts',
    name: 'THE LEDGER OF DEBTS',
    text: 'A ledger lies open on the floor. Your name is already in it.',
    options: [
      {
        label: 'PAY WHAT IT SAYS',
        hint: '-50 amber, a relic',
        apply: (rng) => {
          if (state.coins < 50) {
            hurtSwarm(10, { pierce: true });
            return 'You cannot pay, and it takes the difference. -10 swarm.';
          }
          state.coins -= 50;
          const id = randomRelic(rng);
          if (id) grantRelic(id);
          return 'The line goes clean. Something is handed back to you.';
        },
      },
      {
        label: 'SCRATCH IT OUT',
        hint: 'a card, -12 swarm',
        apply: (rng) => {
          const line = giveCard(rng);
          hurtSwarm(12, { pierce: true });
          return `${line} The debt does not like being crossed out. -12 swarm.`;
        },
      },
    ],
  },
  {
    id: 'last-lantern',
    name: 'THE LAST LANTERN',
    text: 'One lantern still burns at the edge of the comb. It is the only light out here.',
    options: [
      {
        label: 'FEED IT',
        hint: '+22 swarm',
        apply: () => {
          healSwarm(22);
          return 'You sit in the light a while. +22 swarm.';
        },
      },
      {
        label: 'PUT IT OUT',
        hint: '+75 amber, -8 swarm',
        apply: () => {
          state.coins += 75;
          hurtSwarm(8, { pierce: true });
          return 'The dark closes in, but you can carry the oil. +75 amber, -8 swarm.';
        },
      },
    ],
  },
];

export function rollOmen(rng) {
  return rng.pick(OMENS) || OMENS[0];
}

export function takeOmenOption(index) {
  const omen = state.omen;
  if (!omen) return '';
  const option = omen.options[index];
  if (!option) return '';
  const result = option.apply(state.rng);
  toast(option.label);
  state.omen = null;
  return result;
}
