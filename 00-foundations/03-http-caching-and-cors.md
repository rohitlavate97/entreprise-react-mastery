# Module 0.3 — HTTP Networking, Caching Headers & CORS Mechanics

## 1. WHAT
- **HTTP Networking Lifecycle:** The complete multi-layer protocol exchange connecting the browser client to the backend server:
  $$\text{DNS Lookup} \xrightarrow{} \text{TCP Handshake (SYN/ACK)} \xrightarrow{} \text{TLS Negotiation (HTTPS)} \xrightarrow{} \text{HTTP Request} \xrightarrow{} \text{Server Processing} \xrightarrow{} \text{HTTP Response}$$
- **HTTP Caching:** Protocol directives governing whether and for how long the browser or intermediary CDNs may store responses before re-requesting from the origin server.
- **CORS (Cross-Origin Resource Sharing):** A browser-enforced security mechanism that restricts a web page from making HTTP requests to a different **Origin** ($\text{Protocol} + \text{Host} + \text{Port}$) than the one that served the web page, unless the target server explicitly declares permission via specific HTTP response headers.

```
React App Origin: http://localhost:5173 
Target API Origin: http://localhost:8080 (Different port -> Different Origin!)

Browser: Non-Simple Request (e.g. JSON with Authorization Header)
   │
   ├─► 1. OPTIONS Preflight Request ────────────────────────► Spring Boot Server
   │      Origin: http://localhost:5173
   │      Access-Control-Request-Method: POST
   │      Access-Control-Request-Headers: authorization, content-type
   │
   ├─◄ 2. OPTIONS Preflight Response ◄───────────────────────
   │      Access-Control-Allow-Origin: http://localhost:5173
   │      Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   │      Access-Control-Allow-Headers: authorization, content-type
   │
   │ (Browser verifies headers match; now allows real request)
   │
   ├─► 3. Actual POST /api/orders Request ──────────────────►
   │      Authorization: Bearer <token>
   │      {"productId": 101, "qty": 2}
   │
   └─◄ 4. Real HTTP 200/201 Response ◄──────────────────────
```

---

## 2. WHY
Why deep HTTP & CORS knowledge is required for React + Spring Boot engineers:
1. **The #1 Enterprise Deployment Roadblock:** Over 70% of initial production and staging deployments fail due to CORS header mismatches, proxy rewrites, or preflight authentication blocks.
2. **SPA Asset Invalidation:** Incorrect `Cache-Control` headers on `index.html` cause users to remain stuck on outdated, broken frontend bundles after a new production release.
3. **Authentication Integrity:** Understanding cookie scopes, `SameSite`, and `Secure` attributes prevents authentication cookies from being silently dropped by the browser.

---

## 3. INTERNAL MENTAL MODEL

### A. HTTP Caching Directives
- `Cache-Control: no-store` $\rightarrow$ Do not cache anywhere. Used for sensitive banking data or dynamic API responses.
- `Cache-Control: no-cache` $\rightarrow$ Store in cache, but **must revalidate** with origin server (using ETag/If-None-Match) before using. **Mandatory for `index.html` in SPAs.**
- `Cache-Control: public, max-age=31536000, immutable` $\rightarrow$ Cache forever (1 year) without revalidation. **Mandatory for hashed static assets (`bundle.a8f9b2.js`, `style.4d1c9e.css`).**
- `ETag` $\rightarrow$ Content hash returned by server. Browser sends `If-None-Match: "<hash>"` on subsequent requests; server responds with `304 Not Modified` (saving bandwidth).

### B. Cookie Security Attributes
- `HttpOnly` $\rightarrow$ Inaccessible to JavaScript `document.cookie`. Protects against XSS token theft.
- `Secure` $\rightarrow$ Transmitted **only** over HTTPS connections.
- `SameSite=Strict` $\rightarrow$ Cookie is never sent on cross-site requests (highest CSRF protection).
- `SameSite=Lax` $\rightarrow$ Cookie is sent on top-level cross-site navigations (default in modern browsers).
- `SameSite=None` $\rightarrow$ Cookie is sent on all cross-site requests (requires `Secure` attribute).

