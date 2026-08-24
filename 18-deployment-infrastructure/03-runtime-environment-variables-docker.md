# Module 18.3 — Runtime Environment Variable Injection in Containerized React

## 1. WHAT
- **The Container Build vs Runtime Dilemma:**
  - Vite environment variables (`import.meta.env.VITE_API_URL`) are statically evaluated and **baked into JavaScript strings during `npm run build` inside the CI pipeline**.
  - In Kubernetes / Docker enterprise deployments, the **same identical Docker image** must be promoted across Dev $\rightarrow$ QA $\rightarrow$ Staging $\rightarrow$ Prod without rebuilding the image, but each environment requires a different `API_BASE_URL`.
- **The Solution:** Injecting environment variables dynamically at **container startup runtime** via `docker-entrypoint.sh` or a dynamic `window.__RUNTIME_CONFIG__` script.

```
                    RUNTIME CONFIG INJECTION WORKFLOW
                    
  1. CI/CD builds ONE Docker Image (e.g. enterprise-app:v1.2.0).
  2. Kubernetes deploys image to Production with ConfigMap:
     API_BASE_URL=https://api.enterprise.com
     SENTRY_DSN=https://sentry.enterprise.com
     
  3. Docker Entrypoint Script executes before Nginx starts:
     Generates /usr/share/nginx/html/config.js containing:
     window.__RUNTIME_CONFIG__ = {
       API_BASE_URL: "https://api.enterprise.com",
       SENTRY_DSN: "https://sentry.enterprise.com"
     };
     
  4. React App reads window.__RUNTIME_CONFIG__.API_BASE_URL on startup!
```

---

## 2. PRODUCTION IMPLEMENTATION: DOCKER ENTRYPOINT SCRIPT

```bash
#!/bin/sh
# docker-entrypoint.sh
set -e

# Generate runtime config.js from current container environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL:-/api}",
  APP_ENV: "${APP_ENV:-production}",
  SENTRY_DSN: "${SENTRY_DSN:-}",
  RELEASE_VERSION: "${RELEASE_VERSION:-latest}"
};
EOF

echo "[Docker Entrypoint] Generated runtime config.js successfully"

# Execute Nginx foreground command
exec "$@"
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Enterprise App</title>
    <!-- Load runtime config BEFORE main JS bundle executes -->
    <script src="/config.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```typescript
// src/shared/config/runtimeEnv.ts
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_BASE_URL?: string;
      APP_ENV?: string;
      SENTRY_DSN?: string;
      RELEASE_VERSION?: string;
    };
  }
}

export const runtimeConfig = {
  apiBaseUrl: window.__RUNTIME_CONFIG__?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  appEnv: window.__RUNTIME_CONFIG__?.APP_ENV || import.meta.env.VITE_APP_ENV || 'production',
  sentryDsn: window.__RUNTIME_CONFIG__?.SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN,
};
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does the standard 12-Factor App methodology require containerized applications to read configuration from the runtime environment rather than build artifacts?*
2. *Why should `config.js` always be served with `Cache-Control: no-cache` headers?*
3. *What are the security implications of exposing `window.__RUNTIME_CONFIG__` on the client window object?*
