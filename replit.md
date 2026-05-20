# Canon Table Engine (Canon Companion)

A private D&D 5e 2014 DM table companion and adventure runner. Helps DMs prep and run official adventures they own, with all private data staying local in the browser.

## Run & Operate

- `pnpm --filter @workspace/canon-table-engine run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter, react-hook-form + zod
- All data: localStorage (no database required for core features)
- API: Express 5 (minimal — health check only)
- Build: Vite (frontend), esbuild (API server CJS bundle)

## Where things live

- `artifacts/canon-table-engine/src/` — main React app
  - `src/pages/` — one file per page/route
  - `src/hooks/` — useLocalStorage, useSession, useDiceRoller, useCombat, useCanonAudit
  - `src/data/` — adventureSkeletons.ts, sourceBooks.ts, characterDefaults.ts
  - `src/types/` — TypeScript interfaces
  - `src/components/` — shared components
  - `src/lib/` — utilities
- `artifacts/api-server/` — Express API (health check only)
- `docs/` — project documentation

## localStorage Keys

- `cte_characters` — array of Character objects
- `cte_session` — session state (campaignMode, adventureId, currentNodeId, sessionLog, dmNotes, lastSaved, schemaVersion)
- `cte_node_overrides` — DM prep overrides keyed by nodeId
- `cte_sourcebook` — { monsters, npcs, items, spells, traps }
- `cte_combat` — current combat state

Schema version: **2.0.0**

## Architecture decisions

- **100% localStorage** — no server-side persistence. All DM prep data stays in the user's browser. This is intentional for copyright safety: private book notes never leave the user's machine.
- **No copyrighted content** — adventure skeletons are structural scaffolds only (blank pageRefs, broad node labels). The DM fills in their own page refs from books they own.
- **Import/export as JSON** — full portability between browsers/Replit accounts via manual export.
- **Canon-safe by design** — source book fields are required on all local entries. Canon audit flags missing refs.
- **Ravnica isolation** — GGR content is locked behind an explicit crossover toggle in campaign settings.

## Source Priority

- Tier 1 (Core): PHB2014, MM2014, DMG2014
- Tier 2 (FR/Sword Coast): SCAG, CM (Candlekeep Mysteries), TFTYP (Tales from the Yawning Portal)
- Tier 3 (Expansion): VGM, AL
- Tier 4 (Setting-Specific): GGR (Ravnica mode only)

## Product

- Campaign Dashboard: select mode (Candlekeep / Yawning Portal / Ravnica), view session readiness
- DM Prep: node-by-node adventure preparation with private notes (localOnly)
- Run Session: 3-panel session runner (party tracker / node runner / dice + log)
- Combat Tracker: full initiative + HP + condition + roll tracking with log
- Characters: PHB 2014 creation, stat tracking, spell slot management
- Sourcebook Data Entry: local monster/NPC/item/spell/trap forms (all localOnly, enteredByUser)
- Canon Audit: health score, missing refs, copyright-risk heuristics
- Save Manager: export/import JSON, session summary markdown
- Session Summary: auto-generated markdown from session state

## User preferences

- Dark mode default (dark parchment / candlelit palette, amber/gold accents)
- No emojis in the UI
- Footer on every page: "Unofficial reference companion. Not affiliated with or endorsed by Wizards of the Coast. Use with sourcebooks you own."
- Private data warnings on all large text fields

## Gotchas

- NEVER add copyrighted D&D adventure text, stat blocks, official art, or boxed text to source files
- All private DM prep data must be marked localOnly: true, enteredByUser: true in the data model
- Exported DM prep JSON may contain private notes — warn the user before sharing
- Ravnica (GGR) content must only appear when campaign mode is set to Ravnica AND crossover is explicitly enabled
- Run `pnpm run typecheck` before declaring build success
- Always validate import JSON against schema version "2.0.0" before loading

## Pointers

- See `docs/CANON_POLICY.md` for copyright safety rules
- See `docs/HANDOFF_TO_NEXT_REPLIT.md` for migration instructions
- See `docs/ROADMAP.md` for phase tracking
