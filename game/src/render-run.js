// The four rooms between fights: the fork, the market, the camp and the omen. Each one is a single
// frame with one question on it, drawn from the same primitives as the battle screen so a run never
// looks like it wandered into a different game.
import { PALETTE } from './config.js';
import { paintText, textWidth, hexBox, roundRect, glow, combField, drawIntentIcon, drawRelicGlyph } from './art.js';
import { drawRewardCard } from './render-cards.js';
import { state } from './state.js';
import { CARDS_BY_ID } from './cards.js';
import { RELICS_BY_ID } from './relics.js';
import { ascensionOf } from './ascension.js';
import { actOf, floorLine } from './floors.js';

const NODE_ICON = { hunt: 'sword', raid: 'alert', market: 'hand', camp: 'cross', omen: 'drop' };
const NODE_TINT = {
  hunt: PALETTE.leaf,
  raid: PALETTE.blood,
  market: PALETTE.honey,
  camp: PALETTE.steel,
  omen: '#a86a9c',
};
const RISK_COLOR = { LOW: PALETTE.leaf, HIGH: PALETTE.blood, NONE: PALETTE.dim, ODDS: PALETTE.amber };

// ---- shared furniture ------------------------------------------------------------------------

function sideBoard(ctx) {
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, 1280, 720);
  const core = ctx.createRadialGradient(640, 330, 60, 640, 360, 720);
  core.addColorStop(0, 'rgba(38, 26, 10, 0.95)');
  core.addColorStop(1, 'rgba(8, 5, 2, 1)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 1280, 720);
  combField(ctx, 1280, 760, 54, { stroke: 'rgba(242,181,68,0.055)', fill: 'rgba(242,181,68,0.016)', fillEvery: 6 });
  const vig = ctx.createRadialGradient(640, 360, 320, 640, 360, 760);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(2, 2, 3, 0.62)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 1280, 720);
}

function header(ctx, kicker, title, sub) {
  paintText(ctx, kicker, 640, 62, {
    align: 'center',
    size: 12,
    weight: 700,
    color: 'rgba(201, 168, 106, 0.7)',
    spacing: 4,
  });
  paintText(ctx, title, 640, 112, {
    align: 'center',
    size: 40,
    weight: 700,
    color: PALETTE.honey,
    shadow: 'rgba(0,0,0,0.85)',
    shadowBlur: 18,
  });
  if (sub) {
    paintText(ctx, sub, 640, 142, { align: 'center', size: 15, color: PALETTE.dim });
  }
}

function footer(ctx, hint) {
  paintText(ctx, hint, 640, 688, { align: 'center', size: 13, color: PALETTE.dim });
}

/** The three numbers that matter outside a fight, in one line under the cards. */
function runStrip(ctx, y) {
  const sitting = ascensionOf(state.ascension);
  const parts = [
    `SWARM ${Math.max(0, state.swarm)} / ${state.swarmMax}`,
    `AMBER ${state.coins}`,
    `DECK ${state.deck.length}`,
    `RELICS ${state.relics.length}`,
    sitting.name,
  ];
  const text = parts.join('   ·   ');
  paintText(ctx, text, 640, y, { align: 'center', size: 14, weight: 700, color: PALETTE.body, spacing: 1 });
}

function amberChip(ctx, x, y, value) {
  const w = 128;
  roundRect(ctx, x - w / 2, y - 20, w, 40, 8);
  ctx.fillStyle = 'rgba(64, 44, 12, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 181, 68, 0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  paintText(ctx, `◈ ${value}`, x, y + 7, { align: 'center', size: 19, weight: 700, color: PALETTE.honey });
}

// ---- the fork ---------------------------------------------------------------------------------

const PATH = { x0: 116, y: 208, w: 320, h: 372, gap: 44 };

export function pathCardRect(index) {
  return { x: PATH.x0 + index * (PATH.w + PATH.gap), y: PATH.y, w: PATH.w, h: PATH.h };
}

