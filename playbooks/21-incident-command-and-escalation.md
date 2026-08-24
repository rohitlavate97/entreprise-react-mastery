# Playbook PB-021 — Production Incident Command, Escalation & Post-Mortem SOP

## Objective
Provide an operational standard operating procedure for managing enterprise production outages, establishing incident command, executing rapid rollbacks, and conducting blameless post-mortems.

---

## 1. Incident Command Escalation Protocol

```
[ Step 1: Declare Incident & Severity ]
  - Is customer data leaked or payment failing? -> SEVERITY: P0.
  - Open war room Slack: #inc-YYYY-MM-DD-title
  - Designate: Incident Commander (IC), Tech Lead, Comms Lead.
             │
[ Step 2: Stop the Bleeding (Mitigate First) ]
  - Rule: Do not write new code during active P0 outages.
  - Option A: Kubernetes Rollback: kubectl rollout undo deployment/frontend
  - Option B: Toggle Feature Flag off in LaunchDarkly / Unleash.
  - Option C: Enable Cloudflare "Under Attack" / WAF emergency block.
             │
[ Step 3: Verify Traffic Recovery ]
  - Confirm HTTP 2xx rate > 99.9% in Datadog / Grafana.
```

---

## 2. Root Cause Investigation in Staging

```
[ Step 1: Export Incident Telemetry ]
  - Capture Sentry event IDs and Datadog Trace IDs from outage window.
             │
[ Step 2: Reproduce in Staging ]
  - Replay payload against staging cluster.
  - Write automated regression test in Vitest or Playwright.
             │
[ Step 3: Peer Review & Hotfix Deploy ]
  - Requires 2 Senior approvals -> Deploy to Prod -> Verify metrics.
```

---

## 3. Blameless Post-Mortem & CAPA Execution

```
[ Step 1: Schedule Post-Mortem Meeting within 48 Hours ]
  - Include Engineering, Product, QA, and DevOps stakeholders.
             │
[ Step 2: Conduct 5 Whys Analysis ]
  - Identify systemic process/tooling failures, NOT individual blame.
             │
[ Step 3: Assign Corrective Actions (CAPA) ]
  - Every action must have an explicit Owner and Due Date.
```
