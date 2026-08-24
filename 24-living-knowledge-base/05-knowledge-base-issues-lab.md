# Module 24.5 — Knowledge Base & Architecture Governance Issues Lab (KNOW-001 to KNOW-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for enterprise architecture governance.

---

## 🔬 KNOW-001: ADR Drift Secretly Reintroducing Forbidden State Library

- **Severity:** 🔴 High (Architectural Degradation)
- **Symptom:** A newly merged squad PR installs Redux Toolkit, directly violating ADR-001.
- **Root Cause:** CI pipeline lacked ESLint `no-restricted-imports` lint rule enforcing ADR compliance.
- **Fix:** Add automated ESLint rule blocking unauthorized packages with links to corresponding ADRs.

---

## 🔬 KNOW-002: Missing Deprecation Notice Breaking Downstream Squad Builds

- **Severity:** 🔴 High (CI/CD Pipeline Failure)
- **Symptom:** Core library team deletes `formatDate` utility; 12 micro-frontends fail build simultaneously.
- **Root Cause:** Deleting shared utility without formal `@deprecated` notice and 90-day sunset cycle.
- **Fix:** Enforce 3-Phase Deprecation Standard and automated AST scan for remaining usages before removal.

---

## 🔬 KNOW-003: RFC Approved Without Security Sign-Off Introducing XSS Leak

- **Severity:** 🔴 Critical (Security Breach)
- **Symptom:** New rich-text comment RFC deployed to production creates stored XSS vulnerability.
- **Root Cause:** RFC review process lacked mandatory security team checklist approval.
- **Fix:** Add mandatory Security & Compliance gate in RFC approval workflow.

---

## 🔬 KNOW-004: Outdated API Contract in Docs Confusing New Engineers

- **Severity:** 🟡 Medium (Developer Friction)
- **Symptom:** New hire spends 2 days building UI against obsolete `/api/v1/users` schema documented on wiki.
- **Root Cause:** Manual documentation was never updated when backend upgraded to `/api/v2`.
- **Fix:** Generate TypeScript interfaces and OpenAPI docs automatically from Spring Boot code at build time.

---

## 🔬 KNOW-005: Circular Dependency Introduced by Violating FSD Boundaries

- **Severity:** 🔴 High (Vite Bundling Failure)
- **Symptom:** Vite dev server crashes with `Circular dependency detected between features/auth and entities/user`.
- **Root Cause:** Lower-level entity imported high-level feature component, violating FSD hierarchy.
- **Fix:** Enforce `import/order` ESLint rules prohibiting upward imports in FSD architecture.

---

## 🔬 KNOW-006: Untracked Breaking Change Between Spring DTO and TS Interface

- **Severity:** 🔴 High (Runtime Crash)
- **Symptom:** Production frontend crashes with `undefined` error because Spring Boot renamed `userId` to `accountId`.
- **Root Cause:** Manual TypeScript interfaces drifted from Java DTO classes.
- **Fix:** Use automated OpenAPI generator to build TypeScript types directly from Spring controllers in CI.

---

## 🔬 KNOW-007: Orphaned ADR Marked ACCEPTED but Never Implemented

- **Severity:** 🟡 Medium (Technical Debt)
- **Symptom:** ADR-015 recommends adopting Web Workers, but zero lines of code exist in repository after 6 months.
- **Root Cause:** ADR was accepted without assigning an epic owner or tracking Jira roadmap ticket.
- **Fix:** Mandate that all ACCEPTED ADRs link to an active Jira Epic with target milestone.

---

## 🔬 KNOW-008: Team Debates Settled Decision in PR Review

- **Severity:** 🟡 Medium (Productivity Loss)
- **Symptom:** Engineers waste 45 comments arguing about CSS-in-JS vs Tailwind CSS in a routine PR.
- **Root Cause:** Team was unaware that Tailwind was established as the platform standard in ADR-005.
- **Fix:** Provide link to ADR-005 in PR template and close bikeshedding discussions immediately.
