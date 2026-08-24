# Module 8.2 — Form Validation Strategies: Client-Side, Server-Side & Shared Schemas

## 1. WHAT
- **Client-Side Validation:** Validation that runs in the browser BEFORE the form is submitted to the server. Provides instant feedback to the user (field highlighting, inline error messages).
- **Server-Side Validation:** Validation that runs on the backend (Spring Boot `@Valid` / `@Validated`) AFTER the form is submitted. This is the authoritative source of truth — client-side validation can be bypassed by disabling JavaScript or using `curl`.
- **Shared Schema Validation (Zod):** Using a single Zod schema as the single source of truth for BOTH TypeScript type inference AND runtime validation, ensuring the frontend and backend agree on data shapes.

```
                     VALIDATION LAYER DEFENSE-IN-DEPTH
                     
  ┌─────────────────────────────────────────────────────────┐
  │  Layer 1: HTML5 Native Validation (required, type=email) │ ← Instant, zero JS
  ├─────────────────────────────────────────────────────────┤
  │  Layer 2: Client-Side Zod Schema Validation              │ ← Rich, typed, UX-friendly
  ├─────────────────────────────────────────────────────────┤
  │  Layer 3: Server-Side Bean Validation (@Valid)            │ ← Authoritative, un-bypassable
  ├─────────────────────────────────────────────────────────┤
  │  Layer 4: Database Constraints (NOT NULL, UNIQUE, CHECK)  │ ← Last line of defense
  └─────────────────────────────────────────────────────────┘
  
  ⚠️ RULE: NEVER trust client-side validation alone!
  ⚠️ RULE: ALWAYS validate on the server, even if client validates first!
```

---

## 2. IMPLEMENTATION: ZOD SCHEMA VALIDATION

```tsx
import { z } from 'zod';

// 1. Define schema ONCE — use for both type inference AND runtime validation
export const createOrderSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999),
        unitPrice: z.number().positive('Price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required').max(200),
    city: z.string().min(1, 'City is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().length(2, 'Use ISO 3166-1 alpha-2 country code'),
  }),
  notes: z.string().max(500).optional(),
});

// 2. Infer TypeScript type from Zod schema (single source of truth!)
export type CreateOrderPayload = z.infer<typeof createOrderSchema>;

// 3. Validate at form submission
function handleSubmit(rawData: unknown) {
  const result = createOrderSchema.safeParse(rawData);

  if (!result.success) {
    // result.error.flatten() returns { fieldErrors: { customerId: ['...'], ... } }
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors(fieldErrors);
    return;
  }

  // result.data is fully typed as CreateOrderPayload — safe to send to API!
  submitOrder(result.data);
}
```

---

## 3. FIELD-LEVEL vs FORM-LEVEL vs ON-BLUR VALIDATION

| Strategy | When Errors Appear | UX Feel | Best For |
|---|---|---|---|
| **On Change (Real-time)** | Immediately as user types | Aggressive — can feel naggy | Email format, password strength meter |
| **On Blur (Field Exit)** | When user tabs/clicks away from field | Balanced — validates after intent | Most enterprise forms |
| **On Submit (Form-level)** | Only when user clicks Submit | Passive — user completes form first | Simple forms, wizard final step |

### Recommended Enterprise Pattern: On-Blur + On-Submit Hybrid
```tsx
function handleBlur(fieldName: string, value: string) {
  // Validate ONLY the blurred field
  const fieldSchema = createOrderSchema.shape[fieldName];
  const result = fieldSchema?.safeParse(value);
  if (result && !result.success) {
    setErrors((prev) => ({ ...prev, [fieldName]: result.error.issues[0].message }));
  } else {
    setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  }
}

function handleSubmit() {
  // Validate ENTIRE form on submit
  const result = createOrderSchema.safeParse(formData);
  if (!result.success) {
    // Show all errors, focus first invalid field
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors(fieldErrors);
    document.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  submitOrder(result.data);
}
```

---

## 4. SERVER ERROR MAPPING (SPRING BOOT → REACT)

```tsx
// Spring Boot returns 422 with field-level errors:
// { "errors": { "email": "Email already exists", "zipCode": "Not serviceable" } }

async function submitOrder(payload: CreateOrderPayload) {
  try {
    await httpClient.post('/api/orders', payload);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 422) {
      const serverErrors = error.response.data.errors as Record<string, string>;
      setErrors(serverErrors); // Map server field errors directly to form UI
    }
  }
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *Why must server-side validation exist even when comprehensive client-side validation is in place?*
2. *How does Zod's `z.infer` eliminate the dual-maintenance problem of separate TypeScript types and validation schemas?*
3. *What is the UX tradeoff between on-change, on-blur, and on-submit validation strategies?*
