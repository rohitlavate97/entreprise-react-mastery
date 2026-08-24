# Module 25.5 — Technical Interview & Staff Assessment Issues Lab (INTERVIEW-001 to INTERVIEW-008)

This lab contains practical failure modes, root-cause analyses, interviewer red flags, and winning strategies for Senior and Staff technical assessments.

---

## 🔬 INTERVIEW-001: Jumping into JSX Without Clarifying Edge Cases

- **Interviewer Signal:** 🔴 Strong Reject (Junior Antipattern)
- **Symptom:** Candidate starts typing `<div>` tags immediately without asking about error states, pagination limits, or empty lists.
- **Winning Strategy:** Spend the first 5 minutes establishing requirements: "Before writing code, let me clarify the error handling, network timeout behavior, and mobile responsiveness constraints."

---

## 🔬 INTERVIEW-002: Unhandled Async Race Condition in Autocomplete

- **Interviewer Signal:** 🔴 Reject (Lack of Concurrency Mastery)
- **Symptom:** Fast typing causes slower earlier queries to resolve after faster latest queries, displaying outdated search results.
- **Winning Strategy:** Implement `AbortController` or query cancellation via TanStack Query and verbalize: "I am adding an AbortController to discard stale in-flight requests."

---

## 🔬 INTERVIEW-003: Inability to Defend State Architecture Trade-Offs

- **Interviewer Signal:** 🟡 Borderline (Lack of Senior Depth)
- **Symptom:** Candidate chooses Redux Toolkit simply because "it's popular" without comparing against TanStack Query or Zustand.
- **Winning Strategy:** Present the State Taxonomy Matrix: "I distinguish between Server Cache (TanStack Query for async invalidation) and Client UI State (Zustand for modal flags)."

---

## 🔬 INTERVIEW-004: Over-Engineering Simple Live Coding Prompt

- **Interviewer Signal:** 🔴 Reject (Poor Time Management)
- **Symptom:** Asked to build a counter with debounce; candidate writes 5 custom generic interfaces and runs out of time before rendering UI.
- **Winning Strategy:** Build a working MVP in 15 minutes, then iterate with clean abstractions and performance enhancements.

---

## 🔬 INTERVIEW-005: Missing Error Boundary in Take-Home Assessment

- **Interviewer Signal:** 🟡 Borderline (Production Readiness Concern)
- **Symptom:** Take-home project crashes with blank white screen when reviewer inputs invalid data.
- **Winning Strategy:** Wrap application in React Error Boundary with user-friendly retry fallback UI and RFC 7807 problem detail toasts.

---

## 🔬 INTERVIEW-006: Blaming Teammates in Behavioral Leadership Round

- **Interviewer Signal:** 🔴 Strong Reject (Toxic Culture Risk)
- **Symptom:** When asked about a past project failure, candidate states: "The backend team was incompetent and missed their deadlines."
- **Winning Strategy:** Use the Blameless STAR method: "We identified a communication gap in API contract alignment, so I introduced automated OpenAPI schema generation in CI to bridge the teams."

---

## 🔬 INTERVIEW-007: Proposing Un-Virtualized Table in System Design

- **Interviewer Signal:** 🔴 Reject (Scale Blindness)
- **Symptom:** Proposes rendering 100,000 transaction rows directly into DOM in a financial trading system design round.
- **Winning Strategy:** Proactively identify DOM overhead: "Rendering 100k rows directly will exhaust browser memory; I will implement DOM windowing via `@tanstack/react-virtual` to cap DOM nodes at ~30."

---

## 🔬 INTERVIEW-008: Leaking WebSocket Listeners in Coding Exercise

- **Interviewer Signal:** 🔴 Reject (Memory Safety Failure)
- **Symptom:** Attaches `ws.addEventListener('message')` inside `useEffect` without returning cleanup function.
- **Winning Strategy:** Always write cleanup callback immediately: `return () => { ws.close(); };`.
