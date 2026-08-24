# Module 23.2 — Daily Engineering Learning Journal Template

## 1. PURPOSE
The Daily Learning Journal forces active synthesis, converting passive reading into permanent synaptic retention through code summarization and failure mode documentation.

---

## 2. DAILY JOURNAL TEMPLATE

```markdown
# Daily Mastery Journal — Day [XX] / 30

**Date:** YYYY-MM-DD  
**Topic:** [e.g. TanStack Query Optimistic Updates & Cache Rollbacks]  
**Time Spent:** [e.g. 2 hours]  

---

### 1. First-Principles Concept Mastered (Mental Model)
*Summarize how the mechanism works internally in 3–4 sentences:*
> TanStack Query optimistic mutations bypass network latency by immediately updating the query cache in `onMutate` while capturing a previous snapshot. If the server returns 500 or 409, `onError` restores the snapshot, ensuring UI consistency without full page reloads.

---

### 2. Code Snippet of the Day (Clean Implementation)
```typescript
// Snapshot capture & rollback pattern
onMutate: async (newTodo) => {
  await queryClient.cancelQueries({ queryKey: ['todos'] });
  const previous = queryClient.getQueryData(['todos']);
  queryClient.setQueryData(['todos'], (old: any) => [...old, newTodo]);
  return { previous };
},
onError: (err, newTodo, context) => {
  if (context?.previous) queryClient.setQueryData(['todos'], context.previous);
}
```

---

### 3. Production Failure Mode Explored (Issue Lab Reference)
- **Issue ID:** `STATE-004` (Un-cancelled active queries overwriting optimistic state)
- **Root Cause:** Failing to call `await queryClient.cancelQueries()` before updating cache allowed an older in-flight GET query to overwrite the optimistic update.
- **Permanent Fix:** Always cancel outgoing queries at the start of `onMutate`.

---

### 4. Open Questions & Tomorrow's Goal
- [ ] *Why does Axios request cancellation require `AbortController` in modern browsers instead of the legacy `CancelToken`?*
- [ ] *Tomorrow's Focus: Full-Stack Spring Boot 3 Split-Token Authentication.*
```
