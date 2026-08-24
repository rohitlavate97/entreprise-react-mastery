# Module 10.3 — Network Resilience: Exponential Backoff, Jitter & Retry Policies

## 1. WHAT
- **Exponential Backoff:** An error-handling strategy for network requests where the delay between successive retry attempts increases exponentially ($1\text{s} \rightarrow 2\text{s} \rightarrow 4\text{s} \rightarrow 8\text{s}$).
- **Full Jitter:** Adding a pseudo-randomized variance to the backoff delay to prevent **Thundering Herd** problems (where thousands of clients all retry at the exact same millisecond interval, crashing the recovering backend).
- **The Golden Retry Rule:** *Only retry idempotent requests (GET, PUT, DELETE) or transient server errors (503, 504, network drops). NEVER retry non-idempotent POST requests or permanent client errors (400, 401, 403, 404, 422).*

```
                     EXPONENTIAL BACKOFF WITH FULL JITTER
                     
  Attempt 1: delay = Random(0, min(30s, 1s * 2^0)) = Random(0, 1s)  -> e.g. 620ms
  Attempt 2: delay = Random(0, min(30s, 1s * 2^1)) = Random(0, 2s)  -> e.g. 1.45s
  Attempt 3: delay = Random(0, min(30s, 1s * 2^2)) = Random(0, 4s)  -> e.g. 3.10s
  Attempt 4: delay = Random(0, min(30s, 1s * 2^3)) = Random(0, 8s)  -> e.g. 6.80s
```

---

## 2. PRODUCTION IMPLEMENTATION: RETRY POLICY UTILITY

```typescript
// shared/api/retryPolicy.ts
import { AxiosError } from 'axios';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

// Calculate exponential backoff with full jitter
export function calculateBackoffWithJitter(attempt: number, config = DEFAULT_RETRY_CONFIG): number {
  const exponentialDelay = Math.min(
    config.maxDelayMs,
    config.baseDelayMs * Math.pow(2, attempt)
  );
  // Full Jitter: random value between 0 and exponentialDelay
  return Math.floor(Math.random() * exponentialDelay);
}

// Determine whether a request is safe and eligible for retry
export function shouldRetryRequest(error: AxiosError, attempt: number, config = DEFAULT_RETRY_CONFIG): boolean {
  if (attempt >= config.maxRetries) {
    return false;
  }

  // Network offline / timeout errors
  if (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
    return true;
  }

  const status = error.response.status;

  // Rate limited (429) or Transient Gateway/Server Errors (502, 503, 504)
  if (status === 429 || status === 502 || status === 503 || status === 504) {
    // Only retry idempotent methods or read operations
    const method = error.config?.method?.toUpperCase() || 'GET';
    const isIdempotent = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'].includes(method);
    return isIdempotent;
  }

  // Permanent 4xx errors should never be retried
  return false;
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does Exponential Backoff without Jitter fail to protect a recovering Spring Boot backend service?*
2. *Why must POST requests be excluded from automatic network retries unless protected by an `Idempotency-Key`?*
3. *How should the frontend handle an HTTP 429 response when the server includes a `Retry-After: 30` header?*
