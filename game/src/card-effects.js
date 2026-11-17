// What each effect key actually does. One function per effect, all of them going through hive.js,
// so a card is a row of data in cards.js plus one short entry here. A tempered card (the camp's
// upgrade) reads the same table with every number two higher, which is why nothing here is a literal.
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

/** The card being resolved right now, so v() can see whether it was tempered at the camp. */
let activeCard = null;

/** Every number on a card, plus the temper bonus. Keeping it in one place is what makes upgrades safe. */
export function v(base) {
  return base + (activeCard && activeCard.plus ? 2 : 0);
}

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
  return v(base) + relicDamageBonus('sting');
}

const EFFECTS = {
  // GATHER
  sip() {
    gainNectar(v(2));
  },
  nectarRun() {
    gainNectar(v(1));
    drawCards(1);
  },
  deepDraw() {
    drawCards(2);
  },
  honeyJar() {
    gainNectar(v(3));
    gainWax(v(3));
  },
  swarmSense() {
    drawCards(2);
    hurtSwarm(1, { pierce: true });
  },
  feast() {
    gainNectar(v(4));
    drawCards(1);
  },

  // BUILD
  waxSeal() {
    gainWax(v(6));
  },
  combWall() {
    gainWax(v(10));
  },
  raiseCap() {
    if (state.nectarMax < RULES.nectarCap) {
      state.nectarMax += 1;
      gainNectar(1);
    } else {
      gainWax(v(6));
    }
    gainWax(v(2));
  },
  cellForge() {
    gainWax(v(4));
    gainNectar(v(1));
  },
  ledgerStone() {
    gainWax(v(3));
    drawCards(1);
  },

  // HATCH
  brood() {
    spawnBees(1);
  },
  nurse() {
    spawnBees(1);
    gainWax(v(3));
  },
  hatchBurst() {
    spawnBees(2);
  },
  swarmCall() {
    spawnBees(2);
    healSwarm(v(4));
  },
  royalJelly() {
    boostBees(v(2));
    spawnBees(1);
  },

  // GUARD
  brace() {
    gainWax(v(5));
  },
  sentry() {
    gainWax(v(3));
    hitEnemy(currentTarget(), v(3));
  },
  guardDrill() {
    hitEnemy(currentTarget(), v(4));
    gainWax(v(3));
  },
  deflect() {
    hitEnemy(currentTarget(), Math.max(2, Math.floor(state.wax / 2)));
    gainWax(v(2));
  },
  hiveShield() {
    gainWax(v(8));
    weakenEnemies(v(2));
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
    if (target) poisonEnemy(target, v(4));
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
  twinSting() {
    const dmg = stingDamage(6);
    hitEnemy(currentTarget(), dmg);
    hitEnemy(currentTarget(), dmg);
  },
  waxFountain() {
    gainWax(v(12));
  },
  summoningCry() {
    spawnBees(v(3));
  },
};

export function applyEffect(card) {
  const effect = EFFECTS[card.fx];
  if (!effect) throw new Error(`no effect for ${card.fx}`);
  activeCard = card;
  try {
    effect(card);
  } finally {
    activeCard = null;
  }
}

export function effectCount() {
  return Object.keys(EFFECTS).length;
}
