# Module 18.2 — Production Nginx Configuration: Caching, Routing & Compression

## 1. WHAT
- **The SPA Routing Fallback (`try_files`):** Because Single-Page Applications handle routing client-side via JavaScript, direct navigation to `/orders/123` causes the Nginx web server to search for a file at `/usr/share/nginx/html/orders/123`. When no physical file exists, Nginx returns `404 Not Found`. `try_files $uri $uri/ /index.html` instructs Nginx to return `index.html` instead, allowing React Router to boot and render the view.
- **The Two-Tier Caching Strategy:**
  1. **`index.html`:** MUST NEVER BE CACHED (`no-cache, no-store`). When a new version is deployed, returning users must receive the new `index.html` immediately.
  2. **Hashed Assets (`/assets/*.js`, `/assets/*.css`):** CACHED FOREVER (`max-age=31536000, immutable`). Since the filename changes on content edit (`app.a8f2.js`), cached assets are 100% safe to store in the browser for 1 year.

```
                    NIX TWO-TIER CACHING MATRIX
                    
  File Type               Cache-Control Header                      Lifespan
  ──────────────────────────────────────────────────────────────────────────
  index.html              no-cache, no-store, must-revalidate       0 seconds
  /assets/*.[hash].js     public, max-age=31536000, immutable       1 year
  /assets/*.[hash].css    public, max-age=31536000, immutable       1 year
  favicon.ico, robots.txt public, max-age=86400                     1 day
```

---

## 2. PRODUCTION `nginx.conf`

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # 1. Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/x-javascript
        image/svg+xml;

    # 2. Hashed Assets (Immutable 1-Year Cache)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # 3. Static Root (Never Cache index.html)
    location / {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri $uri/ /index.html;
    }

    # 4. Health Check Endpoint
    location /healthz {
        access_log off;
        return 200 "healthy\n";
    }
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does caching `index.html` in browser memory prevent users from receiving production bug fixes?*
2. *How does `try_files $uri $uri/ /index.html` resolve SPA 404 errors on browser page refreshes?*
3. *What is the purpose of the `immutable` directive in the `Cache-Control` header for hashed assets?*
