# Module 3.5 — Form Mechanics: Controlled vs. Uncontrolled Components

## 1. WHAT
- **Controlled Component:** A form input element whose current value is driven directly by React state (`value={state}`) and updated via explicit event handlers (`onChange={(e) => setState(e.target.value)}`). React state is the **Single Source of Truth**.
- **Uncontrolled Component:** A form input element where the browser DOM retains and manages its own internal state (`defaultValue="initial"`). Form values are queried imperatively on submit using a `useRef` reference or the native `FormData` API.

$$\begin{array}{|l|l|l|}
\hline
\textbf{Dimension} & \textbf{Controlled Component} & \textbf{Uncontrolled Component} \\ \hline
\textbf{Source of Truth} & React State (`useState`) & Native Browser DOM Node \\ \hline
\textbf{Value Property} & `value={state}` + `onChange` & `defaultValue={init}` + `ref` or `FormData` \\ \hline
\textbf{Re-render on keystroke} & ✅ YES (on every input change) & ❌ NO (zero re-renders during typing) \\ \hline
\textbf{Instant validation / masking} & 🟢 Trivial (instant dynamic UI) & 🟡 Complex (requires imperative listeners) \\ \hline
\textbf{Form submit performance} & 🟡 Re-renders parent component & 🟢 Ultra-fast (reads directly from DOM on submit) \\ \hline
\end{array}$$

---

## 2. MODERN IMPLEMENTATION

### Pattern A: Controlled Form (Ideal for Dynamic UI, Masking, & Instant Feedback)
```tsx
import React, { useState } from 'react';

export function ControlledForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'USER'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting controlled state:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Username:</label>
        {/* SAFE: Ensure value is never undefined to prevent uncontrolled-to-controlled warning! */}
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Pattern B: Uncontrolled Form with Native `FormData` (High Performance)
```tsx
import React from 'react';

export function UncontrolledForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Read all form inputs directly from the DOM using standard FormData
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    console.log('Submitting native DOM payload:', payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="username" defaultValue="" placeholder="Username" />
      <input name="email" type="email" defaultValue="" placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 3. COMMON MISTAKES: THE UNCONTROLLED-TO-CONTROLLED WARNING

### The Warning:
`Warning: A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value.`

### Root Cause:
If an input is rendered with `value={user.phone}` where `user.phone` is initially `undefined`, React initializes the DOM element as an **uncontrolled input**. When the API response populates `user.phone = "555-1234"`, React suddenly treats the input as **controlled**, triggering the warning.

### Fix:
Always supply a fallback string:
```tsx
<input value={user?.phone ?? ''} onChange={handleChange} />
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What causes the React warning "A component is changing an uncontrolled input to be controlled", and how do you ensure an input never triggers this warning?*
2. *Under what conditions is an uncontrolled form with `FormData` preferred over a controlled form with React state?*
3. *How do React 19 form actions and Server Actions enhance the uncontrolled form model?*
