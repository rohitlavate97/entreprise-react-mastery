# Module 25.3 — Live Coding Assessment Survival Guide & Strategy

## 1. THE 5-STAGE LIVE CODING PROTOCOL
During a 45-minute live coding assessment (e.g. build an autocomplete search, infinite scroll grid, or multi-step wizard), follow this structured protocol:

```
                      THE 45-MINUTE LIVE CODING BLUEPRINT
                      
  [ Phase 1: Clarify Requirements & Edge Cases (5 mins) ]
  • What happens when network fails? What is the expected empty/loading state?
  • Are debounce intervals required? Should queries be cached?
             │
  [ Phase 2: Design State Model & Component Tree (5 mins) ]
  • Declare TypeScript interfaces first: type Status = 'idle' | 'loading' | 'success' | 'error';
  • Outline component hierarchy before writing JSX.
             │
  [ Phase 3: Implement Core Working MVP (20 mins) ]
  • Write working implementation with clean state transitions.
  • Keep interviewer engaged by verbalizing your mental model.
             │
  [ Phase 4: Handle Edge Cases & Performance (10 mins) ]
  • Add AbortController for race condition cancellation.
  • Add debounce / memoization / virtualization where appropriate.
             │
  [ Phase 5: Test & Validate (5 mins) ]
  • Manually walk through edge cases with interviewer or write a quick Vitest unit test.
```

---

## 2. EXPERT INTERVIEW QUESTIONS
1. *Why is asking clarifying questions on error/empty states in the first 5 minutes considered a strong Senior signal?*
2. *How do you recover gracefully if your live coding solution encounters an unexpected bug with 10 minutes remaining?*
3. *Why should you always define TypeScript domain types and discriminated union states before writing any JSX?*
