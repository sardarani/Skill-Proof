# Skill Proof — UI Component State and Interaction Audit

**Audited build:** `honest-resume-matcher.html`, version 16  
**Audit date:** 26 September 2026  
**Method:** Static inspection of the rendered markup, CSS states, ARIA attributes, and JavaScript event handlers.

## Status key

- **Confirmed:** Present in the current build.
- **Partial:** Present, but incomplete or inconsistent.
- **Missing:** Applicable to the component but absent.
- **Not applicable:** The component does not need this state in the current product.

## Executive assessment

The primary flow is complete: users can paste or upload both documents, choose or search for a role, run the matcher, navigate result tabs, inspect individual must-have skills, exclude irrelevant skills, and return to editing. The role picker and result tabs have especially good keyboard foundations.

The highest-impact gaps are:

1. Running the matcher hides the focused submit button without moving focus into the results page.
2. Missing-input validation is a single temporary toast rather than field-level feedback.
3. File reading states are visible but are not announced to screen readers or connected to their controls.
4. Native `title` attributes are being used as tooltips, so their content is unreliable on keyboard and touch devices.
5. Removing a skill rebuilds the results, resets the user to Overview, and loses focus.
6. Buttons and analysis do not expose disabled or processing states, which can cause duplicate actions or an apparent freeze on very large inputs.

## Global state coverage

| State | Current coverage | Confirmation |
|---|---|---|
| Default / resting | Buttons, fields, cards, tabs, upload controls, role picker | **Confirmed** |
| Hover | Buttons, upload controls, tabs, must-have segments, selected decorative lime elements | **Confirmed** |
| Focus | Buttons, file control wrapper, textareas, role input, tabs, must-have segments | **Confirmed**, but visual treatment is inconsistent |
| Active / pressed | Primary button only | **Partial** |
| Selected / unselected | Result tabs, role options, role-domain filters | **Confirmed** |
| Disabled | No controls expose a disabled state | **Missing where processing can occur** |
| Loading / processing | File-reading status text | **Partial** |
| Success | File-read message, result status badges, matched-skill states | **Confirmed** |
| Error / validation error | Missing-input toast and file-read message | **Partial** |
| Warning | Resume checks, parsing checks, missing/unproven statuses | **Confirmed** |
| Empty / no results | No skills found, empty result groups, zero must-haves, role search with no matches | **Confirmed** |
| Filled / editing | Textareas and searchable role input | **Confirmed** |
| Read-only | ATS view and generated result content | **Confirmed** |
| Expanded / collapsed; open / closed | Role picker and result panels | **Confirmed** |
| Dragging / drag-over | Upload cards | **Confirmed** |
| Partial / incomplete | Missing one or both required inputs | **Partial**; not identified per field |
| Completed | Generated results, successful file read | **Confirmed** |

## Component-by-component audit

### 1. Brand link and page entry

**Existing states:** Default; keyboard focus; responsive size.  
**Existing interactions:** Click/tap navigates to `#top`; keyboard activation works because it is a native link.  
**Missing states:** No distinct hover or active state. On the results page, “Skill Proof home” does not return to the editor.  
**Missing interactions:** No route/history state; browser Back does not switch between editor and results.  
**Recommended behaviour:** Make the brand link return to the editor when results are open, or rename its accessible label to “Back to top.” If editor/results remain a single document, add a history entry when results open so browser Back returns to editing.

### 2. Hero and decorative stickers

**Existing states:** Resting; entrance animation; pointer hover tilt on supported devices; reduced-motion version.  
**Existing interactions:** Decorative tilt follows pointer hover. Elements are hidden from assistive technology as a group.  
**Missing states:** None required for product completion.  
**Missing interactions:** None; these are decorative.  
**Recommended behaviour:** Keep them noninteractive and excluded from the tab order. The current implementation does this correctly.

### 3. Resume and job-post cards

