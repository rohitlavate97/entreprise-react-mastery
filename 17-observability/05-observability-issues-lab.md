# Module 17.5 — Observability Issues Lab (OBS-001 to OBS-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for full-stack observability.

---

## 🔬 OBS-001: Malformed `traceparent` Header Breaking Distributed Trace Graph

- **Severity:** 🔴 High
- **Environment:** Production (Jaeger / OpenTelemetry)
- **Symptoms:** Distributed trace graph is broken into disconnected single-node fragments; Spring Boot does not link backend DB queries to client user actions.
- **Root Cause:** Client generated uppercase hex chars or invalid version format in `traceparent` string (`00-TRACE-SPAN-01` instead of lowercase 32/16 hex chars).
- **Fix:** Follow strict W3C specification: `00-${traceId.toLowerCase()}-${spanId.toLowerCase()}-01`.

---

## 🔬 OBS-002: Unbuffered Client Logging Spamming Backend with 500 POSTs/sec

- **Severity:** 🔴 Critical (Self-Inflicted DDoS)
- **Environment:** Production
- **Symptoms:** Observability ingestion endpoint crashes under 100,000 requests per minute from normal frontend user traffic.
- **Root Cause:** `logger.info()` sent an individual `fetch('/api/logs')` on every mouse move and scroll event.
- **Fix:** Implement in-memory log queue buffer with 10-second batch flushes.

---

## 🔬 OBS-003: Session Replay Capturing Unmasked Credit Card Inputs

- **Severity:** 🔴 Critical (PCI-DSS Compliance Breach)
- **Environment:** Production (Sentry Replay)
- **Symptoms:** Security audit reveals card numbers visible in session replay video recordings.
- **Root Cause:** Missing `maskAllInputs: true` and missing `.sentry-block` class on payment forms.
- **Fix:** Configure `maskAllInputs: true` globally and add `className="sentry-block"` to all payment components.

---

## 🔬 OBS-004: `navigator.onLine` False-Positive Behind Captive Portal

- **Severity:** 🟡 Medium
- **Environment:** Mobile / Public Wi-Fi
- **Symptoms:** App thinks user is online and continuously fails queries with network errors without showing offline banner.
- **Root Cause:** `navigator.onLine` returns `true` as long as the device is connected to a local router, even if WAN internet is blocked.
- **Fix:** Implement active HTTP `HEAD /api/health/ping` probe on reconnect.

---

## 🔬 OBS-005: Sentry Dropping Events Due to Circular Object References

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Critical UI errors are never recorded in Sentry dashboard.
- **Root Cause:** Error context object contained a DOM Node or React Fiber pointer with circular references, causing `JSON.stringify()` to fail during event serialization.
- **Fix:** Use Sentry's `normalizeDepth: 5` setting or sanitize context objects before passing to `captureException()`.

---

## 🔬 OBS-006: Trace ID Mismatch Between React and Spring Boot

- **Severity:** 🟡 Medium
- **Environment:** Staging / Production
- **Symptoms:** Copying Trace ID from React Sentry report yields zero matching log entries in Spring Boot ELK logs.
- **Root Cause:** Spring Boot generated its own new Trace ID instead of extracting the client-provided `X-Correlation-ID` / `traceparent` header.
- **Fix:** Configure Spring Boot OpenTelemetry filter to extract and reuse incoming W3C `traceparent` context.

---

## 🔬 OBS-007: High-Frequency Heartbeat Draining Mobile Battery

- **Severity:** 🟡 Medium
- **Environment:** Production (Mobile Web)
- **Symptoms:** Users report excessive battery drain and data usage while leaving tab open in background.
- **Root Cause:** Polling heartbeat ran every 1,000ms indefinitely, preventing mobile cellular radios from entering low-power sleep mode.
- **Fix:** Increase heartbeat interval to 60s, and pause heartbeats when document is hidden (`document.visibilityState === 'hidden'`).

---

## 🔬 OBS-008: Recursive Error Loop in Logger Crashing Browser Tab

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** When backend logging endpoint returns 500, the browser tab locks up with 100% CPU usage and crashes.
- **Root Cause:** Logger's catch block called `logger.error("Failed to send logs")`, triggering an infinite recursive error loop.
- **Fix:** Suppress errors inside log shipping routines with `.catch(() => {})` and never log delivery failures recursively.
