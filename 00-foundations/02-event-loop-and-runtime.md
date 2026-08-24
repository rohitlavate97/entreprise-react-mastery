# Module 0.2 — JavaScript Runtime, Event Loop & React Batching

## 1. WHAT
The **JavaScript Runtime Environment** in a browser is the single-threaded execution context composed of:
1. **Call Stack:** Executes synchronous stack frames in a Last-In, First-Out (LIFO) sequence.
2. **Memory Heap:** Allocates memory for objects, arrays, closures, and variables.
3. **Web APIs:** Browser-provided background threads handling I/O, timers, network requests, and DOM events (outside the JS engine thread).
4. **Microtask Queue:** High-priority FIFO queue for Promise callbacks (`.then`, `.catch`, `await`), `queueMicrotask`, and `MutationObserver`.
5. **Macrotask Queue (Task Queue):** Standard FIFO queue for `setTimeout`, `setInterval`, I/O, UI event callbacks, and `MessageChannel`.
6. **The Event Loop:** An infinite, non-blocking coordination loop that continuously monitors the Call Stack and queues.

$$\text{Call Stack Empty?} \xrightarrow{\text{YES}} \text{Flush ALL Microtasks (until empty)} \xrightarrow{} \text{Render/Paint (if VSync frame ready)} \xrightarrow{} \text{Pick ONE Macrotask} \xrightarrow{} \text{Repeat}$$

```
┌─────────────────────────────────────────────────────────────┐
│                       CALL STACK                            │
│  [fn3()] -> [fn2()] -> [fn1()] -> [Global Execution Context] │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Stack Empty)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MICROTASK QUEUE                         │
│  [Promise.then] -> [queueMicrotask] -> [MutationObserver]   │
│  * FLUSHED ENTIRELY BEFORE YIELDING TO RENDER OR MACROTASKS │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Microtasks Empty)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BROWSER RENDER OPPORTUNITY                  │
│       [Style Recalc] -> [Layout] -> [Paint] -> [Composite]   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MACROTASK QUEUE                         │
│       [setTimeout] -> [setInterval] -> [I/O Events]         │
│       * EXACTLY ONE MACROTASK PROCESSED PER TICK            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. WHY
Why understanding the Event Loop is critical for React engineers:
1. **React State Batching:** React relies directly on the Event Loop and microtask/macrotask boundaries to batch multiple `setState` calls into a single atomic render pass.
2. **Diagnostic Precision:** Prevents confusion when evaluating asynchronous code execution order, Promise resolution, and async event handlers.
3. **Main-Thread Starvation:** Microtasks that continuously spawn new microtasks create an infinite loop that **never yields** to the browser layout engine or macrotask queue, completely freezing the UI tab.

---

## 3. INTERNAL MENTAL MODEL

### Microtask vs Macrotask Resolution Order
1. Synchronous code on the Call Stack executes to completion.
2. When the Call Stack clears, the engine checks the **Microtask Queue**.
3. **The engine drains the entire Microtask Queue completely.** If a microtask enqueues another microtask, that new microtask runs in the *same* cycle before any rendering or macrotask.
4. The browser assesses if a screen refresh (VSync, ~16.6ms at 60Hz) is needed and performs Style/Layout/Paint if appropriate.
5. The Event Loop dequeues and executes **exactly ONE Macrotask** from the Task Queue.
6. The cycle repeats.

---

## 4. EXECUTION FLOW SCENARIO

Consider this classic execution order test:

```javascript
console.log('1: Sync script start');

setTimeout(() => {
  console.log('2: Macrotask (setTimeout)');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('3: Microtask 1 (Promise)');
    return Promise.resolve();
  })
  .then(() => {
    console.log('4: Microtask 2 (Chained Promise)');
  });

queueMicrotask(() => {
  console.log('5: Microtask 3 (queueMicrotask)');
});

