# Playbook PB-023 — Enterprise Pull Request Review & Architectural Gatekeeping SOP

## Objective
Provide an operational standard operating procedure for conducting thorough, constructive, and efficient senior code reviews, preventing architectural degradation and security vulnerabilities from merging to `main`.

---

## 1. The Senior Review Gatekeeping Workflow

```
[ Step 1: Automated Checks Pass First ]
  - Verify CI green: TypeScript compiler (tsc), Biome/ESLint, Vitest, and Knip pass.
  - Do not review syntax or formatting if CI fails.
             │
[ Step 2: High-Level Architectural Inspection ]
  - Does this PR solve the stated problem cleanly?
  - Does it introduce new global state or violate State Colocation?
  - Are Query Key Factories used consistently?
             │
[ Step 3: Deep Security & Correctness Audit ]
  - Check for XSS in dangerouslySetInnerHTML (enforce DOMPurify).
  - Check external links for rel="noopener noreferrer".
  - Verify async promise cancellation and useEffect cleanup functions.
             │
[ Step 4: Constructive Review Feedback Delivery ]
  - Prefix comments with: [Blocker], [Suggestion], [Nitpick], or [Praise].
  - Provide actionable code examples for every requested change.
```

---

## 2. Review Prefix Convention

| Prefix | Meaning | Action Required |
| :--- | :--- | :--- |
| **`[Blocker]`** | Critical bug, security hole, or severe architectural violation | PR cannot merge until resolved |
| **`[Suggestion]`** | Better pattern or performance optimization | Author should consider; discussion welcomed |
| **`[Nitpick]`** | Minor naming/cleanliness polish | Author can choose to address or merge as-is |
| **`[Praise]`** | Clean abstraction or elegant test coverage | Positive reinforcement for great engineering |
