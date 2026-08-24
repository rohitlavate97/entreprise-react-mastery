# Playbook PB-014 — Production Incident Response, Source Maps & Memory Heap Triage

## Objective
Provide an operational triage workflow for diagnosing production outages, de-minifying Sentry stack traces, tracing memory heap growth, and mitigating stale asset caching.

---

## 1. Production Minified Error De-Minification Workflow

```
[ Step 1: Check Sentry Release Version ]
  - Verify if error tag release (e.g. v2.4.1) matches uploaded artifact release.
             │
[ Step 2: Verify Source Map Upload in Sentry UI ]
  - Settings -> Projects -> Source Maps -> Inspect uploaded bundle.js.map files.
  - If missing: CI/CD step failed during sentry-cli sourcemaps upload.
             │
[ Step 3: Local Emergency De-Minification ]
  - Run sentry-cli locally:
    sentry-cli sourcemaps explain <event-id>
```

---

## 2. Production Memory Leak (Heap Growth) Triage

```
[ Step 1: Execute 3-Snapshot Comparison ]
  - Snapshot 1: Clean state.
  - Action: Execute target user action 10 times -> return to clean state.
  - Force GC -> Snapshot 2.
             │
[ Step 2: Filter by Constructor ]
  - Class filter: "Detached HTMLElement" or "FiberNode".
  - Inspect Retainers panel at bottom of DevTools.
  - Identify closure scope keeping reference alive (window listener, setInterval, global map).
             │
[ Step 3: Add Explicit Cleanup ]
  - Verify useEffect return cleanup function exists and executes on unmount.
```

---

## 3. Stale Deployment (Cached Old Version) Triage

```
[ Step 1: Inspect Nginx Headers ]
  - curl -I https://app.enterprise.com/index.html
  - Verify Cache-Control: no-cache, no-store, must-revalidate.
             │
[ Step 2: Purge CDN Cache ]
  - Cloudflare / CloudFront -> Invalidate /index.html cache immediately.
             │
[ Step 3: Service Worker Unregister Protocol ]
  - If service worker is corrupted: deploy an emergency sw.js that calls
    self.registration.unregister() and reloads the page.
```
