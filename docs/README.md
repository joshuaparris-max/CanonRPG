# Canon Table Engine — README

## What Is This?

Canon Table Engine is an unofficial DM companion for running official D&D 5e adventures you already own.
It provides campaign structure, private note-taking, combat tracking, character management, and local session saving.

This app is not affiliated with or endorsed by Wizards of the Coast.

## How to Run Locally

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/canon-table-engine run dev
```

Then open the local Vite URL shown in the terminal.

## How to Build

```bash
pnpm install
pnpm --filter @workspace/canon-table-engine run build
```

## How to Deploy to Vercel

Recommended Vercel settings:

- Framework: `Vite`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter @workspace/canon-table-engine run build`
- Output directory: `artifacts/canon-table-engine/dist/public`
- Environment variable: `BASE_PATH=/` (optional; default is `/`)

A `vercel.json` file is included in the repository root for monorepo deployment.

## What the App Does

- Campaign Dashboard with mode selection and adventure readiness
- DM Prep with private notes, page references, and node structure
- Run Session mode with party tracker, current node, dice tools, and session log
- Combat Tracker with initiative order, HP, conditions, and logs
- Character creation, editing, party management, export/import
- Sourcebook data entry for monsters, NPCs, items, spells, traps, and locations
- Canon Audit for copyright safety and session readiness checks
- Save Manager with export/import, reset confirmation, and backup reminders

## Local Browser Storage

The app stores all user data in browser localStorage under keys like:

- `cte_session`
- `cte_characters`
- `cte_node_overrides`
- `cte_sourcebook`
- `cte_combat`

Local data is not sent to any server.

## Backup and Export

Use Save Manager to export files with timestamped names.
Full session exports include private DM prep and should be kept private.
Character exports are safer to share if no private notes are included.

## Copyright Safety

This app does not include copyrighted adventure text, stat blocks, or maps.
Adventure skeletons are structural templates only. Users must own the relevant sourcebooks.

For more on safe content and private data handling, see `docs/CANON_POLICY.md`.
