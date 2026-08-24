# Playbook PB-008 — SPA Routing & Navigation Triage

## Objective
Provide an operational triage workflow for diagnosing SPA routing failures: server 404s on refresh, auth redirect loops, URL state desync, and stale route data.

---

## 1. SPA 404 on Direct Navigation / Refresh Triage

```
[ Step 1: Reproduce ]
  - Navigate to a deep route via <Link> → Works?
  - Enter the same URL directly in the address bar → 404?
  - Press F5 on the same page → 404?
             │
  If YES to any 404:
             │
[ Step 2: Check Server Configuration ]
  - Nginx: Does location block have 'try_files $uri $uri/ /index.html;'?
  - Apache: Does .htaccess have 'FallbackResource /index.html'?
  - Spring Boot: Is there a SPA forwarding controller?
             │
[ Step 3: Check for Conflicting API Routes ]
  - Does the server have an API route that matches the SPA path?
  - e.g., /api/orders is fine, but /orders might conflict with SPA route.
```

---

## 2. Auth Redirect Loop Triage

```
[ Step 1: Check Browser DevTools Network Tab ]
  - Are there 20+ rapid 302 redirects between /login and /dashboard?
             │
[ Step 2: Inspect Route Tree ]
  - Is /login placed OUTSIDE the <ProtectedRoute> wrapper?
  - Does the ProtectedRoute correctly check isLoading before redirecting?
             │
[ Step 3: Verify Auth State Resolution ]
  - Does the auth provider properly set isAuthenticated after login?
  - Is there a race condition between auth state update and redirect?
```

---

## 3. URL State Desync Triage

```
[ Step 1: Identify Source of Truth ]
  - Is filter/page state in both useState AND useSearchParams?
  - Does pressing browser Back revert the URL but NOT the UI?
             │
[ Step 2: Eliminate Duplication ]
  - Remove useState for any state represented in the URL.
  - Derive all values from useSearchParams.
             │
[ Step 3: Verify Filter Reset ]
  - Changing a filter should reset page to 1.
  - setSearchParams should update multiple params atomically.
```

---

## 4. Stale Loader / Cache Data Triage

```
[ Step 1: After mutation, does the list still show old data? ]
             │
[ Step 2: Check revalidation strategy ]
  - React Router: Is useFetcher or revalidate() called after mutation?
  - TanStack Query: Is queryClient.invalidateQueries() called?
             │
[ Step 3: Verify cache key alignment ]
  - Does the mutation invalidate the EXACT query key used by the list?
```
