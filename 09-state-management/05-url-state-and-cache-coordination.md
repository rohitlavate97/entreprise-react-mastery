# Module 9.5 — URL State & Server Cache Coordination

## 1. WHAT
- **URL State & Cache Coordination:** The architectural pattern where URL search parameters serve as the **input parameters (dependencies)** for TanStack Query keys.
- **The Core Rule:** The URL drives the Query Key. When the URL search parameters change, TanStack Query automatically detects a new query key and fetches or retrieves the matching cache partition without any manual `useEffect` wiring.

```
                  URL-DRIVEN QUERY KEY ARCHITECTURE
                  
  Browser URL: /orders?status=PENDING&page=2
                      │
                      ▼
  useSearchParams() -> { status: "PENDING", page: 2 }
                      │
                      ▼
  queryKey: ['orders', 'list', { status: "PENDING", page: 2 }]
                      │
                      ▼
  TanStack Query: Checks cache for key ['orders', 'list', { status: "PENDING", page: 2 }]
  • Cache Hit  -> Render instantly
  • Cache Miss -> Fetch /api/orders?status=PENDING&page=2
```

---

## 2. PRODUCTION IMPLEMENTATION: COORDINATED HOOK

```tsx
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { orderKeys } from '../api/orderKeys';
import { httpClient } from '@/shared/api/httpClient';
import type { Order, OrderFilterParams } from '../model/order.types';

export function useOrdersTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Extract & validate URL search params
  const filters: OrderFilterParams = {
    status: searchParams.get('status') || 'ALL',
    page: Number(searchParams.get('page')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 20,
  };

  // 2. Query automatically coordinates with URL via queryKey!
  const query = useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async ({ signal }) => {
      const res = await httpClient.get<{ items: Order[]; totalPages: number }>('/api/orders', {
        params: filters,
        signal,
      });
      return res.data;
    },
    placeholderData: keepPreviousData, // Keeps previous page on screen while next page loads
  });

  // 3. Clean helper to update URL parameters atomically
  const updateFilters = (newParams: Partial<OrderFilterParams>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === null || val === 'ALL') {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      // Reset page to 1 if filter (status) changed, unless page was explicitly updated
      if ('status' in newParams && !('page' in newParams)) {
        next.set('page', '1');
      }
      return next;
    });
  };

  return {
    orders: query.data?.items ?? [],
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    filters,
    updateFilters,
  };
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does passing URL filter parameters directly into TanStack Query keys eliminate the need for `useEffect` synchronization?*
2. *How does `placeholderData: keepPreviousData` improve pagination user experience over standard loading skeletons?*
3. *How do you prevent rapid URL parameter updates (e.g. typing in search input) from triggering 20 sequential network requests?*
