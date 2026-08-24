# Module 5.5 — `useMemo` & `useCallback` Discipline: Measurement-Driven Optimization

## 1. WHAT
- **`useMemo`:** A React Hook that caches the calculated result of a function between re-renders, recalculating only when its specified dependencies change.
- **`useCallback`:** A React Hook that caches a function definition between re-renders (`useCallback(fn, deps)` is syntactic sugar for `useMemo(() => fn, deps)`).
- **The Golden Rule of React Performance:** *Do not memoize blindly. Measure first using the React DevTools Profiler.*

$$\begin{array}{|l|l|l|}
\hline
\textbf{Scenario} & \textbf{Should You Memoize?} & \textbf{Engineering Rationale} \\ \hline
\text{Passing callback to regular JSX <button>} & ❌ \textbf{NO} & \text{DOM elements re-render with parent anyway; hook adds overhead.} \\ \hline
\text{Passing callback to <MemoizedChart />} & ✅ \textbf{YES (with React.memo)} & \text{Preserves referential equality (===) to skip expensive child render.} \\ \hline
\text{Array filter over 20 items} & ❌ \textbf{NO} & \text{Filter executes in microseconds; useMemo dependency diffing costs more.} \\ \hline
\text{Transforming 10,000 JSON records} & ✅ \textbf{YES (Measured > 10ms)} & \text{Saves significant CPU cycles during unrelated parent re-renders.} \\ \hline
\text{Object passed to useEffect dep array} & ✅ \textbf{YES} & \text{Prevents infinite effect triggers on re-render.} \\ \hline
\end{array}$$

---

## 2. WHY
The **Triple Cost of Memoization** that juniors overlook:
1. **Memory Cost:** Retains the closure, previous arguments, and cached return value in memory for the entire component lifespan.
2. **CPU Dependency Comparison Cost:** Every single render must iterate through the dependency array and run `Object.is` on every item.
3. **Maintenance Overhead:** Stale closure bugs multiply exponentially when developers forget to add or maintain proper dependency arrays.

---

## 3. MODERN IMPLEMENTATION: REFERENTIAL STABILITY WITH `React.memo`

```tsx
import React, { useState, useCallback, useMemo, memo } from 'react';

interface RowProps {
  id: number;
  name: string;
  onSelect: (id: number) => void;
}

// 1. Child component wrapped in React.memo (Skips render if props are strictly equal ===)
export const TableRow = memo(function TableRow({ id, name, onSelect }: RowProps) {
  console.log(`[TableRow Rendered] ID: ${id}`);
  return (
    <tr onClick={() => onSelect(id)}>
      <td>{id}</td>
      <td>{name}</td>
    </tr>
  );
});

export function UserTable({ users }: { users: { id: number; name: string }[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterText, setFilterText] = useState('');

  // 2. useCallback guarantees 'handleSelect' pointer address does NOT change on filterText changes!
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []); // Stable forever

  // 3. useMemo caches heavy filter
  const visibleUsers = useMemo(() => {
    return users.filter((u) => u.name.toLowerCase().includes(filterText.toLowerCase()));
  }, [users, filterText]);

  return (
    <div>
      <input
        type="text"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter names..."
      />
      <table>
        <tbody>
          {visibleUsers.map((user) => (
            <TableRow
              key={user.id}
              id={user.id}
              name={user.name}
              onSelect={handleSelect} // Stable reference ensures TableRow skips re-render!
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What are the three hidden performance and maintainability costs of wrapping every function in `useCallback`?*
2. *Why is `useCallback` completely useless if the child component receiving the callback is NOT wrapped in `React.memo`?*
3. *How do you measure whether a calculation is truly expensive enough to warrant `useMemo` using the browser Performance profiler?*
