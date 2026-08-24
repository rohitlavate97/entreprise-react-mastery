# Module 16.3 — Content Security Policy (CSP), Nonces & Clickjacking Defense

## 1. WHAT
- **Content Security Policy (CSP):** An HTTP response header (`Content-Security-Policy`) that allows site administrators to restrict the resources (scripts, images, stylesheets, iframes) that the browser is allowed to load and execute for a given page.
- **The Ultimate Defense-in-Depth:** Even if an attacker successfully injects an XSS payload `<script src="https://evil.com/xss.js">` into your DOM, a strict CSP blocks the browser from downloading or executing the script.

```
                    CONTENT SECURITY POLICY ENFORCEMENT
                    
  Attacker injects: <script src="https://evil.com/malware.js"></script>
         │
         ▼
  Browser checks CSP Header:
  Content-Security-Policy: default-src 'self'; script-src 'self';
         │
         ├── Is evil.com allowed by script-src 'self'?
         └── NO ──> Browser BLOCKS execution & sends report to /api/csp-report!
```

---

## 2. PRODUCTION ENTERPRISE CSP HEADER DEFINITION

```nginx
# /etc/nginx/conf.d/security-headers.conf
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://blob.enterprise.com;
  connect-src 'self' https://api.enterprise.com https://*.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
" always;

# Additional Security Headers
add_header X-Frame-Options "DENY" always; # Clickjacking defense
add_header X-Content-Type-Options "nosniff" always; # MIME-sniffing defense
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always; # Force HTTPS
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 3. NONCE-BASED STRICT CSP (SSR / SPA TEMPLATES)

When inline scripts must execute on startup (e.g. bootstrapping server state), generate a cryptographically random, single-use **Nonce** on each page load:

```html
<!-- index.html template (Server-Generated Nonce) -->
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'nonce-rAnd0m123';">

<script nonce="rAnd0m123">
  window.__INITIAL_CONFIG__ = { env: "production" };
</script>
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why is `default-src 'none'` or `default-src 'self'` the most secure starting point for a CSP header?*
2. *What is the difference between `frame-ancestors 'none'` in CSP and the legacy `X-Frame-Options: DENY` header?*
3. *How do you test a strict Content Security Policy in production without breaking user features using `Content-Security-Policy-Report-Only`?*
