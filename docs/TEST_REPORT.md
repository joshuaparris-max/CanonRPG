# Test Report

## Verification

- Added local browser PDF import support in Sourcebook.
- Added a PDF library manager UI.
- Added PDF index suggestion workflow in DM Prep.
- Added new audit warnings for imported PDFs.
- Added safe vs private export actions in Save Manager.
- Added new architecture placeholder files.

## Recommended checks

- Run `pnpm install` in the workspace root.
- Run `pnpm --dir artifacts/canon-table-engine dev` and verify the Sourcebook, DM Prep, Canon Audit, and Save Manager pages load.
- Import a small official PDF locally and confirm the index entries are created.
- Export a sourcebook reference file and a DM prep file.
