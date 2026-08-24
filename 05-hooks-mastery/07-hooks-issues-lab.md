# Module 5.7 — Hooks Issues Lab (HOOKS-001 to HOOKS-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for React Hooks.

---

## 🔬 HOOKS-001: Stale Closure in `useEffect` Accessing State Without Dependency

- **Severity:** 🔴 High
- **Environment:** Local / Production
- **Symptoms:** WebSocket event handler or interval logs outdated user state after user changes profile.
- **Root Cause:** Empty dependency array `[]` locks the closure to Mount render variables.
- **Fix:** Add missing dependency or use `useRef` latest-value synchronization pattern.

---

## 🔬 HOOKS-002: Infinite Loop from Inline Object/Array Dependency in `useEffect`

- **Severity:** 🔴 Critical
- **Environment:** Local / Production
- **Symptoms:** Maximum update depth exceeded error in console; tab freezes.
- **Reproduction Code:**
  ```tsx
  useEffect(() => {
    fetchOrders(filterOptions);
  }, [{ status: 'OPEN' }]); // Inline object is a new reference EVERY render!
  ```
- **Fix:** Move object inside the effect or pass primitive dependencies: `[status]`.

---

## 🔬 HOOKS-003: Context Value Re-render Cascade Freezing Large Subtree

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Heavy lag when typing in an input inside a shared layout. React DevTools Profiler shows 200 components re-rendering on every keystroke.
- **Root Cause:** Context Provider passes an inline unmemoized value: `<AuthContext.Provider value={{ user, theme, login }}>`. Every parent render generates a new object pointer, forcing all consumers to re-render.
- **Fix:** Memoize provider value with `useMemo` and apply Context Splitting.

---

## 🔬 HOOKS-004: `useMemo` Returning Mutated Array Reference

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Calling `list.sort()` inside `useMemo` mutates the original prop, breaking `React.memo` child caching.
- **Fix:** Clone array before sorting: `[...list].sort()`.

---

## 🔬 HOOKS-005: Memory Leak from Uncleaned Interval/Listener in `useEffect`

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Sentry logs errors from unmounted components; Chrome Memory heap snapshot shows detached Fiber trees.
- **Fix:** Always return explicit cleanup: `return () => clearInterval(id);`.

---

## 🔬 HOOKS-006: `useRef.current` Accessed During Render Phase Returning `null`

- **Severity:** 🟡 Medium
- **Environment:** Local Dev
- **Symptoms:** `TypeError: Cannot read properties of null (reading 'getBoundingClientRect')`.
- **Root Cause:** DOM refs are not attached until the Commit phase finishes. Reading `ref.current` during render is reading `null`.
- **Fix:** Read DOM refs inside `useEffect` or `useLayoutEffect`.

---

## 🔬 HOOKS-007: Missing Lazy Initializer in `useState` Running Expensive Parsing on Every Render

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Sluggish UI during typing because `JSON.parse(5MB_string)` runs synchronously on every keystroke.
- **Fix:** Pass initializer function: `useState(() => JSON.parse(str))`.

---

## 🔬 HOOKS-008: Reducer Impurity Causing Non-Deterministic State Transitions

- **Severity:** 🔴 High
- **Environment:** Local Development / Strict Mode
- **Symptoms:** In Strict Mode, cart balance jumps unexpectedly by $2\times$ because reducer called `state.total += action.amount` (mutating state).
- **Fix:** Write pure reducers that return brand new state objects.
