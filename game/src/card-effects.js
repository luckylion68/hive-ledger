// What each effect key actually does. One function per effect, all of them going through hive.js,
// so a card is a row of data in cards.js plus one short entry here.
import { RULES } from './config.js';
import { state } from './state.js';
import {
  gainNectar,
  gainWax,
  hitEnemy,
  hitEveryEnemy,
  poisonEnemy,
  weakenEnemies,
  spawnBees,
  boostBees,
  healSwarm,
  hurtSwarm,
  livingEnemies,
  hiveIsLow,
} from './hive.js';
import { drawCards } from './deck.js';
import { relicDamageBonus } from './relics.js';

/** The foe a damage card lands on: the one you clicked, or the first one still standing. */
export function currentTarget() {
  const chosen = state.enemies[state.target];
  if (chosen && !chosen.dead && chosen.hp > 0) return chosen;
  const alive = livingEnemies();
  return alive.length ? alive[0] : null;
}

export function selectTarget(index) {
  const enemy = state.enemies[index];
  if (!enemy || enemy.dead) return false;
  state.target = index;
  state.buzz = 1;
  return true;
}

function stingDamage(base) {
  return base + relicDamageBonus('sting');
}

const EFFECTS = {
  // GATHER
  sip() {
    gainNectar(2);
  },
  nectarRun() {
    gainNectar(1);
    drawCards(1);
  },
  deepDraw() {
    drawCards(2);
  },
  honeyJar() {
    gainNectar(3);
    gainWax(3);
  },
  swarmSense() {
    drawCards(2);
    hurtSwarm(1, { pierce: true });
  },
  feast() {
    gainNectar(4);
    drawCards(1);
  },

  // BUILD
  waxSeal() {
    gainWax(6);
  },
  combWall() {
    gainWax(10);
  },
  raiseCap() {
    if (state.nectarMax < RULES.nectarCap) {
      state.nectarMax += 1;
      gainNectar(1);
    } else {
      gainWax(6);
    }
    gainWax(2);
  },
  cellForge() {
    gainWax(4);
    gainNectar(1);
  },
  ledgerStone() {
    gainWax(3);
    drawCards(1);
  },

  // HATCH
  brood() {
    spawnBees(1);
  },
  nurse() {
    spawnBees(1);
    gainWax(3);
  },
  hatchBurst() {
    spawnBees(2);
  },
  swarmCall() {
    spawnBees(2);
    healSwarm(4);
  },
  royalJelly() {
    boostBees(2);
    spawnBees(1);
  },

  // GUARD
  brace() {
    gainWax(5);
  },
  sentry() {
    gainWax(3);
    hitEnemy(currentTarget(), 3);
  },
  guardDrill() {
    hitEnemy(currentTarget(), 4);
    gainWax(3);
  },
  deflect() {
    hitEnemy(currentTarget(), Math.max(2, Math.floor(state.wax / 2)));
    gainWax(2);
  },
  hiveShield() {
    gainWax(8);
    weakenEnemies(2);
  },

  // STING
  jab() {
    hitEnemy(currentTarget(), stingDamage(6));
  },
  sting() {
    hitEnemy(currentTarget(), stingDamage(12));
    hurtSwarm(3, { pierce: true });
  },
  venom() {
    const target = currentTarget();
    hitEnemy(target, stingDamage(3));
    if (target) poisonEnemy(target, 4);
  },
  pierce() {
    hitEnemy(currentTarget(), stingDamage(5), { pierce: true });
  },
  fury() {
    hitEveryEnemy(stingDamage(9));
  },
  lastSting() {
    const base = stingDamage(8);
    hitEnemy(currentTarget(), hiveIsLow() ? base * 2 : base);
  },
};

export function applyEffect(card) {
  const effect = EFFECTS[card.fx];
  if (!effect) throw new Error(`no effect for ${card.fx}`);
  effect(card);
}

export function effectCount() {
  return Object.keys(EFFECTS).length;
}
