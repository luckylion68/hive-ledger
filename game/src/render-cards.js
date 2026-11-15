// The card face: cost hexagon, illustration, name, two rule lines and the suit band. One drawing
// routine serves the hand (176 wide) and the reward screen (200 wide) by scaling the same design.
import { LAYOUT, PALETTE, RARITY, SUITS, font } from './config.js';
import { paintText, roundRect, hexBox, drawCardArt, combField } from './art.js';

export const CARD_W = 176;
export const CARD_H = 248;

function suitBand(ctx, suit, y) {
  const meta = SUITS[suit];
  const grad = ctx.createLinearGradient(0, y, 0, y + 24);
  grad.addColorStop(0, meta.color);
  grad.addColorStop(1, shade(meta.color, -0.32));
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, CARD_W, 24);
  paintText(ctx, meta.label, CARD_W / 2, y + 16, {
    align: 'center',
    size: 10,
    weight: 700,
    color: meta.ink,
    spacing: 3,
  });
  paintText(ctx, meta.cn, 10, y + 16, { size: 11, weight: 700, color: meta.ink, alpha: 0.75 });
}

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((value >> 16) & 255) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, (value & 255) + Math.round(255 * amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawCard(ctx, card, x, y, opts = {}) {
  const scale = opts.scale || 1;
  const hover = Boolean(opts.hover);
  const playable = opts.playable !== false;
  const glow = opts.glow || (RARITY[card.rarity] ? RARITY[card.rarity].glow : null);
  const lift = hover ? -16 : 0;

  ctx.save();
  ctx.translate(x, y + lift);
  ctx.scale(scale, scale);
  if (hover) {
    ctx.translate(-4, 0);
    ctx.scale(1.03, 1.03);
  }

  // rarity light: the same three colours the reward screen uses
  if (glow) {
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = hover ? 34 : 18;
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    roundRect(ctx, 0, 0, CARD_W, CARD_H, 10);
    ctx.stroke();
    ctx.restore();
  }

  const face = ctx.createLinearGradient(0, 0, 0, CARD_H);
  face.addColorStop(0, hover ? '#33240f' : '#2b1d0b');
  face.addColorStop(1, '#170f05');
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 10);
  ctx.fillStyle = face;
  ctx.fill();
  ctx.strokeStyle = hover ? SUITS[card.suit].color : 'rgba(242, 181, 68, 0.42)';
  ctx.lineWidth = hover ? 2 : 1.3;
  ctx.stroke();

  // comb texture in the two corners keeps the card in the same world as the board
  ctx.save();
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 10);
  ctx.clip();
  ctx.globalAlpha = 0.35;
  ctx.translate(-18, -6);
  combField(ctx, CARD_W + 60, 120, 15, { stroke: 'rgba(255,212,121,0.09)' });
  ctx.globalAlpha = 1;
  ctx.restore();

  drawCardArt(ctx, card.art, card.suit, LAYOUT.card.artX, LAYOUT.card.artY, LAYOUT.card.artW, LAYOUT.card.artH);

  paintText(ctx, card.name, CARD_W / 2, LAYOUT.card.nameY, {
    align: 'center',
    size: 15,
    weight: 700,
    color: PALETTE.wax,
  });

  const lines = card.text.slice(0, 2);
  lines.forEach((line, index) => {
    paintText(ctx, line, CARD_W / 2, LAYOUT.card.ruleY + index * 14, {
      align: 'center',
      size: 11,
      color: '#c9a86a',
    });
  });

  suitBand(ctx, card.suit, LAYOUT.card.bandY);

  // cost hexagon, half off the top-left corner
  hexBox(ctx, 14, 14, 15, PALETTE.ink, PALETTE.amber, 1.6);
  paintText(ctx, String(card.cost), 14, 20, {
    align: 'center',
    size: 17,
    weight: 900,
    mono: true,
    color: playable ? PALETTE.honey : '#d8462f',
  });

  if (!playable) {
    roundRect(ctx, 0, 0, CARD_W, CARD_H, 10);
    ctx.fillStyle = 'rgba(8, 5, 2, 0.55)';
    ctx.fill();
    paintText(ctx, 'NO NECTAR', CARD_W / 2, 205, {
      align: 'center',
      size: 11,
      weight: 700,
      color: '#d8462f',
      spacing: 2,
    });
  }

  if (opts.keyHint) {
    paintText(ctx, String(opts.keyHint), CARD_W - 16, 22, {
      align: 'center',
      size: 12,
      weight: 700,
      mono: true,
      color: 'rgba(255, 244, 214, 0.42)',
    });
  }

  ctx.restore();
}

export function drawRewardCard(ctx, card, index, x, y, w, h, hover) {
  const scale = w / CARD_W;
  drawCard(ctx, card, x + (w - CARD_W * scale) / 2, y + (h - CARD_H * scale) / 2, {
    scale,
    hover,
    playable: true,
    keyHint: index + 1,
  });
}

export function drawCardBack(ctx, x, y, w, h) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#1d1305';
  ctx.fill();
  ctx.strokeStyle = 'rgba(242,181,68,0.3)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.clip();
  ctx.translate(x, y);
  combField(ctx, w, h, 14, { stroke: 'rgba(242,181,68,0.16)' });
  ctx.restore();
}

export function drawSuitLegend(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  Object.keys(SUITS).forEach((key, index) => {
    const meta = SUITS[key];
    hexBox(ctx, index * 58 + 9, 0, 8, meta.color, null, 0);
    paintText(ctx, meta.cn, index * 58 + 9, 4, { align: 'center', size: 9, weight: 700, color: meta.ink });
    paintText(ctx, meta.label, index * 58 + 22, 4, { size: 9, color: '#8a7350', spacing: 1 });
  });
  ctx.restore();
  void font;
}
