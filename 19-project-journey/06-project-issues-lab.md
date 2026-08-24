# Module 19.6 — Enterprise Project Journey Issues Lab (PROJ-001 to PROJ-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes across the 5 Enterprise Projects.

---

## 🔬 PROJ-001: Multi-Tenant Cache Leak Serving Org A Data to Org B (Project 1)

- **Severity:** 🔴 Critical (Security & Data Leak)
- **Environment:** Production (Multi-Tenant SaaS)
- **Symptoms:** User switches from Acme Corp to Beta Inc; dashboard still displays Acme Corp projects for 5 seconds.
- **Root Cause:** Query key factory did not include `orgId` as the root partition: `['projects']` instead of `['workspace', orgId, 'projects']`.
- **Fix:** Prepend `orgId` to all workspace query keys and call `queryClient.clear()` on tenant switch.

---

## 🔬 PROJ-002: Unbuffered WebSocket Ticks Freezing Trading Terminal (Project 2)

- **Severity:** 🔴 Critical
- **Environment:** Production (Trading Dashboard)
- **Symptoms:** During market open volatility (1,000 price ticks/sec), browser CPU hits 100% and UI becomes unresponsive.
- **Root Cause:** Calling `setState` synchronously inside `ws.onmessage` on every raw WebSocket packet.
- **Fix:** Buffer incoming ticks in a mutable ref and flush to React state once per frame via `requestAnimationFrame`.

---

## 🔬 PROJ-003: Double Payment Charge on Checkout Network Timeout (Project 3)

- **Severity:** 🔴 Critical (Financial Impact)
- **Environment:** Production (E-Commerce Storefront)
- **Symptoms:** Customer charged $240 twice when payment gateway timed out and customer clicked "Pay Now" a second time.
- **Root Cause:** Button was re-enabled on network error without generating a new `Idempotency-Key` or checking payment status.
- **Fix:** Enforce stable `Idempotency-Key` per checkout session and verify transaction state in Spring Boot Redis cache before retrying.

---

## 🔬 PROJ-004: Optimistic Kanban Move Desyncing on JPA 409 Conflict (Project 4)

- **Severity:** 🔴 High
- **Environment:** Production (Kanban Board)
- **Symptoms:** User moves card to "DONE"; card snaps back 2 seconds later with an unhandled toast error.
- **Root Cause:** Another user edited the card description simultaneously, incrementing the JPA `@Version`. Backend returned 409 Conflict; frontend had no rollback snapshot handler.
- **Fix:** Implement `onMutate` snapshot capture and rollback in `onError`.

---

## 🔬 PROJ-005: Virtualized Log Console Crashing on Dynamic Row Heights (Project 5)

- **Severity:** 🔴 High
- **Environment:** Production (Observability Platform)
- **Symptoms:** Scrolling through 100,000 log lines causes erratic scroll jumping and blank gaps in the console.
- **Root Cause:** Virtualizer used fixed `estimateSize: 24`, but stack trace log rows expanded to 400px.
- **Fix:** Attach `measureElement` ref to each rendered row to dynamically measure true DOM height.

---

## 🔬 PROJ-006: RBAC Route Guard Flashing Admin UI to Unauthorized Users (Project 1)

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Non-admin user navigates to `/admin`; admin dashboard renders for 200ms before redirecting to `/unauthorized`.
- **Root Cause:** Role check evaluated `isLoading` as false before user profile permissions finished loading.
- **Fix:** Render full-page skeleton `<LoadingScreen />` until auth and role resolution is 100% settled.

---

## 🔬 PROJ-007: Out-of-Order Candlestick Chart Bars from Network Jitter (Project 2)

- **Severity:** 🟡 Medium
- **Environment:** Production (Trading Dashboard)
- **Symptoms:** Financial chart displays glitching, backwards-pointing candle wicks.
- **Root Cause:** WebSocket packets arrived out of order over UDP/TCP retransmits.
- **Fix:** Enforce monotonic sequence ID check and sort incoming ticks by backend timestamp before rendering.

---

## 🔬 PROJ-008: Checkout Wizard Step Data Lost on Back Navigation (Project 3)

- **Severity:** 🟡 Medium
- **Environment:** Production (Checkout Flow)
- **Symptoms:** Customer clicks "Back" to fix shipping address; credit card and billing fields are completely wiped.
- **Root Cause:** Wizard step state was stored in local component state of individual step components instead of parent wizard `useReducer`.
- **Fix:** Hoist all wizard step data into a persistent parent reducer or URL search parameters.
