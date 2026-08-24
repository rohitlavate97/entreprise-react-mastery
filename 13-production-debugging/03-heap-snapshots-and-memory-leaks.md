# Module 13.3 — Chrome DevTools Heap Snapshots & Memory Leak Diagnostics

## 1. WHAT
- **Memory Leak in React:** Memory allocated by the JavaScript engine that is no longer needed by any active component but cannot be reclaimed by the Garbage Collector (GC) because an active reference (closure, event listener, interval, or global map) retains it.
- **Detached DOM Tree:** A DOM element that has been removed from the visible document by React reconciliation, but remains retained in memory because a JavaScript variable or event handler still holds a reference to it.

```
                    DETACHED DOM NODE MEMORY LEAK
                    
  Document (Active DOM Tree)
  └── <div id="root">
        └── <Dashboard /> (Active)
        
  Garbage Collector Heap (Detached Tree Retained by Closure):
  └── ❌ Detached HTMLDivElement (<Modal />)
        └── Event Listener Closure ──> window.addEventListener('resize', handler)
            (Holds entire 50MB Modal subtree in memory because handler wasn't removed!)
```

---

## 2. THE THREE-SNAPSHOT TRIAGE TECHNIQUE

1. **Snapshot 1 (Baseline):** Open DevTools $\rightarrow$ Memory tab $\rightarrow$ Take Heap Snapshot 1.
2. **Perform Action & Reset:** Open a modal or navigate to a feature page 5 times, then close/navigate away to return to baseline state.
3. **Snapshot 2 (Check):** Force Garbage Collection (trash can icon in DevTools) $\rightarrow$ Take Heap Snapshot 2.
4. **Compare:** In the Memory view dropdown, switch from **Summary** to **Comparison** against Snapshot 1.
5. **Filter by Delta:** Filter by `Detached` or `FiberNode`. If the `Delta` column is positive ($> 0$), you have a verified memory leak!

---

## 3. COMMON PRODUCTION LEAK PATTERNS & FIXES

```typescript
// ❌ LEAK: Global array accumulates objects indefinitely
const eventLog: any[] = [];
export function useTrackEvent(event: any) {
  eventLog.push(event); // Memory grows indefinitely on long user sessions!
}

// ❌ LEAK: Uncleaned setInterval
useEffect(() => {
  const id = setInterval(pollServer, 5000);
  // Missing return () => clearInterval(id);
}, []);

// ✅ FIX: Clean up all subscriptions on unmount
useEffect(() => {
  const id = setInterval(pollServer, 5000);
  return () => clearInterval(id);
}, []);
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *How does the "Three-Snapshot Technique" isolate persistent memory leaks from temporary GC allocations?*
2. *What is a "Detached HTMLElement" in Chrome DevTools and what usually retains it in memory?*
3. *Why do uncleaned closures in `useEffect` prevent the entire parent Fiber tree from being garbage collected?*
