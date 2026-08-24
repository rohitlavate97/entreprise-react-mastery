# Module 14.2 — Virtualization & DOM Windowing for Massive Datasets

## 1. WHAT
- **Virtualization (Windowing):** A performance optimization technique for long lists, grids, and tables that calculates which items are currently inside the visible viewport and **renders only those items into the real DOM** (typically 15–30 DOM nodes), rather than mounting thousands of DOM elements.
- **The DOM Node Threshold:**
  - Standard DOM capacity before UI lag: $< 1,500$ DOM nodes.
  - 10,000 un-virtualized rows $\times 5$ cells per row $= 50,000$ DOM nodes $\rightarrow$ Layout engine freezes, scroll frame rate drops to $< 10\text{ fps}$, browser tab crashes with Out of Memory.

```
                    VIRTUALIZED LIST ARCHITECTURE
                    
  Total Dataset: 100,000 Items (Virtual Height: 3,500,000px)
  
  ┌─────────────────────────────────────────────────────────────┐
  │  Scroll Container (Height: 600px, overflow-y: auto)         │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │  Virtual Spacer Div (Height: 3,500,000px)             │  │
  │  │                                                       │  │
  │  │  [ Top Offset Spacer: 14,200px ]                      │  │
  │  │                                                       │  │
  │  │  VISIBLE VIEWPORT (Only 15 real DOM rows rendered!):  │  │
  │  │  • Row #405: Order ORD-9914 ($240.00)                 │  │
  │  │  • Row #406: Order ORD-9915 ($89.50)                  │  │
  │  │  • Row #407: Order ORD-9916 ($1,240.00)               │  │
  │  │  • ... (Rows #408 to #420)                            │  │
  │  │                                                       │  │
  │  │  [ Bottom Offset Spacer: 3,485,000px ]                │  │
  │  └───────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 2. PRODUCTION IMPLEMENTATION: `@tanstack/react-virtual`

```tsx
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface OrderItem {
  id: string;
  customer: string;
  total: number;
}

export function VirtualizedOrdersTable({ items }: { items: OrderItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Configure row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated row height: 48px
    overscan: 5, // Render 5 extra buffer items above and below viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border rounded-lg"
    >
      <div
        className="w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={item.id}
              className="absolute top-0 left-0 w-full h-[48px] flex items-center px-4 border-b hover:bg-gray-50"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <span className="w-1/3 font-mono">{item.id}</span>
              <span className="w-1/3">{item.customer}</span>
              <span className="w-1/3 text-right font-bold">${item.total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does using `transform: translateY()` achieve 60fps scrolling performance compared to mutating `top` or `marginTop` style properties?*
2. *What is the role of the `overscan` buffer in virtualized lists, and what happens if overscan is set to 0?*
3. *How do you virtualize rows with dynamic, unpredicted heights using `measureElement`?*
