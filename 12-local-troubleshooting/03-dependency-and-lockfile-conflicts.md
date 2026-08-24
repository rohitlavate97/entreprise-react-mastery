# Module 12.3 — Dependency Conflicts, Lockfile Drift & Duplicate React Instances

## 1. WHAT
- **The "Invalid Hook Call" Error:** One of the most notorious React bugs during local development:
  `Invalid hook call. Hooks can only be called inside of the body of a function component.`
- **The True Root Cause:** When linking a local UI library via `npm link` or in a monorepo workspace, **two separate copies of the `react` package** are loaded into memory simultaneously. React maintains hook state in single module-level variables (`ReactCurrentDispatcher`); when Component A uses Copy 1 and calls a hook from Copy 2, the dispatcher is `null`, throwing the error.

```
                 DUPLICATE REACT INSTANCE FAILURE
                 
  App Root Node Modules:
  node_modules/react (Instance A - initialized with Dispatcher)
           ▲
           │ uses
  <App /> ─┘
  
  Local UI Library (npm link / monorepo):
  packages/ui-kit/node_modules/react (Instance B - Dispatcher is NULL!)
           ▲
           │ uses
  <Button /> calls useState() ──> ❌ Invalid hook call error!
```

---

## 2. HOW TO DIAGNOSE & RESOLVE

### Step 1: Diagnose Multiple React Copies in Terminal
```powershell
npm ls react
```
If you see more than one version or path listed, duplicate instances are present.

### Step 2: Force Vite to Deduplicate React
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'], // Forces Vite to always resolve the root React instance
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
});
```

---

## 3. LOCKFILE DRIFT & CI/CD PREVENTION

- **The Problem:** Developer updates `package.json` manually without running `npm install`, causing `package-lock.json` to drift out of sync.
- **The CI Fix:** Always use `npm ci` (or `pnpm install --frozen-lockfile`) in CI pipelines. `npm ci` throws an immediate build error if `package.json` and `package-lock.json` mismatch, preventing silent dependency regressions.

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why does having two identical versions of React loaded in memory cause the "Invalid Hook Call" exception?*
2. *What is the difference between `npm install` and `npm ci`, and why must `npm ci` be strictly enforced in CI/CD?*
3. *How do `peerDependencies` prevent duplicate package instances in library development?*
