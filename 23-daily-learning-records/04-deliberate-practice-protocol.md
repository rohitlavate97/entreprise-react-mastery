# Module 23.4 — The Deliberate Practice & Break-and-Fix Protocol

## 1. WHAT
- **Deliberate Practice:** Structured, goal-directed training focused on overcoming specific weaknesses at the edge of one's current ability, guided by immediate feedback loops.
- **The Break-and-Fix Method:** Intentionally injecting verified production failure modes into a clean sandbox, setting a timer, and diagnosing/fixing the root cause using DevTools without looking at the solution.

```
                    THE BREAK-AND-FIX DRILL CYCLE
                    
  [ Step 1: Inject Known Failure Mode ]
  • Pick an issue from REACT_ISSUES_LAB_INDEX.md (e.g. PERF-002: Table Re-render Lag)
  • Inject bug into sandbox codebase.
             │
             ▼
  [ Step 2: Start 10-Minute Timer ]
  • Open DevTools Console, Profiler, and Network tab.
  • Isolate root cause using Senior Debugging Playbooks.
             │
             ▼
  [ Step 3: Implement & Verify Permanent Fix ]
  • Write automated Vitest/Playwright test verifying fix.
  • Record total time and friction points in Daily Learning Journal.
```

---

## 2. EXPERT INTERVIEW QUESTIONS
1. *Why does passive tutorial watching produce an "illusion of competence" compared to deliberate break-and-fix drills?*
2. *How does tracking Mean-Time-To-Diagnose (MTTD) in sandbox drills translate to faster incident resolution in production?*
3. *What role does writing automated regression tests play in consolidating architectural memory?*
