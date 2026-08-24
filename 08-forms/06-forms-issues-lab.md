# Module 8.6 — Forms Issues Lab (FORM-001 to FORM-008)

This lab contains practical, reproducible failure modes, root-cause analyses, and permanent fixes for enterprise form engineering.

---

## 🔬 FORM-001: Double Form Submission Creating Duplicate Records

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** Customer submits a payment form. Two identical charge records appear in the database. Customer is billed twice. Finance team opens an incident.
- **Root Cause:** Submit button is not disabled during the async API call. User double-clicks or presses Enter twice quickly. No server-side idempotency guard exists.
- **Fix:** Triple defense: (1) Disable button with `isSubmitting` state, (2) Send client-generated `Idempotency-Key` header, (3) Backend deduplicates via Redis key check.

---

## 🔬 FORM-002: Validation Error Flash (Errors Show Then Immediately Disappear)

- **Severity:** 🟡 Medium
- **Environment:** Local / Production
- **Symptoms:** User clicks Submit with invalid fields. Error messages flash briefly, then vanish. The form appears to reset.
- **Root Cause:** `handleSubmit` calls `e.preventDefault()` but the component also has a competing `useEffect` that clears the error state on re-render, or the form is accidentally re-mounted by a parent state change.
- **Fix:** Ensure error state is cleared ONLY by explicit user action (editing the field) or form reset, never by an automatic side-effect.

---

## 🔬 FORM-003: Uncontrolled-to-Controlled Input Warning on Optional Fields

- **Severity:** 🟡 Medium
- **Environment:** Local Development
- **Symptoms:** Console warning: "A component is changing an uncontrolled input to be controlled."
- **Root Cause:** Optional form fields initialized as `undefined` in state. When user types, `value` changes from `undefined` to a string, switching the input from uncontrolled to controlled.
- **Fix:** Initialize ALL form field values with empty strings `''`, never `undefined` or `null`.

---

## 🔬 FORM-004: Wizard Step Data Lost on Browser Back Navigation

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** User completes Steps 1-3 of a checkout wizard. They press the browser Back button to revisit Step 2. All data from Steps 2 and 3 is lost because the wizard component unmounts and remounts with initial state.
- **Root Cause:** Wizard step state lives in local `useState` that resets on unmount. No state persistence mechanism exists.
- **Fix:** Use `useReducer` with all step data in a single state object. Alternatively, persist wizard state to `sessionStorage` and restore on mount.

---

## 🔬 FORM-005: Number Input Submitting String Instead of Number

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** API returns 400 Bad Request because the `quantity` field is sent as `"5"` (string) instead of `5` (number). Spring Boot `@RequestBody` fails to parse the JSON payload.
- **Root Cause:** HTML `<input type="number">` always returns a string from `.value`. Without explicit conversion, the form payload contains string values where numbers are expected.
- **Fix:** Use React Hook Form's `{ valueAsNumber: true }` in `register`, or manually parse with `Number(value)` or Zod's `z.coerce.number()`.

---

## 🔬 FORM-006: `useFieldArray` Using Index as Key Corrupting Dynamic Row State

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** User adds 3 invoice line items, fills data for all 3, then removes the 2nd item. The 3rd item's data now appears in the 2nd position, but the input values show the old 2nd item's data (state corruption).
- **Root Cause:** Using array `index` as the `key` prop for dynamic field rows. When an item is removed from the middle, React reconciles based on index positions, not identity.
- **Fix:** Use `field.id` from `useFieldArray` as the `key` prop. This provides a stable, unique identifier per field row.

---

## 🔬 FORM-007: Server Validation Errors Not Mapped Back to Form Fields

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Server returns 422 with `{ errors: { email: "Already exists" } }`. The form shows a generic "Submission failed" toast but does NOT highlight the email field with the specific server error message.
- **Root Cause:** The error handler catches the 422 response but only displays a generic notification. It does not map server field errors back to the form's error state or React Hook Form's `setError`.
- **Fix:** Parse the 422 response body, iterate over `errors`, and call `setError(fieldName, { type: 'server', message })` for each field.

---

## 🔬 FORM-008: Form Re-submission After Network Timeout Without Idempotency Guard

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** The API call times out after 30 seconds. The user sees an error and clicks Submit again. The backend actually processed the first request successfully (it was just slow), so now two records exist.
- **Root Cause:** No idempotency key is sent with the request. The backend treats the retry as a brand new request because there is no deduplication mechanism.
- **Fix:** Generate an idempotency key on form mount (`useRef(uuidv4())`). Send it with every submission. Backend checks Redis for the key before processing.
