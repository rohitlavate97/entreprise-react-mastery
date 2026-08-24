# Debugging Playbooks Index

Senior Engineer debugging workflows, mental models, and step-by-step triage playbooks.

| Playbook ID | Topic | Environment | Focus | Status |
|---|---|---|---|---|
| **PB-001** | Browser DevTools & Network Layer Triage | Client / Proxy | Evidence-Driven Root-Cause Analysis (Network, Console, Performance) | Published |
| **PB-002** | Asynchronous Race Conditions & Stale Closure Triage | React / Runtime | Cancellation tokens, AbortSignal, and snapshot closure resolution | Published |
| **PB-003** | TypeScript Compilation vs Runtime API Validation Triage | Full-Stack Boundary | Zod schemas, type guards, DTO contract drift mitigation | Published |
| **PB-004** | React Component Identity & Key Reconciliation Triage | Component / Tree | Focus loss, index key state corruption, and remount thrashing | Published |
| **PB-005** | React Fiber Rendering & Hydration Mismatch Triage | Fiber / SSR | Infinite re-render loops, hydration diffs, and transition starvation | Published |
| **PB-006** | React Hooks & Memory Leak Triage | Hooks / Lifecycle | Stale closures, dependency loops, and detached DOM heap leaks | Published |
| **PB-007** | Enterprise Component Architecture & Boundary Refactoring Triage | Architecture / Design | God component decomposition, feature boundary enforcement, state colocation audit | Published |
| **PB-008** | SPA Routing & Navigation Triage | Routing / Navigation | SPA 404 on refresh, auth redirect loops, URL state desync, stale loader data | Published |
| **PB-009** | Form Submission & Validation Triage | Forms / Submission | Double submission dedup, validation layer defense, wizard state persistence | Published |
| **PB-010** | State Management & Cache Desynchronization Triage | State / Cache | Infinite query loops, optimistic rollback failures, split-brain state, multi-tenant cache leaks | Published |
| **PB-011** | API Client, Auth Interceptor & Network Resilience Triage | API / Resilience | Token refresh race conditions, infinite 401 loops, CORS preflight errors, DTO drift | Published |
| **PB-012** | Full-Stack React + Spring Boot Integration Triage | Spring / React | CORS preflight ordering, Long ID truncation, CSRF tokens, JPA optimistic concurrency 409 | Published |
| **PB-013** | Local Development Environment & Vite Proxy Triage | Vite / DevServer | HMR websocket failures, duplicate React instances, Vite dev proxy, WSL2 polling | Published |
| **PB-014** | Production Incident Response, Source Maps & Memory Heap Triage | Observability / Memory | Sentry source maps de-minification, 3-snapshot heap analysis, stale SW purging | Published |
| **PB-015** | Frontend Performance & Virtualization Triage | Performance / Profiling | React Profiler flamegraphs, @tanstack/react-virtual, INP long tasks, Rollup visualizer | Published |
| **PB-016** | Test Automation, Async Act Warnings & MSW Triage | Testing / Automation | Async act(...) warnings, MSW handler precedence, Playwright trace viewer debugging | Published |
| **PB-017** | Frontend Security Incident, XSS Sanitization & CSP Violation Triage | Security / XSS | Stored XSS containment, DOMPurify configuration, CSP directive blocks, CSRF token triage | Published |
| **PB-018** | Distributed Tracing & Observability Pipeline Triage | Observability / Tracing | W3C traceparent headers, Sentry session replay PII masking, client log storm batching | Published |
| **PB-019** | Container Deployment, Nginx Routing & CI/CD Pipeline Triage | Deployment / Nginx | Nginx try_files 404, two-tier cache headers, Docker non-root permissions, runtime env vars | Published |
| **PB-020** | Full-Stack Project Architecture & Monorepo Scaling Triage | Architecture / Scaling | Multi-tenant cache purges, RAF WebSocket tick throttling, optimistic concurrency rollback | Published |
