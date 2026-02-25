# Prepper Frontend

React SPA for managing a prepper stash — track food, water, and other supplies by category, monitor expiry dates, and get alerts when stock runs low.

## Features

- **Dashboard** — at-a-glance alerts for expired stock, items expiring within 30 days, and low stock levels
- **Food inventory** — create and manage products (preserved food, dry goods, freeze-dried, medicine, fuel, etc.) with target quantities and stock batches
- **Water tracking** — dedicated water product with batch-level detail
- **Stock entries** — per-batch quantity, purchase/expiry date, location, and notes
- **Offline detection** — blocking overlay when the backend is unreachable
- **i18n** — Swedish (default) and English, persisted in `localStorage`

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
