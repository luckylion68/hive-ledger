// The board: comb wall behind, three raiders with their intents, the keeper and her bees, the hand
// along the bottom. The title, reward and end screens are painted here too, because they all sit on
// the same comb and reuse the same enemy and card art.
import { LAYOUT, PALETTE, RARITY, RULES, SUITS, font } from './config.js';
import { state } from './state.js';
import {
  combField,
  drawBee,
  drawEnemyBody,
  drawIntentIcon,
  drawKeeper,
  drawRelicGlyph,
  glow,
  hexBox,
  hexPath,
  paintText,
  roundRect,
  textWidth,
} from './art.js';
import { drawHud } from './render-hud.js';
import { drawCard, drawRewardCard } from './render-cards.js';
import { rewardCards } from './scenes.js';
import { floorTitle, floorName } from './floors.js';
import { CARD_W, CARD_H } from './render-cards.js';

const HAND_STEP = CARD_W + LAYOUT.hand.gap;

export function enemySlotX(index, count) {
  if (count <= 1) return 640;
  if (count === 2) return index === 0 ? 470 : 810;
  return LAYOUT.enemy.cx[Math.min(index, 2)];
}

export function handCardRect(index) {
  const x = LAYOUT.hand.startX + index * HAND_STEP;
  return { x, y: LAYOUT.hand.y, w: CARD_W, h: CARD_H };
}

function board(ctx) {
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, 1280, 720);
  combField(ctx, 1280, 760, 46, { stroke: '#241705', lineWidth: 1 });
  glow(ctx, 640, 210, 520, 'rgba(242, 181, 68, 0.12)', 1);
  const floorShade = ctx.createLinearGradient(0, 64, 0, 430);
  floorShade.addColorStop(0, 'rgba(36, 23, 5, 0.85)');
  floorShade.addColorStop(1, 'rgba(18, 12, 5, 0)');
  ctx.fillStyle = floorShade;
  ctx.fillRect(0, 64, 1280, 366);
  // the ledge the keeper stands on
  ctx.strokeStyle = 'rgba(242, 181, 68, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 400);
  ctx.lineTo(1240, 400);
  ctx.stroke();
  const groundGlow = ctx.createLinearGradient(0, 396, 0, 430);
  groundGlow.addColorStop(0, 'rgba(242, 181, 68, 0.08)');
  groundGlow.addColorStop(1, 'rgba(242, 181, 68, 0)');
  ctx.fillStyle = groundGlow;
  ctx.fillRect(40, 396, 1200, 34);
}

function statusTags(ctx, enemy, cx, y) {
  const tags = [];
  if (enemy.wax > 0) tags.push({ text: `WAX ${enemy.wax}`, color: '#7fa6b8' });
  if (enemy.poison > 0) tags.push({ text: `POISON ${enemy.poison}`, color: '#b8d94a' });
  if (enemy.strength > 0) tags.push({ text: `STR ${enemy.strength}`, color: '#d8462f' });
  if (!tags.length) return;
  let width = 0;
  const parts = tags.map((tag) => {
    const w = textWidth(ctx, tag.text, 10, 700, false, 1) + 14;
    width += w + 6;
    return { ...tag, w };
  });
  let x = cx - (width - 6) / 2;
  for (const part of parts) {
    roundRect(ctx, x, y, part.w, 16, 3);
    ctx.fillStyle = 'rgba(18,12,5,0.8)';
    ctx.fill();
    ctx.strokeStyle = part.color;
    ctx.lineWidth = 1;
    ctx.stroke();
    paintText(ctx, part.text, x + part.w / 2, y + 11.5, {
      align: 'center',
      size: 10,
      weight: 700,
      color: part.color,
      spacing: 1,
    });
    x += part.w + 6;
  }
}

