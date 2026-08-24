# Playbook PB-002 — Asynchronous Race Conditions & Stale Closure Production Triage

## Objective
Establish a senior-level triage methodology to identify, reproduce, and eliminate asynchronous race conditions, stale closures, and memory leaks in React client applications.

---

## 1. Asynchronous Race Condition Triage Checklist

```
[ Step 1: Network Tab Waterfall Check ]
  - Filter by Fetch/XHR.
  - Inspect timestamps of outgoing requests vs incoming responses.
  - Did Request #1 complete AFTER Request #2?
             │
[ Step 2: React State Verification ]
  - Open React DevTools Component tree.
  - Inspect current component state: Does it match the payload of the LAST DISPATCHED request,
    or the payload of the LAST RETURNED response?
             │
[ Step 3: Verify Cancellation Mechanism ]
  - Check if fetch() includes AbortSignal.
  - Check if useEffect return statement aborts controller.
             │
[ Step 4: Add Automated Race Simulation Test ]
  - Write test with mocked artificial delay to prove fix.
```

---

## 2. Stale Closure Triage Checklist
When a hook or event handler reads outdated state:
1. **Identify the capture point:** Find where the callback was passed (e.g. inside `useEffect`, `setTimeout`, `useCallback`).
2. **Inspect the dependency array:** Is the variable being read present in the dependency array?
3. **If present, why did it not update?** (e.g. empty dependency array `[]` or omitted prop).
4. **Choose the proper mitigation:**
   - Use functional state updates (`setVal(prev => ...)`) if updating state based on previous state.
   - Use `useRef` latest-value pattern if a stable subscription callback needs current values.
   - Add the missing dependency and ensure all dependent functions are wrapped in `useCallback`.
