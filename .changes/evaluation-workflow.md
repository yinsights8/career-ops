# Evaluation Workflow — URL Input to Output Delivery

## Overview

Two entry paths converge into the same A-G evaluation pipeline:

```
User pastes URL ──► auto-pipeline.md (interactive)
data/pipeline.md ──► pipeline.md (batch/inbox)
                           │
                           ▼
                  Extract JD (Playwright / WebFetch / WebSearch)
                           │
                           ▼
                  Pre-checks (cv-sync-check, read cv.md, _profile.md, article-digest.md)
                           │
                           ▼
                  Archetype Detection (6 archetypes)
                           │
                           ▼
                  ┌─────────────────────────────┐
                  │   Blocks A-G Evaluation     │
                  │  (modes/oferta.md)          │
                  ├─────────────────────────────┤
                  │ A) Role Summary             │
                  │ B) Match with CV            │
                  │ C) Level and Strategy       │
                  │ D) Comp and Demand          │
                  │ E) Customization Plan       │
                  │ F) Interview Plan (STAR+R)  │
                  │ G) Posting Legitimacy       │
                  └─────────────────────────────┘
                           │
                           ▼
                   Global Score (1-5)
                           │
                           ▼
                  Save Report .md ──► reports/{###}-{slug}-{date}.md
                           │
                           ▼
                  Score ≥ threshold? ──no──► Mark PDF ❌
                           │
                          yes
                           │
                           ▼
                  Generate Tailored PDF (Playwright: HTML → PDF)
                           │
                           ▼
                  Score ≥ 4.5? ──yes──► Draft Application Answers
                           │
                           ▼
                  Write TSV to batch/tracker-additions/
                           │
                           ▼
                  (Post-session) merge-tracker.mjs ──► data/applications.md
```

---

## Path A: Interactive (auto-pipeline.md)

Triggered when user pastes a job URL without a subcommand.

### Step 0 — Extract JD

| Method | Target | Priority |
|--------|--------|----------|
| Playwright (browser_navigate + browser_snapshot) | SPA portals (Lever, Ashby, Greenhouse, Workday) | 1 (preferred) |
| WebFetch | Static pages (ZipRecruiter, company career pages) | 2 (fallback) |
| WebSearch | Secondary indexing portals | 3 (last resort) |

If all fail → ask user to paste text or screenshot.

**Special cases:**
- LinkedIn → mark `[!]` (login required), ask user to paste text
- PDF URLs → read directly with Read tool
- `local:` prefix → read local file (e.g. `local:jds/linkedin-pm-ai.md`)

### Step 1 — A-G Evaluation (modes/oferta.md)

**Pre-checks (rules in _shared.md):**
- Read `cv.md`, `_profile.md`, `article-digest.md` if exists
- First eval of session: run `node cv-sync-check.mjs`
- Detect role archetype → adapt framing per `_profile.md`

**Archetype Detection** (classify into one, or hybrid of 2):

| Archetype | Key signals in JD |
|-----------|-------------------|
| AI Platform / LLMOps | "observability", "evals", "pipelines", "monitoring" |
| Agentic / Automation | "agent", "HITL", "orchestration", "workflow" |
| Technical AI PM | "PRD", "roadmap", "discovery", "stakeholder" |
| AI Solutions Architect | "architecture", "enterprise", "integration" |
| AI Forward Deployed | "client-facing", "deploy", "prototype" |
| AI Transformation | "change management", "adoption", "enablement" |

**Block A — Role Summary** (`oferta.md:13-21`)
- Table: Archetype, Domain, Function, Seniority, Remote, Team size, TL;DR

**Block B — Match with CV** (`oferta.md:24-39`)
- Table mapping each JD requirement to exact lines in CV
- Gaps section: 4 questions per gap (hard blocker? adjacent experience? portfolio project? mitigation plan?)
- Framing adapts to archetype (FDE → delivery speed, SA → system design, PM → discovery, etc.)

**Block C — Level and Strategy** (`oferta.md:42-46`)
- JD seniority vs candidate's natural level
- "Sell senior without lying" plan with archetype-specific phrases
- "If they downlevel me" plan (accept if comp fair, 6-month review, clear criteria)

