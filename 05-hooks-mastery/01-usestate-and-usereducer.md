# Module 5.1 — `useState` & `useReducer`: Snapshots, Queues & State Machines

## 1. WHAT
- **`useState`:** A React Hook that declares a local state variable in a functional component. It returns a tuple containing the current state snapshot and an asynchronous state updater function.
- **Lazy Initializer Function:** Passing a function to `useState(() => expensiveComputation())` guarantees that the expensive calculation runs **only once on initial mount**, rather than executing unnecessarily on every subsequent re-render.
- **`useReducer`:** An alternative hook for managing complex state logic that follows the formula $(prevState, action) \Rightarrow nextState$. It decouples "what happened" (Actions) from "how state changes" (Reducer Logic).

```
                 LAZY INITIALIZER VS EAGER INITIALIZATION
                 
  ❌ EAGER INITIALIZATION (Calculates on EVERY render!):
  const [data, setData] = useState(parse5MbJsonBlob(localStorage.getItem('cache')));
  // Every time ANY prop or state changes, parse5MbJsonBlob() runs synchronously,
  // blocking the main thread even though React only uses the result on Mount!
  
  -----------------------------------------------------------------------------------
  
  ✅ LAZY INITIALIZER (Calculates ONLY on Mount):
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem('cache');
    return raw ? JSON.parse(raw) : DEFAULT_DATA;
  });
```

---

## 2. WHY
Why state modeling discipline separates senior engineers from juniors:
1. **Preventing State Inconsistency:** When multiple state variables change together (e.g. `isSubmitting`, `isSuccess`, `errorMessage`, `submittedOrderId`), managing them with separate `useState` calls frequently leads to desynchronized state where `isSubmitting === false` but `isSuccess === false` and `errorMessage === null`.
2. **Deterministic Reducer Testing:** A pure reducer function can be unit-tested in isolation without mounting components, mocking DOM, or managing timers.

---

## 3. MODERN IMPLEMENTATION: REDUCER FINITE STATE MACHINE (FSM)

```tsx
import React, { useReducer } from 'react';

// 1. Explicit State Shapes via Discriminated Union
export type CheckoutState =
  | { status: 'idle'; cartId: string }
  | { status: 'authorizing'; cartId: string; paymentMethodId: string }
  | { status: 'completed'; cartId: string; orderConfirmationId: string }
  | { status: 'failed'; cartId: string; errorCode: string; retryCount: number };

// 2. Explicit Actions
export type CheckoutAction =
  | { type: 'SUBMIT_PAYMENT'; payload: { paymentMethodId: string } }
  | { type: 'AUTH_SUCCESS'; payload: { confirmationId: string } }
  | { type: 'AUTH_FAILURE'; payload: { errorCode: string } }
  | { type: 'RETRY' }
  | { type: 'RESET' };

// 3. Strict State Transition Table (Prevents Invalid Transitions)
export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (state.status) {
    case 'idle':
      if (action.type === 'SUBMIT_PAYMENT') {
        return {
          status: 'authorizing',
          cartId: state.cartId,
          paymentMethodId: action.payload.paymentMethodId
        };
      }
      return state;

    case 'authorizing':
      if (action.type === 'AUTH_SUCCESS') {
        return {
          status: 'completed',
          cartId: state.cartId,
          orderConfirmationId: action.payload.confirmationId
        };
      }
      if (action.type === 'AUTH_FAILURE') {
        return {
          status: 'failed',
          cartId: state.cartId,
          errorCode: action.payload.errorCode,
          retryCount: 1
        };
      }
      return state;

    case 'failed':
      if (action.type === 'RETRY' && state.retryCount < 3) {
        return {
          status: 'authorizing',
          cartId: state.cartId,
          paymentMethodId: 'retry_fallback'
        };
      }
      if (action.type === 'RESET') {
        return { status: 'idle', cartId: state.cartId };
      }
      return state;

    case 'completed':
      return state; // Terminal state: no further mutations allowed!

    default: {
      const _exhaustive: never = state;
      return state;
    }
  }
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *When should you pass a function to `useState` instead of a direct value?*
2. *How does `useReducer` prevent race conditions and impossible states compared to multiple independent `useState` calls?*
3. *Why must React reducers remain 100% pure functions with zero asynchronous calls or side effects?*
