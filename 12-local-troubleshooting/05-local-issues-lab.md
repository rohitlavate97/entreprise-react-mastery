# Module 12.5 — Local Development Issues Lab (LOCAL-001 to LOCAL-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for React local development.

---

## 🔬 LOCAL-001: Duplicate React Instance Causing "Invalid Hook Call" Error

- **Severity:** 🔴 Critical
- **Environment:** Local Development (Monorepo / `npm link`)
- **Symptoms:** App crashes on boot with `Invalid hook call. Hooks can only be called inside of the body of a function component.`
- **Root Cause:** Two copies of `react` loaded in `node_modules`.
- **Fix:** Add `resolve.dedupe: ['react', 'react-dom']` in `vite.config.ts`.

---

## 🔬 LOCAL-002: Missing `VITE_` Prefix Causing `undefined` in Production Bundle

- **Severity:** 🔴 High
- **Environment:** Production Build
- **Symptoms:** `API_URL` works in local dev using custom server, but compiles to `undefined` in production Docker image.
- **Root Cause:** Vite strictly ignores environment variables that do not start with `VITE_`.
- **Fix:** Rename to `VITE_API_URL` and validate with Zod on app startup.

---

## 🔬 LOCAL-003: Vite HMR WebSocket Failure Behind Corporate VPN / Docker

- **Severity:** 🟡 Medium
- **Environment:** Local Development (Corporate VPN / Docker)
- **Symptoms:** Code changes do not hot-reload; console logs WebSocket connection errors.
- **Root Cause:** WebSocket port is blocked or Docker container doesn't map port 5173 for HMR.
- **Fix:** Configure `server.hmr.clientPort: 5173` and `server.host: '0.0.0.0'`.

---

## 🔬 LOCAL-004: Silent Port Switching Breaking OAuth Callback URLs

- **Severity:** 🟡 Medium
- **Environment:** Local Development
- **Symptoms:** Vite starts on port `5174` because another process holds `5173`. OAuth login fails with `Redirect URI mismatch` (expected `5173`).
- **Root Cause:** Vite defaults to trying the next available port.
- **Fix:** Set `server.strictPort: true` to fail loudly if `5173` is busy.

---

## 🔬 LOCAL-005: File Watcher Silent Failure on Windows WSL2 / Docker Volumes

- **Severity:** 🟡 Medium
- **Environment:** Windows (WSL2 / Docker)
- **Symptoms:** Editing files in VS Code does not trigger rebuilds.
- **Root Cause:** Inotify events do not propagate across Windows-to-WSL2/Linux filesystem boundaries.
- **Fix:** Add `server.watch.usePolling: true` in `vite.config.ts`.

---

## 🔬 LOCAL-006: Lockfile Drift Failing CI/CD `npm ci` Pipeline

- **Severity:** 🔴 High
- **Environment:** CI/CD Build
- **Symptoms:** Local `npm run build` succeeds, but GitHub Actions CI fails with `npm ERR! code EUSAGE / npm ci can only install with existing package-lock.json`.
- **Root Cause:** Developer modified `package.json` directly without committing updated `package-lock.json`.
- **Fix:** Run `npm install` locally and commit the updated `package-lock.json`.

---

## 🔬 LOCAL-007: Circular Barrel Import Breaking esbuild Pre-bundling

- **Severity:** 🔴 High
- **Environment:** Local Development
- **Symptoms:** Vite dev server startup hangs or throws `Uncaught ReferenceError: Cannot access 'X' before initialization`.
- **Root Cause:** `index.ts` re-exports component A, which imports from `index.ts` to get component B.
- **Fix:** Use direct relative imports between internal siblings; use `madge --circular` to verify.

---

## 🔬 LOCAL-008: Vite Dev Proxy Returning 500 ECONNREFUSED

- **Severity:** 🟡 Medium
- **Environment:** Local Development
- **Symptoms:** API calls return `500 Internal Server Error [vite] http proxy error: ECONNREFUSED 127.0.0.1:8080`.
- **Root Cause:** Spring Boot backend has not finished starting up or is bound to IPv6 `::1` while Vite connects to IPv4 `127.0.0.1`.
- **Fix:** Target `http://127.0.0.1:8080` explicitly in `vite.config.ts` proxy target.
