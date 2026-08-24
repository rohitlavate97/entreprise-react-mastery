# Module 15.2 — Unit & Custom Hook Testing with Vitest & React Testing Library

## 1. WHAT
- **Vitest:** A blazing-fast, Vite-native unit test framework with built-in TypeScript support, Jest-compatible assertions (`expect`, `describe`, `it`, `vi`), and instant watch mode.
- **`renderHook`:** A utility from `@testing-library/react` that allows testing custom React hooks in isolation without manually building dummy wrapper components.
- **The `act(...)` Warning:** A warning thrown when a state update occurs outside of React's testing execution envelope:
  `Warning: An update to Component inside a test was not wrapped in act(...)`

```
                    HOW TO RESOLVE act(...) WARNINGS
                    
  ❌ THE MISTAKE (State updates asynchronously after test finishes):
  it('increments counter', () => {
    const { result } = renderHook(() => useAsyncCounter());
    result.current.incrementAsync(); // Triggers async setTimeout -> setState!
    expect(result.current.count).toBe(1); // Fails + logs unhandled act() warning!
  });
  
  -----------------------------------------------------------------------------
  
  ✅ THE FIX (Wait for async state update to settle using waitFor / findBy):
  it('increments counter', async () => {
    const { result } = renderHook(() => useAsyncCounter());
    act(() => {
      result.current.incrementAsync();
    });
    // Wait for the state to reach target value
    await waitFor(() => {
      expect(result.current.count).toBe(1);
    });
  });
```

---

## 2. PRODUCTION IMPLEMENTATION: TESTING A CUSTOM HOOK (`useDebounce`)

```typescript
// features/common/hooks/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Intercept browser timers
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately on mount', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should update debounced value only after specified delay', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'first', delay: 300 } }
    );

    // Update props
    rerender({ val: 'second', delay: 300 });

    // Value should NOT have updated yet
    expect(result.current).toBe('first');

    // Fast-forward time by 299ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('first');

    // Fast-forward remaining 1ms (total 300ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What causes React's "An update to Component was not wrapped in act(...)" warning and what is the proper way to resolve it?*
2. *Why is testing a pure reducer function ($State \times Action \rightarrow State$) more reliable than testing component state via DOM clicks?*
3. *Why should `vi.useFakeTimers()` always be cleaned up with `vi.useRealTimers()` in an `afterEach` hook?*
