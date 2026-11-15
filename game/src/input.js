// Mouse and keyboard. One pointer handler decides what was clicked by asking the scene where its
// hit boxes are, so the drawing code and the hit boxes can never drift apart.
import { HIT, LAYOUT, RULES } from './config.js';
import { state } from './state.js';
import { playCard, endTurn } from './battle.js';
import { beginRun, restartRun, takeReward, skipReward, goTitle, rewardCards } from './scenes.js';
import { selectTarget } from './card-effects.js';
import { initAudio, playSound, toggleMute } from './audio.js';
import { enemySlotX, handCardRect } from './render-battle.js';
import { CARD_W, CARD_H } from './render-cards.js';

function toLogical(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 1280;
  const y = ((event.clientY - rect.top) / rect.height) * 720;
  return { x, y };
}

function inside(point, box) {
  return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
}

function handIndexAt(point) {
  if (point.y < LAYOUT.hand.y - 20) return -1;
  for (let i = 0; i < state.hand.length; i += 1) {
    const rect = handCardRect(i);
    if (inside(point, { x: rect.x, y: rect.y, w: CARD_W, h: CARD_H })) return i;
  }
  return -1;
}

function enemyIndexAt(point) {
  if (state.scene !== 'battle') return -1;
  const count = state.enemies.length;
  for (let i = 0; i < count; i += 1) {
    const cx = enemySlotX(i, count);
    const dy = point.y - LAYOUT.enemy.cy;
    const dx = point.x - cx;
    if (Math.hypot(dx, dy) < LAYOUT.enemy.r + 14 && !state.enemies[i].dead) return i;
  }
  return -1;
}

function relicIndexAt(point) {
  for (let i = 0; i < RULES.relicSlots; i += 1) {
    const cx = LAYOUT.relic.x + i * LAYOUT.relic.step;
    if (Math.hypot(point.x - cx, point.y - LAYOUT.relic.cy) < LAYOUT.relic.r + 4) return i;
  }
  return -1;
}

function rewardIndexAt(point) {
  for (let i = 0; i < rewardCards().length; i += 1) {
    const x = LAYOUT.reward.startX + i * (LAYOUT.reward.cardW + LAYOUT.reward.gap);
    if (inside(point, { x, y: LAYOUT.reward.cardY, w: LAYOUT.reward.cardW, h: LAYOUT.reward.cardH })) return i;
  }
  return -1;
}

function refreshHover(point) {
  state.hoverCard = -1;
  state.hoverRelic = relicIndexAt(point);
  state.hoverEnd = false;
  state.hoverSkip = false;
  state.hoverPlayAgain = false;
  state.hoverEnemy = enemyIndexAt(point);
  if (state.scene === 'battle') {
    state.hoverCard = handIndexAt(point);
    state.hoverEnd = inside(point, HIT.endTurn);
  } else if (state.scene === 'reward') {
    state.hoverCard = rewardIndexAt(point);
    state.hoverSkip = inside(point, HIT.skip) || (point.y > 586 && point.y < 626);
  } else if (state.scene === 'end') {
    state.hoverPlayAgain = inside(point, HIT.playAgain);
  }
}

function click(point) {
  initAudio();
  switch (state.scene) {
    case 'title': {
      beginRun(freshSeed());
      playSound('click');
      return;
    }
    case 'battle': {
      const enemy = enemyIndexAt(point);
      if (enemy >= 0) {
        selectTarget(enemy);
        playSound('click');
        return;
      }
      if (inside(point, HIT.endTurn)) {
        endTurn();
        return;
      }
      const index = handIndexAt(point);
      if (index >= 0) {
        playCard(index);
        return;
      }
      return;
    }
    case 'reward': {
      const index = rewardIndexAt(point);
      if (index >= 0) {
        takeReward(index);
        return;
      }
      if (inside(point, HIT.skip) || (point.y > 586 && point.y < 626)) {
        skipReward();
        return;
      }
      return;
    }
    case 'end': {
      if (inside(point, HIT.playAgain)) {
        restartRun(freshSeed());
        return;
      }
      return;
    }
    default:
      goTitle();
  }
}

function freshSeed() {
  return Math.floor(Math.random() * 0x7fffffff) || 7;
}

function key(event) {
  const tag = event.key;
  if (tag === 'm' || tag === 'M') {
    const muted = toggleMute();
    state.muted = muted;
    return;
  }
  if (state.scene === 'title') {
    if (tag === 'Enter' || tag === ' ' || tag === 'r' || tag === 'R') {
      initAudio();
      beginRun(freshSeed());
    }
    return;
  }
  if (tag === 'r' || tag === 'R') {
    restartRun(freshSeed());
    return;
  }
  if (state.scene === 'battle') {
    if (tag === ' ' || tag === 'Spacebar') {
      event.preventDefault();
      endTurn();
      return;
    }
    const digit = Number(tag);
    if (Number.isInteger(digit) && digit >= 1 && digit <= 9) {
      const index = digit - 1;
      if (index < state.hand.length) playCard(index);
    }
    return;
  }
  if (state.scene === 'reward') {
    const digit = Number(tag);
    if (Number.isInteger(digit) && digit >= 1 && digit <= 3 && digit <= state.rewardChoices.length) {
      takeReward(digit - 1);
      return;
    }
    if (tag === 's' || tag === 'S' || tag === ' ') {
      event.preventDefault();
      skipReward();
    }
    return;
  }
  if (state.scene === 'end') {
    if (tag === 'Enter' || tag === ' ') {
      event.preventDefault();
      restartRun(freshSeed());
    }
  }
}

export function bindInput(canvas) {
  canvas.addEventListener('pointermove', (event) => {
    refreshHover(toLogical(canvas, event));
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(canvas, event);
    refreshHover(point);
    click(point);
  });
  canvas.addEventListener('pointerleave', () => {
    state.hoverCard = -1;
    state.hoverRelic = -1;
    state.hoverEnd = false;
    state.hoverSkip = false;
    state.hoverPlayAgain = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('keydown', key);
}
