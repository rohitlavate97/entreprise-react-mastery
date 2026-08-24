# Module 18.5 — Deployment & Infrastructure Issues Lab (DEPLOY-001 to DEPLOY-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for containerized React deployments.

---

## 🔬 DEPLOY-001: Direct URL Navigation Returns 404 Not Found in Nginx

- **Severity:** 🔴 Critical
- **Environment:** Production (Nginx / Kubernetes)
- **Symptoms:** Users can click links inside the app, but pressing F5 (refresh) on `/orders/9912` or opening a shared bookmark returns `404 Not Found`.
- **Root Cause:** Nginx looked for a physical file `/usr/share/nginx/html/orders/9912` and found nothing.
- **Fix:** Add `try_files $uri $uri/ /index.html;` to Nginx `location /` block.

---

## 🔬 DEPLOY-002: Stale Cache Preventing Hotfix Delivery

- **Severity:** 🔴 Critical (Deployment Blocked)
- **Environment:** Production (CDN / Nginx)
- **Symptoms:** Production hotfix deployed, but 90% of returning customers still see the old broken version until they manually hard-refresh (Ctrl+F5).
- **Root Cause:** Nginx sent `Cache-Control: max-age=31536000` on `index.html`. Browser cached the old HTML file containing old script bundle hashes.
- **Fix:** Enforce `add_header Cache-Control "no-cache, no-store, must-revalidate";` on `index.html`.

---

## 🔬 DEPLOY-003: Runtime Environment Variables Missing in Kubernetes Deployment

- **Severity:** 🔴 Critical
- **Environment:** Production Kubernetes
- **Symptoms:** Promoting Docker image from Staging to Production causes Production app to communicate with Staging backend API!
- **Root Cause:** `VITE_API_URL` was baked into the JavaScript bundle at build-time during the CI pipeline.
- **Fix:** Inject dynamic `window.__RUNTIME_CONFIG__` at container startup via `docker-entrypoint.sh`.

---

## 🔬 DEPLOY-004: Bloated 1.2GB Docker Image Exhausting Registry Storage

- **Severity:** 🟡 Medium
- **Environment:** Container Registry / CI/CD
- **Symptoms:** Docker build takes 8 minutes, image size is 1.2GB, container deployment pulls slowly on Kubernetes nodes.
- **Root Cause:** Single-stage Dockerfile shipped `node_modules`, devDependencies, and raw TypeScript source into production.
- **Fix:** Implement Multi-Stage Dockerfile using `node:20-alpine` builder and `nginx:alpine-slim` runner (reduces image to 24MB).

---

## 🔬 DEPLOY-005: Docker Non-Root User Permission Denied on `nginx.pid`

- **Severity:** 🔴 Critical
- **Environment:** Production (OpenShift / Kubernetes non-root policy)
- **Symptoms:** Container crashes immediately on boot with `nginx: [emerg] open() "/var/run/nginx.pid" failed (13: Permission denied)`.
- **Root Cause:** Container runs as non-root `USER nginx`, but `/var/run` is owned by root.
- **Fix:** `touch /var/run/nginx.pid && chown -R nginx:nginx /var/run/nginx.pid` in Dockerfile before switching user.

---

## 🔬 DEPLOY-006: CI/CD Pipeline Building Without Frozen Lockfile

- **Severity:** 🔴 High
- **Environment:** CI/CD Build
- **Symptoms:** Production build unexpectedly breaks on Friday afternoon with zero code changes committed.
- **Root Cause:** CI script ran `npm install` instead of `npm ci`, pulling in a broken minor update of a transitive sub-dependency.
- **Fix:** Always use `npm ci` or `pnpm install --frozen-lockfile` in CI pipelines.

---

## 🔬 DEPLOY-007: Missing Gzip/Brotli Compression Serving 5MB Uncompressed Bundle

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Mobile users experience 6-second initial load times; Lighthouse flags "Enable text compression".
- **Root Cause:** `gzip on` was missing from `nginx.conf`.
- **Fix:** Enable `gzip on; gzip_types text/plain text/css application/javascript application/json;`.

---

## 🔬 DEPLOY-008: Docker HEALTHCHECK Failing Due to Missing `wget`

- **Severity:** 🟡 Medium
- **Environment:** Kubernetes / ECS
- **Symptoms:** Container is continually marked Unhealthy and restarted every 2 minutes by container orchestrator.
- **Root Cause:** Minimal Alpine image did not include `curl`, and `wget` was misconfigured with un-supported flags.
- **Fix:** Use standard `HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost:8080/healthz || exit 1`.
