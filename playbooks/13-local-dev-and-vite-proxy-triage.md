# Playbook PB-013 — Local Development Environment & Vite Proxy Triage

## Objective
Provide an operational triage workflow for diagnosing Vite dev server failures, HMR disconnections, duplicate React instances, and local proxy routing issues.

---

## 1. Duplicate React Instance ("Invalid Hook Call") Triage

```
[ Step 1: Check for Multiple Copies ]
  - Run terminal command: npm ls react
  - Are there 2+ distinct paths showing react@18/19?
             │
[ Step 2: Configure Vite Deduplication ]
  - Add to vite.config.ts:
    resolve: {
      dedupe: ['react', 'react-dom']
    }
             │
[ Step 3: Clear Vite & Node Cache ]
  - Delete node_modules/.vite
  - Restart dev server with: npm run dev -- --force
```

---

## 2. Vite HMR WebSocket Disconnection Triage

```
[ Step 1: Inspect Browser Console ]
  - Is WebSocket failing on ws://localhost:5173/ or random port?
             │
[ Step 2: Check Port & Host Bindings ]
  - Add to vite.config.ts:
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: { clientPort: 5173 }
    }
             │
[ Step 3: Windows WSL2 / Docker Polling ]
  - If files don't update on save, add: server.watch: { usePolling: true }
```

---

## 3. Local Proxy 500 ECONNREFUSED Triage

```
[ Step 1: Verify Spring Boot Status ]
  - Open terminal: curl http://127.0.0.1:8080/actuator/health
  - If failing: Spring Boot is not running or crashed on startup.
             │
[ Step 2: IPv4 vs IPv6 Alignment ]
  - Change proxy target from 'http://localhost:8080' to 'http://127.0.0.1:8080'.
  - Verify Spring Boot server.address is bound to 0.0.0.0 or 127.0.0.1.
```
