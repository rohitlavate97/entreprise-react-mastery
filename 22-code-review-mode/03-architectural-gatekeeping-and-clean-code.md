# Module 22.3 — Architectural Gatekeeping & Clean Code Standards

## 1. THE 4 GOLDEN ARCHITECTURAL RULES

```
                    ARCHITECTURAL REVIEW HEURISTICS
                    
  1. State Colocation:
     • Is state lifted unnecessarily high in the component tree?
     • Rule: Colocate state in the lowest common ancestor that actually consumes it.
     
  2. Context Discipline:
     • Does a single Context Provider store both static theme and high-frequency real-time prices?
     • Rule: Split Context into State and Dispatch contexts, or use Zustand with useShallow.
     
  3. Query Key Governance:
     • Are string literals like queryKey: ['users'] hardcoded across 20 files?
     • Rule: Reject PR! Enforce centralized Query Key Factories (userKeys.list()).
     
  4. Module Boundary Protection:
     • Is feature A importing directly from internal implementation details of feature B?
     • Rule: Enforce public API index.ts exports and prevent circular dependencies.
```

---

## 2. PULL REQUEST ARCHITECTURAL FEEDBACK TEMPLATE

```markdown
### ⚠️ Architectural Feedback (Blocking)

**Issue:** This PR lifts the modal `isOpen` state into global `RootZustandStore`.
**Why this is problematic:** Every time the user opens this local modal, 42 unrelated global subscribers re-render.
**Suggested Solution:** Colocate `const [isOpen, setIsOpen] = useState(false)` inside `<ReportModalTrigger />` or create a local compound component.
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *When should a Senior Engineer block a Pull Request on architectural grounds vs when to accept technical debt?*
2. *How do you prevent circular dependency cycles in large React monorepos?*
3. *Why does strict Feature-Sliced Design improve onboarding speed for new engineering hires?*
