# Module 20.4 — Production Incident Laboratory Issues (INCIDENT-001 to INCIDENT-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for enterprise incident response.

---

## 🔬 INCIDENT-001: Stored XSS Payload in User Biography Executing on Profile Views

- **Severity:** 🔴 P0 (Active Breach)
- **Root Cause:** User biography markdown was rendered via `dangerouslySetInnerHTML` without HTML sanitization.
- **Fix:** Pipe through `DOMPurify.sanitize(bio)` and deploy WAF rules blocking script tags.

---

## 🔬 INCIDENT-002: Double-Billing Charge Loop During Database Connection Pool Exhaustion

- **Severity:** 🔴 P0 (Financial Impact)
- **Root Cause:** Network timeout caused Axios retry interceptor to retry POST request without `Idempotency-Key`.
- **Fix:** Enforce `Idempotency-Key` headers and disable automatic retries for non-idempotent HTTP methods.

---

## 🔬 INCIDENT-003: Nginx SPA 404 Outage Breaking All Marketing Campaign Deep Links

- **Severity:** 🔴 P1 (Revenue Loss)
- **Root Cause:** Missing `try_files $uri $uri/ /index.html;` in Nginx configuration.
- **Fix:** Add `try_files` fallback and test page refresh across all deep routes in Playwright E2E suite.

---

## 🔬 INCIDENT-004: WebSocket Render Thrashing Causing Browser Tab Crash

- **Severity:** 🔴 P1 (Platform Instability)
- **Root Cause:** Calling `setState` synchronously 1,000 times per second on raw WebSocket tick events.
- **Fix:** Buffer ticks in mutable ref and flush once per frame via `requestAnimationFrame`.

---

## 🔬 INCIDENT-005: Multi-Tenant Cache Key Collision Leaking Sensitive Invoices

- **Severity:** 🔴 P0 (Data Privacy Breach)
- **Root Cause:** Query keys used generic `['invoices']` without scoping by `organizationId`.
- **Fix:** Scope all keys by tenant ID (`['workspace', orgId, 'invoices']`) and call `queryClient.clear()` on org switch.

---

## 🔬 INCIDENT-006: Stale Service Worker Cache Blocking Production Hotfix for 72h

- **Severity:** 🔴 P1 (Deployment Blocked)
- **Root Cause:** Service Worker cached `index.html` with `CacheFirst` strategy and Nginx sent 1-year cache headers.
- **Fix:** Unregister corrupted Service Worker via emergency script and set `Cache-Control: no-cache` on `index.html`.

---

## 🔬 INCIDENT-007: Unbuffered Client Logging Flood DDoSing Observability Backend

- **Severity:** 🔴 P1 (Infrastructure Degradation)
- **Root Cause:** Logger dispatched individual HTTP POST requests on every user mouse move and scroll event.
- **Fix:** Buffer logs in memory and ship in 10-second batches of 20 items.

---

## 🔬 INCIDENT-008: Long ID Truncation Corrupting Financial Ledger Transaction Records

- **Severity:** 🔴 P1 (Data Corruption)
- **Root Cause:** 64-bit Java `Long` primary keys exceeded JavaScript `MAX_SAFE_INTEGER` and lost numeric precision in `JSON.parse()`.
- **Fix:** Serialize all Long primary keys as Strings in Spring Boot using `@JsonSerialize(using = ToStringSerializer.class)`.
