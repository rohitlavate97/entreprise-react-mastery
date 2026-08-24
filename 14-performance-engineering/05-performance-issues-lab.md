# Module 14.5 — Performance Issues Lab (PERF-001 to PERF-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for frontend performance engineering.

---

## 🔬 PERF-001: Mounting 10,000 Un-Virtualized DOM Nodes Freezing Browser

- **Severity:** 🔴 Critical
- **Environment:** Production (Data Grids)
- **Symptoms:** User clicks "All Transactions", page freezes for 8 seconds, scrolling drops to 4 fps, browser memory spikes by 400MB.
- **Root Cause:** Standard `.map()` rendering 10,000 table rows with 6 columns $= 60,000$ real DOM nodes.
- **Fix:** Implement DOM windowing via `@tanstack/react-virtual` (renders only 20 active rows).

---

## 🔬 PERF-002: Barrel Import Pulling Entire 2MB Icon Library into Initial Chunk

- **Severity:** 🔴 High
- **Environment:** Production Bundle
- **Symptoms:** Initial JavaScript bundle size is 3.4MB. Lighthouse Performance score drops to 32.
- **Root Cause:** `import { Check, User, Search } from 'lucide-react'` caused bundler to include all 1,400 SVG icons.
- **Fix:** Use direct icon path imports or configure Vite `optimizeDeps.include`.

---

## 🔬 PERF-003: LCP Hero Image Tagged with `loading="lazy"`

- **Severity:** 🔴 High (SEO & Core Web Vitals)
- **Environment:** Production (Landing Pages)
- **Symptoms:** Largest Contentful Paint (LCP) is 4.8 seconds (Poor rating in Search Console).
- **Root Cause:** Developer applied `loading="lazy"` indiscriminately to all images. The browser delayed downloading the above-the-fold hero image until after layout calculation.
- **Fix:** Remove `loading="lazy"`, add `fetchpriority="high"`, and inject `<link rel="preload" as="image" href="/hero.webp">`.

---

## 🔬 PERF-004: Cumulative Layout Shift (CLS = 0.45) on Dynamic Banner

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** User attempts to click a button, but a late-loading promo banner injects at the top of the page, pushing the button down and causing the user to misclick.
- **Root Cause:** Dynamic banner container rendered with height `0px` before data arrived, then expanded abruptly.
- **Fix:** Reserve fixed height / `aspect-ratio` skeleton space before the banner loads.

---

## 🔬 PERF-005: INP Spike (950ms) on Keystroke Filtering

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Interaction to Next Paint (INP) is 950ms. Users report sluggish typing in search inputs.
- **Root Cause:** `onChange` handler synchronously runs `items.filter()` over 30,000 items on the main thread.
- **Fix:** Wrap list state update in `React.startTransition()` and debounce input.

---

## 🔬 PERF-006: Inline Object Prop Invalidating `React.memo` Across 200 Rows

- **Severity:** 🟡 Medium
- **Environment:** Production (Table Components)
- **Symptoms:** Typing in a page filter causes all 200 visible rows to re-render, despite being wrapped in `React.memo`.
- **Root Cause:** Parent passed `style={{ color: 'blue' }}` (a new object reference on every render) to child props.
- **Fix:** Move object outside component scope or use `useMemo`.

---

## 🔬 PERF-007: Heavy Client-Side CSV Export Freezing UI for 5 Seconds

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Clicking "Export CSV" completely freezes the UI; animated loading spinner stops spinning.
- **Root Cause:** Synchronously formatting 100,000 records into CSV string on the main JavaScript thread.
- **Fix:** Offload formatting to a Web Worker or use `yieldToMain()` chunked processing.

---

## 🔬 PERF-008: Full Table Re-render on Single Row Selection

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Clicking a checkbox in Row #4 renders all 100 rows in the table.
- **Root Cause:** Row callback was passed as `onSelect={() => handleSelect(row.id)}` creating 100 new closures per render.
- **Fix:** Pass stable `useCallback` handler and let the child pass its own `id` on click.
