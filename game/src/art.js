// Everything you see is drawn here: hexagons, bees, the comb field, intent icons, relic glyphs and
// the little card illustrations. No image files, so the whole game is one download of text.
import { PALETTE, SUITS, font } from './config.js';

export function hexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function hexBox(ctx, cx, cy, r, fill, stroke, lineWidth = 1.5) {
  hexPath(ctx, cx, cy, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function paintText(ctx, str, x, y, opts = {}) {
  ctx.save();
  ctx.font = font(opts.size || 14, opts.weight || 400, Boolean(opts.mono));
  ctx.fillStyle = opts.color || PALETTE.body;
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.baseline || 'alphabetic';
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.spacing && 'letterSpacing' in ctx) ctx.letterSpacing = `${opts.spacing}px`;
  if (opts.shadow) {
    ctx.shadowColor = opts.shadow;
    ctx.shadowBlur = opts.shadowBlur || 10;
    ctx.shadowOffsetY = opts.shadowOffsetY || 0;
  }
  ctx.fillText(str, x, y);
  if (opts.spacing && 'letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.restore();
}

export function textWidth(ctx, str, size, weight = 400, mono = false, spacing = 0) {
  ctx.save();
  ctx.font = font(size, weight, mono);
  const width = ctx.measureText(str).width + spacing * Math.max(0, str.length - 1);
  ctx.restore();
  return width;
}

/** The honeycomb that every screen of this game stands on. */
export function combField(ctx, width, height, radius, opts = {}) {
  const stepX = Math.sqrt(3) * radius;
  const stepY = radius * 1.5;
  const stroke = opts.stroke || '#241705';
  const fill = opts.fill || null;
  const alpha = opts.alpha === undefined ? 1 : opts.alpha;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = opts.lineWidth || 1;
  let row = 0;
  for (let y = -radius; y < height + radius; y += stepY) {
    const offset = row % 2 === 0 ? 0 : stepX / 2;
    for (let x = -radius; x < width + radius; x += stepX) {
      hexPath(ctx, x + offset, y, radius * 0.98);
      if (fill && opts.fillEvery && (row + Math.floor(x / stepX)) % opts.fillEvery === 0) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    row += 1;
  }
  ctx.restore();
}

export function glow(ctx, x, y, radius, color, strength = 0.5) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.05, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBee(ctx, x, y, size, color, flap = 0, alpha = 1) {
  const s = size / 10;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  // wings first, so the body sits on top of them
  ctx.fillStyle = 'rgba(255, 244, 214, 0.2)';
  const wingLift = Math.sin(flap) * 0.35;
  ctx.beginPath();
  ctx.ellipse(-2 * s, -4.2 * s, 3.4 * s, 1.7 * s, -0.55 + wingLift, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2.6 * s, -4 * s, 3.1 * s, 1.6 * s, 0.45 - wingLift, 0, Math.PI * 2);
  ctx.fill();
  // abdomen
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.5 * s, 2.4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // stripes
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.5 * s, 2.4 * s, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(20, 12, 4, 0.78)';
  ctx.fillRect(-1.6 * s, -2.6 * s, 0.9 * s, 5.2 * s);
  ctx.fillRect(0.6 * s, -2.6 * s, 0.9 * s, 5.2 * s);
  ctx.restore();
  // head
  ctx.fillStyle = '#241705';
  ctx.beginPath();
  ctx.arc(-3.4 * s, 0, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();
  // antennae
  ctx.strokeStyle = '#241705';
  ctx.lineWidth = Math.max(1, 0.3 * s);
  ctx.beginPath();
  ctx.moveTo(-3.8 * s, -0.6 * s);
  ctx.quadraticCurveTo(-5 * s, -2.4 * s, -6 * s, -1.4 * s);
  ctx.moveTo(-3.6 * s, 0.8 * s);
  ctx.quadraticCurveTo(-4.8 * s, 2.2 * s, -5.8 * s, 1.6 * s);
  ctx.stroke();
  // stinger
  ctx.fillStyle = '#120c05';
  ctx.beginPath();
  ctx.moveTo(3.4 * s, -0.5 * s);
  ctx.lineTo(5.4 * s, 0);
  ctx.lineTo(3.4 * s, 0.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** The keeper: a masked, hooded figure with a bee's silhouette and a ledger under one arm. */
export function drawKeeper(ctx, cx, cy, r, time = 0) {
  ctx.save();
  hexPath(ctx, cx, cy, r);
  const body = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  body.addColorStop(0, '#3a2a12');
  body.addColorStop(1, '#241705');
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = PALETTE.amber;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  hexPath(ctx, cx, cy, r - 3);
  ctx.clip();
  // hood
  ctx.fillStyle = '#120c05';
  ctx.beginPath();
  ctx.moveTo(cx - 19, cy + 24);
  ctx.quadraticCurveTo(cx - 22, cy - 16, cx, cy - 26);
  ctx.quadraticCurveTo(cx + 22, cy - 16, cx + 19, cy + 24);
  ctx.closePath();
  ctx.fill();
  // veil: bright slit where the eyes are
  ctx.fillStyle = 'rgba(255, 212, 121, 0.85)';
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy - 4, 13, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#120c05';
  ctx.beginPath();
  ctx.arc(cx - 7, cy - 4, 2.1, 0, Math.PI * 2);
  ctx.arc(cx + 3, cy - 4, 2.1, 0, Math.PI * 2);
  ctx.fill();
  // stripes of the apron
  ctx.fillStyle = 'rgba(242, 181, 68, 0.5)';
  ctx.fillRect(cx - 12, cy + 6, 24, 3);
  ctx.fillRect(cx - 12, cy + 13, 24, 3);
  // ledger under the arm
  ctx.fillStyle = '#c9a86a';
  ctx.save();
  ctx.translate(cx + 12, cy + 12);
  ctx.rotate(-0.18 + Math.sin(time * 1.4) * 0.02);
  ctx.fillRect(0, 0, 12, 15);
  ctx.fillStyle = '#8a7350';
  ctx.fillRect(2, 3, 8, 1.4);
  ctx.fillRect(2, 6.5, 8, 1.4);
  ctx.fillRect(2, 10, 5, 1.4);
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function eyes(ctx, x, y, spread, size, color = '#120c05') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - spread, y, size, 0, Math.PI * 2);
  ctx.arc(x + spread, y, size, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnemyBody(ctx, shape, x, y, size, body, accent, time = 0) {
  const s = size / 30;
  const bob = Math.sin(time * 1.6 + x * 0.01) * 2.2;
  ctx.save();
  ctx.translate(x, y + bob);
  switch (shape) {
    case 'wasp': {
      ctx.fillStyle = 'rgba(255,244,214,0.24)';
      ctx.beginPath();
      ctx.ellipse(-4 * s, -13 * s, 11 * s, 5 * s, -0.5, 0, Math.PI * 2);
      ctx.ellipse(6 * s, -13 * s, 10 * s, 4.6 * s, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, 15 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = accent;
      for (let i = -1; i <= 1; i += 1) ctx.fillRect(i * 6 * s - 1.4 * s, -10 * s, 2.8 * s, 20 * s);
      ctx.restore();
      ctx.fillStyle = '#120c05';
      ctx.beginPath();
      ctx.ellipse(-14 * s, -1 * s, 6 * s, 5.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      eyes(ctx, -15 * s, -2 * s, 2.4 * s, 1.5 * s, '#ffd479');
      ctx.fillStyle = '#120c05';
      ctx.beginPath();
      ctx.moveTo(14 * s, -1.6 * s);
      ctx.lineTo(24 * s, 0);
      ctx.lineTo(14 * s, 1.6 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'hornet': {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.2 * s;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.ellipse(i * 5 * s, 0, 3.4 * s, 9 * s, 0, -1.1, 1.1);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,244,214,0.2)';
      ctx.beginPath();
      ctx.ellipse(-3 * s, -12 * s, 12 * s, 5 * s, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(15 * s, -2 * s);
      ctx.lineTo(26 * s, 0);
      ctx.lineTo(15 * s, 2 * s);
      ctx.closePath();
      ctx.fill();
      eyes(ctx, -12 * s, -2 * s, 3 * s, 2 * s, '#ffd479');
      break;
    }
    case 'bulk': {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, 17 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 9; i += 1) {
        const a = -2.6 + i * 0.32;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 14 * s, Math.sin(a) * 11 * s + 2 * s);
        ctx.lineTo(Math.cos(a) * 19 * s, Math.sin(a) * 15 * s + 2 * s);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,244,214,0.18)';
      ctx.beginPath();
      ctx.ellipse(-6 * s, -11 * s, 10 * s, 4 * s, -0.5, 0, Math.PI * 2);
      ctx.fill();
      eyes(ctx, -8 * s, -2 * s, 4 * s, 2.2 * s, '#120c05');
      break;
    }
    case 'human': {
      // a beekeeper with a veil and a smoker
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-12 * s, 18 * s);
      ctx.quadraticCurveTo(-14 * s, -10 * s, 0, -14 * s);
      ctx.quadraticCurveTo(14 * s, -10 * s, 12 * s, 18 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#120c05';
      ctx.beginPath();
      ctx.ellipse(0, -8 * s, 10 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = body;
      ctx.lineWidth = 1.2 * s;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-9 * s, (-10 + i * 4) * s);
        ctx.lineTo(9 * s, (-10 + i * 4) * s);
        ctx.stroke();
      }
      eyes(ctx, 0, -9 * s, 3.4 * s, 1.4 * s, '#ffd479');
      ctx.fillStyle = accent;
      ctx.fillRect(11 * s, 2 * s, 8 * s, 10 * s);
      ctx.fillStyle = 'rgba(127, 166, 184, 0.55)';
      ctx.beginPath();
      ctx.arc(15 * s, -2 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'thief': {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 13 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.ellipse(-2 * s, 0, 5 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // the stolen drop
      ctx.fillStyle = '#f2b544';
      ctx.beginPath();
      ctx.moveTo(14 * s, 6 * s);
      ctx.quadraticCurveTo(20 * s, 12 * s, 14 * s, 15 * s);
      ctx.quadraticCurveTo(8 * s, 12 * s, 14 * s, 6 * s);
      ctx.fill();
      eyes(ctx, -9 * s, -3 * s, 2.6 * s, 1.6 * s, '#ffd479');
      break;
    }
    case 'queen': {
      ctx.fillStyle = 'rgba(255,244,214,0.14)';
      ctx.beginPath();
      ctx.ellipse(-8 * s, -16 * s, 16 * s, 7 * s, -0.45, 0, Math.PI * 2);
      ctx.ellipse(10 * s, -16 * s, 14 * s, 6.4 * s, 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(2 * s, 4 * s, 22 * s, 13 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(2 * s, 4 * s, 22 * s, 13 * s, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = accent;
      for (let i = 0; i < 3; i += 1) ctx.fillRect(-14 * s + i * 9 * s, -10 * s, 3.2 * s, 28 * s);
      ctx.restore();
      ctx.fillStyle = '#120c05';
      ctx.beginPath();
      ctx.ellipse(-18 * s, 0, 8 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      eyes(ctx, -19 * s, -1 * s, 3 * s, 1.8 * s, '#ffd479');
      // crown of spikes
      ctx.fillStyle = '#ffd479';
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-18 * s + i * 4 * s, -7 * s);
        ctx.lineTo(-18 * s + i * 4 * s - 1.4 * s, -15 * s - Math.abs(i) * -1 * s);
        ctx.lineTo(-18 * s + i * 4 * s + 1.4 * s, -7 * s);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'grub':
    default: {
      ctx.fillStyle = body;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.ellipse((i - 1.5) * 7 * s, Math.sin(time * 2 + i) * 1.6 * s, 5.4 * s, 6.4 * s - i * 0.2 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.arc(-10 * s, 0, 5 * s, -1.2, 1.2);
      ctx.stroke();
      eyes(ctx, -10 * s, -1 * s, 1.8 * s, 1.2 * s, '#120c05');
      break;
    }
  }
  ctx.restore();
}

export function drawIntentIcon(ctx, icon, x, y, size, color) {
  const s = size / 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.2, 1.5 * s);
  ctx.lineCap = 'round';
  switch (icon) {
    case 'sword':
      ctx.beginPath();
      ctx.moveTo(-4 * s, 4 * s);
      ctx.lineTo(4 * s, -4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4 * s, -4 * s);
      ctx.lineTo(4 * s, -1 * s);
      ctx.moveTo(4 * s, -4 * s);
      ctx.lineTo(1 * s, -4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-5 * s, 1 * s);
      ctx.lineTo(-1 * s, 5 * s);
      ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(0, -5 * s);
      ctx.lineTo(4.6 * s, -3 * s);
      ctx.lineTo(4 * s, 2.4 * s);
      ctx.lineTo(0, 5.2 * s);
      ctx.lineTo(-4 * s, 2.4 * s);
      ctx.lineTo(-4.6 * s, -3 * s);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'cross':
      ctx.fillRect(-1.6 * s, -4.6 * s, 3.2 * s, 9.2 * s);
      ctx.fillRect(-4.6 * s, -1.6 * s, 9.2 * s, 3.2 * s);
      break;
    case 'drop':
      ctx.beginPath();
      ctx.moveTo(0, -5.4 * s);
      ctx.quadraticCurveTo(4.8 * s, 0, 0, 5 * s);
      ctx.quadraticCurveTo(-4.8 * s, 0, 0, -5.4 * s);
      ctx.fill();
      break;
    case 'smoke':
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc((-3 + i * 3) * s, (i % 2 === 0 ? -1 : 1.4) * s, 2.2 * s, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 'hand':
      ctx.beginPath();
      ctx.moveTo(-4 * s, 2 * s);
      ctx.lineTo(-4 * s, -2 * s);
      ctx.moveTo(-1.6 * s, 1 * s);
      ctx.lineTo(-1.6 * s, -4 * s);
      ctx.moveTo(0.8 * s, 1 * s);
      ctx.lineTo(0.8 * s, -3 * s);
      ctx.moveTo(3.2 * s, 2 * s);
      ctx.lineTo(3.2 * s, -1 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4 * s, 2 * s);
      ctx.quadraticCurveTo(0, 6 * s, 3.2 * s, 2 * s);
      ctx.stroke();
      break;
    case 'grow':
      ctx.beginPath();
      ctx.moveTo(0, 5 * s);
      ctx.lineTo(0, -5 * s);
      ctx.moveTo(0, -5 * s);
      ctx.lineTo(-3.4 * s, -1.4 * s);
      ctx.moveTo(0, -5 * s);
      ctx.lineTo(3.4 * s, -1.4 * s);
      ctx.stroke();
      break;
    case 'alert':
    default:
      ctx.beginPath();
      ctx.moveTo(0, -5 * s);
      ctx.lineTo(0, 1.4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 4 * s, 1.3 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

export function drawCardArt(ctx, art, suit, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const tint = SUITS[suit] ? SUITS[suit].color : PALETTE.amber;
  ctx.save();
  roundRect(ctx, x, y, w, h, 8);
  const back = ctx.createLinearGradient(x, y, x, y + h);
  back.addColorStop(0, '#2a1d0c');
  back.addColorStop(1, '#150f05');
  ctx.fillStyle = back;
  ctx.fill();
  ctx.save();
  roundRect(ctx, x, y, w, h, 8);
  ctx.clip();
  ctx.translate(x, y);
  // a faint comb behind every illustration keeps the family look
  ctx.globalAlpha = 0.5;
  combField(ctx, w + 40, h + 40, 13, { stroke: 'rgba(255, 212, 121, 0.07)' });
  ctx.globalAlpha = 1;
  const s = Math.min(w, h) / 100;
  // the artwork is authored in a 100 x 100 box; centre that box inside the wider card window
  ctx.translate((w - 100 * s) / 2, (h - 100 * s) / 2);
  switch (art) {
    case 'drop': {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(50 * s, 16 * s);
      ctx.bezierCurveTo(74 * s, 44 * s, 70 * s, 62 * s, 50 * s, 66 * s);
      ctx.bezierCurveTo(30 * s, 62 * s, 26 * s, 44 * s, 50 * s, 16 * s);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(43 * s, 44 * s, 4 * s, 7 * s, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'trail': {
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2.2 * s;
      ctx.setLineDash([5 * s, 5 * s]);
      ctx.beginPath();
      ctx.moveTo(18 * s, 72 * s);
      ctx.quadraticCurveTo(48 * s, 20 * s, 82 * s, 34 * s);
      ctx.stroke();
      ctx.setLineDash([]);
      drawBee(ctx, 50 * s, 50 * s, 22 * s, tint, 1);
      break;
    }
    case 'comb': {
      for (let row = 0; row < 2; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const hx = 26 * s + col * 24 * s + (row % 2 ? 12 * s : 0);
          const hy = 34 * s + row * 21 * s;
          ctx.fillStyle = (row + col) % 2 === 0 ? 'rgba(242,181,68,0.85)' : 'rgba(242,181,68,0.4)';
          hexBox(ctx, hx, hy, 11 * s, null, 'rgba(255,212,121,0.7)', 1.4);
          ctx.fill();
        }
      }
      break;
    }
    case 'jar': {
      ctx.fillStyle = 'rgba(255,212,121,0.2)';
      roundRect(ctx, 32 * s, 30 * s, 36 * s, 42 * s, 8 * s);
      ctx.fill();
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2 * s;
      roundRect(ctx, 32 * s, 30 * s, 36 * s, 42 * s, 8 * s);
      ctx.stroke();
      ctx.fillStyle = tint;
      roundRect(ctx, 38 * s, 42 * s, 24 * s, 27 * s, 4 * s);
      ctx.fill();
      ctx.fillStyle = '#c9a86a';
      roundRect(ctx, 30 * s, 24 * s, 40 * s, 9 * s, 4 * s);
      ctx.fill();
      break;
    }
    case 'antenna': {
      ctx.strokeStyle = tint;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(50 * s, 58 * s);
      ctx.quadraticCurveTo(44 * s, 32 * s, 26 * s, 26 * s);
      ctx.moveTo(50 * s, 58 * s);
      ctx.quadraticCurveTo(58 * s, 30 * s, 76 * s, 24 * s);
      ctx.stroke();
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.arc(26 * s, 26 * s, 4 * s, 0, Math.PI * 2);
      ctx.arc(76 * s, 24 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,212,121,0.35)';
      ctx.beginPath();
      ctx.arc(50 * s, 68 * s, 9 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'seal': {
      hexBox(ctx, 50 * s, 50 * s, 24 * s, 'rgba(192,122,62,0.35)', tint, 2.4 * s);
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(40 * s, 50 * s);
      ctx.lineTo(48 * s, 58 * s);
      ctx.lineTo(62 * s, 42 * s);
      ctx.stroke();
      break;
    }
    case 'wall': {
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const hx = 22 * s + col * 18 * s + (row % 2 ? 9 * s : 0);
          const hy = 34 * s + row * 16 * s;
          hexBox(ctx, hx, hy, 8.6 * s, row === 1 ? 'rgba(192,122,62,0.5)' : 'rgba(192,122,62,0.24)', tint, 1.3);
        }
      }
      break;
    }
    case 'cap': {
      hexBox(ctx, 50 * s, 56 * s, 20 * s, 'rgba(192,122,62,0.3)', tint, 2 * s);
      drawIntentIcon(ctx, 'grow', 50 * s, 52 * s, 26 * s, tint);
      break;
    }
    case 'ledger': {
      ctx.fillStyle = 'rgba(201,168,106,0.22)';
      roundRect(ctx, 28 * s, 26 * s, 44 * s, 48 * s, 4 * s);
      ctx.fill();
      ctx.strokeStyle = tint;
      ctx.lineWidth = 1.8 * s;
      roundRect(ctx, 28 * s, 26 * s, 44 * s, 48 * s, 4 * s);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,212,121,0.75)';
      ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(35 * s, (36 + i * 9) * s);
        ctx.lineTo(65 * s, (36 + i * 9) * s);
        ctx.stroke();
      }
      break;
    }
    case 'grub': {
      ctx.fillStyle = tint;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse((36 + i * 14) * s, 54 * s - i * 4 * s, 9 * s, 11 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#120c05';
      ctx.beginPath();
      ctx.arc(33 * s, 50 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'burst': {
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(50 * s + Math.cos(a) * 14 * s, 50 * s + Math.sin(a) * 14 * s);
        ctx.lineTo(50 * s + Math.cos(a) * 27 * s, 50 * s + Math.sin(a) * 27 * s);
        ctx.stroke();
      }
      drawBee(ctx, 50 * s, 50 * s, 24 * s, tint, 1);
      break;
    }
    case 'jelly': {
      ctx.fillStyle = 'rgba(184,217,74,0.28)';
      hexBox(ctx, 50 * s, 50 * s, 26 * s, null, tint, 2 * s);
      ctx.fill();
      ctx.fillStyle = tint;
      hexBox(ctx, 50 * s, 50 * s, 14 * s, tint, '#fff4d6', 1.4);
      break;
    }
    case 'shield': {
      ctx.beginPath();
      ctx.moveTo(50 * s, 20 * s);
      ctx.lineTo(76 * s, 30 * s);
      ctx.lineTo(72 * s, 58 * s);
      ctx.lineTo(50 * s, 76 * s);
      ctx.lineTo(28 * s, 58 * s);
      ctx.lineTo(24 * s, 30 * s);
      ctx.closePath();
      ctx.fillStyle = 'rgba(127,166,184,0.22)';
      ctx.fill();
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2.4 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50 * s, 32 * s);
      ctx.lineTo(50 * s, 62 * s);
      ctx.moveTo(38 * s, 46 * s);
      ctx.lineTo(62 * s, 46 * s);
      ctx.stroke();
      break;
    }
    case 'spear': {
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2.6 * s;
      ctx.beginPath();
      ctx.moveTo(28 * s, 74 * s);
      ctx.lineTo(64 * s, 30 * s);
      ctx.stroke();
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(64 * s, 30 * s);
      ctx.lineTo(72 * s, 22 * s);
      ctx.lineTo(68 * s, 36 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'sting': {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(26 * s, 70 * s);
      ctx.quadraticCurveTo(54 * s, 46 * s, 74 * s, 26 * s);
      ctx.quadraticCurveTo(66 * s, 54 * s, 46 * s, 74 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,244,214,0.7)';
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(34 * s, 66 * s);
      ctx.lineTo(66 * s, 34 * s);
      ctx.stroke();
      break;
    }
    case 'venom': {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(50 * s, 22 * s);
      ctx.bezierCurveTo(70 * s, 46 * s, 66 * s, 62 * s, 50 * s, 66 * s);
      ctx.bezierCurveTo(34 * s, 62 * s, 30 * s, 46 * s, 50 * s, 22 * s);
      ctx.fill();
      ctx.strokeStyle = '#120c05';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(50 * s, 40 * s);
      ctx.lineTo(50 * s, 52 * s);
      ctx.moveTo(50 * s, 58 * s);
      ctx.lineTo(50 * s, 59 * s);
      ctx.stroke();
      break;
    }
    case 'fury': {
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2.6 * s;
      for (let i = 0; i < 3; i += 1) {
        const a = -0.7 + i * 0.7;
        ctx.beginPath();
        ctx.moveTo(50 * s + Math.cos(a) * 12 * s, 66 * s + Math.sin(a) * -10 * s);
        ctx.lineTo(50 * s + Math.cos(a) * 30 * s, 66 * s + Math.sin(a) * -30 * s);
        ctx.stroke();
      }
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(50 * s, 66 * s);
      ctx.lineTo(60 * s, 44 * s);
      ctx.lineTo(50 * s, 50 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    default: {
      hexBox(ctx, 50 * s, 50 * s, 22 * s, null, tint, 2);
      break;
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,212,121,0.22)';
  ctx.lineWidth = 1;
  roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 8);
  ctx.stroke();
  ctx.restore();
}

export function drawRelicGlyph(ctx, glyph, cx, cy, r, color) {
  const s = r / 13;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.1, 1.5 * s);
  ctx.lineCap = 'round';
  switch (glyph) {
    case 'spoon':
      ctx.beginPath();
      ctx.ellipse(-3 * s, -3 * s, 4.4 * s, 5.6 * s, -0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 2 * s);
      ctx.lineTo(6 * s, 8 * s);
      ctx.stroke();
      break;
    case 'wing':
      ctx.beginPath();
      ctx.moveTo(-6 * s, 4 * s);
      ctx.quadraticCurveTo(-2 * s, -8 * s, 7 * s, -5 * s);
      ctx.quadraticCurveTo(2 * s, 6 * s, -6 * s, 4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2 * s, 6 * s);
      ctx.lineTo(-6 * s, 9 * s);
      ctx.stroke();
      break;
    case 'ladle':
      ctx.beginPath();
      ctx.arc(0, 4 * s, 5 * s, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -1 * s);
      ctx.lineTo(0, -8 * s);
      ctx.stroke();
      break;
    case 'scent':
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 3 * s, (2 + i * 2.4) * s, -2.4, -0.7);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 5 * s, 1.6 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'iron':
      hexBox(ctx, 0, 0, 8 * s, null, color, 1.6);
      ctx.beginPath();
      ctx.moveTo(-4 * s, -3 * s);
      ctx.lineTo(4 * s, -3 * s);
      ctx.moveTo(-4 * s, 2 * s);
      ctx.lineTo(4 * s, 2 * s);
      ctx.stroke();
      break;
    case 'horn':
      ctx.beginPath();
      ctx.moveTo(-7 * s, 5 * s);
      ctx.quadraticCurveTo(0, -8 * s, 8 * s, -4 * s);
      ctx.quadraticCurveTo(2 * s, 0, -1 * s, 8 * s);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'lens':
      ctx.beginPath();
      ctx.arc(-1 * s, -1 * s, 6 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3 * s, 3 * s);
      ctx.lineTo(8 * s, 8 * s);
      ctx.stroke();
      break;
    case 'stone':
    default:
      ctx.beginPath();
      ctx.moveTo(-7 * s, -4 * s);
      ctx.lineTo(6 * s, -6 * s);
      ctx.lineTo(7 * s, 5 * s);
      ctx.lineTo(-5 * s, 7 * s);
      ctx.closePath();
      ctx.stroke();
      break;
  }
  ctx.restore();
}

export function drawNectarDrop(ctx, cx, cy, r, filled, color) {
  ctx.save();
  hexPath(ctx, cx, cy, r);
  if (filled) {
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ffe9b0');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.strokeStyle = filled ? 'rgba(255, 233, 176, 0.9)' : '#5a462a';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();
}

export function drawShieldGlyph(ctx, cx, cy, r, color, filled = 0) {
  ctx.save();
  hexPath(ctx, cx, cy, r);
  ctx.fillStyle = 'rgba(127,166,184,0.16)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  if (filled > 0) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.72);
    ctx.lineTo(cx + r * 0.6, cy - r * 0.3);
    ctx.lineTo(cx + r * 0.5, cy + r * 0.5);
    ctx.lineTo(cx, cy + r * 0.78);
    ctx.lineTo(cx - r * 0.5, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.6, cy - r * 0.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}
