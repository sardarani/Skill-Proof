# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Skill Proof** (earlier name: "Honest Resume Matcher") — a resume vs. job-description matcher. It is a single static page (`index.html`) plus two Vercel serverless functions in `api/` that call the NVIDIA NIM chat-completions API. Deployed on Vercel (project `skill-proof`, linked via `.vercel/`).

There is no `package.json`, build step, bundler, linter, or test suite. Don't add tooling unless asked.

## Running locally

- UI only (rule-based matcher works fully, AI features fail):
  ```bash
  python3 -m http.server 8000
  ```
  then open `http://localhost:8000/`.
- UI + `/api/*` functions: `vercel dev` from the repo root. Requires `NVIDIA_NIM_API_KEY` in `.env` / `.env.local` (both gitignored).
- Deploy: push to `main` (Vercel Git integration) or `vercel --prod`.

## Architecture

### `index.html` (everything client-side)
One file: `<style>` block, then CDN scripts for PDF.js 3.11.174 and Mammoth 1.6.0 (only used for PDF/DOCX upload), then two IIFE `<script>` blocks:

1. **App script** — find sections by their `/* ---------- ... ---------- */` comments:
   - **Skill dictionary** (`GROUPS`, `MORE`, `DESIGN` → merged into `DICT`, indexed by `BYNAME`). Entries are `[Display name, ...aliases]`. Matching mode per alias is controlled by `EXACT` / `CAP` / `UFORCE` / `IFORCE` sets via `modeFor()` / `makeRe()` — touch these when an acronym or common word produces false matches.
   - **Sectioning**: `sectionResume()` splits the resume by headings (`RES_HEADS`); `sectionJD()` tags each JD line as required / neutral / nice-to-have (`REQ_HEAD`, `NICE_RE`, `NEU_HEAD`, `PRI`).
   - **Analysis**: `analyze(resume, jd)` finds every dictionary term in the JD, then `classify()` labels each as `backed` / `listed` / `wording` / `missing` based on where and how it appears in the resume. `stuffing()` (keyword-stuffing checks) and `parseChecks()` (ATS-parse checks) run alongside.
   - **Role profiles**: `ROLE_CATALOG` (55 roles across `DOMAINS`), `detectRole()`, `expectations()` (per-role "starter pack"), `roleChecks()` (years of experience, bullet impact, portfolio link, etc.).
   - **Rendering**: `render()` → builds tabbed results HTML → `bindAfter()` wires up events. `bindAfter()` also wires the per-skill "✦ Suggest a bullet" buttons, which POST to `/api/suggest`.
   - **Role picker** (searchable combobox), file upload / drag-and-drop (`readPdf`, `readAnyFile`, `loadInto`), and sample inputs (`SAMPLE_JD`, `SAMPLE_RESUME`, design variants).
2. **Cursor trail script** — a canvas comet-trail effect, independent of the app logic.

The rule-based matcher runs entirely in the browser. Only the bullet-suggestion feature sends text to the server: the skill, the JD keyword, the role and the resume's experience bullet lines (`experienceBullets()` drops the header, contact line, summary, education, skills list and job-title lines; `scrubContact()` on both client and server removes emails, links and phone numbers).

### `api/` (Vercel Node function)
- `suggest.js` — `{skill, keyword, role, resume_text}` → `{suggestion}`: one resume bullet that must contain `keyword` (the JD's wording) and only numbers present in `resume_text`; retries once with feedback if not.
- Model defaults to `nvidia/nemotron-3.5-lightning-30b-a3b` (override with `NVIDIA_SUGGEST_MODEL`) with `chat_template_kwargs: {enable_thinking: false}`; that answers in ~1s. `nemotron-3.5-bolt-e4b` was tried and sat in NVIDIA's queue for 40–100s per call. The request aborts after 20s (504) and only `message.content` is used — never `reasoning_content`.

## Design constraints

Read `project/upload/DESIGN-STYLE.md` before visual changes. Key points: colour tokens on `:root` with dark mode via both `prefers-color-scheme` and `[data-theme]`; Urbanist is the only typeface; the lime "sticker on grid paper" motif; the hover-tilt and cursor-trail interactions have deliberate exclusions (e.g. the headline `.sel` highlight, primary CTA, upload buttons — see §7 of that file) that are easy to undo by accident. `project/upload/PRD.md` covers features, non-goals, and known limitations; `SKILL-PROOF-COMPONENT-AUDIT.md` audits UI components.

## Stale docs to be aware of

`README.md`, `project/upload/README.md`, and `MANIFEST.sha256` describe the original backup snapshot: they refer to `project/upload/honest-resume-matcher.html` (since moved to root `index.html`) and say nothing leaves the browser (no longer true for the AI features). Treat `index.html` and `api/` as the source of truth.
