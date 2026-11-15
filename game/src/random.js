// One deterministic generator for the whole run: the same seed draws the same floors, the same
// shuffles and the same intents, which is what makes the screenshots reproducible.
export function createRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  let b = 0x85ebca6b;
  let c = 0xc2b2ae35;

  function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    b = (b ^ (t ^ (t >>> 14))) >>> 0;
    c = (c + Math.imul(b, 0x27d4eb2f)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Burn a few values so short seeds do not start with a visible pattern.
  for (let i = 0; i < 6; i += 1) next();

  return {
    seed,
    unit: next,
    int(min, max) {
      if (max <= min) return min;
      return min + Math.floor(next() * (max - min + 1));
    },
    chance(p) {
      return next() < p;
    },
    pick(list) {
      if (!list.length) return undefined;
      return list[Math.floor(next() * list.length)];
    },
    shuffle(list) {
      const out = list.slice();
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        const swap = out[i];
        out[i] = out[j];
        out[j] = swap;
      }
      return out;
    },
    // Weighted pick: [[value, weight], ...]. Used for relics and enemy rolls.
    weighted(pairs) {
      let total = 0;
      for (const pair of pairs) total += pair[1];
      let roll = next() * total;
      for (const pair of pairs) {
        roll -= pair[1];
        if (roll <= 0) return pair[0];
      }
      return pairs.length ? pairs[pairs.length - 1][0] : undefined;
    },
  };
}

export function clamp(value, low, high) {
  return value < low ? low : value > high ? high : value;
}
