# Honest Resume Matcher — Product Requirements Document

**Status:** Live, single-file prototype
**Owner:** (you)
**Format:** Self-contained HTML/CSS/JS artifact — no backend, no build step, no signup

---

## 1. Problem

Existing resume-to-job-description matchers (Jobscan, Teal, SkillSyncer, ResyMatch, JobScoutly,
Resume Optimizer Pro, etc.) share four recurring complaints, found via competitor research:

1. **Keyword stuffing is rewarded.** Match-rate scores reward density, not truth. A recruiter
   once gave a candidate's real resume a 16% score for not repeating "recruiting" enough times,
   even though it had already produced 12+ interviews.
2. **Scores aren't trusted.** No third-party tool runs a resume through a company's real ATS, so
   every score is an estimate — but tools present them as authoritative.
3. **The business model is adversarial.** The free score exists to alarm the user into a paid
   subscription (Jobscan: $49.95/mo); the fix is paywalled, not the diagnosis.
4. **Poor semantic matching.** Exact-keyword tools miss equivalent phrasing ("campus recruiter"
   vs. "university recruiter") and don't distinguish a claimed skill from a proven one.

## 2. Solution

A free, single-page, client-side tool that:

- Compares a resume against a job posting and buckets every named skill into
  **Backed / Only listed / Different wording / Missing**, based on whether the skill appears in
  a real experience bullet — not just anywhere in the document.
- Flags **keyword stuffing** (oversized skills lists, repeated terms, sentences copy-pasted
  verbatim from the posting) instead of rewarding it.
- Shows **"what the ATS sees"** — the resume's extracted plain text — so users can catch parsing
  problems (glued words, missing headings, garbled characters, two-column layouts) themselves.
- Runs entirely in the browser. Nothing is uploaded to a server. This is stated on the page.
- Is free, with no account, no paywall, and no score gating the actual feedback.

## 3. Target users

Primary: job seekers applying to knowledge-work roles, with **extra depth for Product Design,
UX Design, and Design Engineering** roles (the initial specialization, based on scraped postings
from Greenhouse, Lever, Ashby, and aggregator sites).

Secondary: 55 roles total across 10 domains — Design, Engineering, Data & AI, Product,
Marketing, Sales & Customer, Finance, People, Operations, and a handful of other fields
(legal, clinical research). See `DESIGN-STYLE.md` / the HTML source for the full role catalog.

## 4. Core features

### 4.1 Inputs
- Two text areas: resume and job description.
- File upload for both (PDF, DOCX, TXT), parsed client-side with pdf.js and Mammoth.js.
- Drag-and-drop onto either panel.
- Two one-click examples (a Product Designer scenario and a Backend Engineer scenario) for
  trying the tool without a real resume.

### 4.2 Matching engine
- A built-in dictionary of **~716 skill groups** (skill name + aliases + case rules), spanning
  tech, design, business, and other professional fields.
- Skills are also extracted heuristically from the job post (capitalized tools, acronyms,
  hyphenated tech terms) even if they're not in the dictionary.
- Each match is classified by re-reading the resume's structure (sectioned into header /
  summary / skills list / experience / other) and checking whether the skill occurs specifically
  inside an experience/projects bullet ("backed"), only in the skills list or summary
  ("only listed"), only under a different wording ("different wording", using stemming to catch
  plurals/verb forms), or not at all ("missing").
- Required vs. nice-to-have priority is inferred from the job post's own section headers
  ("Requirements" vs. "Nice to have" vs. neutral).

### 4.3 Keyword-stuffing / honesty checks
- Flags skills-list bloat (30+ items), skills repeated 5+ times, more "claimed" skills than
  "proven" ones, and any 8-word-or-longer phrase copied verbatim from the posting.

### 4.4 "What the ATS sees"
- Renders the resume's plain-text extraction with matched terms highlighted, plus a checklist:
  email found, phone found, enough date ranges to compute tenure, an Experience/Projects
  heading, a Skills heading, no garbled characters, no glued-together words, plausible reading
  order (flags likely multi-column layouts), and a sane word count.

### 4.5 Role targeting
- A searchable, domain-filterable role picker (55 roles / 10 domains) with fuzzy matching by
  title, shorthand (PM, HR, ML), domain, or skill.
