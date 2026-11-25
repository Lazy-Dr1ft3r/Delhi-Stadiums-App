/**
 * Zod schemas for venue data. This file is the single source of truth:
 * TypeScript types are inferred from these schemas, never written by hand.
 *
 * Data rules (see PROJECT_BRIEF.md §4):
 * - `status.lastVerified` is required.
 * - Unknown is not false: optional booleans are omitted when unknown,
 *   enums use "unknown". The UI renders missing values as "Not confirmed".
 */
import { z } from "zod";

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be a lowercase slug, e.g. jln-stadium");

const nonEmpty = z.string().trim().min(1);

/** ISO calendar date (YYYY-MM-DD) that is not in the future. */
const verifiedDate = z.iso
  .date()
  .refine((d) => Date.parse(d) <= Date.now(), "lastVerified cannot be in the future");

// Loose bounding box around Delhi NCR. Catches swapped lat/lng and typos;
// tighten once the NCR-vs-NCT scope decision (brief §10.7) is made.
export const coordinatesSchema = z.strictObject({
  lat: z.number().min(27.5).max(29.5),
  lng: z.number().min(76.5).max(78.5),
});

export const operatorSchema = z.enum([
  "SAI",
  "DDA",
  "Delhi Govt",
  "MCD",
  "NDMC",
  "University",
  "Private",
  "Other",
]);

export const surfaceSchema = z.enum(["synthetic", "cinder", "grass", "mud", "concrete", "unknown"]);

export const runningTrackDetailsSchema = z.strictObject({
  lengthMeters: z.number().int().positive(),
  surface: surfaceSchema,
  lanes: z.number().int().positive().optional(),
  certified: nonEmpty.optional(),
  spikesAllowed: z.boolean().optional(),
  floodlights: z.boolean().optional(),
  warmupArea: z.boolean().optional(),
  fieldEventsArea: z.boolean().optional(),
  indoor: z.boolean().optional(),
});

export const publicEntrySchema = z.enum([
  "open",
  "membership",
  "registered_athletes_only",
  "restricted",
  "unknown",
]);

export const accessSchema = z.strictObject({
  publicEntry: publicEntrySchema,
  fees: nonEmpty.optional(),
  hours: nonEmpty.optional(),
  coachingAvailable: z.boolean().optional(),
  notes: nonEmpty.optional(),
});

export const statusStateSchema = z.enum([
  "open",
  "closed",
  "under_renovation",
  "restricted",
  "unknown",
]);

export const statusSourceSchema = z.enum([
  "site_visit",
  "phone_call",
  "official_notice",
  "news",
  "user_report",
  "other",
]);

export const statusSchema = z.strictObject({
  state: statusStateSchema,
  reason: nonEmpty.optional(),
  lastVerified: verifiedDate,
  source: statusSourceSchema,
  sourceUrl: z.url().optional(),
});

const facilityBase = {
  id: slug,
  access: accessSchema,
  status: statusSchema,
};

export const runningTrackFacilitySchema = z.strictObject({
  ...facilityBase,
  type: z.literal("running_track"),
  details: runningTrackDetailsSchema,
});

/**
 * Discriminated on `type`. To add a facility type (pool, court, ...), define
 * its details schema + facility schema and add it to this union.
 */
export const facilitySchema = z.discriminatedUnion("type", [runningTrackFacilitySchema]);

export const venueSchema = z
  .strictObject({
    id: slug,
    /** True for placeholder data. Must be removed before real data ships (M2). */
    isSample: z.boolean().optional(),
    name: nonEmpty,
    aliases: z.array(nonEmpty).default([]),
    address: nonEmpty,
    locality: nonEmpty,
    district: nonEmpty.optional(),
    coordinates: coordinatesSchema,
    operator: operatorSchema,
    operatorName: nonEmpty.optional(),
    website: z.url().optional(),
    phone: nonEmpty.optional(),
    facilities: z.array(facilitySchema).min(1, "a venue needs at least one facility"),
    photos: z.array(nonEmpty).optional(),
  })
  .superRefine((venue, ctx) => {
    const seen = new Set<string>();
    venue.facilities.forEach((f, i) => {
      if (seen.has(f.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["facilities", i, "id"],
          message: `duplicate facility id "${f.id}"`,
        });
      }
      seen.add(f.id);
    });
  });

export type Venue = z.infer<typeof venueSchema>;
export type VenueInput = z.input<typeof venueSchema>;
export type Facility = z.infer<typeof facilitySchema>;
export type FacilityType = Facility["type"];
export type RunningTrackFacility = z.infer<typeof runningTrackFacilitySchema>;
export type RunningTrackDetails = z.infer<typeof runningTrackDetailsSchema>;
export type Access = z.infer<typeof accessSchema>;
export type Status = z.infer<typeof statusSchema>;
export type StatusState = z.infer<typeof statusStateSchema>;
export type Operator = z.infer<typeof operatorSchema>;
export type Surface = z.infer<typeof surfaceSchema>;
