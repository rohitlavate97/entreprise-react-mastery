# Module 8.1 — Controlled vs Uncontrolled Form Architecture

## 1. WHAT
- **Controlled Form:** Every input's value is held in React state (`useState` or `useReducer`). React is the single source of truth. Every keystroke triggers `onChange → setState → re-render`.
- **Uncontrolled Form:** Input values live in the DOM itself. React reads values on demand via `useRef` or the native `FormData` API at submission time. No re-render occurs on every keystroke.
- **The `FormData` API:** A browser-native API that extracts all named input values from a `<form>` element at submission time — zero `useState` calls required.

```
                CONTROLLED vs UNCONTROLLED DECISION MATRIX
                
  ┌────────────────────────────────┬───────────────┬─────────────────┐
  │ Requirement                    │ Controlled    │ Uncontrolled    │
  ├────────────────────────────────┼───────────────┼─────────────────┤
  │ Real-time validation on type   │ ✅ Best fit   │ ❌ Not possible │
  │ Conditional field rendering    │ ✅ Best fit   │ ❌ Awkward      │
  │ Dynamic calculated fields      │ ✅ Best fit   │ ❌ Not possible │
  │ Simple contact/feedback form   │ ⚠️ Overkill   │ ✅ Best fit     │
  │ Performance (100+ fields)      │ ❌ Re-render  │ ✅ Zero render  │
  │ File uploads                   │ ❌ Can't hold │ ✅ Native DOM   │
  │ Integration with legacy DOM    │ ❌ Conflict   │ ✅ Best fit     │
  └────────────────────────────────┴───────────────┴─────────────────┘
```

---

## 2. CONTROLLED FORM (REACT STATE OWNS EVERY VALUE)

```tsx
import React, { useState, FormEvent } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function ControlledContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time field-level validation (only possible with controlled inputs)
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log('Submitting:', formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      {errors.name && <span className="text-red-500">{errors.name}</span>}

      <input name="email" value={formData.email} onChange={handleChange} />
      {errors.email && <span className="text-red-500">{errors.email}</span>}

      <textarea name="message" value={formData.message} onChange={handleChange} />

      <button type="submit">Send</button>
    </form>
  );
}
```

---

## 3. UNCONTROLLED FORM (DOM OWNS VALUES, READ ON SUBMIT)

```tsx
import React, { FormEvent } from 'react';

export function UncontrolledContactForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };
    console.log('Submitting:', payload);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" defaultValue="" required />
      <input name="email" type="email" defaultValue="" required />
      <textarea name="message" defaultValue="" required />
      <button type="submit">Send</button>
    </form>
  );
}
// Zero useState. Zero onChange handlers. Zero re-renders during typing.
```

---

## 4. COMMON MISTAKE: MIXING CONTROLLED AND UNCONTROLLED

```tsx
// ❌ WARNING: "A component is changing an uncontrolled input to be controlled"
function BrokenForm() {
  const [email, setEmail] = useState<string | undefined>(undefined);
  // First render: value={undefined} → UNCONTROLLED
  // After typing: value="a@b.com"  → CONTROLLED — mode switch triggers React warning!

  return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
}

// ✅ FIX: Always initialize with a string (even empty string)
function FixedForm() {
  const [email, setEmail] = useState('');  // '' is defined → always controlled
  return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *What is the fundamental difference between a controlled and uncontrolled input, and which should you use for real-time validation?*
2. *How does the `FormData` API eliminate the need for `useState` in simple forms?*
3. *What causes the "changing an uncontrolled input to be controlled" React warning, and how do you prevent it?*
