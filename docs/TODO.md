# Canon Table Engine — TODO

## Major missing features

- [ ] Implement local browser PDF import using `pdfjs-dist`
- [ ] Add a Sourcebook Library manager UI for imported PDFs
- [ ] Store imported PDF metadata locally:
  - sourceBook
  - sourceId
  - fileName
  - fileHash
  - importDate
  - pageCount
  - detected title/TOC
  - pdfPageOffset mapping
  - indexed status
  - lastIndexedAt
- [ ] Build PDF indexer/parser to detect:
  - adventure headings
  - chapter/section headings
  - keyed areas
  - NPC names
  - monster names
  - item/treasure names
  - skill checks / DCs
  - saving throws
  - traps / hazards
  - boxed text markers
- [ ] Create page number mapping UI for PDF page index ↔ printed page
- [ ] Add DM Prep auto-fill suggestion workflow from imported PDF index
- [ ] Add explicit “apply/reject suggestion” preview for auto-filled DM Prep
- [ ] Add private-only read-aloud handling and warning banner
- [ ] Ensure imported/extracted data is marked:
  - `localOnly: true`
  - `enteredByUser: true`
  - `privateDmData: true`
  - `doNotCommit: true`
- [ ] Add a “Import Official PDF Locally” flow on the Sourcebook page
- [ ] Add PDF import / private prep audit sections in Canon Audit
- [ ] Add safe export types:
  - safe campaign skeleton only
  - private DM prep
  - private PDF index
  - private full backup
- [ ] Add explicit warnings before exporting private data
- [ ] Add Ravnica campaign mode content / skeleton and enforce non-default crossover
- [ ] Add missing prompt-required game architecture files:
  - `src/game/types.ts`
  - `src/game/dice.ts`
  - `src/game/rulesEngine.ts`
  - `src/game/combatEngine.ts`
  - `src/game/canonValidator.ts`
  - `src/game/saveSystem.ts`
  - `src/game/sourceReferences.ts`
- [ ] Add prompt-required content structure:
  - `src/content/sourcebooks.ts`
  - `src/content/adventurePacks/...`
  - `src/content/placeholders/exampleCanonPlaceholder.ts`
  - `src/data/schemas/`

## Documentation still missing

- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/SOURCEBOOK_DATA_GUIDE.md`
- [ ] `docs/ADDING_OFFICIAL_CONTENT.md`
- [ ] `docs/CONTINUATION_NOTES.md`
- [ ] `docs/TEST_REPORT.md`
- [ ] `docs/NEXT_STEPS.md`

## Validation / cleanup

- [ ] Verify `SaveManager` export UI clearly separates safe vs private exports
- [ ] Verify `CanonAudit` flags missing refs, missing source IDs, cross-setting contamination, and private local data
- [ ] Confirm no official PDFs or copyrighted text are committed to the repo
- [ ] Add any missing `.gitignore` rules for PDFs, `.env`, export backups, local-only files
- [ ] Run full build again after implementation
- [ ] Test the new PDF auto-prep workflow end-to-end
