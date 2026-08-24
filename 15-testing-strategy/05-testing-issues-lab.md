# Module 15.5 — Testing Strategy Issues Lab (TEST-001 to TEST-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for automated testing in React.

---

## 🔬 TEST-001: Testing Implementation Details Causing Test Breakage on Refactor

- **Severity:** 🔴 High
- **Environment:** Local / CI
- **Symptoms:** Renaming an internal state variable `isModalOpen` to `isOpen` breaks 15 unit tests, even though the component UI behavior didn't change at all.
- **Root Cause:** Tests inspected `wrapper.state('isModalOpen')` rather than querying visible DOM elements (`screen.getByRole('dialog')`).
- **Fix:** Test only user-observable behavior via React Testing Library queries.

---

## 🔬 TEST-002: Unhandled Async State Update Throwing `act(...)` Warning

- **Severity:** 🟡 Medium
- **Environment:** Vitest / Jest Runner
- **Symptoms:** Test passes, but terminal output is polluted with red `Warning: An update to Component was not wrapped in act(...)`.
- **Root Cause:** An asynchronous Promise resolved and called `setState` *after* the test function completed its assertion.
- **Fix:** Use `await waitFor(() => expect(...))` or `await screen.findBy...` to wait for all asynchronous state updates to settle before finishing the test.

---

## 🔬 TEST-003: TanStack Query Retries Masking 500 Errors and Causing 10s Timeouts

- **Severity:** 🟡 Medium
- **Environment:** CI Pipeline
- **Symptoms:** Testing error state takes 12 seconds per test because TanStack Query retries 3 times with exponential backoff before rendering the error UI.
- **Root Cause:** Default QueryClient retries were not disabled in the test wrapper.
- **Fix:** Pass `defaultOptions: { queries: { retry: false } }` to the test `QueryClient`.

---

## 🔬 TEST-004: MSW Handler Precedence Conflict Returning Wrong Mock Data

- **Severity:** 🔴 High
- **Environment:** Integration Tests
- **Symptoms:** `http.get('/api/orders/latest')` receives the mock data for `http.get('/api/orders/:id')`.
- **Root Cause:** In MSW, wildcard parameterized routes defined earlier take precedence over specific literal paths defined later.
- **Fix:** Define specific literal handlers before generic parameterized wildcard routes in the `handlers` array.

---

## 🔬 TEST-005: Flaky E2E Test Failing Due to Hardcoded `waitForTimeout`

- **Severity:** 🔴 High (CI Flakiness)
- **Environment:** CI/CD Pipeline
- **Symptoms:** Playwright test passes locally on powerful M3 Mac, but fails 30% of the time on slow GitHub Actions 2-core runner.
- **Root Cause:** Used `await page.waitForTimeout(2000)` which is not enough time under heavy CI CPU load.
- **Fix:** Replace sleep with auto-waiting assertions: `await expect(page.getByText('Saved')).toBeVisible()`.

---

## 🔬 TEST-006: Missing Router / QueryClient Provider Wrapper in Test

- **Severity:** 🔴 High
- **Environment:** Vitest
- **Symptoms:** `TypeError: Cannot read properties of null (reading 'useNavigate')` or `No QueryClient set`.
- **Root Cause:** Component calling `useNavigate()` or `useQuery()` was rendered directly with `render(<MyComponent />)` without required Provider wrappers.
- **Fix:** Create a custom `renderWithProviders(ui)` helper that wraps the component with `BrowserRouter` and `QueryClientProvider`.

---

## 🔬 TEST-007: `userEvent` Action Not Awaited

- **Severity:** 🟡 Medium
- **Environment:** Vitest
- **Symptoms:** Test asserts that form submitted, but form fields are still empty.
- **Root Cause:** `@testing-library/user-event` v14 methods are asynchronous (`await userEvent.type(...)`). Omission of `await` causes assertions to run before typing completes.
- **Fix:** Always `await user.type(...)` and `await user.click(...)`.

---

## 🔬 TEST-008: Leaking Fake Timers Across Test Files

- **Severity:** 🔴 High
- **Environment:** Vitest
- **Symptoms:** Tests in `auth.test.ts` hang indefinitely after `countdown.test.ts` finishes running.
- **Root Cause:** `countdown.test.ts` called `vi.useFakeTimers()` but forgot to call `vi.useRealTimers()` in `afterEach()`.
- **Fix:** Always restore real timers in an `afterEach` hook or enable Vitest's `unstubGlobals: true`.
