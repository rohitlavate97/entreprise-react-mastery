# Playbook PB-006 — React Hooks & Memory Leak Production Triage

## Objective
Provide an operational triage workflow for diagnosing stale closures, infinite effect loops, and memory leaks in React hook-based architectures.

---

## 1. Stale Closure & Infinite Loop Triage Workflow

```
[ Step 1: Detect Infinite Loop or Stale Read ]
  - Check console: "Maximum update depth exceeded" OR state fails to update.
             │
[ Step 2: Audit useEffect Dependency Array ]
  - Is an inline object/array passed as a dependency?
  - Is an inline callback passed as a dependency without useCallback?
  - Does the effect call setState on a variable that is listed in its deps?
             │
[ Step 3: Audit Memory Leaks (Chrome Memory Profiler) ]
  - Take Heap Snapshot 1 -> Perform 10 interactions / unmounts -> Take Heap Snapshot 2.
  - Filter by "Detached HTMLElement" or "FiberNode".
  - Look for uncleaned event listeners, intervals, or WebSocket subscriptions.
             │
[ Step 4: Implement Defensive Cleanup & Functional Updaters ]
  - Replace setState(count + 1) with setState(c => c + 1).
  - Add explicit return cleanup function to all subscriptions.
```
