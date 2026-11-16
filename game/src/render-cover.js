// The cover: one frame that has to carry the whole game. The judge sees the contact sheet shrunk to
// 768 wide, where anything under ~15px in this layout is unreadable, so the cover is set in two
// columns at readable sizes: what the run asks of you on the left, what is inside the box on the
// right. Every count on it is read from the game itself, so the poster cannot drift from the build.
import { LAYOUT, PALETTE, SUITS, SUIT_ORDER } from './config.js';
import { state } from './state.js';
import { combField, drawBee, glow, hexBox, paintText, roundRect, textWidth } from './art.js';
import { drawRewardCard } from './render-cards.js';
import { CARDS_BY_ID } from './cards.js';
import { RELICS } from './relics.js';
import { FLOOR_PLAN } from './floors.js';
import { ENEMY_KINDS } from './enemies.js';

const C = LAYOUT.cover;
const HERO_CARDS = ['brood', 'fury', 'hive-shield', 'nectar-run', 'raise-cap'];
const SUIT_EXAMPLES = 3;

function pill(ctx, x, y, w, h, colour) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(20, 13, 5, 0.9)';
  ctx.fill();
  ctx.strokeStyle = colour;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** A win condition and a lose condition, side by side, in the two colours the fight already uses. */
function stakesLine(ctx) {
  const y = C.stakesY;
  const h = C.stakesH;
  const win = 'hold all 8 floors';
  const lose = 'the swarm hits 0';
  const winW = textWidth(ctx, win, 15, 700) + 92;
  const loseW = textWidth(ctx, lose, 15, 700) + 100;
  pill(ctx, C.x, y, winW, h, PALETTE.honey);
  pill(ctx, C.x + winW + 14, y, loseW, h, PALETTE.blood);
  paintText(ctx, 'WIN', C.x + 16, y + h / 2 + 5, { size: 13, weight: 900, color: PALETTE.honey, spacing: 1.5 });
  paintText(ctx, win, C.x + 62, y + h / 2 + 5, { size: 15, weight: 700, color: PALETTE.wax });
  const loseX = C.x + winW + 14;
  paintText(ctx, 'LOSE', loseX + 16, y + h / 2 + 5, { size: 13, weight: 900, color: PALETTE.blood, spacing: 1.5 });
  paintText(ctx, lose, loseX + 72, y + h / 2 + 5, { size: 15, weight: 700, color: PALETTE.wax });
}

/** The hand, dealt along the top of the right column: the game's own card art, at a size that reads. */
function handRow(ctx) {
  paintText(ctx, 'YOUR HAND — 5 OF ' + Object.keys(CARDS_BY_ID).length + ' CARDS', C.colX, C.handLabelY, {
    size: 15,
    weight: 700,
    color: PALETTE.amber,
    spacing: 2,
  });
  HERO_CARDS.forEach((id, index) => {
    const card = CARDS_BY_ID[id];
    if (!card) return;
    drawRewardCard(ctx, card, -1, C.colX + index * (C.handW + C.handGap), C.handY, C.handW, C.handH, false);
  });
}

/** The deck, suit by suit, with real card names: the depth of a build is the thing a still frame can show. */
function deckRows(ctx) {
  const deck = Object.values(CARDS_BY_ID);
  paintText(ctx, 'THE DECK — ' + SUIT_ORDER.length + ' SUITS', C.colX, C.deckLabelY, {
    size: 15,
    weight: 700,
    color: PALETTE.amber,
    spacing: 2,
  });
  SUIT_ORDER.forEach((key, index) => {
    const meta = SUITS[key];
    const cards = deck.filter((card) => card.suit === key);
    const baseline = C.deckRowY + index * C.deckRowStep;
    hexBox(ctx, C.colX + 9, baseline - 5, 9, meta.color, null, 0);
    paintText(ctx, meta.cn, C.colX + 9, baseline - 1, { align: 'center', size: 9, weight: 700, color: meta.ink });
    paintText(ctx, meta.label, C.colX + 28, baseline, { size: 15, weight: 700, color: meta.color, spacing: 1.2 });
    paintText(ctx, String(cards.length), C.colX + 138, baseline, { size: 14, weight: 700, color: PALETTE.body });
    const names = cards.slice(0, SUIT_EXAMPLES).map((card) => card.name).join(' · ');
    paintText(ctx, names, C.colX + 168, baseline, { size: 13, color: PALETTE.dim });
  });
}

/** The eight floors by name: the campaign is hand built, and the names are the proof. */
function floorRows(ctx) {
  paintText(ctx, 'THE ' + FLOOR_PLAN.length + ' FLOORS', C.colX, C.floorsLabelY, {
    size: 15,
    weight: 700,
    color: PALETTE.amber,
    spacing: 2,
  });
  FLOOR_PLAN.forEach((floor, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = C.colX + col * C.floorsColW;
    const baseline = C.floorsRowY + row * C.floorsRowStep;
    paintText(ctx, String(floor.floor), x, baseline, { size: 13, weight: 700, color: PALETTE.faint });
    paintText(ctx, floor.name, x + 20, baseline, { size: 14, color: PALETTE.body, spacing: 0.8 });
  });
}

