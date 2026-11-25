# Delhi Tracks — Project Brief (Pilot)

> **For Claude Code:** Read this whole file before doing anything. Your first job is to
> (1) confirm the open decisions in §10 with the user, (2) write `CLAUDE.md` from §9,
> and (3) scaffold the repo in §7. Do not build features beyond the current milestone (§8).

---

## 1. What we're building

A mobile-first web app listing **every stadium and sports facility in Delhi that has a running track**, with practical, up-to-date details: where it is, what the track is like, who can use it, when, at what cost, and **whether it is currently open**.

The pilot covers running tracks only. The data model must make it easy to add other facility types later (pools, courts, gyms, football grounds) without a rewrite.

**The core problem is freshness, not listing.** Track info in Delhi is scattered, and venues close for renovation, events, elections or government use with little notice. Every status shown must carry *when it was verified* and *by what source*. An honest "Unknown — last confirmed 3 months ago" beats a confident wrong "Open".

## 2. Users and jobs

| User | Job to be done |
|---|---|
| Competitive / club athlete | "Where's the nearest synthetic 400m track I can train on today, and can I wear spikes?" |
| Recreational runner | "Is there a track near me with public entry and reasonable hours?" |
| Parent / coach | "Which venues offer coaching or memberships for kids?" |
| Visitor | "I'm in Delhi for a week — where can I run?" |

## 3. Pilot scope

**In:**
- Browse venues as a list and on a map
- Filters: currently open, track surface (synthetic / cinder / grass / mud), full 400m vs shorter, public access, floodlights, distance from me
- Venue detail page (all fields in §4)
- Status badge with "last verified" date and source
- "Report an update" form (submissions go to a review queue, never straight to live data)
- Simple admin path to review reports and edit data (can be manual edits to a data file at first)