function intentBadge(ctx, enemy, cx, y) {
  if (!enemy.intent) return;
  const w = 64;
  const h = 24;
  const x = cx - w / 2;
  roundRect(ctx, x, y - h / 2, w, h, 5);
  ctx.fillStyle = 'rgba(42, 29, 12, 0.92)';
  ctx.fill();
  ctx.strokeStyle = enemy.intent.type === 'attack' ? '#c0392b' : 'rgba(201,154,78,0.65)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  drawIntentIcon(ctx, enemy.intent.icon, x + 16, y, 12, enemy.intent.tint);
  const value = enemy.intent.type === 'attack' ? `${enemy.intent.value}` : `${enemy.intent.value}`;
  paintText(ctx, value, x + 30, y + 5, {
    size: 13,
    weight: 900,
    mono: true,
    color: PALETTE.wax,
  });
  paintText(ctx, enemy.intent.label, x + w - 6, y + 4, {
    align: 'right',
    size: 7,
    color: enemy.intent.tint,
    spacing: 0.6,
  });
}

function drawEnemy(ctx, enemy, index, count) {
  const cx = enemySlotX(index, count);
  const cy = LAYOUT.enemy.cy;
  const r = LAYOUT.enemy.r;
  const dead = enemy.dead || enemy.hp <= 0;
  ctx.save();
  ctx.globalAlpha = dead ? 0.22 : 1;

  if (!dead && enemy.boss) glow(ctx, cx, cy, r * 2.2, 'rgba(216, 70, 47, 0.28)', 1);
  hexPath(ctx, cx, cy, r);
  const inner = ctx.createRadialGradient(cx, cy - 10, 6, cx, cy, r);
  inner.addColorStop(0, 'rgba(42, 29, 12, 0.9)');
  inner.addColorStop(1, 'rgba(18, 12, 5, 0.96)');
  ctx.fillStyle = inner;
  ctx.fill();
  ctx.strokeStyle = dead ? 'rgba(138,115,80,0.5)' : enemy.body;
  ctx.lineWidth = dead ? 1 : 2.2;
  ctx.stroke();

  ctx.save();
  hexPath(ctx, cx, cy, r - 2);
  ctx.clip();
  drawEnemyBody(ctx, enemy.shape, cx, cy + 6, enemy.boss ? 60 : 46, enemy.body, enemy.accent, state.time);
  ctx.restore();

  if (!dead && state.enemies[state.target] === enemy) {
    ctx.strokeStyle = 'rgba(255, 212, 121, 0.9)';
    ctx.lineWidth = 2;
    const gap = r + 8;
    const tick = 12;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * gap, cy + sy * (gap - tick));
      ctx.lineTo(cx + sx * gap, cy + sy * gap);
      ctx.lineTo(cx + sx * (gap - tick), cy + sy * gap);
      ctx.stroke();
    }
  }

  paintText(ctx, enemy.name, cx, LAYOUT.enemy.nameY, {
    align: 'center',
    size: enemy.boss ? 15 : 13,
    weight: 700,
    color: dead ? PALETTE.faint : PALETTE.honey,
    spacing: 2,
  });
  if (!dead) intentBadge(ctx, enemy, cx, LAYOUT.enemy.intentY);

  const barW = 120;
  const barX = cx - barW / 2;
  const barY = cy + LAYOUT.enemy.hpDy;
  roundRect(ctx, barX, barY, barW, 8, 2);
  ctx.fillStyle = '#33240f';
  ctx.fill();
  const share = Math.max(0, enemy.hp / enemy.maxHp);
  if (share > 0) {
    roundRect(ctx, barX, barY, Math.max(2, barW * share), 8, 2);
    const fill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fill.addColorStop(0, '#8c2a1c');
    fill.addColorStop(1, PALETTE.blood);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  paintText(ctx, `${enemy.hp}/${enemy.maxHp}`, cx, barY + 22, {
    align: 'center',
    size: 10,
    mono: true,
    color: dead ? PALETTE.faint : PALETTE.body,
  });

  if (enemy.boss && !dead) {
    paintText(ctx, `PHASE ${enemy.phase}`, cx, barY + 36, {
      align: 'center',
      size: 9,
      weight: 700,
      color: PALETTE.blood,
      spacing: 2,
    });
  }

  statusTags(ctx, enemy, cx, cy + LAYOUT.enemy.tagDy);
  if (dead) {
    paintText(ctx, 'FELLED', cx, cy + 6, {
      align: 'center',
      size: 12,
      weight: 700,
      color: PALETTE.faint,
      spacing: 3,
    });
  }
  ctx.restore();
}

