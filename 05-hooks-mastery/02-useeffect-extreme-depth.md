# Module 5.2 — `useEffect` in Extreme Depth: Synchronization, Lifecycles & Anti-Patterns

## 1. WHAT
- **`useEffect`:** A React Hook that lets you **synchronize a React component with an external system** (such as a browser API, WebSocket, third-party charting library, or network endpoint).
- **The Core Law of Effects:** *An effect is NOT a lifecycle method (`componentDidMount`/`componentDidUpdate`). An effect is a synchronization lifecycle for external side effects that runs after the DOM has been committed and painted.*

```
                 WHAT AN EFFECT IS VS WHAT AN EFFECT IS NOT
                 
  ✅ VALID USE CASES FOR useEffect:
  1. Subscribing to an external WebSocket / Event Source.
  2. Setting up a native DOM timer (setInterval / setTimeout) with cleanup.
  3. Reading / mutating an external system (document.title, analytics beacon).
  4. Fetching network data with AbortController cancellation.
  
  -----------------------------------------------------------------------------
  
  ❌ COMMON ANTI-PATTERNS (DO NOT USE useEffect):
  1. Transforming data for rendering -> Compute during render!
  2. Handling user click/submit events -> Put in onClick / onSubmit handler!
  3. Resetting state when a prop changes -> Use a 'key' prop on the component!
  4. Passing data between parent and child -> Lift state up!
```

---

## 2. THE THREE CLASSIC INFINITE LOOP PATTERNS

### Pattern 1: State Setter Watching Its Own State
```tsx
// ❌ INFINITE LOOP:
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1); // Mutates state -> triggers render -> effect fires -> loops infinitely!
}, [count]);
```

### Pattern 2: Inline Object / Array as Dependency
```tsx
// ❌ INFINITE LOOP:
export function UserCard({ userId }: { userId: string }) {
  // options is allocated at a NEW memory address on EVERY render!
  const options = { id: userId, timeout: 5000 };

  useEffect(() => {
    fetchUserData(options);
  }, [options]); // Object.is(prevOptions, nextOptions) is ALWAYS FALSE!
}

// ✅ FIX: Move object inside effect or use primitives as dependencies!
useEffect(() => {
  fetchUserData({ id: userId, timeout: 5000 });
}, [userId]);
```

### Pattern 3: Inline Function as Dependency
```tsx
// ❌ INFINITE LOOP:
export function SearchBox() {
  const [data, setData] = useState([]);

  // New function reference created on every render
  const performSearch = () => { ... };

  useEffect(() => {
    performSearch();
  }, [performSearch]); // Triggers on every single render!
}

// ✅ FIX: Wrap function in useCallback OR move function definition INSIDE useEffect!
```

---

## 3. WHEN NOT TO USE `useEffect`: DERIVED DATA CALCULATIONS

### ❌ Bad (Redundant State & Double Render)
```tsx
export function FullName({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [fullName, setFullName] = useState('');

  // ANTI-PATTERN: Extra state variable + extra render cycle!
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);

  return <div>{fullName}</div>;
}
```

### ✅ Clean & Fast (Calculated During Render)
```tsx
export function FullName({ firstName, lastName }: { firstName: string; lastName: string }) {
  // Pure derivation: runs in nanoseconds with zero effects and zero extra renders!
  const fullName = `${firstName} ${lastName}`;
  return <div>{fullName}</div>;
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why should derived state never be synchronized inside `useEffect`?*
2. *Explain the three primary causes of infinite loops in `useEffect` and their permanent solutions.*
3. *Why does React recommend moving helper functions inside `useEffect` rather than wrapping them in `useCallback`?*
