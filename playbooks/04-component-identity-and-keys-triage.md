# Playbook PB-004 — React Component Identity & Key Reconciliation Triage

## Objective
Diagnose and eliminate component identity bugs, focus loss, state persistence anomalies, and unmount/remount thrashing in list views, table grids, and multi-step forms.

---

## 1. The 4-Step Key & Identity Triage Checklist

```
[ Step 1: Reproduce Focus Loss or State Corruption ]
  - Does an input lose focus after typing a single character?
  - Does a checkbox or input value attach to the wrong row after deletion or sorting?
             │
[ Step 2: Inspect JSX Key Declarations ]
  - Check the key prop on the list container or element.
  - Is it using the array index (key={index})?
  - Is it using a dynamic generator (key={Math.random()} or key={Date.now()})?
             │
[ Step 3: Verify Unique & Stable Key Source ]
  - Verify that the key comes from an immutable database ID or unique UUID (item.id).
  - Verify key is placed on the outermost JSX element returned inside the .map() loop.
             │
[ Step 4: Validate in React DevTools Profiler ]
  - Record render. Verify component updates props (Blue bar) rather than Unmounting/Mounting (Full tree flash).
```
