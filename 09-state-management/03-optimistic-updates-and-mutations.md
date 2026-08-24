# Module 9.3 — Optimistic UI Updates & Mutation Rollback Patterns

## 1. WHAT
- **Optimistic UI Update:** A pattern where the client updates the UI **immediately** assuming the backend mutation will succeed, providing a 0ms perceived latency experience for users.
- **Rollback Mechanism:** If the backend rejects the mutation (e.g. 403 Forbidden, 422 Validation Error, or 500 Outage), the client automatically rolls back the local cache to the exact snapshot recorded before the mutation started.

```
                    OPTIMISTIC MUTATION TIMELINE
                    
  1. User toggles "Mark as Shipped"
     │
  2. onMutate() ───────────────────────> Snapshot current cache (status: "PENDING")
     │                                   Optimistically update cache to "SHIPPED"
     │                                   UI updates IMMEDIATELY (0ms latency)
     │
  3. Network Request In-Flight ────────> POST /api/orders/123/ship
     │
     ├── IF SUCCESS:
     │   └── onSettled() ──────────────> Invalidate query -> refetch to confirm truth
     │
     └── IF FAILURE (e.g. 500 Error):
         ├── onError() ────────────────> Restore snapshot (status reverts to "PENDING")
         └── Show error toast ─────────> "Failed to update order status"
```

---

## 2. PRODUCTION IMPLEMENTATION: TYPE-SAFE OPTIMISTIC MUTATION

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '../api/orderKeys';
import { httpClient } from '@/shared/api/httpClient';
import type { Order } from '../model/order.types';

interface UpdateOrderStatusPayload {
  orderId: string;
  status: 'PENDING' | 'SHIPPED' | 'CANCELLED';
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusPayload) => {
      const response = await httpClient.patch<Order>(`/api/orders/${orderId}/status`, { status });
      return response.data;
    },

    // Step 1: When mutation starts
    onMutate: async (newOrder) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(newOrder.orderId) });

      // 2. Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(newOrder.orderId));

      // 3. Optimistically update the cache
      if (previousOrder) {
        queryClient.setQueryData<Order>(orderKeys.detail(newOrder.orderId), {
          ...previousOrder,
          status: newOrder.status,
        });
      }

      // 4. Return context object with snapshotted value
      return { previousOrder };
    },

    // Step 2: If the mutation fails, rollback using the snapshot
    onError: (err, newOrder, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          orderKeys.detail(newOrder.orderId),
          context.previousOrder
        );
      }
      console.error('[Optimistic Mutation Failed] Reverting state:', err);
    },

    // Step 3: Always refetch after error or success to guarantee synchronization
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why must `queryClient.cancelQueries` be awaited inside `onMutate` before modifying cache data?*
2. *Why is `onSettled` required even after a successful optimistic mutation?*
3. *How do you prevent optimistic mutations on lists from corrupting array order when server-generated IDs are missing?*
