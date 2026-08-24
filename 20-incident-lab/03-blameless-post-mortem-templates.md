# Module 20.3 — Enterprise Blameless Post-Mortem & CAPA Framework

## 1. THE BLAMELESS PHILOSOPHY
- **The Core Axiom:** *Human error is a symptom of a flawed system, not the root cause.* Punishing engineers encourages concealment; investigating systemic design flaws builds resilient platforms.

---

## 2. PRODUCTION POST-MORTEM TEMPLATE

```markdown
# Incident Post-Mortem: [INC-XXX] - [Incident Title]

## Summary
- **Date & Time:** YYYY-MM-DD HH:MM UTC
- **Duration:** XX minutes (Detection: Xm, Mitigation: Xm, Resolution: Xm)
- **Severity:** P0 / P1 / P2
- **Incident Commander:** [Name]
- **Lead Engineer:** [Name]

---

## Customer & Business Impact
- **Blast Radius:** ~XX,XXX users affected (XX% of active sessions)
- **Financial Impact:** $XX,XXX estimated lost revenue or duplicate transactions
- **Support Tickets:** XX tickets logged

---

## Incident Timeline (UTC)
- **14:02** — Deployment v2.4.1 rolled out to production Kubernetes cluster.
- **14:05** — First customer reports 404 on order status page.
- **14:07** — Datadog alert triggers: Spike in 404 HTTP responses on /orders/*.
- **14:10** — War room established; Incident Commander initiates triage.
- **14:15** — Rollback initiated to v2.4.0 via kubectl rollout undo.
- **14:18** — Service fully restored. Traffic normalizes.

---

## Root Cause Analysis (5 Whys)
1. **Why did users get 404?** Nginx could not locate static files for deep routes like /orders/100.
2. **Why did Nginx look for a physical file?** The try_files directive was accidentally omitted in nginx.conf.
3. **Why was it omitted?** A refactor of security headers in nginx.conf overwrote the location / block.
4. **Why was this not caught in staging?** Staging tests only navigated via client-side links, never performing direct browser page refreshes.
5. **Why was refresh not tested?** E2E Playwright suite lacked a page.reload() test case on deep routes.

---

## Corrective & Preventative Actions (CAPA)
| Action Item | Type | Owner | Due Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| Add `try_files $uri $uri/ /index.html;` to base Nginx template | Preventative | DevOps | Completed | Closed |
| Add Playwright E2E test verifying page refresh on deep routes | Detective | QA Lead | 2026-08-28 | In Progress |
| Add automated Nginx configuration linter to CI/CD pipeline | Detective | Platform | 2026-09-02 | Todo |
```