function drawEnemies(ctx) {
  const count = state.enemies.length;
  state.enemies.forEach((enemy, index) => drawEnemy(ctx, enemy, index, count));
}

function drawKeeperArea(ctx) {
  const keeper = LAYOUT.keeper;
  glow(ctx, keeper.x, keeper.y, 74, 'rgba(242, 181, 68, 0.16)', 1);
  drawKeeper(ctx, keeper.x, keeper.y, keeper.r, state.time);
  paintText(ctx, 'THE KEEPER', keeper.x, keeper.labelY, {
    align: 'center',
    size: 10,
    color: PALETTE.dim,
    spacing: 3,
  });
  paintText(ctx, `POISON ${state.poison}`, keeper.x, 396, {
    align: 'center',
    size: 10,
    color: state.poison > 0 ? '#b8d94a' : 'rgba(138,115,80,0.4)',
    spacing: 1.5,
  });

  const shown = Math.min(3, state.bees);
  for (let i = 0; i < shown; i += 1) {
    const spot = LAYOUT.bees[i];
    const bob = Math.sin(state.time * 3 + i * 1.7) * 2;
    hexBox(ctx, spot.x, spot.y + bob, 16, 'rgba(184,217,74,0.16)', '#b8d94a', 1.4);
    drawBee(ctx, spot.x, spot.y + bob, 13, '#b8d94a', state.time * 12 + i);
    paintText(ctx, String(state.bees), spot.x + 20, spot.y + bob + 5, {
      size: 12,
      weight: 700,
      mono: true,
      color: PALETTE.wax,
    });
  }
  if (state.bees > 0) {
    paintText(ctx, `${state.bees} BEE${state.bees > 1 ? 'S' : ''} · ${state.beePower} DMG`, 210, 300, {
      align: 'left',
      size: 10,
      color: PALETTE.faint,
      spacing: 1,
    });
  }
}

function drawHand(ctx) {
  const playable = state.phase === 'player' && state.scene === 'battle';
  state.hand.forEach((card, index) => {
    const rect = handCardRect(index);
    const affordable = card.cost <= state.nectar;
    drawCard(ctx, card, rect.x, rect.y, {
      hover: state.hoverCard === index && playable,
      playable: affordable || !playable,
      keyHint: index + 1,
    });
  });
  if (!state.hand.length) {
    paintText(ctx, 'HAND EMPTY — END THE TURN', 640, LAYOUT.hand.y + 110, {
      align: 'center',
      size: 13,
      color: PALETTE.faint,
      spacing: 3,
    });
  }
}

function drawPiles(ctx) {
  paintText(ctx, `DRAW ${state.drawPile.length}`, 1252, 470, {
    align: 'right',
    size: 10,
    mono: true,
    color: PALETTE.faint,
    spacing: 1,
  });
  paintText(ctx, `DISCARD ${state.discardPile.length}`, 1252, 488, {
    align: 'right',
    size: 10,
    mono: true,
    color: PALETTE.faint,
    spacing: 1,
  });
}

export function drawFloaters(ctx) {
  for (const floater of state.floaters) {
    const t = floater.age / floater.life;
    const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    const y = floater.y - t * 44;
    const x = floater.x + Math.sin(t * 5) * 3 + floater.drift * t * 12;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.font = font(floater.size, 900, true);
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(10, 6, 2, 0.85)';
    ctx.strokeText(floater.text, x, y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, x, y);
    ctx.restore();
  }
}

function footHint(ctx, text) {
  paintText(ctx, text, 640, LAYOUT.footHint.y, {
    align: 'center',
    size: 11,
    color: PALETTE.faint,
  });
}

