# Playbook PB-026 — Staff Engineer Technical Assessment & Live Interview Command SOP

## Objective
Provide an operational execution checklist for mastering Staff and Principal level live coding, frontend system design, and architectural leadership interview loops.

---

## 1. Frontend System Design Execution Matrix

```
[ Step 1: Scope & Scale Confirmation (0–5m) ]
  - Ask: Daily active users? Peak ticks/sec? Offline requirements?
  - Establish API latency budget (<100ms) and Core Web Vitals targets.
             │
[ Step 2: Component & State Architecture (5–20m) ]
  - Draw data flow: React 19 -> TanStack Query -> Axios Interceptor -> Spring Boot.
  - Articulate state separation: Server state vs Client UI state.
             │
[ Step 3: Deep Dives on Complex Bottlenecks (20–40m) ]
  - Detail DOM virtualization (@tanstack/react-virtual).
  - Detail optimistic UI mutation snapshots & rollback on 409 conflict.
  - Detail security: DOMPurify sanitization & strict CSP nonces.
             │
[ Step 4: Observability & Resilience (40–45m) ]
  - Add W3C traceparent distributed tracing and Sentry replay privacy masking.
```

---

## 2. Live Coding Execution Checklist

- [ ] Clarify edge cases (empty list, network timeout, rapid typing) before writing JSX.
- [ ] Define TypeScript types and discriminated union states upfront.
- [ ] Implement working MVP within 20 minutes.
- [ ] Verbalize architectural decisions and trade-offs continuously.
- [ ] Add `AbortController` cancellation to eliminate async race conditions.
- [ ] Return cleanup functions from all `useEffect` listeners.
