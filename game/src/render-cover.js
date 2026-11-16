// The cover. It has one job: someone who has never seen this game should be able to tell, from this
// frame alone, what it is, how you win, and how much of it there is. So it is a contents page with a
// scene behind it, not a logo with a button. Every count on it is read from the game itself.
import { PALETTE } from './config.js';
import { paintText, hexBox, roundRect, glow, combField, drawBee, drawIntentIcon } from './art.js';
import { state } from './state.js';
import { CARDS } from './cards.js';
import { RELICS } from './relics.js';
import { ASCENSIONS } from './ascension.js';
import { ENEMY_ORDER, BOSS_ORDER } from './enemies.js';
import { OMENS } from './omens.js';
import { ACTS, LAST_FLOOR } from './floors.js';

const ROAD = [
  { name: 'HUNT', tag: 'press on, one card', icon: 'sword', tint: PALETTE.leaf },
  { name: 'RAID', tag: 'an elite, a relic', icon: 'alert', tint: PALETTE.blood },
  { name: 'MARKET', tag: 'spend amber', icon: 'hand', tint: PALETTE.honey },
  { name: 'CAMP', tag: 'mend or temper', icon: 'cross', tint: PALETTE.steel },
  { name: 'OMEN', tag: 'two answers', icon: 'drop', tint: '#a86a9c' },
];

const BOSS_LINES = ['THE HORNET GENERAL', 'THE WAX WARDEN', 'THE BUMBLE QUEEN'];

function backdrop(ctx) {
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, 1280, 720);
  const core = ctx.createLinearGradient(0, 0, 0, 720);
  core.addColorStop(0, 'rgba(46, 31, 12, 0.9)');
  core.addColorStop(0.55, 'rgba(20, 13, 5, 1)');
  core.addColorStop(1, 'rgba(8, 5, 2, 1)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 1280, 720);
  combField(ctx, 1280, 760, 52, {
    stroke: 'rgba(242,181,68,0.05)',
    fill: 'rgba(242,181,68,0.016)',
    fillEvery: 6,
  });
  glow(ctx, 640, 96, 420, 'rgba(242, 181, 68, 0.13)', 1);
  glow(ctx, 220, 620, 320, 'rgba(127, 166, 184, 0.07)', 0.8);
  const vig = ctx.createRadialGradient(640, 340, 360, 640, 360, 780);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(2, 2, 3, 0.68)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 1280, 720);
  for (let i = 0; i < 2; i += 1) {
    const x = 1080 + Math.sin(state.time * 0.5 + i * 2.2) * 32 - i * 26;
    const y = 96 + i * 52 + Math.cos(state.time * 0.4 + i) * 12;
    drawBee(ctx, x, y, 15 - i * 3, PALETTE.amber, state.time * 10 + i, 0.42 - i * 0.1);
  }
}

function titleBlock(ctx) {
  paintText(
    ctx,
    `A DECKBUILDING CLIMB  ·  ${ACTS.length} ACTS  ·  ${LAST_FLOOR} FLOORS  ·  ${ASCENSIONS.length} SITTINGS`,
    640,
    46,
    { align: 'center', size: 13, weight: 700, color: 'rgba(201, 168, 106, 0.78)', spacing: 3 },
  );
  paintText(ctx, 'HIVE LEDGER', 640, 104, {
    align: 'center',
    size: 58,
    weight: 900,
    color: PALETTE.honey,
    spacing: 5,
    shadow: 'rgba(0,0,0,0.9)',
    shadowBlur: 24,
  });
  paintText(ctx, 'hold the last comb against the swarm, one card at a time', 640, 134, {
    align: 'center',
    size: 17,
    color: PALETTE.body,
  });
}

function rulePair(ctx) {
  const y = 160;
  const w = 520;
  const left = 68;
  const right = 1280 - 68 - w;

  roundRect(ctx, left, y, w, 62, 10);
  ctx.fillStyle = 'rgba(28, 44, 20, 0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(184, 217, 74, 0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, left, y, w, 62, 10);
  ctx.stroke();
  paintText(ctx, 'WIN', left + 20, y + 26, { size: 15, weight: 900, color: PALETTE.leaf, spacing: 3 });
  paintText(ctx, `hold all ${LAST_FLOOR} floors and put the Bumble Queen down`, left + 20, y + 48, {
    size: 15,
    color: '#d9e8b4',
  });

  roundRect(ctx, right, y, w, 62, 10);
  ctx.fillStyle = 'rgba(52, 20, 14, 0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(216, 70, 47, 0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, right, y, w, 62, 10);
  ctx.stroke();
  paintText(ctx, 'LOSE', right + 20, y + 26, { size: 15, weight: 900, color: PALETTE.blood, spacing: 3 });
  paintText(ctx, 'your swarm hits zero, on any floor', right + 20, y + 48, { size: 15, color: '#e8bdb2' });
}

function panel(ctx, x, y, w, h, label) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = 'rgba(26, 18, 8, 0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(122, 96, 52, 0.45)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  paintText(ctx, label, x + 20, y + 30, {
    size: 12,
    weight: 700,
    color: 'rgba(201, 168, 106, 0.85)',
    spacing: 3,
  });
}

