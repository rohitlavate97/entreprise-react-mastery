# Module 7.3 — Route Protection, Auth Guards & Role-Based Access Control (RBAC)

## 1. WHAT
- **Protected Route:** A route wrapper that checks authentication status before rendering the child route. If the user is unauthenticated, it redirects to the login page.
- **Auth Guard Pattern:** A component (or layout route) that acts as a gatekeeper, intercepting navigation to protected routes and enforcing authentication and authorization rules before allowing rendering.
- **Role-Based Access Control (RBAC):** Restricting access to specific routes based on the authenticated user's assigned roles or permissions (e.g., only `ADMIN` can access `/dashboard/settings/users`).

```
                     ROUTE PROTECTION FLOW
                     
  User navigates to /dashboard/settings
         │
  ┌──────▼──────────────────────────┐
  │  <ProtectedRoute>                │
  │  Is user authenticated?          │
  │                                  │
  │  NO ──> <Navigate to="/login"    │
  │          state={{ from: path }}  │──> Login Page preserves intended destination
  │          replace />              │
  │                                  │
  │  YES ──> Does user have          │
  │          required role?          │
  │                                  │
  │          NO ──> <ForbiddenPage /> │
  │                                  │
  │          YES ──> <Outlet />       │──> Render protected content
  └──────────────────────────────────┘
```

---

## 2. IMPLEMENTATION: GENERIC PROTECTED ROUTE WRAPPER

```tsx
// ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show loading while auth state is being resolved (prevents flash of login page)
  if (isLoading) {
    return <PageSkeleton />;
  }

  // 2. Redirect unauthenticated users to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Check role-based access if required
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user?.roles.includes(role)
    );
    if (!hasRequiredRole) {
      return <ForbiddenPage />;
    }
  }

  // 4. User is authenticated and authorized — render child routes
  return <Outlet />;
}
```

---

## 3. WIRING PROTECTED ROUTES INTO THE ROUTER

```tsx
// AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes — require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
          </Route>
        </Route>
      </Route>

      {/* Admin-only routes — require authentication + ADMIN role */}
      <Route element={<ProtectedRoute requiredRoles={['ADMIN']} />}>
        <Route element={<RootLayout />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

## 4. POST-LOGIN REDIRECT (PRESERVING INTENDED DESTINATION)

```tsx
// LoginPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read the originally intended destination stored by ProtectedRoute
  const from = (location.state as { from?: string })?.from || '/dashboard';

  async function handleLogin(credentials: LoginPayload) {
    await authService.login(credentials);
    navigate(from, { replace: true }); // Redirect to where user originally wanted to go
  }

  return <LoginForm onSubmit={handleLogin} />;
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *Why must the `ProtectedRoute` show a loading state while auth is resolving, and what happens if you skip this?*
2. *How does `<Navigate state={{ from: location.pathname }}>` preserve the user's intended destination through the login flow?*
3. *Why should role checks happen on BOTH the frontend route guard AND the backend Spring Security filter?*
