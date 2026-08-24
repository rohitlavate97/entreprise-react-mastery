# Module 4.6 — Fiber Internals Issues Lab (FIBER-001 to FIBER-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for React Fiber and internal engine mechanics.

---

## 🔬 FIBER-001: Render-Phase Infinite Loop (`Too many re-renders`)

- **Severity:** 🔴 Critical
- **Environment:** Local / Production
- **Symptoms:** White screen crash: `Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.`
- **Reproduction Code:**
  ```tsx
  export function InfiniteLoop() {
    const [count, setCount] = useState(0);
    // BUG: Direct setState during render phase!
    setCount(count + 1);
    return <div>{count}</div>;
  }
  ```
- **Root Cause:** Calling `setState` directly inside the component render body schedules an immediate new render. React re-executes the function, calling `setState` again. React's work loop hits its safety ceiling (50 re-renders) and throws an error to prevent freezing the browser thread.
- **Fix:** Move state updates inside `useEffect` or event handlers:
  ```tsx
  useEffect(() => { setCount(c => c + 1); }, []);
  ```

---

## 🔬 FIBER-002: Hydration Mismatch (`Text content did not match`)

- **Severity:** 🔴 High
- **Environment:** Production SSR / Next.js / Spring Boot SSR
- **Symptoms:** Console error: `Hydration failed because the initial UI does not match what was rendered on the server.`
- **Root Cause:** Accessing client-only state (e.g. `window.localStorage` or `new Date()`) during render time before hydration completes.
- **Fix:** Implement the Two-Pass `useMounted` guard pattern (detailed in Module 4.5).

---

## 🔬 FIBER-003: `useLayoutEffect` Blocking Paint Causing Visual Freeze

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** High INP (>800ms). Clicking a tab freezes the screen for nearly a second before updating.
- **Root Cause:** Executing heavy data transformations or synchronous network loops inside `useLayoutEffect`. Because `useLayoutEffect` runs synchronously before the browser paint step, the entire browser compositor is locked.
- **Fix:** Move heavy computations to `useEffect` or offload to a Web Worker.

---

## 🔬 FIBER-004: Memory Leak on Detached Fiber Node

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Chrome DevTools Memory tab reveals growing detached DOM trees and un-garbage-collected Fiber nodes after navigating between routes.
- **Root Cause:** Global event listeners or third-party singleton libraries (like charting or mapping engines) holding persistent references to unmounted DOM nodes or closures.
- **Fix:** Provide comprehensive teardown methods in `useEffect` cleanup.

---

## 🔬 FIBER-005: Concurrent Transition Starvation

- **Severity:** 🟡 Medium
- **Environment:** High-Volume Data Grids
- **Symptoms:** Wrapping an intensive synchronous loop ($O(N^2)$ array search across 100,000 items) inside `startTransition` still causes frame drops.
- **Root Cause:** `startTransition` marks an update as low priority, but it **does not make synchronous JavaScript asynchronous or multi-threaded**. A heavy synchronous computation inside the component function will still block the single thread while that component renders.
- **Fix:** Break work into chunks with `scheduler.yield()` or Web Workers.

---

## 🔬 FIBER-006: Double-Render Side-Effect Bug Caught by React Strict Mode

- **Severity:** 🔴 High
- **Environment:** Local Development
- **Symptoms:** In local dev, an order is submitted twice or an analytics pageview event is logged twice on mount.
- **Root Cause:** Side effects placed in the render body or `useEffect` missing an abort/cleanup contract. Strict Mode intentionally runs effects twice to surface missing teardowns.
- **Fix:** Implement clean idempotency or cancellation tokens in effect cleanups.

---

## 🔬 FIBER-007: Unhandled Error in Render Phase Crashing Entire Fiber Tree

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** A null pointer exception in a tiny user avatar component crashes the entire page into a blank white screen.
- **Root Cause:** React Fiber unmounts the entire root Fiber tree when an unhandled error occurs during the render phase unless caught by an **Error Boundary**.
- **Fix:** Wrap application feature boundaries in class-based Error Boundaries:
  ```tsx
  export class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error, errorInfo: any) {
      logErrorToTelemetry(error, errorInfo);
    }
    render() {
      return this.state.hasError ? <FallbackUI /> : this.props.children;
    }
  }
  ```

---

## 🔬 FIBER-008: Suspense Waterfall Stalling Initial Data Display

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Multi-level nested components load sequentially one after another (waterfall spinners), causing high cumulative layout shift and slow TTI.
- **Root Cause:** Nesting independent Suspense boundaries inside child components without parallel prefetching.
- **Fix:** Lift data fetching to parallel route loaders or use TanStack Query parallel queries.
