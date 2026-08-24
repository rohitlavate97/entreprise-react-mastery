# Playbook PB-007 — Enterprise Component Architecture & Boundary Refactoring Triage

## Objective
Provide an operational triage workflow for diagnosing architectural problems in enterprise React codebases: God Components, broken feature boundaries, misplaced state, and missing resilience boundaries.

---

## 1. God Component Detection & Decomposition Workflow

```
[ Step 1: Identify God Component Signals ]
  - File exceeds 300 lines?
  - More than 5 useState/useReducer calls?
  - More than 3 useEffect calls?
  - Data fetching AND rendering AND validation in same file?
             │
[ Step 2: Map Responsibilities ]
  - List every distinct responsibility (data fetch, form logic, UI render, error handling).
  - Draw dependency arrows between them.
             │
[ Step 3: Extract in Safe Order ]
  1. Extract TypeScript interfaces to .types.ts file.
  2. Extract data-fetching logic into custom hooks (useXxxData, useXxxMutation).
  3. Extract pure presentational JSX into separate components.
  4. Create thin Container that wires hooks to presentational components.
  5. Verify: Each extracted file has a single, testable responsibility.
```

---

## 2. Feature Boundary Violation Detection

```
[ Step 1: Run import analysis ]
  - Use 'madge --circular src/' to detect circular dependencies.
  - Use ESLint 'import/no-restricted-paths' to flag cross-feature internal imports.
             │
[ Step 2: Audit barrel exports ]
  - Every features/xxx/index.ts should export ONLY public API.
  - Internal helpers, validators, and styles should NOT appear in index.ts.
             │
[ Step 3: Fix violations ]
  - Move shared types to shared/types/ if used by 3+ features.
  - Add explicit ESLint rules per-feature boundary.
```

---

## 3. State Placement Audit

```
[ Step 1: For each useState/useContext, ask: ]
  - Does this state need to survive page navigation? → URL State.
  - Is this data fetched from an API? → Server-State cache (TanStack Query).
  - Is it used by only this component? → Keep local.
  - Is it used by 2 siblings? → Lift to parent.
  - Is it used by 10+ distant components? → Context or Client-State store.
             │
[ Step 2: Check for over-lifting ]
  - Is state at the page level that is only used by one child? → Colocate down.
  - Does typing in an input re-render the entire page? → State is too high.
```

---

## 4. Error Boundary Audit

```
[ Step 1: Check boundary coverage ]
  - Does a global Error Boundary exist at the App root?
  - Do independent page sections have their own Error Boundaries?
  - Can a single widget crash take down the entire app?
             │
[ Step 2: Verify recovery mechanism ]
  - Does the Error Boundary fallback include a "Try Again" / reset button?
  - Does componentDidCatch report to external monitoring (Sentry, Datadog)?
```