export function drawBattleScene(ctx) {
  const shake = state.shake;
  ctx.save();
  if (shake > 0.15) {
    ctx.translate(Math.sin(state.time * 72) * shake, Math.cos(state.time * 51) * shake * 0.6);
  }
  board(ctx);
  drawEnemies(ctx);
  drawKeeperArea(ctx);
  ctx.restore();

  drawHud(ctx, { hoverRelic: state.hoverRelic });
  drawHand(ctx);
  drawPiles(ctx);
  drawFloaters(ctx);
  footHint(ctx, 'CLICK a card or press 1–5 · CLICK a foe to aim · SPACE ends the turn · R restarts');
  if (state.toast) {
    paintText(ctx, state.toast.toUpperCase(), 640, 420, {
      align: 'center',
      size: 12,
      weight: 700,
      color: PALETTE.honey,
      spacing: 2,
      alpha: 0.9,
    });
  }
}

export function drawTitleScene(ctx) {
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, 1280, 720);
  combField(ctx, 1280, 760, 52, { stroke: '#241705', fill: 'rgba(42,29,12,0.28)', fillEvery: 7 });
  glow(ctx, LAYOUT.title.combCx, LAYOUT.title.combCy, 380, 'rgba(242, 181, 68, 0.22)', 1);

  // the one lit comb in the middle of the dark
  hexPath(ctx, LAYOUT.title.combCx, LAYOUT.title.combCy, LAYOUT.title.combR);
  const bodyGrad = ctx.createRadialGradient(
    LAYOUT.title.combCx,
    LAYOUT.title.combCy - 40,
    20,
    LAYOUT.title.combCx,
    LAYOUT.title.combCy,
    LAYOUT.title.combR,
  );
  bodyGrad.addColorStop(0, 'rgba(255, 212, 121, 0.2)');
  bodyGrad.addColorStop(1, 'rgba(36, 23, 5, 0.92)');
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = PALETTE.amber;
  ctx.lineWidth = 2;
  ctx.stroke();

  // honey cells inside it
  ctx.save();
  hexPath(ctx, LAYOUT.title.combCx, LAYOUT.title.combCy, LAYOUT.title.combR - 4);
  ctx.clip();
  ctx.translate(LAYOUT.title.combCx - 190, LAYOUT.title.combCy - 170);
  combField(ctx, 380, 360, 26, { stroke: 'rgba(242,181,68,0.14)' });
  ctx.restore();

  const pulse = 0.62 + Math.sin(state.time * 2.2) * 0.32;
  paintText(ctx, 'HIVE LEDGER', LAYOUT.title.combCx, LAYOUT.title.nameY, {
    align: 'center',
    size: 84,
    weight: 900,
    color: PALETTE.honey,
    spacing: 6,
    shadow: 'rgba(0,0,0,0.9)',
    shadowBlur: 22,
  });
  paintText(ctx, 'A deckbuilding defense of the last comb', LAYOUT.title.combCx, LAYOUT.title.subY, {
    align: 'center',
    size: 20,
    weight: 300,
    color: PALETTE.body,
    spacing: 0.5,
  });

  paintText(ctx, 'CLICK TO BEGIN', LAYOUT.title.combCx, LAYOUT.title.beginY, {
    align: 'center',
    size: 22,
    weight: 900,
    color: PALETTE.amber,
    spacing: 4,
    alpha: pulse,
  });
  paintText(ctx, `BEST FLOOR ${state.bestFloor} / ${RULES.floors}`, LAYOUT.title.combCx, LAYOUT.title.bestY, {
    align: 'center',
    size: 12,
    color: PALETTE.dim,
    spacing: 3,
  });

  const keys = ['CLICK a card to play it', '1–5 play by key · SPACE ends the turn', 'R restarts the run'];
  keys.forEach((line, index) => {
    paintText(ctx, line, LAYOUT.title.combCx, LAYOUT.title.keysY[index], {
      align: 'center',
      size: 13,
      color: '#a08a5f',
    });
  });

  paintText(
    ctx,
    'Built from scratch this session · 8 floors · 24+ cards · 8 relics · 8 enemy kinds · sound on',
    LAYOUT.title.combCx,
    LAYOUT.title.footY,
    { align: 'center', size: 11, color: PALETTE.faint },
  );

  // three bees drifting around the comb
  for (let i = 0; i < 3; i += 1) {
    const angle = state.time * (0.5 + i * 0.16) + i * 2.1;
    const rx = 250 + i * 32;
    const x = LAYOUT.title.combCx + Math.cos(angle) * rx;
    const y = LAYOUT.title.combCy + Math.sin(angle * 0.8) * 150;
    drawBee(ctx, x, y, 16 - i * 2, PALETTE.amber, state.time * 14 + i, 0.9);
  }
}

