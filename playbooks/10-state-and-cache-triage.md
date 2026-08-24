# Playbook PB-010 — State Management & Cache Desynchronization Triage

## Objective
Provide an operational triage workflow for diagnosing server-state cache corruption, optimistic rollback failures, infinite query refetch loops, and split-brain client states.

---

## 1. Infinite Query Refetch Loop Triage Workflow

```
[ Step 1: Detect Network Loop ]
  - Check Network Tab: Continuous identical GET requests fired per second.
             │
[ Step 2: Audit Query Key Dependencies ]
  - Is an inline object or array passed directly to queryKey without stable identity?
  - Does queryKey include Date.now(), Math.random(), or unstable closure references?
  - Does queryFn trigger a state update that alters queryKey dependencies?
             │
[ Step 3: Implement Query Key Factory ]
  - Use structured, immutable tuples: ['orders', 'list', { page, status }]
  - Wrap query in useMemo or extract parameters to top of hook.
```

---

## 2. Optimistic Update Rollback & Desynchronization Triage

```
[ Step 1: Check In-Flight Race Conditions ]
  - Did onMutate await queryClient.cancelQueries()?
  - If NOT: earlier GET request overwrote optimistic data before POST finished.
             │
[ Step 2: Verify Snapshot Integrity ]
  - Does onMutate return { previousData } context object?
  - Does onError correctly pass context?.previousData to setQueryData()?
             │
[ Step 3: Enforce onSettled Invalidation ]
  - Always call queryClient.invalidateQueries() in onSettled to guarantee server truth.
```

---

## 3. Split-Brain State & Multi-Tenant Cache Leak Triage

```
[ Step 1: Identify Duplicate Sources of Truth ]
  - Is server data stored in both TanStack Query and Zustand/Redux/Context?
  - Remove server data from client-state stores.
             │
[ Step 2: Multi-Tenant Key Isolation ]
  - Ensure every entity query key includes tenantId / organizationId.
  - Call queryClient.clear() immediately upon user logout or tenant switch.
```
