# Module 10.2 — Interceptor Pipeline Architecture & Silent Token Refresh Mutex

## 1. WHAT
- **HTTP Interceptor Pipeline:** A middleware chain executed before a request is transmitted and immediately after a response is received from the server.
- **Silent Token Refresh Mutex:** A synchronization mechanism in the response interceptor that intercepts `401 Unauthorized` responses, halts all concurrent incoming requests in a **pending queue**, fires a single refresh token request, and then replays all queued requests with the newly minted access token.

```
                   CONCURRENT 401 TOKEN REFRESH RACE CONDITION
                   
  ❌ WITHOUT QUEUE (10 Parallel 401s -> 10 Simultaneous Refresh Calls):
  Request 1 (401) ──> POST /auth/refresh (Token A) ──> Replaces Token A with Token B
  Request 2 (401) ──> POST /auth/refresh (Token A) ──> ❌ 401 Invalid Refresh Token! (Token A already rotated)
  User gets logged out unexpectedly!
  
  ---------------------------------------------------------------------------------------------------------
  
  ✅ WITH MUTEX & PENDING QUEUE (Single Refresh -> Replay All):
  Request 1 (401) ──> Acquires Mutex Lock ──> POST /auth/refresh ──> Token B Issued ──> Releases Lock
  Request 2 (401) ──> Paused in Queue ─────────────────────────────────^ (Retried with Token B)
  Request 3 (401) ──> Paused in Queue ─────────────────────────────────^ (Retried with Token B)
```

---

## 2. PRODUCTION IMPLEMENTATION: THREAD-SAFE REFRESH INTERCEPTOR

```typescript
// shared/api/authInterceptor.ts
import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@/features/auth/model/authStore';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export function setupAuthInterceptors(httpClient: AxiosInstance) {
  // 1. Request Interceptor: Inject Access Token
  httpClient.interceptors.request.use((config) => {
    const accessToken = authStore.getState().accessToken;
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  });

  // 2. Response Interceptor: Handle 401 & Silent Refresh
  httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Ignore errors that are NOT 401 or requests that already retried once
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // If we got a 401 from the refresh endpoint itself -> Force Logout
      if (originalRequest.url?.includes('/auth/refresh')) {
        authStore.getState().logout();
        return Promise.reject(error);
      }

      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
              resolve(httpClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Fire single refresh call (HttpOnly refresh cookie sent automatically)
        const response = await httpClient.post<{ accessToken: string }>('/auth/refresh');
        const newAccessToken = response.data.accessToken;

        // Store new access token in memory
        authStore.getState().setAccessToken(newAccessToken);

        // Resume all queued requests with new token
        processQueue(null, newAccessToken);

        // Replay original request
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or revoked -> Flush queue with error and logout
        processQueue(refreshError, null);
        authStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What happens during Refresh Token Rotation when multiple concurrent requests trigger 401 simultaneously without a mutex queue?*
2. *Why should JWT access tokens be stored in memory rather than `localStorage` or `sessionStorage`?*
3. *How do you prevent an infinite 401 retry loop if the `/auth/refresh` endpoint itself returns 401?*
