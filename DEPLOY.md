# Build & Deploy Guide

## 1. Build the Docker image

```bash
docker build -t prepper-frontend:latest .
```

The Dockerfile is a two-stage build:
1. **Build stage** — `node:22-alpine` installs deps and runs `npm run build`
2. **Serve stage** — copies `dist/` into `nginx:1.27-alpine`; nginx config is overridden at runtime by a K8s ConfigMap (the `nginx.conf` in the repo is only a local fallback)

To test the image locally before deploying:

```bash
docker run -p 8080:80 prepper-frontend:latest
```

Note: without a backend the `/api` proxy will 502, but the UI will load.

---

## 2. Push the image to your registry

```bash
docker tag prepper-frontend:latest <your-registry>/prepper-frontend:<tag>
docker push <your-registry>/prepper-frontend:<tag>
```

---

## 3. Deploy with Helm

**Dry-run / template inspection:**
```bash
helm template prepper-frontend ./helm/prepper-frontend \
  --set image.repository=<your-registry>/prepper-frontend \
  --set image.tag=<tag> \
  --set backend.url=http://prepper-backend:8080
```

**Install:**
```bash
helm install prepper-frontend ./helm/prepper-frontend \
  --set image.repository=<your-registry>/prepper-frontend \
  --set image.tag=<tag> \
  --set backend.url=http://prepper-backend:8080
```

**Upgrade (subsequent deploys):**
```bash
helm upgrade prepper-frontend ./helm/prepper-frontend \
  --set image.repository=<your-registry>/prepper-frontend \
  --set image.tag=<tag> \
  --set backend.url=http://prepper-backend:8080
```

---

## 4. Key values to configure

| Value | Default | Notes |
|---|---|---|
| `image.repository` | `prepper-frontend` | Your registry path |
| `image.tag` | `latest` | Use a specific tag in production |
| `image.pullPolicy` | `IfNotPresent` | Use `Always` if overwriting a tag |
| `backend.url` | `http://prepper-backend:8080` | K8s service URL for the backend |
| `ingress.enabled` | `false` | Set `true` to create an Ingress |
| `ingress.hosts[0].host` | `prepper.local` | Your actual hostname |

---

## 5. How the nginx proxy works

The Helm chart renders a ConfigMap with an nginx config that:
- Serves the SPA from `/usr/share/nginx/html`, falling back to `index.html` for client-side routing
- Proxies all `/api/` requests to `backend.url`, stripping the `/api` prefix

This ConfigMap is mounted over `/etc/nginx/conf.d/default.conf` in the container. A `checksum/config` annotation on the Deployment ensures pods roll when the ConfigMap changes.
