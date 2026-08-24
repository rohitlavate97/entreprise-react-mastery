# Module 21.1 — Master Debugging Handbook & 3-Minute Rapid Triage Protocol

## 1. THE 3-MINUTE RAPID TRIAGE PROTOCOL
When an urgent issue or production outage is reported, follow this 3-step decision tree to identify the root layer within 180 seconds:

```
                          3-MINUTE TRIAGE DECISION TREE
                          
  [ Step 1: Open Chrome DevTools Console & Network Tab ]
            │
            ├── A. Is there a Red Uncaught JavaScript Error?
            │      ├── "Invalid hook call / Hooks can only be called inside..." ──> PB-006 / PB-013
            │      ├── "Cannot read properties of undefined (reading 'map')" ───> PB-003 / PB-011
            │      └── "Maximum update depth exceeded" ─────────────────────────> PB-006 (Infinite Loop)
            │
            ├── B. Is there a Red Network Request (HTTP 4xx / 5xx / CORS)?
            │      ├── "CORS policy: No 'Access-Control-Allow-Origin' header" ───> PB-001 / PB-012
            │      ├── "403 Forbidden: Invalid CSRF Token" ─────────────────────> PB-012 / PB-017
            │      ├── "404 Not Found" on page refresh ─────────────────────────> PB-019 (Nginx try_files)
            │      └── "409 Conflict" ──────────────────────────────────────────> PB-012 / PB-020 (Optimistic Lock)
            │
            └── C. Is the UI Frozen / Lagging / High CPU?
                   ├── CPU > 80%, Framerate < 20fps ───────────────────────────> PB-015 (Virtualization)
                   ├── RAM continuously climbing over 500MB ────────────────────> PB-014 (Heap Leak)
                   └── WebSocket storm flooding state updates ──────────────────> PB-020 (RAF Buffering)
```

---

## 2. SYMPTOMS-TO-PLAYBOOK MASTER LOOKUP TABLE

| Observed Production Symptom | Target Playbook | Direct Link |
| :--- | :--- | :--- |
| CORS Preflight 403 / Missing Origin Headers | **PB-001 / PB-012** | [`playbooks/01-browser-event-loop-and-network-triage.md`](../playbooks/01-browser-event-loop-and-network-triage.md) |
| Stale Closures & Race Conditions in Async Handlers | **PB-002** | [`playbooks/02-javascript-runtime-and-async-triage.md`](../playbooks/02-javascript-runtime-and-async-triage.md) |
| Infinite Re-Render Loops in `useEffect` | **PB-006** | [`playbooks/06-react-hooks-and-lifecycle-triage.md`](../playbooks/06-react-hooks-and-lifecycle-triage.md) |
| Context Provider Re-Rendering Entire App Tree | **PB-007 / PB-010** | [`playbooks/10-state-management-and-tanstack-query-triage.md`](../playbooks/10-state-management-and-tanstack-query-triage.md) |
| Java 64-bit Long ID Truncation in JSON | **PB-012** | [`playbooks/12-fullstack-spring-boot-react-triage.md`](../playbooks/12-fullstack-spring-boot-react-triage.md) |
| Sentry Production Stack Traces Obfuscated/Minified | **PB-014** | [`playbooks/14-production-incident-response-and-memory-triage.md`](../playbooks/14-production-incident-response-and-memory-triage.md) |
| Browser Heap Memory Leak Crashing Active Tabs | **PB-014** | [`playbooks/14-production-incident-response-and-memory-triage.md`](../playbooks/14-production-incident-response-and-memory-triage.md) |
| Un-Virtualized 50,000-Row Table Freezing UI | **PB-015** | [`playbooks/15-frontend-performance-and-virtualization-triage.md`](../playbooks/15-frontend-performance-and-virtualization-triage.md) |
| Async `act(...)` Warnings in Vitest Suite | **PB-016** | [`playbooks/16-test-automation-and-msw-triage.md`](../playbooks/16-test-automation-and-msw-triage.md) |
| Stored XSS Injection via Markdown Component | **PB-017** | [`playbooks/17-frontend-security-and-csp-triage.md`](../playbooks/17-frontend-security-and-csp-triage.md) |
| Nginx SPA Deep Route 404 on Browser Refresh | **PB-019** | [`playbooks/19-deployment-and-nginx-triage.md`](../playbooks/19-deployment-and-nginx-triage.md) |
| Multi-Tenant Query Cache Leaking Tenant Invoices | **PB-020** | [`playbooks/20-enterprise-project-architecture-triage.md`](../playbooks/20-enterprise-project-architecture-triage.md) |
