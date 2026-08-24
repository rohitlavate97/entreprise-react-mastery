# Module 2.1 — Core TypeScript Type System for Enterprise Scale

## 1. WHAT
**TypeScript** is a statically typed superset of JavaScript that compiles to plain JavaScript. Its core architecture consists of:
1. **Type Inference:** The compiler's ability to automatically deduce types without explicit annotations.
2. **Structural Type System (Duck Typing):** Type compatibility is based entirely on the shape/members of the type, not on explicit inheritance or class names.
3. **Generics & Constraints:** Parameterized types that allow components, functions, and hooks to operate over multiple data shapes while retaining full type safety.
4. **Discriminated Unions (Tagged Unions):** A union of object types where each variant shares a common literal property (the "tag" or "discriminant"), enabling 100% type-safe pattern matching.
5. **Utility Types:** Built-in type transformations (`Pick`, `Omit`, `Partial`, `Required`, `Record`, `ReturnType`, `Awaited`).

$$\begin{array}{|l|l|l|}
\hline
\textbf{Construct} & \textbf{Syntax Example} & \textbf{Primary Enterprise Use Case} \\ \hline
\text{Generic Constraint} & \text{<T extends BaseEntity>} & \text{Reusable data tables, select dropdowns, API callers} \\ \hline
\text{Discriminated Union} & \text{State = Idle | Loading | Success | Error} & \text{Impossible UI state prevention in reducers} \\ \hline
\text{Mapped Type} & \text{\{[K in Keys]: Type\}} & \text{Transforming DTO shapes, permission flags} \\ \hline
\text{Utility: Pick/Omit} & \text{Omit<UserDTO, 'password'>} & \text{Creating client-safe models from backend DTOs} \\ \hline
\end{array}$$

---

## 2. WHY
Why TypeScript mastery is essential for enterprise frontend engineering:
1. **Refactoring at Scale:** Changing a field name across a 200,000-line codebase without TypeScript requires dangerous regex searches; with TypeScript, the compiler identifies all broken references in milliseconds.
2. **Preventing Impossible States:** Modeling asynchronous state with boolean flags (`isLoading: true`, `isError: true`, `data: null`) allows 8 distinct combinations, 5 of which are mathematically invalid bugs. Discriminated unions restrict the UI to only valid states.
3. **Developer Velocity & Self-Documenting Contracts:** Clean TypeScript interfaces eliminate the need to look through backend source code or Swagger docs to understand what props or DTO fields are required.

---

## 3. INTERNAL MENTAL MODEL: DISCRIMINATED UNIONS VS BOOLEAN SOUP

```
                 STATE MODELING: BOOLEAN SOUP VS DISCRIMINATED UNION
                 
  ❌ Boolean Soup (Impossible States Possible):
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // BUGGY SCENARIO: isLoading === true AND isError === true simultaneously!
  // UI renders both the Loading Spinner AND the Error Banner!
  
  -----------------------------------------------------------------------------------
  
  ✅ Discriminated Union (Mathematical Precision):
  type AsyncState<T> =
    | { status: 'idle'; data: null; error: null }
    | { status: 'loading'; data: null; error: null }
    | { status: 'success'; data: T; error: null }
    | { status: 'error'; data: null; error: Error };
    
  // The 'status' discriminant GUARANTEES error is non-null ONLY when status === 'error'.
```

---

## 4. ESSENTIAL UTILITY TYPES FOR REACT + SPRING BOOT

```typescript
// 1. Backend Spring Boot DTO Representation
export interface OrderDTO {
  id: number;
  orderNumber: string;
  totalAmount: number;
  customerEmail: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
  internalAuditNotes: string;
}

// 2. Client-Safe View Model (Omit sensitive or internal fields)
export type OrderViewModel = Omit<OrderDTO, 'internalAuditNotes'>;

// 3. Create Order Payload (Pick only writable fields)
export type CreateOrderRequest = Pick<OrderDTO, 'orderNumber' | 'totalAmount' | 'customerEmail'>;

// 4. Update Order Payload (Make all fields optional)
export type UpdateOrderRequest = Partial<CreateOrderRequest>;

// 5. Dictionary / Lookup Map by ID
export type OrderMap = Record<number, OrderViewModel>;

// 6. Extracting Return Type of Async API Service
import { fetchOrders } from './orderService';
export type FetchOrdersResponse = Awaited<ReturnType<typeof fetchOrders>>;
```

---

## 5. GENERIC FUNCTIONS & CONSTRAINTS IN ACTION

```typescript
// Generic constraint requiring an 'id' property of type string or number
export interface Identifiable {
  id: string | number;
}

// Reusable normalizer converting arrays from Spring Boot into an indexed Record lookup
export function normalizeById<T extends Identifiable>(items: T[]): Record<string | number, T> {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string | number, T>);
}
```

---

## 6. COMMON MISTAKES
1. **Using `interface` when union types or mapped types are needed:** Interfaces cannot express union types directly (`type Status = 'active' | 'inactive'`).
2. **Over-annotating variables with obvious inferred types:**
   ```typescript
   // Unnecessary over-typing
   const count: number = 0;
   const name: string = 'Rohit';
   
   // Clean idiomatic TypeScript (Let the compiler infer)
   const count = 0;
   const name = 'Rohit';
   ```
3. **Using `any` instead of `unknown`:** `any` disables all type-checking; `unknown` enforces type narrowing before property access.

---

## 7. EXPERT INTERVIEW QUESTIONS
1. *What is the structural difference between TypeScript interfaces and type aliases, and when should you choose one over the other in an enterprise React design system?*
2. *How do Discriminated Unions eliminate impossible states in React reducers and custom hooks?*
3. *What is the difference between `any`, `unknown`, and `never`, and what is the practical use of `never` in exhaustive switch checks?*