**Existing states:** Default; frosted-card fallback when backdrop filtering is unavailable; drag-over; textarea focused; empty; filled; editing.  
**Existing interactions:** Click/tap to focus; type, paste, select text, resize vertically; drag a file over and drop it; input updates the visibility of “Start fresh.”  
**Missing states:** Field-level error, valid/success, disabled, read-only, processing, and explicit drag-rejected state.  
**Missing interactions:** No character/size guidance; no “clear this field” action; no field-specific validation focus.  
**Recommended behaviour:** On submit, mark each empty field with `aria-invalid="true"`, connect a persistent error using `aria-describedby`, and focus the first invalid field. Add a small per-field clear action once content exists. Retain user-resizable textareas.

### 4. File upload controls

**Existing states:** Default; hover; focus-within; native file dialog open; reading/processing text; success text; failure text; drag-over; completed content replacement.  
**Existing interactions:** Click/tap; keyboard activation through the native file input; select PDF, DOCX, TXT; drag and drop; select another file to replace the textarea content. The first dropped file is processed. Files over 15 MB, `.doc`, unsupported formats, empty files, and scanned PDFs without text generate errors.  
**Missing states:** Explicit disabled state while reading; cancellable loading; upload progress; persistent file identity; remove-file action; multi-file rejection; drag-invalid visual; screen-reader live announcement.  
**Missing interactions:** No cancel; no explicit remove; no confirmation before replacing edited text; no retry action. `.md` is accepted by JavaScript but omitted from the file picker’s `accept` list.  
**Recommended behaviour:** Disable the corresponding upload control while parsing and show a spinner plus “Reading filename.” Give the status element `role="status"` or `aria-live="polite"`, connect it to the file input and textarea, and set error messages to an assertive announcement only when needed. Warn before replacing non-empty edited text. Align accepted extensions in markup and JavaScript. Provide “Replace” and “Remove” after a successful read.

### 5. Role picker / searchable combobox

**Existing states:** Default; focused; open; closed; typed query; selected role; auto-detect selection; active keyboard option; domain-filter selected/unselected; no results; detected role hint; locked role hint.  
**Existing interactions:** Focus or click opens it; typing filters; pointer movement highlights options; click selects; Arrow Down/Up moves through options; Home/End jump when the query is empty; Enter selects; Escape closes; Tab closes; outside click closes and removes focus. Domain pills filter the list and return focus to the input. Reset restores auto-detection. The count is announced through `aria-live="polite"`.  
**Missing states:** Loading is not applicable because the data is local. Disabled and validation-error states are absent. Open state has no visual arrow rotation.  
**Missing interactions:** No dedicated open/close button for pointer users; no Left/Right keyboard navigation among domain filters; selected option is not automatically announced beyond `aria-selected`; no recent or suggested role shortcuts.  
**Recommended behaviour:** Keep the current ARIA combobox pattern. Add `aria-haspopup="listbox"`, rotate the caret when `aria-expanded="true"`, and announce selection confirmation in the hint. Ensure domain filters remain reachable by Tab when the popover is open. Preserve the typed query if focus moves temporarily into the filter row.

### 6. Primary “Check my resume” button

**Existing states:** Default; hover; visible keyboard focus; pressed animation; completed action.  
**Existing interactions:** Click/tap submits the current text; Enter/Space work through native button behaviour.  
**Missing states:** Disabled, loading/processing, validation error association, and duplicate-submit prevention.  
**Missing interactions:** No keyboard shortcut such as Cmd/Ctrl + Enter; no focus transfer to results or an invalid field.  
**Recommended behaviour:** During analysis, set `disabled` and `aria-busy="true"`, change the label to “Checking…,” then restore it. On success, focus the results heading or selected Overview tab. On validation failure, focus the first empty field.

### 7. Sample and reset actions

**Existing states:** Sample buttons have default, hover, and focus. “Start fresh” is hidden when both fields are empty and visible when either has content.  
**Existing interactions:** Each sample fills both fields, resets the selected role and ignored terms, then generates results. “Start fresh” clears both fields, results, ignored terms, toast, and returns focus to the resume field.  
**Missing states:** No pressed styling for secondary buttons. No confirmation before clearing substantial user-entered content.  
**Missing interactions:** No undo after clearing.  
**Recommended behaviour:** Add a lightweight confirmation only when meaningful user-entered content exists, or provide an immediate Undo toast. Keep sample actions one click.

### 8. Toast / validation message

