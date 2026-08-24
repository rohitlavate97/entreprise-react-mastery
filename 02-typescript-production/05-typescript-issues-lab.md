# Module 2.5 — TypeScript Issues Lab (TS-001 to TS-008)

This lab contains practical, reproducible failure modes, root-cause analyses, type checker diagnostic traces, and permanent fixes for TypeScript bugs in React.

---

## 🔬 TS-001: Unsound `as Type` Casting on Spring Boot Payload Causing Runtime Null Crash

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** Sentry captures `TypeError: Cannot read properties of null (reading 'toLowerCase')`. Frontend passed TypeScript build without any compiler warnings.
- **Reproduction Code:**
  ```typescript
  interface UserProfileDTO {
    id: number;
    email: string; // Typed as non-null string
  }

  async function loadUser(id: number) {
    const res = await fetch(`/api/users/${id}`);
    // BUG: Forced cast. If Spring Boot returns { id: 1, email: null }, TS doesn't know!
    const user = (await res.json()) as UserProfileDTO;
    return user.email.toLowerCase(); // CRASHES at runtime!
  }
  ```
- **Root Cause:** TypeScript types are erased at runtime. Type assertion `as UserProfileDTO` forced the compiler to bypass type checking without validating the actual JSON payload.
- **Fix:** Parse with Zod or a runtime guard:
  ```typescript
  const UserSchema = z.object({ id: z.number(), email: z.string() });
  const user = UserSchema.parse(await res.json());
  ```

---

## 🔬 TS-002: Missing Discriminated Union Tag Allowing Impossible State

- **Severity:** 🔴 High
- **Environment:** Local / Production
- **Symptoms:** UI simultaneously renders both a "Loading..." spinner and an "Error: 500" alert banner.
- **Reproduction Code:**
  ```tsx
  interface State {
    isLoading: boolean;
    error: string | null;
    data: string[] | null;
  }
  // If a reducer sets { isLoading: true, error: 'Failed' }, both UI branches evaluate to true!
  ```
- **Fix:** Refactor to a Discriminated Union:
  ```typescript
  type State =
    | { status: 'loading' }
    | { status: 'error'; error: string }
    | { status: 'success'; data: string[] };
  ```

---

## 🔬 TS-003: `ReactNode` vs `ReactElement` Prop Type Mismatch

- **Severity:** 🟡 Medium
- **Environment:** Local Dev / Build
- **Symptoms:** TypeScript compilation error: `Type 'string' is not assignable to type 'ReactElement'`.
- **Reproduction Code:**
  ```tsx
  interface ButtonProps {
    label: React.ReactElement; // Overly restrictive!
  }
  // Calling <Button label="Submit" /> throws TypeScript compilation error
  ```
- **Root Cause:** `ReactElement` only accepts JSX objects (e.g. `<span />`), whereas `ReactNode` accepts JSX, strings, numbers, booleans, fragments, and null.
- **Fix:** Use `ReactNode` for general children/labels:
  ```tsx
  interface ButtonProps {
    label: React.ReactNode;
  }
  ```

---

## 🔬 TS-004: `useRef` Type Mismatch (`RefObject` vs `MutableRefObject`)

- **Severity:** 🟡 Medium
- **Environment:** Local Dev / Build
- **Symptoms:** TypeScript error: `Cannot assign to 'current' because it is a read-only property.`
- **Reproduction Code:**
  ```tsx
  export function InputFocus() {
    // BUG: Omitting null creates a MutableRefObject<HTMLInputElement | undefined>
    const inputRef = useRef<HTMLInputElement>(); 
    // Passing to JSX <input ref={inputRef} /> triggers type mismatch
  }
  ```
- **Root Cause:** In React's types:
  - `useRef<HTMLInputElement>(null)` $\rightarrow$ returns `RefObject<HTMLInputElement>` (whose `.current` is read-only for you, managed by React's DOM ref attachment).
  - `useRef<HTMLInputElement>()` $\rightarrow$ returns `MutableRefObject<HTMLInputElement | undefined>` (intended for mutable variables, not DOM nodes).
- **Fix:** Always provide `null` as initial value for DOM refs:
  ```tsx
  const inputRef = useRef<HTMLInputElement>(null);
  ```

---

## 🔬 TS-005: Custom Hook Returning Mutable Array Instead of `readonly` Tuple

- **Severity:** 🟡 Medium
- **Environment:** Local Dev
- **Symptoms:** Destructuring a custom hook results in mixed union types:
  `const [state, setState] = useToggle();` $\rightarrow$ `state` is inferred as `boolean | (() => void)`.
- **Reproduction Code:**
  ```tsx
  export function useToggle(initial = false) {
    const [value, setValue] = useState(initial);
    const toggle = () => setValue(v => !v);
    return [value, toggle]; // TypeScript infers (boolean | (() => void))[]
  }
  ```
- **Fix:** Add `as const`:
  ```tsx
  return [value, toggle] as const; // Infers readonly [boolean, () => void]
  ```

---

## 🔬 TS-006: Generic Component Constraint Violation

- **Severity:** 🟡 Medium
- **Environment:** Local Dev
- **Symptoms:** Generic `<Select<T> />` component fails to compile when accessing `item.id` or `item.label`.
- **Fix:** Constrain the generic parameter:
  ```tsx
  interface OptionItem {
    id: string | number;
    label: string;
  }
  export function Select<T extends OptionItem>({ options }: { options: T[] }) {
    return (
      <select>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
      </select>
    );
  }
  ```

---

## 🔬 TS-007: Context Initialized with Empty Object Cast Throwing Runtime Undefined

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** `TypeError: Cannot read properties of undefined (reading 'user')` when rendering components outside the Provider tree.
- **Reproduction Code:**
  ```tsx
  const AuthContext = createContext<AuthContextType>({} as AuthContextType);
  ```
- **Root Cause:** Casting `{}` as `AuthContextType` lies to TypeScript. If a consumer calls `useContext(AuthContext)` outside `<AuthProvider>`, TypeScript thinks all methods exist, but at runtime they are `undefined`.
- **Fix:** Initialize with `null` and throw an explicit error in a custom hook (as built in Module 2.2).

---

## 🔬 TS-008: Unhandled `undefined` From Optional Chaining

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Form submits payload `{ orderTotal: NaN, address: undefined }` to Spring Boot. Spring Boot rejects with `400 Bad Request` or corrupts database records.
- **Reproduction Code:**
  ```typescript
  const total = cart?.subtotal * taxRate; // If cart is undefined, total is NaN
  ```
- **Fix:** Combine optional chaining with explicit nullish coalescing:
  ```typescript
  const subtotal = cart?.subtotal ?? 0;
  const total = subtotal * taxRate;
  ```