function doorCard(ctx, node, index) {
  const rect = pathCardRect(index);
  const hover = state.pathPicked === -1 && state.hoverCard === index;
  const tint = NODE_TINT[node.id] || PALETTE.body;
  ctx.save();
  if (hover) {
    ctx.shadowColor = tint;
    ctx.shadowBlur = 26;
  }
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.fillStyle = hover ? 'rgba(48, 33, 13, 0.98)' : 'rgba(30, 21, 9, 0.96)';
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = hover ? tint : 'rgba(122, 96, 52, 0.55)';
  ctx.lineWidth = hover ? 2 : 1;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.stroke();

  // the top band carries the door's colour so the three read apart at a glance
  ctx.fillStyle = tint;
  ctx.globalAlpha = hover ? 0.95 : 0.7;
  roundRect(ctx, rect.x, rect.y, rect.w, 5, 3);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cx = rect.x + rect.w / 2;
  hexBox(ctx, cx, rect.y + 62, 32, 'rgba(18, 12, 5, 0.9)', tint, 1.4);
  drawIntentIcon(ctx, NODE_ICON[node.id] || 'sword', cx, rect.y + 62, 26, tint);

  paintText(ctx, node.name, cx, rect.y + 128, {
    align: 'center',
    size: 26,
    weight: 700,
    color: hover ? PALETTE.wax : PALETTE.honey,
    spacing: 2,
  });
  paintText(ctx, node.tag, cx, rect.y + 156, { align: 'center', size: 14, color: PALETTE.dim });

  ctx.strokeStyle = 'rgba(122, 96, 52, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rect.x + 34, rect.y + 178);
  ctx.lineTo(rect.x + rect.w - 34, rect.y + 178);
  ctx.stroke();

  paintText(ctx, node.detail, cx, rect.y + 210, { align: 'center', size: 15, color: PALETTE.body });
  paintText(ctx, `RISK ${node.risk}`, cx, rect.y + 244, {
    align: 'center',
    size: 13,
    weight: 700,
    color: RISK_COLOR[node.risk] || PALETTE.dim,
    spacing: 2,
  });

  // the foot: what pressing it actually does
  const footY = rect.y + rect.h - 54;
  roundRect(ctx, rect.x + 30, footY, rect.w - 60, 40, 8);
  ctx.fillStyle = hover ? tint : 'rgba(58, 42, 18, 0.85)';
  ctx.globalAlpha = hover ? 0.9 : 1;
  ctx.fill();
  ctx.globalAlpha = 1;
  paintText(ctx, `[ ${index + 1} ]  TAKE IT`, cx, footY + 26, {
    align: 'center',
    size: 13,
    weight: 700,
    color: hover ? PALETTE.ink : PALETTE.body,
    spacing: 1,
  });
}

export function drawPathScene(ctx) {
  sideBoard(ctx);
  const act = actOf(state.floor);
  header(
    ctx,
    `FLOOR ${state.floor} CLEARED  ·  ACT ${act.act} ${act.name}`,
    'THREE DOORS',
    state.bossBanner ? `ahead: ${state.bossBanner}` : 'choose what the next floor costs you',
  );
  state.pathOptions.forEach((node, index) => doorCard(ctx, node, index));
  runStrip(ctx, 606);
  footer(ctx, 'CLICK a door or press 1–3  ·  R restarts the run  ·  M mutes');
}

// ---- the market -------------------------------------------------------------------------------

const SHOP = { x0: 92, y: 214, w: 208, h: 300, gap: 24 };

export function shopSlotRect(index) {
  return { x: SHOP.x0 + index * (SHOP.w + SHOP.gap), y: SHOP.y, w: SHOP.w, h: SHOP.h };
}

export function shopLeaveRect() {
  return { x: 520, y: 566, w: 240, h: 52 };
}

