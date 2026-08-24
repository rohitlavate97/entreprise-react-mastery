# Module 10.1 — HTTP Client Abstraction & Instance Design

## 1. WHAT
- **HTTP Client Abstraction:** A centralized, pre-configured HTTP client module (typically Axios or an enhanced `fetch` wrapper) that encapsulates base URLs, timeout thresholds, default headers, serialization formats, and telemetry correlation IDs for all network communication across the frontend application.
- **The Core Rule:** *Components and custom hooks must NEVER call raw `fetch()` or `axios.get('http://...')` directly. All network traffic must flow through a configured client instance.*

```
                 RAW CALLS VS CENTRALIZED CLIENT INSTANCE
                 
  ❌ RAW FETCH / AXIOS (Distributed Chaos):
  <UserCard />    ──> fetch('https://api.domain.com/v1/users')  (Hardcoded URL, no timeout, no JWT)
  <OrderTable />  ──> axios.get('/api/orders')                  (Missing correlation ID, default 0s timeout)
  <Settings />    ──> fetch('/api/settings')                    (No 401 refresh handler)
  
  -------------------------------------------------------------------------------------------------
  
  ✅ CENTRALIZED HTTP CLIENT INSTANCE:
  Components / Hooks ──> apiClient.get<T>('/users') ──> [ Request Interceptors (JWT, Trace-ID) ]
                                                     ──> [ Timeout Enforcement (10s Budget)     ]
                                                     ──> [ Response Interceptors (401 Refresh)  ]
                                                     ──> Spring Boot API Gateway
```

---

## 2. PRODUCTION IMPLEMENTATION: CONFIGURED AXIOS CLIENT INSTANCE

```typescript
// shared/api/httpClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 1. Timeout Budget Matrix (Enterprise SLAs)
export const TIMEOUT_BUDGETS = {
  FAST_QUERY: 5000,    // 5s for autocomplete / quick lookups
  STANDARD_API: 15000, // 15s for standard CRUD
  HEAVY_REPORT: 60000, // 60s for batch PDF / CSV generation
} as const;

// 2. Client Factory
export function createHttpClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: TIMEOUT_BUDGETS.STANDARD_API,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true, // Send HttpOnly session / CSRF cookies automatically
  });

  // 3. Telemetry & Distributed Tracing Interceptor
  instance.interceptors.request.use((config) => {
    // Generate W3C Trace Context / Correlation ID per request
    const traceId = crypto.randomUUID();
    config.headers.set('X-Correlation-ID', traceId);
    config.headers.set('X-Request-Timestamp', new Date().toISOString());
    return config;
  });

  return instance;
}

// 3. Export Singleton Instance
export const httpClient = createHttpClient(
  import.meta.env.VITE_API_BASE_URL || '/api'
);
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why is setting an explicit HTTP timeout budget critical in single-page applications, and what happens when Axios uses its default timeout (`0ms` / infinite)?*
2. *How does propagating `X-Correlation-ID` from the React client to Spring Boot enable end-to-end distributed tracing across microservices?*
3. *What are the tradeoffs of using Axios vs a custom wrapper over the native browser `fetch` API?*
