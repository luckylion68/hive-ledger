// HIVE LEDGER's entrypoint. It stages the submission: copy the playable files and the four
// screenshots where the grader reads them, then describe both with the vendored make.fun library.
// Everything the judge needs is produced here, so nothing is hand-written into /output.

import { cp, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The grader's own limits. Passing them to the library keeps this entry inside the same caps the
// scorer applies, so a dossier that is too big fails here rather than after the upload.
const LIMITS = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  game_max_files: 993,
  game_max_bytes: 50_331_648,
  game_path_max_bytes: 1_000,
};

async function main(): Promise<void> {
  await mkdir(output, { recursive: true });

  // The game itself: plain static files, no build step, no network at runtime.
  await cp(join(root, 'game'), join(output, 'game'), { recursive: true });

  // The screenshots are required, but a missing folder must not crash the run before the dossier
  // says so in its own words.
  const shots = join(root, 'screenshots');
  await mkdir(join(output, 'screenshots'), { recursive: true });
  if (existsSync(shots)) {
    await cp(shots, join(output, 'screenshots'), { recursive: true });
  }

  const dossier = buildDossier(output, LIMITS);
  await writeFile(join(output, 'dossier.json'), dossier);
}

await main();