function slotFace(ctx, slot, index) {
  const rect = shopSlotRect(index);
  const hover = state.shopHover === index;
  const affordable = !slot.sold && state.coins >= slot.price;
  const tint = slot.type === 'relic' ? PALETTE.honey : slot.type === 'mend' ? PALETTE.leaf : PALETTE.steel;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = hover && affordable ? 'rgba(52, 36, 14, 0.98)' : 'rgba(28, 20, 9, 0.95)';
  ctx.fill();
  ctx.strokeStyle = slot.sold ? 'rgba(70, 55, 30, 0.5)' : hover && affordable ? tint : 'rgba(122, 96, 52, 0.5)';
  ctx.lineWidth = hover && affordable ? 2 : 1;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.stroke();

  const cx = rect.x + rect.w / 2;
  if (slot.type === 'card') {
    const card = CARDS_BY_ID[slot.id];
    // the card keeps its own 176x248 shape: squeezing it into the slot made the rule band spill
    if (card) drawRewardCard(ctx, card, -1, cx - 88, rect.y + 14, 176, 248, hover && affordable);
  } else if (slot.type === 'relic') {
    hexBox(ctx, cx, rect.y + 92, 42, 'rgba(18, 12, 5, 0.9)', PALETTE.honey, 1.6);
    const relic = RELICS_BY_ID[slot.id];
    drawRelicGlyph(ctx, relic ? relic.glyph : 'spoon', cx, rect.y + 92, 28, PALETTE.honey);
    paintText(ctx, slot.name, cx, rect.y + 164, {
      align: 'center',
      size: 14,
      weight: 700,
      color: PALETTE.honey,
      spacing: 1,
    });
    const text = relic ? relic.text : '';
    wrapText(ctx, text, cx, rect.y + 190, rect.w - 30, 13, PALETTE.dim, 3);
  } else {
    hexBox(ctx, cx, rect.y + 92, 42, 'rgba(18, 12, 5, 0.9)', PALETTE.leaf, 1.6);
    drawIntentIcon(ctx, 'cross', cx, rect.y + 92, 30, PALETTE.leaf);
    paintText(ctx, slot.name, cx, rect.y + 164, {
      align: 'center',
      size: 14,
      weight: 700,
      color: PALETTE.leaf,
      spacing: 1,
    });
    paintText(ctx, '+14 swarm, right now', cx, rect.y + 192, { align: 'center', size: 13, color: PALETTE.dim });
  }

  const priceY = rect.y + rect.h - 22;
  if (slot.sold) {
    paintText(ctx, 'SOLD', cx, priceY, { align: 'center', size: 15, weight: 700, color: PALETTE.faint, spacing: 3 });
  } else {
    paintText(ctx, `◈ ${slot.price}`, cx, priceY, {
      align: 'center',
      size: 17,
      weight: 700,
      color: affordable ? PALETTE.honey : PALETTE.blood,
    });
  }
}

function wrapText(ctx, text, cx, y, maxWidth, size, color, maxLines) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let row = 0;
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (textWidth(ctx, attempt, size) > maxWidth && line) {
      paintText(ctx, line, cx, y + row * (size + 4), { align: 'center', size, color });
      row += 1;
      line = word;
      if (row >= maxLines) return;
    } else {
      line = attempt;
    }
  }
  if (line && row < maxLines) paintText(ctx, line, cx, y + row * (size + 4), { align: 'center', size, color });
}

export function drawShopScene(ctx) {
  sideBoard(ctx);
  header(ctx, `FLOOR ${state.floor + 1} AHEAD`, 'THE MARKET', 'amber is the one thing you cannot grow back');
  amberChip(ctx, 1080, 92, state.coins);
  state.shopStock.forEach((slot, index) => slotFace(ctx, slot, index));

  const leave = shopLeaveRect();
  const hover = state.shopHover === 99;
  roundRect(ctx, leave.x, leave.y, leave.w, leave.h, 10);
  ctx.fillStyle = hover ? PALETTE.amber : 'rgba(52, 36, 14, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 181, 68, 0.6)';
  ctx.lineWidth = 1;
  roundRect(ctx, leave.x, leave.y, leave.w, leave.h, 10);
  ctx.stroke();
  paintText(ctx, 'LEAVE THE MARKET', leave.x + leave.w / 2, leave.y + 33, {
    align: 'center',
    size: 15,
    weight: 700,
    color: hover ? PALETTE.ink : PALETTE.honey,
    spacing: 2,
  });
  runStrip(ctx, 646);
  footer(ctx, 'CLICK a slot to buy  ·  ENTER leaves  ·  R restarts the run');
}

// ---- the camp ---------------------------------------------------------------------------------

export function campDoorRect(index) {
  const w = 320;
  const gap = 44;
  const total = w * 3 + gap * 2;
  const x = (1280 - total) / 2 + index * (w + gap);
  return { x, y: 182, w, h: 150 };
}

export function campCardRect(index) {
  const w = 196;
  const gap = 30;
  const total = w * 3 + gap * 2;
  const x = (1280 - total) / 2 + index * (w + gap);
  return { x, y: 388, w, h: 172 };
}

