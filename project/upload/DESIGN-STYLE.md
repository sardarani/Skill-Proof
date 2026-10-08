# Honest Resume Matcher — Design Style Guide

Visual language: **"Sticker on grid paper."** A light, textured paper background with a fine
grid, warm blurred lime glows in the corners, and playful tilted lime-green stickers — inspired
by two reference brand images (a bold headline with a highlighted word and tilted stat-callout
stickers; a laptop-mockup ad with lime accent stickers and a dark UI screenshot). Everything
else — cards, type, buttons — stays plain and structured so the lime accent reads as the one
loud element, per the "spend your boldness in one place" principle.

---

## 1. Colour tokens

Defined as CSS custom properties on `:root`, with a dark-mode variant driven by both
`prefers-color-scheme: dark` and a manual `[data-theme="dark"]` / `[data-theme="light"]` override.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#F3F3EF` | `#11130F` | Page background |
| `--surface` | `#FFFFFF` | `#1A1D17` | Cards, panels |
| `--ink` | `#141414` | `#F1F3EC` | Primary text |
| `--muted` | `#5C6058` | `#A7AC9E` | Secondary text |
| `--line` | `rgba(20,20,20,.12)` | `rgba(255,255,255,.12)` | Hairline borders |
| `--edge` | `#141414` | `#F1F3EC` | Bold 1.5px card/element outlines |
| `--lime` | `#C8F53B` | `#C8F53B` | Primary accent (stickers, buttons, highlights) |
| `--lime-soft` | `rgba(200,245,59,.55)` | `rgba(200,245,59,.3)` | Text-selection highlight, filled tag backgrounds |
| `--olive` | `#3E5A06` | `#DDFB82` | Text sitting on top of solid lime |
| `--glow` | `rgba(200,245,59,.85)` | `rgba(200,245,59,.35)` | Corner background blurs |
| `--b` / `--l` / `--w` / `--m` | lime / yellow / light-blue / coral | same hues, dimmed | Match-status colours: **B**acked, on**l**y listed, different **w**ording, **m**issing |
| `--focus` | `#2B6BFF` | `#8FB0FF` | Keyboard focus rings |

Neon cursor-trail green (separate from the UI accent, intentionally more saturated/electric):
`rgb(57,255,20)` — used only by the cursor-trail canvas, with a white-hot core at the head.

## 2. Typography

- **Typeface:** Urbanist (Google Fonts), weights 400–900, italic included. One family for
  everything — headings and body — differentiated by weight and size, not by mixing fonts.
- **Headline:** `clamp(2.35rem, 7.4vw, 5.1rem)`, weight 500 with `<em>` spans bumped to 900 and
  italic, negative letter-spacing (`-0.025em`).
- **Section headings (`h2`):** 1.6rem / weight 800.
- **Body:** 1.0625rem / line-height 1.55, weight 500 (Urbanist reads thin at 400, so 500 is the
  effective "regular").

## 3. Signature visual motifs

### 3.1 The text-selection highlight ("Prove")
A word in the headline is wrapped in `.sel`, styled to look like a highlighter/selection block:
a soft lime background (`--lime-soft`), olive-coloured italic-bold text, and two thin lime
vertical bars at the left/right edges with small triangular "handles" (drawn with an empty `<i>`
and `::before`/`::after` borders) — mimicking a text-selection UI affordance. **This element is
excluded from the hover-tilt interaction** so the headline's focal point never wobbles.

