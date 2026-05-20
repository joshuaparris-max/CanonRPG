# Continuation Notes

## What was added

- Local PDF import support using `pdfjs-dist`.
- A PDF library manager UI on the Sourcebook page.
- A DM Prep suggestion panel using imported PDF index entries.
- Canon Audit checks for imported PDFs and private local prep data.
- Safe vs private export actions in Save Manager.
- Stubbed canonical game files under `src/game/`.
- Placeholder content files under `src/content/`.
- Basic schema placeholder in `src/data/schemas/`.

## Next tasks

- Add deeper PDF index parsing and page-to-printed-page mapping.
- Build a full sourcebook auto-fill wizard for extracted PDF entries.
- Add stronger export sanitization for private notes.
- Connect the new game architecture stubs to gameplay screens.
