// Eight kinds of night raider, each with its own silhouette, colour and move cycle. The cycle is
// public information: the intent badge over its head is drawn from it before it acts.
export const ENEMY_KINDS = {
  wasp: {
    key: 'wasp',
    name: 'WASP',
    body: '#f2b544',
    accent: '#c07a3e',
    hp: 17,
    wax: 0,
    shape: 'wasp',
    cycle: [
      { type: 'attack', value: 8 },
      { type: 'attack', value: 8 },
      { type: 'block', value: 4 },
    ],
    lore: 'straight sting',
  },
  mite: {
    key: 'mite',
    name: 'MITE',
    body: '#b8d94a',
    accent: '#6d8a24',
    hp: 13,
    wax: 0,
    shape: 'grub',
    cycle: [
      { type: 'poison', value: 4 },
      { type: 'attack', value: 4 },
      { type: 'poison', value: 3 },
    ],
    lore: 'eats through wax',
  },
  bumble: {
    key: 'bumble',
    name: 'BUMBLE',
    body: '#c07a3e',
    accent: '#8a5227',
    hp: 28,
    wax: 0,
    shape: 'bulk',
    cycle: [
      { type: 'attack', value: 13 },
      { type: 'block', value: 6 },
      { type: 'attack', value: 9 },
    ],
    lore: 'heavy blow',
  },
  keeper: {
    key: 'keeper',
    name: 'APIARIST',
    body: '#7fa6b8',
    accent: '#4d6c7a',
    hp: 21,
    wax: 0,
    shape: 'human',
    cycle: [
      { type: 'smoke', value: 1 },
      { type: 'attack', value: 7 },
      { type: 'attack', value: 7 },
    ],
    lore: 'smoke steals nectar',
  },
  hornet: {
    key: 'hornet',
    name: 'HORNET',
    body: '#d8462f',
    accent: '#8c2a1c',
    hp: 25,
    wax: 7,
    shape: 'hornet',
    cycle: [
      { type: 'attack', value: 9 },
      { type: 'block', value: 7 },
      { type: 'attack', value: 11 },
    ],
    lore: 'wears its own plate',
  },
  larva: {
    key: 'larva',
    name: 'LARVA',
    body: '#e0c98a',
    accent: '#a8914f',
    hp: 10,
    wax: 0,
    shape: 'grub',
    cycle: [
      { type: 'grow', value: 4 },
      { type: 'attack', value: 4 },
      { type: 'grow', value: 4 },
    ],
    lore: 'grows every turn',
  },
  thief: {
    key: 'thief',
    name: 'HONEY THIEF',
    body: '#a86a9c',
    accent: '#6d3f66',
    hp: 16,
    wax: 0,
    shape: 'thief',
    cycle: [
      { type: 'steal', value: 2 },
      { type: 'attack', value: 5 },
      { type: 'attack', value: 6 },
    ],
    lore: 'steals your nectar',
  },
  queen: {
    key: 'queen',
    name: 'BUMBLE QUEEN',
    body: '#f2b544',
    accent: '#8c2a1c',
    hp: 88,
    wax: 8,
    shape: 'queen',
    boss: true,
    cycle: [{ type: 'attack', value: 10 }],
    phases: {
      1: [
        { type: 'attack', value: 10 },
        { type: 'block', value: 10 },
        { type: 'poison', value: 4 },
      ],
      2: [
        { type: 'attack', value: 14 },
        { type: 'grow', value: 3 },
        { type: 'attack', value: 11 },
      ],
      3: [
        { type: 'attack', value: 18 },
        { type: 'attack', value: 12 },
        { type: 'block', value: 12 },
      ],
    },
    lore: 'three phases',
  },
};

export const ENEMY_ORDER = ['wasp', 'mite', 'bumble', 'keeper', 'hornet', 'larva', 'thief', 'queen'];

/** How much a floor hardens a body: floor 1 is as written, floor 8 is roughly half again as tough. */
export function floorScale(floor) {
  return 1 + (floor - 1) * 0.1;
}

export function makeEnemy(kindKey, floor = 1) {
  const kind = ENEMY_KINDS[kindKey];
  if (!kind) throw new Error(`unknown enemy ${kindKey}`);
  const scale = kind.boss ? 1 : floorScale(floor);
  const hp = Math.round(kind.hp * scale);
  return {
    kind: kindKey,
    name: kind.name,
    body: kind.body,
    accent: kind.accent,
    shape: kind.shape,
    boss: Boolean(kind.boss),
    hp,
    maxHp: hp,
    wax: Math.round(kind.wax * (kind.boss ? 1 : scale)),
    strength: 0,
    poison: 0,
    step: 0,
    phase: 1,
    dead: false,
    hit: 0,
    intent: null,
  };
}

export function makeEnemyLine(kinds, floor) {
  return kinds.map((kind) => makeEnemy(kind, floor));
}

export function enemyShortName(enemy) {
  return ENEMY_KINDS[enemy.kind].name;
}
