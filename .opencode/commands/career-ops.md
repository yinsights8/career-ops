---
description: career-ops command center — show menu, or evaluate a JD by passing it as an argument (text or URL)
---

Read `CLAUDE.md` for system context and data contract rules.

If `$ARGUMENTS` is empty or not provided:
- Read `.agents/skills/career-ops/SKILL.md`
- Load `modes/_shared.md`
- Execute **discovery mode**: show the full command menu

If `$ARGUMENTS` is a known sub-command (scan, deep, pdf, oferta, ofertas, apply, batch, tracker, pipeline, contacto, training, project, interview-prep, patterns, followup, update, latex):
- Read `.agents/skills/career-ops/SKILL.md`
- Route to that sub-command mode as defined in the skill router
- Load `modes/_shared.md` + the relevant mode file

If `$ARGUMENTS` contains JD text or a URL (not a sub-command):
- Read `.agents/skills/career-ops/SKILL.md`
- Execute **auto-pipeline** mode: evaluate + report + PDF + tracker
- Load `modes/_shared.md` + `modes/auto-pipeline.md`

Arguments: $ARGUMENTS
