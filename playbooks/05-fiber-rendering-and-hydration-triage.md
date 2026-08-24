# Playbook PB-005 — React Fiber Rendering & Hydration Mismatch Triage

## Objective
Provide an operational triage procedure for diagnosing infinite re-render loops (`Too many re-renders`), server-side hydration mismatches, and render-phase crashes.

---

## 1. Infinite Re-Render Loop Triage

```
[ Step 1: Inspect Call Stack & Component Name ]
  - Look at the console error: "Too many re-renders".
  - Identify the component at the top of the stack.
             │
[ Step 2: Check Component Body for Direct Setters ]
  - Did the component call setState(val) or dispatch() directly in the function body
    outside of useEffect or event callbacks?
             │
[ Step 3: Check useEffect Dependency Cycles ]
  - Does useEffect call setState(x) while having 'x' (or an unstable object dependency)
    in its dependency array?
             │
[ Step 4: Fix with Functional Setter or useMemo ]
  - Wrap derived calculations in useMemo or eliminate the effect entirely.
```

---

## 2. SSR Hydration Mismatch Triage
1. **Identify the mismatch:** DevTools console will display the exact diff between the server HTML and client Virtual DOM.
2. **Check for browser-only globals:** Search for `window`, `document`, `navigator`, or `localStorage` being accessed during component render.
3. **Check for locale/time operations:** Verify that dates are rendered deterministically or deferred using the `useMounted` two-pass guard pattern.
