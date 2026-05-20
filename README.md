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

## Vercel Deployment

This project deploys as a static Vite app, not as the Express API package.
 
Use the committed root `vercel.json`, or set the Vercel project settings to:
 
- Framework Preset: Vite
- Root Directory: repository root
- Install Command: `pnpm install`
- Build Command: `pnpm --dir artifacts/canon-table-engine run build`
- Output Directory: `artifacts/canon-table-engine/dist/public`
 
If the Vercel project is configured with `artifacts/canon-table-engine` as its Root Directory instead, use:
- Output Directory: `dist/public`

The deployed site should serve `/` as static HTML and `/health` as a static health response. Do not point the Vercel homepage at `artifacts/api-server`; that package expects a long-running server environment and is not required for the browser-local companion app.

## Notes

- The app is designed as a local browser companion and stores data in browser storage.
- The `artifacts/canon-table-engine` package now supports default local env values for `PORT` and `BASE_PATH`.
- Use `docs/README.md` for app-specific guidance and `docs/HANDOFF_TO_NEXT_REPLIT.md` for transfer details.
