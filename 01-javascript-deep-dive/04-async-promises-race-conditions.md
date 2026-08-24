# Module 1.4 — Asynchronous JavaScript, Promises, AbortController & Race Conditions

## 1. WHAT
- **Promise:** An object representing the eventual completion (fulfillment) or failure (rejection) of an asynchronous operation and its resulting value. It exists in one of three mutually exclusive states: `pending`, `fulfilled`, or `rejected`.
- **`async` / `await`:** Ergonomic syntactic sugar over Promises and Generators that allows asynchronous, non-blocking code to be structured and read linearly like synchronous code.
- **Race Condition:** A flaw in asynchronous software execution where the correctness of state depends on the non-deterministic arrival order or timing of uncontrollable external events (e.g. network latency).
- **`AbortController`:** A native Web API interface that allows you to abort one or more DOM HTTP requests, asynchronous tasks, or event listeners on demand via an `AbortSignal`.

```
                    THE AUTOCOMPLETE RACE CONDITION
                    
  User Types: "rea" (Request 1 dispatched) ──────────────────────────┐ (Slow Network: 800ms)
                                                                     │
  User Types: "react" (Request 2 dispatched) ────────┐ (Fast: 200ms) │
                                                     │               │
  t = 200ms: Response 2 arrives ("react" results) ───▼               │
             React State updated to -> ["React Hooks", "React Fiber"]│
                                                                     │
  t = 800ms: Response 1 arrives ("rea" results) ─────────────────────▼
             React State OVERWRITTEN to -> ["Real Estate", "Reach"] (BUG: Stale Data Shown!)
```

---

## 2. WHY
Why async mastery and cancellation is the mark of a Senior React Engineer:
1. **The #1 Data Fetching Bug in Production:** Asynchronous race conditions in search boxes, tabs, filters, and paginated tables corrupt state silently without throwing any errors in the console.
2. **Memory Leaks and Warning Logs:** Setting state on unmounted components after long-running network calls.
3. **Promise Combinator Tradeoffs:** Choosing `Promise.all` (fail-fast: one rejection drops all results) vs `Promise.allSettled` (resilient: gathers all successes and errors).

---

## 3. INTERNAL MENTAL MODEL & CANCELLATION MECHANICS

### How `AbortController` Works Under the Hood
1. `const controller = new AbortController();` allocates a signal object `controller.signal`.
2. The `signal` is passed to the browser `fetch(url, { signal: controller.signal })`.
3. The browser network stack binds a hardware abort hook to the active socket connection.
4. Calling `controller.abort()`:
   - Sets `signal.aborted = true`.
   - Fires the `abort` event on the signal.
   - Immediately closes the underlying TCP socket/connection in the browser.
   - Rejects the in-flight `fetch` Promise with an `AbortError` (`DOMException: The user aborted a request`).

---

## 4. MODERN IMPLEMENTATION: RACE-CONDITION-FREE REACT DATA FETCHING

```tsx
import React, { useState, useEffect } from 'react';

interface SearchResult {
  id: number;
  title: string;
}

export function UserSearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Guard against empty query
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // 2. Instantiate AbortController for THIS specific effect execution
    const controller = new AbortController();
    const { signal } = controller;

    async function executeSearch() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, {
          signal // 3. Pass signal to fetch
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: SearchResult[] = await response.json();
        
        // 4. Update state only if request was not aborted
        setResults(data);
      } catch (err: any) {
        // 5. CRITICAL: Distinguish between intentional abort and real network failure!
        if (err.name === 'AbortError') {
          console.log(`[Search] Query '${query}' was aborted because a newer query started.`);
        } else {
          setError(err.message || 'An unexpected error occurred');
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    // Debounce network dispatch by 300ms
    const debounceTimer = setTimeout(executeSearch, 300);

    // 6. CLEANUP FUNCTION: Aborts pending timer and in-flight HTTP request on re-render/unmount
    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search enterprise records..."
      />
      {isLoading && <div className="spinner">Loading...</div>}
      {error && <div className="error-alert">{error}</div>}
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 5. PROMISE COMBINATORS IN ENTERPRISE SYSTEMS

| Combinator | Behavior | Use Case |
|---|---|---|
| **`Promise.all([p1, p2])`** | Resolves when **ALL** resolve; rejects immediately if **ANY** single promise rejects (Fail-Fast). | Dependent aggregate calls where partial data is unusable (e.g. Loading User Profile + Permissions). |
| **`Promise.allSettled([p1, p2])`** | Resolves when **ALL** finish (regardless of whether they fulfilled or rejected); returns status array. | Independent dashboard widgets where widget 1 can fail without breaking widget 2. |
| **`Promise.race([p1, p2])`** | Settles as soon as the **FIRST** promise settles (fulfills or rejects). | Implementing strict network timeout limits. |
| **`Promise.any([p1, p2])`** | Resolves as soon as the **FIRST** promise fulfills; rejects only if **ALL** reject. | Fetching the same asset from multiple redundant mirror CDNs. |

---

## 6. COMMON MISTAKES
1. **Not checking `err.name === 'AbortError'` in catch blocks:** Displaying "The user aborted a request" error messages to end users on normal fast typing.
2. **Mixing `async`/`await` directly inside `useEffect` callback without an inner function:**
   ```tsx
   // CRITICAL SYNTAX ERROR: useEffect callback must return void or cleanup function, NOT a Promise!
   useEffect(async () => {
     const data = await fetchUsers();
   }, []);
   ```
3. **Using `Promise.all` for independent dashboard widgets:** If 1 optional chart widget throws a 500 error, `Promise.all` fails the entire page.

---

## 7. EXPERT INTERVIEW QUESTIONS
1. *How does an asynchronous race condition occur during fast typing in a search component, and what are two distinct strategies to prevent it?*
2. *Why is passing an `async` function directly to `useEffect` forbidden by React, and how does the cleanup return contract enforce this?*
3. *What is the difference between `Promise.all` and `Promise.allSettled`, and which one should be used when rendering multi-widget enterprise dashboards?*
