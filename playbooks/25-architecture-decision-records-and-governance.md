# Playbook PB-025 — Architecture Decision Record (ADR) & Technical Governance SOP

## Objective
Provide an operational standard operating procedure for proposing, reviewing, approving, enforcing, and deprecating Architecture Decision Records (ADRs) across enterprise engineering teams.

---

## 1. The ADR Authoring & Approval Workflow

```
[ Step 1: Draft ADR in Markdown ]
  - Create 24-living-knowledge-base/adr-00X-title.md using standard template.
  - Set status to PROPOSED.
             │
[ Step 2: Architecture Review Board (ARB) Review ]
  - Present ADR in bi-weekly ARB council meeting.
  - Discuss trade-offs, security implications, and developer velocity impact.
             │
[ Step 3: Formal Consensus & Status Transition ]
  - IF APPROVED: Set status to ACCEPTED -> Create tracking Jira Epic.
  - IF REJECTED: Set status to REJECTED -> Document rationale.
             │
[ Step 4: Automated CI Enforcement ]
  - Add ESLint/Biome rule to CI pipeline to enforce ADR compliance in code.
```

---

## 2. ADR Superseding & Deprecation Protocol

When a new technology or architecture replaces an accepted ADR:
1. Author new ADR (e.g. `ADR-018: Migration to Vite 6`).
2. Update original ADR status: `Status: SUPERSEDED by ADR-018`.
3. Add banner in original ADR linking to new document.
4. Establish 90-day sunset plan for legacy code removal.
