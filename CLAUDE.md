# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (proxies /api → http://localhost:8080)
npm run build    # Type-check + Vite production build
npm run lint     # ESLint (TypeScript + React hooks + React Refresh rules)
npm run preview  # Serve the production build locally
npm test         # Run Vitest in watch mode
npm test -- --run  # Run Vitest once (used in CI)
```

## Architecture

### Data flow
Pages fetch data via **TanStack Query hooks** (`src/hooks/`) → hooks call **API functions** (`src/api/`) → API functions use the **Axios client** (`src/api/client.ts` with `baseURL: /api`). Mutations call `queryClient.invalidateQueries` to refresh affected queries on success.

Two sets of API functions exist:
- `src/api/products.ts` — CRUD for products + stock entries scoped to a product (`/products/:id/stock`)
- `src/api/stock.ts` — cross-product stock queries (`/stock/expired`, `/stock/expiring`, `/stock/low`) and stock entry mutations

Two query-key namespaces: `['products', ...]` and `['stock', ...]`. Mutations that affect both namespaces (e.g. adding/deleting a stock entry) must invalidate both.

### Routing
All pages render inside `<Layout>` (Navbar + `<Outlet>`). Routes are defined in `src/App.tsx`. `ProductFormPage` doubles as create and edit — it detects edit mode by checking for `:id` param.

### i18n
Swedish (`sv`) is the default language; English (`en`) is available. Language is persisted in `localStorage` under `prepper-lang`.

- Use `useTranslation()` from `react-i18next` and call `t('key')` for all user-visible strings.
- Category and unit labels must come from translation keys (`t('categories.X')`, `t('units.X')`), **not** from constants in `types/index.ts`.
- For date formatting, use the `useFormatDate()` hook (`src/i18n/useFormatDate.ts`) rather than calling `formatDate` directly — it picks up the current language automatically.
- When adding new translation keys, add them to **both** `src/i18n/locales/sv.ts` and `src/i18n/locales/en.ts`. Types are enforced via `src/i18n/i18next.d.ts`.

### Styling
Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no separate config file needed). No component library — UI is built with utility classes directly in TSX. Shared UI primitives live in `src/components/ui/`.

### Deployment
- Dev proxy: Vite strips `/api` prefix and forwards to `http://localhost:8080`.
- Production: Nginx (configured via Helm ConfigMap at `helm/prepper-frontend/templates/configmap.yaml`) proxies `/api/` to `backend.url` (also strips `/api` prefix).
- Container: multi-stage Dockerfile — `node:22-alpine` build stage, `nginx:1.27-alpine` serve stage.
