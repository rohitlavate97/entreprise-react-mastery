# Module 7.1 — Client-Side Routing Fundamentals: History API, BrowserRouter & Route Matching

## 1. WHAT
- **Client-Side Routing:** Navigation between "pages" in a Single Page Application (SPA) without a full-page reload from the server. The browser's URL bar updates, the back/forward buttons work, but the HTML document is never re-fetched — React simply swaps which component tree is rendered.
- **History API:** The browser-native `window.history` API (`pushState`, `replaceState`, `popstate` event) that React Router builds upon to manipulate the URL and listen for navigation events.
- **React Router v6+:** The de facto standard routing library for React SPAs. Uses a declarative `<Routes>` / `<Route>` tree to map URL paths to component trees.

```
                     HOW CLIENT-SIDE ROUTING WORKS
                     
  1. User clicks <Link to="/orders/123">
  2. React Router calls history.pushState({}, '', '/orders/123')
     → Browser URL bar updates to /orders/123
     → NO HTTP request is sent to the server!
  3. React Router matches '/orders/123' against <Route> tree
  4. React renders the matched component: <OrderDetailPage orderId="123" />
  5. User presses browser Back button
  6. Browser fires 'popstate' event
  7. React Router intercepts, matches previous URL, renders previous component
```

---

## 2. CORE ROUTER SETUP

```tsx
// main.tsx — Application Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

```tsx
// App.tsx — Route Definitions
import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

## 3. NAVIGATION: `<Link>` vs `<NavLink>` vs `useNavigate`

```tsx
import { Link, NavLink, useNavigate } from 'react-router-dom';

// 1. <Link> — Simple declarative navigation (renders <a> without page reload)
<Link to="/orders">View Orders</Link>

// 2. <NavLink> — Same as Link but with active styling awareness
<NavLink
  to="/orders"
  className={({ isActive }) => isActive ? 'text-blue-600 font-bold' : 'text-gray-600'}
>
  Orders
</NavLink>

// 3. useNavigate — Programmatic (imperative) navigation from event handlers
function OrderForm() {
  const navigate = useNavigate();

  async function handleSubmit(data: OrderPayload) {
    const created = await createOrder(data);
    navigate(`/orders/${created.id}`, { replace: true }); // replace: true removes form page from history
  }

  return <form onSubmit={...}>...</form>;
}
```

---

## 4. READING ROUTE PARAMS: `useParams`

```tsx
import { useParams } from 'react-router-dom';

export function OrderDetailPage() {
  // Route: <Route path="/orders/:orderId" element={<OrderDetailPage />} />
  const { orderId } = useParams<{ orderId: string }>();

  // ⚠️ useParams returns string | undefined — ALWAYS validate!
  if (!orderId) {
    return <Navigate to="/orders" replace />;
  }

  return <OrderDetail orderId={orderId} />;
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *How does React Router intercept browser navigation without causing a full page reload?*
2. *What is the difference between `history.pushState` and `history.replaceState`, and when does React Router use each?*
3. *Why should form submissions use `navigate(path, { replace: true })` instead of a regular push?*
