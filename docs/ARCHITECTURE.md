# Architecture

## Canon Table Engine

The app is a local-first Vite + React TypeScript application that stores campaign state in browser localStorage.

### Key areas

- `artifacts/canon-table-engine/src/pages` — main UI screens
- `artifacts/canon-table-engine/src/lib` — reusable utilities for session export and PDF import
- `artifacts/canon-table-engine/src/types` — shared domain types for sourcebook entries, session state, and PDF metadata
- `artifacts/canon-table-engine/src/game` — stubbed canonical game architecture modules
- `artifacts/canon-table-engine/src/content` — placeholder content and sourcebook definitions
- `artifacts/canon-table-engine/src/data/schemas` — placeholder schema definitions for sourcebook data

### Data model

- Sourcebook entries are private, local-only, and marked using `localOnly` / `enteredByUser`.
- Imported PDF metadata and index entries are stored locally in the browser.
- Export flows separate safe exports from private exports.
