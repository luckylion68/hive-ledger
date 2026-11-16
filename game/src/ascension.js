// Four sittings of the same run. Each one stacks a rule on top of the last, so a keeper who can hold
// the comb on HONEYMOON has somewhere harder to go, and the run keeps asking a new question.
// Nothing here is random: the player picks the sitting before the first card is dealt.
export const ASCENSIONS = [
  {
    level: 0,
    name: 'HONEYMOON',
    tag: 'the comb as it was built',
    hpScale: 1,
    damageBonus: 0,
    startSwarm: 0,
    relicSlots: 4,
    coinPay: 1,
    note: 'no rules added',
  },
  {
    level: 1,
    name: 'LONG DROUGHT',
    tag: 'the nectar runs thin',
    hpScale: 1.15,
    damageBonus: 0,
    startSwarm: 0,
    relicSlots: 4,
    coinPay: 1.25,
    note: 'every raider has 15% more body',
  },
  {
    level: 2,
    name: 'WINTER COMB',
    tag: 'the swarm starts hungry',
    hpScale: 1.15,
    damageBonus: 2,
    startSwarm: -5,
    relicSlots: 4,
    coinPay: 1.5,
    note: 'start 5 swarm short, raiders hit 2 harder',
  },
  {
    level: 3,
    name: "THE QUEEN'S WRATH",
    tag: 'she knows your name',
    hpScale: 1.3,
    damageBonus: 3,
    startSwarm: -8,
    relicSlots: 3,
    coinPay: 2,
    note: '30% more body, 3 harder, one relic slot sealed',
  },
];

export function ascensionOf(level) {
  return ASCENSIONS[Math.max(0, Math.min(ASCENSIONS.length - 1, level || 0))];
}

export function ascensionLabel(level) {
  const sitting = ascensionOf(level);
  return `${sitting.name} · ${sitting.tag}`;
}