**Existing states:** Hidden when empty; visible error; automatically dismissed after four seconds; screen-reader status role.  
**Existing interactions:** Triggered when submission lacks either required input; dismisses automatically.  
**Missing states:** Separate “resume missing,” “job post missing,” and “both missing” messages; manual dismiss; persistent field-level error; success/warning variants.  
**Missing interactions:** No dismiss button; no pause on hover/focus; no action link.  
**Recommended behaviour:** Use field-level messages for required-input errors and retain the toast as a summary. If it remains time-limited, add a dismiss button and pause the timer on hover/focus. Four seconds is acceptable for the short current message, but the error must also remain available beside the invalid field.

### 9. Results page and back navigation

**Existing states:** Editor view; results view; completed results; reduced-motion scroll; dynamic set of sections; no-skills result.  
**Existing interactions:** Results replace the editor visually; page scrolls to the top; “Edit details” returns to the editor and focuses the resume textarea.  
**Missing states:** Processing skeleton, fatal-analysis error, stale-results warning after edits, route/history state.  
**Missing interactions:** Focus is not moved when results open. The submit button becomes hidden while it still owns focus, which can strand keyboard and screen-reader users. Browser Back is not integrated. “Edit details” always focuses Resume rather than the last edited control.  
**Recommended behaviour:** Give the results heading `tabindex="-1"` and focus it after rendering. Store the previously focused editor control and restore it on “Edit details.” Use History API state for editor/results navigation, or clearly keep this as a single-page disclosure and handle Back consistently.

### 10. Result tabs

**Existing states:** Selected; unselected; hover; focus; hidden/visible panel; sticky; horizontally scrollable on small screens.  
**Existing interactions:** Click/tap switches panels. Arrow Left/Right wraps between tabs. Home/End selects the first/last tab. Keyboard activation is automatic and moves focus to the newly selected tab. ARIA tab, tablist, tabpanel, `aria-controls`, `aria-labelledby`, roving `tabindex`, and `hidden` are implemented.  
**Missing states:** Disabled and loading are not currently needed. A selected tab can be partially offscreen on narrow displays.  
**Missing interactions:** No automatic `scrollIntoView` for the selected tab; no optional swipe gesture.  
**Recommended behaviour:** Add `aria-orientation="horizontal"` for clarity and scroll the selected tab into view with reduced-motion awareness. Keep swipe optional; native horizontal scrolling is sufficient.

### 11. Result cards and sections

**Existing states:** Default; content-filled; empty group message; success/warning check rows; light/dark frosted surfaces; responsive one/two-column layout.  
**Existing interactions:** Mostly read-only scanning and vertical scrolling.  
**Missing states:** Loading/skeleton, error/retry, collapsible sections, and print/export layout.  
**Missing interactions:** No expand/collapse or section deep links.  
**Recommended behaviour:** Keep cards expanded by default. If sections become longer, add optional collapsible headings using real buttons with `aria-expanded`. Add skeletons only if analysis becomes asynchronous enough to create noticeable waiting.

### 12. Must-have count, verdict, and segmented indicator

**Existing states:** Proven, only listed, different wording, and missing; zero must-haves; hover; keyboard focus; completed; selected destination flash. Segments are sorted from proven to missing.  
**Existing interactions:** Hover shows the native title tooltip. Click, Enter, or Space switches to Skill Match, moves focus to the matching skill, scrolls it into view, and flashes it. Reduced motion changes the flash to a static outline.  
**Missing states:** Persistent selected segment; explicit visited state; accessible custom tooltip; segment disabled state is not applicable.  
**Missing interactions:** Native title content is not dependable for touch or keyboard focus. Focus does not return to the segment after viewing a skill.  
**Recommended behaviour:** Replace `title` with a visible tooltip that opens on hover and focus, closes on Escape, and is referenced by `aria-describedby`. Consider marking the destination row briefly with both outline and text such as “Jumped here” for nonvisual confirmation.

### 13. All-skills four-colour bar and legend