function campDoor(ctx, index, title, tag, tint, icon, done) {
  const rect = campDoorRect(index);
  const hover = !state.campDone && state.campHover === index;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = hover ? 'rgba(50, 35, 14, 0.98)' : 'rgba(28, 20, 9, 0.95)';
  ctx.fill();
  ctx.strokeStyle = done ? 'rgba(70, 55, 30, 0.5)' : hover ? tint : 'rgba(122, 96, 52, 0.5)';
  ctx.lineWidth = hover ? 2 : 1;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.stroke();
  const cx = rect.x + rect.w / 2;
  hexBox(ctx, cx, rect.y + 44, 26, 'rgba(18, 12, 5, 0.9)', done ? PALETTE.faint : tint, 1.4);
  drawIntentIcon(ctx, icon, cx, rect.y + 44, 21, done ? PALETTE.faint : tint);
  paintText(ctx, title, cx, rect.y + 96, {
    align: 'center',
    size: 19,
    weight: 700,
    color: done ? PALETTE.faint : PALETTE.honey,
    spacing: 1,
  });
  paintText(ctx, tag, cx, rect.y + 120, { align: 'center', size: 13, color: PALETTE.dim });
  paintText(ctx, done ? 'taken' : `[ ${index + 1} ]`, cx, rect.y + 140, {
    align: 'center',
    size: 12,
    weight: 700,
    color: done ? PALETTE.faint : PALETTE.amber,
    spacing: 1,
  });
}

/** A card as a readable strip: name, suit, and the rule line, at sizes that survive the frame. */
function campPickCard(ctx, card, index) {
  const rect = campCardRect(index);
  const hover = !state.campDone && state.campHover === 30 + index;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fillStyle = hover ? 'rgba(56, 39, 15, 0.98)' : 'rgba(26, 18, 8, 0.95)';
  ctx.fill();
  ctx.strokeStyle = hover ? PALETTE.honey : 'rgba(122, 96, 52, 0.5)';
  ctx.lineWidth = hover ? 2 : 1;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.stroke();

  const cx = rect.x + rect.w / 2;
  paintText(ctx, card.suit.toUpperCase(), cx, rect.y + 26, {
    align: 'center',
    size: 11,
    weight: 700,
    color: PALETTE.dim,
    spacing: 3,
  });
  paintText(ctx, card.name, cx, rect.y + 56, {
    align: 'center',
    size: 18,
    weight: 700,
    color: hover ? PALETTE.wax : PALETTE.honey,
    spacing: 1,
  });
  ctx.strokeStyle = 'rgba(122, 96, 52, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rect.x + 22, rect.y + 72);
  ctx.lineTo(rect.x + rect.w - 22, rect.y + 72);
  ctx.stroke();
  wrapText(ctx, (card.text || []).join(' '), cx, rect.y + 96, rect.w - 32, 12, PALETTE.body, 3);
  paintText(ctx, '+2 TO EVERY NUMBER', cx, rect.y + rect.h - 18, {
    align: 'center',
    size: 11,
    weight: 700,
    color: PALETTE.leaf,
    spacing: 1,
  });
}

export function drawCampScene(ctx) {
  sideBoard(ctx);
  header(ctx, `FLOOR ${state.floor + 1} AHEAD`, 'THE CAMP', 'one quiet hour, and only one');
  campDoor(ctx, 0, 'MEND', '+16 swarm now', PALETTE.leaf, 'cross', state.campDone);
  campDoor(ctx, 1, 'FEED THE COMB', '+1 nectar cap', PALETTE.steel, 'drop', state.campDone);
  campDoor(ctx, 2, 'TEMPER A CARD', 'every number +2', PALETTE.honey, 'sword', state.campDone);

  paintText(ctx, 'TEMPER ONE OF THESE', 640, 366, {
    align: 'center',
    size: 12,
    weight: 700,
    color: 'rgba(201, 168, 106, 0.7)',
    spacing: 3,
  });
  if (!state.campChoices.length) {
    paintText(ctx, 'every card is already tempered', 640, 470, { align: 'center', size: 14, color: PALETTE.dim });
  }
  state.campChoices.forEach((card, index) => campPickCard(ctx, card, index));

  const leave = shopLeaveRect();
  const hover = state.campHover === 99;
  roundRect(ctx, leave.x, leave.y, leave.w, leave.h, 10);
  ctx.fillStyle = state.campDone ? (hover ? PALETTE.amber : 'rgba(52, 36, 14, 0.9)') : 'rgba(34, 24, 11, 0.75)';
  ctx.fill();
  ctx.strokeStyle = state.campDone ? 'rgba(242, 181, 68, 0.6)' : 'rgba(90, 72, 40, 0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, leave.x, leave.y, leave.w, leave.h, 10);
  ctx.stroke();
  paintText(ctx, state.campDone ? 'BREAK CAMP' : 'TAKE ONE THING', leave.x + leave.w / 2, leave.y + 33, {
    align: 'center',
    size: 15,
    weight: 700,
    color: state.campDone ? (hover ? PALETTE.ink : PALETTE.honey) : PALETTE.faint,
    spacing: 2,
  });
  runStrip(ctx, 646);
  footer(ctx, 'CLICK an option  ·  1–3 then a card  ·  ENTER leaves  ·  R restarts');
}

