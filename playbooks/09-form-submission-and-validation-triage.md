# Playbook PB-009 — Form Submission & Validation Triage

## Objective
Provide an operational triage workflow for diagnosing form submission failures, validation edge cases, and idempotency violations in enterprise React + Spring Boot applications.

---

## 1. Double Submission / Duplicate Record Triage

```
[ Step 1: Detect Duplicates ]
  - Database query: SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 5 MINUTES
    AND customer_id = ? GROUP BY idempotency_key HAVING COUNT(*) > 1
             │
[ Step 2: Check Frontend Guards ]
  - Is the submit button disabled during isSubmitting/isPending?
  - Is an idempotency key generated on form mount and sent in headers?
             │
[ Step 3: Check Backend Guards ]
  - Does the API endpoint check for existing idempotency key in Redis/DB?
  - Is the idempotency key check BEFORE or AFTER the business logic?
             │
[ Step 4: Implement Triple Defense ]
  1. Frontend: disabled={isSubmitting}
  2. Frontend: Idempotency-Key header
  3. Backend: Redis-based key deduplication
```

---

## 2. Validation Error Triage

```
[ Step 1: Identify Validation Layer ]
  - Does the error appear BEFORE form submit? → Client-side validation issue.
  - Does the error appear AFTER 422 response? → Server-side validation mapping issue.
             │
[ Step 2: Check Error Display ]
  - Are errors cleared on field edit (onChange/onBlur)?
  - Are server errors mapped to specific fields or shown as a generic toast?
             │
[ Step 3: Check Schema Alignment ]
  - Does the Zod schema on the frontend match the Bean Validation on the backend?
  - Are there fields validated on the server but NOT on the client? (e.g., uniqueness)
```

---

## 3. Form State Loss Triage

```
[ Step 1: Reproduce ]
  - Fill form → navigate away → come back. Is data preserved?
  - Fill wizard Step 1-3 → press browser Back. Is step data preserved?
             │
[ Step 2: Check State Persistence ]
  - Is wizard state in useReducer or Context (survives step changes)?
  - Is sessionStorage used as a persistence layer for multi-page forms?
  - Does useBlocker prevent accidental navigation away from dirty forms?
```
