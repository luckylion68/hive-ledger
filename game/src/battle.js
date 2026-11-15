// The turn loop: draw five, spend nectar, hand the turn over, take the night's answer. Everything
// that changes a number does it through hive.js; this file only decides the order of events.
import { RULES } from './config.js';
import { state, bumpStat, toast, resetRun } from './state.js';
import { createRng } from './random.js';
import { buildDeck, drawCards, discardHand, discardCard } from './deck.js';
import { makeEnemyLine } from './enemies.js';
import { rollIntents, chooseIntent } from './intents.js';
import { applyEffect } from './card-effects.js';
import {
  relicOnCombatStart,
  relicOnTurnStart,
  relicOnCardPlayed,
  relicOnTurnEnd,
  relicDrawBonus,
  grantRelic,
} from './relics.js';
import {
  trackSuit,
  fireComboBonus,
  beesStrike,
  livingEnemies,
  hurtSwarm,
  playerPoison,
  clearWax,
} from './hive.js';
import { STARTER_DECK } from './cards.js';
import { floorEnemies, floorName } from './floors.js';
import { playSound } from './audio.js';
import { onFloorCleared, onDefeat } from './scenes.js';

export function startRun(seed, startingRelics = []) {
  resetRun(seed);
  state.rng = createRng(seed);
  state.deck = buildDeck(STARTER_DECK);
  state.relics = [];
  for (const id of startingRelics) grantRelic(id);
  startBattle(1);
}

export function startBattle(floor) {
  state.floor = floor;
  state.enemies = makeEnemyLine(floorEnemies(floor), floor);
  state.target = 0;
  state.phase = 'player';
  state.turn = 1;
  state.turnsThisFloor = 1;
  state.nectarMax = Math.max(state.nectarMax, RULES.startNectar);
  state.nectar = state.nectarMax;
  state.wax = 0;
  state.bees = 0;
  state.poison = 0;
  state.beePower = RULES.beePower;
  state.hand = [];
  state.drawPile = state.rng.shuffle(state.deck.slice());
  state.discardPile = [];
  state.floaters = [];
  relicOnCombatStart();
  rollIntents();
  drawHand();
  toast(floorName(floor));
  state.scene = 'battle';
}

function drawHand() {
  const wanted = RULES.handSize + relicDrawBonus();
  drawCards(wanted);
}

export function canPlay(card) {
  return Boolean(card) && card.cost <= state.nectar && state.phase === 'player' && state.scene === 'battle';
}

export function playCard(index) {
  if (state.scene !== 'battle' || state.phase !== 'player') return false;
  const card = state.hand[index];
  if (!card) return false;
  if (card.cost > state.nectar) {
    toast('Not enough nectar');
    playSound('deny');
    return false;
  }
  state.nectar -= card.cost;
  state.hand.splice(index, 1);
  state.lastPlayed = card;
  bumpStat('cardsPlayed', 1);
  playSound(card.suit === 'sting' ? 'sting' : 'card');
  relicOnCardPlayed(card);
  applyEffect(card);
  const comboFired = trackSuit(card.suit);
  if (comboFired) {
    fireComboBonus(card.suit);
    playSound('combo');
  }
  discardCard(card);
  if (!livingEnemies().length) {
    state.phase = 'cleared';
    onFloorCleared();
  }
  return true;
}

function enemyActs(enemy) {
  const intent = enemy.intent;
  if (!intent) return;
  switch (intent.type) {
    case 'attack':
      hurtSwarm(intent.value);
      playSound('hurt');
      break;
    case 'poison':
      playerPoison(intent.value);
      playSound('mite');
      break;
    case 'block':
      enemy.wax += intent.value;
      break;
    case 'heal':
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + intent.value);
      break;
    case 'smoke':
      state.nectar = Math.max(0, state.nectar - 1);
      toast('Smoke: -1 nectar');
      break;
    case 'steal':
      state.nectar = Math.max(0, state.nectar - intent.value);
      toast('Nectar stolen');
      break;
    case 'grow':
      enemy.strength += intent.value;
      enemy.maxHp += intent.value;
      enemy.hp += intent.value;
      break;
    default:
      break;
  }
}

function tickPoison() {
  for (const enemy of state.enemies) {
    if (enemy.dead || enemy.poison <= 0) continue;
    enemy.hp = Math.max(0, enemy.hp - enemy.poison);
    enemy.poison -= 1;
    if (enemy.hp <= 0) {
      enemy.dead = true;
      bumpStat('enemiesFelled', 1);
    }
  }
  if (state.poison > 0) {
    hurtSwarm(state.poison, { pierce: true });
    state.poison = Math.max(0, state.poison - 1);
  }
}

export function endTurn() {
  if (state.scene !== 'battle' || state.phase !== 'player') return false;
  state.phase = 'enemy';
  playSound('turn');
  bumpStat('turns', 1);
  beesStrike();
  relicOnTurnEnd();
  discardHand();
  if (!livingEnemies().length) {
    state.phase = 'cleared';
    onFloorCleared();
    return true;
  }
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    enemyActs(enemy);
    if (enemy.hp <= 0) {
      enemy.dead = true;
      bumpStat('enemiesFelled', 1);
    }
    if (state.swarm <= 0) break;
  }
  tickPoison();
  if (!livingEnemies().length) {
    state.phase = 'cleared';
    onFloorCleared();
    return true;
  }
  if (state.swarm <= 0) {
    state.phase = 'over';
    playSound('lose');
    onDefeat();
    return true;
  }
  for (const enemy of state.enemies) {
    if (!enemy.dead) chooseIntent(enemy);
  }
  state.turn += 1;
  state.turnsThisFloor += 1;
  clearWax();
  state.nectar = state.nectarMax;
  relicOnTurnStart();
  drawHand();
  state.phase = 'player';
  playSound('draw');
  return true;
}

/** Used by the title screen and the restart key: a clean run from a fresh seed. */
export function restart(seed) {
  state.nectarMax = RULES.startNectar;
  state.swarm = RULES.startSwarm;
  state.swarmMax = RULES.startSwarm;
  startRun(seed);
}

export function buildSummary() {
  return {
    floor: state.floor,
    turn: state.turn,
    hand: state.hand.length,
    draw: state.drawPile.length,
    discard: state.discardPile.length,
    enemies: livingEnemies().length,
  };
}
