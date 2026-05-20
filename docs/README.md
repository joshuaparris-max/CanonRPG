# Canon Table Engine — README

## What Is This?

Canon Table Engine (Canon Companion) is an unofficial DM reference tool for running official D&D 5e 2014 adventures at the table.

It is **not** affiliated with or endorsed by Wizards of the Coast. You must own the sourcebooks to use this tool meaningfully.

## How to Run

The app runs in your browser. All data is stored locally in localStorage.

### Development (Replit)

The workflow starts automatically. The app is available at the root preview URL.

To run manually:
```
pnpm --filter @workspace/canon-table-engine run dev
```

## What the App Does

- **Campaign Dashboard**: Choose your campaign mode (Candlekeep / Yawning Portal / Ravnica)
- **DM Prep**: Prepare adventure nodes with your own page references and private notes
- **Run Session**: 3-panel session runner with party tracker, node runner, and dice tools
- **Combat Tracker**: Full D&D 5e combat with initiative, HP, conditions, rolls, and a formatted log
- **Characters**: PHB 2014 character creation and management
- **Sourcebook Data Entry**: Private local forms for monsters, NPCs, items, spells, and traps
- **Canon Audit**: Health score and copyright-safety checker
- **Save Manager**: Export/import all data as JSON, generate session summaries

## What Is Safe to Commit / Share

| Data | Safe to Share? |
|------|---------------|
| App source code | Yes |
| Character JSON (no private notes) | Generally yes |
| DM prep JSON | **No** — may contain notes from books you own |
| Full session JSON | **No** — contains DM prep data |
| Combat log | Generally yes |
| Session summary (auto-generated) | Generally yes |

## Moving to a New Replit Account

1. Go to **Save Manager** in the app
2. **Export Full Session JSON** → save the file locally
3. **Export Characters JSON** → save the file locally
4. Open the new Replit's Canon Table Engine app
5. Go to **Save Manager** → **Import Full Session JSON**
6. Go to **Save Manager** → **Import Characters JSON**

See `docs/HANDOFF_TO_NEXT_REPLIT.md` for full details.

## Copyright Notice

This tool is unofficial and does not include any copyrighted material from Wizards of the Coast. Adventure skeletons are structural scaffolds only — empty node templates the DM populates using books they own.

Not affiliated with or endorsed by Wizards of the Coast LLC. Dungeons & Dragons is a trademark of Wizards of the Coast.
