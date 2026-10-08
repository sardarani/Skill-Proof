# Skill Proof compiled restore point

**Backup created:** 26 September 2026, 10:07 PM IST  
**Stable application version:** Library version 25  
**Restore-point status:** Read-only

## Current project state

This snapshot captures the complete current Skill Proof resume matcher, including:

- The single-file HTML application with embedded CSS and JavaScript
- Responsive editor and results layouts
- File upload and drag-and-drop parsing
- Role picker, result tabs, match indicators, loaders, snackbars, and processing states
- Frosted surfaces and the lime-to-lemon-yellow-to-beige comet cursor trail
- Product requirements, design guidance, project notes, and component audit
- Reference image and screen recording

No feature or design changes were made while creating this backup.

## How to run

The application has no build step.

1. Open `project/upload/honest-resume-matcher.html` in a modern browser.
2. For a local web server, open a terminal in `project/upload` and run:

   ```bash
   python3 -m http.server 8000
   ```

3. Visit `http://localhost:8000/honest-resume-matcher.html`.

## Dependencies

- A modern browser with JavaScript enabled
- Internet access for the Urbanist web font
- Internet access for PDF.js and Mammoth when importing PDF or DOCX files
- Pasted text and TXT files do not require a build system or package installation

There is no `node_modules` folder and no package installation is required.

## Restore instructions

Copy the contents of `project/upload` back to the working project's `upload` directory. The hashes in `MANIFEST.sha256` can be used to confirm that the restore point remains unchanged.

Do not modify this folder unless explicitly instructed.