### C. CORS: Simple vs Preflighted Requests
A request triggers an **OPTIONS Preflight** if ANY of the following apply:
1. HTTP Method is NOT `GET`, `HEAD`, or `POST`.
2. `Content-Type` is NOT `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` (e.g., `application/json` triggers preflight).
3. Custom request headers are present (e.g., `Authorization`, `X-Request-ID`, `X-Correlation-ID`).

---

## 4. SPRING BOOT & NGINX CONFIGURATION MATRIX

### Production-Ready Spring Boot CORS Configuration
```java
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. MUST integrate CORS before Spring Security filters
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Only disable if using Bearer tokens (see Security module)
            .authorizeHttpRequests(auth -> auth
                // 2. Preflight OPTIONS requests MUST be permitted without authentication
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // NEVER use allowedOrigins("*") when allowCredentials is true!
        config.setAllowedOrigins(List.of("https://app.enterprise.com", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Request-ID", "Accept"));
        config.setExposedHeaders(List.of("X-Total-Count", "X-Correlation-ID"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", sourceConfig -> config);
        return source;
    }
}
```

### Production Nginx Reverse Proxy SPA Configuration
```nginx
server {
    listen 80;
    server_name app.enterprise.com;
    root /usr/share/nginx/html;
    index index.html;

    # 1. NEVER CACHE index.html (Ensures new deploys are loaded immediately)
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        expires -1;
    }

    # 2. CACHE HASHED ASSETS FOREVER
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # 3. SPA ROUTING FALLBACK
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 4. REVERSE PROXY TO SPRING BOOT (Eliminates CORS entirely in production!)
    location /api/ {
        proxy_pass http://spring-boot-backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. COMMON MISTAKES
1. **Configuring `@CrossOrigin` but omitting Spring Security CORS:** `@CrossOrigin` on controllers runs *after* the Spring Security filter chain. Unauthenticated OPTIONS requests hit Security filters first and receive `401/403`, failing CORS in the browser.
2. **Combining `Access-Control-Allow-Origin: *` with `withCredentials: true`:** Browsers strictly block this combination for security reasons.
3. **Caching `index.html` with immutable headers:** Users stay on old JavaScript bundles permanently after deployment.
4. **Expecting `fetch()` to reject on 4xx/5xx:** `fetch()` only rejects on network failures, not on HTTP 401, 403, 404, or 500 status codes.

---

## 6. DEBUGGING PROCESS (Senior Engineer Workflow)
1. Open **Chrome DevTools** -> **Network** tab.
2. Filter by `Fetch/XHR` or `Doc`.
3. Check the failing request:
   - Is there an `OPTIONS` request preceding it?
   - What is the status of the `OPTIONS` request? (If `401/403`, Spring Security blocked preflight).
   - Inspect Response Headers of `OPTIONS`: Is `Access-Control-Allow-Origin` present and matching the exact `Origin` header from Request Headers?
   - Does `Access-Control-Allow-Headers` list all headers sent in `Access-Control-Request-Headers`?
4. In Console: Inspect exact CORS error string (e.g., `MissingAllowOriginHeader`, `DisallowedByPreflightResponse`, `WildcardOriginNotAllowedWithCredentials`).

---

## 7. ROOT CAUSE ANALYSIS MATRIX

| Error Symptom | Real Root Cause | Exact Fix |
|---|---|---|
| `OPTIONS 403 Forbidden` | Spring Security requires auth on preflight | Add `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` |
| `Wildcard origin not allowed with credentials` | Backend returned `*` while React sent `credentials: 'include'` | Replace `*` with explicit allowed origin list in backend |
| Browser serves old JS bundle after deployment | `index.html` was cached by browser/CDN | Set `Cache-Control: no-cache, no-store` on `index.html` |
| Duplicate `Access-Control-Allow-Origin` header | Both Nginx and Spring Boot added CORS headers | Remove CORS headers from Nginx if Spring Boot handles them (or vice versa) |

---

## 8. EXPERT INTERVIEW QUESTIONS
1. *Why does the browser send an OPTIONS preflight request for an `application/json` POST request with an Authorization header, but not for a standard HTML form submission?*
2. *Why is serving `index.html` with `Cache-Control: no-cache` essential for modern single-page applications with hashed JS assets?*
3. *If a reverse proxy rewrites paths from `/api/v1/users` to `/users`, how can that break CORS and cookie handling between React and Spring Boot?*
