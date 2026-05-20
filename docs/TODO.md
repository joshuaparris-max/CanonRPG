# Canon Table Engine — TODO

## Major missing features

- [x] Implement local browser PDF import using `pdfjs-dist`
- [x] Add a Sourcebook Library manager UI for imported PDFs
- [x] Store imported PDF metadata locally:
  - [x] sourceBook
  - [x] sourceId
  - [x] fileName
  - [x] fileHash
  - [x] importDate
  - [x] pageCount
  - [ ] detected title/TOC
  - [ ] pdfPageOffset mapping
  - [x] indexed status
  - [x] lastIndexedAt
- [x] Build PDF indexer/parser to detect:
  - [ ] adventure headings
  - [ ] chapter/section headings
  - [ ] keyed areas
  - [ ] NPC names
  - [ ] monster names
  - [ ] item/treasure names
  - [ ] skill checks / DCs
  - [ ] saving throws
  - [ ] traps / hazards
  - [ ] boxed text markers
- [ ] Create page number mapping UI for PDF page index ↔ printed page
- [x] Add DM Prep auto-fill suggestion workflow from imported PDF index
- [x] Add explicit “apply/reject suggestion” preview for auto-filled DM Prep
- [x] Add private-only read-aloud handling and warning banner
- [x] Ensure imported/extracted data is marked:
  - [x] `localOnly: true`
  - [x] `enteredByUser: true`
  - [x] `privateDmData: true`
  - [ ] `doNotCommit: true`
- [x] Add a “Import Official PDF Locally” flow on the Sourcebook page
- [x] Add PDF import / private prep audit sections in Canon Audit
- [x] Add safe export types:
  - [x] safe campaign skeleton only
  - [x] private DM prep
  - [x] private PDF index
  - [x] private full backup
- [x] Add explicit warnings before exporting private data
- [ ] Add Ravnica campaign mode content / skeleton and enforce non-default crossover
- [x] Add missing prompt-required game architecture files:
  - [x] `src/game/types.ts`
  - [x] `src/game/dice.ts`
  - [x] `src/game/rulesEngine.ts`
  - [x] `src/game/combatEngine.ts`
  - [x] `src/game/canonValidator.ts`
  - [x] `src/game/saveSystem.ts`
  - [x] `src/game/sourceReferences.ts`
- [x] Add prompt-required content structure:
  - [x] `src/content/sourcebooks.ts`
  - [x] `src/content/adventurePacks/exampleCanonPlaceholder.ts`
  - [x] `src/content/placeholders/exampleCanonPlaceholder.ts`
  - [x] `src/data/schemas/index.ts`

## Documentation still missing

- [x] `docs/ARCHITECTURE.md`
- [x] `docs/SOURCEBOOK_DATA_GUIDE.md`
- [x] `docs/ADDING_OFFICIAL_CONTENT.md`
- [x] `docs/CONTINUATION_NOTES.md`
- [x] `docs/TEST_REPORT.md`
- [x] `docs/NEXT_STEPS.md`

## Validation / cleanup

- [ ] Verify `SaveManager` export UI clearly separates safe vs private exports
- [ ] Verify `CanonAudit` flags missing refs, missing source IDs, cross-setting contamination, and private local data
- [ ] Confirm no official PDFs or copyrighted text are committed to the repo
- [ ] Add any missing `.gitignore` rules for PDFs, `.env`, export backups, local-only files
- [ ] Run full build again after implementation
- [ ] Test the new PDF auto-prep workflow end-to-end
