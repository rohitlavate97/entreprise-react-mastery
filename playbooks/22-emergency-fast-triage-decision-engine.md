# Playbook PB-022 — Emergency Frontend Incident Command & Fast-Triage Decision Engine

## Objective
Provide an operational reference engine for mapping any live browser symptom to its root cause, corresponding playbook, and rapid mitigation path in $< 3\text{ minutes}$.

---

## 1. Fast-Triage Symptom Mapping Engine

```
[ LIVE PRODUCTION SYMPTOM ]
            │
            ├── Network / API Boundary:
            │   ├── 403 Invalid CSRF Token ───────────> Refer to PB-012 / PB-017
            │   ├── CORS Preflight Header Missing ────> Refer to PB-001 / PB-012
            │   ├── 404 on Browser Page Refresh ──────> Refer to PB-019 (try_files)
            │   └── 409 Optimistic Concurrency ───────> Refer to PB-012 / PB-020
            │
            ├── JavaScript Runtime & Memory:
            │   ├── Maximum update depth exceeded ────> Refer to PB-006 (Infinite Loop)
            │   ├── Browser Tab Out of Memory (OOM) ──> Refer to PB-014 (Heap Snapshots)
            │   └── Stale Closure in Event Handler ───> Refer to PB-002 (Ref / Functional)
            │
            └── Security & CSP:
                ├── Refused to load script (CSP) ─────> Refer to PB-017 (CSP Whitelist)
                └── Malicious Script Injected (XSS) ──> Refer to PB-017 / PB-021 (DOMPurify)
```

---

## 2. Emergency 3-Step Mitigation Protocol

```
[ Step 1: Mitigate First, Debug Second ]
  - Rollback deployment: kubectl rollout undo deployment/frontend
  - Or disable broken feature flag in LaunchDarkly.
             │
[ Step 2: Validate Mitigation ]
  - Check Datadog / Sentry telemetry error rates drop to baseline.
             │
[ Step 3: Conduct Full RCA & CAPA in Staging ]
  - Follow corresponding playbook PB-001 through PB-021 to apply permanent fix.
```
