// What each foe plans to do next, decided before you spend a single nectar so the badge over its
// head is a promise and not a mood. Icons are pure vectors drawn in art.js.
import { ENEMY_KINDS } from './enemies.js';
import { state } from './state.js';

export const INTENT_META = {
  attack: { icon: 'sword', label: 'ATTACK', tint: '#d8462f' },
  block: { icon: 'shield', label: 'HARDEN', tint: '#7fa6b8' },
  heal: { icon: 'cross', label: 'HEAL', tint: '#b8d94a' },
  poison: { icon: 'drop', label: 'POISON', tint: '#b8d94a' },
  smoke: { icon: 'smoke', label: 'SMOKE', tint: '#7fa6b8' },
  steal: { icon: 'hand', label: 'STEAL', tint: '#a86a9c' },
  grow: { icon: 'grow', label: 'GROW', tint: '#ffd479' },
  unknown: { icon: 'alert', label: 'UNKNOWN', tint: '#8a7350' },
};

function phaseOf(enemy) {
  if (!enemy.boss) return 0;
  const share = enemy.hp / enemy.maxHp;
  if (share > 0.66) return 1;
  if (share > 0.33) return 2;
  return 3;
}

function cycleFor(enemy) {
  const kind = ENEMY_KINDS[enemy.kind];
  if (kind.boss) {
    const phase = phaseOf(enemy);
    if (phase !== enemy.phase) {
      enemy.phase = phase;
      enemy.step = 0;
    }
    return kind.phases[phase];
  }
  return kind.cycle;
}

/** Read the next move, scale it by the foe's strength, and store it on the enemy. */
export function chooseIntent(enemy) {
  if (!enemy || enemy.dead) return null;
  const cycle = cycleFor(enemy);
  const step = cycle[enemy.step % cycle.length];
  enemy.step += 1;
  let value = step.value;
  if (step.type === 'attack') value += enemy.strength;
  enemy.intent = {
    type: step.type,
    value,
    icon: (INTENT_META[step.type] || INTENT_META.unknown).icon,
    tint: (INTENT_META[step.type] || INTENT_META.unknown).tint,
    label: (INTENT_META[step.type] || INTENT_META.unknown).label,
  };
  return enemy.intent;
}

export function rollIntents() {
  for (const enemy of state.enemies) {
    if (!enemy.dead) chooseIntent(enemy);
  }
}

export function intentText(enemy) {
  if (!enemy.intent) return '?';
  const meta = INTENT_META[enemy.intent.type] || INTENT_META.unknown;
  if (enemy.intent.type === 'attack') return `${enemy.intent.value}`;
  if (enemy.intent.type === 'block' || enemy.intent.type === 'heal') return `${enemy.intent.value}`;
  if (enemy.intent.type === 'grow') return `+${enemy.intent.value}`;
  if (enemy.intent.type === 'steal') return `${enemy.intent.value}`;
  return `${meta.label.slice(0, 3)} ${enemy.intent.value}`;
}
