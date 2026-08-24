# Playbook PB-015 — Frontend Performance & Virtualization Triage

## Objective
Provide an operational triage workflow for diagnosing slow UI rendering, un-virtualized DOM bloat, bundle size regressions, and poor Core Web Vitals (LCP, INP, CLS).

---

## 1. Un-Virtualized DOM & Render Freeze Triage

```
[ Step 1: Count Real DOM Nodes ]
  - In browser console: document.querySelectorAll('*').length
  - If count > 2,000 nodes -> DOM tree is bloated.
             │
[ Step 2: Implement Table Virtualization ]
  - Replace standard .map() with @tanstack/react-virtual.
  - Set fixed container height: h-[600px] overflow-auto.
  - Use transform: translateY(virtualRow.start px) for rows.
             │
[ Step 3: Verify DOM Node Count Post-Fix ]
  - Total DOM nodes should drop to < 200 nodes regardless of 100k items.
```

---

## 2. INP (Input Lag) Triage Workflow

```
[ Step 1: Record Interaction in Performance Panel ]
  - Open DevTools -> Performance tab -> Click Record.
  - Type 5 characters into search input -> Click Stop.
  - Inspect "Main" thread for red "Long Tasks" (> 50ms).
             │
[ Step 2: Identify Heavy Computation ]
  - Bottom-Up tab -> Filter by "Self Time".
  - Is time spent in JSON.parse, array filter, or regex?
             │
[ Step 3: Apply Concurrency & Yielding ]
  - Wrap state update in startTransition(() => setResults(...)).
  - Break loops using yieldToMain() chunking.
```

---

## 3. Bundle Bloat & Code Splitting Triage

```
[ Step 1: Inspect Rollup Visualizer Treemap ]
  - Open dist/stats.html in browser.
  - Identify third-party dependencies > 100KB (e.g. lodash, moment, un-shaken icons).
             │
[ Step 2: Apply Subpath Imports & Manual Chunking ]
  - Replace lodash with lodash-es; replace moment with date-fns.
  - Add manualChunks in vite.config.ts for heavy vendor packages.
```