**Block D — Comp and Demand** (`oferta.md:49-54`)
- WebSearch: Glassdoor, Levels.fyi, Blind for current salaries
- Company compensation reputation
- Demand trend for role
- Table with cited sources

**Block E — Customization Plan** (`oferta.md:57-64`)
- Top 5 CV changes + Top 5 LinkedIn changes
- Table: Section, Current status, Proposed change, Why

**Block F — Interview Plan** (`oferta.md:67-87`)
- 6-10 STAR+R stories mapped to JD requirements
- Checks `interview-prep/story-bank.md` for existing stories, appends new ones
- 1 recommended case study + red-flag Q&A
- Stories selected and framed by archetype

**Block G — Posting Legitimacy** (`oferta.md:89-142`)
- 5 signal categories analyzed:
  1. Posting Freshness (from Playwright snapshot)
  2. Description Quality (specificity, realism, contradictions)
  3. Company Hiring Signals (WebSearch layoffs/freeze)
  4. Reposting Detection (scan-history.tsv)
  5. Role Market Context (qualitative)
- **Output:** High Confidence / Proceed with Caution / Suspicious
- **Does NOT affect 1-5 score** — separate qualitative assessment
- Edge cases: government/academic, evergreen, niche/executive, startup, no date, recruiter-sourced

**Scoring System** (`_shared.md:29-44`):

| Dimension | Description |
|-----------|-------------|
| Match con CV | Skills, experience, proof points alignment |
| North Star alignment | Fit with user's target archetypes (from _profile.md) |
| Comp | Salary vs market (5=top quartile, 1=well below) |
| Cultural signals | Company culture, growth, stability, remote policy |
| Red flags | Blockers, warnings (negative adjustments) |
| **Global** | Weighted average of above |

Score interpretation:
- 4.5+ → Strong match, apply immediately
- 4.0-4.4 → Good match, worth applying
- 3.5-3.9 → Decent, apply only with specific reason
- Below 3.5 → Recommend against applying

### Step 2 — Save Report .md (`oferta.md:149-199`)

```
reports/{###}-{company-slug}-{YYYY-MM-DD}.md
```

Format:
```
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**URL:** {url}
**Archetype:** {detected}
**Score:** {X/5}
**Legitimacy:** {tier}
**PDF:** {path or pending}

---
## A) Role Summary
## B) Match with CV
## C) Level and Strategy
## D) Comp and Demand
## E) Customization Plan
## F) Interview Plan
## G) Posting Legitimacy
## H) Draft Application Answers (only if score >= 4.5)
---
## Keywords extracted
```

### Step 3 — Generate Tailored PDF (`auto-pipeline.md:28-60`)

**Gate:** Only if score ≥ `auto_pdf_score_threshold` (`config/profile.yml:91`, default `3.0`).

Generation:
1. Read `templates/cv-template.html`
2. Extract 15-20 keywords from JD
3. Detect language (EN default) & location (letter or A4)
4. Rewrite Professional Summary with keywords
5. Select top 3-4 projects matching JD
6. Reorder experience bullets by relevance
7. Build competency grid (6-8 keyword phrases)
8. Inject keywords into existing achievements (NEVER invent)
9. Write HTML → `node generate-pdf.mjs` (Playwright render)
10. Copy to `cv.copy_to_dir`

**ATS rules:** Single-column, standard headers, no text in images, UTF-8, selectable text.

### Step 4 — Draft Application Answers (`auto-pipeline.md:62-96`)
- **Only if score ≥ 4.5**
- Extract form questions (Playwright) or use generic questions
- Tone: "I'm choosing you" — confident, specific, concrete
- 2-4 sentences per response, no fluff

### Step 5 — Update Tracker (`auto-pipeline.md:98-102`)

