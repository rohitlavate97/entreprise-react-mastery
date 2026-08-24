# Module 12.1 — Vite Build Diagnostics, HMR Failures & Path Aliases

## 1. WHAT
- **Vite Dev Server:** An unbundled development server that serves source code over native ES Modules (ESM) in the browser, using **esbuild** for fast pre-bundling of CommonJS dependencies.
- **Hot Module Replacement (HMR):** A development mechanism that updates changed modules in the running browser application via a WebSocket connection without performing a full page reload or resetting component state.

```
                    VITE HMR WEBSOCKET CONNECTION
                    
  Developer saves File.tsx ──> Vite Server (watches filesystem)
                                     │
                                     ▼ (HMR Update Message)
  Browser (Client Runtime) <──[ ws://localhost:5173/ ]
  • Intercepts update
  • Swaps module in memory
  • Preserves React component state (Fast Refresh)
```

---

## 2. COMMON VITE LOCAL FAILURE MODES & FIXES

### 1. HMR WebSocket Connection Failed (Corporate VPN / Docker / Proxy)
- **Symptom:** Saving a file does not update the browser; browser console shows `WebSocket connection to 'ws://localhost:5173/' failed: Error in connection establishment`.
- **Fix in `vite.config.ts`:**
  ```typescript
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: true, // Fail if port is occupied rather than silently switching to 5174
    hmr: {
      clientPort: 5173, // Enforce explicit port for reverse proxy / Docker mapping
    },
    watch: {
      usePolling: true, // Required for WSL2 or Docker mounted volumes on Windows
    },
  }
  ```

### 2. Path Alias Mismatch (`@/` works in Vite but fails in TypeScript or vice versa)
- **Symptom:** `Cannot find module '@/features/orders'` in IDE or build failure.
- **Fix (Dual Alignment):**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *How does Vite's unbundled native ESM dev server achieve instant server startup compared to Webpack's full-bundle approach?*
2. *Why does Vite require matching alias path definitions in both `tsconfig.json` and `vite.config.ts`?*
3. *Why does file change detection fail in WSL2 / Docker on Windows, and how does `usePolling: true` resolve it?*
