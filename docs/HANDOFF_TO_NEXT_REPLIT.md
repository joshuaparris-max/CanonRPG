# Handoff to Next Replit — Canon Table Engine

## Current State (Replit 2)

### What Was Built

This is the first full implementation of the Canon Table Engine in this Replit environment. The previous Replit 1 codebase was not transferred — this is a clean Replit 2 build.

**Implemented features (Phase 2–8):**
- Campaign Dashboard with mode selector (Candlekeep / Yawning Portal / Ravnica)
- DM Prep: full node editor with private notes, page refs, linked NPCs/monsters/items
- Run Session: 3-panel runner (party tracker / node runner / dice + log)
- Combat Tracker: initiative, HP, conditions, death saves, attack/damage/save rolls, combat log
- Characters: PHB 2014 creation, stat tracking, spell slots
- Sourcebook Data Entry: local monster/NPC/item/spell/trap forms
- Canon Audit: health score, missing refs, copyright-risk heuristics
- Save Manager: export/import JSON, session summary markdown
- Session Summary: auto-generated markdown
- Adventure Skeletons: Candlekeep (2), Tales from the Yawning Portal (7)

### What Remains for Replit 3

See `docs/ROADMAP.md` for full phase tracking. Remaining items:
- Full point-buy UI with drag-and-drop ability score assignment
- Deeper spell slot tracking UI
- More Candlekeep adventure skeletons (17 remain out of 17 total)
- Adventurers League adaptation notes framework
- Session log persistence across browser refresh
- Offline PWA support (service worker)
- Print-friendly session summary stylesheet

## How to Move Between Replit Accounts

1. In the current Replit: go to **Save Manager** page
2. Click **Export Full Session JSON** (private — contains DM prep data)
3. Click **Export Characters JSON**
4. Save both files locally
5. In the new Replit: open the app, go to **Save Manager**
6. Click **Import Full Session JSON** → select your saved file
7. Click **Import Characters JSON** → select your saved file
8. Verify Canon Audit shows expected data

**Important:** If exported DM prep data contains notes you typed from books you own, treat the export file as private. Do not share it publicly.

## Schema Version

Current schema version: **2.0.0**

If importing fails, check that the JSON file has `schemaVersion: "2.0.0"`. Future versions should maintain backward compatibility or provide a migration path.

## Architecture Notes

- All data: localStorage only. No database.
- Adventure skeletons: hardcoded in `src/data/adventureSkeletons.ts` — structural only, no official content
- Source book enforcement: every sourcebook entry requires sourceBook, sourceId, pageRef
- Canon audit: calculated client-side from localStorage data

## Vercel Deployment Notes

This repo should deploy as a static Vite app from `artifacts/canon-table-engine`.

- Do not deploy `artifacts/api-server` as the homepage.
- Root-level `vercel.json` now targets static output `artifacts/canon-table-engine/dist/public`.
- Build command: `pnpm --dir artifacts/canon-table-engine run build`
- Install command: `pnpm install`
- Output directory: `artifacts/canon-table-engine/dist/public`
- Health endpoint: `/health` rewrites to static `health.json`

## Known Issues / Sharp Edges

- LocalStorage has a 5MB limit. Very large DM prep exports may approach this.
- Clearing browser storage will lose all data — always export before clearing.
- Ravnica content (GGR) must be explicitly enabled in campaign settings.

## Vercel Deployment Notes

The app is a static Vite deployment. The Express API package under `artifacts/api-server` is not required for the browser companion and should not own the Vercel homepage.

The crash at `canon-rpg-api-server.vercel.app` was consistent with Vercel invoking the API/server package instead of serving the Vite static build. The API `src/index.ts` expects `PORT` and calls `app.listen`, which is a long-running server pattern and can crash in a Serverless Function context when `PORT` is absent.

Expected Vercel settings from repo root:

- Install Command: `pnpm install`
- Build Command: `pnpm --filter @workspace/canon-table-engine run build`
- Output Directory: `artifacts/canon-table-engine/dist/public`
- Deployment type: static Vite app

The root `vercel.json` encodes those settings and rewrites SPA routes to `index.html`. A static health file is available at `/health`.
