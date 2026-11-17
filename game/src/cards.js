// Every card in the hive's ledger. A card is data only: suit, cost, rarity, two rule lines and an
// effect key that card-effects.js resolves, so adding content never means touching the battle loop.
export const CARDS = [
  // ---- GATHER: nectar and cards, the engine of every turn.
  { id: 'sip', name: 'SIP', suit: 'gather', cost: 1, rarity: 'common', art: 'drop', text: ['Gain 2 nectar.'], fx: 'sip' },
  { id: 'nectar-run', name: 'NECTAR RUN', suit: 'gather', cost: 1, rarity: 'common', art: 'trail', text: ['Gain 1 nectar.', 'Draw 1 card.'], fx: 'nectarRun' },
  { id: 'deep-draw', name: 'DEEP DRAW', suit: 'gather', cost: 1, rarity: 'common', art: 'comb', text: ['Draw 2 cards.'], fx: 'deepDraw' },
  { id: 'honey-jar', name: 'HONEY JAR', suit: 'gather', cost: 2, rarity: 'rare', art: 'jar', text: ['Gain 3 nectar.', 'Gain 3 wax.'], fx: 'honeyJar' },
  { id: 'swarm-sense', name: 'SWARM SENSE', suit: 'gather', cost: 0, rarity: 'rare', art: 'antenna', text: ['Draw 2 cards.', 'Lose 1 swarm.'], fx: 'swarmSense' },
  { id: 'feast', name: 'FEAST', suit: 'gather', cost: 2, rarity: 'rare', art: 'jar', text: ['Gain 4 nectar.', 'Draw 1 card.'], fx: 'feast' },

  // ---- BUILD: wax walls and a bigger nectar ceiling.
  { id: 'wax-seal', name: 'WAX SEAL', suit: 'build', cost: 1, rarity: 'common', art: 'seal', text: ['Gain 6 wax.'], fx: 'waxSeal' },
  { id: 'comb-wall', name: 'COMB WALL', suit: 'build', cost: 2, rarity: 'common', art: 'wall', text: ['Gain 10 wax.'], fx: 'combWall' },
  { id: 'raise-cap', name: 'RAISE CAP', suit: 'build', cost: 2, rarity: 'rare', art: 'cap', text: ['+1 nectar max.', 'Gain 2 wax.'], fx: 'raiseCap' },
  { id: 'cell-forge', name: 'CELL FORGE', suit: 'build', cost: 1, rarity: 'common', art: 'comb', text: ['Gain 4 wax.', 'Gain 1 nectar.'], fx: 'cellForge' },
  { id: 'ledger-stone', name: 'LEDGER STONE', suit: 'build', cost: 1, rarity: 'rare', art: 'ledger', text: ['Gain 3 wax.', 'Draw 1 card.'], fx: 'ledgerStone' },

  // ---- HATCH: bees that strike on their own every turn.
  { id: 'brood', name: 'BROOD', suit: 'hatch', cost: 1, rarity: 'common', art: 'grub', text: ['Summon 1 bee.'], fx: 'brood' },
  { id: 'nurse', name: 'NURSE', suit: 'hatch', cost: 1, rarity: 'common', art: 'grub', text: ['Summon 1 bee.', 'Gain 3 wax.'], fx: 'nurse' },
  { id: 'hatch-burst', name: 'HATCH BURST', suit: 'hatch', cost: 2, rarity: 'rare', art: 'burst', text: ['Summon 2 bees.'], fx: 'hatchBurst' },
  { id: 'swarm-call', name: 'SWARM CALL', suit: 'hatch', cost: 3, rarity: 'epic', art: 'burst', text: ['Summon 2 bees.', 'Heal 4 swarm.'], fx: 'swarmCall' },
  { id: 'royal-jelly', name: 'ROYAL JELLY', suit: 'hatch', cost: 2, rarity: 'rare', art: 'jelly', text: ['All bees +2 damage.', 'Summon 1 bee.'], fx: 'royalJelly' },

  // ---- GUARD: absorb the night, answer it.
  { id: 'brace', name: 'BRACE', suit: 'guard', cost: 1, rarity: 'common', art: 'shield', text: ['Gain 5 wax.'], fx: 'brace' },
  { id: 'sentry', name: 'SENTRY', suit: 'guard', cost: 1, rarity: 'common', art: 'shield', text: ['Gain 3 wax.', 'Deal 3 damage.'], fx: 'sentry' },
  { id: 'guard-drill', name: 'GUARD DRILL', suit: 'guard', cost: 1, rarity: 'common', art: 'spear', text: ['Deal 4 damage.', 'Gain 3 wax.'], fx: 'guardDrill' },
  { id: 'deflect', name: 'DEFLECT', suit: 'guard', cost: 1, rarity: 'rare', art: 'spear', text: ['Deal wax / 2 damage.', 'Gain 2 wax.'], fx: 'deflect' },
  { id: 'hive-shield', name: 'HIVE SHIELD', suit: 'guard', cost: 2, rarity: 'epic', art: 'shield', text: ['Gain 8 wax.', 'All foes -2 strength.'], fx: 'hiveShield' },

  // ---- STING: the price of hitting hard is paid in bees.
  { id: 'jab', name: 'JAB', suit: 'sting', cost: 1, rarity: 'common', art: 'sting', text: ['Deal 6 damage.'], fx: 'jab' },
  { id: 'sting', name: 'STING', suit: 'sting', cost: 2, rarity: 'common', art: 'sting', text: ['Deal 12 damage.', 'Lose 3 swarm.'], fx: 'sting' },
  { id: 'venom', name: 'VENOM', suit: 'sting', cost: 1, rarity: 'rare', art: 'venom', text: ['Deal 3 damage.', 'Apply 4 poison.'], fx: 'venom' },
  { id: 'pierce', name: 'PIERCE', suit: 'sting', cost: 1, rarity: 'rare', art: 'sting', text: ['Deal 5 damage.', 'Ignores wax.'], fx: 'pierce' },
  { id: 'fury', name: 'FURY', suit: 'sting', cost: 3, rarity: 'epic', art: 'fury', text: ['Deal 9 damage', 'to ALL foes.'], fx: 'fury' },
  { id: 'last-sting', name: 'LAST STING', suit: 'sting', cost: 2, rarity: 'rare', art: 'fury', text: ['Deal 8 damage.', 'Double if hive is low.'], fx: 'lastSting' },
  { id: 'twin-sting', name: 'TWIN STING', suit: 'sting', cost: 2, rarity: 'epic', art: 'sting', text: ['Deal 6 damage twice.'], fx: 'twinSting' },
  { id: 'wax-fountain', name: 'WAX FOUNTAIN', suit: 'build', cost: 2, rarity: 'epic', art: 'comb', text: ['Gain 12 wax.'], fx: 'waxFountain' },
  { id: 'summoning-cry', name: 'SUMMONING CRY', suit: 'hatch', cost: 3, rarity: 'epic', art: 'burst', text: ['Summon 3 bees.'], fx: 'summoningCry' },
];

export const CARDS_BY_ID = CARDS.reduce((map, card) => {
  map[card.id] = card;
  return map;
}, {});

// The opening ledger: ten cards, enough damage to open, enough wax to survive the first night.
export const STARTER_DECK = [
  'sip', 'sip', 'nectar-run', 'jab', 'jab', 'brace', 'brace', 'wax-seal', 'brood', 'deep-draw',
];

export const REWARD_POOL = CARDS.map((card) => card.id).filter((id) => !STARTER_DECK.includes(id));

export function defineCard(id) {
  const base = CARDS_BY_ID[id];
  if (!base) throw new Error(`unknown card ${id}`);
  return { ...base, uid: 0 };
}

export function cardSuitOf(card) {
  return card ? card.suit : 'gather';
}
