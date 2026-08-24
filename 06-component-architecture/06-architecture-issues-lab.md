# Module 6.6 — Architecture Issues Lab (ARCH-001 to ARCH-008)

This lab contains practical, reproducible architectural failure modes, root-cause analyses, and permanent fixes for enterprise React component design.

---

## 🔬 ARCH-001: God Component (800+ Lines, 14 useState Calls, 6 useEffect Calls)

- **Severity:** 🔴 Critical
- **Environment:** Production Codebase
- **Symptoms:** Every code review takes 2+ hours. New developers take weeks to understand the file. Any state change re-renders the entire checkout flow. Unit testing requires mocking 8 API endpoints.
- **Root Cause:** All business logic, data fetching, form validation, error handling, and UI rendering live in a single `CheckoutPage.tsx` file.
- **Fix:** Extract custom hooks (`useCheckoutSubmission`, `useCartData`), extract presentational components (`OrderSummaryCard`, `PaymentMethodForm`), create a thin Container that orchestrates them.

---

## 🔬 ARCH-002: Cross-Feature Internal Import Violating Feature Boundary

- **Severity:** 🔴 High
- **Environment:** Development / CI
- **Symptoms:** Circular dependency warning in bundler. Changing an internal `auth` component unexpectedly breaks the `orders` feature because `orders` imports `auth/components/LoginModal.tsx` directly.
- **Root Cause:** `features/orders/OrderPage.tsx` imports `features/auth/components/LoginModal.tsx` instead of using the public API (`features/auth/index.ts`).
- **Fix:** Export `LoginModal` through `features/auth/index.ts`. Add ESLint `import/no-restricted-paths` rule to enforce boundary.

---

## 🔬 ARCH-003: Prop Drilling 6+ Levels Deep for Theme/Locale Data

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Adding a new theme property requires modifying 6 intermediate component prop interfaces that don't use the property.
- **Root Cause:** Theme data is passed as props through `App → Layout → Sidebar → SectionGroup → NavItem → IconSvg` instead of being provided via Context.
- **Fix:** Create a `ThemeProvider` Context wrapping the app. Only leaf components that consume theme subscribe via `useContext(ThemeContext)`.

---

## 🔬 ARCH-004: Missing Error Boundary Crashes Entire Application on Widget Failure

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** A single charting library throwing an error during render causes the entire application to display a white screen. Users cannot navigate away or access any other functionality.
- **Root Cause:** No Error Boundary exists anywhere in the tree. React's default behavior on an uncaught render error is to unmount the entire root.
- **Fix:** Place feature-level Error Boundaries around each independent widget/section. Add a global Error Boundary at the App root as a last resort.

---

## 🔬 ARCH-005: Barrel `index.ts` Re-export Breaking Tree Shaking

- **Severity:** 🟡 Medium
- **Environment:** Production Build
- **Symptoms:** Bundle size includes unused feature components. Webpack Bundle Analyzer shows `features/index.ts` pulling in every feature's code.
- **Root Cause:** A single top-level barrel `src/features/index.ts` re-exports everything from every feature. Bundlers cannot tree-shake named re-exports from barrel files that import side-effectful modules.
- **Fix:** Remove the top-level barrel. Import directly from each feature's own `index.ts`: `import { OrderCard } from '@/features/orders'`.

---

## 🔬 ARCH-006: Component Composition Violation — Parent Conditionally Renders Wrong Child Variant

- **Severity:** 🟡 Medium
- **Environment:** Development
- **Symptoms:** Adding a new user role requires modifying `DashboardLayout.tsx` with yet another `if/else` branch, growing the file to 400+ lines of conditional rendering.
- **Root Cause:** Layout component makes business decisions about WHAT to render based on role instead of receiving role-specific content via Slots.
- **Fix:** Invert control: `<DashboardLayout sidebar={role === 'admin' ? <AdminSidebar /> : <UserSidebar />}>`. Layout never knows about roles.

---

## 🔬 ARCH-007: Suspense Waterfall from Nested Lazy Imports

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** Dashboard page shows 3 sequential loading spinners, one after another, instead of loading all sections in parallel.
- **Root Cause:** Nested `<Suspense>` boundaries with `React.lazy()` components that each trigger their own code-split fetch sequentially after the parent finishes.
- **Fix:** Hoist sibling lazy imports to load in parallel. Use `Promise.all`-style preloading or a single shared Suspense boundary for co-dependent siblings.

---

## 🔬 ARCH-008: State Lifted Too High Causing Unnecessary Subtree Re-renders

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** Typing in a search input causes the entire page (including heavy data grid, charts, and sidebar) to re-render on every keystroke.
- **Root Cause:** `searchText` state is lifted to `<DashboardPage>` (the common ancestor) instead of being colocated in the `<SearchBar>` component or its immediate consumer.
- **Fix:** Colocate `searchText` state in `<SearchBar>`. Pass debounced final value up to parent via `onSearch` callback. Only the search results section re-renders on committed search changes.
