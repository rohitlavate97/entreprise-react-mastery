# Module 14.3 — Bundle Optimization, Code Splitting & Tree-Shaking Discipline

## 1. WHAT
- **Tree-Shaking:** The dead-code elimination process where modern JavaScript bundlers (Rollup / esbuild) analyze ES Module static `import` / `export` syntax to exclude unused exports from the final production bundle.
- **Manual Vendor Chunking:** Splitting large, rarely changing third-party libraries (`react`, `react-dom`, `@tanstack/react-query`) into independent, long-lived cached HTTP chunks (`vendor-react.[hash].js`), so that releasing a small 1-line business logic change in `App.tsx` does not invalidate the user's cached vendor bundles.

```
                    PRODUCTION BUNDLE CHUNKING
                    
  ❌ MONOLITHIC BUNDLE (Single 2.8MB app.js):
  Developer fixes typo in Button.tsx ──> bundle.[new-hash].js (2.8MB)
  All users must re-download entire 2.8MB library bundle!
  
  -------------------------------------------------------------------------
  
  ✅ OPTIMIZED MANUAL VENDOR SPLITTING:
  ├── vendor-react.[hash].js    (140KB)  <-- Cached for 1 year in browser (immutable)
  ├── vendor-charts.[hash].js   (380KB)  <-- Cached for 1 year
  └── app-pages-orders.[hash].js (18KB)  <-- ONLY this 18KB chunk is re-downloaded!
```

---

## 2. PRODUCTION VITE BUNDLE CONFIGURATION & VISUALIZER

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Generates stats.html visual bundle treemap
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ['react', 'react-dom', 'react-router-dom'],
          vendor_query: ['@tanstack/react-query'],
          vendor_ui: ['lucide-react', 'zod', 'axios'],
        },
      },
    },
  },
});
```

---

## 3. TREE-SHAKING DISCIPLINE: AVOIDING THE BARREL ICON TRAP

```typescript
// ❌ TRAP: Barrel import pulls in all 1,400 icons into bundle (1.8MB overhead!)
import * as Icons from 'lucide-react';
// or
import { Check } from 'lucide-react'; // (If bundler fails tree-shaking barrel file)

// ✅ OPTIMIZED: Direct subpath import
import Check from 'lucide-react/dist/esm/icons/check';
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why does CommonJS `require()` syntax completely disable tree-shaking compared to ES Module `import` syntax?*
2. *What is the `sideEffects: false` flag in `package.json`, and why is it required for aggressive tree-shaking?*
3. *How does browser HTTP/2 multiplexing influence chunk splitting decisions compared to older HTTP/1.1 bundle bundling?*
