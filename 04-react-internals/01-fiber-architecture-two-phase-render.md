# Module 4.1 — The Fiber Architecture & Two-Phase Rendering Model

## 1. WHAT
- **React Fiber:** The complete reimplementation of React's core reconciliation engine (introduced in React 16 and evolved in React 18/19). A **Fiber** is a plain JavaScript object representing a unit of work that maps directly to a component instance or DOM node in the UI tree.
- **Double Buffering:** A graphics-rendering technique adapted by React where two trees exist simultaneously:
  1. **`current` Tree:** The Fiber tree currently rendered and visible on the screen.
  2. **`workInProgress` (WIP) Tree:** The draft Fiber tree being constructed, recalculated, and diffed in memory during the Render phase.
- **Two-Phase Rendering Model:**
  - **Phase 1: Render Phase (Asynchronous & Interruptible):** React traverses the Fiber tree, executes component functions, calculates state, and computes side-effect tags (flags). **Zero DOM mutations occur in this phase.**
  - **Phase 2: Commit Phase (Synchronous & Non-Interruptible):** React takes the finished `workInProgress` tree, applies all DOM mutations in one fast synchronous batch, switches the root pointer (`current = workInProgress`), and executes layout and passive effects.

```
                    FIBER DOUBLE BUFFERING & TWO-PHASE PIPELINE
                    
                     [ State Update Dispatched ]
                                  │
  ┌───────────────────────────────▼───────────────────────────────┐
  │                 PHASE 1: RENDER PHASE (CPU)                   │
  │  - Asynchronous, pure, interruptible                          │
  │  - Traverses workInProgress tree via child / sibling pointers │
  │  - Calls component functions, reconciles JSX elements         │
  │  - Collects DOM mutation flags (Placement, Update, Deletion)  │
  └───────────────────────────────┬───────────────────────────────┘
                                  │ (Render complete)
  ┌───────────────────────────────▼───────────────────────────────┐
  │                 PHASE 2: COMMIT PHASE (DOM)                   │
  │  - Synchronous, non-interruptible atomic batch               │
  │  1. Mutation: Writes changes to real browser DOM              │
  │  2. Pointer Swap: currentTree <== workInProgressTree          │
  │  3. Layout Effects: useLayoutEffect runs (before paint)       │
  │  4. Browser Paint: Pixels rendered to physical screen         │
  │  5. Passive Effects: useEffect runs asynchronously            │
  └───────────────────────────────────────────────────────────────┘
```

---

## 2. WHY
Why the Fiber architecture replaced the legacy Stack Reconciler:
1. **Interruptible Rendering (Time Slicing):** In React 15 (Stack Reconciler), reconciliation was a synchronous recursive traversal. If diffing a large tree took 200ms, the JavaScript main thread was blocked for 200ms, dropping frames and freezing user typing. Fiber turns recursion into an interruptible linked list loop that yields to browser events every 5ms.
2. **Priority-Based Scheduling:** Urgent updates (e.g. user keystrokes, clicks) can interrupt and pause low-priority background updates (e.g. rendering 1,000 analytics chart nodes).
3. **Atomic Commits:** Because the Render phase makes zero DOM changes, if an error occurs or an update is cancelled, the incomplete work is safely discarded without leaving a broken, half-rendered DOM on screen.

---

## 3. INTERNAL MENTAL MODEL: ANATOMY OF A FIBER NODE

Every React element has an associated Fiber node structured as a singly-linked tree:

```typescript
interface FiberNode {
  // 1. Structural Identity
  tag: WorkTag;             // Identifies type: FunctionComponent, ClassComponent, HostComponent (div/span)
  key: null | string;       // Unique reconciliation key
  elementType: any;         // The component function or HTML tag name ('div', 'Button')
  type: any;                // The resolved function/class

  // 2. Singly-Linked Tree Pointers
  return: FiberNode | null; // Pointer to PARENT Fiber
  child: FiberNode | null;  // Pointer to FIRST CHILD Fiber
  sibling: FiberNode | null;// Pointer to NEXT SIBLING Fiber
  index: number;

  // 3. State & Props Memory
  pendingProps: any;        // Props passed in current render pass
  memoizedProps: any;       // Props used in previous committed render
  memoizedState: any;       // Linked list of Hook instances (useState, useEffect)
  updateQueue: any;         // Queue of pending state updates

  // 4. Double Buffering & Flags
  alternate: FiberNode | null; // Pointer to the twin Fiber in current/WIP tree
  flags: Flags;             // Bitmask of side effects (Placement, Update, Deletion, Passive)
  lanes: Lanes;             // Priority bitmask
}
```

---

## 4. HOW REACT TRAVERSES THE FIBER TREE (WORK LOOP)

Instead of call-stack recursion, Fiber uses a `while` loop that walks the linked list:

```typescript
function workLoopConcurrent() {
  // Perform work on next Fiber until work is done OR browser frame deadline exceeded
  while (workInProgress !== null && !shouldYieldToHost()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: FiberNode): void {
  const current = unitOfWork.alternate;
  // 1. BeginWork: execute component function, compute new children JSX
  let next = beginWork(current, unitOfWork, renderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // 2. CompleteWork: no more children, bubble up effect flags, create DOM instances
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next; // Walk down to child
  }
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *What is the fundamental difference between the Render Phase and the Commit Phase in React Fiber, and why must the Render Phase remain strictly pure?*
2. *How does React Fiber implement double-buffering using `current` and `workInProgress` trees?*
3. *Why does React Fiber use a singly-linked list structure (`child`, `sibling`, `return`) instead of standard recursive function calls?*
