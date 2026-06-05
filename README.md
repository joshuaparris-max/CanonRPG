# Canon Table Engine

Canon Table Engine is an unofficial browser-based DM companion for running official D&D 5e (2014) adventures at the table. It provides a structured, high-contrast interface for DMs to organize their preparation, track party status, and run sessions efficiently without including copyrighted sourcebook text.

## Features

- **Campaign Dashboard**: Quick overview of campaign readiness and session status.
- **DM Prep**: Structured node editor for private notes, page references, and mechanical details.
- **Run Session**: 3-panel DM interface with party tracking, node runner, and dice tools.
- **Combat Tracker**: Initiative management, HP tracking, and automated combat logging.
- **Characters**: PHB 2014 character management with automated HP and passive checks.
- **Sourcebook Data**: Private local storage for monsters, NPCs, items, and spells.
- **Save Manager**: Robust export/import system with timestamped backups and safety validation.
- **Canon Audit**: Copyright-safety and preparation health checker.

## Local Development

### Prerequisites

- [pnpm](https://pnpm.io/) installed globally.

### Setup

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```
2.  **Run the development server**:
    ```bash
    pnpm --filter @workspace/canon-table-engine run dev
    ```
3.  **Run typecheck**:
    ```bash
    pnpm run typecheck
    ```

## Vercel Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

### Vercel Project Settings

- **Framework Preset**: `Other`
- **Root Directory**: `.`
- **Build Command**: `pnpm --filter @workspace/canon-table-engine run build`
- **Output Directory**: `artifacts/canon-table-engine/dist/public`
- **Install Command**: `pnpm install --frozen-lockfile`

> **IMPORTANT**: If your deployment fails with "No Output Directory named 'public' found", manually set the **Output Directory** in your Vercel Project Settings to `artifacts/canon-table-engine/dist/public`.

### Environment Variables

- `BASE_PATH`: Set to `/` (default).

## Data & Privacy

- **Local Storage**: All data (characters, notes, prep) is stored entirely in your browser's `localStorage`.
- **No Backend**: The app does not use a backend database or authentication. Your data never leaves your device unless you export it.
- **Backups**: Use the **Save Manager** to export `.json` backups of your campaign. It is highly recommended to backup regularly.

## Copyright & Canon Safety

This tool is an **unofficial DM companion**. It is not affiliated with or endorsed by Wizards of the Coast LLC.

- **No Copyrighted Text**: This app does not ship with official adventure text, monster stat blocks, or spell descriptions.
- **User Provided Content**: Users are expected to own the official sourcebooks and populate their local storage with private notes and references.
- **Adventure Scaffolds**: Included adventure templates are structural skeletons only, containing no narrative content.

## Repository Structure

- `artifacts/canon-table-engine`: The main React/Vite application.
- `docs/`: Detailed documentation, roadmap, and policies.
- `lib/`: Shared libraries and utilities.

---
*Dungeons & Dragons is a trademark of Wizards of the Coast LLC.*
