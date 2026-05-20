# QA Report — Canon Table Engine (Replit 2)

## Build Results

_To be updated after build completes._

### Commands Run
```
pnpm install
pnpm run typecheck
pnpm run build
cd artifacts/canon-table-engine
pnpm run build
pnpm run serve
```

### Typecheck Result
PASS - `pnpm run typecheck`

### Build Result
PASS - `pnpm run build`

### App Build / Serve Result

PASS - `pnpm run build` from `artifacts/canon-table-engine`

PASS - `pnpm run serve` with `PORT=4180`

- `http://localhost:4180/` returned HTTP 200.
- `http://localhost:4180/health.json` returned the static health payload.
- Vite preview does not apply Vercel rewrites, so `/health` locally falls back to the SPA. On Vercel, root `vercel.json` rewrites `/health` to `/health.json`.

## Vercel Crash Diagnosis

Root cause: deployment was pointed at server/API behavior instead of the static Vite app. The app is browser-local and does not require a serverless homepage. The API server package expects `PORT` and calls `app.listen`, which is not appropriate for a Vercel Serverless Function homepage and can produce `FUNCTION_INVOCATION_FAILED`.

Fix:

- Added root `vercel.json` for static Vite build/output.
- Added static `artifacts/canon-table-engine/public/health.json`.
- Confirmed the app is static-only and `artifacts/api-server` is not required for the public deployment.
- Root cause: Vercel was targeting the wrong package/root and treating the deployment as a server/API function instead of a static Vite frontend.

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
