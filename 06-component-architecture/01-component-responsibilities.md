# Module 6.1 — Component Responsibilities: Presentational, Container & Feature Slice Architecture

## 1. WHAT
- **Presentational (UI / Dumb) Components:** Pure rendering units that receive all data and callbacks through props. They have zero knowledge of where data comes from, how it is fetched, or where state lives. They are maximally reusable, testable via snapshot, and compose cleanly.
- **Container (Smart) Components:** Orchestration shells that connect to data sources (hooks, context, server-state libraries), manage side-effects, and delegate all visual rendering to Presentational children.
- **Feature Slice Components:** Self-contained vertical modules that own their own data fetching, state management, routing segments, and UI — bounded by a clear public API surface (`index.ts` barrel export).

```
                RESPONSIBILITY SEPARATION ARCHITECTURE
                
  ┌─────────────────────────────────────────────────────────┐
  │                    FEATURE SLICE                         │
  │  ┌──────────────────┐    ┌───────────────────────────┐  │
  │  │   Container       │    │   Presentational           │  │
  │  │   (Smart Shell)   │───>│   (Pure UI)                │  │
  │  │                    │    │                             │  │
  │  │  • useQuery()      │    │  • Props only               │  │
  │  │  • useContext()    │    │  • No hooks (ideally)       │  │
  │  │  • Event handlers  │    │  • Storybook-friendly       │  │
  │  │  • Error/Loading   │    │  • Snapshot-testable        │  │
  │  └──────────────────┘    └───────────────────────────┘  │
  │                                                          │
  │  index.ts  (Public API: only exports what other          │
  │             features are allowed to import)              │
  └─────────────────────────────────────────────────────────┘
```

---

## 2. WHY

### The God Component Anti-Pattern
The single most destructive anti-pattern in enterprise React codebases is the **God Component**: a single file that handles data fetching, form validation, business logic branching, error handling, loading states, and DOM rendering in one monolithic 800+ line function.

**Consequences of God Components:**
1. **Untestable:** Cannot test business logic without mounting the entire component tree and mocking network calls.
2. **Unreviewable:** Code reviews become rubber-stamp approvals because no reviewer can reason about 800 lines of interleaved concerns.
3. **Unrefactorable:** Changing any behavior risks breaking unrelated behaviors elsewhere in the same file.
4. **Performance Killing:** Any state change in the God Component re-renders the entire subtree including expensive child elements.

### The Correct Mental Model

```
  ❌ GOD COMPONENT (Everything in one file):
  OrderPage.tsx (847 lines)
    - useQuery for orders
    - useQuery for inventory
    - useMutation for submit
    - Form validation logic
    - 14 useState calls
    - 6 useEffect calls
    - Complex conditional JSX
  
  ✅ SEPARATED RESPONSIBILITIES:
  OrderPage/
    ├── OrderPageContainer.tsx    (40 lines — orchestrates data & passes to UI)
    ├── OrderForm.tsx             (80 lines — pure form UI, receives props)
    ├── OrderSummaryCard.tsx      (50 lines — pure display card)
    ├── useOrderSubmission.ts     (60 lines — custom hook: mutation + validation)
    ├── useOrderData.ts           (30 lines — custom hook: queries)
    ├── OrderPage.types.ts        (25 lines — shared TypeScript interfaces)
    └── index.ts                  (1 line  — public export)
```

---

## 3. IMPLEMENTATION: CLEAN CONTAINER / PRESENTATIONAL SPLIT

### Presentational Component (Pure UI)
```tsx
// OrderSummaryCard.tsx — ZERO data fetching, ZERO hooks, ZERO side-effects
import React from 'react';

interface OrderSummaryProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped';
  onCancel: (orderId: string) => void;
}

const STATUS_STYLES: Record<OrderSummaryProps['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
};

export function OrderSummaryCard({
  orderId,
  customerName,
  totalAmount,
  status,
  onCancel,
}: OrderSummaryProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{customerName}</h3>
        <span className={`px-2 py-1 rounded text-xs ${STATUS_STYLES[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-600 mt-1">Order #{orderId}</p>
      <p className="text-lg font-bold mt-2">${totalAmount.toFixed(2)}</p>
      {status === 'pending' && (
        <button
          onClick={() => onCancel(orderId)}
          className="mt-3 text-red-600 hover:text-red-800 text-sm"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
}
```

### Container Component (Orchestration Shell)
```tsx
// OrderListContainer.tsx — Owns data, delegates rendering
import React from 'react';
import { useOrders, useCancelOrder } from './hooks';
import { OrderSummaryCard } from './OrderSummaryCard';
import { ErrorFallback } from '@/shared/ui/ErrorFallback';
import { Skeleton } from '@/shared/ui/Skeleton';

export function OrderListContainer() {
  const { data: orders, isLoading, error } = useOrders();
  const cancelMutation = useCancelOrder();

  if (error) return <ErrorFallback error={error} />;
  if (isLoading) return <Skeleton count={5} />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderSummaryCard
          key={order.id}
          orderId={order.id}
          customerName={order.customerName}
          totalAmount={order.totalAmount}
          status={order.status}
          onCancel={(id) => cancelMutation.mutate(id)}
        />
      ))}
    </div>
  );
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What are the three concrete consequences of the "God Component" anti-pattern in enterprise codebases?*
2. *How does separating Container and Presentational components improve testability?*
3. *When is the Container/Presentational split unnecessary or over-engineering?*
