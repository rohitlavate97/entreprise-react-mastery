# Module 12.4 — Local Proxy Architecture & Full-Stack CORS Bypass

## 1. WHAT
- **Vite Local Dev Proxy:** A built-in HTTP reverse proxy inside the Vite development server that forwards local frontend requests (e.g. `http://localhost:5173/api/*`) to a backend server (e.g. `http://localhost:8080/api/*`).
- **Why Dev Proxy is Recommended:**
  1. **Zero Local CORS Issues:** The browser perceives all requests as Same-Origin (`localhost:5173`). No preflight `OPTIONS` requests or CORS headers are required.
  2. **Cookie Handling:** `HttpOnly; SameSite=Strict` cookies work seamlessly because the browser sees frontend and backend sharing the identical origin.

```
                    VITE LOCAL PROXY ARCHITECTURE
                    
  Browser (Client)
  Origin: http://localhost:5173
         │
         ├── GET /src/App.tsx ───────────> [ Vite Dev Server (:5173) ] ──> Serves React TSX
         │
         └── POST /api/orders ───────────> [ Vite Dev Server (:5173) ]
             (Same-Origin to browser!)           │ (Proxies request over localhost)
                                                 ▼
                                           [ Spring Boot Backend (:8080) ]
```

---

## 2. PRODUCTION VITE PROXY CONFIGURATION

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy REST API calls
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false, // Allow self-signed certs if Spring Boot runs on local HTTPS
        // Optional rewrite if backend doesn't use /api prefix:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy WebSocket / STOMP connections
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
      },
    },
  },
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does using Vite's development proxy eliminate the need for CORS configuration during local development?*
2. *What does the `changeOrigin: true` setting do under the hood when forwarding requests to Spring Boot?*
3. *Why does dev proxy behavior differ from production Nginx reverse proxy routing, and how do you ensure parity?*