console.log('6: Sync script end');
```

### Execution Trace:
1. `1: Sync script start` is logged synchronously.
2. `setTimeout` schedules callback `2` in the **Macrotask Queue** via Web APIs.
3. `Promise.resolve().then(...)` schedules callback `3` in the **Microtask Queue**.
4. `queueMicrotask(...)` schedules callback `5` in the **Microtask Queue**.
5. `6: Sync script end` is logged synchronously.
6. **Call Stack is now empty.** The Event Loop flushes the **Microtask Queue**:
   - Executes `3: Microtask 1`, which returns a resolved promise scheduling `4` at the end of the Microtask Queue.
   - Executes `5: Microtask 3`.
   - Executes `4: Microtask 2`.
7. Microtask Queue is now empty.
8. Event Loop checks rendering, then takes **one macrotask**:
   - Executes `2: Macrotask (setTimeout)`.

**Final Output:** `1` $\rightarrow$ `6` $\rightarrow$ `3` $\rightarrow$ `5` $\rightarrow$ `4` $\rightarrow$ `2`.

---

## 5. MODERN IMPLEMENTATION: REACT 18+ AUTOMATIC BATCHING

### How React Leverages the Event Loop
In React 17 and earlier, React only batched state updates inside synthetic React event handlers (like `onClick`). Updates inside native `setTimeout`, `Promise.then`, or `fetch` callbacks resulted in multiple sequential renders.

In **React 18 and React 19**, **Automatic Batching** is enabled by default via `createRoot`. All state updates—regardless of whether they originate in click handlers, timeouts, promises, or async/await functions—are queued together and batched into a single render pass scheduled as a microtask.

```tsx
import React, { useState } from 'react';
import { flushSync } from 'react-dom';

