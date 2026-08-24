# Module 8.3 — Multi-Step / Wizard Forms: State Persistence, Step Validation & Navigation

## 1. WHAT
- **Multi-Step (Wizard) Form:** A complex form broken into sequential steps/pages where the user completes one section at a time. Each step is validated independently before allowing progression. The final step aggregates all data and submits to the server.
- **Step State Persistence:** Form data from completed steps must survive navigation between steps (back/forward) without losing user input.

```
                     WIZARD FORM ARCHITECTURE
                     
  Step 1: Personal Info ──> Step 2: Address ──> Step 3: Payment ──> Step 4: Review & Submit
       │                        │                     │                     │
   Validate:                Validate:             Validate:             Aggregate:
   name, email              street, city,         card number,          Show all data,
                            zipCode               expiry, CVV           submit to API
       │                        │                     │                     │
   ────┴────────────────────────┴─────────────────────┴─────────────────────┘
                              Shared State (useReducer or Context)
```

---

## 2. IMPLEMENTATION: TYPE-SAFE WIZARD WITH `useReducer`

```tsx
import React, { useReducer } from 'react';
import { z } from 'zod';

// ── Step Schemas ──
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Must be 5 digits'),
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, '16-digit card number required'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'MM/YY format required'),
  cvv: z.string().regex(/^\d{3,4}$/, '3 or 4 digit CVV required'),
});

// ── Wizard State ──
interface WizardState {
  currentStep: number;
  personalInfo: z.infer<typeof personalInfoSchema>;
  address: z.infer<typeof addressSchema>;
  payment: z.infer<typeof paymentSchema>;
}

type WizardAction =
  | { type: 'UPDATE_PERSONAL'; payload: Partial<z.infer<typeof personalInfoSchema>> }
  | { type: 'UPDATE_ADDRESS'; payload: Partial<z.infer<typeof addressSchema>> }
  | { type: 'UPDATE_PAYMENT'; payload: Partial<z.infer<typeof paymentSchema>> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number };

const initialState: WizardState = {
  currentStep: 0,
  personalInfo: { firstName: '', lastName: '', email: '' },
  address: { street: '', city: '', zipCode: '' },
  payment: { cardNumber: '', expiryDate: '', cvv: '' },
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'UPDATE_PERSONAL':
      return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };
    case 'UPDATE_ADDRESS':
      return { ...state, address: { ...state.address, ...action.payload } };
    case 'UPDATE_PAYMENT':
      return { ...state, payment: { ...state.payment, ...action.payload } };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 3) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
}

// ── Step Validation Before Advancing ──
const STEP_SCHEMAS = [personalInfoSchema, addressSchema, paymentSchema];

function validateCurrentStep(state: WizardState): z.ZodError | null {
  const schema = STEP_SCHEMAS[state.currentStep];
  if (!schema) return null;

  const stepData = [state.personalInfo, state.address, state.payment][state.currentStep];
  const result = schema.safeParse(stepData);
  return result.success ? null : result.error;
}
```

---

## 3. PREVENTING DATA LOSS ON ACCIDENTAL NAVIGATION

```tsx
import { useBlocker } from 'react-router-dom';

export function CheckoutWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const isDirty = state.currentStep > 0; // User has started filling the form

  // Block navigation away from wizard if form is dirty
  const blocker = useBlocker(isDirty);

  return (
    <div>
      {blocker.state === 'blocked' && (
        <ConfirmDialog
          message="You have unsaved changes. Leave this page?"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
      <ProgressBar currentStep={state.currentStep} totalSteps={4} />
      {/* Step components render based on state.currentStep */}
    </div>
  );
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why should wizard form state live in `useReducer` or Context rather than separate `useState` calls per step?*
2. *How do you validate only the current step's fields before allowing the user to advance?*
3. *How does `useBlocker` prevent accidental data loss when users navigate away from a partially completed wizard?*
