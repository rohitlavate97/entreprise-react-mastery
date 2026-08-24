# Module 2.2 — Production React TypeScript Patterns & Component Architecture

## 1. WHAT
**React-Specific TypeScript Patterns** are the standard typing techniques used to model React components, hooks, synthetic events, DOM references, context providers, and state reducers with end-to-end type safety.

$$\begin{array}{|l|l|l|}
\hline
\textbf{React Construct} & \textbf{Accurate TypeScript Type} & \textbf{Common Mistake} \\ \hline
\text{Component Children} & \text{React.ReactNode} & \text{Using ReactElement (blocks strings/numbers)} \\ \hline
\text{Input Change Event} & \text{React.ChangeEvent<HTMLInputElement>} & \text{Using generic Event or any} \\ \hline
\text{Form Submit Event} & \text{React.FormEvent<HTMLFormElement>} & \text{Using React.SyntheticEvent} \\ \hline
\text{DOM Element Ref} & \text{useRef<HTMLDivElement>(null)} & \text{useRef<HTMLDivElement>() (omitting null)} \\ \hline
\text{Mutable Value Ref} & \text{useRef<number>(0)} & \text{useRef<number | null>(null)} \\ \hline
\text{Hook Tuple Return} & \text{[state, setState] as const} & \text{Omitting 'as const' (infers (T \| Fn)[])} \\ \hline
\end{array}$$

---

## 2. COMPONENT PROPS & CHILDREN PATTERNS

```tsx
import React, { ReactNode, ReactElement } from 'react';

// Standard Component Props
export interface CardProps {
  title: string;
  subtitle?: string; // Optional prop
  variant?: 'elevated' | 'outlined' | 'flat';
  children: ReactNode; // Accepts JSX, strings, numbers, fragments, portals, null
  onAction?: (actionId: string) => void;
}

export function Card({
  title,
  subtitle,
  variant = 'elevated',
  children,
  onAction
}: CardProps) {
  return (
    <div className={`card card-${variant}`}>
      <h3>{title}</h3>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <div className="card-body">{children}</div>
      {onAction && (
        <button onClick={() => onAction('card_clicked')}>Action</button>
      )}
    </div>
  );
}
```

---

## 3. GENERIC REUSABLE COMPONENTS

Generic components allow reusable components (e.g. data grids, searchable select menus) to maintain strict typing across varied domain models.

```tsx
import React, { ReactNode } from 'react';

export interface DataTableProps<T> {
  data: T[];
  keyExtractor: (item: T) => string | number;
  columns: {
    header: string;
    render: (item: T) => ReactNode;
  }[];
  onRowClick?: (item: T) => void;
}

// Generic Component Definition
export function DataTable<T>({
  data,
  keyExtractor,
  columns,
  onRowClick
}: DataTableProps<T>) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="p-2 border">{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr 
            key={keyExtractor(item)} 
            onClick={() => onRowClick?.(item)}
            className="cursor-pointer hover:bg-gray-100"
          >
            {columns.map((col, idx) => (
              <td key={idx} className="p-2 border">{col.render(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 4. TYPE-SAFE CONTEXT PATTERN (NO IMPLICIT ANY / NO UNSAFE CASTING)

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { token: string; user: User }) => void;
  logout: () => void;
}

// 1. Initialize context with null (NOT an empty object cast!)
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = ({ user }: { token: string; user: User }) => setUser(user);
  const logout = () => setUser(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 2. Custom hook with non-null assertion guard
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
```

---

## 5. REDUCER STATE MACHINE WITH DISCRIMINATED ACTIONS

```tsx
import React, { useReducer } from 'react';

// 1. Discriminated Union Actions
export type OrderAction =
  | { type: 'SUBMIT_ORDER'; payload: { items: string[] } }
  | { type: 'ORDER_SUCCESS'; payload: { orderId: string } }
  | { type: 'ORDER_FAILURE'; payload: { errorMessage: string } }
  | { type: 'RESET_ORDER' };

// 2. State Shape
export interface OrderState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  orderId: string | null;
  errorMessage: string | null;
}

const initialState: OrderState = {
  status: 'idle',
  orderId: null,
  errorMessage: null
};

// 3. Exhaustive Pure Reducer
export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'SUBMIT_ORDER':
      return { status: 'submitting', orderId: null, errorMessage: null };
    case 'ORDER_SUCCESS':
      return { status: 'success', orderId: action.payload.orderId, errorMessage: null };
    case 'ORDER_FAILURE':
      return { status: 'error', orderId: null, errorMessage: action.payload.errorMessage };
    case 'RESET_ORDER':
      return initialState;
    default: {
      // Exhaustiveness check: If a new action is added, TypeScript flags compilation error here!
      const _exhaustive: never = action;
      return state;
    }
  }
}
```

---

## 6. EXPERT INTERVIEW QUESTIONS
1. *What is the practical difference between `ReactNode` and `ReactElement`, and when must you use `ReactElement`?*
2. *Why does omitting `as const` on custom hook tuple returns cause typing errors at call sites?*
3. *Why is initializing `createContext<AuthType>({} as AuthType)` an enterprise anti-pattern, and what is the proper fail-fast pattern?*
