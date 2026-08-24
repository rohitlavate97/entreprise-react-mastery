# Module 1.2 — Referential Identity, Immutability & Object.is in React

## 1. WHAT
- **Primitive Types:** Stored by value in the Stack/Memory (`number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`). Two primitives with identical values are strictly equal: `5 === 5` (true).
- **Reference Types:** Stored by reference in the Memory Heap (`Object`, `Array`, `Function`, `Map`, `Set`). Two distinct objects with identical properties have distinct memory addresses: `{ id: 1 } === { id: 1 }` (false).
- **`Object.is(val1, val2)`:** The exact equality algorithm React uses to compare previous state with incoming state. It behaves identically to `===` except:
  1. `Object.is(NaN, NaN)` is `true` (`NaN === NaN` is `false`).
  2. `Object.is(+0, -0)` is `false` (`+0 === -0` is `true`).

```
                    MEMORY HEAP & REFERENTIAL EQUALITY
                    
  Memory Address 0x001A: { name: "Rohit", role: "Architect" }
  
  Case 1: In-Place Mutation
  user.role = "Lead"; 
  // Memory Address remains 0x001A!
  // Object.is(prevUser, nextUser) -> TRUE -> React bails out of rendering! (NO UI UPDATE)
  
  Case 2: Immutable Replacement
  const nextUser = { ...user, role: "Lead" };
  // Allocates new Memory Address 0x002B: { name: "Rohit", role: "Lead" }
  // Object.is(0x001A, 0x002B) -> FALSE -> React triggers Re-render! (UI UPDATES)
```

---

## 2. WHY
Why immutability is the cornerstone of React engineering:
1. **Change Detection via $O(1)$ Pointer Check:** React cannot perform deep property-by-property comparison across massive nested state trees on every render ($O(N)$ CPU cost). Checking referential pointer identity (`Object.is(prev, next)`) takes **$O(1)$ constant time (nanoseconds)**.
2. **Predictable Component Re-renders:** If you mutate an object in place and pass it to `setState(user)`, React checks `Object.is(prev, next)`, sees the exact same memory address pointer, and **bails out of rendering entirely**. The UI will not update.
3. **Time-Travel Debugging & React Memoization:** Tools like Redux DevTools and `React.memo` depend on snapshot immutability to determine whether component props have actually changed.

---

## 3. INTERNAL MENTAL MODEL: SPREAD OPERATOR GOTCHAS

The spread operator (`...`) performs a **shallow copy** (copies top-level properties and copies nested pointers without cloning nested structures).

```javascript
const user = {
  id: 101,
  profile: {
    theme: 'dark',
    notifications: { email: true, sms: false }
  }
};

// SHALLOW COPY:
const updatedUser = { ...user, id: 102 };

// GOTCHA: updatedUser.profile points to the EXACT SAME object in memory as user.profile!
console.log(user.profile === updatedUser.profile); // TRUE!

// Mutating updatedUser.profile.theme will accidentally mutate the original user object!
updatedUser.profile.theme = 'light';
console.log(user.profile.theme); // 'light' (State corruption!)
```

---

## 4. MODERN IMMUTABLE UPDATE PATTERNS

### A. Updating Nested Objects
```typescript
// Pattern 1: Nested Spread (Manual)
setUser(prev => ({
  ...prev,
  profile: {
    ...prev.profile,
    theme: 'light',
    notifications: {
      ...prev.profile.notifications,
      sms: true
    }
  }
}));

// Pattern 2: Deep Cloning with structuredClone (Native Browser API)
// Ideal for complex object isolation before mutation
const cloned = structuredClone(user);
cloned.profile.notifications.sms = true;
setUser(cloned);
```

### B. Updating Arrays Immutably
| Operation | ❌ Bad (Mutating) | ✅ Modern Recommended (Immutable) |
|---|---|---|
| **Add item** | `arr.push(item)` | `[...arr, item]` |
| **Prepend item** | `arr.unshift(item)` | `[item, ...arr]` |
| **Remove item** | `arr.splice(index, 1)` | `arr.filter((_, i) => i !== index)` |
| **Update item at index** | `arr[i] = newItem` | `arr.map((item, i) => i === targetIndex ? newItem : item)` |
| **Sort array** | `arr.sort()` | `[...arr].sort()` (or `arr.toSorted()` in ES2023) |
| **Reverse array** | `arr.reverse()` | `[...arr].reverse()` (or `arr.toReversed()` in ES2023) |

---

## 5. COMMON MISTAKES
1. **Calling `.sort()`, `.reverse()`, or `.splice()` directly on React state:** Mutates the underlying state array in place, causing unpredictable render anomalies.
2. **Mutating state inside `useMemo` or `useCallback`:**
   ```javascript
   const sortedUsers = useMemo(() => {
     // CRITICAL BUG: users.sort() mutates the original users array!
     return users.sort((a, b) => a.id - b.id);
   }, [users]);
   ```
3. **Assuming `Object.assign({}, obj)` is a deep copy:** `Object.assign` is shallow, identical to the spread operator.

---

## 6. EXPERT INTERVIEW QUESTIONS
1. *Why does React use `Object.is` for state comparison instead of a deep recursive object comparison?*
2. *What is the difference between shallow copy and deep copy, and what are the performance implications of using `structuredClone` inside high-frequency React event handlers?*
3. *Why does `[...items].sort()` prevent React state corruption while `items.sort()` causes silent bugs?*