export function drawRewardScene(ctx) {
  drawBattleScene(ctx);
  ctx.fillStyle = 'rgba(10, 6, 2, 0.74)';
  ctx.fillRect(0, 0, 1280, 720);
  const vignette = ctx.createRadialGradient(640, 330, 180, 640, 360, 760);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(8, 5, 2, 0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1280, 720);

  paintText(ctx, `FLOOR ${state.floor} CLEARED`, 640, LAYOUT.reward.titleY, {
    align: 'center',
    size: 40,
    weight: 900,
    color: PALETTE.honey,
    spacing: 3,
  });
  paintText(ctx, 'CHOOSE ONE CARD', 640, LAYOUT.reward.subY, {
    align: 'center',
    size: 12,
    color: PALETTE.body,
    spacing: 4,
  });

  const cards = rewardCards();
  const hoverIndex = state.hoverCard;
  cards.forEach((card, index) => {
    const x = LAYOUT.reward.startX + index * (LAYOUT.reward.cardW + LAYOUT.reward.gap);
    drawRewardCard(ctx, card, index, x, LAYOUT.reward.cardY, LAYOUT.reward.cardW, LAYOUT.reward.cardH, hoverIndex === index);
    if (hoverIndex === index) {
      paintText(ctx, RARITY[card.rarity].label, x + LAYOUT.reward.cardW / 2, LAYOUT.reward.cardY - 14, {
        align: 'center',
        size: 10,
        weight: 700,
        color: RARITY[card.rarity].glow,
        spacing: 3,
      });
    }
  });

  // a small standing record of the run, so the choice has context
  const panelX = 950;
  roundRect(ctx, panelX, 214, 262, 286, 10);
  ctx.fillStyle = 'rgba(26, 18, 8, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,154,78,0.45)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  paintText(ctx, 'THE LEDGER', panelX + 18, 244, { size: 11, weight: 700, color: PALETTE.dim, spacing: 3 });
  const rows = [
    ['FLOOR', `${state.floor} / ${RULES.floors}`],
    ['NEXT', floorName(state.floor + 1)],
    ['DECK', `${state.deck.length} CARDS`],
    ['SWARM', `${state.swarm} / ${state.swarmMax}`],
    ['NECTAR MAX', `${state.nectarMax}`],
  ];
  rows.forEach(([key, value], index) => {
    const y = 276 + index * 34;
    paintText(ctx, key, panelX + 18, y, { size: 10, color: PALETTE.faint, spacing: 2 });
    paintText(ctx, value, panelX + 244, y, {
      align: 'right',
      size: 13,
      weight: 700,
      mono: true,
      color: PALETTE.wax,
    });
  });
  paintText(ctx, 'RELICS', panelX + 18, 458, { size: 10, color: PALETTE.faint, spacing: 2 });
  state.relics.forEach((relic, index) => {
    hexBox(ctx, panelX + 26 + index * 30, 478, 11, PALETTE.cell, '#c99a4e', 1.2);
    drawRelicGlyph(ctx, relic.glyph, panelX + 26 + index * 30, 478, 8, PALETTE.honey);
  });

  const skipY = LAYOUT.reward.skipY;
  const hoverSkip = state.hoverSkip;
  paintText(ctx, 'SKIP — take 5 nectar instead', 640, skipY, {
    align: 'center',
    size: 14,
    color: hoverSkip ? PALETTE.honey : PALETTE.body,
  });
  const width = textWidth(ctx, 'SKIP — take 5 nectar instead', 14);
  ctx.strokeStyle = hoverSkip ? PALETTE.honey : 'rgba(201,168,106,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(640 - width / 2, skipY + 5);
  ctx.lineTo(640 + width / 2, skipY + 5);
  ctx.stroke();
  footHint(ctx, '1 2 3 or CLICK to take a card · S to skip for nectar');
}

