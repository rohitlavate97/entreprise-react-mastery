# Module 3.6 — React Fundamentals Issues Lab (REACT-001 to REACT-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for core React mechanics.

---

## 🔬 REACT-001: Index as Key in Sortable / Filterable List Preserving Wrong Input State

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** When user deletes or sorts rows in a table, text entered into comments or checkboxes remains in the original visual position, attaching to the wrong data item.
- **Reproduction Code:**
  ```tsx
  {users.map((user, index) => (
    <div key={index}>
      <span>{user.name}</span>
      <input type="text" placeholder="Add note" />
    </div>
  ))}
  ```
- **Root Cause:** React matches Fiber nodes by key and position. When row 0 is deleted, the old row 1 becomes row 0. React sees key `0` still exists and updates props on the existing DOM node while preserving its local unmanaged state.
- **Fix:** Use stable entity IDs:
  ```tsx
  <div key={user.id}>
  ```

---

## 🔬 REACT-002: Unstable Key Causing Continuous Remount, Loss of Focus & Reset State

- **Severity:** 🔴 High
- **Environment:** Local / Production
- **Symptoms:** User clicks an input field and types one letter; the input immediately loses focus, animations restart, and typed text disappears.
- **Reproduction Code:**
  ```tsx
  export function FormCard() {
    return (
      // BUG: Generating a new key on every render!
      <div key={Math.random()}>
        <input type="text" placeholder="Type here..." />
      </div>
    );
  }
  ```
- **Root Cause:** On every state change, `Math.random()` generates a new key. React concludes the previous component was deleted and mounts a brand new DOM element, causing focus loss.
- **Fix:** Use stable keys or omit keys when rendering non-list siblings.

---

## 🔬 REACT-003: `0 && <Component />` Rendering Literal `0` in UI

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** The UI renders an unwanted character `0` on the screen when cart item count is zero.
- **Reproduction Code:**
  ```tsx
  <div>{cart.items.length && <CheckoutButton />}</div>
  ```
- **Root Cause:** In JavaScript, `0 && <Component />` evaluates to `0`. React renders numbers directly to the DOM.
- **Fix:** Use explicit boolean comparison:
  ```tsx
  <div>{cart.items.length > 0 && <CheckoutButton />}</div>
  ```

---

## 🔬 REACT-004: Switching Input from Uncontrolled to Controlled Warning

- **Severity:** 🟡 Medium
- **Environment:** Local Dev Console
- **Symptoms:** Warning: `A component is changing an uncontrolled input to be controlled.`
- **Reproduction Code:**
  ```tsx
  const [data, setData] = useState<{ email?: string }>({});
  return <input value={data.email} onChange={...} />;
  ```
- **Root Cause:** Initial `value` is `undefined` (uncontrolled). When state updates to a string, React detects a transition to controlled.
- **Fix:** Provide empty string fallback: `value={data.email ?? ''}`.

---

## 🔬 REACT-005: Event Propagation Between React Roots in Micro-Frontends

- **Severity:** 🔴 High
- **Environment:** Production / Micro-Frontends
- **Symptoms:** Calling `e.stopPropagation()` in a child React micro-frontend fails to prevent a parent legacy React root's click handler from firing.
- **Root Cause:** In React 16, event delegation was bound to `document`. In React 17+, event delegation is bound to the root container (`#root`).
- **Fix:** Upgrade legacy host container to React 17+ or attach stopPropagation to the micro-frontend DOM mount container.

---

## 🔬 REACT-006: Mutating Props Directly Inside Child Component

- **Severity:** 🔴 High
- **Environment:** Local / Production
- **Symptoms:** Sentry error in development: `TypeError: Cannot assign to read only property 'status' of object '#<Object>'`. In production (non-strict mode), parent and sibling components become out of sync.
- **Reproduction Code:**
  ```tsx
  function UserBadge({ user }: { user: User }) {
    user.status = 'ACTIVE'; // Direct prop mutation!
    return <span>{user.name}</span>;
  }
  ```
- **Fix:** Treat props as immutable; notify parent via callbacks: `onStatusChange('ACTIVE')`.

---

## 🔬 REACT-007: Broken Conditional Ternary Creating Unexpected Empty Text Nodes

- **Severity:** 🟡 Low
- **Environment:** Production / CSS Flexbox
- **Symptoms:** Flexbox layout has unexpected gaps or margins because of empty text nodes.
- **Fix:** Return `null` instead of empty strings `""` or `false` in ternaries when nothing should render:
  ```tsx
  {hasDiscount ? <DiscountBadge /> : null}
  ```

---

## 🔬 REACT-008: Native Document Event Listeners Firing Before React Synthetic Handlers

- **Severity:** 🟡 Medium
- **Environment:** Dropdown / Modal Click-Outside Handlers
- **Symptoms:** A dropdown menu closes immediately upon opening because the native `document.addEventListener('click')` fires before React's SyntheticEvent reaches the button.
- **Fix:** Use `e.stopPropagation()` on the React click handler or listen to the capture phase in native listeners:
  ```tsx
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => { ... };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);
  ```
