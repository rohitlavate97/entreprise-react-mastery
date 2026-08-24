# Playbook PB-016 — Test Automation, Async Act Warnings & MSW Triage

## Objective
Provide an operational triage workflow for diagnosing test runner failures, unhandled async `act(...)` warnings, Mock Service Worker (MSW) routing bugs, and Playwright E2E flakiness.

---

## 1. Unhandled `act(...)` Warning Triage Workflow

```
[ Step 1: Identify Async Trigger ]
  - Does the component call setTimeout, setInterval, or an async API Promise?
             │
[ Step 2: Replace Synchronous getBy with Asynchronous findBy ]
  - Replace: expect(screen.getByText('Success')).toBeInTheDocument()
  - With:    expect(await screen.findByText('Success')).toBeInTheDocument()
             │
[ Step 3: Use waitFor for Complex State Changes ]
  - Wrap multi-state assertions:
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Data Loaded')).toBeInTheDocument();
    });
```

---

## 2. MSW Handler Mismatch & 404 Triage

```
[ Step 1: Check Unhandled Request Policy ]
  - Ensure setupTests.ts has: server.listen({ onUnhandledRequest: 'error' })
             │
[ Step 2: Audit Handler Path & HTTP Method ]
  - Does API endpoint in component match MSW handler string?
  - Verify query param handling: http.get('/api/orders', ({ request }) => ...)
             │
[ Step 3: Check Handler Array Order ]
  - Put specific literal paths (e.g. /orders/summary) BEFORE wildcard paths (/orders/:id).
```

---

## 3. Playwright E2E Flakiness Triage

```
[ Step 1: Ban Sleep Functions ]
  - Search codebase for page.waitForTimeout() -> REMOVE ALL OCCURRENCES.
             │
[ Step 2: Use Web-First Assertions ]
  - Replace: expect(await page.locator('.modal').isVisible()).toBe(true)
  - With:    await expect(page.getByRole('dialog')).toBeVisible()
             │
[ Step 3: Inspect Trace Viewer on Failure ]
  - Run test with trace flag: npx playwright test --trace on
  - View exact DOM actionability state in trace viewer: npx playwright show-trace trace.zip
```
