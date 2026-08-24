# Module 11.6 — Spring Boot Integration Issues Lab (SPRING-001 to SPRING-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for full-stack React + Spring Boot integration.

---

## 🔬 SPRING-001: CORS Preflight 403 Due to Spring Security Filter Ordering

- **Severity:** 🔴 Critical
- **Environment:** Local / Production
- **Symptoms:** React app receives `403 Forbidden` on every `OPTIONS` preflight request; all POST/PUT mutations fail.
- **Root Cause:** Spring Security's authorization filter was positioned before `CorsFilter`. Unauthenticated `OPTIONS` requests were blocked before CORS headers could be appended.
- **Fix:** Attach CORS via `http.cors(cors -> cors.configurationSource(corsSource))` in `SecurityFilterChain`.

---

## 🔬 SPRING-002: 64-bit Long Primary Key Truncated by JavaScript `JSON.parse()`

- **Severity:** 🔴 Critical (Data Corruption)
- **Environment:** Production
- **Symptoms:** Updating entity `9007199254740995` sends `PUT /api/orders/9007199254740996` (404 Not Found) because JavaScript truncated the last digit.
- **Root Cause:** Java `Long` exceeds `Number.MAX_SAFE_INTEGER` ($2^{53} - 1$).
- **Fix:** Add `@JsonSerialize(using = ToStringSerializer.class)` to all Long IDs in Spring Boot DTOs.

---

## 🔬 SPRING-003: CSRF Token Mismatch on Cookie-Authenticated Endpoints

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** POST requests return `403 Invalid CSRF Token` after page refresh.
- **Root Cause:** Spring Security expected `X-XSRF-TOKEN` header matching `XSRF-TOKEN` cookie, but React Axios client failed to read or attach the header.
- **Fix:** Configure Axios `xsrfCookieName: 'XSRF-TOKEN'` and `xsrfHeaderName: 'X-XSRF-TOKEN'`.

---

## 🔬 SPRING-004: Unhandled JPA `OptimisticLockException` (409 Conflict)

- **Severity:** 🔴 High
- **Environment:** Production (Multi-User Editing)
- **Symptoms:** User B submits form, sees unhandled error screen. User B's edits are lost without explanation.
- **Root Cause:** Backend threw `ObjectOptimisticLockingFailureException`. Controller didn't map it to 409 Conflict, and React UI had no conflict resolution handler.
- **Fix:** Map exception in `@RestControllerAdvice` to 409 ProblemDetail; prompt React user to reload conflicting record.

---

## 🔬 SPRING-005: Localized Date String Causing Safari `Invalid Date` White-Screen

- **Severity:** 🟡 Medium
- **Environment:** Production (Safari Browsers)
- **Symptoms:** Safari users see `NaN` or white screen on order dates. Chrome users see dates normally.
- **Root Cause:** Spring Boot serialized `LocalDateTime` using a localized format `yyyy/MM/dd hh:mm a`. Safari WebKit cannot parse non-ISO date formats.
- **Fix:** Use strict ISO-8601 UTC `Instant` formatted as `yyyy-MM-dd'T'HH:mm:ss.SSSX`.

---

## 🔬 SPRING-006: Spring Validation Returning 400 Bad Request Instead of 422 ProblemDetail

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Form submission failure displays a generic toast "400 Bad Request" instead of highlighting the exact invalid inputs (e.g. invalid email format).
- **Root Cause:** Spring Boot returned default unformatted error payload instead of RFC 7807 `invalidParams`.
- **Fix:** Implement `@ExceptionHandler(MethodArgumentNotValidException.class)` returning `ProblemDetail`.

---

## 🔬 SPRING-007: Redis Idempotency Key Lock Failure Under Rapid Double-Clicks

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** Two concurrent clicks 10ms apart both process payment before the first transaction finishes writing the cache key.
- **Root Cause:** Idempotency filter used `get` followed by `set` (non-atomic check-then-act race condition).
- **Fix:** Use atomic Redis `SET NX EX` (Set if Not Exists with Expiry) to acquire an atomic distributed lock.

---

## 🔬 SPRING-008: `SameSite=None; Secure` Cookie Blocked on Local HTTP Development

- **Severity:** 🟡 Medium
- **Environment:** Local Development
- **Symptoms:** Refresh token cookie is never stored by browser on `http://localhost:5173`.
- **Root Cause:** Modern browsers reject cookies with `SameSite=None` unless the connection is `Secure` (HTTPS).
- **Fix:** Use `SameSite=Lax` or `SameSite=Strict` for local HTTP development, or enable local HTTPS with `mkcert`.
