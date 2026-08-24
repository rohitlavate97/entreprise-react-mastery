# Module 14.1 — React DevTools Profiler, Flamegraphs & Render Diagnosis

## 1. WHAT
- **React DevTools Profiler:** A browser extension tool that records component render timings, commit frequencies, and prop/hook dependency diffs during user interactions.
- **Flamegraph View:** A hierarchical chart visualizing the component tree where bar width represents time spent rendering and bar color (gray vs yellow/orange) indicates whether the component rendered and how long it took.
- **Ranked View:** A sorted list ordering components strictly by individual render duration, pinpointing the single slowest component in the render tree.

```
                    REACT DEVTOOLS PROFILER WORKFLOW
                    
  1. Open DevTools -> Profiler tab.
  2. Click "Gear Icon" (Settings) -> Enable "Record why each component rendered while profiling".
  3. Click "Record" -> Perform user action (e.g. type in search box or click table row) -> Click "Stop".
  4. Inspect Ranked Chart:
     ┌──────────────────────────────────────────────────────────┐
     │ SlowDataTable (42.8ms)  [Props changed: data]            │  <-- PRIMARY BOTTLENECK
     ├──────────────────────────────────────────────────────────┤
     │ ChartSummary (12.1ms)   [Parent component re-rendered]   │
     ├──────────────────────────────────────────────────────────┤
     │ AppHeader (0.1ms)       [Did not render - Memoized]      │
     └──────────────────────────────────────────────────────────┘
```

---

## 2. HOW TO READ PROFILER "WHY DID THIS RENDER?"

When clicking on a component in the Profiler:
1. **`Hook 1 changed`:** State or custom hook internal value updated.
2. **`Props changed: [onClick]`:** An inline callback function was passed without `useCallback` to a `React.memo` child.
3. **`Parent component rendered`:** Child was NOT wrapped in `React.memo`, so it re-rendered automatically when parent state changed.
4. **`Context changed`:** A Context provider value updated and force-rendered the consumer.

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What is the difference between "Render Duration" (time spent in JavaScript component function) and "Commit Duration" (time spent applying mutations to the DOM)?*
2. *Why is the Ranked View in React DevTools Profiler superior to the Flamegraph when hunting for computational bottlenecks?*
3. *Why does enabling "Record why each component rendered" add overhead to profiling measurements?*