// ---- the omen ---------------------------------------------------------------------------------

export function omenOptionRect(index) {
  const w = 420;
  const x = index === 0 ? 190 : 670;
  return { x, y: 408, w, h: 122 };
}

export function omenContinueRect() {
  return { x: 520, y: 566, w: 240, h: 52 };
}

export function drawOmenScene(ctx) {
  sideBoard(ctx);
  const omen = state.omen;
  header(ctx, `FLOOR ${state.floor + 1} AHEAD`, omen ? omen.name : 'OMEN', 'two answers, one is a price');

  // the sigil stands in the empty middle so the frame has a centre instead of a gap
  if (omen && !state.omenResult) {
    glow(ctx, 640, 240, 210, 'rgba(168, 106, 156, 0.22)', 0.8);
    hexBox(ctx, 640, 240, 56, 'rgba(22, 14, 6, 0.92)', '#a86a9c', 1.6);
    drawIntentIcon(ctx, NODE_ICON.omen, 640, 240, 44, '#c88ab8');
    wrapText(ctx, omen.text, 640, 334, 840, 18, PALETTE.body, 2);
  }

  if (state.omenResult) {
    roundRect(ctx, 300, 300, 680, 150, 12);
    ctx.fillStyle = 'rgba(36, 24, 10, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(242, 181, 68, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    wrapText(ctx, state.omenResult, 640, 350, 620, 17, PALETTE.honey, 3);
    const go = omenContinueRect();
    const hover = state.omenHover === 99;
    roundRect(ctx, go.x, go.y, go.w, go.h, 10);
    ctx.fillStyle = hover ? PALETTE.amber : 'rgba(58, 42, 18, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(242, 181, 68, 0.6)';
    ctx.lineWidth = 1;
    roundRect(ctx, go.x, go.y, go.w, go.h, 10);
    ctx.stroke();
    paintText(ctx, 'WALK ON', go.x + go.w / 2, go.y + 33, {
      align: 'center',
      size: 15,
      weight: 700,
      color: hover ? PALETTE.ink : PALETTE.honey,
      spacing: 2,
    });
    runStrip(ctx, 646);
    footer(ctx, 'ENTER walks on  ·  R restarts the run');
    return;
  }

  if (omen) {
    omen.options.forEach((option, index) => {
      const rect = omenOptionRect(index);
      const hover = state.omenHover === index;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.fillStyle = hover ? 'rgba(52, 36, 14, 0.98)' : 'rgba(28, 20, 9, 0.95)';
      ctx.fill();
      ctx.strokeStyle = hover ? PALETTE.honey : 'rgba(122, 96, 52, 0.5)';
      ctx.lineWidth = hover ? 2 : 1;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.stroke();
      paintText(ctx, option.label, rect.x + 26, rect.y + 44, {
        size: 17,
        weight: 700,
        color: hover ? PALETTE.wax : PALETTE.honey,
        spacing: 1,
      });
      paintText(ctx, option.hint, rect.x + 26, rect.y + 78, { size: 15, color: PALETTE.leaf });
      paintText(ctx, `[ ${index + 1} ]`, rect.x + rect.w - 30, rect.y + 44, {
        align: 'right',
        size: 13,
        weight: 700,
        color: PALETTE.dim,
      });
    });
  }
  runStrip(ctx, 646);
  footer(ctx, 'CLICK an answer or press 1–2  ·  R restarts the run');
}