### 3.2 Stickers
Pill-shaped lime badges (`.sticker`) with a bold outline-free fill, a drop shadow, and a slight
alternating rotation (±2–6°) so they read as physically stuck onto the page rather than aligned
UI chips. Used for the three value props under the headline ("No keyword soup," "Private by
default," "Built for designers") and reused as `.chip` for the "starter pack" skill lists inside
the results.

### 3.3 Boxed section labels
Inputs and cards are labelled with a small lime rectangle with a bold dark 1.5px outline, set at
a slight counter-rotation (`transform: rotate(-1.5deg)`), used for "Your resume," "The job
post," and "Your target role."

### 3.4 Cards
`1.5px solid var(--edge)` outline, `18px` border-radius, `var(--surface)` fill — deliberately
flat (no soft drop shadow, no gradient) so the lime stickers and highlights are the only elements
that pop off the page. Used for input panels, the results summary, each results group, and the
role picker.

### 3.5 Background
`--paper` base with:
- A fine grid drawn via two repeating linear gradients (44px cells).
- Two large, soft, blurred lime radial-gradient glows anchored at the top-right and
  bottom-left corners (`fixed` so they don't scroll away).
- A subtle fractal-noise SVG grain overlay (`multiply` blend in light mode, `screen` in dark)
  for a "printed paper" texture.

## 4. Buttons

| Style | Look | Used for |
|---|---|---|
| `.primary` | Solid lime fill, dark 1.5px border, hard drop-shadow offset (`0 5px 0 #141414`) that compresses on `:active` like a physical button | The single primary CTA ("Check my resume") |
| Default `button` | White/surface fill, dark border, no shadow | Secondary actions (example buttons) |
| `.link` | No border/background, underlined text | Tertiary actions ("Start fresh") |
| `.file-btn` | Pill outline that fills solid lime on hover | Upload controls |

**Call-to-action hierarchy:** the primary button sits alone, centered, full-width up to 420px,
directly under the inputs. Secondary actions (example data, reset) sit in a visually quieter row
below it, introduced by a muted "No resume handy?" label — never competing with the primary CTA
for attention.

## 5. Colour-coded match states

Used consistently across the legend, the summary bar, the group headings, and inline highlights:

- **Backed** — lime (`--b`) — the skill is demonstrated inside an actual experience bullet.
- **Only listed** — yellow (`--l`) — claimed in a skills list or summary, never shown in use.
- **Different wording** — light blue (`--w`) — the resume has it, phrased differently than the
  posting.
- **Missing** — coral (`--m`) — not found in the resume at all.

These four only appear alongside actual results — **the legend is not shown on the empty
landing screen**, to keep the first view uncluttered; it appears inside the results summary once
a comparison has run.

## 6. Copy voice

Short, plain, a little irreverent — never at the cost of clarity for anything safety- or
accuracy-related (errors, file-format problems, and the "this isn't a real ATS" disclaimer stay
plain and unambiguous).

Representative before → after tightening pass:

| Before (verbose) | After (shipped) |
|---|---|
| "Of 29 skills and tools in this posting, 10 are backed by your experience, 5 are only listed…" | "10 of 29 proven. 14 missing, 6 of them required. Ouch." |
| "You said it, but you didn't show it. Give each one a bullet with a real win." | "All talk, no receipts." |
| "No portfolio link found. Nearly every design posting asks for one; put it in your header…" | "No link? For a designer, that's a dealbreaker." |
| "Heads up: this isn't a real applicant tracking system, and no tool can promise you an interview…" | "Not a real ATS. No tool can promise interviews. Add only what's true." |

Headline: **"Don't just *list* it. Prove you are *worth it.*"** — centered, with "Prove"
highlighted per §3.1 and the italic words in heavy weight for emphasis.

## 7. Interaction specification

### 7.1 Hover tilt (lime elements)
Any element carrying one of: `.sticker`, `.target`, `label.title`, `.mk-b` (Backed highlight),
`.status.ok`, `.tag.req`, an active `.rp-domains` filter button, a search-match `<mark>`, or the
lime segment of the results progress bar (`.bar-b`) — rotates **18° clockwise** on hover.

- **Timing:** 0.7s ease (`cubic-bezier(.25,1.2,.4,1)`), both in and out — deliberately slow and
  springy, not snappy.
- **Explicitly excluded** (must stay upright): the "Prove" highlight (`.sel`), both file-upload
  buttons (`.file-btn`), and the primary "Check my resume" button — so the reading focal point
  and both calls to action never rotate.
- **Implementation note:** driven by JS (`pointerover`/`pointermove`), not pure CSS `:hover`,
  because a naive CSS tilt causes flicker once the rotated element's corners move out from under
  the cursor. The applied class (`is-tilted`) is only removed once the pointer leaves the
  element's *original*, pre-rotation bounding box. Mouse/pen only — tap targets on touch devices
  don't get a hover state that could get stuck.

### 7.2 Neon cursor trail
A full-viewport, `pointer-events:none`, fixed `<canvas>` (z-index above all content) renders a
glowing green trail that follows the cursor (and touch drags), styled after a "comet."

- **Colour:** `rgb(57,255,20)` (a more saturated neon green than the UI's `--lime`, intentionally
  distinct so the effect reads as a cursor/FX layer, not a UI element), with a white-hot core at
  the very tip.
- **Shape:** built from a rolling buffer of recent pointer positions (each timestamped). Every
  frame, older points are dropped once they exceed a 750ms lifespan. The remaining points are
  drawn as a polyline in **three layered passes** so it reads as a solid, glowing tail rather
  than a thin line:
  1. Wide hazy outer halo (up to ~30px at the head, heavy blur, low opacity).
  2. Mid-body fill (~60% of the halo's width, medium blur/opacity).
  3. Bright inner core (~30% width, minimal blur, high opacity).
  Each pass's width and opacity taper from the head to the tail using an eased falloff
  (steeper for the outer halo, gentler for the core), so the comet looks solid near the cursor
  and dissolves into nothing at the tail.
- **Head:** a two-layer white/near-white glowing dot (a soft 7px outer glow, a sharp 3.4px core)
  marking the exact live pointer position — the comet's "nucleus."
- **Behaviour when idle:** because points simply age out, a stationary cursor's trail shrinks
  and fades over ~0.75s rather than vanishing instantly — matching the "embers settling" look of
  the reference video.
- **Accessibility / performance:** disabled entirely when `prefers-reduced-motion: reduce` is
  set (canvas is `display:none` and the script exits before attaching listeners). Capped device
  pixel ratio (max 2×) and a capped point-buffer length (140 points) to bound draw cost.
  Strictly `pointer-events:none`, verified not to block typing, clicking, or the role search
  combobox underneath it.

## 8. Accessibility notes

- All custom interactive widgets (the role combobox, its listbox, domain filter buttons) use
  proper ARIA roles/states (`role="combobox"`, `aria-expanded`, `aria-activedescendant`,
  `role="listbox"`/`"option"`, `aria-selected`).
- Visible focus rings (`--focus`) on every interactive element, not suppressed.
- `prefers-reduced-motion` is respected in two independent places: the pop-in sticker animation
  and the results reveal animation are skipped, and the cursor-trail canvas is fully disabled.
- Colour is never the only signal: each match-status also has a text label ("Backed," "Missing,"
  etc.), and required-skill tags say "Required" rather than relying on colour alone.
- Safe-area insets (`env(safe-area-inset-*)`) are respected for notched mobile devices.

## 9. Responsive behaviour

- Two-column input layout collapses to one column under 820px.
- The two-column results grid collapses under 900px.
- The role-picker popover width is capped to `calc(100vw - 2.5rem)` on small screens, and its
  domain-filter row scrolls horizontally with a fade mask at the edge.
- Headline size scales fluidly with `clamp()`; stickers wrap into a centered row on narrow
  screens instead of floating beside the headline (which only happens ≥1100px).
