// The eight floors of the last comb: what waits on each, how many relics a cleared floor pays and
// the line the HUD prints. Enemy kinds come from enemies.js; this file only arranges them.
export const FLOOR_PLAN = [
  { floor: 1, name: 'THE FIRST NIGHT', enemies: ['wasp'], reward: 'card' },
  { floor: 2, name: 'CRACKED CELLS', enemies: ['wasp', 'mite'], reward: 'card+relic' },
  { floor: 3, name: 'HEAVY AIR', enemies: ['bumble'], reward: 'card' },
  { floor: 4, name: 'THE BROOD GAP', enemies: ['larva', 'wasp'], reward: 'card+relic' },
  { floor: 5, name: 'THE PLATE LINE', enemies: ['hornet', 'wasp', 'thief'], reward: 'card' },
  { floor: 6, name: 'SMOKE AND ASH', enemies: ['keeper', 'mite', 'larva'], reward: 'card+relic' },
  { floor: 7, name: 'THE OUTER RIM', enemies: ['hornet', 'bumble', 'thief'], reward: 'card' },
  { floor: 8, name: 'THE QUEEN', enemies: ['queen'], reward: 'none' },
];

export function floorConfig(floor) {
  return FLOOR_PLAN[Math.min(FLOOR_PLAN.length, Math.max(1, floor)) - 1];
}

export function floorEnemies(floor) {
  return floorConfig(floor).enemies;
}

export function floorPaysRelic(floor) {
  const config = floorConfig(floor);
  return config.reward.includes('relic');
}

export function floorPaysCard(floor) {
  return floorConfig(floor).reward.includes('card');
}

export function isLastFloor(floor) {
  return floor >= FLOOR_PLAN.length;
}

export function floorTitle(floor) {
  return `FLOOR ${floor} / ${FLOOR_PLAN.length}`;
}

export function floorName(floor) {
  return floorConfig(floor).name;
}