export function BatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);

  console.log(`[Component Rendered] Count: ${count}, Flag: ${flag}`);

  const handleAsyncUpdate = async () => {
    // Simulated async network call
    await fetch('/api/user');

    // In React 18+, these TWO state updates trigger only ONE re-render
    setCount((c) => c + 1);
    setFlag((f) => !f);
  };

  const handleForcedSync = () => {
    // flushSync forces React to immediately flush state updates to the DOM synchronously
    // USE SPARINGLY: Only when measuring DOM immediately after a state change (e.g. tooltip placement)
    flushSync(() => {
      setCount((c) => c + 1);
    });
    // DOM is updated right here synchronously!
    flushSync(() => {
      setFlag((f) => !f);
    });
  };

  return (
    <div className="p-4 space-y-4">
      <p>Count: {count} | Flag: {String(flag)}</p>
      <button onClick={handleAsyncUpdate} className="btn-primary">
        Trigger Async Batched Update (1 Render)
      </button>
      <button onClick={handleForcedSync} className="btn-secondary">
        Trigger Forced Sync Updates (2 Renders)
      </button>
    </div>
  );
}
```

---

## 6. LEGACY / ENTERPRISE REALITY
- In older React 16/17 enterprise applications, developers used `unstable_batchedUpdates` from `react-dom` manually wrap async state changes:
  ```javascript
  // Legacy React 16/17 workaround
  fetchData().then((data) => {
    ReactDOM.unstable_batchedUpdates(() => {
      setUser(data.user);
      setIsLoading(false);
    });
  });
  ```
- Failure to batch caused visible layout glitches (e.g., `isLoading: false` rendering before `user` data populated, causing an immediate null pointer exception in the UI).

---

## 7. PRACTICAL ENTERPRISE SCENARIO
**Scenario:** A real-time banking transaction monitor receives high-frequency updates over a WebSocket connection.
- If the WebSocket message listener directly calls `setTransactions(prev => [...prev, newTx])` on every socket frame, hundreds of microtasks/renders will fire per second, stalling the browser event loop.
- **Enterprise Solution:** Buffer incoming WebSocket payloads in a mutable `useRef` array and flush to React state using a throttled `requestAnimationFrame` or interval batcher, aligning state synchronization with the browser's 60Hz rendering pipeline.

---

## 8. COMMON MISTAKES
1. **Starving the Event Loop with Recursive Microtasks:**
   ```javascript
   // CRITICAL BUG: Freezes tab completely. Browser will never paint.
   function starve() {
     Promise.resolve().then(starve);
   }
   ```
2. **Expecting `setState` to be synchronous:**
   Reading state on the line immediately following `setState` reads the snapshot value from the current render, not the queued value.
3. **Overusing `flushSync`:**
   Wrapping state updates in `flushSync` degrades performance and breaks React 18 concurrent features.

---

## 9. LOCAL ISSUES
- **Symptom:** UI locks up, CPU fan spins, browser displays "Page Unresponsive" dialog.
- **Root Cause:** A recursive `useEffect` dependency loop causing infinite synchronous state updates or a dense microtask loop.

---

## 10. CI/CD ISSUES
- **Symptom:** Automated unit tests (Jest/Vitest) timeout after 5000ms.
- **Root Cause:** An un-awaited Promise or un-cleared timer inside a custom hook leaves pending tasks in the event loop queue, preventing the test runner process from cleanly exiting.

---

## 11. PRODUCTION ISSUES
- **Symptom:** High INP (Interaction to Next Paint) scores in production telemetry (> 500ms).
- **Root Cause:** Long-running synchronous JavaScript computations (e.g., sorting 50,000 JSON records on the main thread) blocking the Call Stack and delaying UI interaction processing.

---

## 12. SPRING BOOT INTERACTION
- When React fetches data from a Spring Boot REST API (`GET /api/v1/orders`), the browser network thread handles the TCP/TLS exchange in the background.
- When Spring Boot sends the HTTP response chunks, the browser receives them, deserializes the JSON stream, and enqueues the Promise `.then()` callback as a **Microtask** in JavaScript runtime.

---

## 13. DEBUGGING PROCESS (Senior Engineer Workflow)
1. Open **Chrome DevTools** -> **Sources** tab.
2. In the right-hand panel, inspect **Call Stack** and **Scope**.
3. Use **Async Stack Traces** (enabled by default) to trace asynchronous Promise chains back to their originating user interaction.
4. In the **Performance** tab, look for **Long Tasks** (red flags indicating tasks taking > 50ms).
5. Identify whether the bottleneck is synchronous Call Stack execution or heavy microtask queue processing.

---

## 14. ROOT CAUSE ANALYSIS
- **Symptom:** User clicks a button, but the UI takes 300ms to show the loading spinner.
- **Why?** The click handler performs heavy JSON parsing and state filtering synchronously before scheduling the loading state.
- **Root Cause:** Synchronous execution on the main thread blocked the browser from rendering the spinner.
- **Fix:** Offload heavy data processing to a **Web Worker** or chunk the task using `scheduler.yield()` / `setTimeout`.

---

## 15. FIX & MODERN ASYNC PATTERNS
```typescript
// Offloading heavy work from the main event loop
export async function yieldToMain() {
  if ('scheduler' in window && 'yield' in (window as any).scheduler) {
    return await (window as any).scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function processLargeDataset(items: any[]) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    results.push(heavyTransform(items[i]));
    // Every 500 items, yield control to the Event Loop to allow UI rendering & user input
    if (i % 500 === 0) {
      await yieldToMain();
    }
  }
  return results;
}
```

---

## 16. PREVENTION
- Enforce Web Worker offloading for CPU-intensive data transformations.
- Ensure all asynchronous side effects in React use cleanup functions to abort pending fetch requests or clear timeouts.

---

## 17. MONITORING
Track Long Tasks via the `PerformanceObserver` API:
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long Task detected on main thread:', entry.duration, 'ms');
    }
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

---

## 18. PERFORMANCE METRICS
- **Long Task:** Any JavaScript execution exceeding **50ms**.
- **Target Frame Time:** Max **16.6ms** total execution per frame to maintain smooth 60fps interaction.

---

## 19. SECURITY CONSIDERATIONS
- **Event Loop Denial of Service (ReDoS):** Running vulnerable regular expressions on unsanitized user inputs on the main thread can cause catastrophic backtracking, freezing the event loop indefinitely.
- **Mitigation:** Use safe regex patterns or execute user-supplied regex validations inside an isolated Web Worker with strict execution timeouts.

---

## 20. TESTING STRATEGY
- Test asynchronous React hook execution using `waitFor` and fake timers (`vi.useFakeTimers()` / `jest.useFakeTimers()`):
  ```typescript
  test('advances timer and updates state', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebounce('test', 500));
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('test');
    vi.useRealTimers();
  });
  ```

---

## 21. EXERCISES
1. Predict the console output of a multi-stage Promise chain with nested `setTimeout` and `queueMicrotask` calls. Verify your prediction in the browser console.
2. Implement a React component that demonstrates the difference in render count between React 18 automatic batching and `flushSync`.

---

## 22. BREAK-AND-FIX LAB
- **Bug:** Introduce a component with an uncleaned `setInterval` that triggers `setState` after component unmount.
- **Symptoms:** Memory leak warning in development; stale closures updating detached fiber nodes.
- **Fix:** Return a cleanup function `() => clearInterval(timerId)` from `useEffect`.

---

## 23. EXPERT INTERVIEW QUESTIONS
1. *What is the exact distinction between the Microtask Queue and the Macrotask Queue regarding queue draining and rendering opportunities?*
2. *How does React 18 Automatic Batching work under the hood, and how does `flushSync` bypass this mechanism?*
3. *Why can an unhandled microtask recursion completely freeze the browser tab while an infinite `setTimeout` loop does not?*
