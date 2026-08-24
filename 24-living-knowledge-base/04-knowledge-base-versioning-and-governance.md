# Module 24.4 — Documentation Governance, ADR Drift & Deprecation Lifecycles

## 1. WHAT
- **Documentation Drift:** The inevitable divergence between written architecture documents and the live production codebase as features evolve over sprints.
- **Living Knowledge Base Governance:** Automated tools and CI/CD policies that enforce architectural decisions directly in code, ensuring docs reflect reality.

---

## 2. PREVENTING ADR DRIFT VIA AUTOMATED CI POLICIES

```typescript
// .eslintrc.cjs (Enforcing ADR-001 in CI)
module.exports = {
  rules: {
    // Prevent developers from bypassing ADR-001 (Forbids Redux / raw useEffect fetching)
    'no-restricted-imports': ['error', {
      paths: [{
        name: '@reduxjs/toolkit',
        message: 'Redux is forbidden per ADR-001. Use TanStack Query for server state and Zustand for UI state.'
      }]
    }]
  }
};
```

---

## 3. DEPRECATION LIFECYCLE PROTOCOL

When deprecating legacy components or utility functions, follow the **3-Phase Deprecation Standard**:

```typescript
/**
 * Calculates tax on checkout.
 * @deprecated Deprecated since v2.4.0 in favor of `useTaxEngine()` per ADR-012.
 * Will be removed in v3.0.0 (Scheduled: 2026-11-01).
 */
export function calculateLegacyTax(amount: number): number { ... }
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *How do you prevent documentation from becoming stale and misleading in fast-moving engineering teams?*
2. *Why is linking ESLint errors directly to version-controlled ADR markdown files effective for onboarding?*
3. *What is a "Sunset Timeline" for deprecated APIs and how do you monitor remaining callers before deleting code?*
