# Apify Provider Integration

**Date:** 2026-06-12
**Session:** Add Apify as a career-ops scan source
**Files Added:**
- `providers/apify.mjs`

**Files Modified:**
- `portals.yml`
- `scan.mjs`

---

## Problem

`career-ops scan` could only discover jobs from built-in ATS/board providers plus websearch fallbacks. There was no way to plug in Apify actors for aggregated job sources such as LinkedIn, Indeed, or Glassdoor.

---

## Solution

Added a new first-class Apify provider that reuses the existing provider contract (`fetch(entry, ctx) => [{title, url, company, location}]`) and added three example `portals.yml` entries configured to scrape LinkedIn, Indeed, and Glassdoor via Apify. Also fixed env loading in `scan.mjs` so `.env`-based keys are available before provider execution.

---

## Changes

### 1. `providers/apify.mjs` — new provider
- Added `id: 'apify'` with explicit-routing `detect()` returning `null`, so it is only selected when `provider: apify` is set.
- Reads the configurable key from `process.env.APIFY_API_KEY`.
- Starts an actor run with `entry.apify_actor_id` and optional `entry.apify_input`, then polls `.../runs/{runId}` until success.
- Fetches dataset items from `defaultDatasetId` and normalizes them into the standard job shape (`title`, `url`, `company`, `location`, `source`).
- Supports optional overrides: `apify_defaultTimeoutSec`, `apify_waitTimeoutSec`, `apify_pollIntervalMs`, `apify_startMaxItems`, `apify_maxResults`.
- Filters out results without a valid HTTP URL before returning them.

### 2. `portals.yml` — example Apify entries
- Added three example tracked companies under a new `Apify job sources` section.
- Each entry uses `provider: apify` and provides an `apify_actor_id` plus ready-to-use search input for LinkedIn, Indeed, and Glassdoor.
- Repaired an unintended duplicate OpenAI mapping introduced during the first portal patch.

### 3. `scan.mjs` — dotenv bootstrap
- Added a top-level `dotenv` bootstrap block so `career-ops/.env` is loaded before providers execute.
- This makes `APIFY_API_KEY` and other env-based settings available during scan runs.

---

## Verification

- Ran `node scan.mjs --dry-run` successfully after YAML repair; scan resolves 85 providers and reaches the pipeline summary phase.
- Ran the single-company preview for the LinkedIn Apify entry; provider loads correctly and reports actor-not-found for the placeholder actor id, confirming the wiring is correct.
- `node -e "...parse portals.yml..."` now exits 0.

---

## Notes / Next Steps

- Replace the example actor IDs with the real Apify actor names you want to use.
- If you want, I can also wire a generic `direct_url` mode so plain search-result URLs can be normalized and added as tracked entries.
