# Module 9.2 — Server State with TanStack Query (v5): Keys, Lifecycles & Invalidation

## 1. WHAT
- **TanStack Query (React Query v5):** An asynchronous server-state synchronization engine for React. It manages caching, deduping parallel requests, background updates, garbage collection, and optimistic mutations with zero boilerplate.
- **`staleTime`:** The duration (in milliseconds) that fetched data is considered "fresh". While fresh, TanStack Query serves the data from cache **without making a network request**. (Default: `0ms` — immediately stale).
- **`gcTime` (formerly `cacheTime`):** The duration that unused inactive queries remain in memory before being garbage collected. (Default: `5 minutes`).

```
                    TANSTACK QUERY CACHING TIMELINE
                    
  0s ─── Fetch Data ──────────> Data is FRESH (staleTime = 60s)
                                No background refetch on remount/window focus
                                
  60s ────────────────────────> Data becomes STALE
                                Served instantly from cache, BUT refetched in background
                                on window focus / mount
                                
  Component Unmounts ─────────> Inactivity timer starts (gcTime = 5min)
                                If component remounts within 5min -> cache HIT
                                If 5min expires -> data evicted from memory
```

---

## 2. THE QUERY KEYS FACTORY PATTERN (PREVENTING KEY COLLISION)

```typescript
// features/orders/api/orderKeys.ts
// Centralized Query Key Factory ensures 100% type safety and zero key typos!

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: { status?: string; page: number; pageSize: number }) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};
```

---

## 3. MODERN IMPLEMENTATION: TANSTACK QUERY WITH ABORT CONTROLLER

```tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { orderKeys } from './orderKeys';
import { httpClient } from '@/shared/api/httpClient';
import type { Order, OrderFilterParams } from '../model/order.types';

export function useOrdersQuery(filters: OrderFilterParams) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async ({ signal }) => {
      // Passes TanStack Query's internal AbortSignal directly to Axios/Fetch
      const response = await httpClient.get<Order[]>('/api/orders', {
        params: filters,
        signal, // Automatically cancels in-flight HTTP request if queryKey changes!
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // Fresh for 2 minutes
    gcTime: 1000 * 60 * 10,   // Retained in cache for 10 minutes
    placeholderData: keepPreviousData, // Smooth pagination transitions without layout flicker
  });
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What is the exact distinction between `staleTime` and `gcTime` in TanStack Query v5?*
2. *How does passing the `signal` from `queryFn` prevent network race conditions when users click pagination rapidly?*
3. *Why is the Query Key Factory pattern essential for safe query invalidation in large applications?*
