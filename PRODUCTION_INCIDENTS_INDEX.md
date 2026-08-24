# Production Incidents Index

Catalog of realistic production outages, edge-case regressions, and postmortems.

| Incident ID | Title | Severity | Impact Area | Playbook / Lab Link | Status |
|---|---|---|---|---|---|
| **INC-001** | Outdated Client Assets & Infinite White Screen Post-Deployment | 🔴 P1 | CDN / Caching / Nginx | [`00-foundations/05-browser-issues-lab.md`](./00-foundations/05-browser-issues-lab.md) | Resolved |
| **INC-002** | Gateway 403 on Preflight OPTIONS in Multi-Origin Spring Setup | 🔴 P1 | Spring Security / CORS | [`00-foundations/05-browser-issues-lab.md`](./00-foundations/05-browser-issues-lab.md) | Resolved |
| **INC-003** | Autocomplete Race Condition Corrupts Customer Order Payload | 🔴 P1 | Async / Client State | [`01-javascript-deep-dive/06-javascript-issues-lab.md`](./01-javascript-deep-dive/06-javascript-issues-lab.md) | Resolved |
| **INC-004** | Circular Barrel Import Crashes Production UI with Undefined Component | 🔴 P2 | Modules / Bundling | [`01-javascript-deep-dive/06-javascript-issues-lab.md`](./01-javascript-deep-dive/06-javascript-issues-lab.md) | Resolved |
| **INC-005** | Spring Boot DTO Drift Triggers Frontend Null Pointer Outage | 🔴 P1 | TypeScript / API Boundary | [`02-typescript-production/05-typescript-issues-lab.md`](./02-typescript-production/05-typescript-issues-lab.md) | Resolved |
| **INC-006** | Context Empty-Cast (`{} as Type`) Crashes Unauthenticated Route | 🔴 P2 | TypeScript / Context | [`02-typescript-production/05-typescript-issues-lab.md`](./02-typescript-production/05-typescript-issues-lab.md) | Resolved |
| **INC-007** | Index Key Sorting Corrupts Invoice Line Items and Quantities | 🔴 P1 | React / Reconciliation | [`03-react-fundamentals/06-react-fundamentals-issues-lab.md`](./03-react-fundamentals/06-react-fundamentals-issues-lab.md) | Resolved |
| **INC-008** | Dynamic Key Randomization Freezes Form Entry & Destroys Keystrokes | 🔴 P2 | React / Keys | [`03-react-fundamentals/06-react-fundamentals-issues-lab.md`](./03-react-fundamentals/06-react-fundamentals-issues-lab.md) | Resolved |
| **INC-009** | Render-Phase Infinite Loop Freezes Production Checkout | 🔴 P1 | React / Fiber WorkLoop | [`04-react-internals/06-fiber-internals-issues-lab.md`](./04-react-internals/06-fiber-internals-issues-lab.md) | Resolved |
| **INC-010** | SSR Hydration Mismatch Breaks Auth Status Header & Flashes UI | 🔴 P2 | SSR / Hydration | [`04-react-internals/06-fiber-internals-issues-lab.md`](./04-react-internals/06-fiber-internals-issues-lab.md) | Resolved |
| **INC-011** | Context Re-render Cascade Freezes Large Enterprise Data Entry Grid | 🔴 P1 | Hooks / Context | [`05-hooks-mastery/07-hooks-issues-lab.md`](./05-hooks-mastery/07-hooks-issues-lab.md) | Resolved |
| **INC-012** | Uncleaned WebSocket Subscription in Custom Hook Exhausts Client RAM | 🔴 P2 | Hooks / Memory | [`05-hooks-mastery/07-hooks-issues-lab.md`](./05-hooks-mastery/07-hooks-issues-lab.md) | Resolved |
| **INC-013** | Missing Error Boundary White-Screens Entire Enterprise Dashboard on Chart Widget Crash | 🔴 P1 | Architecture / Resilience | [`06-component-architecture/06-architecture-issues-lab.md`](./06-component-architecture/06-architecture-issues-lab.md) | Resolved |
| **INC-014** | God Component Checkout Page Untestable, Causing Regression on Every Sprint Release | 🔴 P2 | Architecture / Design | [`06-component-architecture/06-architecture-issues-lab.md`](./06-component-architecture/06-architecture-issues-lab.md) | Resolved |
| **INC-015** | SPA 404 on Direct URL Navigation After Nginx Deployment — All Deep Links Broken | 🔴 P1 | Routing / Nginx | [`07-routing/06-routing-issues-lab.md`](./07-routing/06-routing-issues-lab.md) | Resolved |
| **INC-016** | Auth Guard Infinite Redirect Loop Freezing Browser After Session Expiry | 🔴 P1 | Routing / Auth | [`07-routing/06-routing-issues-lab.md`](./07-routing/06-routing-issues-lab.md) | Resolved |
| **INC-017** | Double Payment Submission Charges Customer Twice — $47K Revenue Impact | 🔴 P1 | Forms / Idempotency | [`08-forms/06-forms-issues-lab.md`](./08-forms/06-forms-issues-lab.md) | Resolved |
| **INC-018** | Dynamic Invoice Line Item Deletion Corrupts Row Data via Index Key | 🔴 P2 | Forms / Dynamic | [`08-forms/06-forms-issues-lab.md`](./08-forms/06-forms-issues-lab.md) | Resolved |
| **INC-019** | Multi-Tenant Cache Leak Shows Customer Data Across Organizations | 🔴 P1 | State / Multi-Tenant | [`09-state-management/06-state-issues-lab.md`](./09-state-management/06-state-issues-lab.md) | Resolved |
| **INC-020** | Infinite Query Refetch Storm Takes Down Spring Boot Backend Service | 🔴 P1 | State / Performance | [`09-state-management/06-state-issues-lab.md`](./09-state-management/06-state-issues-lab.md) | Resolved |
| **INC-021** | Concurrent 401 Storm Triggers Refresh Token Revocation & Mass User Logout | 🔴 P1 | API / Auth | [`10-api-networking/06-api-issues-lab.md`](./10-api-networking/06-api-issues-lab.md) | Resolved |
| **INC-022** | Non-Idempotent POST Retry on 504 Gateway Timeout Double-Bills Customers | 🔴 P1 | API / Retries | [`10-api-networking/06-api-issues-lab.md`](./10-api-networking/06-api-issues-lab.md) | Resolved |
| **INC-023** | CORS Preflight Filter Misconfiguration Blocks All Production Checkout Traffic | 🔴 P1 | Spring / CORS | [`11-react-spring-boot-integration/06-spring-boot-integration-issues-lab.md`](./11-react-spring-boot-integration/06-spring-boot-integration-issues-lab.md) | Resolved |
| **INC-024** | 64-bit Snowflake ID Truncation Corrupts Healthcare Patient Records | 🔴 P1 | Spring / Jackson | [`11-react-spring-boot-integration/06-spring-boot-integration-issues-lab.md`](./11-react-spring-boot-integration/06-spring-boot-integration-issues-lab.md) | Resolved |
| **INC-025** | Unprefixed Environment Variable Injected as Undefined in Production Docker Build | 🔴 P1 | Build / Env | [`12-local-troubleshooting/05-local-issues-lab.md`](./12-local-troubleshooting/05-local-issues-lab.md) | Resolved |
| **INC-026** | Monorepo Duplicate React Instance Crashes Staging Release with Invalid Hook Call | 🔴 P2 | Vite / Modules | [`12-local-troubleshooting/05-local-issues-lab.md`](./12-local-troubleshooting/05-local-issues-lab.md) | Resolved |
| **INC-027** | WebSocket Event Listener Leak Exhausts Client RAM & Crashes Trading Floor | 🔴 P1 | Memory / Leaks | [`13-production-debugging/05-production-issues-lab.md`](./13-production-debugging/05-production-issues-lab.md) | Resolved |
| **INC-028** | Stale Service Worker Caches Broken Bundle & Blocks Production Hotfix | 🔴 P1 | Caching / PWA | [`13-production-debugging/05-production-issues-lab.md`](./13-production-debugging/05-production-issues-lab.md) | Resolved |