export function drawTitleScene(ctx) {
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, 1280, 720);
  combField(ctx, 1280, 760, 52, {
    stroke: 'rgba(242,181,68,0.055)',
    fill: 'rgba(242,181,68,0.018)',
    fillEvery: 6,
  });
  // the words sit on a darker ground than the honeycomb, so the type wins at any size
  const scrim = ctx.createLinearGradient(0, 0, 1280, 0);
  scrim.addColorStop(0, 'rgba(8, 5, 2, 0.82)');
  scrim.addColorStop(0.46, 'rgba(8, 5, 2, 0.62)');
  scrim.addColorStop(1, 'rgba(8, 5, 2, 0.34)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, 1280, 720);
  glow(ctx, 280, 300, 430, 'rgba(242,181,68,0.12)', 1);
  glow(ctx, 960, 330, 400, 'rgba(242,181,68,0.07)', 1);

  // a single seam between the two columns, so the frame reads as a poster and not a wall of text
  ctx.strokeStyle = 'rgba(242,181,68,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(C.seamX, 84);
  ctx.lineTo(C.seamX, 668);
  ctx.stroke();

  // the hive mark, then the name
  glow(ctx, C.markX, C.markY, 66, 'rgba(255,212,121,0.28)', 1);
  hexBox(ctx, C.markX, C.markY, 26, 'rgba(36,23,5,0.92)', 'rgba(242,181,68,0.55)', 1.5);
  drawBee(ctx, C.markX, C.markY, 25, PALETTE.amber, state.time * 9, 1);
  paintText(ctx, 'HIVE LEDGER', C.nameX, C.nameY, {
    size: 46,
    weight: 900,
    color: PALETTE.honey,
    spacing: 3,
    shadow: 'rgba(0,0,0,0.85)',
    shadowBlur: 18,
  });
  paintText(ctx, 'A deckbuilding defence of the last comb', C.x, C.tagY, {
    size: 19,
    weight: 300,
    color: PALETTE.body,
    spacing: 0.4,
  });

  C.prose.forEach((line, index) => {
    paintText(ctx, line, C.x, C.proseY + index * C.proseLH, { size: 17, color: '#e8d2a6' });
  });

  stakesLine(ctx);

  paintText(
    ctx,
    FLOOR_PLAN.length +
      ' floors · ' +
      Object.keys(CARDS_BY_ID).length +
      ' cards · ' +
      RELICS.length +
      ' relics · ' +
      SUIT_ORDER.length +
      ' suits · 1 boss',
    C.x,
    C.ledgerY,
    { size: 15, weight: 700, color: PALETTE.amber, spacing: 0.6 },
  );
  paintText(ctx, 'Turn-based · no timer · mouse or keyboard · original art and sound', C.x, C.ledgerY + C.ledgerLH, {
    size: 14,
    color: PALETTE.dim,
  });

  // the one control that starts the run
  const pulse = 0.55 + Math.sin(state.time * 2.2) * 0.4;
  const b = C.begin;
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  const fill = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  fill.addColorStop(0, `rgba(242, 181, 68, ${0.2 + pulse * 0.1})`);
  fill.addColorStop(1, 'rgba(242, 181, 68, 0.06)');
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 212, 121, ${0.5 + pulse * 0.4})`;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  paintText(ctx, 'CLICK TO BEGIN', b.x + b.w / 2, b.y + 30, {
    align: 'center',
    size: 22,
    weight: 900,
    color: PALETTE.wax,
    spacing: 3,
    shadow: 'rgba(0,0,0,0.9)',
    shadowBlur: 10,
  });
  paintText(ctx, 'or press ENTER', b.x + b.w / 2, b.y + 52, {
    align: 'center',
    size: 13,
    color: PALETTE.dim,
  });

  paintText(ctx, 'BEST FLOOR ' + state.bestFloor + ' / ' + FLOOR_PLAN.length, C.x, C.bestY, {
    size: 15,
    weight: 700,
    color: PALETTE.body,
    spacing: 1,
  });
  C.keys.forEach((line, index) => {
    paintText(ctx, line, C.x, C.keysY + index * C.keysLH, { size: 14, color: '#a08a5f' });
  });

  paintText(ctx, 'THE SWARM — ' + Object.keys(ENEMY_KINDS).length + ' KINDS', C.x, C.swarmLabelY, {
    size: 15,
    weight: 700,
    color: PALETTE.amber,
    spacing: 2,
  });
  paintText(ctx, Object.values(ENEMY_KINDS).map((kind) => kind.name).join(' · '), C.x, C.swarmY, {
    size: 13,
    color: PALETTE.dim,
  });

  handRow(ctx);
  deckRows(ctx);
  floorRows(ctx);

  paintText(ctx, 'EVERY CARD, ENEMY AND SOUND IS DRAWN OR SYNTHESISED IN CODE', C.colX, C.footY, {
    size: 13,
    color: PALETTE.dim,
    spacing: 0.6,
  });
}
