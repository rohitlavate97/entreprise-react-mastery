# Module 7.6 — Routing Issues Lab (ROUTE-001 to ROUTE-008)

This lab contains practical, reproducible failure modes, root-cause analyses, and permanent fixes for React Router and SPA routing.

---

## 🔬 ROUTE-001: SPA Returns 404 on Direct URL Navigation or Page Refresh (Nginx / Apache)

- **Severity:** 🔴 Critical
- **Environment:** Production (Deployed SPA behind Nginx or Apache)
- **Symptoms:** Navigating via `<Link>` works perfectly. But directly entering `https://app.example.com/dashboard/orders` in the browser address bar or pressing F5 to refresh returns a **404 Not Found** from the web server.
- **Root Cause:** The web server (Nginx/Apache) receives a request for `/dashboard/orders` and looks for a physical file at that path on disk. No such file exists — the SPA only has a single `index.html` file. The server should serve `index.html` for ALL client-side routes and let React Router handle path matching.
- **Fix (Nginx):**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Fix (Spring Boot embedded):**
  ```java
  @Controller
  public class SpaForwardController {
      @RequestMapping(value = "/{path:[^\\.]*}")
      public String forward() {
          return "forward:/index.html";
      }
  }
  ```

---

## 🔬 ROUTE-002: Auth Guard Infinite Redirect Loop

- **Severity:** 🔴 Critical
- **Environment:** Local / Production
- **Symptoms:** Browser shows "ERR_TOO_MANY_REDIRECTS" or the page flickers endlessly between `/login` and `/dashboard`.
- **Root Cause:** The `ProtectedRoute` wrapper redirects unauthenticated users to `/login`, BUT the `/login` route is ALSO nested inside `<ProtectedRoute>`. The user hits `/login` → is unauthenticated → redirects to `/login` → infinite loop.
- **Fix:** Ensure `/login` and other public routes are placed OUTSIDE the `<ProtectedRoute>` wrapper in the route tree.

---

## 🔬 ROUTE-003: URL Search Params Desync with Local `useState`

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** User clicks browser Back button after changing a filter. The URL reverts to `?status=all` but the filter dropdown still shows "Active" because the local `useState` was not updated.
- **Root Cause:** Filter state is duplicated in both `useState` (component memory) and `useSearchParams` (URL). When the user navigates via browser history, only the URL updates — the `useState` value is stale.
- **Fix:** Remove the `useState` duplication. Derive filter values directly from `useSearchParams` as the single source of truth.

---

## 🔬 ROUTE-004: Lost Intended Destination After Login Redirect

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** User is deep-linked to `/dashboard/orders/ORD-456`. The auth guard redirects them to `/login`. After successful login, the user is sent to `/dashboard` (the default) instead of their originally intended `/dashboard/orders/ORD-456`.
- **Root Cause:** The auth guard does not pass `location.state.from` when redirecting to login. The login success handler has no way to know the original destination.
- **Fix:** Pass `<Navigate to="/login" state={{ from: location.pathname }} replace />` in the guard. Read `location.state.from` in the login handler.

---

## 🔬 ROUTE-005: Route-Level Code Split Causes Flash of Loading on Every Navigation

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Every route transition shows a brief loading skeleton even for already-visited pages, causing a jarring user experience.
- **Root Cause:** `React.lazy()` chunks are re-fetched or the Suspense boundary is placed too high, showing a fallback on every navigation.
- **Fix:** Move the `<Suspense>` boundary inside each layout rather than wrapping the entire `<Routes>`. Use `React.startTransition` or `useTransition` to keep the current page visible while the next page loads.

---

## 🔬 ROUTE-006: Stale Loader Data After Mutation (Optimistic UI Desync)

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** User deletes an order, sees a success toast, but the order still appears in the list because the loader data is cached and not revalidated.
- **Root Cause:** The mutation does not trigger revalidation of the route loader. The list page still shows stale cached data.
- **Fix:** Use React Router's `useFetcher` or call `router.revalidate()` after mutations. With TanStack Query, invalidate the relevant query key after mutation: `queryClient.invalidateQueries({ queryKey: ['orders'] })`.

---

## 🔬 ROUTE-007: Nested Route Catch-All `*` Swallowing Valid Child Routes

- **Severity:** 🟡 Medium
- **Environment:** Development
- **Symptoms:** Navigating to `/dashboard/settings` shows the 404 page instead of the settings component.
- **Root Cause:** A `<Route path="*">` catch-all is placed inside the dashboard layout at the same nesting level as the `/settings` route, and React Router matches it before checking sibling routes due to incorrect ordering.
- **Fix:** Always place the `path="*"` catch-all route as the LAST sibling in the `<Route>` group. React Router v6 uses route ranking, but explicit ordering prevents confusion.

---

## 🔬 ROUTE-008: `useParams` Returns `undefined` Due to Missing Route Param Definition

- **Severity:** 🟡 Medium
- **Environment:** Development
- **Symptoms:** `useParams<{ orderId: string }>()` returns `{ orderId: undefined }`. The component renders with missing data.
- **Root Cause:** The route definition uses a static path `<Route path="/orders/detail">` instead of a parameterized path `<Route path="/orders/:orderId">`. The `:orderId` dynamic segment is missing.
- **Fix:** Define the route with a dynamic segment: `path="/orders/:orderId"`. Always validate that `useParams` values are defined before using them.
