# Honest Resume Matcher — Project Backup

This folder is a complete backup of the project: the product spec, the design system, and the
actual working app, all in one place so the project can be restored, handed off, or rebuilt from
scratch if needed.

## What's in this package

| File | What it is |
|---|---|
| `honest-resume-matcher.html` | **The actual app.** A single self-contained HTML file — open it directly in any browser, or publish it as a static page. No build step, no server, no dependencies to install. |
| `PRD.md` | Product Requirements Document — the problem, the solution, every feature, explicit non-goals, known limitations, and ideas for what's next. |
| `DESIGN-STYLE.md` | The full visual and interaction design system — colour tokens, typography, the sticker/grid-paper motif, copy voice with before/after examples, and exact specs for the hover-tilt and cursor-trail interactions. |
| `README.md` | This file. |

## How to run it

Just open `honest-resume-matcher.html` in a browser. That's it — there's nothing to install.

Two things load from a CDN at runtime (only triggered when someone uploads a PDF or DOCX file):

- `pdf.js` (PDF text extraction)
- `Mammoth.js` (DOCX text extraction)

If those CDN calls are ever blocked (e.g. on a locked-down network), file upload for that format
will show a clear error; pasting text always works regardless.

Everything else — the skill-matching engine, the role catalog, the keyword-stuffing checks, the
ATS-parse checks, the UI, and the animations — is plain HTML/CSS/JavaScript with no external
calls. Nothing the user types or uploads ever leaves their browser.

## How to pick this project back up

1. Read `PRD.md` first for what the product does and why each feature exists.
2. Read `DESIGN-STYLE.md` for the visual language and interaction specs before changing anything
   visual — the lime "sticker" motif and the 18°-tilt / cursor-trail interactions were tuned
   iteratively and have specific exclusions (see §7 of that file) that are easy to accidentally
   undo.
3. The whole app is one file. Search it by section comments in the `<script>` block, e.g.:
   - `Skill dictionary` — the ~716-entry skill/alias list
   - `Role profiles` / `ROLE_CATALOG` — the 55-role catalog with per-role expected skills
   - `Role picker` — the searchable combobox UI logic
   - `Analysis` — the core matching engine
   - `Rendering` — turns analysis results into HTML

## Project history (high level)

Built iteratively in conversation with Claude, roughly in this order:

1. Initial build: two-panel resume/JD comparison, four-way match classification (Backed / Only
   listed / Different wording / Missing), keyword-stuffing checks, "what the ATS sees" parsing
   checks — positioned against Jobscan and similar competitors.
2. Expanded the skill dictionary from ~200 to ~616 entries across many professional fields.
3. Added Product Designer / UX Designer / Design Engineer specialization, grounded in real job
   postings sampled from Greenhouse, Lever, Ashby, and aggregator sites — added role detection,
   per-role "starter pack" expectations, and role-specific resume checks (years of experience,
   bullet impact, portfolio link, collaboration language, shipped-work language, research-method
   coverage, design/code balance).
4. Rebuilt the role selector as a searchable, domain-filtered combobox and expanded the catalog
   to 55 roles across 10 domains.
5. Added PDF/DOCX/TXT upload and drag-and-drop for the job description (mirroring the resume
   upload that already existed).
6. Restyled the whole page to a lime-green "sticker on grid paper" identity based on two
   reference brand images, and tightened all copy to a shorter, more direct voice.
7. Refined interaction details on request: CTA hierarchy (primary action promoted above
   secondary actions), conditional visibility for the colour-key legend and the "Start fresh"
   control, a centered headline, an 18°-on-hover tilt for lime elements (with specific exclusions
   for the primary CTA and upload buttons), and finally a neon-green "comet trail" cursor effect
   modeled on a reference video.

## Known limitations (see PRD.md §8 for full detail)

- Only the Product Designer, UX Designer, and Design Engineer skill lists are grounded in actual
  scraped job postings; the other 52 roles' "starter pack" lists are Claude's general knowledge.
- It's a rule-based matcher, not an AI reviewer — it can't judge writing quality, only whether
  specific terms appear and where.
- Acronyms can collide (e.g. "CA" as a qualification vs. a place); the "Not relevant" control on
  each skill exists to let a user dismiss a false match.
