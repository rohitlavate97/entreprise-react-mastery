# Playbook PB-011 — API Client, Auth Interceptor & Network Resilience Triage

## Objective
Provide an operational triage workflow for diagnosing silent token refresh race conditions, infinite 401 redirect loops, CORS preflight failures, and API schema drift in enterprise React + Spring Boot architectures.

---

## 1. 401 Refresh Race Condition & Session Logout Triage

```
[ Step 1: Detect Concurrent 401s ]
  - Check Network Tab: Filter by status 401.
  - Are there multiple /auth/refresh calls fired within milliseconds?
             │
[ Step 2: Audit Interceptor Mutex Queue ]
  - Is isRefreshing flag set BEFORE the refresh request starts?
  - Are secondary 401 requests pushed to failedQueue?
  - Does /auth/refresh have an explicit exclusion guard to prevent infinite loops?
             │
[ Step 3: Verify Refresh Token Rotation ]
  - Does the backend allow a grace period (e.g. 5 seconds) for recently rotated refresh tokens?
```

---

## 2. API Contract Drift & Zod Validation Triage

```
[ Step 1: Check Sentry / Console Logs ]
  - Look for "ApiValidationError: Endpoint /api/orders failed runtime validation".
             │
[ Step 2: Compare Schema Against Payload ]
  - Print parsed.error.issues to inspect exact mismatched field names and expected types.
  - Did backend introduce nullability or rename a snake_case/camelCase property?
             │
[ Step 3: Patch Schema & Coordinate Release ]
  - Update frontend Zod schema with z.optional() or z.nullable() if backend made field optional.
```

---

## 3. Spring Boot CORS & Preflight Header Triage

```
[ Step 1: Inspect OPTIONS Preflight Request ]
  - Status 403 Forbidden on OPTIONS?
  - Look at Request Header "Access-Control-Request-Headers".
             │
[ Step 2: Update Spring Security CorsConfiguration ]
  - Ensure custom headers (X-Correlation-ID, Idempotency-Key) are explicitly added to allowedHeaders.
  - Set allowCredentials = true if using cookies.
```
