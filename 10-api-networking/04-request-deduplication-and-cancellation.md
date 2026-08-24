# Module 10.4 — In-Flight Request Deduplication & Signal Cancellation

## 1. WHAT
- **In-Flight Request Deduplication:** Merging identical concurrent read requests into a single network round-trip. If 5 distinct UI widgets on a dashboard all request `GET /api/currentUser` simultaneously upon mount, the network layer executes **one** HTTP call and distributes the single resulting Promise to all 5 callers.
- **Request Cancellation:** Aborting in-flight HTTP requests when the initiating component unmounts or when search input changes, saving client bandwidth and freeing server CPU threads.

```
                    IN-FLIGHT DEDUPLICATION PIPELINE
                    
  Widget A (Mounts)  ──> GET /api/user ──┐
  Widget B (Mounts)  ──> GET /api/user ──┼──> [ In-Flight Cache Map ] ──> Single HTTP Request:
  Widget C (Mounts)  ──> GET /api/user ──┘   (dedupKey: "GET:/api/user")    GET /api/user
                                                                                │
  All 3 widgets receive the exact same resolved data simultaneously! <─────────┘
```

---

## 2. PRODUCTION IMPLEMENTATION: PROMISE DEDUPLICATOR & ABORT CONTROLLER

```typescript
// shared/api/deduplicator.ts
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const inFlightRequests = new Map<string, Promise<AxiosResponse<any>>>();

export function generateRequestKey(config: AxiosRequestConfig): string {
  const method = config.method?.toUpperCase() || 'GET';
  const url = config.url || '';
  const params = JSON.stringify(config.params || {});
  return `${method}:${url}:${params}`;
}

export function deduplicatedGet<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const method = config?.method?.toUpperCase() || 'GET';

  // ONLY deduplicate safe, idempotent GET requests
  if (method !== 'GET') {
    return client.request<T>({ url, ...config });
  }

  const key = generateRequestKey({ url, ...config });

  // If identical request is already in-flight, return existing Promise!
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<AxiosResponse<T>>;
  }

  // Otherwise, create new request and store Promise in map
  const requestPromise = client
    .get<T>(url, config)
    .finally(() => {
      // Clear from in-flight map immediately upon settlement (success or error)
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why should request deduplication ONLY apply to GET/HEAD requests and NEVER to POST/PATCH requests?*
2. *How does `AbortController.abort()` stop browser network consumption compared to ignoring the resolved Promise?*
3. *What happens if an in-flight Promise rejection is shared across 5 components without individual `.catch()` boundaries?*
