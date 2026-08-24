# Module 7.5 — URL State Management: Search Params, Pagination & Deep Linking

## 1. WHAT
- **URL State:** Application state that is serialized into the URL's query string (`?page=2&sort=date&status=active`). This enables deep-linking, browser back/forward consistency, and shareable/bookmarkable views.
- **`useSearchParams`:** A React Router hook that returns a `[searchParams, setSearchParams]` tuple for reading and writing URL query parameters — similar to `useState` but backed by the browser URL instead of component memory.
- **The Single Source of Truth Rule:** When state is represented in the URL, the URL IS the source of truth. Component state should be derived FROM the URL, never duplicated alongside it.

```
                     URL STATE vs COMPONENT STATE
                     
  ❌ DUPLICATED STATE (Desync Bug):
  const [page, setPage] = useState(1);          // Component state
  const [searchParams] = useSearchParams();      // URL state
  // page and searchParams.get('page') can diverge!
  
  ✅ SINGLE SOURCE OF TRUTH (URL Drives Everything):
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;     // Derived from URL
  const sort = searchParams.get('sort') || 'createdAt';   // Derived from URL
  // No local state duplication — URL is the authority!
```

---

## 2. IMPLEMENTATION: ENTERPRISE DATA TABLE WITH URL-DRIVEN PAGINATION & FILTERING

```tsx
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/httpClient';

interface OrderFilters {
  page: number;
  pageSize: number;
  sort: string;
  status: string;
}

function parseFiltersFromURL(searchParams: URLSearchParams): OrderFilters {
  return {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    pageSize: Number(searchParams.get('pageSize')) || 20,
    sort: searchParams.get('sort') || 'createdAt',
    status: searchParams.get('status') || 'all',
  };
}

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Derive ALL filter state from URL (single source of truth)
  const filters = parseFiltersFromURL(searchParams);

  // 2. TanStack Query uses URL-derived filters as cache keys
  const { data, isLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => httpClient.get('/api/orders', { params: filters }),
  });

  // 3. Update URL (which auto-updates filters → auto-refetches query)
  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      prev.set('page', String(newPage));
      return prev;
    });
  }

  function handleStatusFilter(status: string) {
    setSearchParams((prev) => {
      prev.set('status', status);
      prev.set('page', '1'); // Reset to page 1 when filter changes
      return prev;
    });
  }

  function handleSortChange(sortField: string) {
    setSearchParams((prev) => {
      prev.set('sort', sortField);
      return prev;
    });
  }

  return (
    <div>
      <FilterBar
        currentStatus={filters.status}
        onStatusChange={handleStatusFilter}
        currentSort={filters.sort}
        onSortChange={handleSortChange}
      />
      <OrdersTable data={data?.items ?? []} isLoading={isLoading} />
      <Pagination
        currentPage={filters.page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

---

## 3. BENEFITS OF URL STATE

| Benefit | Description |
|---|---|
| **Shareability** | User can copy the URL `?page=3&status=active` and share it with a colleague who sees the exact same view. |
| **Browser History** | Back/forward buttons correctly restore previous filter/page combinations. |
| **Bookmarkability** | Users can bookmark filtered views for quick access. |
| **SEO (if SSR)** | Search engines can index different filtered views as distinct pages. |
| **Crash Recovery** | If the tab refreshes, the URL restores the exact state — no data loss. |

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why should URL-represented state never be duplicated in `useState`, and what desync bugs does duplication cause?*
2. *How do you ensure that changing a filter resets pagination back to page 1?*
3. *What are the advantages of using URL search params over `useState` for table filters in an enterprise dashboard?*
