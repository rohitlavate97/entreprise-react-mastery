# Module 15.4 — End-to-End (E2E) Testing with Playwright

## 1. WHAT
- **Playwright:** A modern cross-browser automation library for Chromium, WebKit, and Firefox that tests real user workflows against running production/staging environments.
- **Auto-Waiting:** Playwright automatically performs a range of actionability checks (visible, stable, enabled, receiving events) on elements before clicking or typing, eliminating 95% of timing-related test flakiness.

```
                 BRITTLE VS RESILIENT E2E PRACTICES
                 
  ❌ BRITTLE (Sleep Anti-Pattern):
  await page.click('#submit-btn');
  await page.waitForTimeout(5000); // ❌ Sleep is slow and still flakes under CI load!
  expect(await page.locator('.success-toast').isVisible()).toBeTruthy();
  
  -----------------------------------------------------------------------------------
  
  ✅ RESILIENT (Accessibility Locators + Web-First Assertions):
  await page.getByRole('button', { name: /place order/i }).click();
  // Auto-waits up to 5s for element to become visible in DOM:
  await expect(page.getByRole('alert')).toHaveText(/Order #101 Confirmed/i);
```

---

## 2. PRODUCTION IMPLEMENTATION: AUTH REUSE & CHECKOUT TEST

```typescript
// e2e/auth.setup.ts
// Logs in ONCE before test suite runs and saves authenticated cookies to disk
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@enterprise.com');
  await page.getByLabel('Password').fill('SecurePassword123!');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait until dashboard is loaded
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

  // Save auth state
  await page.context().storageState({ path: authFile });
});
```

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Order Checkout Flow', () => {
  // Uses cached authentication state — skips login page entirely!
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('user can configure and submit an order successfully', async ({ page }) => {
    await page.goto('/orders/new');

    // Fill form using accessible locators
    await page.getByLabel('Customer Name').fill('Acme Corp');
    await page.getByLabel('Shipping Address').fill('123 Enterprise Blvd');
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Quantity').fill('5');

    // Submit
    await page.getByRole('button', { name: /submit order/i }).click();

    // Assert success banner appears
    await expect(page.getByRole('status')).toContainText('Order created successfully');
  });
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why is `page.waitForTimeout()` considered an anti-pattern in modern E2E test suites?*
2. *How does caching authentication state with `storageState` accelerate E2E test suite execution time by $10\times$?*
3. *Why are accessibility-based locators (`getByRole`, `getByLabel`) more resilient to CSS/layout refactoring than XPath or class selectors?*
