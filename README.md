# Prepper Frontend

React SPA for managing a prepper stash — track food, water, and other supplies by category, monitor expiry dates, and get alerts when stock runs low.

## Features

### Dashboard
Central overview with three alert panels:
- **Expired** — items past their expiry date, highlighted for immediate action
- **Expiring soon** — items expiring within the next 30 days
- **Low stock** — products where current quantity falls below the configured target
- **Water widget** — dedicated water status with total volume and days of supply remaining

### Food inventory
Organize supplies across categories: preserved food, dry goods, freeze-dried, canned, medicine, fuel, and more. Each product has a name, category, unit, and a **target quantity** so you always know how far off-target you are.

### Stock batches
Every product holds individual stock entries — one per purchase batch. Each entry tracks:
- Quantity and unit
- Purchase date and expiry date
- Storage location
- Free-text notes

Add, delete, and review entries from the product detail page. Expiry status is color-coded inline.

### Water tracking
Water is treated as a first-class product with its own dedicated page and dashboard widget. Batch-level detail (volume, location, expiry) works the same as food.

### Offline detection
A blocking overlay appears when the backend is unreachable, preventing stale interactions.

### Localization
Swedish (default) and English, switchable at any time. The selected language persists in `localStorage` and affects date formatting throughout the app.

## Stack

| | |
|---|---|
| React 19 + TypeScript 5.9 | UI |
| Vite 7 | Dev server & build |
| React Router v7 | Client-side routing |
| TanStack Query v5 | Server-state & caching |
| Axios | HTTP client (`baseURL: /api`) |
| Tailwind CSS v4 | Styling (via `@tailwindcss/vite`) |
| i18next + react-i18next | Translations |

## Development

Requires the backend running on `http://localhost:8080`. Vite proxies `/api` → `http://localhost:8080` (strips the prefix).

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check + production build → dist/
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard (alerts + water widget) |
| `/food` | Food product list with category filter |
| `/food/new` | Create food product |
| `/food/:id` | Product detail — stock batches, add/delete entries |
| `/food/:id/edit` | Edit food product |
| `/water` | Water detail page (singleton product) |
| `/water/edit` | Edit water product |

## Docker

The `Dockerfile` builds from source (suitable for local use):

```bash
docker build -t prepper-frontend .
docker run -p 8080:80 prepper-frontend
```

The `Dockerfile.serve` is used by CI — it copies the pre-built `dist/` from the runner into nginx, avoiding an npm install inside QEMU.

## Kubernetes / Helm

The Helm chart lives in `helm/prepper-frontend/`. The only required value is `backend.url`:

```bash
helm upgrade --install prepper-frontend ./helm/prepper-frontend \
  --set image.tag=0.1.0 \
  --set backend.url=http://prepper-backend:8080
```

nginx is configured via a Helm ConfigMap that templates `backend.url` into the reverse proxy. The fallback `nginx.conf` (used in plain Docker) proxies to `localhost:8080`.

Ingress is disabled by default:

```bash
--set ingress.enabled=true \
--set "ingress.hosts[0].host=prepper.example.com"
```

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push / PR to `main` | lint + build |
| `release.yml` | GitHub release published | validates tag == Chart version, builds multi-arch image (`amd64`/`arm64`), pushes to GHCR, packages and pushes Helm chart as OCI artifact |

Images are published to `ghcr.io/<owner>/prepper-frontend:<version>` and `:latest`.

To release, bump `version` and `appVersion` in `helm/prepper-frontend/Chart.yaml` to `X.Y.Z`, commit, then publish a GitHub release tagged `vX.Y.Z`.
