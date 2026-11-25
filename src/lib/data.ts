/**
 * Loads and validates every venue JSON file in data/venues.
 * Server-only (uses the filesystem): call from server components,
 * generateStaticParams, or scripts, never from client components.
 */
import fs from "node:fs";
import path from "node:path";
import { venueSchema, type Venue } from "./schema";

export const VENUES_DIR = path.join(process.cwd(), "data", "venues");

export interface DataError {
  file: string;
  message: string;
}

export interface ValidationResult {
  venues: Venue[];
  errors: DataError[];
}

/** Validate one venue file's contents. `file` is the file name, e.g. "jln-stadium.json". */
export function parseVenueFile(file: string, raw: string): { venue?: Venue; errors: DataError[] } {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return { errors: [{ file, message: `invalid JSON: ${(e as Error).message}` }] };
  }

  const result = venueSchema.safeParse(json);
  if (!result.success) {
    return {
      errors: result.error.issues.map((issue) => ({
        file,
        message: `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      })),
    };
  }

  const expectedId = path.basename(file, ".json");
  if (result.data.id !== expectedId) {
    return {
      errors: [{ file, message: `id "${result.data.id}" must match file name "${expectedId}"` }],
    };
  }

  return { venue: result.data, errors: [] };
}

/** Validate every *.json file in `dir`, collecting all errors instead of stopping at the first. */
// The turbopackIgnore hints stop Next from tracing the whole project into the server bundle.
// Safe because venue data is read at build time (pages are statically generated).
export function validateVenueDir(dir: string = VENUES_DIR): ValidationResult {
  const files = fs
    .readdirSync(/*turbopackIgnore: true*/ dir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const venues: Venue[] = [];
  const errors: DataError[] = [];
  for (const file of files) {
    const filePath = path.join(/*turbopackIgnore: true*/ dir, file);
    const parsed = parseVenueFile(
      file,
      fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf8"),
    );
    if (parsed.venue) venues.push(parsed.venue);
    errors.push(...parsed.errors);
  }
  return { venues, errors };
}

let cache: Venue[] | undefined;

/** All venues, sorted by name. Throws if any file is invalid, so a bad entry fails the build. */
export function getAllVenues(): Venue[] {
  if (cache) return cache;
  const { venues, errors } = validateVenueDir();
  if (errors.length > 0) {
    const detail = errors.map((e) => `  ${e.file}: ${e.message}`).join("\n");
    throw new Error(`Invalid venue data:\n${detail}`);
  }
  cache = venues.sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export function getVenueById(id: string): Venue | undefined {
  return getAllVenues().find((v) => v.id === id);
}
