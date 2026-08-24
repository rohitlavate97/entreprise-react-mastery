# Module 0.4 — Browser Storage & Client-Side Security

## 1. WHAT
Modern browsers provide four primary client-side storage mechanisms with fundamentally different security boundaries, capacity limits, and lifecycle scopes:
1. **Cookies:** Key-value pairs sent automatically with every matching HTTP request; can be locked with `HttpOnly` against JavaScript access.
2. **`localStorage`:** Synchronous, persistent key-value storage scoped per origin (persists across tab closes and restarts). Fully accessible to all JavaScript on that origin.
3. **`sessionStorage`:** Synchronous, tab-scoped key-value storage (cleared when the specific browser tab is closed).
4. **`IndexedDB`:** Asynchronous, transactional, NoSQL object database for storing large structured client data and blobs (up to hundreds of MBs).

$$\begin{array}{|l|c|c|c|c|}
\hline
\textbf{Mechanism} & \textbf{Max Capacity} & \textbf{Auto-Sent to Server?} & \textbf{JS Accessible?} & \textbf{Primary Attack Vector} \\ \hline
\text{HttpOnly Cookie} & \sim 4\text{ KB} & \text{YES (on matching origin)} & \text{NO} & \text{CSRF (Cross-Site Request Forgery)} \\ \hline
\text{localStorage} & \sim 5-10\text{ MB} & \text{NO} & \text{YES} & \text{XSS (Cross-Site Scripting)} \\ \hline
\text{sessionStorage} & \sim 5\text{ MB} & \text{NO} & \text{YES} & \text{XSS (Tab Scoped)} \\ \hline
\text{IndexedDB} & \sim 50\text{ MB} - 1\text{ GB}+ & \text{NO} & \text{YES} & \text{XSS (Structured Data Leak)} \\ \hline
\end{array}$$

---

## 2. WHY
Why storage and security architecture is critical:
1. **The Fundamental Law of Web Security:** *Anything stored in the browser that JavaScript can read is vulnerable to theft via Cross-Site Scripting (XSS).*
2. **Token Storage Decisions:** Choosing where to store JWT access tokens and refresh tokens determines your application's vulnerability profile (XSS vs CSRF).
3. **Storage Exceptions:** In private/incognito browsing or restricted enterprise environments, `localStorage` can throw `QuotaExceededError` or `SecurityError` during write attempts, crashing unhandled React components.

---

## 3. INTERNAL MENTAL MODEL & ATTACK VECTORS

```
                        ATTACK SCENARIOS & STORAGE DEFENSE
                        
  ┌─────────────────────────┐                ┌─────────────────────────┐
  │      XSS ATTACK         │                │      CSRF ATTACK        │
  │  (Malicious JS Injected)│                │ (Attacker site triggers │
  └────────────┬────────────┘                │  request to your API)   │
               │                             └────────────┬────────────┘
               ▼                                          ▼
   Attempts to read token:                     Browser automatically sends
   - localStorage.getItem('jwt')               cookies unless protected:
   - document.cookie                           - SameSite=Strict / Lax
                                               - Anti-CSRF Token / Header
  ┌─────────────────────────┐                ┌─────────────────────────┐
  │  DEFENSE:               │                │  DEFENSE:               │
  │  - HttpOnly Cookie      │                │  - SameSite=Strict/Lax  │
  │  - In-Memory JS State   │                │  - Custom Request Header│
  │  - Strict CSP Policy    │                │  - Spring CSRF Tokens   │
  └─────────────────────────┘                └─────────────────────────┘
```

---

## 4. SECURE TOKEN STORAGE STRATEGY MATRIX

### Model 1: In-Memory Access Token + HttpOnly Refresh Cookie (Industry Gold Standard)
- **Access Token (15-min lifespan):** Kept strictly in React memory (React state / closure). Inaccessible to XSS scrapers targeting `localStorage`.
- **Refresh Token (7-day lifespan):** Stored in a `HttpOnly; Secure; SameSite=Strict` cookie set by Spring Boot.
- **On Page Reload:** React initiates a silent refresh (`POST /api/auth/refresh`) using the HttpOnly cookie to repopulate the in-memory access token.

---

## 5. CONTENT SECURITY POLICY (CSP) FOR REACT SPAs
Add CSP HTTP response headers via Nginx or Spring Security to prevent unauthorized script execution:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.enterprise.com; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

---

## 6. DEFENSIVE BROWSER STORAGE WRAPPER
Safe `localStorage` adapter that handles incognito quotas, serialization errors, and disabled storage:

```typescript
export class SafeStorage {
  private memoryFallback = new Map<string, string>();

  public setItem(key: string, value: unknown): boolean {
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`[SafeStorage] localStorage unavailable, using memory fallback:`, error);
      this.memoryFallback.set(key, JSON.stringify(value));
      return false;
    }
  }

  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        const memItem = this.memoryFallback.get(key);
        return memItem ? JSON.parse(memItem) : defaultValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  public removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
    this.memoryFallback.delete(key);
  }
}

export const safeStorage = new SafeStorage();
```

---

## 7. EXPERT INTERVIEW QUESTIONS
1. *Why is storing JWT access tokens in `localStorage` considered a severe security risk in enterprise banking applications?*
2. *How does `SameSite=Strict` protect cookie-based authentication from Cross-Site Request Forgery (CSRF) without requiring explicit CSRF tokens?*
3. *What happens when a user opens multiple browser tabs with in-memory authentication vs HttpOnly cookie authentication?*
