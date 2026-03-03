# Deploying prepper-frontend

There are two ways to deploy:

- **From source** — build the Docker image locally and deploy using the chart bundled in this repo. Intended for local development.
- **Published chart** — use the pre-built chart published to `oci://ghcr.io/osbe/charts`. Intended for any real cluster.

---

## From source (local development)

### Prerequisites

- [Helm](https://helm.sh/docs/intro/install/) ≥ 3
- Docker
- A running cluster with `prepper-backend` already deployed

### 1 — Build the Docker image

```bash
docker build -t prepper-frontend:latest .
```

The Dockerfile is a two-stage build:
1. **Build stage** — `node:22-alpine` installs deps and runs `npm run build`
2. **Serve stage** — copies `dist/` into `nginx:1.27-alpine`

To test the image locally before deploying:

```bash
docker run -p 8080:80 prepper-frontend:latest
```

> Without a backend the `/api` proxy will 502, but the UI will load.

### 2 — Deploy

```bash
helm install prepper-frontend ./helm/prepper-frontend \
  --set image.repository=prepper-frontend \
  --set image.tag=latest \
  --set backend.url=http://prepper-backend:8080
```

Check pod status:

```bash
kubectl get pods -l app.kubernetes.io/name=prepper-frontend
```

### 3 — Upgrade

```bash
helm upgrade prepper-frontend ./helm/prepper-frontend \
  --set image.repository=prepper-frontend \
  --set image.tag=latest \
  --set backend.url=http://prepper-backend:8080
```

### 4 — Teardown

```bash
helm uninstall prepper-frontend
```

---

## Published chart

Charts are published to `oci://ghcr.io/osbe/charts` on every release. You need [Helm](https://helm.sh/docs/intro/install/) ≥ 3 and a running `prepper-backend` instance.

### Vanilla Helm

```bash
helm install prepper-frontend oci://ghcr.io/osbe/charts/prepper-frontend \
  --namespace <namespace> \
  --set backend.url=http://prepper-backend:8080 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=<your-hostname>
```

### FluxCD

No secrets required. The chart can be managed via a standard `HelmRelease` pointing to the `osbe-charts` OCI `HelmRepository`.

---

## Configuration reference

| Helm value | Default | Description |
|---|---|---|
| `image.repository` | `prepper-frontend` | Image registry path |
| `image.tag` | `latest` | Image tag |
| `image.pullPolicy` | `IfNotPresent` | Use `Always` if overwriting a tag |
| `backend.url` | `http://prepper-backend:8080` | Backend service URL |
| `basePath` | `/` | Base path if serving under a subpath |
| `ingress.enabled` | `false` | Set `true` to create an Ingress |
| `ingress.hosts[0].host` | `prepper.local` | Hostname for the Ingress |

## How the nginx proxy works

The chart renders a ConfigMap with an nginx config that:
- Serves the SPA from `/usr/share/nginx/html`, falling back to `index.html` for client-side routing
- Proxies all `/api/` requests to `backend.url`, stripping the `/api` prefix

This ConfigMap is mounted over `/etc/nginx/conf.d/default.conf` in the container. A `checksum/config` annotation on the Deployment ensures pods roll when the ConfigMap changes.
