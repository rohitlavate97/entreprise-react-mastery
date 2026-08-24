# Module 21.3 — Production Incident Runbooks Master Matrix

## 1. Runbook A: Browser Heap Memory Leak Triaging
1. **Take Baseline Snapshot:** Open Chrome DevTools $\rightarrow$ Memory $\rightarrow$ Take Heap Snapshot #1 on fresh page load.
2. **Perform Repetitive Action:** Open and close modal 10 times.
3. **Take Post-Action Snapshot:** Take Heap Snapshot #2 $\rightarrow$ Select "Objects allocated between Snapshot 1 and 2".
4. **Identify Detached DOM Nodes:** Filter by `Detached HTMLElement` or `Closure` $\rightarrow$ trace retainer tree to uncleared `addEventListener`, `setInterval`, or global event bus listener.
5. **Apply Fix:** Add cleanup callback in `useEffect(() => { return () => { sub.unsubscribe(); }; }, [])`.

---

## 2. Runbook B: Un-Virtualized Dataset Render Freezes
1. **Measure DOM Node Count:** In Console: `document.querySelectorAll('*').length`. If $> 3,000$ nodes: DOM is overloaded.
2. **Profile Flamegraph:** React DevTools Profiler $\rightarrow$ verify `Commit` phase takes $> 100\text{ms}$.
3. **Replace with Virtualizer:** Wrap list in `@tanstack/react-virtual` with fixed container `overflow: auto` and dynamic `measureElement`.

---

## 3. Runbook C: SSR Hydration Mismatch Resolution
1. **Inspect Console Warning:** Read exact text: `Hydration failed because the server-rendered HTML didn't match the client`.
2. **Locate Divergent Node:** Check for `new Date().toLocaleTimeString()`, `window.innerWidth`, or `localStorage` reads during initial render.
3. **Apply Two-Pass Hydration Pattern:** Guard client-only features behind `const [isMounted, setIsMounted] = useState(false); useEffect(() => setIsMounted(true), []);`.

---

## 4. Runbook D: Flaky CI/CD E2E Test Suite Triaging
1. **Download Playwright Trace:** Open GitHub Actions Artifacts $\rightarrow$ download `trace.zip`.
2. **Open Trace Viewer:** Run `npx playwright show-trace trace.zip`.
3. **Eliminate Hardcoded Sleep:** Replace `page.waitForTimeout(5000)` with web-first assertion `await expect(page.getByRole('button')).toBeVisible()`.

---

## 5. Runbook E: Docker Non-Root Container Boot Failure
1. **Inspect Container Logs:** `docker logs <container-id>`.
2. **Verify Error:** `open() "/var/run/nginx.pid" failed (13: Permission denied)`.
3. **Fix Dockerfile Permissions:** `RUN touch /var/run/nginx.pid && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx`.
