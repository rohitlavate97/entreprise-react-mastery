# Module 9.6 — State Management Issues Lab (STATE-001 to STATE-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for enterprise React state management.

---

## 🔬 STATE-001: Stale Cache Overwriting Fresh Mutation Response

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** User edits order notes and clicks Save. The new notes display for 500ms, then suddenly revert to the old notes.
- **Root Cause:** A background refetch (triggered by window refocus or an in-flight query) completed *after* the mutation finished, overwriting the mutation response with old cached data because the query key wasn't invalidated properly.
- **Fix:** Invalidate queries in `onSettled`, and cancel active in-flight queries in `onMutate`.

---

## 🔬 STATE-002: Infinite Refetch Loop in TanStack Query from Inline Object `queryKey`

- **Severity:** 🔴 Critical
- **Environment:** Local / Production
- **Symptoms:** Chrome Network tab shows hundreds of continuous `GET /api/orders` requests per second. Browser tab crashes.
- **Root Cause:** Passing a new inline object reference inside the component body to `queryKey`: `queryKey: ['orders', { status: currentStatus, timestamp: Date.now() }]`.
- **Fix:** Remove dynamic timestamps from query keys; use stable primitive filters.

---

## 🔬 STATE-003: Query Key Collision Across Distinct Tenant Views

- **Severity:** 🔴 Critical (Security & Data Leak)
- **Environment:** Production (Multi-Tenant SaaS)
- **Symptoms:** Tenant A switches organizations and briefly sees Tenant B's customer list.
- **Root Cause:** Query key was simply `['customers']` without including `tenantId` / `orgId` in the key tuple. TanStack Query served the cached data from the previous tenant.
- **Fix:** Scope all multi-tenant queries by tenant ID: `queryKeys.list(tenantId, filters)`.

---

## 🔬 STATE-004: Missing `cancelQueries` in Optimistic Mutation Causing Race Condition

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Optimistic UI rollback fails or flashes corrupted data under slow 3G networks.
- **Root Cause:** `onMutate` did not await `queryClient.cancelQueries({ queryKey })`. An earlier in-flight GET request resolved and overwrote the optimistic state before the POST finished.
- **Fix:** Always `await queryClient.cancelQueries({ queryKey })` as the first line of `onMutate`.

---

## 🔬 STATE-005: Zustand Selector Over-Rendering Due to Missing Shallow Equality

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** React DevTools Profiler shows `<Header />` re-rendering on every user interaction, even though header values haven't changed.
- **Root Cause:** `useUIStore(state => ({ theme: state.theme, user: state.user }))` returns a **new object literal pointer** on every store change.
- **Fix:** Use `useShallow` from `zustand/react/shallow` or use separate atomic selectors.

---

## 🔬 STATE-006: `staleTime: 0` Causing Aggressive Refetch Storms on Window Focus

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Backend servers experience traffic spikes when users switch browser tabs because hundreds of components all refetch simultaneously.
- **Root Cause:** Default `staleTime: 0` treats all data as immediately stale.
- **Fix:** Set a reasonable global `staleTime` (e.g. 60 seconds) in `QueryClient` defaults.

---

## 🔬 STATE-007: `gcTime` Smaller Than `staleTime` Causing Cache Eviction

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** User navigates back to a previously visited page within 2 minutes and sees a blank loading skeleton instead of instant cached data.
- **Root Cause:** Developer configured `staleTime: 1000 * 60 * 5` (5 mins) but set `gcTime: 1000 * 30` (30s). The query was fresh, but got garbage-collected from memory while unmounted!
- **Fix:** `gcTime` must ALWAYS be greater than or equal to `staleTime`.

---

## 🔬 STATE-008: Redux/Zustand Store Containing Duplicated Server Data (Split-Brain Bug)

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** User updates profile in Settings; Header avatar updates, but Sidebar profile still shows old avatar.
- **Root Cause:** Split-brain architecture: Profile data was stored in both TanStack Query cache and a global Zustand store. One got updated, the other didn't.
- **Fix:** Eliminate server data from Zustand. Treat TanStack Query as the single source of truth for all remote server state.
