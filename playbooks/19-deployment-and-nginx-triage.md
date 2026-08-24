# Playbook PB-019 — Container Deployment, Nginx Routing & CI/CD Pipeline Triage

## Objective
Provide an operational triage workflow for diagnosing SPA 404 navigation errors in Nginx, stale deployment asset caching, Docker non-root permission failures, and runtime environment variable misconfigurations.

---

## 1. SPA 404 Deep Link Navigation Triage

```
[ Step 1: Reproduce 404 ]
  - Navigate to root (/) -> Click internal link to (/orders/100) -> Works.
  - Press F5 (Page Refresh) -> Returns 404 Not Found.
             │
[ Step 2: Fix Nginx try_files Directive ]
  - In nginx.conf, ensure location / has:
    try_files $uri $uri/ /index.html;
             │
[ Step 3: Test Direct curl Navigation ]
  - Run: curl -I http://localhost:8080/orders/100
  - Should return HTTP 200 OK with Content-Type: text/html.
```

---

## 2. Stale Deployment (Cached Old Assets) Triage

```
[ Step 1: Verify index.html Headers ]
  - curl -I https://app.enterprise.com/index.html
  - Verify presence of: Cache-Control: no-cache, no-store, must-revalidate.
             │
[ Step 2: Verify Hashed Assets Headers ]
  - curl -I https://app.enterprise.com/assets/index.a89f.js
  - Verify presence of: Cache-Control: public, max-age=31536000, immutable.
             │
[ Step 3: Invalidate Edge CDN Cache ]
  - Cloudflare / CloudFront -> Invalidate /index.html and /config.js.
```

---

## 3. Docker Non-Root Permission Denied Triage

```
[ Step 1: Inspect Container Logs ]
  - docker logs <container-id>
  - Look for: open() "/var/run/nginx.pid" failed (13: Permission denied)
             │
[ Step 2: Fix Directory Permissions in Dockerfile ]
  - Add before USER nginx:
    RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html && \
        touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid
```