**Out (future scope):**
- Other facility types (model supports them; UI doesn't expose them yet)
- User accounts, reviews, ratings
- Booking or payments
- Native mobile apps (PWA is enough for the pilot)
- Live air-quality (AQI) next to each venue — useful for outdoor training decisions in Delhi winters; plan for it, don't build it yet

## 4. Data model (draft)

Design around **Venue → Facilities**, so a stadium with a track, a pool and courts is one venue with three facilities.

```ts
Venue {
  id: string                 // slug, e.g. "jln-stadium"
  name: string
  aliases: string[]          // common local names
  address: string
  locality: string           // e.g. "Lodhi Road", "Dwarka Sec 11"
  district?: string
  coordinates: { lat: number; lng: number }
  operator: "SAI" | "DDA" | "Delhi Govt" | "MCD" | "NDMC" | "University" | "Private" | "Other"
  operatorName?: string
  website?: string
  phone?: string
  facilities: Facility[]
  photos?: string[]          // only our own or properly licensed images
}

Facility {
  id: string
  type: "running_track"      // later: "pool" | "football_ground" | "court" | "gym" | ...
  details: RunningTrackDetails  // discriminated by `type`
  access: Access
  status: Status
}

RunningTrackDetails {
  lengthMeters: number       // 400, 300, 200 ...
  surface: "synthetic" | "cinder" | "grass" | "mud" | "concrete" | "unknown"
  lanes?: number
  certified?: string         // e.g. "World Athletics Class 2", if known
  spikesAllowed?: boolean
  floodlights?: boolean
  warmupArea?: boolean
  fieldEventsArea?: boolean
  indoor?: boolean
}

Access {
  publicEntry: "open" | "membership" | "registered_athletes_only" | "restricted" | "unknown"
  fees?: string              // free text at first, e.g. "₹50/day; ₹500/month"
  hours?: string             // free text at first, e.g. "5:30–9:30, 16:00–19:30"
  coachingAvailable?: boolean
  notes?: string
}

Status {
  state: "open" | "closed" | "under_renovation" | "restricted" | "unknown"
  reason?: string            // e.g. "Resurfacing until March"
  lastVerified: string       // ISO date — required
  source: "site_visit" | "phone_call" | "official_notice" | "news" | "user_report" | "other"
  sourceUrl?: string
}
```

Rules:
- `status.lastVerified` is mandatory. The UI shows staleness (e.g. amber after 60 days, grey "unknown" after 180).
- Never show a field as `false` when it is really unknown. Use `undefined` / `"unknown"` and render "Not confirmed".
- Validate all data with a schema (Zod) at build time; a bad entry should fail the build.

## 5. Screens

1. **Home / Explore** — map + list toggle, search box, filter chips, "Near me" button.
2. **Venue detail** — name, status badge (with verified date + source), track details, access/fees/hours, directions link (opens Google Maps), "Report an update" button.
3. **Report an update** — pick a venue (or "venue missing"), what changed, optional photo/link, optional contact. No login.
4. **About / Data** — how data is collected, what the status colours mean, how to contribute.

Mobile-first. Must be usable one-handed, outdoors, on a slow connection.

## 6. Proposed tech stack (confirm in §10)

| Concern | Pilot choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Static pages per venue (good SEO), easy to grow into an API later |
| Styling | Tailwind CSS | Fast, consistent |
| Map | Leaflet + OpenStreetMap tiles (`react-leaflet`) | Free, no API key |
| Data (pilot) | JSON files in `/data`, validated with Zod | Zero infra; every edit is a reviewable git diff |
| Data (later) | Supabase (Postgres + PostGIS) | When user reports and an admin UI are needed |
| Update reports | Simple form → Google Form / Formspree / Supabase table | Avoid building auth in the pilot |
| Hosting | Vercel | Free tier, preview deploys per branch |
| PWA | `next-pwa` or manual manifest + service worker | Installable, works offline for cached venues |
| Tests | Vitest (unit), Playwright (a few smoke tests) | |
| Lint/format | ESLint + Prettier | |

## 7. Repo structure

```
delhi-tracks/
├── CLAUDE.md                 # conventions for Claude Code (see §9)
├── PROJECT_BRIEF.md          # this file
├── README.md
├── data/
│   ├── venues/               # one JSON file per venue, e.g. jln-stadium.json
│   └── README.md             # how to add/edit a venue, field definitions
├── src/
│   ├── app/
│   │   ├── page.tsx                  # explore (map + list)
│   │   ├── venues/[id]/page.tsx      # venue detail (statically generated)
│   │   ├── report/page.tsx           # report an update
│   │   └── about/page.tsx
│   ├── components/
│   │   ├── map/                      # VenueMap, VenueMarker (client-only)
│   │   ├── venue/                    # VenueCard, StatusBadge, TrackSpecs, AccessInfo
│   │   └── filters/                  # FilterBar, FilterChip
│   ├── lib/
│   │   ├── schema.ts                 # Zod schemas = source of truth for types
│   │   ├── data.ts                   # load + validate all venues
│   │   ├── filters.ts                # pure filter/sort functions
│   │   ├── geo.ts                    # distance calc
│   │   └── status.ts                 # staleness rules, badge logic
│   └── styles/
├── scripts/
│   └── validate-data.ts      # run in CI and pre-commit
├── tests/
│   ├── unit/
│   └── e2e/
└── public/
    └── manifest.json
```

## 8. Milestones

- **M0 — Scaffold:** repo, tooling, `CLAUDE.md`, Zod schema, `validate-data` script, 2–3 sample venues marked clearly as sample data. CI runs lint + typecheck + validate + tests.
- **M1 — Read-only pilot:** explore page (list + map), filters, venue detail, status badge with staleness, deployed to Vercel.
- **M2 — Real data:** verified data for all known Delhi venues with tracks (filled in by the user — Claude Code must not invent venue facts).
- **M3 — Feedback loop:** "Report an update" form + simple review workflow; About/Data page.
- **M4 — PWA polish:** installable, offline cache, performance pass.
- **Later:** Supabase migration, other facility types, AQI overlay, accounts.

## 9. What `CLAUDE.md` should contain

Claude Code: write `CLAUDE.md` covering at least:
- One-paragraph project summary and link to this brief
- Stack and exact commands: install, dev, build, lint, typecheck, test, validate-data
- Repo map (short version of §7)
- **Data rules:** never fabricate venue facts (names, addresses, hours, fees, status). Use placeholders marked `SAMPLE` or leave fields undefined and ask the user. `lastVerified` is required. Unknown ≠ false.
- Coding conventions: TypeScript strict, types derived from Zod schemas, pure functions in `lib/` with unit tests, map components client-only, no new dependencies without asking
- Workflow: work one milestone at a time, small commits, run validate + typecheck + tests before saying a task is done
- Current milestone and next steps (keep this section updated)

## 10. Decisions to confirm with the user before building

1. Web app / PWA first (proposed) vs native mobile app?
2. Stack in §6 OK? (Especially Next.js vs a lighter option like Vite + React.)
3. App name / domain?
4. JSON-in-repo for the pilot, or go straight to Supabase?
5. Where should "Report an update" submissions land (Google Form, Formspree, Supabase)?
6. Include private venues (school/club tracks with membership), or only government/public ones?
7. Include NCR (Gurugram, Noida, Faridabad, Ghaziabad) or strictly NCT Delhi?
8. Language: English only, or English + Hindi?

## 11. Candidate venues to research (NOT verified — do not ship as data)

A starting list for the user to verify. Every field, including whether a track exists and its surface, must be confirmed before going into `/data`.

- Jawaharlal Nehru Stadium (Lodhi Road)
- Thyagaraj Sports Complex (INA)
- Chhatrasal Stadium (Model Town)
- Delhi University Sports Complex (North Campus)
- Yamuna Sports Complex (Vivek Vihar / Surajmal Vihar)
- DDA sports complexes (several across the city — check which have tracks)
- Other university and college grounds (e.g. Jamia, IIT Delhi, JNU)

Useful sources to check: SAI, Delhi Govt Directorate of Education sports, DDA Sports, university sports offices, local running clubs, and site visits/phone calls.
