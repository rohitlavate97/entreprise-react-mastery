# Module 10.6 — API & Networking Issues Lab (API-001 to API-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for enterprise React networking.

---

## 🔬 API-001: Token Refresh Race Condition Invalidating Rotated Refresh Tokens

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** When access tokens expire, users loading the dashboard get abruptly logged out because 5 concurrent API requests all trigger 5 separate refresh calls, and the backend refresh token rotation algorithm revokes the entire session.
- **Root Cause:** Missing mutex/queue in the Axios response interceptor.
- **Fix:** Implement the thread-safe `failedQueue` and `isRefreshing` mutex lock in `authInterceptor.ts`.

---

## 🔬 API-002: Infinite 401 Redirect Loop from Refresh Endpoint Returning 401

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** Browser locks up with 100+ requests per second to `/auth/refresh` when a user's refresh token has expired.
- **Root Cause:** The 401 response interceptor attempts to call `/auth/refresh` even when the request *that failed with 401* was `/auth/refresh` itself!
- **Fix:** Check `if (originalRequest.url?.includes('/auth/refresh')) { logout(); return Promise.reject(error); }`.

---

## 🔬 API-003: Missing HTTP Timeout Budget Hanging UI Indefinitely

- **Severity:** 🔴 High
- **Environment:** Production (Mobile / Flaky Networks)
- **Symptoms:** User clicks "Submit Payment", spinner runs for 15 minutes without ever erroring out or timing out.
- **Root Cause:** Axios defaults to `timeout: 0` (no timeout). Flaky network socket drops hang open indefinitely.
- **Fix:** Set explicit timeout budgets: `timeout: 15000` (15s) in client instance configuration.

---

## 🔬 API-004: Non-Idempotent POST Request Retried on 504 Gateway Timeout

- **Severity:** 🔴 Critical (Financial Impact)
- **Environment:** Production
- **Symptoms:** Spring Boot payment processor timed out after 30s. The frontend retry interceptor automatically retried the `POST /api/pay`, charging the customer twice.
- **Root Cause:** Retry interceptor blindly retried all 504 errors without checking HTTP method idempotency.
- **Fix:** Only retry idempotent methods (GET, PUT, DELETE), never POST requests without `Idempotency-Key`.

---

## 🔬 API-005: DTO Schema Drift Crashing React Component with Unhandled Undefined

- **Severity:** 🔴 High
- **Environment:** Production Deployment
- **Symptoms:** Spring Boot release renamed `customer.address_line1` to `customer.streetAddress`. React app white-screens on checkout.
- **Root Cause:** Unsound TypeScript `as CustomerDTO` casting with zero runtime boundary validation.
- **Fix:** Validate all API responses using Zod schemas via `getValidated()`.

---

## 🔬 API-006: CORS Preflight 403 Due to Custom `X-Correlation-ID` Header Missing from Spring CORS Config

- **Severity:** 🔴 Critical
- **Environment:** Production / Staging
- **Symptoms:** All API requests fail with `CORS policy: Request header field x-correlation-id is not allowed by Access-Control-Allow-Headers in preflight response.`
- **Root Cause:** Frontend added `X-Correlation-ID` for distributed tracing, but Spring Boot's `CorsConfiguration` was not updated to allow it.
- **Fix:** Add `config.addAllowedHeader("X-Correlation-ID")` in Spring Boot `CorsFilter`.

---

## 🔬 API-007: Unhandled `AbortError` Logging False-Positive Network Errors in Sentry

- **Severity:** 🟡 Medium
- **Environment:** Production Monitoring
- **Symptoms:** Sentry error volume spikes with thousands of `CanceledError: canceled` / `AbortError: signal is aborted`.
- **Root Cause:** Intentional request cancellation (e.g. typing in search input) throws an error that is treated as an unhandled network failure.
- **Fix:** Ignore `axios.isCancel(error)` or `error.name === 'AbortError'` in global error loggers.

---

## 🔬 API-008: JavaScript JSON Precision Loss Truncating 64-bit Long IDs

- **Severity:** 🔴 Critical (Data Corruption)
- **Environment:** Full-Stack (Spring Boot + React)
- **Symptoms:** Backend generates Snowflake / Twitter ID `9007199254740993`. React reads it as `9007199254740992` (last digit changed!). Mutations fail with 404.
- **Root Cause:** JavaScript `Number.MAX_SAFE_INTEGER` is $2^{53} - 1$ (`9007199254740991`). 64-bit Java `Long` integers exceed safe precision and lose digits during `JSON.parse()`.
- **Fix:** Serialize Spring Boot `Long` IDs as Strings in JSON using Jackson `@JsonSerialize(using = ToStringSerializer.class)`.
