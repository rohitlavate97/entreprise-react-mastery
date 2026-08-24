# Module 4.2 — Reconciliation Algorithm & Fiber Diffing Heuristics

## 1. WHAT
- **Reconciliation Algorithm:** The heuristic comparison algorithm React uses to diff two Fiber trees. While the theoretical minimum operations to transform an arbitrary tree of $N$ nodes has a complexity of $O(N^3)$ (which would require 1 billion operations for 1,000 nodes), React achieves an optimal **$O(N)$ linear time complexity** by enforcing two foundational heuristics:
  1. **Two elements of different types will produce fundamentally different trees.**
  2. **The developer can hint which child elements are stable across renders using a `key` prop.**

```
                     RECONCILIATION HEURISTIC DECISION TREE
                     
                    [ Compare Old Fiber vs New JSX Element ]
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
      [ Same Element Type? ]                      [ Different Element Type? ]
      (e.g., <div> -> <div>)                      (e.g., <Card> -> <Table>)
                 │                                           │
  ┌──────────────┴──────────────┐             ┌──────────────┴──────────────┐
  ▼                             ▼             ▼                             ▼
[ Reuse Existing DOM Node ]   [ Update Props] [ Destroy Old DOM Node Tree ] [ Mount Fresh Tree ]
                              (Class, Style,  [ Clear All State & Hooks ]   [ Initial State ]
                               Attributes)
```

---

## 2. WHY
Why understanding diffing heuristics prevents major production bugs:
1. **Accidental State Destruction:** Wrapping a component in a conditional container (e.g. changing `<div><Editor /></div>` to `<section><Editor /></section>`) causes the entire `<Editor />` component to unmount and lose all uncommitted user drafts because the parent element type changed from `div` to `section`.
2. **DOM Node Recycling:** Understanding how React reuses `<input>`, `<select>`, and `<iframe>` elements prevents stale input values and focus jumps.

---

## 3. INTERNAL MENTAL MODEL: ARRAY RECONCILIATION WITH KEYS

When diffing arrays of children, React Fiber executes a two-pass algorithm:

### Pass 1: Fast-Path Linear Scan (Handles in-place updates)
- Iterates synchronously through old Fibers and new JSX elements at matching indices (`i = 0, 1, 2...`).
- If types and keys match, it creates a new `workInProgress` Fiber linked to the old one.
- The instant it encounters a key mismatch (e.g. an insertion or deletion), it breaks out of Pass 1.

### Pass 2: Map Lookup & Movement Detection (Handles insertions, reorders & deletions)
- Converts remaining old child Fibers into a hash map: `Map<key | index, Fiber>`.
- Iterates over remaining new JSX elements, looking up matching Fibers in the map by key ($O(1)$ lookup).
- Tracks `lastPlacedIndex` to detect whether DOM nodes must physically move (`Placement` flag) or stay in place.
- Any old Fibers remaining in the map that were not matched are tagged with the `Deletion` flag to be removed from the DOM during Commit.

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why is general tree diffing $O(N^3)$ and how does React reduce it to $O(N)$?*
2. *What happens to a component's internal state when its parent changes its wrapping container from a `<div>` to a `<main>` tag?*
3. *How does React Fiber's two-pass array reconciliation algorithm use `lastPlacedIndex` to minimize physical DOM node movements?*
