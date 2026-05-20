# QA Report — Canon Table Engine (Replit 2)

## Build Results

_To be updated after build completes._

### Commands Run
```
pnpm run typecheck
pnpm --filter @workspace/canon-table-engine run build
```

### Typecheck Result
_Pending_

### Build Result
_Pending_

## Copyright Cleanup

### Files Checked
- `/attached_assets/` — contains only the user-provided zip and prompt text files, no PDFs of official content
- No official stat blocks or adventure text in any source file
- No official artwork embedded
- Adventure skeletons contain only structural labels and blank page refs

### Status: PASS (no copyrighted content detected)

## Manual Test Checklist

- [ ] App boots and shows Campaign Dashboard
- [ ] Campaign mode selection works (Candlekeep / Yawning Portal / Ravnica)
- [ ] Character creation: create a character with standard array
- [ ] Character creation: point buy mode validation
- [ ] Choose Candlekeep adventure → nodes appear in DM Prep
- [ ] Choose Yawning Portal adventure → nodes appear in DM Prep
- [ ] Edit a node in DM Prep → save node override
- [ ] Run Session view shows node overrides
- [ ] Roll a check in session view → appears in session log
- [ ] Create local monster in Sourcebook → appears in combat setup
- [ ] Start combat with local monster
- [ ] Attack roll flow: shows Hit/Miss with math
- [ ] Damage roll flow: shows dice results and total
- [ ] Export full session JSON (Save Manager)
- [ ] Import full session JSON (Save Manager)
- [ ] Export DM prep data JSON
- [ ] Import DM prep data JSON
- [ ] Canon Audit flags nodes with missing page refs
- [ ] Canon Audit health score updates after filling in page refs
- [ ] No PDFs in working tree

## Known Issues

_To be populated after testing._