export function drawEndScene(ctx) {
  const won = state.outcome === 'win';
  ctx.fillStyle = won ? '#241705' : '#140b06';
  ctx.fillRect(0, 0, 1280, 720);
  combField(ctx, 1280, 760, 54, {
    stroke: won ? 'rgba(242,181,68,0.16)' : 'rgba(216,70,47,0.14)',
    fill: won ? 'rgba(242,181,68,0.05)' : 'rgba(216,70,47,0.04)',
    fillEvery: 5,
  });
  glow(ctx, 640, 330, 460, won ? 'rgba(255,212,121,0.22)' : 'rgba(216,70,47,0.18)', 1);

  paintText(ctx, won ? 'THE HIVE HOLDS' : 'THE COMB IS LOST', 640, LAYOUT.end.titleY, {
    align: 'center',
    size: 72,
    weight: 900,
    color: won ? PALETTE.honey : '#e8604a',
    spacing: 4,
    shadow: 'rgba(0,0,0,0.85)',
    shadowBlur: 24,
  });
  paintText(ctx, won ? 'EIGHT FLOORS, ONE LEDGER, NO DEBTS' : `YOU HELD UNTIL ${floorTitle(Math.max(1, state.floor))}`, 640, 216, {
    align: 'center',
    size: 12,
    color: PALETTE.dim,
    spacing: 4,
  });

  const stats = [
    ['FLOORS', `${state.stats.floorsCleared} / ${RULES.floors}`],
    ['NECTAR GATHERED', String(state.stats.nectarGathered)],
    ['BEST COMBO', `×${state.stats.bestCombo}`],
    ['CARDS PLAYED', String(state.stats.cardsPlayed)],
    ['TURNS', String(state.stats.turns)],
    ['ENEMIES FELLED', String(state.stats.enemiesFelled)],
  ];
  stats.forEach(([key, value], index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = LAYOUT.end.statXs[col];
    const y = LAYOUT.end.statYs[row];
    paintText(ctx, key, x, y, { align: 'center', size: 11, color: PALETTE.dim, spacing: 3 });
    paintText(ctx, value, x, y + 40, {
      align: 'center',
      size: 30,
      weight: 900,
      mono: true,
      color: PALETTE.wax,
    });
    ctx.strokeStyle = 'rgba(242,181,68,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 90, y + 58);
    ctx.lineTo(x + 90, y + 58);
    ctx.stroke();
  });

  const button = LAYOUT.end.button;
  const hover = state.hoverPlayAgain;
  roundRect(ctx, button.x, button.y, button.w, button.h, 10);
  ctx.fillStyle = hover ? 'rgba(242,181,68,0.22)' : 'rgba(42,29,12,0.9)';
  ctx.fill();
  ctx.strokeStyle = PALETTE.amber;
  ctx.lineWidth = 2;
  ctx.stroke();
  paintText(ctx, 'PLAY AGAIN', button.x + button.w / 2, button.y + 40, {
    align: 'center',
    size: 20,
    weight: 900,
    color: PALETTE.honey,
    spacing: 3,
  });
  paintText(ctx, 'R restarts at any time', 640, LAYOUT.end.hintY, {
    align: 'center',
    size: 12,
    color: PALETTE.faint,
  });
  paintText(ctx, `PERSONAL BEST · FLOOR ${state.bestFloor} / ${RULES.floors}`, 640, 656, {
    align: 'center',
    size: 11,
    color: PALETTE.dim,
    spacing: 3,
    mono: true,
  });
  void font;
}
