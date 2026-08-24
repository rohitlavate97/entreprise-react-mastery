# Module 24.1 — Architecture Decision Records (ADR) Framework & Lifecycle

## 1. WHAT
- **Architecture Decision Record (ADR):** A lightweight, version-controlled markdown document that captures a significant architectural decision, the context in which it was made, the alternatives evaluated, and the resulting positive and negative consequences.
- **The Core Value:** Eliminates the *"Why on earth was this built this way?"* tribal knowledge dilemma when engineering teams scale.

```
                          THE ADR LIFECYCLE STATE MACHINE
                          
         [ PROPOSED ] ──(Team Review & Consensus)──> [ ACCEPTED ]
              │                                            │
              │ (Rejected)                                 │ (New Technology / Shift)
              ▼                                            ▼
         [ REJECTED ]                                [ SUPERSEDED ] (Points to new ADR)
```

---

## 2. STANDARD ENTERPRISE ADR STRUCTURE

```markdown
# ADR-00X: [Short Decision Title]

## Status
- **Status:** [PROPOSED | ACCEPTED | SUPERSEDED by ADR-00Y | REJECTED]
- **Date:** YYYY-MM-DD
- **Authors:** [Lead Architect / Senior Engineers]
- **Deciders:** [Architecture Review Board / Staff Council]

---

## Context & Problem Statement
*What problem are we trying to solve? What are the architectural constraints, business drivers, and technical limitations?*

---

## Decision Drivers
1. **Developer Velocity:** Reduce boilerplate.
2. **Performance:** Sub-100ms response times and memory stability.
3. **Security:** Zero XSS/CSRF token leakage vectors.

---

## Considered Options
- **Option A:** [e.g. Redux Toolkit]
- **Option B:** [e.g. TanStack Query + Zustand]
- **Option C:** [e.g. Apollo GraphQL]

---

## Decision Outcome
*Chosen Option:* **Option B: TanStack Query v5 + Zustand**

### Positive Consequences
- Separates server cache from client UI state cleanly.
- Eliminates 80% of async thunk/reducer boilerplate.
- Built-in request deduplication, cache invalidation, and garbage collection.

### Negative Consequences / Trade-offs
- Team must learn Query Key Factory conventions.
- Requires strict adherence to `staleTime` vs `gcTime` configurations.

---

## Compliance & Enforcement
- Enforced via ESLint rules banning raw `useEffect` data fetching and requiring Query Key Factories.
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why should ADRs be stored alongside code in Git rather than in external wikis like Confluence?*
2. *When does an architectural change warrant a formal ADR vs a standard Pull Request description?*
3. *What is the procedure for updating an ADR when a decision is reversed (SUPERSEDED lifecycle)?*