Write TSV to `batch/tracker-additions/{###}-{company-slug}.tsv`:
```
{num}\t{date}\t{company}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

Columns: `num | date | company | role | status | score | pdf | report | notes`

**NEVER edit `data/applications.md` directly** — always write TSV additions.

### Step 6 — Merge Tracker (`merge-tracker.mjs`)

Run post-session (or batch after multiple evals):
- Reads all TSV files from `batch/tracker-additions/`
- Dedup by normalized company + fuzzy role + report number
- If duplicate with higher score → update in-place
- Normalizes report links relative to tracker's dir
- Validates statuses against `templates/states.yml`
- Moves processed TSVs to `batch/tracker-additions/merged/`

---

## Path B: Pipeline — Batch Inbox Processing (pipeline.md)

Triggered by `/career-ops pipeline`.

1. **Read** `data/pipeline.md` → find all `- [ ]` pending URLs
2. **For each pending URL:**
   - Calculate next `REPORT_NUM` (max in `reports/` + 1)
   - Extract JD (Playwright → WebFetch → WebSearch)
   - If URL inaccessible → mark `- [!]` and continue
   - Execute full auto-pipeline (Steps 1-5 above)
   - Move from Pending to Processed: `- [x] #NNN | URL | Company | Role | Score/5 | PDF ✅/❌`
3. **Parallelism:** If 3+ pending URLs, launch parallel agents
4. **End:** Show summary table (Company, Role, Score, PDF, Recommended action)

**Headless batch mode** (via `batch/batch-runner.sh` + `batch-evaluate-final.mjs`):
- Uses WebFetch instead of Playwright
- Reports marked `**Verification:** unconfirmed (batch mode)`
- Same evaluation logic via `batch/batch-prompt.md` (self-contained, has all rules)

---

## Key Files Reference

| File | Role in workflow |
|------|-----------------|
| `modes/auto-pipeline.md` | Orchestrates full end-to-end flow |
| `modes/oferta.md` | Defines Blocks A-G evaluation structure |
| `modes/_shared.md` | System rules, scoring, archetypes, tools |
| `modes/_profile.md` | User personalization (archetypes, narrative, negotiation) |
| `modes/pipeline.md` | Inbox processing orchestration |
| `config/profile.yml` | Candidate identity, targets, comp ranges |
| `cv.md` | Source-of-truth CV |
| `article-digest.md` | Detailed proof points (overrides cv.md metrics) |
| `templates/cv-template.html` | CV HTML template with placeholders |
| `templates/states.yml` | Canonical statuses (Evaluated, Applied, etc.) |
| `generate-pdf.mjs` | Playwright HTML→PDF engine |
| `merge-tracker.mjs` | TSV → tracker merge + dedup + link normalization |
| `batch/batch-prompt.md` | Self-contained batch worker prompt (Path B) |
| `batch/batch-evaluate-final.mjs` | Batch orchestrator |
| `data/applications.md` | Application tracker (read by merge-tracker) |
| `data/pipeline.md` | URL inbox |
| `data/scan-history.tsv` | Scanner dedup history (reposting detection) |
| `reports/{###}-{slug}-{date}.md` | Evaluation report output |
| `output/{###}-{slug}-{date}.pdf` | Tailored CV PDF output |

## Data Sources at Evaluation Time

| Data | Source | When |
|------|--------|------|
| Candidate identity, comp targets | `config/profile.yml` | Always |
| CV content | `cv.md` | Always |
| Archetypes, narrative, location policy | `modes/_profile.md` | Always |
| Detailed proof points | `article-digest.md` | If exists (takes precedence over cv.md) |
| Writing style | `_profile.md` → `## Writing Style` | If cached |
| Company reputation | WebSearch | Always (Block D & G) |
| Salary benchmarks | WebSearch (Glassdoor, Levels.fyi) | Always (Block D) |
| Reposting history | `data/scan-history.tsv` | Always (Block G) |
| STAR stories | `interview-prep/story-bank.md` | If exists (Block F) |
| CV template | `templates/cv-template.html` | When generating PDF |

## Rules & Constraints

- **NEVER** hardcode metrics — read from cv.md + article-digest.md at eval time
- **NEVER** invent experience or metrics
- **NEVER** modify cv.md or portfolio files
- **NEVER** submit applications — always stop before clicking Submit
- **NEVER** edit applications.md to add entries — always write TSV
- **YES** edit applications.md to update status/notes of existing entries
- All reports MUST include `**URL:**` and `**Legitimacy:** {tier}` in header
- Report numbering: sequential 3-digit zero-padded, max existing + 1
- After each batch of evaluations, run `node merge-tracker.mjs`
- If company+role already exists in tracker, update existing entry