- Auto-detects the role from the job post's title by default; a Reset control returns to
  auto-detect.
- Per-role "starter pack": ~14–16 skills that recur in postings for that role even when a given
  posting doesn't name them, each marked Backed / Only listed / Missing against the resume.
- Per-role resume checks:
  - **All roles with a detected type:** years-of-experience match (parses date ranges to
    estimate tenure), bullet-level "impact" ratio (bullets containing a number or % result).
  - **Design roles (Product Designer, UX Designer, Design Engineer, and related):** portfolio
    link detection (Behance, Dribbble, Framer, Read.cv, personal domains, etc.), collaboration
    language (mentions of PMs/engineers/stakeholders), shipped-work language.
  - **UX-kind roles:** research-method coverage (usability testing, interviews, surveys, card
    sorting, etc.).
  - **Design Engineer:** a code/GitHub link check and a design-skills-vs-code-skills balance
    check.
  - **Engineering/data-engineering roles:** a code-link check.

### 4.6 Output
- A plain-language summary ("10 of 29 proven. 14 missing, 6 of them required.").
- Four colour-coded groups (Backed / Only listed / Different wording / Missing) with per-skill,
  plain-English guidance.
- A "Bring them back" control to un-ignore any skill dismissed as "Not relevant."

## 5. Explicit non-goals

- **Not a real ATS simulator.** The tool says so, in the footer, on every load.
- **No score out of 100.** Deliberately avoided — this was the #1 complaint about competitors.
- **No AI/LLM calls, no network requests, no analytics.** Everything (matching, parsing, role
  logic) is rule-based JavaScript running in the browser. This is a privacy and trust feature,
  not just a technical choice.
- **No login, no saved history, no payment.**

## 6. Design & interaction requirements (summary — see DESIGN-STYLE.md for full spec)

- Visual identity: lime-green "sticker on grid paper" look, inspired by two reference brand
  images (a headline with a highlighted word and stat callouts on tilted stickers, and a
  laptop-mockup ad with lime stickers).
- Copy voice: short, direct, a little cheeky ("They asked. You ghosted." / "All talk, no
  receipts."), never at the expense of clarity on errors or the non-ATS disclaimer.
- Micro-interactions:
  - Every lime-green element tilts 18° clockwise on hover (slow, springy), except the "Prove"
    text highlight, the two upload buttons, and the main "Check my resume" button, which stay
    upright so primary actions never wobble.
  - A neon-green "comet trail" follows the cursor (and touch drags) across the whole page —
    a bright glowing head with a thick, tapering, fading tail — purely decorative, click-through,
    and disabled under `prefers-reduced-motion`.
- Fully responsive (mobile through desktop) and dark-mode aware (`prefers-color-scheme` plus a
  manual `data-theme` override hook already wired into the CSS).

## 7. Tech constraints

- Single HTML file, self-contained CSS and JS, two CDN script dependencies loaded at runtime:
  `pdf.js` (PDF text extraction) and `Mammoth.js` (DOCX text extraction).
- No build tooling. No package.json. No server. Openable directly as a file or published as a
  static page.

## 8. Known limitations

- Skill dictionaries (~55 role "starter packs" plus ~716 skill groups) are Claude's general
  knowledge except for Product Designer, UX Designer, and Design Engineer, which are grounded in
  actual postings sampled from Greenhouse, Lever, Ashby, and aggregator sites in Sept 2026.
- Acronym collisions are possible (e.g. "CA" as a qualification vs. "California"); the
  "Not relevant" control exists specifically to let a user dismiss a false match.
- PDF/DOCX parsing depends on two third-party CDN scripts being reachable; if blocked, the tool
  gives a clear inline error and the user can paste text instead.
- This is a rule-based matcher, not an AI reviewer — it cannot judge writing quality, only
  presence/absence/location of specific terms.

## 9. Possible next iterations (not built)

- Optional AI-assisted bullet rewrite suggestions for "missing" required skills.
- Deeper, sourced skill dictionaries for more of the 55 roles (only three are currently
  grounded in real job-posting research).
- Export/share of the results screen.
- A lightweight "compare two resumes against the same posting" mode.
