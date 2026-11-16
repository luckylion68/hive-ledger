// The ledger strip across the top: floor, relics, nectar, swarm, wax, combo and the end-turn
// reminder. Everything the player must know before choosing a card is on this one line.
import { LAYOUT, PALETTE, RULES, SUITS, font } from './config.js';
import { state } from './state.js';
import { drawNectarDrop, drawRelicGlyph, drawShieldGlyph, hexBox, paintText, roundRect, textWidth } from './art.js';
import { floorTitle, actOf } from './floors.js';

function label(ctx, text, x, y) {
  paintText(ctx, text, x, y, { size: 11, color: PALETTE.dim, spacing: 3, weight: 400 });
}

export function drawHud(ctx, opts = {}) {
  const bar = LAYOUT.hud;
  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, 0, bar.h);
  grad.addColorStop(0, '#171006');
  grad.addColorStop(1, PALETTE.ink);
  ctx.fillStyle = grad;
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  ctx.strokeStyle = PALETTE.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, bar.h - 0.5);
  ctx.lineTo(bar.w, bar.h - 0.5);
  ctx.stroke();

  paintText(ctx, floorTitle(state.floor), LAYOUT.floorLabel.x, LAYOUT.floorLabel.baseline, {
    size: 22,
    weight: 900,
    color: PALETTE.honey,
    spacing: 1,
  });
  // the act rides on the second line: the first is already tight against the relic row
  paintText(ctx, `TURN ${state.turn} · ACT ${actOf(state.floor).act}`, LAYOUT.floorLabel.x + 2, 58, {
    size: 10,
    color: PALETTE.faint,
    spacing: 2,
    mono: true,
  });

  // relics: four slots, filled left to right
  for (let i = 0; i < RULES.relicSlots; i += 1) {
    const cx = LAYOUT.relic.x + i * LAYOUT.relic.step;
    const relic = state.relics[i];
    if (relic) {
      hexBox(ctx, cx, LAYOUT.relic.cy, LAYOUT.relic.r, PALETTE.cell, '#c99a4e', 1.4);
      drawRelicGlyph(ctx, relic.glyph, cx, LAYOUT.relic.cy, LAYOUT.relic.r - 3, PALETTE.honey);
    } else {
      hexBox(ctx, cx, LAYOUT.relic.cy, LAYOUT.relic.r, 'rgba(42,29,12,0.35)', 'rgba(201,154,78,0.22)', 1);
    }
  }

  // nectar
  label(ctx, 'NECTAR', LAYOUT.nectar.labelX, LAYOUT.nectar.labelY);
  const shown = Math.max(state.nectarMax, state.nectar);
  for (let i = 0; i < shown; i += 1) {
    const cx = LAYOUT.nectar.dotX + i * LAYOUT.nectar.dotStep + LAYOUT.nectar.dotR;
    drawNectarDrop(ctx, cx, LAYOUT.nectar.cy, LAYOUT.nectar.dotR, i < state.nectar, SUITS.gather.color);
  }
  paintText(ctx, `${state.nectar}/${state.nectarMax}`, LAYOUT.nectar.dotX + shown * LAYOUT.nectar.dotStep + 6, 49, {
    size: 11,
    mono: true,
    color: PALETTE.body,
  });

  // swarm
  label(ctx, 'SWARM', LAYOUT.swarm.labelX, LAYOUT.swarm.labelY);
  const swarm = LAYOUT.swarm;
  roundRect(ctx, swarm.barX, swarm.barY, swarm.barW, swarm.barH, 3);
  ctx.fillStyle = '#33240f';
  ctx.fill();
  const share = Math.max(0, Math.min(1, state.swarm / state.swarmMax));
  if (share > 0) {
    roundRect(ctx, swarm.barX, swarm.barY, Math.max(3, swarm.barW * share), swarm.barH, 3);
    const fill = ctx.createLinearGradient(swarm.barX, 0, swarm.barX + swarm.barW, 0);
    if (share < 0.35) {
      fill.addColorStop(0, '#8c2a1c');
      fill.addColorStop(1, '#d8462f');
    } else {
      fill.addColorStop(0, '#7d9b2c');
      fill.addColorStop(1, PALETTE.leaf);
    }
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,244,214,0.16)';
  ctx.lineWidth = 1;
  roundRect(ctx, swarm.barX, swarm.barY, swarm.barW, swarm.barH, 3);
  ctx.stroke();
  paintText(ctx, `${state.swarm} / ${state.swarmMax}`, swarm.textX, swarm.baseline, {
    size: 13,
    mono: true,
    color: PALETTE.wax,
  });

  // wax
  drawShieldGlyph(ctx, LAYOUT.wax.hexX, LAYOUT.wax.hexY, LAYOUT.wax.r, '#7fa6b8', state.wax > 0 ? 1 : 0);
  paintText(ctx, String(state.wax), LAYOUT.wax.textX, 47, {
    size: 16,
    weight: 700,
    mono: true,
    color: state.wax > 0 ? '#a9c9d6' : PALETTE.faint,
  });
  paintText(ctx, 'WAX', LAYOUT.wax.textX - 2, 25, { size: 10, color: PALETTE.faint, spacing: 2 });

  // combo
  const combo = LAYOUT.combo;
  const hot = state.combo >= RULES.comboStep;
  roundRect(ctx, combo.x, combo.y, combo.w, combo.h, 6);
  ctx.fillStyle = hot ? '#3a1208' : '#241705';
  ctx.fill();
  ctx.strokeStyle = hot ? 'rgba(216,70,47,0.85)' : 'rgba(58,42,18,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  const pulse = 1 + state.comboPulse * 0.06;
  ctx.save();
  ctx.translate(combo.x + combo.w / 2, combo.y + combo.h / 2);
  ctx.scale(pulse, pulse);
  paintText(ctx, `COMBO ×${state.combo}`, 0, 5, {
    align: 'center',
    size: 14,
    weight: 900,
    mono: true,
    color: hot ? '#ff6a4d' : PALETTE.faint,
  });
  ctx.restore();
  if (state.comboSuit) {
    paintText(ctx, SUITS[state.comboSuit].label, combo.x + combo.w / 2, combo.y + combo.h + 12, {
      align: 'center',
      size: 9,
      color: SUITS[state.comboSuit].color,
      spacing: 2,
    });
  }

  paintText(ctx, 'SPACE end turn', LAYOUT.endHint.x, LAYOUT.endHint.baseline, {
    align: 'right',
    size: 11,
    color: PALETTE.faint,
  });

  ctx.restore();

  if (opts.hoverRelic !== undefined && opts.hoverRelic >= 0 && state.relics[opts.hoverRelic]) {
    drawRelicTip(ctx, state.relics[opts.hoverRelic], LAYOUT.relic.x + opts.hoverRelic * LAYOUT.relic.step);
  }
}

function drawRelicTip(ctx, relic, cx) {
  const w = 250;
  const h = 62;
  const x = Math.max(12, Math.min(1280 - w - 12, cx - w / 2));
  const y = 70;
  ctx.save();
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = 'rgba(18, 12, 5, 0.96)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 154, 78, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  paintText(ctx, relic.name, x + 14, y + 22, { size: 12, weight: 700, color: PALETTE.honey, spacing: 2 });
  ctx.font = font(11);
  wrap(ctx, relic.text, x + 14, y + 40, w - 28, 14);
  ctx.restore();
}

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cursor = y;
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (textWidth(ctx, trial, 11) > maxWidth && line) {
      paintText(ctx, line, x, cursor, { size: 11, color: PALETTE.body });
      line = word;
      cursor += lineHeight;
    } else {
      line = trial;
    }
  }
  if (line) paintText(ctx, line, x, cursor, { size: 11, color: PALETTE.body });
}

export function hudHeight() {
  return LAYOUT.hud.h;
}
