# Module 21.4 — Playbook Triage Scenarios Lab (PLAYBOOK-001 to PLAYBOOK-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for playbook-guided rapid triage.

---

## 🔬 PLAYBOOK-001: Triaging Infinite Loop in Custom Hook

- **Severity:** 🔴 High
- **Symptoms:** Tab hits 100% CPU and freezes; console logs `Maximum update depth exceeded`.
- **Target Playbook:** [`PB-006: React Hooks & Lifecycle Triage`](../playbooks/06-react-hooks-and-lifecycle-triage.md)
- **Triage Action:** Inspect `useEffect` dependency array for un-memoized object or function literal (`options={{ filter: 'active' }}`). Wrap in `useMemo` or primitive dependencies.

---

## 🔬 PLAYBOOK-002: Diagnosing Broken CORS Preflight Across Spring Filter Chain

- **Severity:** 🔴 High
- **Symptoms:** Axios OPTIONS request returns `403 Forbidden` before entering Spring controller.
- **Target Playbook:** [`PB-012: Full-Stack Spring Boot + React Triage`](../playbooks/12-fullstack-spring-boot-react-triage.md)
- **Triage Action:** Ensure `CorsFilter` bean has `@Order(Ordered.HIGHEST_PRECEDENCE)` so preflight OPTIONS requests bypass security filter auth checks.

---

## 🔬 PLAYBOOK-003: Isolating Detached DOM Tree Memory Leak

- **Severity:** 🔴 High
- **Symptoms:** Chrome tab RAM climbs from 80MB to 1.4GB over 30 minutes of user activity.
- **Target Playbook:** [`PB-014: Production Incident Response & Memory Triage`](../playbooks/14-production-incident-response-and-memory-triage.md)
- **Triage Action:** Execute 3-snapshot heap analysis, search for `Detached HTMLDivElement`, trace retainer to uncleared `window.addEventListener('resize', ...)` callback.

---

## 🔬 PLAYBOOK-004: Resolving MSW v2 Handler Wildcard Conflict

- **Severity:** 🟡 Medium
- **Symptoms:** Vitest integration test returns wrong mock response or fails with unhandled request error.
- **Target Playbook:** [`PB-016: Test Automation & MSW Triage`](../playbooks/16-test-automation-and-msw-triage.md)
- **Triage Action:** Order MSW handlers from most specific (`/api/orders/991`) to least specific (`/api/orders/:id`, `/api/*`).

---

## 🔬 PLAYBOOK-005: Debugging CSP Directive Blocking Stripe Payment Iframe

- **Severity:** 🔴 Critical
- **Symptoms:** Stripe checkout iframe fails to load; console logs `Refused to frame 'https://js.stripe.com' because it violates CSP directive: "frame-src 'self'"`.
- **Target Playbook:** [`PB-017: Frontend Security & CSP Triage`](../playbooks/17-frontend-security-and-csp-triage.md)
- **Triage Action:** Add `https://js.stripe.com` to `frame-src` and `script-src` in Nginx CSP security headers.

---

## 🔬 PLAYBOOK-006: Triaging SPA 404 Error on Kubernetes Ingress Controller

- **Severity:** 🔴 High
- **Symptoms:** Refreshing deep route on production cluster returns Nginx default 404 page.
- **Target Playbook:** [`PB-019: Container Deployment & Nginx Triage`](../playbooks/19-deployment-and-nginx-triage.md)
- **Triage Action:** Verify `try_files $uri $uri/ /index.html;` in container `nginx.conf` and ensure Ingress rewrite-target is properly configured.

---

## 🔬 PLAYBOOK-007: Diagnosing Silent Data Loss from 64-bit Long ID Truncation

- **Severity:** 🔴 Critical
- **Symptoms:** Order #9007199254740995 is updated as Order #9007199254740992 in Postgres database.
- **Target Playbook:** [`PB-012: Full-Stack Spring Boot + React Triage`](../playbooks/12-fullstack-spring-boot-react-triage.md)
- **Triage Action:** Add `@JsonSerialize(using = ToStringSerializer.class)` to Java Long fields; parse as string in TypeScript.

---

## 🔬 PLAYBOOK-008: Triaging Multi-Tenant Cache Leak Following Org Switch

- **Severity:** 🔴 Critical
- **Symptoms:** User switches from Organization A to Organization B; dashboard shows Organization A's cached metrics for 10 seconds.
- **Target Playbook:** [`PB-020: Project Architecture & Scaling Triage`](../playbooks/20-enterprise-project-architecture-triage.md)
- **Triage Action:** Enforce `orgId` as prefix in query key factory and call `queryClient.clear()` in organization switcher component.