function roadPanel(ctx, x, y, w, h) {
  panel(ctx, x, y, w, h, 'THE ROAD BETWEEN FLOORS');
  ROAD.forEach((node, index) => {
    const cy = y + 62 + index * 40;
    hexBox(ctx, x + 34, cy, 16, 'rgba(16, 10, 4, 0.9)', node.tint, 1.2);
    drawIntentIcon(ctx, node.icon, x + 34, cy, 13, node.tint);
    paintText(ctx, node.name, x + 60, cy + 6, { size: 15, weight: 700, color: node.tint, spacing: 1 });
    paintText(ctx, node.tag, x + 156, cy + 6, { size: 14, color: PALETTE.dim });
  });
  paintText(ctx, 'after every floor you pick one of these', x + 20, y + h - 18, {
    size: 13,
    color: PALETTE.faint,
  });
}

function bossPanel(ctx, x, y, w, h) {
  panel(ctx, x, y, w, h, 'THREE ACTS, THREE KEEPERS');
  ACTS.forEach((act, index) => {
    const cy = y + 68 + index * 58;
    paintText(ctx, `ACT ${act.act}`, x + 20, cy, { size: 12, weight: 700, color: PALETTE.faint, spacing: 2 });
    paintText(ctx, act.tag, x + 76, cy, { size: 13, color: PALETTE.dim });
    paintText(ctx, BOSS_LINES[index], x + 20, cy + 26, {
      size: 17,
      weight: 700,
      color: index === 2 ? PALETTE.blood : PALETTE.honey,
      spacing: 1,
    });
    paintText(ctx, `floor ${act.bossFloor}`, x + w - 20, cy + 26, {
      align: 'right',
      size: 13,
      color: PALETTE.faint,
    });
  });
}

// The sitting panel doubles as the difficulty picker: what you read is what you press.
const SIT = { x: 0, y: 240, w: 356, h: 296, rowTop: 288, rowH: 46 };

export function coverSittingRect(index) {
  const left = (1280 - (SIT.w * 3 + 26 * 2)) / 2;
  return { x: left + (SIT.w + 26) * 2 + 8, y: SIT.rowTop + index * SIT.rowH, w: SIT.w - 16, h: SIT.rowH - 4 };
}

function sittingPanel(ctx, x, y, w, h) {
  panel(ctx, x, y, w, h, 'FOUR SITTINGS · PICK ONE');
  ASCENSIONS.forEach((sitting, index) => {
    const rect = coverSittingRect(index);
    const picked = state.ascension === index;
    if (picked) {
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
      ctx.fillStyle = 'rgba(74, 52, 18, 0.85)';
      ctx.fill();
      ctx.strokeStyle = PALETTE.honey;
      ctx.lineWidth = 1.2;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
      ctx.stroke();
    }
    const cy = y + 64 + index * 48;
    paintText(ctx, `${index + 1}`, x + 20, cy + 4, {
      size: 13,
      weight: 700,
      color: picked ? PALETTE.amber : PALETTE.faint,
    });
    paintText(ctx, sitting.name, x + 40, cy + 4, {
      size: 15,
      weight: 700,
      color: picked ? PALETTE.wax : index === 0 ? PALETTE.body : PALETTE.honey,
      spacing: 0.5,
    });
    paintText(ctx, sitting.note, x + 40, cy + 24, { size: 12, color: picked ? PALETTE.body : PALETTE.dim });
  });
}

function footer(ctx) {
  const w = 300;
  const h = 52;
  const x = 640 - w / 2;
  const y = 566;
  const pulse = 0.6 + Math.sin(state.time * 2.1) * 0.28;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = `rgba(242, 181, 68, ${0.14 + pulse * 0.16})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 212, 121, ${0.55 + pulse * 0.3})`;
  ctx.lineWidth = 1.6;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  paintText(ctx, 'CLICK TO BEGIN', 640, y + 26, {
    align: 'center',
    size: 20,
    weight: 900,
    color: PALETTE.wax,
    spacing: 3,
  });
  paintText(ctx, 'or press ENTER', 640, y + 44, { align: 'center', size: 12, color: PALETTE.faint });

  const counts = [
    `${LAST_FLOOR} FLOORS`,
    `${BOSS_ORDER.length} BOSSES`,
    `${ENEMY_ORDER.length} RAIDERS`,
    `${CARDS.length} CARDS`,
    '5 SUITS',
    `${RELICS.length} RELICS`,
    `${OMENS.length} OMENS`,
  ].join('   ·   ');
  paintText(ctx, counts, 640, 648, {
    align: 'center',
    size: 15,
    weight: 700,
    color: PALETTE.body,
    spacing: 1,
  });
  paintText(ctx, 'every card, raider and sound drawn or synthesised in code  ·  R restarts at any time', 640, 680, {
    align: 'center',
    size: 13,
    color: PALETTE.faint,
  });
}

export function drawTitleScene(ctx) {
  backdrop(ctx);
  titleBlock(ctx);
  rulePair(ctx);

  const top = 240;
  const height = 296;
  const width = 356;
  const gap = 26;
  const left = (1280 - (width * 3 + gap * 2)) / 2;
  roadPanel(ctx, left, top, width, height);
  bossPanel(ctx, left + width + gap, top, width, height);
  sittingPanel(ctx, left + (width + gap) * 2, top, width, height);

  footer(ctx);
}
