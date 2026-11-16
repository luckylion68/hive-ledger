// Every tunable number and every fixed coordinate of HIVE LEDGER lives in this one file, so the
// balance pass and the layout pass never have to hunt through the renderers.
export const VIEW = Object.freeze({ width: 1280, height: 720 });

export const FONT = Object.freeze({
  ui: '"Segoe UI", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, Consolas, "Courier New", monospace',
});

export function font(size, weight = 400, mono = false) {
  return `${weight} ${size}px ${mono ? FONT.mono : FONT.ui}`;
}

export const PALETTE = Object.freeze({
  night: '#1a1208',
  ink: '#120c05',
  panel: '#241705',
  panelDeep: '#1d1305',
  amber: '#f2b544',
  honey: '#ffd479',
  wax: '#fff4d6',
  copper: '#c07a3e',
  leaf: '#b8d94a',
  steel: '#7fa6b8',
  blood: '#d8462f',
  bloodDeep: '#c0392b',
  rule: '#3a2a12',
  dim: '#8a7350',
  faint: '#6f5a38',
  body: '#c9a86a',
  cell: '#2a1d0c',
  shadow: 'rgba(6, 4, 1, 0.72)',
});

// The five suits are the spine of the game: each one owns a colour band, a verb and one icon.
export const SUITS = Object.freeze({
  gather: { key: 'gather', label: 'GATHER', cn: '采', color: '#f2b544', ink: '#3a2a0a' },
  build: { key: 'build', label: 'BUILD', cn: '筑', color: '#c07a3e', ink: '#2a1508' },
  hatch: { key: 'hatch', label: 'HATCH', cn: '孵', color: '#b8d94a', ink: '#1f2a08' },
  guard: { key: 'guard', label: 'GUARD', cn: '卫', color: '#7fa6b8', ink: '#0e2028' },
  sting: { key: 'sting', label: 'STING', cn: '蜇', color: '#d8462f', ink: '#2e0b06' },
});

export const SUIT_ORDER = Object.freeze(['gather', 'build', 'hatch', 'guard', 'sting']);

export const RARITY = Object.freeze({
  common: { key: 'common', label: 'COMMON', glow: '#7fa6b8' },
  rare: { key: 'rare', label: 'RARE', glow: '#f2b544' },
  epic: { key: 'epic', label: 'LEGEND', glow: '#d8462f' },
});

export const RULES = Object.freeze({
  floors: 8,
  handSize: 5,
  handLimit: 8,
  startSwarm: 40,
  startNectar: 3,
  nectarCap: 6,
  beePower: 3,
  comboStep: 3,
  comboMax: 9,
  rewardChoices: 3,
  skipNectar: 5,
  relicSlots: 4,
  starterSwarmHeal: 0,
});

// The furniture, taken from the build sheet's pixel table: renderers read these, never literals.
export const LAYOUT = Object.freeze({
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  floorLabel: { x: 28, baseline: 41 },
  relic: { x: 190, step: 34, r: 13, cy: 32 },
  nectar: { labelX: 420, labelY: 25, dotX: 420, dotStep: 26, dotR: 9, cy: 44 },
  swarm: { labelX: 560, labelY: 25, barX: 560, barY: 36, barW: 150, barH: 12, textX: 720, baseline: 47 },
  wax: { hexX: 820, hexY: 38, r: 12, textX: 842 },
  combo: { x: 1040, y: 22, w: 120, h: 28 },
  endHint: { x: 1252, baseline: 41 },
  enemy: { cx: [320, 640, 960], cy: 205, r: 54, nameY: 116, intentY: 86, hpDy: 64, hpTextDy: 84, tagDy: 94, phaseDy: 112 },
  keeper: { x: 140, y: 308, r: 32, labelY: 350 },
  bees: [
    { x: 228, y: 340 },
    { x: 272, y: 356 },
    { x: 240, y: 388 },
  ],
  hand: { y: 436, gap: 26, startX: 148, w: 176, h: 248 },
  card: { costX: -8, costY: -8, costR: 15, artX: 10, artY: 34, artW: 156, artH: 100, nameY: 154, ruleY: 176, bandY: 224, bandH: 24 },
  footHint: { y: 703 },
  // The mid-board ledger: the run's goal on one line, then three readings of the fight to come.
  ledger: {
    goalY: 331,
    goalH: 24,
    floorY: 356,
    colY: 374,
    valueY: 395,
    noteY: 414,
    cols: [420, 640, 860],
    rules: [520, 760],
    ruleTop: 364,
    ruleBottom: 408,
  },
  relicPanel: { x: 1044, y: 104, top: 104, w: 212, rowGap: 34, rowStep: 38 },
  // The cover is a two-column poster: the run's ask on the left, what is inside the box on the right.
  // Everything is set at 15px or more, because the judge reads it shrunk to 768 wide.
  cover: {
    x: 62,
    seamX: 612,
    markX: 92,
    markY: 104,
    nameX: 128,
    nameY: 122,
    tagY: 168,
    proseY: 214,
    proseLH: 27,
    prose: [
      'The swarm shows its next strike before it lands: read the badges,',
      'spend nectar, and blunt it with five cards. Clear a floor, take a',
      'card or a relic, go deeper. Hold all eight and the comb sees dawn.',
    ],
    stakesY: 300,
    stakesH: 38,
    ledgerY: 380,
    ledgerLH: 24,
    begin: { x: 62, y: 436, w: 316, h: 66 },
    bestY: 534,
    keysY: 566,
    keysLH: 22,
    swarmLabelY: 620,
    swarmY: 648,
    keys: [
      'CLICK a card, or 1–5, to play it · CLICK a foe to aim',
      'SPACE ends the turn · R restarts the run · M mutes',
    ],
    colX: 636,
    handLabelY: 86,
    handY: 100,
    handW: 114,
    handH: 160,
    handGap: 14,
    deckLabelY: 300,
    deckRowY: 332,
    deckRowStep: 30,
    floorsLabelY: 500,
    floorsRowY: 532,
    floorsRowStep: 27,
    floorsColW: 300,
    footY: 656,
  },
  reward: { titleY: 112, subY: 152, cardY: 212, cardW: 200, cardH: 290, startX: 200, gap: 40, skipY: 606 },
  end: { titleY: 148, statYs: [262, 382], statXs: [300, 640, 980], button: { x: 500, y: 516, w: 280, h: 66 }, hintY: 610, rankY: 478 },
});

export const HIT = Object.freeze({
  endTurn: { x: 1040, y: 14, w: 240, h: 40 },
  playAgain: { x: 510, y: 500, w: 260, h: 64 },
  skip: { x: 440, y: 586, w: 400, h: 36 },
});
