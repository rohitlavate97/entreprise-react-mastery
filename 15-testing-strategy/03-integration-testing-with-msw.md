# Module 15.3 — Integration Testing with Mock Service Worker (MSW v2)

## 1. WHAT
- **Mock Service Worker (MSW v2):** An API mocking library that intercepts outgoing HTTP requests at the **network level** (using Node.js `undici` interceptors in unit tests and real Service Workers in the browser), rather than monkey-patching Axios or Fetch modules.
- **Why Module Mocking (`vi.mock('axios')`) Fails:**
  1. Misses custom request/response interceptor logic.
  2. Bypasses header serialization, query param stringification, and response parsing.
  3. Fails when swapping HTTP clients (e.g. migrating from Axios to `fetch`).

```
                    MSW NETWORK-LEVEL INTERCEPTION
                    
  React Component ──> apiClient.get('/api/orders') ──> Node HTTP Layer (or Service Worker)
                                                            │
                                                            ▼ (Intercepted by MSW)
                                                      [ MSW Request Handlers ]
                                                      • Matches: http.get('/api/orders')
                                                      • Returns: HttpResponse.json([...])
                                                            │
  React Component receives real HTTP Response! <────────────┘
```

---

## 2. PRODUCTION IMPLEMENTATION: MSW HANDLERS & VITEST SETUP

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock GET /api/orders
  http.get('/api/orders', () => {
    return HttpResponse.json([
      { id: 'ORD-101', customer: 'Alice Corp', total: 450.0, status: 'CONFIRMED' },
      { id: 'ORD-102', customer: 'Bob Inc', total: 1200.5, status: 'PENDING' },
    ]);
  }),

  // Mock POST /api/orders (with validation check)
  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as any;
    if (!body.customerId) {
      return new HttpResponse(
        JSON.stringify({ title: 'Validation Error', detail: 'customerId is required' }),
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }
    return HttpResponse.json({ id: 'ORD-103', ...body }, { status: 201 });
  }),
];
```

```typescript
// test/setupTests.ts
import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import { beforeAll, afterEach, afterAll } from 'vitest';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // Fail test if unmocked API call is made
afterEach(() => server.resetHandlers()); // Reset runtime overrides between tests
afterAll(() => server.close());
```

---

## 3. INTEGRATION TEST: TESTING ORDERS PAGE WITH TANSTACK QUERY

```tsx
// features/orders/OrdersPage.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrdersPage } from './OrdersPage';
import { server } from '@/test/setupTests';
import { http, HttpResponse } from 'msw';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // Disable retries in tests
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('<OrdersPage /> Integration', () => {
  it('renders orders list fetched from API', async () => {
    renderWithProviders(<OrdersPage />);

    // Shows loading skeleton initially
    expect(screen.getByTestId('orders-skeleton')).toBeInTheDocument();

    // Successfully renders orders from MSW handler
    expect(await screen.findByText('Alice Corp')).toBeInTheDocument();
    expect(screen.getByText('Bob Inc')).toBeInTheDocument();
  });

  it('renders error state when API fails with 500', async () => {
    // Runtime override to simulate server outage
    server.use(
      http.get('/api/orders', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderWithProviders(<OrdersPage />);

    expect(await screen.findByText(/Failed to load orders/i)).toBeInTheDocument();
  });
});
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why is network-level request mocking with MSW significantly more robust than module mocking with `vi.mock('axios')`?*
2. *Why should `retry: false` be configured on TanStack Query's `QueryClient` during integration tests?*
3. *How do you override specific MSW request handlers on a per-test basis using `server.use()`?*
