/**
 * Validates every file in data/venues against the Zod schema.
 * Exits non-zero on any error. Runs in CI, before `next build`, and should run pre-commit.
 */
import { validateVenueDir, VENUES_DIR } from "../src/lib/data";

const { venues, errors } = validateVenueDir(VENUES_DIR);

if (errors.length > 0) {
  console.error(`✗ ${errors.length} data error(s):`);
  for (const e of errors) console.error(`  ${e.file}: ${e.message}`);
  process.exit(1);
}

const samples = venues.filter((v) => v.isSample).length;
const facilities = venues.reduce((n, v) => n + v.facilities.length, 0);
console.log(
  `✓ ${venues.length} venue(s), ${facilities} facility(ies) valid` +
    (samples > 0 ? ` — ${samples} marked as SAMPLE` : ""),
);
