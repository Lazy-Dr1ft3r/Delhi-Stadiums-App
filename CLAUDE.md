# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Delhi Tracks (working name) is a mobile-first Next.js web app/PWA listing every Delhi venue with a running track: location, track specs, access, hours, fees, and a **status that always carries when it was verified and by what source**. The core problem is data freshness, not listing. An honest "Unknown — last confirmed 3 months ago" beats a confident wrong "Open". Read [PROJECT_BRIEF.md](PROJECT_BRIEF.md) for scope, screens and milestones, and don't build beyond the current milestone.

## Commands

```bash
npm install
npm run dev                 # dev server on :3000
npm run build               # prebuild runs validate-data, so bad data fails the build
npm run lint                # ESLint (flat config, eslint-config-next + prettier)
npm run format              # Prettier write; format:check in CI
npm run typecheck           # tsc --noEmit
npm run validate-data       # Zod-validate data/venues/*.json (tsx scripts/validate-data.ts)
npm test                    # Vitest unit tests (tests/unit)
npx vitest run tests/unit/schema.test.ts       # single file
npx vitest run -t "rejects duplicate facility" # single test by name
npm run test:e2e            # Playwright (builds + starts the app; needs `npx playwright install chromium`)
npm run check               # lint + typecheck + validate-data + unit tests
```

CI (`.github/workflows/ci.yml`) runs lint, format:check, typecheck, validate-data, unit tests and e2e. It uses `npm ci`, so `package-lock.json` must be committed.

Dev machine is Windows; the default terminal may be Windows PowerShell 5.1, which has no `&&`. Chain commands with `;` there (or `a; if ($?) { b }`), or use Git Bash. `npm run check` itself is fine (npm runs its scripts in cmd).

## Architecture

- **Data is JSON in the repo for the pilot.** There is one file per venue: `data/venues/<id>.json`, and `id` must equal the file name. Every edit is a reviewable git diff. A move to Supabase (Postgres + PostGIS) is planned for later, so keep data access behind `src/lib/data.ts`.
- **`src/lib/schema.ts` is the source of truth.** Zod schemas define the model and every TS type is inferred from them (`z.infer`). Never hand-write a parallel type. The model is **Venue → Facilities[]**. `facilitySchema` is a discriminated union on `type`, which is only `running_track` today. To add a type (pool, court…), add a details schema plus a facility schema to the union. Objects are `z.strictObject`, so unknown keys fail.
- **`src/lib/data.ts`** loads and validates every venue file (server-only, uses `fs`). `getAllVenues()` throws on any invalid file, so pages that call it fail the build. `validateVenueDir()` collects all errors; the validate script and tests use it. Its `fs`/`path` calls carry `/*turbopackIgnore: true*/` hints, which stop Turbopack from tracing the whole project into the server bundle. Keep the hints; they're safe only while venue data is read at build time (static pages).
- **Pages** are server components that read data at build time. Venue detail pages (`src/app/venues/[id]`, M1) should be statically generated with `generateStaticParams`.
- **Planned `lib/` modules** (brief §7): `filters.ts` (pure filter/sort), `geo.ts` (distance), `status.ts` (staleness: amber after 60 days, grey "unknown" after 180 days since `lastVerified`). Keep them pure and unit-tested.
- **Map** (M1): Leaflet + OpenStreetMap through `react-leaflet`. These must be client-only components (`"use client"` plus dynamic import with `ssr: false`) because Leaflet touches `window`.

## Data rules (critical)

- **Never fabricate venue facts:** names, addresses, coordinates, hours, fees, track specs, or status. The candidate list in brief §11 is unverified and must not be shipped as data. Real data is entered by the user (M2). If a fact is needed, leave the field undefined and ask.
- Placeholder data uses `"isSample": true` and labels every text value `SAMPLE`. Sample venues must use fictional names, not real venue names.
- `status.lastVerified` (ISO `YYYY-MM-DD`, not in the future) and `status.source` are required.
- **Unknown ≠ false.** Omit optional booleans when unknown and use the `"unknown"` enum value. The UI must render missing values as "Not confirmed", never as "No".
- Update reports from users go to a review queue and never write straight to live data.

## Conventions

- TypeScript strict with `noUncheckedIndexedAccess`. The import alias `@/*` maps to `src/*`.
- Put logic in pure functions in `src/lib/` with Vitest tests. Keep components thin.
- Mobile-first: it must be usable one-handed, outdoors, on a slow connection. Use Tailwind v4 (`@import "tailwindcss"` in `src/styles/globals.css`, configured through PostCSS).
- **Don't add new dependencies without asking.** Leaflet/react-leaflet are approved for M1 but not installed yet.
- Work one milestone at a time with small commits. Run `npm run check` before saying a task is done.

## Decisions

Confirmed (2026-11-20): web app/PWA first; the Next.js stack from brief §6; JSON-in-repo for the pilot; "Delhi Tracks" is a placeholder name (decide later).

Still open (brief §10), so ask before building anything that depends on them:

- Where "Report an update" submissions land (Google Form / Formspree / Supabase), needed for M3
- Whether to include private/membership venues
- NCT Delhi only, or NCR too. The coordinate bounds in `schema.ts` are a loose NCR box until this is decided.
- English only, or English + Hindi

## Current milestone: M0 — Scaffold

Done: tooling configs, Zod schema, data loader, `validate-data` script, 3 SAMPLE venues (deliberately fresh / ~3 months / >180 days old, to exercise staleness), unit + smoke tests, CI workflow, placeholder home page, PWA manifest stub. Verified 2026-11-25: `npm run check`, `format:check`, `build` (no warnings) and `test:e2e` all pass.

Remaining for M0:

- Optional pre-commit hook that runs validate-data (would need a dependency such as husky or simple-git-hooks; ask first).
- First commit and push to GitHub so CI runs.

Next (M1): `status.ts`, `geo.ts`, `filters.ts` with tests, then the Explore page (list + map toggle, search, filter chips, Near me), the venue detail page, StatusBadge, and a Vercel deploy.
