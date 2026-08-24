# Playbook PB-001 — Browser DevTools & Network Layer Production Triage

## Objective
Establish a rigorous, reproducible 6-step triage procedure for investigating frontend runtime failures, CORS blocks, caching regressions, and performance freezes using Chrome/Edge/Firefox DevTools.

---

## The 6-Step Triage Matrix

```
[ Step 1: Console Check ] ──► Runtime errors, unhandled rejections, CSP violations
             │
[ Step 2: Network Waterfall ] ──► HTTP statuses, Preflights (OPTIONS), Headers, Initiators
             │
[ Step 3: Application Storage ] ──► Cookies (Secure/SameSite), localStorage, Quotas
             │
[ Step 4: Performance Profile ] ──► Main thread Long Tasks (>50ms), Forced Reflows
             │
[ Step 5: Memory Heap Snapshot ] ──► Detached DOM trees, closure leaks, unbound arrays
             │
[ Step 6: Formulate Root Cause ] ──► Match against Evidence Log before proposing fix
```

---

## 1. Network Tab Evidence Checklist
When an API request fails, collect these exact data points:
- **Request URL & Method:** (e.g. `POST https://api.enterprise.com/orders`)
- **Status Code:** (e.g. `(failed)`, `403 Forbidden`, `304 Not Modified`)
- **Request Headers:**
  - `Origin:` (e.g. `http://localhost:5173`)
  - `Authorization:` (Check if Bearer token is present or empty)
  - `Cookie:` (Check if session/refresh cookie was attached)
- **Response Headers:**
  - `Access-Control-Allow-Origin:`
  - `Access-Control-Allow-Credentials:`
  - `Cache-Control:`
- **Timing Breakdown:** Check DNS Lookup vs Initial Connection vs SSL vs TTFB (Time to First Byte). High TTFB indicates backend/DB bottleneck; high Connection time indicates network/TLS bottleneck.

---

## 2. Performance Tab Triage Checklist
When UI interaction feels laggy:
1. Enable **Screenshots** and set CPU Throttling to **4x Slowdown**.
2. Record 3 seconds of the offending action.
3. Identify **Long Tasks** (red flags $> 50\text{ms}$).
4. Expand **Call Tree** $\rightarrow$ sort by **Total Time** to pinpoint the exact JS function or layout recalculation consuming the main thread.
