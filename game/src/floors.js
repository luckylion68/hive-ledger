// The eight floors of the last comb, cut into three acts. Each act ends on a boss, so the run has
// three peaks instead of one and the player can feel how far they have come. Enemy kinds come from
// enemies.js; this file only arranges them, and says which floor closes an act.
export const FLOOR_PLAN = [
  { floor: 1, act: 1, name: 'THE FIRST NIGHT', enemies: ['wasp'], reward: 'card' },
  { floor: 2, act: 1, name: 'CRACKED CELLS', enemies: ['wasp', 'mite'], reward: 'card+relic' },
  { floor: 3, act: 1, name: 'THE HORNET GENERAL', enemies: ['hornet-general'], reward: 'relic', boss: true },

  { floor: 4, act: 2, name: 'SMOKE AND ASH', enemies: ['bumble', 'wasp'], reward: 'card' },
  { floor: 5, act: 2, name: 'THE PLATE LINE', enemies: ['hornet', 'mite', 'thief'], reward: 'card+relic' },
  { floor: 6, act: 2, name: 'THE WAX WARDEN', enemies: ['wax-warden'], reward: 'relic', boss: true },

  { floor: 7, act: 3, name: 'THE OUTER RIM', enemies: ['keeper', 'larva', 'thief'], reward: 'card+relic' },
  { floor: 8, act: 3, name: 'THE QUEEN', enemies: ['queen'], reward: 'none', boss: true },
];

export const ACTS = [
  { act: 1, name: 'THE FIRST NIGHT', tag: 'where the ledger opens', first: 1, bossFloor: 3 },
  { act: 2, name: 'THE DROUGHT', tag: 'where the wax runs low', first: 4, bossFloor: 6 },
  { act: 3, name: 'THE INNER COURT', tag: 'where she keeps the ledger', first: 7, bossFloor: 8 },
];

export const LAST_FLOOR = FLOOR_PLAN.length;

const ECHO_NAMES = ['ECHO', 'ECHO II', 'ECHO III', 'ECHO IV', 'ECHO V', 'ECHO VI'];

export function floorConfig(floor) {
  if (floor > LAST_FLOOR) {
    const cycle = FLOOR_PLAN.length;
    const back = floor - LAST_FLOOR - 1;
    const base = FLOOR_PLAN[back % cycle];
    const loop = Math.min(ECHO_NAMES.length - 1, Math.floor(back / cycle));
    return { ...base, floor, name: base.name + ' ' + ECHO_NAMES[loop] };
  }
  return FLOOR_PLAN[Math.min(LAST_FLOOR, Math.max(1, floor)) - 1];
}

export function floorEnemies(floor) {
  return floorConfig(floor).enemies;
}

export function floorPaysRelic(floor) {
  return floorConfig(floor).reward.includes('relic');
}

export function floorPaysCard(floor) {
  return floorConfig(floor).reward.includes('card');
}

export function isLastFloor(floor) {
  return floor >= LAST_FLOOR;
}

export function isBossFloor(floor) {
  return Boolean(floorConfig(floor).boss);
}

export function actOf(floor) {
  const act = floorConfig(floor).act;
  return ACTS[act - 1];
}

export function floorTitle(floor) {
  return floor > LAST_FLOOR ? `FLOOR ${floor} · THE ENDLESS COMB` : `FLOOR ${floor} / ${LAST_FLOOR}`;
}

export function floorName(floor) {
  return floorConfig(floor).name;
}

/** What the HUD prints instead of a bare floor number: the act, and how far into it this is. */
export function floorLine(floor) {
  const act = actOf(floor);
  const into = floor - act.first + 1;
  const length = act.bossFloor - act.first + 1;
  return `ACT ${act.act} · ${act.name} · ${into} OF ${length}`;
}
