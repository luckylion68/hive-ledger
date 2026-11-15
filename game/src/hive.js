// The hive's bookkeeping: nectar in, swarm out, wax up, bees working. Every card effect and every
// enemy attack goes through here, so there is exactly one place that decides what a number means.
import { LAYOUT, RULES, SUITS } from './config.js';
import { state, addFloater, addShake, bumpStat } from './state.js';

export function gainNectar(amount, quiet = false) {
  if (amount <= 0) return 0;
  const before = state.nectar;
  state.nectar = Math.min(state.nectarMax + 4, state.nectar + amount);
  const gained = state.nectar - before;
  bumpStat('nectarGathered', gained);
  if (!quiet && gained > 0) {
    addFloater(`+${gained} NECTAR`, LAYOUT.nectar.dotX + 60, LAYOUT.nectar.cy + 18, SUITS.gather.color, 18);
  }
  return gained;
}

export function spendNectar(amount) {
  if (state.nectar < amount) return false;
  state.nectar -= amount;
  return true;
}

export function gainWax(amount) {
  if (amount <= 0) return 0;
  state.wax += amount;
  bumpStat('waxBuilt', amount);
  addFloater(`+${amount} WAX`, LAYOUT.wax.hexX - 14, LAYOUT.wax.hexY + 34, SUITS.guard.color, 20);
  return amount;
}

export function clearWax() {
  state.wax = 0;
}

export function healSwarm(amount) {
  if (amount <= 0) return 0;
  const before = state.swarm;
  state.swarm = Math.min(state.swarmMax, state.swarm + amount);
  const healed = state.swarm - before;
  if (healed > 0) addFloater(`+${healed}`, LAYOUT.keeper.x + 26, LAYOUT.keeper.y - 26, SUITS.leaf || '#b8d94a', 22);
  return healed;
}

/** Damage aimed at you. Wax soaks it first unless the hit says it goes through. */
export function hurtSwarm(amount, options = {}) {
  if (amount <= 0) return 0;
  let left = amount;
  if (!options.pierce && state.wax > 0) {
    const soaked = Math.min(state.wax, left);
    state.wax -= soaked;
    left -= soaked;
    if (soaked > 0) addFloater(`-${soaked} WAX`, LAYOUT.keeper.x + 40, LAYOUT.keeper.y + 6, SUITS.guard.color, 17);
  }
  if (left <= 0) return 0;
  state.swarm = Math.max(0, state.swarm - left);
  bumpStat('damageTaken', left);
  addFloater(`-${left}`, LAYOUT.keeper.x + 6, LAYOUT.keeper.y - 40, '#d8462f', 26);
  addShake(3 + Math.min(6, left * 0.3));
  return left;
}

export function spawnBees(count) {
  state.bees += count;
  addFloater(`+${count} BEE`, LAYOUT.bees[0].x + 30, LAYOUT.bees[0].y - 20, '#b8d94a', 18);
  return state.bees;
}

export function boostBees(amount) {
  state.beePower += amount;
  addFloater(`BEES +${amount}`, LAYOUT.bees[1].x + 30, LAYOUT.bees[1].y - 6, '#b8d94a', 16);
}

export function playerPoison(amount) {
  state.poison += amount;
  addFloater(`+${amount} POISON`, LAYOUT.keeper.x + 10, LAYOUT.keeper.y - 56, '#b8d94a', 15);
}

export function livingEnemies() {
  return state.enemies.filter((enemy) => !enemy.dead && enemy.hp > 0);
}

export function enemyAt(index) {
  return state.enemies[index];
}

export function enemyCenter(enemy) {
  const index = state.enemies.indexOf(enemy);
  const slot = index < 0 ? 1 : index;
  return { x: LAYOUT.enemy.cx[Math.min(slot, 2)], y: LAYOUT.enemy.cy };
}

/** One hit on one enemy: wax (armour) first, then body. Returns the damage that landed. */
export function hitEnemy(enemy, amount, options = {}) {
  if (!enemy || enemy.dead || amount <= 0) return 0;
  let left = amount;
  if (!options.pierce && enemy.wax > 0) {
    const soaked = Math.min(enemy.wax, left);
    enemy.wax -= soaked;
    left -= soaked;
  }
  enemy.hp = Math.max(0, enemy.hp - left);
  const point = enemyCenter(enemy);
  addFloater(`-${left || amount}`, point.x + (index0(enemy) - 1) * 6, point.y - 18, '#d8462f', 24);
  addShake(1.5 + Math.min(4, left * 0.12));
  if (enemy.hp <= 0) fellEnemy(enemy);
  return left;
}

function index0(enemy) {
  const index = state.enemies.indexOf(enemy);
  return index < 0 ? 1 : index;
}

export function hitEveryEnemy(amount, options = {}) {
  let total = 0;
  for (const enemy of livingEnemies()) total += hitEnemy(enemy, amount, options);
  return total;
}

export function poisonEnemy(enemy, stacks) {
  if (!enemy || enemy.dead) return;
  enemy.poison += stacks;
  const point = enemyCenter(enemy);
  addFloater(`+${stacks} POISON`, point.x, point.y + 26, '#b8d94a', 15);
}

export function weakenEnemies(amount) {
  for (const enemy of livingEnemies()) enemy.strength = Math.max(0, enemy.strength - amount);
  addFloater(`FOES -${amount} STR`, LAYOUT.enemy.cx[1], LAYOUT.enemy.cy - 96, SUITS.guard.color, 16);
}

export function fellEnemy(enemy) {
  if (enemy.dead) return;
  enemy.dead = true;
  enemy.hp = 0;
  bumpStat('enemiesFelled', 1);
  const point = enemyCenter(enemy);
  addFloater('FELLED', point.x, point.y + 4, '#ffd479', 20);
  addShake(4);
}

/** Bees hit at the end of your turn, one target each, aimed at the weakest living foe. */
export function beesStrike() {
  if (state.bees <= 0) return;
  for (let i = 0; i < state.bees; i += 1) {
    const alive = livingEnemies();
    if (!alive.length) return;
    alive.sort((a, b) => a.hp - b.hp);
    hitEnemy(alive[0], state.beePower);
  }
  addFloater(`${state.bees} x ${state.beePower}`, LAYOUT.bees[0].x + 34, LAYOUT.bees[0].y - 26, '#b8d94a', 16);
}

/**
 * Combo bookkeeping. The counter only breaks when you switch suits, so a run of stings survives
 * the end of a turn; every third card of the same suit fires that suit's extra effect.
 */
export function trackSuit(suit) {
  if (state.comboSuit === suit) state.combo += 1;
  else {
    state.comboSuit = suit;
    state.combo = 1;
  }
  if (state.combo > state.stats.bestCombo) state.stats.bestCombo = state.combo;
  state.comboPulse = 1;
  if (state.combo >= 3 && state.combo % RULES.comboStep === 0) return true;
  return false;
}

export function fireComboBonus(suit) {
  switch (suit) {
    case 'gather':
      gainNectar(2);
      break;
    case 'build':
      gainWax(6);
      break;
    case 'hatch':
      spawnBees(1);
      break;
    case 'guard':
      gainWax(5);
      break;
    case 'sting':
      hitEveryEnemy(4);
      break;
    default:
      break;
  }
  addFloater(`COMBO ${state.combo}`, LAYOUT.combo.x + 60, LAYOUT.combo.y + 44, '#d8462f', 20);
}

export function hiveIsLow() {
  return state.swarm <= state.swarmMax * 0.5;
}
