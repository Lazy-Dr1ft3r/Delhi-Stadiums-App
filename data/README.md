# Venue data

Each venue has one JSON file in `data/venues/`, named `<id>.json`, for example `jln-stadium.json`.
The schema lives in [`src/lib/schema.ts`](../src/lib/schema.ts) and is the source of truth. This page summarizes it.

Run `npm run validate-data` after every edit. The build fails if any file is invalid.

## Rules

- **Only verified facts.** Every value must come from a site visit, a phone call, an official notice, or another source you can cite. If you don't know a value, leave the field out.
- **Unknown is not false.** Leave out an optional field (`floodlights`, `spikesAllowed`, …) when you don't know it. Write `false` only when you have confirmed it is false. For enums, use `"unknown"`.
- **`status.lastVerified` is required.** It is an ISO date (`YYYY-MM-DD`) and cannot be in the future. Update it, along with `status.source`, every time you re-check a venue.
- **Sample data:** files with `"isSample": true` are fictional placeholders for development. Every field in them is labelled `SAMPLE`. Delete them when real data arrives (M2).
- Unknown keys are rejected, so a typo fails validation.

## Venue

| Field              | Required | Notes                                                                              |
| ------------------ | -------- | ---------------------------------------------------------------------------------- |
| `id`               | yes      | Lowercase slug, the same as the file name                                          |
| `isSample`         | no       | `true` for placeholder data only                                                   |
| `name`             | yes      | Official name                                                                      |
| `aliases`          | no       | Common local names (defaults to `[]`)                                              |
| `address`          | yes      |                                                                                    |
| `locality`         | yes      | e.g. "Lodhi Road", "Dwarka Sec 11"                                                 |
| `district`         | no       |                                                                                    |
| `coordinates`      | yes      | `{ "lat", "lng" }` in decimal degrees (must fall inside a loose Delhi NCR box)     |
| `operator`         | yes      | `SAI` · `DDA` · `Delhi Govt` · `MCD` · `NDMC` · `University` · `Private` · `Other` |
| `operatorName`     | no       | e.g. a specific department or college                                              |
| `website`, `phone` | no       |                                                                                    |
| `facilities`       | yes      | At least one; facility `id`s must be unique within the venue                       |
| `photos`           | no       | Only our own images or properly licensed ones                                      |

## Facility (`type: "running_track"`)

| Field                                                                                                   | Required | Notes                                                                              |
| ------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `id`                                                                                                    | yes      | Slug, unique within the venue, e.g. `main-track`                                   |
| `type`                                                                                                  | yes      | `running_track` (other types come later)                                           |
| `details.lengthMeters`                                                                                  | yes      | 400, 300, 200 …                                                                    |
| `details.surface`                                                                                       | yes      | `synthetic` · `cinder` · `grass` · `mud` · `concrete` · `unknown`                  |
| `details.lanes`, `certified`, `spikesAllowed`, `floodlights`, `warmupArea`, `fieldEventsArea`, `indoor` | no       | Leave out if unknown                                                               |
| `access.publicEntry`                                                                                    | yes      | `open` · `membership` · `registered_athletes_only` · `restricted` · `unknown`      |
| `access.fees`, `hours`, `notes`                                                                         | no       | Free text, e.g. `"₹50/day; ₹500/month"`                                            |
| `access.coachingAvailable`                                                                              | no       |                                                                                    |
| `status.state`                                                                                          | yes      | `open` · `closed` · `under_renovation` · `restricted` · `unknown`                  |
| `status.reason`                                                                                         | no       | e.g. "Resurfacing until March"                                                     |
| `status.lastVerified`                                                                                   | yes      | `YYYY-MM-DD`                                                                       |
| `status.source`                                                                                         | yes      | `site_visit` · `phone_call` · `official_notice` · `news` · `user_report` · `other` |
| `status.sourceUrl`                                                                                      | no       | Link to the notice or article                                                      |
