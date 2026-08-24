# Module 11.4 — Idempotency, JPA Optimistic Locking & ETag Concurrency Control

## 1. WHAT
- **Full-Stack Idempotency:** Guaranteeing that duplicate form submissions with the same `Idempotency-Key` return the identical response without re-executing business logic.
- **JPA Optimistic Locking (`@Version`):** A database-level concurrency mechanism where an entity carries a numeric version counter. If User A and User B both load Version 3, and User A saves first (bumping to Version 4), User B's update fails with `OptimisticLockException` (HTTP `409 Conflict`), preventing silent data overwrites ("Lost Update Problem").
- **HTTP `ETag` / `If-Match`:** The standard HTTP protocol mechanism for optimistic locking. The server sends `ETag: "v3"`; the client sends `If-Match: "v3"` on mutation. If mismatched, the server returns `412 Precondition Failed`.

```
                    JPA OPTIMISTIC LOCKING TIMELINE
                    
  User A (React)                        Spring Boot / Postgres                        User B (React)
        │                                         │                                         │
  1. GET /orders/100 ──────────────────> [ Order v1 loaded ] <───────────────── GET /orders/100
        │                                         │                                         │
  2. Submits Edit (v1)                            │                                         │
     PUT /orders/100 (version: 1) ──> DB: Updates record                            │
                                      version becomes 2                             │
                                      Returns 200 OK                                │
                                                  │                                         │
                                                  │ <── 3. Submits Edit (v1)                │
                                                  │        PUT /orders/100 (version: 1)     │
                                                  │        DB detects version mismatch!     │
                                                  │        Throws OptimisticLockException   │
                                                  │ ──> Returns 409 Conflict ───────────────┘
                                                  │     "Record was modified by another user"
```

---

## 2. SPRING BOOT JPA & REDIS IMPLEMENTATION

```java
// backend/src/main/java/com/enterprise/orders/entity/Order.java
package com.enterprise.orders.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerId;
    private BigDecimal totalAmount;

    // JPA Optimistic Lock Version Column
    @Version
    private Long version;

    // Getters, Setters, Constructors...
}
```

```java
// backend/src/main/java/com/enterprise/orders/controller/OrderController.java
@PutMapping("/{id}")
public ResponseEntity<OrderResponseDto> updateOrder(
        @PathVariable Long id,
        @RequestHeader(value = "If-Match", required = false) Long ifMatchVersion,
        @Valid @RequestBody UpdateOrderRequestDto dto) {
        
    OrderResponseDto updated = orderService.updateOrder(id, ifMatchVersion, dto);
    return ResponseEntity.ok()
        .eTag(String.valueOf(updated.version()))
        .body(updated);
}
```

---

## 3. REACT CONFLICT HANDLING (RESOLVING HTTP 409)

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/httpClient';

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, version, payload }: { id: string; version: number; payload: any }) => {
      const response = await httpClient.put(`/api/orders/${id}`, payload, {
        headers: { 'If-Match': String(version) },
      });
      return response.data;
    },
    onError: (error: any, variables) => {
      if (error.response?.status === 409 || error.response?.status === 412) {
        // Concurrency Conflict: Alert user that someone else updated the record
        const shouldOverwrite = window.confirm(
          'This record was modified by another user while you were editing. Would you like to reload the latest changes?'
        );
        if (shouldOverwrite) {
          queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
        }
      }
    },
  });
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *How does the Lost Update problem occur in high-concurrency enterprise web applications without optimistic locking?*
2. *What is the difference between pessimistic database row locks (`SELECT FOR UPDATE`) and JPA optimistic locking (`@Version`) in terms of throughput and scalability?*
3. *How should a React UI present a 409 Conflict / JPA OptimisticLockException to a user for smooth resolution?*
