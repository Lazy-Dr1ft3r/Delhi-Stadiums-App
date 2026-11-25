# Delhi Tracks

A mobile-first web app that lists stadiums and sports facilities in Delhi with running tracks. For each one it shows the location, track details, access, hours, fees, and a status that says **when it was verified and by what source**.

"Delhi Tracks" is a working name. See [PROJECT_BRIEF.md](PROJECT_BRIEF.md) for the full brief.

## Requirements

- Node.js 20.9 or later (22 recommended, see `.nvmrc`)

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Command                           | What it does                                                               |
| --------------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`                     | Dev server                                                                 |
| `npm run build`                   | Validates data, then runs a production build                               |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                          |
| `npm run typecheck`               | `tsc --noEmit`                                                             |
| `npm run validate-data`           | Checks every `data/venues/*.json` file against the schema                  |
| `npm test`                        | Unit tests (Vitest)                                                        |
| `npm run test:e2e`                | Smoke tests (Playwright; run `npx playwright install chromium` once first) |
| `npm run check`                   | lint + typecheck + validate-data + unit tests                              |

## Data

Venue data is stored as JSON in [`data/venues/`](data/venues/). See [`data/README.md`](data/README.md) for the fields and rules. The files there now are fictional **SAMPLE** venues used for development.
