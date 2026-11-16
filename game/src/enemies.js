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
      { type: 'attack', value: 7 },
      { type: 'attack', value: 7 },
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
      { type: 'attack', value: 12 },
      { type: 'block', value: 6 },
      { type: 'attack', value: 8 },
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
      { type: 'attack', value: 8 },
      { type: 'block', value: 7 },
      { type: 'attack', value: 10 },
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
      { type: 'grow', value: 3 },
      { type: 'attack', value: 4 },
      { type: 'grow', value: 3 },
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
  midge: {
    key: 'midge',
    name: 'MIDGE',
    body: '#9fb84a',
    accent: '#5f7524',
    hp: 11,
    wax: 0,
    shape: 'grub',
    cycle: [
      { type: 'attack', value: 4 },
      { type: 'attack', value: 4 },
      { type: 'attack', value: 6 },
    ],
    lore: 'two quick bites',
  },
  beetle: {
    key: 'beetle',
    name: 'CELL BEETLE',
    body: '#6d8f8a',
    accent: '#3f5b58',
    hp: 32,
    wax: 14,
    shape: 'bulk',
    cycle: [
      { type: 'block', value: 8 },
      { type: 'attack', value: 13 },
      { type: 'block', value: 8 },
    ],
    lore: 'shell like a cell wall',
  },
  moth: {
    key: 'moth',
    name: 'WAX MOTH',
    body: '#d9cfae',
    accent: '#8f8564',
    hp: 19,
    wax: 0,
    shape: 'wasp',
    cycle: [
      { type: 'smoke', value: 2 },
      { type: 'attack', value: 6 },
      { type: 'smoke', value: 2 },
    ],
    lore: 'eats the wax you built',
  },
  drone: {
    key: 'drone',
    name: 'DRONE',
    body: '#c98a3a',
    accent: '#7d5320',
    hp: 15,
    wax: 0,
    shape: 'wasp',
    cycle: [
      { type: 'attack', value: 16 },
      { type: 'block', value: 4 },
      { type: 'attack', value: 16 },
    ],
    lore: 'dies young, hits hard',
  },
  'hornet-general': {
    key: 'hornet-general',
    name: 'HORNET GENERAL',
    body: '#d8462f',
    accent: '#6d1f14',
    hp: 64,
    wax: 12,
    shape: 'hornet',
    boss: true,
    cycle: [{ type: 'attack', value: 9 }],
    phases: {
      1: [
        { type: 'attack', value: 9 },
        { type: 'block', value: 9 },
        { type: 'attack', value: 11 },
      ],
      2: [
        { type: 'attack', value: 12 },
        { type: 'poison', value: 5 },
        { type: 'attack', value: 13 },
      ],
      3: [
        { type: 'attack', value: 16 },
        { type: 'attack', value: 10 },
        { type: 'grow', value: 4 },
      ],
    },
    lore: 'closes act one',
  },
  'wax-warden': {
    key: 'wax-warden',
    name: 'WAX WARDEN',
    body: '#e0c98a',
    accent: '#8a6b2c',
    hp: 78,
    wax: 16,
    shape: 'bulk',
    boss: true,
    cycle: [{ type: 'block', value: 10 }],
    phases: {
      1: [
        { type: 'block', value: 12 },
        { type: 'attack', value: 11 },
        { type: 'heal', value: 8 },
      ],
      2: [
        { type: 'attack', value: 14 },
        { type: 'heal', value: 10 },
        { type: 'attack', value: 12 },
      ],
      3: [
        { type: 'attack', value: 18 },
        { type: 'block', value: 16 },
        { type: 'attack', value: 18 },
      ],
    },
    lore: 'rebuilds what you break',
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
        { type: 'attack', value: 9 },
        { type: 'block', value: 10 },
        { type: 'poison', value: 3 },
      ],
      2: [
        { type: 'attack', value: 13 },
        { type: 'grow', value: 3 },
        { type: 'attack', value: 10 },
      ],
      3: [
        { type: 'attack', value: 17 },
        { type: 'attack', value: 11 },
        { type: 'block', value: 12 },
      ],
    },
    lore: 'three phases',
  },
};

export const ENEMY_ORDER = ['wasp', 'mite', 'bumble', 'keeper', 'hornet', 'larva', 'thief', 'midge', 'beetle', 'moth', 'drone'];
export const BOSS_ORDER = ['hornet-general', 'wax-warden', 'queen'];

/** How much a floor hardens a body: floor 1 is as written, floor 8 is roughly half again as tough. */
export function floorScale(floor) {
  return 1 + (floor - 1) * 0.1;
}

/**
 * One raider on the board. opts carries the run's difficulty into the body instead of leaving the
 * numbers hard-coded: hpScale raises the body, bite raises every hit it lands, and elite marks a
 * raid that pays more than a hunt because it costs more.
 */
export function makeEnemy(kindKey, floor = 1, opts = {}) {
  const kind = ENEMY_KINDS[kindKey];
  if (!kind) throw new Error(`unknown enemy ${kindKey}`);
  const hpScale = opts.hpScale || 1;
  const bite = opts.bite || 0;
  const elite = Boolean(opts.elite) && !kind.boss;
  const scale = (kind.boss ? 1 : floorScale(floor)) * hpScale * (elite ? 1.3 : 1);
  const hp = Math.round(kind.hp * scale);
  return {
    kind: kindKey,
    name: elite ? `ELITE ${kind.name}` : kind.name,
    body: kind.body,
    accent: kind.accent,
    shape: kind.shape,
    boss: Boolean(kind.boss),
    elite,
    bite: bite + (elite ? 1 : 0),
    hp,
    maxHp: hp,
    wax: Math.round(kind.wax * scale),
    strength: 0,
    poison: 0,
    step: 0,
    phase: 1,
    dead: false,
    hit: 0,
    intent: null,
  };
}

export function makeEnemyLine(kinds, floor, opts = {}) {
  return kinds.map((kind) => makeEnemy(kind, floor, opts));
}

export function enemyShortName(enemy) {
  return ENEMY_KINDS[enemy.kind].name;
}
