# Feature: Auto Copy-to-Dir for PDF Generation

**Date:** 2026-06-08
**Session:** Soothsayer Analytics auto-pipeline (Report 004)
**Files Modified:**
- `generate-pdf.mjs`
- `config/profile.yml`

---

## Problem

The `generate-pdf.mjs` script required the `--copy-to` path to be typed manually on every run. There was no way to persist a default output directory for generated PDFs.

---

## Solution

Added a `copy_to_dir` setting in `config/profile.yml` that `generate-pdf.mjs` reads automatically. The `--copy-to` flag still works as an explicit override.

---

## Changes

### 1. `config/profile.yml` (line 85)

**Added:**
```yaml
cv:
  output_format: "html"
  canva_resume_design_id: "DAHL-lUFau0"
  copy_to_dir: "C:/Users/yashd/iCloudDrive/Documents_/Resumes/updated_cvs/UK_resumes/base_resumes/resumes_md/tailored/output"
auto_pdf_score_threshold: 3.0
```

**Change:** Added `copy_to_dir` key under the `cv:` section. Value is the target directory where PDFs should be automatically copied after generation.

---

### 2. `generate-pdf.mjs` — 5 changes

#### Change A — Updated header comment (lines 3-16)

**Before:**
```js
/**
 * generate-pdf.mjs — HTML → PDF via Playwright
 *
 * Usage:
 *   node career-ops/generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4]
 *
 * Requires: @playwright/test (or playwright) installed.
 * Uses Chromium headless to render the HTML and produce a clean, ATS-parseable PDF.
 */
```

**After:**
```js
/**
 * generate-pdf.mjs — HTML → PDF via Playwright
 *
 * Usage:
 *   node career-ops/generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4] [--copy-to=<path>]
 *
 *   --copy-to=<path>  Optional. Copies the generated PDF to the specified directory or full path.
 *                     If --copy-to is not provided, reads copy_to_dir from config/profile.yml.
 *                     If a directory is given, the original filename is preserved.
 *                     Example: --copy-to="C:/Users/name/Documents" (copies as <filename>.pdf)
 *                     Example: --copy-to="C:/Users/name/Documents/custom-name.pdf" (renames)
 *
 * Requires: @playwright/test (or playwright) installed.
 * Uses Chromium headless to render the HTML and produce a clean, ATS-parseable PDF.
 */
```

**Why:** Documented the new `--copy-to` flag and the config fallback behaviour.

---

#### Change B — Added `basename` import and `readFileSync` import (line 20-22)

**Before:**
```js
import { resolve, dirname } from 'path';
import { readFile } from 'fs/promises';
import { mkdirSync } from 'fs';
```

**After:**
```js
import { resolve, dirname, basename } from 'path';
import { readFile } from 'fs/promises';
import { mkdirSync, copyFileSync, readFileSync } from 'fs';
```

**Why:** `basename` needed to derive output filename when copying to a directory. `readFileSync` needed to read the config YAML. `copyFileSync` already existed but moved to this import line.

---

#### Change C — Added `CONFIG_PATH` constant and `loadConfigCopyToDir()` function (lines 25-38)

**Added:**
```js
const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, 'config', 'profile.yml');

// Ensure output directory exists (fresh setup)
mkdirSync(resolve(__dirname, 'output'), { recursive: true });

function loadConfigCopyToDir() {
  try {
    const yaml = readFileSync(CONFIG_PATH, 'utf8');
    const match = yaml.match(/copy_to_dir:\s*["']?([^"'\n]+)["']?/);
    if (match && match[1]) return match[1].trim();
  } catch {}
  return null;
}
```

**Why:** Reads `copy_to_dir` from `config/profile.yml` using a simple regex match. Returns `null` if not found (script continues without copying).

---

#### Change D — Added `copyToPath` variable and `--copy-to` flag parsing (lines 111, 116-117)

**Before:**
```js
let inputPath, outputPath, format = 'a4';

for (const arg of args) {
  if (arg.startsWith('--format=')) {
    format = arg.split('=')[1].toLowerCase();
  } else if (!inputPath) {
```

**After:**
```js
let inputPath, outputPath, format = 'a4', copyToPath = null;

for (const arg of args) {
  if (arg.startsWith('--format=')) {
    format = arg.split('=')[1].toLowerCase();
  } else if (arg.startsWith('--copy-to=')) {
    copyToPath = arg.split('=').slice(1).join('=');
  } else if (!inputPath) {
```

**Why:** `copyToPath` variable stores the flag value. The `slice(1).join('=')` pattern handles paths that contain `=` characters (e.g., Windows paths with drive letters).

---

#### Change E — Added config fallback logic (lines 130-137)

