# Playbook PB-003 — TypeScript API Boundary & Runtime Contract Validation Triage

## Objective
Provide an operational triage workflow for diagnosing runtime null pointer exceptions, contract drifts between Spring Boot DTOs and React TypeScript interfaces, and unsafe type assertions.

---

## 1. The API Boundary Triage Workflow

```
[ Step 1: Inspect Failed Operation ]
  - Is the error a TypeError (e.g. "Cannot read properties of undefined/null")?
  - Identify the exact property that failed.
             │
[ Step 2: Compare Static TS Type vs Real Network Payload ]
  - Check TypeScript interface: (e.g. email: string)
  - Check Chrome Network tab -> Response Preview: (e.g. "email": null or "userEmail": "...")
  - Did the backend contract change or violate the non-null assumption?
             │
[ Step 3: Implement Runtime Boundary Guard (Zod) ]
  - Create Zod schema representing the true wire format.
  - Run schema.safeParse() in the API service layer.
             │
[ Step 4: Add Telemetry / Alerting ]
  - On parse failure, capture error in Sentry with correlation trace ID.
```

---

## 2. tsconfig Audit Checklist
Run these checks before deploying enterprise TypeScript applications:
1. `tsc --noEmit` must pass with zero errors in CI.
2. `"strict": true` must be enabled.
3. `"noImplicitAny": true` must be enabled.
4. `"noUncheckedIndexedAccess": true` should be enabled for critical financial/e-commerce workflows.
