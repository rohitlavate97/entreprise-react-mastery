# Module 0.5 — Browser & Networking Issues Lab (BROWSER-001 to BROWSER-008)

This lab contains practical, evidence-driven failure modes, exact reproduction steps, DevTools investigation paths, root-cause analyses, and permanent fixes.

---

## 🔬 BROWSER-001: Old Cached Assets Served After Deployment

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** A new frontend version is deployed with critical bug fixes, but users still experience the old bugs and see old UI versions unless they perform a hard refresh (`Ctrl + F5`).
- **Reproduction Steps:**
  1. Deploy version 1.0.0 with `index.html` configured with default Nginx caching (`max-age=3600`).
  2. User visits site and loads `index.html` referencing `main.v1.js`.
  3. Deploy version 2.0.0 (where `index.html` references `main.v2.js`).
  4. User navigates to the site again via standard URL entry.
- **Expected:** Browser fetches new `index.html` and loads `main.v2.js`.
- **Actual:** Browser serves cached `index.html` from disk cache, which attempts to load `main.v1.js` (or fails).
- **How to Investigate:**
  - Open DevTools -> **Network** tab.
  - Select the `index.html` request.
  - Check **Size** column: says `(disk cache)` or `(memory cache)`.
  - Check Response Headers: `Cache-Control: public, max-age=3600`.
- **Root Cause:** The HTML entry point (`index.html`) was cached with a positive `max-age`. Because `index.html` contains the hashes for JS chunks, caching it locks the client into old asset hashes.
- **Fix:**
  ```nginx
  location = /index.html {
      add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
      expires -1;
  }
  ```
- **Prevention:** Enforce in CI/CD that `index.html` is uploaded with `Cache-Control: no-cache, no-store` metadata in S3/CloudFront/Nginx.

---

## 🔬 BROWSER-002: JavaScript Bundle 404 After Deployment (Hash Changed)

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Users currently active on the site experience blank pages or console errors (`Loading chunk 4 failed`, `ChunkLoadError`) when navigating to a new route after a backend/frontend deployment.
- **Reproduction Steps:**
  1. User loads the app at `/dashboard` (loads `index.html` and `dashboard.hashA.js`).
  2. Deployment pipeline builds a new version and deletes old build files on the server.
  3. User clicks link to `/settings` (a React `lazy()` route).
  4. React Router attempts to fetch `settings.hashA.js`.
  5. Server returns `404 Not Found`.
- **Root Cause:** The build hash of the lazy chunk changed in the new deployment, and the previous deployment's hashed chunk files were immediately deleted from the static server.
- **Fix:**
  1. **Deployment Storage:** Retain previous version chunks in the static asset directory / S3 bucket for at least 24-48 hours.
  2. **React Error Boundary Recovery:**
     ```tsx
     export function LazyRouteErrorBoundary({ error, resetErrorBoundary }: any) {
       if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
         return (
           <div className="p-6 text-center">
             <h2>Application Updated</h2>
             <p>A new version of the app is available.</p>
             <button onClick={() => window.location.reload()} className="btn-primary">
               Refresh Page
             </button>
           </div>
         );
       }
       throw error;
     }
     ```

---

## 🔬 BROWSER-003: Wrong MIME Type Blocks Script Execution

- **Severity:** 🔴 High
- **Environment:** Staging / Production
- **Symptoms:** Blank screen. Browser console logs:
  `Refused to execute script from 'https://app.enterprise.com/assets/main.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.`
- **How to Investigate:**
  - Network tab -> click `main.js`.
  - Look at **Response**: It returned the content of `index.html` instead of JavaScript.
  - Look at **Status**: `200 OK` (with `Content-Type: text/html`).
