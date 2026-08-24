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
