# Module 1.1 — Scope, Hoisting, Temporal Dead Zone & Closure Mechanics in React

## 1. WHAT
- **Scope:** The context in which variables and expressions are visible and accessible. JavaScript supports **Global Scope**, **Function Scope** (`var`), and **Block Scope** (`let`, `const`).
- **Hoisting:** The JavaScript engine's behavior of registering variable and function declarations into memory during the compilation phase before code execution begins.
- **Temporal Dead Zone (TDZ):** The time window between entering a scope and the actual variable declaration line where `let` and `const` variables exist in memory but cannot be accessed (accessing throws `ReferenceError: Cannot access 'x' before initialization`).
- **Closure:** The combination of a function bundled together with references to its surrounding lexical environment (lexical scope), allowing the function to access outer variables even after the outer function has finished executing.

```
                    LEXICAL SCOPE & RENDER SNAPSHOTS
                    
   Render 1 (Call Stack)                 Render 2 (Call Stack)
  ┌──────────────────────────────┐      ┌──────────────────────────────┐
  │ ComponentScope(count = 0)    │      │ ComponentScope(count = 1)    │
  │                              │      │                              │
  │  onClick Closure captures:   │      │  onClick Closure captures:   │
  │  [count -> 0]                │      │  [count -> 1]                │
  │                              │      │                              │
  │  setTimeout callback has     │      │  New callback has            │
  │  reference to [count -> 0]   │      │  reference to [count -> 1]   │
  └──────────────────────────────┘      └──────────────────────────────┘
```

---

## 2. WHY
Why deep scope and closure mastery is non-negotiable for React engineers:
1. **React Renders are Function Calls:** Every time a React function component renders, it executes anew, creating a completely new local lexical scope.
2. **The Stale Closure Disease:** If an asynchronous callback (such as `setTimeout`, `setInterval`, WebSocket listener, or un-synchronized `useEffect`) captures variables from *Render 1*, it will forever read the values from *Render 1*, even if React has rendered 50 times since.
3. **Variable Shadowing:** Shadowing state variables in outer/inner scopes leads to subtle logic bugs that bypass TypeScript type checking.

---

## 3. INTERNAL MENTAL MODEL

### A. Execution Context Creation
When a JavaScript function is called, the V8/SpiderMonkey engine creates an **Execution Context** with two phases:
1. **Creation Phase:**
   - Registers `function` declarations into memory with full definitions.
   - Registers `var` declarations, initialized to `undefined`.
   - Registers `let` and `const` declarations in the lexical environment uninitialized (entering the TDZ).
2. **Execution Phase:**
   - Executes lines sequentially.
   - Assigns values when declaration lines are reached (leaving the TDZ).

### B. Why `var` Breaks Loops and Closures
```javascript
// PROBLEM: 'i' is function-scoped. A single shared variable 'i' exists in memory.
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 100);
}
// Outputs: 3, 3, 3 (because by 100ms, the single shared 'i' is 3)

// SOLUTION: 'j' is block-scoped. Every loop iteration creates a brand new 'j' in lexical scope.
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 100);
}
// Outputs: 0, 1, 2 (each closure captured its own iteration's 'j')
```

---

## 4. HOW REACT HOOKS INTERACT WITH CLOSURES

Every render of a React component is a separate function execution with its own closed-over snapshot of props and state.

```tsx
import React, { useState, useEffect, useRef } from 'react';

export function StaleClosureDemo() {
  const [count, setCount] = useState(0);

  // BUGGY: Captures count = 0 on mount and NEVER updates its closure
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Stale count inside interval:', count);
      // count is forever 0 in this closure!
      // setCount(count + 1) will repeatedly set 0 + 1 = 1 on every tick!
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array -> closure locked to Render 1!

  return <div>Count: {count}</div>;
}
```

---

## 5. MODERN IMPLEMENTATION & FIXES

### Pattern A: Functional State Updates (Eliminates Closure Dependency)
When next state depends on previous state, pass a pure updater function:
```tsx
// FIX 1: Functional update bypasses closure snapshot
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prev) => prev + 1); // Reads live state queue in React Fiber!
  }, 1000);
  return () => clearInterval(timer);
}, []); // Safe with empty deps because updater function has no external dependencies
```

### Pattern B: Ref-Based Latest Value Synchronization (For Callbacks)
When a long-lived callback (e.g. WebSocket, event emitter) needs to access current props/state without triggering re-subscription:
```tsx
export function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef<T>(fn);

  // Synchronize ref on every render
  ref.current = fn;

  // Return stable function reference that delegates to current closure
  return useRef(((...args: any[]) => ref.current(...args)) as T).current;
}
```

---

## 6. COMMON MISTAKES
1. **Suppressing `eslint-plugin-react-hooks` (`// eslint-disable-next-line react-hooks/exhaustive-deps`):** Suppressing lint warnings hides stale closures instead of fixing the root design flaw.
2. **Accessing TDZ variables in default parameters or helper functions:**
   ```javascript
   const init = (val = defaultVal) => {}; // ReferenceError if defaultVal declared below with let/const
   const defaultVal = 10;
   ```
3. **Closing over mutable variables in event handlers:** Storing changing values in module-level `let` variables instead of React state or `useRef`.

---

## 7. EXPERT INTERVIEW QUESTIONS
1. *Explain step-by-step why `setCount(count + 1)` fails inside a `setInterval` with an empty dependency array, but `setCount(prev => prev + 1)` works.*
2. *What is the Temporal Dead Zone (TDZ), why was it introduced in ES6, and how does it differ from `var` hoisting?*
3. *How does JavaScript's lexical scoping enable React hooks to maintain state across successive component renders?*
