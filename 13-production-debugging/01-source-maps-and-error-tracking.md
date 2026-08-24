# Module 13.1 — Production Source Maps, De-Minification & Sentry Integration

## 1. WHAT
- **Source Maps:** JSON files (`.js.map`) that map minified, obfuscated, and bundled production JavaScript code (e.g. `e.t(n) at a.js:1:482`) back to the original TypeScript source files (e.g. `OrderForm.tsx:L42`).
- **Hidden Source Maps (`build.sourcemap: 'hidden'`):** A production build configuration where source maps are generated and uploaded directly to an error tracking service (Sentry / Datadog) via CI/CD, but the `//# sourceMappingURL=` comment is stripped from public `.js` files so competitors cannot view your source code.

```
                 SOURCE MAP SECURITY & DE-MINIFICATION
                 
  ❌ PUBLIC SOURCE MAPS (Security Risk):
  Browser downloads bundle.js ──> Sees "//# sourceMappingURL=bundle.js.map"
                              ──> Downloads bundle.js.map
                              ──> Competitor opens DevTools and reads entire raw TypeScript source!
  
  --------------------------------------------------------------------------------------------------
  
  ✅ HIDDEN SOURCE MAPS + SENTRY CLI (Enterprise Standard):
  1. Vite builds with sourcemap: 'hidden' (no sourceMappingURL comment in public JS).
  2. CI/CD uploads .map files directly to private Sentry instance via @sentry/vite-plugin.
  3. CI/CD deletes .map files from dist/ before deploying dist/ to public Nginx/CDN.
  4. Public users only get minified JS. Sentry displays 100% de-minified TypeScript call stacks!
```

---

## 2. PRODUCTION IMPLEMENTATION: VITE SENTRY PLUGIN CONFIGURATION

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    // Upload source maps to Sentry during CI build
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.VITE_APP_RELEASE_VERSION || '1.0.0',
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ['dist/**/*.map'], // Deletes maps before Nginx deploy!
      },
    }),
  ],
  build: {
    sourcemap: 'hidden', // Generate maps without public comment references
  },
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What is the difference between `sourcemap: true`, `sourcemap: 'inline'`, and `sourcemap: 'hidden'` in Vite?*
2. *Why must source map files be deleted from the `dist/` directory before deploying to a public CDN?*
3. *How does Sentry match incoming minified browser stack traces to the correct uploaded release source maps?*
