# Canon Policy — Canon Table Engine

## Copyright Safety Rules

This project is an unofficial DM reference companion. It does NOT contain, ship, or reproduce:

- Official D&D adventure text (boxed text, room descriptions, flavor text)
- Official stat blocks (monster stats, NPC stats)
- Official artwork, maps, or illustrations
- Full spell/ability text from any WotC publication
- PDFs of any WotC product

## What IS Allowed in Source Files

- Source book IDs and titles (e.g., "PHB2014", "Monster Manual 2014")
- Structural adventure skeletons (blank node templates with broad section labels)
- Page reference numbers (the DM's own notation)
- Mechanical labels that are part of the public SRD 5.1 (dice notation, condition names, ability names)

## Private DM Prep Data

Users may enter their own private notes in the DM Prep section, referencing books they own. This data:

- Is stored ONLY in browser localStorage
- Is never sent to any server
- Is exportable as a JSON file for the user's own use
- Must be clearly labeled "Private local data" in the UI
- Should NOT be shared if it contains material copied from books the user does not own

## Source Priority

| Tier | Sources | Notes |
|------|---------|-------|
| Tier 1 | PHB2014, MM2014, DMG2014 | Core rules, always valid |
| Tier 2 | SCAG, CM, TFTYP | Forgotten Realms / Candlekeep / Yawning Portal |
| Tier 3 | VGM, AL | Optional expansion |
| Tier 4 | GGR | Ravnica mode only, requires crossover toggle |

## Copyright Risk Heuristics (Canon Audit)

The Canon Audit page flags:
- Any localOnly text field over 1,500 characters (large private data warning)
- Any public source file field over 500 characters (possible copyright risk)
- Ravnica content active without explicit crossover toggle

## What This App Is

An unofficial tool to help DMs organize and run adventures from books they own. It provides structure, not content. The DM provides the content from their own books.

**This app is not affiliated with or endorsed by Wizards of the Coast.**
