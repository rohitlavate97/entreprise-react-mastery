# Module 9.1 — State Taxonomy & Enterprise Architecture Matrix

## 1. WHAT
- **State Taxonomy:** The systematic categorization of application state into distinct operational domains based on its ownership, lifespan, sync requirements, and persistence model.
- **The Modern Shift:** Moving away from monolithic global stores (storing *everything* in Redux) to specialized, domain-specific state tools:
  - **Server State (Cache):** TanStack Query / SWR
  - **Client Global State:** Zustand / Context
  - **URL State:** React Router `useSearchParams`
  - **Local UI State:** `useState` / `useReducer`

```
                      THE FOUR STATE DOMAINS
                      
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. SERVER STATE (Remote Source of Truth)                               │
  │    • Owned by Spring Boot / Database                                    │
  │    • Asynchronous, potentially stale, requires caching & refetching    │
  │    • Tools: TanStack Query (React Query v5), SWR                        │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 2. CLIENT GLOBAL STATE (Application Shell / Session)                   │
  │    • Owned by browser runtime                                           │
  │    • Synchronous, shared across unrelated views (Auth, Theme, Modals)   │
  │    • Tools: Zustand, React Context (split)                              │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 3. URL STATE (Bookmarkable / Shareable View Configuration)              │
  │    • Owned by the Browser Address Bar                                  │
  │    • Search query, active tab, table pagination, sort column           │
  │    • Tools: useSearchParams, React Router                               │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 4. LOCAL UI STATE (Ephemeral Component Memory)                         │
  │    • Owned by single component or compound sibling group               │
  │    • Dropdown open/close, hover state, input draft text                │
  │    • Tools: useState, useReducer, useRef                                │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. WHY
Why putting server data into a global Redux/Zustand store is an enterprise anti-pattern:
1. **Manual Cache Invalidation Nightmares:** Developers must manually write reducers to handle loading, error, success, caching, background polling, deduplication, and refetching on window focus.
2. **Memory Leaks & Stale Drift:** Storing remote entity collections in client global state causes memory footprint growth over long user sessions and silent desynchronization when another user mutates the database.

---

## 3. STATE SELECTION DECISION MATRIX

$$\begin{array}{|l|l|l|l|}
\hline
\textbf{State Type} & \textbf{Examples} & \textbf{Recommended Tool} & \textbf{Anti-Pattern to Avoid} \\ \hline
\text{Server Cache} & \text{User profile, Orders list, Product details} & \text{TanStack Query} & \text{Storing in Redux / global useState} \\ \hline
\text{Session / UI Global} & \text{Theme mode, Active user JWT, Modal queue} & \text{Zustand / Context} & \text{Storing in URL search params} \\ \hline
\text{View Configuration} & \text{Page 3, Sort: DESC, Filter: APPROVED} & \text{useSearchParams} & \text{Local useState (loses deep link)} \\ \hline
\text{Ephemeral Local} & \text{Dropdown toggle, tooltip visibility} & \text{useState / useReducer} & \text{Dispatching to global store} \\ \hline
\end{array}$$

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why is server-state fundamentally different from client-state in terms of synchronization and concurrency?*
2. *What bugs occur when developers duplicate URL search parameters inside a local `useState`?*
3. *Under what conditions is React Context sufficient for global state, and when should you reach for Zustand?*