**Added before `inputPath = resolve(inputPath)`:**
```js
// Fall back to config copy_to_dir if --copy-to not provided
if (!copyToPath) {
  const configCopyTo = loadConfigCopyToDir();
  if (configCopyTo) {
    copyToPath = configCopyTo;
    console.log(`📋 Using copy_to_dir from config: ${copyToPath}`);
  }
}
```

**Why:** If `--copy-to` was not passed on the command line, check `config/profile.yml`. If `copy_to_dir` exists there, use it automatically. If neither, run without copying (backward compatible).

---

## Behaviour Summary

| Command | Result |
|---------|--------|
| `node generate-pdf.mjs input.html out.pdf` | PDF saved to `out.pdf` + auto-copied to `copy_to_dir` from config |
| `node generate-pdf.mjs input.html out.pdf --copy-to="C:/other/path"` | PDF saved to `out.pdf` + copied to explicit path (override, config ignored) |
| `node generate-pdf.mjs input.html out.pdf` (no config entry) | PDF saved to `out.pdf` only, no copy |

---

## Test Results

**Test 1 — Auto copy from config (no flag):**
```
node generate-pdf.mjs output/003-soothsayer-analytics-cv.html output/004-test-2026-06-08.pdf --format=a4

📋 Using copy_to_dir from config: C:/Users/yashd/iCloudDrive/Documents_/Resumes/updated_cvs/UK_resumes/base_resumes/resumes_md/tailored/output
📄 Input:  E:\workspace\Personal_AI\career-ops\output\003-soothsayer-analytics-cv.html
📁 Output: E:\workspace\Personal_AI\career-ops\output\004-test-2026-06-08.pdf
📏 Format: A4
📋 Copied to: C:\Users\yashd\iCloudDrive\Documents_\Resumes\updated_cvs\UK_resumes\base_resumes\resumes_md\tailored\output\004-test-2026-06-08.pdf
✅ PDF generated
📊 Pages: 2
📦 Size: 109.1 KB
```

**Test 2 — Explicit --copy-to override:**
```
node generate-pdf.mjs output/003-soothsayer-analytics-cv.html output/004-test2-2026-06-08.pdf --format=a4 --copy-to="C:\Users\yashd\iCloudDrive\Documents_\Resumes\updated cvs\UK_resumes\base_resumes\resumes_md\tailored\output"

(no "Using copy_to_dir from config" log — flag takes precedence)
📋 Copied to: C:\Users\yashd\iCloudDrive\Documents_\Resumes\updated cvs\UK_resumes\base_resumes\resumes_md\tailored\output\004-test2-2026-06-08.pdf
✅ PDF generated
```

---

## Related History

| Date | Change | Description |
|------|--------|-------------|
| 2026-06-08 | Undo `pdf_output_dir` auto-save | User asked to undo Option A (auto-output-dir from config). Reverted `generate-pdf.mjs` to original state. |
| 2026-06-08 | Implement Option C (`--copy-to` flag) | User selected Option C. Added `--copy-to` flag to copy PDF after generation. |
| 2026-06-08 | Auto-read from config | User asked to read `copy_to_dir` from `config/profile.yml` instead of typing path each time. Implemented config fallback logic. |
| 2026-06-08 | Add `--copy-filename` flag + Step 3 in oferta.md | User wanted auto-save to resume directory with versioned naming `{candidate}-{role_name}-{company}-cv-{version}.pdf`. Output files unchanged, resume copy uses new naming. |

---

## How to Change the Target Directory

Edit `config/profile.yml`:
```yaml
cv:
  copy_to_dir: "NEW/PATH/HERE"
```

No code changes needed — the script reads this on every run.

---

# Feature: Versioned Resume Auto-Save (Copy with New Naming)

**Date:** 2026-06-08
**Session:** Soothsayer Analytics auto-pipeline (Report 004)
**Files Modified:**
- `generate-pdf.mjs`
- `modes/oferta.md`

---

## Problem

The auto-pipeline did not save a copy of the CV to the user's resumes directory with the desired naming convention. The user wanted:
- Output directory (`career-ops/output/`): unchanged naming (e.g., `004-soothsayer-analytics-2026-06-08.pdf`)
- Resume directory: versioned naming `{candidate}-{role_name}-{company}-cv-{version}.pdf`

---

## Solution

1. Added `--copy-filename` flag to `generate-pdf.mjs` — overrides `copyToPath` when provided, allowing a specific full path for the copy (not just directory)
2. Added Step 3 to `modes/oferta.md` — after evaluation, generates tailored HTML/PDF and saves to both locations with correct naming

---

## Changes

### 1. `generate-pdf.mjs` — Added `--copy-filename` flag