- **Root Cause:** Nginx SPA fallback `try_files $uri $uri/ /index.html;` intercepted a missing JS file (e.g. wrong path or 404 asset) and served `index.html` with status 200 and MIME `text/html`.
- **Fix:** Ensure static asset rules match explicitly and return 404 for missing assets rather than falling back to `index.html`:
  ```nginx
  location ~* \.(js|css|png|jpg|svg|ico)$ {
      try_files $uri =404;
  }
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

---

## 🔬 BROWSER-004: Mixed Content Blocks HTTP Resource on HTTPS Page

- **Severity:** 🟡 Medium
- **Environment:** Staging / Production
- **Symptoms:** Images, API calls, or fonts fail to load. Browser console logs:
  `Mixed Content: The page at 'https://app.enterprise.com' was loaded over HTTPS, but requested an insecure resource 'http://api.enterprise.com/v1/data'. This request has been blocked; the content must be served over HTTPS.`
- **Root Cause:** The React application is running over secure HTTPS, but an API endpoint or image URL is hardcoded with `http://`. Modern browsers strictly block active mixed content (scripts, XHR/Fetch) and warn on passive mixed content (images).
- **Fix:** Use protocol-relative URLs (`//api.enterprise.com`) or enforce HTTPS in environment variables (`VITE_API_URL=https://api.enterprise.com`).

---

## 🔬 BROWSER-005: Cookie Not Sent (SameSite, Secure, Domain Mismatch)

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** User logs in successfully, but all subsequent API requests return `401 Unauthorized`. Network tab shows no `Cookie` header on outgoing requests.
- **Root Cause & Checklist:**
  1. **Missing `Secure` on HTTPS:** If server sets `Secure;`, cookie is only stored and sent over HTTPS. In local HTTP testing without localhost exception, it is dropped.
  2. **Cross-Site `SameSite=Strict`:** If frontend is on `https://app.company.com` and API is on `https://api.company.com`, they are different subdomains. `SameSite=Strict` may block cookie transfer depending on navigation initiator. Use `SameSite=Lax` or configure Domain attribute: `Domain=.company.com`.
  3. **Missing `credentials: 'include'` in Fetch / Axios:** React must explicitly request cookie inclusion:
     ```ts
     // Axios
     axios.defaults.withCredentials = true;
     // Fetch
     fetch('/api/user', { credentials: 'include' });
     ```

---

## 🔬 BROWSER-006: CORS Preflight Failure Before React Code Runs

- **Severity:** 🔴 Critical
- **Environment:** Production / Local Dev
- **Symptoms:** Network tab shows `OPTIONS /api/v1/orders` with `403 Forbidden` or `401 Unauthorized`. The subsequent `POST` request is marked `(canceled)`. React receives a generic `TypeError: Failed to fetch` or `AxiosError: Network Error`.
- **How to Investigate:**
  - Network tab -> click the red `OPTIONS` request.
  - Look at Status: `403 Forbidden`.
  - Spring Boot logs show: `Access Denied: Full authentication is required to access this resource`.
- **Root Cause:** Spring Security's filter chain intercepted the unauthenticated `OPTIONS` preflight request and rejected it before the CORS filter could evaluate the origin.
- **Fix:** Configure Spring Security to permit all `OPTIONS` requests unconditionally:
  ```java
  http.authorizeHttpRequests(auth -> auth
      .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
      .anyRequest().authenticated()
  );
  ```

---

## 🔬 BROWSER-007: Browser-Specific Rendering & Date Parsing Differences

- **Severity:** 🟡 Medium
- **Environment:** Safari / iOS WebKit
- **Symptoms:** React app displays `NaN/NaN/NaN` or `Invalid Date` on Safari/iOS, while Chrome and Firefox render formatted dates correctly.
- **Root Cause:** Safari's JavaScript engine (`JavaScriptCore`) does not support parsing ISO date strings formatted with space separators (`"2026-08-24 18:30:00"`), whereas V8 (Chrome) parses them leniently.
- **Fix:** Standardize on strict ISO 8601 UTC strings (`"2026-08-24T18:30:00Z"`) from Spring Boot or use `date-fns` / `Temporal` API for robust client-side parsing.

---

## 🔬 BROWSER-008: `localStorage` Unavailable in Private/Incognito Mode

- **Severity:** 🔴 High
- **Environment:** iOS Safari / Firefox Private Mode
- **Symptoms:** React app crashes on load with unhandled error: `QuotaExceededError: The quota has been exceeded` or `SecurityError: The operation is insecure`.
- **Root Cause:** In certain privacy modes or embedded WebViews, calling `window.localStorage.setItem()` throws a runtime exception instead of returning null.
- **Fix:** Always access `localStorage` via a defensive try-catch abstraction with in-memory fallback (as built in Module 0.4 `SafeStorage`).
