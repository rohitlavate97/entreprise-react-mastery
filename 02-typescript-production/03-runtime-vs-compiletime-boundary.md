# Module 2.3 — The Runtime vs. Compile-Time Boundary & API Validation

## 1. WHAT
- **Type Erasure:** The process by which the TypeScript compiler strips away all interfaces, type aliases, generics, and type annotations, emitting purely dynamic JavaScript code. At runtime in the browser, **types do not exist**.
- **The Compile-Time Illusion:** Casting external data with `as UserDTO` only satisfies the TypeScript compiler. It does **not** validate that the incoming JSON payload from Spring Boot actually conforms to the shape at runtime.
- **Runtime Schema Validation:** Using runtime validation engines (such as **Zod** or manual TypeScript Type Guards) to parse, validate, and sanitize untrusted external payloads at the API boundary before passing them into the React component tree.

```
                           THE TYPE SAFETY BOUNDARY
                           
  [Spring Boot API] ────────────────────────► Network Wire ───────────┐
  (Java Entity / DTO)                          (Raw JSON String)      │
                                                                      ▼
  ❌ UNSAFE CAST:                                          [Browser Runtime]
  const user = (await res.json()) as UserDTO;               - Types are ERASED
  // TypeScript assumes user.email is a string.             - TypeScript is BLIND
  // If backend sent { email: null } or { userEmail: "..." }
  // -> user.email.toLowerCase() CRASHES with TypeError!
  
  -----------------------------------------------------------------------------
  
  ✅ RUNTIME VALIDATION (Zod / Type Guard):
  const parsed = UserSchema.safeParse(await res.json());
  if (!parsed.success) {
    // Graceful error handling & Sentry telemetry alert
    throw new ApiValidationError(parsed.error);
  }
  const user = parsed.data; // 100% Guaranteed valid type at RUNTIME!
```

---

## 2. WHY
Why runtime validation at the Spring Boot boundary is mandatory:
1. **Silent Production Breakages:** A backend engineer renames a field in a Spring Boot DTO (e.g. `order_id` to `orderId`) without notifying the frontend team. The frontend builds successfully in CI (because the static TS interface wasn't updated), but crashes in production when users open the page.
2. **Null Pointer Exceptions in React:** If a backend query returns `null` for a field typed as `string`, operations like `item.name.toUpperCase()` throw unhandled runtime exceptions.
3. **Defense Against Malicious Payloads:** Prevents compromised or malformed third-party API responses from injecting unexpected structures into client state.

---

## 3. MODERN IMPLEMENTATION: ZOD RUNTIME SCHEMA VALIDATION

```typescript
import { z } from 'zod';

// 1. Define runtime schema with Zod
export const UserDTOSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  roles: z.array(z.enum(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER'])),
  createdAt: z.string().datetime(), // Validates strict ISO-8601 UTC string
  isActive: z.boolean().default(true),
  phoneNumber: z.string().nullable().optional() // Handles null or undefined
});

// 2. Automatically derive the TypeScript static type from the schema!
// No need to write both an interface and a schema manually!
export type UserDTO = z.infer<typeof UserDTOSchema>;

// 3. Resilient API service with runtime validation
export async function fetchUserProfile(userId: number): Promise<UserDTO> {
  const response = await fetch(`/api/v1/users/${userId}`);

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const rawJson = await response.json();

  // Validate at runtime
  const result = UserDTOSchema.safeParse(rawJson);

  if (!result.success) {
    console.error('[API Validation Error] Spring Boot DTO schema mismatch:', result.error.format());
    // Send schema mismatch telemetry to Sentry / Datadog
    throw new Error('Received malformed data contract from server.');
  }

  return result.data; // Fully typed and runtime-validated!
}
```

---

## 4. LIGHTWEIGHT ALTERNATIVE: CUSTOM TYPE GUARDS (ZERO DEPENDENCIES)

When adding third-party libraries is restricted, use TypeScript **User-Defined Type Guards**:

```typescript
export interface ProductDTO {
  id: number;
  name: string;
  price: number;
}

// User-Defined Type Guard function
export function isProductDTO(data: unknown): data is ProductDTO {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as any).id === 'number' &&
    'name' in data &&
    typeof (data as any).name === 'string' &&
    'price' in data &&
    typeof (data as any).price === 'number'
  );
}

// Usage in fetcher:
export async function fetchProduct(id: number): Promise<ProductDTO> {
  const res = await fetch(`/api/products/${id}`);
  const data = await res.json();
  if (!isProductDTO(data)) {
    throw new Error('Invalid product payload from backend');
  }
  return data;
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *Why does TypeScript's static type checker fail to prevent runtime errors when fetching JSON data from a Spring Boot REST API?*
2. *How does `z.infer<typeof Schema>` bridge the gap between runtime validation and compile-time type inference?*
3. *What is a User-Defined Type Guard (`data is T`), and how does the TypeScript compiler use it for type narrowing?*
