# Module 5.6 — Custom Hooks Engineering & Composition Architecture

## 1. WHAT
- **Custom Hook:** A JavaScript function whose name starts with `use` and that may call other React Hooks.
- **The Core Hook Contract:** Custom hooks **do not share state** between components; they share **stateful logic**. Every component that invokes a custom hook receives an entirely independent, isolated set of state variables and effect subscriptions.

---

## 2. REUSABLE ENTERPRISE HOOK CATALOG

### Hook 1: `useDebounce` (Input Stabilization)
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
```

### Hook 2: `useMediaQuery` (Responsive Breakpoint Listener)
```typescript
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

### Hook 3: `useOnClickOutside` (Modal & Dropdown Dismissal)
```typescript
import { useEffect, RefObject } from 'react';

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Do multiple components calling the same custom hook share the same state values in memory?*
2. *Why must custom hooks always start with the prefix `use`?*
3. *What are the tradeoffs of returning an Object `{ data, error, refetch }` vs a Tuple `[data, setData] as const` from a custom hook?*
