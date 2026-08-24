# Project 3 — High-Scale E-Commerce Storefront & Checkout Engine

## 1. PROJECT SPECIFICATION & ARCHITECTURAL BLUEPRINT
- **Domain:** High-Volume Global Retail Storefront & Payment Processing.
- **Core Architecture:**
  - **Checkout Flow:** 4-step wizard form (Shipping $\rightarrow$ Billing $\rightarrow$ Review $\rightarrow$ Payment) managed via `useReducer` and React Hook Form + Zod.
  - **Financial Safety:** Dual-submit prevention with `Idempotency-Key` headers and Spring Boot Redis distributed locking.
  - **Performance:** Core Web Vitals optimized (LCP $\le 1.6\text{s}$, CLS $= 0.0$, INP $\le 80\text{ms}$) via image preloading and code-split checkout chunks.

```
                    IDEMPOTENT CHECKOUT TRANSACTION PIPELINE
                    
  React Checkout Page
  ├── Generates Idempotency-Key: uuidv4()
  ├── Disables "Pay Now" button (isSubmitting = true)
  └── POST /api/v1/checkout/pay (Header: Idempotency-Key: 7f3b...)
            │
            ▼
  Spring Boot Backend + Redis Distributed Lock
  ├── Atomic SET NX EX on key "idempotency:7f3b..." (TTL: 120s)
  ├── Executes Stripe charge
  ├── Saves Order entity in Postgres DB
  └── Returns 201 Created -> React displays Order Confirmation Screen
```

---

## 2. PRODUCTION IMPLEMENTATION: IDEMPOTENT PAYMENT MUTATION

```tsx
// features/checkout/api/useProcessPayment.ts
import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/httpClient';

export function useProcessPayment() {
  return useMutation({
    mutationFn: async (paymentDetails: { orderId: string; paymentMethodId: string }) => {
      const idempotencyKey = crypto.randomUUID();

      const response = await httpClient.post(
        `/api/v1/orders/${paymentDetails.orderId}/pay`,
        { paymentMethodId: paymentDetails.paymentMethodId },
        {
          headers: { 'Idempotency-Key': idempotencyKey },
          timeout: 20000, // 20s budget for payment gateway
        }
      );
      return response.data;
    },
  });
}
```
