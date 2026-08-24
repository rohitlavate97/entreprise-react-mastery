# Module 22.2 — TypeScript & Performance Anti-Pattern Checklist

## 1. TYPESCRIPT REVIEW FLAGS (INSTANT CODE SMELLS)

```typescript
// ❌ 1. UNSAFE TYPE ASSERTION (Bypasses Compiler Safety)
const user = response.data as UserProfile; // If API schema changes, crashes at runtime!

// ✅ FIX: Validate at the network boundary using Zod
const user = UserProfileSchema.parse(response.data);

// ❌ 2. DANGEROUS NON-NULL ASSERTION
const address = user!.address!.city; // Throws "Cannot read properties of undefined"

// ✅ FIX: Optional chaining with fallback
const address = user?.address?.city ?? 'Unknown';

// ❌ 3. "any" TYPE ESCAPE HATCH
function handleEvent(payload: any) { ... }

// ✅ FIX: Discriminated Union or unknown with type guard
function handleEvent(payload: AppEvent) { ... }
```

---

## 2. PERFORMANCE REVIEW FLAGS

```tsx
// ❌ 1. UN-MEMOIZED OBJECT LITERAL IN DEPENDENCIES (Triggers Infinite Loop)
useEffect(() => {
  fetchData(options);
}, [{ page: 1, limit: 10 }]); // New object reference on EVERY render!

// ✅ FIX: Hoist static configuration outside component
const FETCH_CONFIG = { page: 1, limit: 10 };

// ❌ 2. ARRAY INDEX USED AS KEY ON DYNAMIC RE-ORDERABLE LISTS
{items.map((item, index) => <OrderItem key={index} data={item} />)} // Destroys DOM state on delete/sort!

// ✅ FIX: Use stable entity primary keys
{items.map((item) => <OrderItem key={item.id} data={item} />)}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why is `as unknown as TargetType` a major code smell during pull request review?*
2. *How do inline object literals passed as props cause unnecessary re-renders in `React.memo` components?*
3. *Why does using array index as `key` break form state in dynamically re-ordered list items?*
