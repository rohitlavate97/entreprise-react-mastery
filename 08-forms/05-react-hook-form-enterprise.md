# Module 8.5 — React Hook Form & Enterprise Integration

## 1. WHAT
- **React Hook Form (RHF):** A performance-focused form library that uses uncontrolled inputs internally (via `register` refs) to avoid re-rendering the entire form on every keystroke, while still providing a rich API for validation, error handling, and dynamic field arrays.
- **Why RHF Outperforms Controlled Forms:** In a 50-field enterprise form, controlled inputs trigger 50 re-renders per keystroke (one per `setState`). RHF isolates re-renders to only the changed field and its error message.

```
                     PERFORMANCE COMPARISON
                     
  Controlled Form (50 fields):
  User types 1 character → setState → ENTIRE form re-renders (50 inputs)
  Cost: ~50 DOM reconciliation passes per keystroke
  
  React Hook Form (50 fields):
  User types 1 character → ref.current.value updates → NO re-render!
  Only the error message for THAT field re-renders (if validation fires)
  Cost: ~0 DOM reconciliation per keystroke (until validation)
```

---

## 2. IMPLEMENTATION: REACT HOOK FORM + ZOD RESOLVER

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  department: z.enum(['engineering', 'marketing', 'sales', 'hr'], {
    errorMap: () => ({ message: 'Select a valid department' }),
  }),
  salary: z.number().min(30000, 'Minimum salary is $30,000').max(500000),
});

type CreateEmployeePayload = z.infer<typeof createEmployeeSchema>;

export function CreateEmployeeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setError,
  } = useForm<CreateEmployeePayload>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      department: undefined,
      salary: 50000,
    },
  });

  async function onSubmit(data: CreateEmployeePayload) {
    try {
      await httpClient.post('/api/employees', data);
      reset(); // Clear form on success
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        // Map server-side field errors to RHF
        const serverErrors = error.response.data.errors;
        Object.entries(serverErrors).forEach(([field, message]) => {
          setError(field as keyof CreateEmployeePayload, {
            type: 'server',
            message: message as string,
          });
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="firstName">First Name</label>
        <input id="firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
        {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="salary">Salary</label>
        <input
          id="salary"
          type="number"
          {...register('salary', { valueAsNumber: true })}
          aria-invalid={!!errors.salary}
        />
        {errors.salary && <p className="text-red-500">{errors.salary.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Creating...' : 'Create Employee'}
      </button>
    </form>
  );
}
```

---

## 3. DYNAMIC FIELD ARRAYS (`useFieldArray`)

```tsx
import { useForm, useFieldArray } from 'react-hook-form';

interface InvoiceForm {
  invoiceNumber: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
}

export function InvoiceEditor() {
  const { register, control, handleSubmit } = useForm<InvoiceForm>({
    defaultValues: {
      invoiceNumber: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('invoiceNumber')} placeholder="INV-001" />

      {fields.map((field, index) => (
        <div key={field.id}> {/* Use field.id, NOT index! */}
          <input {...register(`lineItems.${index}.description`)} />
          <input type="number" {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })} />
          <input type="number" {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}

      <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
        Add Line Item
      </button>
      <button type="submit">Save Invoice</button>
    </form>
  );
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *How does React Hook Form achieve near-zero re-renders on keystroke compared to controlled form state?*
2. *Why should you use `field.id` (from `useFieldArray`) as the `key` prop instead of the array index?*
3. *How do you map server-side 422 validation errors back to React Hook Form's `setError` API?*
