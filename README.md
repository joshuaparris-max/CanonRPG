# Canon Table Engine

This repository includes the Canon Table Engine browser app under `artifacts/canon-table-engine`.

## Local setup

1. Install dependencies from the workspace root:

```bash
pnpm install
```

2. Run the app locally:

```bash
cd artifacts/canon-table-engine
pnpm run dev
```

3. Build production output:

```bash
cd artifacts/canon-table-engine
pnpm run build
```

## Where the app lives

- App source: `artifacts/canon-table-engine/src`
- Vite config: `artifacts/canon-table-engine/vite.config.ts`
- Build output: `artifacts/canon-table-engine/dist/public`
- Docs: `docs/README.md`

## Notes

- The app is designed as a local browser companion and stores data in browser storage.
- The `artifacts/canon-table-engine` package now supports default local env values for `PORT` and `BASE_PATH`.
- Use `docs/README.md` for app-specific guidance and `docs/HANDOFF_TO_NEXT_REPLIT.md` for transfer details.
