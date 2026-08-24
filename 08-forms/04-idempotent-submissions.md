# Module 8.4 — Idempotent Form Submissions: Double-Submit Prevention & Enterprise Safety

## 1. WHAT
- **Double Submission:** A critical enterprise bug where a user clicks the "Submit" button twice (or the browser retries a failed POST), causing duplicate records to be created in the database — duplicate orders, double charges, or duplicate user accounts.
- **Idempotency:** The property that performing the same operation multiple times produces the same result as performing it once. An idempotent form submission creates exactly ONE record, even if submitted 3 times.
- **Idempotency Key:** A unique client-generated token (UUID) attached to the form submission. The backend uses this key to deduplicate requests — if a request with the same key has already been processed, the server returns the original response instead of processing again.

```
                     DOUBLE SUBMIT TIMELINE
                     
  User clicks "Place Order"                    User clicks again (300ms later)
         │                                              │
  POST /api/orders                             POST /api/orders
  { items: [...], idempotencyKey: "abc-123" }  { items: [...], idempotencyKey: "abc-123" }
         │                                              │
         ▼                                              ▼
  ┌──────────────────────────────────────────────────────────┐
  │  Spring Boot Backend                                      │
  │                                                           │
  │  Request 1: idempotencyKey "abc-123" not seen before      │
  │  → Process order → Save to DB → Store key in Redis        │
  │  → Return 201 { orderId: "ORD-789" }                     │
  │                                                           │
  │  Request 2: idempotencyKey "abc-123" ALREADY EXISTS       │
  │  → Skip processing → Return cached 201 { orderId: "ORD-789" }  │
  └──────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND IMPLEMENTATION: TRIPLE DEFENSE

### Defense 1: Disable Button on Submit
```tsx
import React, { useState } from 'react';

export function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: OrderPayload) {
    if (isSubmitting) return; // Guard clause
    setIsSubmitting(true);

    try {
      await createOrder(data);
    } finally {
      setIsSubmitting(false); // Re-enable on success OR failure
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
}
```

### Defense 2: Client-Generated Idempotency Key
```tsx
import { v4 as uuidv4 } from 'uuid';
import { useRef } from 'react';

export function useIdempotentSubmit() {
  // Generate key ONCE when the form mounts — persists across re-renders
  const idempotencyKey = useRef(uuidv4());

  async function submit(payload: OrderPayload) {
    const response = await httpClient.post('/api/orders', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey.current,
      },
    });

    // Generate a NEW key for the NEXT submission (after success)
    idempotencyKey.current = uuidv4();
    return response.data;
  }

  return { submit };
}
```

### Defense 3: TanStack Query Mutation Guard
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    // TanStack Query automatically prevents parallel mutation calls
    // while a mutation is in-flight (isPending guard)
  });
}

// In component:
const { mutate, isPending } = useCreateOrder();
<button onClick={() => mutate(formData)} disabled={isPending}>Submit</button>
```

---

## 3. SPRING BOOT BACKEND: IDEMPOTENCY KEY HANDLER

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private RedisTemplate<String, String> redis;
    @Autowired private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreateOrderRequest request) {

        String cacheKey = "idempotency:" + idempotencyKey;
        String existingOrderId = redis.opsForValue().get(cacheKey);

        if (existingOrderId != null) {
            // Already processed — return cached result
            OrderResponse cached = orderService.getOrder(existingOrderId);
            return ResponseEntity.ok(cached);
        }

        // First time — process and cache
        OrderResponse created = orderService.createOrder(request);
        redis.opsForValue().set(cacheKey, created.getOrderId(), 24, TimeUnit.HOURS);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why is disabling the submit button alone NOT sufficient to prevent double submissions in production?*
2. *How does a client-generated idempotency key allow the backend to safely deduplicate retried requests?*
3. *What is the appropriate TTL (time-to-live) for an idempotency key in Redis, and why?*
