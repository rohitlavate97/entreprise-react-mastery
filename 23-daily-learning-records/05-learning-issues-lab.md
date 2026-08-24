# Module 23.5 — Learning & Habit Engineering Issues Lab (LEARN-001 to LEARN-008)

This lab explores common cognitive traps, knowledge gaps, and deliberate practice failure modes encountered during full-stack skill acquisition.

---

## 🔬 LEARN-001: Passive Reading Illusion Failing in Live Coding Interview

- **Severity:** 🔴 High (Interview Assessment Failure)
- **Symptom:** Candidate understands TanStack Query conceptually but fails to implement optimistic mutation rollback under interview time pressure.
- **Root Cause:** Passive reading without active recall or hands-on break-and-fix coding practice.
- **Fix:** Complete daily Break-and-Fix drills in a blank sandbox with a 15-minute timer.

---

## 🔬 LEARN-002: Knowledge Decay on Spring Security CORS Filter Order

- **Severity:** 🟡 Medium
- **Symptom:** Engineer spends 3 hours debugging CORS 403 error they resolved two months prior.
- **Root Cause:** Failure to review flashcards or journal entries via spaced repetition.
- **Fix:** Review the 30-card Spaced Repetition deck weekly using active recall.

---

## 🔬 LEARN-003: Syntax Memorization vs First-Principles Mental Model in React Fiber

- **Severity:** 🟡 Medium
- **Symptom:** Engineer knows `useEffect` syntax but cannot explain why an effect fires twice in React 18 Strict Mode.
- **Root Cause:** Rote memorization without understanding the Fiber reconciliation engine.
- **Fix:** Study Fiber two-phase render architecture (`04-react-internals/01-fiber-architecture-and-two-phase-render.md`).

---

## 🔬 LEARN-004: Inability to Isolate Heap Memory Leak Without Playbook

- **Severity:** 🔴 High
- **Symptom:** Engineer takes random heap snapshots in Chrome DevTools without knowing which constructors or retainers to inspect.
- **Root Cause:** Lack of a standardized debugging procedure.
- **Fix:** Follow [`PB-014: Production Incident Response & Memory Triage`](../playbooks/14-production-incident-response-and-memory-triage.md).

---

## 🔬 LEARN-005: Skipping Regression Tests Leading to Reintroduced Bugs

- **Severity:** 🔴 High
- **Symptom:** Previously fixed infinite render loop returns in next sprint's PR.
- **Root Cause:** Bug was fixed in code without writing a Vitest unit test asserting render count.
- **Fix:** Mandate regression tests for every resolved issue in CI pipeline.

---

## 🔬 LEARN-006: Over-Reliance on AI Code Generation Without Runtime Understanding

- **Severity:** 🔴 Critical
- **Symptom:** AI-generated code introduces a subtle race condition in silent token refresh logic.
- **Root Cause:** Accepting generated code without line-by-line verification against concurrency principles.
- **Fix:** Apply Senior Code Review Rubric (`22-code-review-mode/01-senior-code-review-rubric.md`) to all AI-generated code.

---

## 🔬 LEARN-007: Skipping Network Latency Throttling in Local Testing

- **Severity:** 🟡 Medium
- **Symptom:** App works smoothly on localhost (0ms latency) but breaks with async race conditions over 3G mobile networks.
- **Root Cause:** Developing without DevTools Network Throttling enabled.
- **Fix:** Test all async state transitions under "Fast 3G" or "Slow 3G" network throttling profiles.

---

## 🔬 LEARN-008: Ignoring DevTools Profiler Committing Render Thrashing

- **Severity:** 🟡 Medium
- **Symptom:** Large transaction table lags on production devices; engineer assumed React would automatically optimize rendering.
- **Root Cause:** Never running React DevTools Profiler during feature development.
- **Fix:** Record render flamegraph before submitting every Pull Request.
