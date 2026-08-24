# Project 1 — React Foundations & Core Mechanics App

A runnable, interactive laboratory designed to solidify core React mental models through live Break-and-Fix drills.

---

## 🎯 Learning Objectives & Built-in Drills

1. **Drill 1: Direct State Mutation vs Referential Identity**
   - **Bug:** Mutating state array in-place via `todos.push(...)`.
   - **Why it breaks:** React's reconciliation engine uses `Object.is(prev, next)` shallow equality. When the array reference is identical, React skips re-rendering.
   - **Fix:** Return an immutable copy `[...todos, newItem]`.

2. **Drill 2: Missing `useEffect` Cleanup & Timer Leaks**
   - **Bug:** Registering `setInterval` without returning a cleanup function.
   - **Why it breaks:** When the component unmounts or re-renders, the interval continues running in background memory, causing memory leaks and accelerated counting.
   - **Fix:** Return a cleanup function `() => clearInterval(id)`.

3. **Drill 3: Array Index as Key on Dynamic Re-orderable Lists**
   - **Bug:** Using `key={index}` on lists where items can be deleted or sorted.
   - **Why it breaks:** React maps DOM nodes by key index. Deleting the first item causes React to preserve the old unmanaged input DOM state in index `0`.
   - **Fix:** Use stable entity IDs `key={contact.id}`.

---

## 🚀 Running the Project Locally

```bash
# 1. Navigate to project directory
cd projects/01-react-foundations-app

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run automated Vitest test suite
npm test
```
