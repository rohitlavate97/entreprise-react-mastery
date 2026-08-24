# Module 1.6 — JavaScript Issues Lab (JS-001 to JS-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for JavaScript bugs in React.

---

## 🔬 JS-001: Stale Closure in `useEffect` Timer / Interval

- **Severity:** 🔴 High
- **Environment:** Local / Production
- **Symptoms:** A counter or auto-refresh poll freezes at `1` or repeats the same initial state indefinitely, despite continuous timer ticks.
- **Reproduction Code:**
  ```tsx
  export function BuggyTimer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        // BUG: 'seconds' is permanently captured as 0 in this closure
        setSeconds(seconds + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, []); // Empty dependency array locks the closure to the first render

    return <div>Elapsed: {seconds}s</div>;
  }
  ```
- **Root Cause:** The interval callback closed over the lexical scope of the initial render where `seconds === 0`. On every tick, it calculates `0 + 1 = 1` and calls `setSeconds(1)`. React sees `Object.is(1, 1)` on subsequent ticks and skips rendering.
- **Fix:** Use functional state update form:
  ```tsx
  setSeconds((prev) => prev + 1);
  ```

---

## 🔬 JS-002: Direct State Mutation (`array.push`) with No UI Update

- **Severity:** 🔴 Critical
- **Environment:** Local / Production
- **Symptoms:** User clicks "Add Item", data is pushed into the array, `console.log` shows the new item exists, but the React UI completely fails to re-render.
- **Reproduction Code:**
  ```tsx
  export function BuggyTodoList() {
    const [items, setItems] = useState<string[]>(['Task 1']);

    const addItem = () => {
      // BUG: Mutating state array in place
      items.push(`Task ${items.length + 1}`);
      // Passing the SAME array reference back to setter
      setItems(items);
    };

    return (
      <div>
        <button onClick={addItem}>Add</button>
        <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      </div>
    );
  }
  ```
- **Root Cause:** `items.push()` mutates the existing array in the memory heap without changing its pointer address. React's `Object.is(prevItems, nextItems)` returns `true` (pointer equality) and bails out of re-rendering.
- **Fix:** Allocate a new array reference:
  ```tsx
  setItems((prev) => [...prev, `Task ${prev.length + 1}`]);
  ```

---

## 🔬 JS-003: Shallow Spread Mutating Nested Object Reference

- **Severity:** 🔴 High
- **Environment:** Local / Production
- **Symptoms:** Updating settings for User B inadvertently alters settings for User A or corrupts the default configuration object across the entire session.
- **Reproduction Code:**
  ```tsx
  const DEFAULT_CONFIG = { theme: 'light', security: { 2fa: false } };

  export function UserProfile() {
    const [config, setConfig] = useState(DEFAULT_CONFIG);

    const toggle2FA = () => {
      // BUG: Shallow spread clones top level, but 'security' remains a shared reference!
      const updated = { ...config };
      updated.security.2fa = true; // Mutates DEFAULT_CONFIG in memory!
      setConfig(updated);
    };
  }
  ```
- **Root Cause:** Object spread (`...`) is shallow. `updated.security` points to the exact same nested object address in memory as `DEFAULT_CONFIG.security`.
- **Fix:** Deep clone or copy nested levels explicitly:
  ```tsx
  setConfig((prev) => ({
    ...prev,
    security: { ...prev.security, 2fa: true }
  }));
  ```

---

## 🔬 JS-004: Async Race Condition in Search Autocomplete

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** User searches for "Spring", then quickly changes to "React". Results for "Spring" display on screen because the slower initial request finished last.
- **Root Cause:** Network latency variance causes out-of-order Promise resolution without cancellation or sequence tracking.
- **Fix:** Implement `AbortController` in `useEffect` cleanup (detailed in Module 1.4).

---

## 🔬 JS-005: Unhandled Promise Rejection Crashing Application

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Browser logs `Uncaught (in promise) Error`. Sentry logs error spikes. UI gets stuck permanently on loading spinner.
- **Root Cause:** Missing `.catch()` or `try...catch` around `await` expressions in asynchronous event handlers.
- **Fix:** Standardize on typed `try...catch` blocks with explicit error states.

---

## 🔬 JS-006: Memory Leak via Uncleaned Event Listener Closure

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Application memory grows continuously over time (detached DOM nodes in DevTools Memory tab); CPU usage climbs as duplicate scroll handlers fire.
- **Root Cause:** `window.addEventListener` added inside `useEffect` without a matching `removeEventListener` in the cleanup return function.
- **Fix:** Always return cleanup functions from `useEffect`:
  ```tsx
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  ```

---

## 🔬 JS-007: Circular Dependency Resulting in `undefined` Component Import

- **Severity:** 🔴 Critical
- **Environment:** Staging / Production Bundle
- **Symptoms:** Runtime crash: `React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined.`
- **Root Cause:** Two component modules import each other cyclically through an `index.ts` barrel file before module evaluation completes.
- **Fix:** Eliminate the circular import by extracting shared types/components to a leaf file and importing directly from specific file paths.

---

## 🔬 JS-008: Broken `this` Context in Legacy Callbacks

- **Severity:** 🟡 Medium
- **Environment:** Enterprise Legacy React Codebases
- **Symptoms:** `TypeError: Cannot read properties of undefined (reading 'setState')` when clicking buttons in legacy class components.
- **Root Cause:** Standard JavaScript method definitions passed as callbacks lose their lexical `this` binding when invoked by the DOM event dispatcher.
- **Fix:** Convert to class property arrow functions or bind in constructor:
  ```tsx
  // Legacy Fix
  this.handleClick = this.handleClick.bind(this);
  // Modern Class Property Arrow Function
  handleClick = () => { this.setState({ ... }); };
  ```
