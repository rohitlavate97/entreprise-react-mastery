# Module 24.2 — Enterprise ADR Repository (ADR-001 to ADR-004)

This repository contains the foundational Architecture Decision Records governing the Enterprise React + Spring Boot platform.

---

## 🏛️ ADR-001: Adoption of TanStack Query v5 & Zustand Over Redux Toolkit

- **Status:** `ACCEPTED`
- **Context:** Large monolithic Redux store mixed server caching with client UI state, creating massive async thunk boilerplate and stale cache synchronization bugs.
- **Decision:** Separate state taxonomy:
  - Use **TanStack Query v5** exclusively for asynchronous server state.
  - Use **Zustand** exclusively for lightweight client-only UI state (modals, theme, active sidebar).
- **Consequences:** 70% reduction in state management code; automatic request deduplication and background cache invalidation.

---

## 🏛️ ADR-002: Split-Token Authentication Architecture

- **Status:** `ACCEPTED`
- **Context:** Storing JWT access tokens in `localStorage` created high XSS vulnerability risks. Storing them entirely in session cookies introduced CSRF complexities on mobile clients.
- **Decision:** Implement **Split-Token Architecture**:
  - Short-lived Access Token (15 min TTL) stored strictly **in JavaScript memory**.
  - Long-lived Refresh Token (7 day TTL) stored inside a `SameSite=Strict; HttpOnly; Secure` cookie.
  - Silent refresh via thread-safe Axios mutex on 401 response.
- **Consequences:** Immune to XSS token theft via `localStorage`; seamless session continuation for users.

---

## 🏛️ ADR-003: DOM Virtualization Strategy for Large Datasets

- **Status:** `ACCEPTED`
- **Context:** Financial transaction tables rendering $> 5,000$ rows caused catastrophic DOM overload (30,000 nodes), 100% CPU usage, and browser crashes on mobile/tablet devices.
- **Decision:** Mandate `@tanstack/react-virtual` for all list and table views rendering $> 100$ items.
- **Consequences:** Caps active DOM nodes to $\sim 20$ elements regardless of total dataset size (50k+ rows render at 60fps).

---

## 🏛️ ADR-004: Feature-Sliced Design (FSD) Monorepo Directory Architecture

- **Status:** `ACCEPTED`
- **Context:** Generic directory structures (`/components`, `/hooks`, `/services`) led to high coupling, circular dependencies, and slow developer onboarding across 15 engineering squads.
- **Decision:** Standardize on **Feature-Sliced Design (FSD)**:
  - Hierarchy: `app/` $\rightarrow$ `pages/` $\rightarrow$ `widgets/` $\rightarrow$ `features/` $\rightarrow$ `entities/` $\rightarrow$ `shared/`.
  - Strict unidirectional imports: Upper layers may import from lower layers, never the reverse.
- **Consequences:** Clean architectural boundaries; elimination of circular dependency bugs.
