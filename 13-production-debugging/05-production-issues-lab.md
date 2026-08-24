# Module 13.5 — Production Incident Issues Lab (PROD-001 to PROD-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for production incidents.

---

## 🔬 PROD-001: Minified Production Stack Trace Unreadable in Sentry

- **Severity:** 🔴 High
- **Environment:** Production (Sentry)
- **Symptoms:** Sentry alerts on error `TypeError: Cannot read properties of undefined (reading 'u') at t.render (app.2b8f.js:1:3421)`.
- **Root Cause:** CI/CD pipeline built with `sourcemap: false` or failed to upload source maps to Sentry with matching release version.
- **Fix:** Build with `sourcemap: 'hidden'`, upload maps to Sentry via `@sentry/vite-plugin` using release hash, then delete `.map` files before CDN deploy.

---

## 🔬 PROD-002: Detached DOM Memory Leak Freezing Dashboard After 2 Hours

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** High-frequency trader tab RAM climbs from 120MB to 3.2GB over 2 hours, eventually crashing the browser tab with `Out of Memory`.
- **Root Cause:** WebSocket trade ticker subscribed to `window.addEventListener` inside `useEffect` without returning a cleanup function.
- **Fix:** Return explicit cleanup `return () => window.removeEventListener(...)`.

---

## 🔬 PROD-003: Sentry Event Quota Exhaustion Dropping Critical P1 Outages

- **Severity:** 🔴 Critical (Loss of Observability)
- **Environment:** Production
- **Symptoms:** A runaway render loop sends 500,000 errors in 10 minutes, exhausting monthly Sentry quota. Sentry stops recording all subsequent errors.
- **Root Cause:** Missing error rate limiting and deduplication in client Sentry configuration.
- **Fix:** Configure `integrations: [Sentry.dedupeIntegration()]` and set `sampleRate: 0.2` for high-volume non-critical warnings.

---

## 🔬 PROD-004: Telemetry Payload Leaking Credit Card PII to Third-Party Server

- **Severity:** 🔴 Critical (Security & PCI-DSS Violation)
- **Environment:** Production
- **Symptoms:** Security audit reveals Sentry breadcrumbs contain raw credit card numbers entered into payment forms.
- **Root Cause:** Sentry default DOM click / input breadcrumb tracker captured input element values without masking.
- **Fix:** Add `maskAllInputs: true` to Sentry configuration and sanitize headers in `beforeSend`.

---

## 🔬 PROD-005: Stale Service Worker Caching Outdated `index.html`

- **Severity:** 🔴 Critical (Deployment Blocked)
- **Environment:** Production
- **Symptoms:** Production release deployed, but 80% of returning users still see the old broken version.
- **Root Cause:** Service Worker cached `index.html` with `CacheFirst` strategy. Browser never checks network for updated asset hashes.
- **Fix:** Service worker must use `NetworkFirst` or `StaleWhileRevalidate` for `index.html`, and Nginx must send `Cache-Control: no-cache`.

---

## 🔬 PROD-006: INP Degradation (>800ms) Caused by Synchronous Filter on Main Thread

- **Severity:** 🟡 Medium
- **Environment:** Production (Mobile Devices)
- **Symptoms:** Google Search Console flags mobile INP at 850ms (Poor). Typing in search bar feels visibly laggy.
- **Root Cause:** Every keystroke synchronously filters 20,000 JSON items on the main JavaScript thread, blocking paint.
- **Fix:** Wrap filter update in `React.useTransition` or debounce search input.

---

## 🔬 PROD-007: Web Vitals Telemetry Lost on Page Unload

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Web Vitals dashboard under-reports metrics on desktop browsers by 60%.
- **Root Cause:** Metrics were sent via standard `axios.post` inside `beforeunload`. The browser cancelled pending HTTP requests when the tab closed.
- **Fix:** Use `navigator.sendBeacon(url, data)` which is guaranteed to complete asynchronously in the background.

---

## 🔬 PROD-008: React Error Boundary Swallowing Errors Without Telemetry

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Users see fallback "Something went wrong" screen, but zero errors appear in Sentry dashboard.
- **Root Cause:** Custom `ErrorBoundary` implemented `getDerivedStateFromError` but left `componentDidCatch` empty without calling `Sentry.captureException()`.
- **Fix:** Add `Sentry.captureException(error, { extra: errorInfo })` inside `componentDidCatch`.