**Existing states:** Four status proportions; zero-count categories omitted; accessible summary through `role="img"` and `aria-label`; visible text legend.  
**Existing interactions:** Read-only. Native title text exists on visual segments but is not keyboard-reachable.  
**Missing states:** No-data is handled by the separate “Nothing to match” page. Narrow segments can lose their visible count.  
**Missing interactions:** No segment exploration.  
**Recommended behaviour:** Keep the whole bar as one accessible image if it remains noninteractive. Always repeat exact counts in adjacent text or the legend so information does not depend on colour or segment width. Remove inaccessible title-only details or provide the same text visibly.

### 14. Skill-detail rows and “Not relevant” actions

**Existing states:** Backed, only listed, different wording, missing; required and nice-to-have tags; focused jump target; temporary highlighted destination; empty group.  
**Existing interactions:** “Not relevant” removes a skill from analysis and rerenders. The Overview Undo link restores all ignored skills.  
**Missing states:** Per-row removed state, undo toast, processing/disabled, and preserved tab/focus after rerender.  
**Missing interactions:** Removing a skill sends the user back to Overview and destroys the focused button. Undo restores every ignored skill rather than the most recent one.  
**Recommended behaviour:** Preserve the current Skill Match tab and focus the next logical row after removal. Show “Skill ignored — Undo” for the last action. Keep a separate “Restore all ignored skills” action in Overview.

### 15. Chips, tags, and status badges

**Existing states:** Required, nice-to-have, backed, only listed, differently worded, missing, all-good, and fix-this. Text labels accompany colours in most result sections.  
**Existing interactions:** Most are read-only. Role-expectation chips expose extra detail through native `title`; a screen-reader-only label adds the status.  
**Missing states:** Focus and selected states are not applicable to static chips. Tooltip open/closed state is missing.  
**Missing interactions:** Extra chip details cannot be reliably opened on touch or keyboard.  
**Recommended behaviour:** If extra detail matters, use an adjacent details disclosure or make the chip a real button with an accessible popover. If it is supplementary, show the status in visible supporting text and remove the title dependency.

### 16. Resume checks and ATS view

**Existing states:** Success and warning rows; populated read-only ATS content; horizontally safe wrapping; highlighted matched terms.  
**Existing interactions:** Select/copy text and scroll.  
**Missing states:** Empty resume is blocked earlier; loading and failure states are absent.  
**Missing interactions:** No copy action, download, print, or jump between highlighted terms.  
**Recommended behaviour:** Add “Copy ATS text” only if user research shows value. Announce copy success through a short status message. Keep the current read-only semantic `pre` content.

### 17. Empty and no-results states

**Existing states:** No skills found in the post; no must-haves; empty skill-status groups; role search with no results; hidden ignored skills with Undo.  
**Existing interactions:** Undo ignored terms; return to editor; edit query.  
**Missing states:** Inputs containing unreadable/gibberish content; extremely short job post; all skills manually ignored; analysis failure.  
**Missing interactions:** Empty result does not focus its heading or offer a direct “Edit job post” action.  
**Recommended behaviour:** Add a primary “Edit job post” action to “Nothing to match,” focus the empty-state heading, and distinguish “No recognizable skills” from “All skills ignored.”

### 18. Tooltips and popovers

**Existing states:** Role picker open/closed popover. Browser-native title tooltips on must-have segments, role chips, and chart segments.  
**Existing interactions:** Role picker supports click, keyboard, focus loss, and outside click. Native titles are hover-dependent.  
**Missing states:** Custom tooltip open, focus, persistent hover, touch-open, and Escape-close. No modal exists in the current UI.  
**Missing interactions:** Title tooltips are not reliably accessible on keyboard, touch, or screen magnification.  
**Recommended behaviour:** Build one reusable tooltip pattern for short status explanations: hover/focus open, pointer leave/blur close, Escape close, `role="tooltip"`, and `aria-describedby`. Use a disclosure or popover for longer content.

### 19. Comet cursor and decorative motion

**Existing states:** Fine-pointer active; moving; receding; idle; hidden; page-leave/blur stop; reduced-motion disabled; lime-to-cyan-to-violet fading afterglow. Canvases are `aria-hidden` and ignore pointer events.  
**Existing interactions:** Follows pointer movement; trail passes behind cards while diffuse glow appears on card faces; stops on pointer leave, blur, hidden document, resize, or reduced-motion change. Native cursor remains for touch and reduced-motion users.  
**Missing states:** User-controlled motion toggle and high-contrast fallback.  
**Missing interactions:** No manual disable control.  
**Recommended behaviour:** The current reduced-motion support is correct. Consider a small “Effects” preference only if users report distraction or pointer-identification problems.

