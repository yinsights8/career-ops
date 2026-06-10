# Bug Fix: Dashboard Report Viewer Path Resolution

**Date:** 2026-06-08
**Session:** Dashboard bug investigation (Soothsayer Analytics report)
**Files Modified:**
- `dashboard/main.go`
- `dashboard/internal/data/career.go`
- `dashboard/internal/ui/screens/pipeline.go`
- `modes/auto-pipeline.md`

---

## Problem

When pressing Enter on a report entry in the career-ops dashboard, the viewer showed:

```
Error reading file: open E:\workspace\Personal_AI\reports\002-soothsayer-analytics-2026-06-08.md: The system cannot find the path specified.
```

The report was stored at `data/applications.md` with a link `../reports/002-soothsayer-analytics-2026-06-08.md` (relative to the `data/` directory), but the dashboard joined this directly with `careerOpsPath`, producing `E:\workspace\Personal_AI\career-ops\../reports\...` which resolved to `E:\workspace\Personal_AI\reports\...` — missing the `career-ops` directory entirely.

Two root causes:
1. **Trailing backslash in `--path` flag:** When `--path "E:\workspace\Personal_AI\career-ops\"` was passed, `filepath.Join` with `..` would escape the career-ops directory
2. **`..` in report links:** The stored link `../reports/...` was never being resolved to a clean path

---

## Solution

Three-part fix at the source (parsing), startup (path cleaning), and point-of-use (filepath.Clean):

---

## Changes

### 1. `dashboard/main.go` — Path normalization at startup

**Changed (line 158):**
```go
// Before:
careerOpsPath := *pathFlag

// After:
careerOpsPath := filepath.Clean(*pathFlag)
```

**Why:** Removes trailing separators from the `--path` argument so `filepath.Join` with `..` works correctly. Also added `"path/filepath"` to imports.

**Verification:** `filepath.Clean("E:\path\to\dir\")` → `"E:\path\to\dir"` (no trailing backslash)

---

### 2. `dashboard/internal/data/career.go` — Strip `../` prefix from report links

**Added (lines 99-106):**
```go
// Parse report link
if rm := reReportLink.FindStringSubmatch(fields[7]); rm != nil {
    app.ReportNumber = rm[1]
    app.ReportPath = rm[2]
    if strings.HasPrefix(app.ReportPath, "../") {
        app.ReportPath = strings.TrimPrefix(app.ReportPath, "../")
    }
}
```

**Why:** Report links in `data/applications.md` are stored relative to the tracker file's location (`data/`), using `../reports/...` format. When the dashboard parses these, it now strips the `../` prefix so the path is `reports/...` (relative to career-ops root), which `filepath.Join(careerOpsPath, "reports/...")` correctly resolves.

---

### 3. `dashboard/internal/ui/screens/pipeline.go` — Clean path before use

**Changed (line 335):**
```go
// Before:
fullPath := filepath.Join(m.careerOpsPath, app.ReportPath)

// After:
fullPath := filepath.Clean(filepath.Join(m.careerOpsPath, app.ReportPath))
```

**Why:** Defensive fix — even with clean report paths, `filepath.Clean` resolves any `..` components and normalizes separators. Ensures the viewer always receives an absolute, clean path.

---

### 4. `modes/auto-pipeline.md` — Step 3 now passes `--copy-filename`

**Changed:** Step 3 was a single line delegating to `modes/pdf.md`. Now it inlines the full PDF generation logic with proper naming and `--copy-filename` pass-through.

**Before:**
```markdown
## Step 3 — Generate PDF

Read `config/profile.yml`. Check `cv.output_format`:

- If `"latex"`, execute the full pipeline from `modes/latex.md`
- Otherwise (default), execute the full pipeline from `modes/pdf.md`
```

**After:**
```markdown
## Step 3 — Generate PDF

1. **Derive naming variables:**
   - `candidate` = kebab-case of `profile.yml → candidate.full_name` (e.g., "Yash Dhakade" → "yash-dhakade")
   - `role_name` = kebab-case of the JD role title (e.g., "Junior AI Engineer" → "junior-ai-engineer")
   - `company` = kebab-case of the company name (e.g., "Prisma AI" → "prisma-ai")
   - `date` = YYYY-MM-DD (current date)
   - `report_num` = the zero-padded report number (e.g., "005")

2. **Build output filenames:**
   - `html_file = output/{report_num}-{company}-{date}-cv.html`
   - `pdf_file = output/{report_num}-{company}-{date}.pdf`

3. **Detect version by scanning `copy_to_dir`:**
   - `copy_to_dir` = `cv.copy_to_dir` from `config/profile.yml`
   - Scan `copy_to_dir/` for files matching `{candidate}-{role_name}-{company}-cv-v*.pdf`
   - Count matches → `version = v{n+1}`, or `v1` if none found

4. **Build resume destination path:**
   - `resume_pdf = {copy_to_dir}/{candidate}-{role_name}-{company}-cv-{version}.pdf`

5. **Generate PDF:**
   - Read `templates/cv-template.html` and generate tailored HTML with JD keywords
   - Write to `html_file`
   - Execute: `node generate-pdf.mjs "{html_file}" "{pdf_file}" --format={letter|a4} --copy-filename="{resume_pdf}"`
   - Copy HTML to: `{copy_to_dir}/{candidate}-{role_name}-{company}-cv-{version}.html`

6. **Verify:**
   - Confirm `pdf_file` exists in career-ops output
   - Confirm `resume_pdf` exists at destination
   - Confirm `resume_html` exists at destination
```

**Why:** The previous delegation to `modes/pdf.md` used `/tmp/` naming and didn't pass `--copy-filename`, so PDFs were copied to `copy_to_dir` with the output filename (e.g., `005-prisma-ai-2026-06-08.pdf`) instead of the proper resume naming (e.g., `yash-dhakade-junior-ai-engineer-prisma-ai-cv-v1.pdf`).

---

## Test Results

**Dashboard — Soothsayer Analytics report:**
```
wt -w 0 nt E:\workspace\Personal_AI\career-ops\dashboard\career-dashboard --path "E:\workspace\Personal_AI\career-ops\"
```
Press Enter on Soothsayer Analytics → Report opens correctly. ✅

**Abound auto-pipeline (Report 007):**
```
PDF generated: output/007-abound-2026-06-08.pdf
Copied to: yash-dhakade-graduate-data-scientist-abound-cv-v1.pdf
HTML copied: yash-dhakade-graduate-data-scientist-abound-cv-v1.html
```
Filename correctly includes candidate-role-company naming. ✅

---

## Related History

| Date | Change | Description |
|------|--------|-------------|
| 2026-06-08 | Dashboard path fix (trailing backslash) | Added `filepath.Clean` to `careerOpsPath` at startup |
| 2026-06-08 | Dashboard path fix (strip `../`) | Added prefix stripping in `career.go` report link parser |
| 2026-06-08 | Dashboard path fix (Clean on use) | Added `filepath.Clean` in `pipeline.go` before opening viewer |
| 2026-06-08 | auto-pipeline Step 3 fix | Inlined PDF generation with proper `--copy-filename` naming |