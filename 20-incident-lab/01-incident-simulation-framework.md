# Module 20.1 — Production Incident Simulation Framework & Severity Matrix

## 1. WHAT
- **Incident Response Framework:** A structured operational protocol for detecting, mitigating, resolving, and learning from production outages in enterprise React + Spring Boot architectures.
- **The Core Incident Lifecycle:**
  1. **Detection (MTTD):** Automated alerts (Sentry / Datadog / PagerDuty) trigger within $< 60\text{ seconds}$.
  2. **Triage & Command:** Incident Commander (IC) establishes war room and assesses severity (P0 / P1 / P2).
  3. **Mitigation (Stop the Bleeding):** Rollback deployment, toggle feature flag, or activate circuit breaker to restore service before finding root cause.
  4. **Resolution (MTTR):** Permanent hotfix verified in staging and deployed to production.
  5. **Post-Mortem (CAPA):** Blameless root-cause analysis with corrective actions.

```
                    PRODUCTION SEVERITY MATRIX
                    
  Severity    Impact Definition                           Target MTTD    Target MTTR
  ──────────────────────────────────────────────────────────────────────────────────
  🔴 P0       Critical Outage / Active Security Breach    < 2 minutes    < 15 minutes
              (Checkout down, token theft, mass data loss)
  
  🔴 P1       Major Feature Broken / High Revenue Risk    < 5 minutes    < 45 minutes
              (Multi-tenant cache leak, trading desk lag)
              
  🟡 P2       Partial Degradation / Non-Critical Bug      < 15 minutes   < 4 hours
              (Slow search filter, export CSV timeout)
              
  🟢 P3       Minor Cosmetic / Minor Edge Case            < 1 day        Next Sprint
```

---

## 2. THE INCIDENT COMMAND PROTOCOL

```
[ ALERT: PagerDuty triggers P0/P1 Incident ]
                    │
                    ▼
[ Phase 1: Establish War Room ]
  • Assign Roles: Incident Commander (IC), Lead Tech Scribe, Communications Lead.
  • Open dedicated Slack channel: #inc-2026-08-25-checkout-down
                    │
                    ▼
[ Phase 2: Mitigate Immediately (Stop the Bleeding) ]
  • Rule #1: NEVER attempt complex code debugging in production during an active outage!
  • Action: Rollback Docker deployment to last known stable tag:
    kubectl rollout undo deployment/frontend-deployment
                    │
                    ▼
[ Phase 3: Root Cause Isolation in Staging ]
  • Reproduce failure mode in staging environment using isolated telemetry replay.
  • Write unit/integration test reproducing bug -> Apply fix -> Verify.
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why should the primary goal during an active P0 incident be Mitigation (Rollback / Feature Flag) rather than Root Cause Debugging?*
2. *What is Mean-Time-To-Detect (MTTD) vs Mean-Time-To-Resolve (MTTR), and how do automated health checks improve these metrics?*
3. *What are the core responsibilities of an Incident Commander during a major production outage?*