### 20. Responsive and touch behaviour

**Existing states:** Input cards collapse to one column below 820 px; results header stacks below 600 px; tabs scroll horizontally; card columns collapse; text scales with `clamp`; safe-area padding is included; custom cursor is limited to fine hover pointers.  
**Existing interactions:** Touch scrolling, native text editing, native file picker, tap buttons, and horizontal tab scrolling.  
**Missing states:** Explicit compact navigation, on-screen-keyboard layout handling, and landscape-small-height handling.  
**Missing interactions:** Drag-and-drop is desktop-oriented; no mobile-specific file-source guidance. Hover-only title content is unavailable.  
**Recommended behaviour:** Verify at 320 CSS px width, 200% zoom, iOS Safari with the keyboard open, Android Chrome, and landscape height under 500 px. Ensure every touch target is at least 44×44 CSS px; the compact “Not relevant” buttons and role reset deserve measurement. Replace hover-only information.

## Interaction inventory

| Interaction | Current behaviour | Audit result |
|---|---|---|
| Click / tap | All buttons, links, files, role options, filters, tabs, must-have segments | **Confirmed** |
| Hover | Buttons, files, tabs, segments, decorative lime tilt | **Confirmed; tooltip access partial** |
| Keyboard | Native controls; full tab keyboard pattern; full role-combobox navigation | **Confirmed** |
| Focus / blur | Visible focus; picker opens/closes; outside click closes | **Confirmed; result focus transfer missing** |
| Typing / input | Textareas and role search | **Confirmed** |
| Selection | Role, domain, tab, text selection | **Confirmed** |
| Toggle | Domain filter; auto/manual role | **Confirmed** |
| Expand / collapse | Role picker; result panel visibility | **Confirmed** |
| Open / close | Native file dialog; role picker | **Confirmed** |
| Tab switching | Click plus Arrow Left/Right, Home, End | **Confirmed** |
| Scrolling | Page, sticky tabs, horizontal tabs, role list, jump-to-skill | **Confirmed** |
| Drag and drop | First file into either input card | **Confirmed** |
| File upload | PDF, DOCX, TXT; parsed locally | **Confirmed** |
| File replacement | Selecting/dropping another file replaces textarea content | **Confirmed but unconfirmed replacement** |
| File removal | Only through Start fresh or manual text deletion | **Missing explicit action** |
| Reset / clear | Start fresh; role reset; ignored-skill reset | **Confirmed** |
| Submit | Primary button | **Confirmed** |
| Back navigation | Edit details button | **Partial; browser Back unsupported** |
| Dismiss | Toast auto-dismisses after four seconds | **Partial; no manual dismiss** |
| Filtering / searching | Role title/domain/skill search | **Confirmed** |
| Enter / Escape / arrows | Role picker and tabs | **Confirmed** |
| Outside click | Closes role picker | **Confirmed** |

## Accessibility and edge-case audit

### Keyboard and focus

- **Confirmed:** Native controls are keyboard reachable; role picker and result tabs implement expected keys; must-have buttons support Enter and Space.
- **Gap:** Focus is lost when the submit button is hidden by the results view.
- **Gap:** Removing a skill destroys the focused row and resets the active tab.
- **Gap:** White focus outlines on white or pale surfaces can have insufficient contrast. Focus styling differs between generic buttons, inputs, and result tabs.
- **Recommendation:** Use one two-colour focus ring, such as a white inner ring plus dark/lime outer ring, so it remains visible in both themes.

### Screen readers and semantics

- **Confirmed:** Textareas have labels; role picker uses combobox/listbox semantics; tabs use the ARIA tabs pattern; result charts have labels; decorative canvases and hero stickers are hidden.
- **Gap:** Upload status and errors are not live regions and are not referenced by the file controls or textareas.
- **Gap:** `#results` is one large polite live region, which may cause an excessively long announcement after every rerender.
- **Gap:** Required input fields do not expose `required`, `aria-invalid`, or persistent described errors.
- **Recommendation:** Announce a short “Analysis complete” status, then move focus to the results heading. Avoid announcing the entire results DOM.

