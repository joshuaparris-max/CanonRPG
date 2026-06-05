# Deployment Notes — Canon Table Engine

## Architecture Summary

The Canon Table Engine is a browser-based D&D 5e DM companion app designed to run entirely on the client side.

- **Framework**: React + Vite + TypeScript
- **State Management**: React hooks (useState, useEffect, etc.) and custom hooks.
- **Storage**: `localStorage` (browser storage). No backend database or authentication.
- **Styling**: Tailwind CSS + Shadcn UI components.
- **Icons**: Lucide React.
- **Routing**: `wouter` for lightweight client-side routing.
- **Data Model**: Uses JSON schemas for adventures, characters, and DM prep data.
- **Monorepo**: Managed with `pnpm` workspaces.

## Local Development

To run the app locally:

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```
2.  **Run the development server**:
    ```bash
    pnpm --filter @workspace/canon-table-engine run dev
    ```
3.  **Build the app**:
    ```bash
    pnpm --filter @workspace/canon-table-engine run build
    ```

## Vercel Deployment

### Configuration

The project is configured for Vercel deployment using a `vercel.json` at the root and specific project settings.

#### Vercel Project Settings:

- **Framework Preset**: `Other` (or `Vite`, but ensure Output Directory is overridden)
- **Root Directory**: `.` (Repo root)
- **Build Command**: `pnpm --filter @workspace/canon-table-engine run build`
- **Output Directory**: `artifacts/canon-table-engine/dist/public` (CRITICAL: Ensure this matches exactly)
- **Install Command**: `pnpm install --frozen-lockfile`

> **Note**: If Vercel reports "No Output Directory named 'public' found", it means the Dashboard is overriding the `vercel.json` settings. Go to **Project Settings > Build & Development Settings** and manually set the **Output Directory** to `artifacts/canon-table-engine/dist/public`.

### Recommended Vercel Setup (Sub-Project Method)

For the most reliable deployment, set the **Root Directory** in Vercel to `artifacts/canon-table-engine`.

- **Root Directory**: `artifacts/canon-table-engine`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install --frozen-lockfile` (Vercel will correctly detect the workspace root)

### Environment Variables

- `BASE_PATH`: Set to `/` for standard deployments.
- `NODE_ENV`: Set to `production` for builds.

## Replit Compatibility

The app maintains compatibility with Replit using conditional logic in `vite.config.ts`. Replit-specific plugins are only loaded if `REPL_ID` is present and `NODE_ENV` is not `production`.

## Copyright & Data Safety

- **No Copyrighted Text**: The app does not ship with official D&D adventure text, monster stats, or spell descriptions.
- **User Data**: All user-entered data (private notes, character details) stays in the user's browser.
- **Safety**: Users are encouraged to export their data regularly using the Save Manager.