#### Change A — Updated header comment (lines 6-17)

**Before:**
```js
/**
 * generate-pdf.mjs — HTML → PDF via Playwright
 *
 * Usage:
 *   node career-ops/generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4] [--copy-to=<path>]
 *
 *   --copy-to=<path>  Optional. Copies the generated PDF to the specified directory or full path.
 *                     If --copy-to is not provided, reads copy_to_dir from config/profile.yml.
 *                     If a directory is given, the original filename is preserved.
 *                     Example: --copy-to="C:/Users/name/Documents" (copies as <filename>.pdf)
 *                     Example: --copy-to="C:/Users/name/Documents/custom-name.pdf" (renames)
 *
 * Requires: @playwright/test (or playwright) installed.
 * Uses Chromium headless to render the HTML and produce a clean, ATS-parseable PDF.
 */
```

**After:**
```js
/**
 * generate-pdf.mjs — HTML → PDF via Playwright
 *
 * Usage:
 *   node career-ops/generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4] [--copy-to=<dir>] [--copy-filename=<fullpath>]
 *
 *   --copy-to=<dir>          Optional. Copies the generated PDF to the specified directory.
 *                           Original filename is preserved. If not provided, reads copy_to_dir
 *                           from config/profile.yml.
 *   --copy-filename=<path>  Optional. Copies the PDF to this exact full path (overrides --copy-to
 *                           for the copy operation). Use when you need a specific filename.
 *                           Example: --copy-filename="C:/dir/name.pdf"
 *
 * Requires: @playwright/test (or playwright) installed.
 * Uses Chromium headless to render the HTML and produce a clean, ATS-parseable PDF.
 */
```

---

#### Change B — Added `copyFilename` variable + parsing (lines 111-122)

**Before:**
```js
let inputPath, outputPath, format = 'a4', copyToPath = null;

for (const arg of args) {
  if (arg.startsWith('--format=')) {
    format = arg.split('=')[1].toLowerCase();
  } else if (arg.startsWith('--copy-to=')) {
    copyToPath = arg.split('=').slice(1).join('=');
  } else if (!inputPath) {
    inputPath = arg;
  } else if (!outputPath) {
    outputPath = arg;
  }
}
```

**After:**
```js
let inputPath, outputPath, format = 'a4', copyToPath = null, copyFilename = null;

for (const arg of args) {
  if (arg.startsWith('--format=')) {
    format = arg.split('=')[1].toLowerCase();
  } else if (arg.startsWith('--copy-filename=')) {
    copyFilename = arg.split('=').slice(1).join('=');
  } else if (arg.startsWith('--copy-to=')) {
    copyToPath = arg.split('=').slice(1).join('=');
  } else if (!inputPath) {
    inputPath = arg;
  } else if (!outputPath) {
    outputPath = arg;
  }
}
```

---

#### Change C — Copy logic now uses `copyFilename` override (lines 207-217)

**Before:**
```js
// Optional: copy to a secondary location
if (copyToPath) {
  const dest = resolve(copyToPath);
  const isDir = !dest.match(/\.[^\\/]+$/);
  const destPath = isDir
    ? resolve(dest, basename(outputPath))
    : dest;
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(outputPath, destPath);
  console.log(`📋 Copied to: ${destPath}`);
}
```

**After:**
```js
// Optional: copy to a secondary location
// copyFilename takes absolute precedence over copyToPath
const actualCopyDest = copyFilename
  ? resolve(copyFilename)
  : (copyToPath ? resolve(copyToPath) : null);

if (actualCopyDest) {
  const isDir = !actualCopyDest.match(/\.[^\\/]+$/);
  const destPath = isDir
    ? resolve(actualCopyDest, basename(outputPath))
    : actualCopyDest;
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(outputPath, destPath);
  console.log(`📋 Copied to: ${destPath}`);
}
```

**Why:** `copyFilename` overrides `copyToPath` when provided. This allows the flat filename override without disrupting `--copy-to` for other uses (e.g., the auto-dir copy from config).

---

### 2. `modes/oferta.md` — Added Step 3 (Tailored CV Auto-Save)

**New section added after "### 2. Record in tracker" (lines 219-268):**

