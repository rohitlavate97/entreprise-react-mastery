# Module 7.2 — Nested Layouts, `<Outlet>` & Route-Level Code Splitting

## 1. WHAT
- **Nested Routes & Layouts:** React Router v6 allows routes to be nested inside parent routes. The parent route renders a persistent layout shell (navbar, sidebar) and uses the `<Outlet />` component as a mounting point where child routes render their content.
- **`<Outlet />`:** A placeholder component provided by React Router that renders the matched child route's element. Think of it as a "slot" where the child route's component mounts.
- **Route-Level Code Splitting:** Using `React.lazy()` with dynamic `import()` at the route level so that each page's JavaScript bundle is only downloaded when the user navigates to that route, drastically reducing the initial bundle size.

```
                     NESTED LAYOUT ARCHITECTURE
                     
  URL: /dashboard/orders/123
  
  ┌─────────────────────────────────────────────────┐
  │  <RootLayout>          (Persistent Navbar)       │
  │  ┌───────────────────────────────────────────┐  │
  │  │  <DashboardLayout>  (Sidebar + Breadcrumbs) │  │
  │  │  ┌─────────────────────────────────────┐  │  │
  │  │  │  <Outlet />                          │  │  │
  │  │  │  → Renders <OrderDetailPage />       │  │  │
  │  │  │    (Only this section swaps on nav!) │  │  │
  │  │  └─────────────────────────────────────┘  │  │
  │  └───────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────┘
```

---

## 2. IMPLEMENTATION: NESTED ROUTES WITH PERSISTENT LAYOUT

```tsx
// AppRouter.tsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { PageSkeleton } from '@/shared/ui/PageSkeleton';

// Route-level code splitting: each page is a separate JS chunk
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public routes — no layout shell */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — wrapped in RootLayout */}
        <Route element={<RootLayout />}>
          {/* Dashboard section — wrapped in DashboardLayout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
```

```tsx
// RootLayout.tsx — Persistent shell with top navbar
import { Outlet } from 'react-router-dom';
import { TopNavbar } from '@/shared/ui/TopNavbar';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar />
      <main className="flex-1">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

```tsx
// DashboardLayout.tsx — Persistent sidebar + content area
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';

export function DashboardLayout() {
  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        <Outlet /> {/* Dashboard child routes render here */}
      </div>
    </div>
  );
}
```

---

## 3. INDEX ROUTES

```tsx
// When user navigates to "/dashboard" (exact), show the DashboardHome component.
// The `index` prop means "render this when the parent route matches exactly".

<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />       {/* /dashboard (exact) */}
  <Route path="orders" element={<OrdersPage />} />  {/* /dashboard/orders */}
</Route>
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *How does `<Outlet />` work internally, and why does it prevent layout components from unmounting/remounting on child route changes?*
2. *What is the performance benefit of route-level code splitting with `React.lazy()`, and what are the UX tradeoffs?*
3. *What is an index route, and why is it necessary when using nested layout routes?*
