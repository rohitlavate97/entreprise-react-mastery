# Playbook PB-020 — Full-Stack Project Architecture & Monorepo Scaling Triage

## Objective
Provide an operational triage workflow for diagnosing enterprise project architectural bottlenecks, multi-tenant state leaks, high-frequency render thrashing, and optimistic state synchronization conflicts.

---

## 1. Multi-Tenant Cache Leak Triage Workflow

```
[ Step 1: Audit Query Key Architecture ]
  - Verify every query key starts with ['workspace', orgId, ...].
  - Check if any global Zustand/Context stores hold organization-scoped data.
             │
[ Step 2: Enforce Tenant Switch Purge Protocol ]
  - When user switches organizations in UI:
    1. Call queryClient.clear();
    2. Reset active workspace stores;
    3. Navigate to root /workspace/:newOrgId.
```

---

## 2. High-Frequency Real-Time WebSocket Triage

```
[ Step 1: Measure Render Rate ]
  - Open React DevTools Profiler -> Record 5 seconds of WebSocket traffic.
  - If render count > 60/sec: setState is firing on every packet.
             │
[ Step 2: Implement RAF Buffer ]
  - Move raw tick storage to mutable ref: bufferRef.current.push(tick).
  - Flush buffer to React state only inside requestAnimationFrame.
```

---

## 3. Optimistic Concurrency 409 Resolution Triage

```
[ Step 1: Capture State Snapshot in onMutate ]
  - const previous = queryClient.getQueryData(key);
  - return { previous };
             │
[ Step 2: Implement Rollback in onError ]
  - if (context?.previous) queryClient.setQueryData(key, context.previous);
             │
[ Step 3: Trigger Invalidation in onSettled ]
  - queryClient.invalidateQueries(key) to guarantee final alignment with server truth.
```