```markdown
### 3. Generate Tailored CV and Save to Resume Directory

**a) Derive naming variables:**
- `candidate` = kebab-case of `profile.yml → candidate.full_name`
  (e.g., "Yash Dhakade" → "yash-dhakade")
- `role_name` = kebab-case of the JD role title
  (e.g., "Junior AI Engineer" → "junior-ai-engineer")
- `company` = kebab-case of the company name
  (e.g., "Soothsayer Analytics" → "soothsayer-analytics")

**b) Detect version by scanning `{copy_to_dir}/` for existing files:**
- `{copy_to_dir}` = `cv.copy_to_dir` from `config/profile.yml`
- Scan `{copy_to_dir}/` for files matching `{candidate}-{role_name}-{company}-cv-v*.html`
- Count matches → version = v{n+1}, or v1 if none found

**c) Build final filenames:**
- `html_file = output/{###}-{company-slug}-{YYYY-MM-DD}-cv.html`
  (uses the existing report-based naming in career-ops/output/)
- `pdf_file = output/{###}-{company-slug}-{YYYY-MM-DD}.pdf`
  (uses the existing report-based naming in career-ops/output/)
- `resume_pdf = {copy_to_dir}/{candidate}-{role_name}-{company}-cv-{version}.pdf`
- `resume_html = {copy_to_dir}/{candidate}-{role_name}-{company}-cv-{version}.html`

**d) Generate tailored HTML CV:**
- Read `templates/cv-template.html`
- Personalise Summary with JD keywords + exit narrative bridge
- Reorder experience bullets by JD relevance
- Build competency grid (6-8 keyword phrases from JD requirements)
- Select top 3-4 projects matching the JD
- Inject keywords naturally into existing achievements (NEVER invent)
- Write to `html_file`

**e) Generate PDF with --copy-filename:**
node generate-pdf.mjs "{html_file}" "{pdf_file}" --format={letter|a4} --copy-filename="{resume_pdf}"
- `pdf_file` uses existing naming in career-ops/output/ (unchanged)
- `--copy-filename` copies the PDF to the flat resume destination with new naming

**f) Copy HTML source to resumes directory:**
cp "{html_file}" "{resume_html}"

**g) Verify:**
- Confirm `pdf_file` exists in career-ops output
- Confirm `resume_pdf` exists at destination
- Confirm `resume_html` exists at destination

**h) Update tracker entry:** Change PDF column from ❌ to ✅, update path to `resume_pdf`
```

---

## Behaviour Summary

| Command | Result |
|---------|--------|
| `node generate-pdf.mjs input.html out.pdf` | PDF saved to `out.pdf` + auto-copied to `copy_to_dir` (config) |
| `node generate-pdf.mjs input.html out.pdf --copy-to="C:/dir"` | PDF saved to `out.pdf` + copied to `C:/dir/out.pdf` |
| `node generate-pdf.mjs input.html out.pdf --copy-filename="C:/dir/name.pdf"` | PDF saved to `out.pdf` + copied to `C:/dir/name.pdf` (override, ignores config) |
| `node generate-pdf.mjs input.html out.pdf --copy-to="C:/a" --copy-filename="C:/b/name.pdf"` | PDF saved to `out.pdf` + copied to `C:/b/name.pdf` (`--copy-filename` wins) |

---

## Target File Naming

**career-ops/output/ — unchanged:**
```
004-soothsayer-analytics-2026-06-08.pdf
004-soothsayer-analytics-2026-06-08.html
```

**Resume directory — versioned naming:**
```
{yash-dhakade}-{junior-ai-engineer}-{soothsayer-analytics}-cv-{v1}.pdf
{yash-dhakade}-{junior-ai-engineer}-{soothsayer-analytics}-cv-{v1}.html
```

Version detection: scans `{copy_to_dir}/` for `{candidate}-{role_name}-{company}-cv-v*.html` matches.

---

## Test Result

**Test — `--copy-filename` only (no `--copy-to`):**
```
node generate-pdf.mjs output/003-soothsayer-analytics-cv.html output/004-soothsayer-test.pdf --format=a4 --copy-filename="C:\Users\yashd\iCloudDrive\Documents_\Resumes\updated_cvs\UK_resumes\base_resumes\resumes_md\tailored\output\yash-dhakade-junior-ai-engineer-soothsayer-analytics-cv-v1.pdf"

📋 Using copy_to_dir from config: C:/Users/yashd/iCloudDrive/Documents_/Resumes/updated_cvs/UK_resumes/base_resumes/resumes_md/tailored/output
📄 Input:  E:\workspace\Personal_AI\career-ops\output\003-soothsayer-analytics-cv.html
📁 Output: E:\workspace\Personal_AI\career-ops\output\004-soothsayer-test.pdf
📏 Format: A4
📋 Copied to: C:\Users\yashd\iCloudDrive\Documents_\Resumes\updated_cvs\UK_resumes\base_resumes\resumes_md\tailored\output\yash-dhakade-junior-ai-engineer-soothsayer-analytics-cv-v1.pdf
✅ PDF generated
📊 Pages: 2
📦 Size: 109.1 KB
```

File verified at destination.