### Validation and recovery

- **Confirmed:** File type, legacy `.doc`, 15 MB limit, empty extracted text, dependency failure, and scanned-image-like input have readable errors.
- **Gap:** Missing resume and missing job post are not distinguished.
- **Gap:** Errors do not offer a direct correction action.
- **Gap:** A network/CDN failure can prevent PDF or DOCX parsing; pasted text still works but this recovery path is not surfaced.
- **Recommendation:** Provide per-field errors and error-specific next steps, such as “Paste the text instead.”

### Motion, pointer, and touch

- **Confirmed:** `prefers-reduced-motion` removes entry motion, tilt transition, smooth skill jump, flash animation, and the comet effect.
- **Confirmed:** Decorative canvases never intercept pointer events and are excluded from accessibility APIs.
- **Gap:** Generic CSS hover styles may remain sticky on some touch browsers, and native title tooltips have no touch equivalent.
- **Recommendation:** Scope nonessential hover presentation to `(hover:hover)` and replace title-only help.

### Content and performance edge cases

- Very large pasted text has no explicit limit and analysis runs synchronously, so the interface may appear frozen.
- A 15 MB text file can create an extremely large textarea and expensive analysis.
- Dropping multiple files silently uses only the first.
- Replacing an edited textarea through upload happens without warning.
- Scanned PDFs return a useful error, but OCR is not available.
- A job post with no recognized dictionary terms opens a valid empty result state.
- A job post with no explicit must-have section correctly shows zero must-haves.
- Long filenames can overflow status copy on narrow screens and should wrap safely.
- Repeated “Not relevant” actions can make the Overview change abruptly and should preserve context.
- If external PDF/DOCX libraries fail to load, TXT and paste should remain usable and be explained.

## Recommended implementation priority

### P0 — Accessibility and task completion

1. Move focus to the results heading after successful analysis.
2. Add field-level required validation with `aria-invalid` and described errors.
3. Make upload reading, success, and error messages live and connected to the correct controls.
4. Preserve the active results tab and restore logical focus after ignoring a skill.
5. Replace title-only critical information with keyboard- and touch-accessible help.

### P1 — Clear processing and recovery

1. Add processing/disabled states to analysis and file parsing.
2. Add explicit file Replace and Remove actions plus replacement confirmation.
3. Add an Undo action after ignoring a skill or clearing inputs.
4. Make selected mobile tabs scroll fully into view.
5. Distinguish “resume missing,” “job post missing,” and “both missing.”

### P2 — Polish and resilience

1. Integrate browser history with editor/results navigation.
2. Add a motion/effects preference if usability feedback supports it.
3. Add optional copy/export actions to the ATS view.
4. Test touch targets, 200% zoom, screen readers, high contrast, and small landscape layouts.
5. Add graceful messaging when PDF/DOCX parsing dependencies are unavailable.

## Acceptance checklist for the next QA pass

- [ ] Every actionable control has default, hover where applicable, visible focus, and pressed feedback.
- [ ] Every asynchronous action has idle, processing, success, and error states.
- [ ] Every required field has empty, filled, editing, and validation-error states.
- [ ] Focus enters the results page after submit and returns predictably on Edit details.
- [ ] Role picker works with mouse, touch, Tab, arrows, Home/End, Enter, Escape, and outside click.
- [ ] Result tabs work with click, touch, arrows, Home/End, and horizontal scrolling.
- [ ] Upload works through picker and drag/drop, with replacement, removal, type/size errors, and live announcements.
- [ ] Tooltip content is available on hover, focus, touch, and to screen readers.
- [ ] Status is never communicated by colour alone.
- [ ] Reduced motion removes all nonessential movement and smooth scrolling.
- [ ] The interface reflows at 320 CSS px and remains usable at 200% zoom.
- [ ] Touch targets meet a 44×44 CSS px minimum.
- [ ] Empty, partial, no-results, dependency-failure, and oversized-input cases have recovery actions.
