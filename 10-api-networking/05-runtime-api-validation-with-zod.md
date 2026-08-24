# Module 10.5 — Runtime API Validation with Zod & DTO Drift Defense

## 1. WHAT
- **Runtime API Validation:** Parsing and validating JSON response payloads from backend REST endpoints against a Zod schema at the client boundary *before* passing data into React components or TanStack Query caches.
- **DTO Drift:** The silent, catastrophic failure mode in full-stack applications where a backend Spring Boot developer renames, deletes, or changes the type of a Java DTO field (e.g. `order_id` $\rightarrow$ `id`, or `Long` $\rightarrow$ `String`), causing runtime `TypeError: Cannot read property of undefined` crashes across the React application.

```
                 UNVALIDATED VS ZOD-VALIDATED API BOUNDARY
                 
  ❌ UNVALIDATED CASTING (Unsound TypeScript):
  const res = await axios.get('/api/user');
  const user = res.data as UserDTO; // ❌ Compile-time only! If backend sends null -> CRASH in JSX!
  
  -----------------------------------------------------------------------------------------
  
  ✅ RUNTIME ZOD BOUNDARY VALIDATION:
  const res = await axios.get('/api/user');
  const result = UserSchema.safeParse(res.data);
  if (!result.success) {
    // 1. Alert Sentry with exact schema diff
    // 2. Fall back to safe cached state or structured error screen
    // 3. ZERO white-screen crashes for users!
  }
```

---

## 2. PRODUCTION IMPLEMENTATION: TYPE-SAFE VALIDATING API CLIENT

```typescript
// shared/api/apiClient.ts
import { z, ZodType } from 'zod';
import { httpClient } from './httpClient';
import { AxiosRequestConfig } from 'axios';

export class ApiValidationError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly zodError: z.ZodError,
    public readonly rawData: unknown
  ) {
    super(`[API Schema Mismatch] Endpoint ${endpoint} failed runtime validation`);
    this.name = 'ApiValidationError';
  }
}

// Type-Safe generic GET with mandatory runtime Zod schema parsing
export async function getValidated<TSchema extends ZodType>(
  endpoint: string,
  schema: TSchema,
  config?: AxiosRequestConfig
): Promise<z.infer<TSchema>> {
  const response = await httpClient.get(endpoint, config);

  // Runtime validation at the network boundary
  const parsed = schema.safeParse(response.data);

  if (!parsed.success) {
    // Log contract drift telemetry to Sentry / Datadog
    console.error(`[DTO Drift Detected] ${endpoint}:`, parsed.error.format());

    throw new ApiValidationError(endpoint, parsed.error, response.data);
  }

  // Returns 100% verified, guaranteed type-safe data to caller!
  return parsed.data;
}
```

---

## 3. REAL-WORLD USAGE WITH REACT QUERY

```typescript
// features/orders/api/ordersApi.ts
import { z } from 'zod';
import { getValidated } from '@/shared/api/apiClient';

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  totalAmount: z.number().nonnegative(),
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']),
  createdAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

export async function fetchOrderById(id: string, signal?: AbortSignal): Promise<Order> {
  return getValidated(`/api/orders/${id}`, OrderSchema, { signal });
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why does TypeScript's `as MyType` provide zero runtime protection against Spring Boot backend payload changes?*
2. *What is the CPU and memory performance impact of parsing large (e.g. 5MB) API responses with Zod?*
3. *How should an enterprise SPA handle an `ApiValidationError` gracefully in production without showing a blank white screen?*
