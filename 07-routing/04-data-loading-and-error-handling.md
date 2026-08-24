# Module 7.4 — Data Loading, Route-Level Error Handling & Suspense Integration

## 1. WHAT
- **Route Loaders (React Router v6.4+):** Functions that fetch data BEFORE a route component renders, eliminating the "render → show spinner → fetch → render again" waterfall by parallelizing data fetching with route transitions.
- **`useLoaderData`:** A hook that gives the route component access to the data returned by its `loader` function.
- **Route-Level `errorElement`:** A dedicated error fallback component that renders when a route's `loader` or the route component itself throws an error, isolating the failure to that route without crashing the entire app.

```
                    DATA LOADING: TRADITIONAL vs ROUTE LOADERS
                    
  ❌ TRADITIONAL (Render-then-Fetch Waterfall):
  1. Navigate to /orders
  2. React renders <OrdersPage />      ← Shows empty shell
  3. useEffect fires                   ← First paint has no data
  4. fetch('/api/orders')              ← Network request starts AFTER render
  5. Loading spinner shows
  6. Data arrives → setState → re-render with data
  
  ✅ ROUTE LOADER (Fetch-then-Render):
  1. Navigate to /orders
  2. Router calls loader()             ← Network request starts IMMEDIATELY
  3. Suspense fallback shows (or pending UI via useNavigation)
  4. Data arrives → Router renders <OrdersPage /> with data ALREADY available
  5. Single render with complete data — no waterfall!
```

---

## 2. IMPLEMENTATION: ROUTE LOADERS WITH `createBrowserRouter`

```tsx
// router.tsx — Modern Data Router Setup
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { OrdersPage, ordersLoader } from '@/pages/orders/OrdersPage';
import { OrderDetailPage, orderDetailLoader } from '@/pages/orders/OrderDetailPage';
import { RouteErrorFallback } from '@/shared/ui/RouteErrorFallback';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,  // Global route error fallback
    children: [
      {
        path: '/orders',
        element: <OrdersPage />,
        loader: ordersLoader,
        errorElement: <RouteErrorFallback />,  // Route-specific error isolation
      },
      {
        path: '/orders/:orderId',
        element: <OrderDetailPage />,
        loader: orderDetailLoader,
        errorElement: <RouteErrorFallback />,
      },
    ],
  },
]);

// main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
```

```tsx
// OrdersPage.tsx — Loader Function + Component
import { useLoaderData } from 'react-router-dom';
import { httpClient } from '@/shared/api/httpClient';
import type { Order } from '@/features/orders/model/order.types';

// Loader runs BEFORE the component renders
export async function ordersLoader(): Promise<Order[]> {
  const response = await httpClient.get<Order[]>('/api/orders');
  return response.data;
}

export function OrdersPage() {
  // Data is ALREADY available — no loading state needed in this component!
  const orders = useLoaderData() as Order[];

  return (
    <div>
      <h1>Orders ({orders.length})</h1>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

---

## 3. ROUTE-LEVEL ERROR HANDLING

```tsx
// RouteErrorFallback.tsx
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

export function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Handle HTTP-style error responses (e.g., 404 from loader)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold">{error.status}</h1>
        <p className="text-gray-600 mt-2">{error.statusText}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">
          Go Back
        </button>
      </div>
    );
  }

  // Handle unexpected runtime errors
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="text-gray-600 mt-2">
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
      <button onClick={() => navigate(0)} className="mt-4 text-blue-600">
        Reload Page
      </button>
    </div>
  );
}
```

---

## 4. PENDING UI WITH `useNavigation`

```tsx
import { useNavigation } from 'react-router-dom';

export function RootLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div>
      <TopNavbar />
      {isLoading && <ProgressBar />}  {/* Global loading indicator during route transitions */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *What is the render-then-fetch waterfall and how do route loaders eliminate it?*
2. *How does `errorElement` on a nested route isolate errors without crashing the parent layout?*
3. *What is the difference between `useNavigation().state` values `idle`, `loading`, and `submitting`?*
