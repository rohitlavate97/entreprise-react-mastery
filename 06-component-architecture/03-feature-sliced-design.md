# Module 6.3 — Feature-Sliced Design (FSD) for Enterprise Applications

## 1. WHAT
- **Feature-Sliced Design (FSD):** An architectural methodology that organizes a codebase into strict vertical layers and horizontal slices, enforcing clear dependency boundaries so that feature modules cannot form circular imports or reach into each other's internals.
- **The Core Principle:** Code is organized by **business capability** (features like `orders`, `auth`, `inventory`), not by **technical role** (folders named `components/`, `hooks/`, `utils/`, `services/`).

```
                    FEATURE-SLICED DIRECTORY LAYOUT
                    
  src/
  ├── app/                          # Layer 7: App Shell (Providers, Router, Global Error Boundary)
  │   ├── providers/
  │   │   ├── AppProviders.tsx
  │   │   └── ThemeProvider.tsx
  │   ├── router/
  │   │   └── AppRouter.tsx
  │   └── App.tsx
  │
  ├── pages/                        # Layer 6: Route-Level Page Compositions
  │   ├── orders/
  │   │   └── OrdersPage.tsx        # Composes features, no business logic here
  │   ├── dashboard/
  │   │   └── DashboardPage.tsx
  │   └── auth/
  │       └── LoginPage.tsx
  │
  ├── features/                     # Layer 5: Business Feature Slices (CORE LAYER)
  │   ├── orders/
  │   │   ├── api/                  # Feature-scoped API calls
  │   │   │   └── ordersApi.ts
  │   │   ├── hooks/                # Feature-scoped custom hooks
  │   │   │   ├── useOrders.ts
  │   │   │   └── useCreateOrder.ts
  │   │   ├── components/           # Feature-scoped UI components
  │   │   │   ├── OrderCard.tsx
  │   │   │   └── OrderFilters.tsx
  │   │   ├── model/                # Feature-scoped types & state
  │   │   │   └── order.types.ts
  │   │   └── index.ts              # PUBLIC API — Only exports what other features may use!
  │   │
  │   ├── auth/
  │   │   ├── api/
  │   │   ├── hooks/
  │   │   ├── components/
  │   │   ├── model/
  │   │   └── index.ts
  │   │
  │   └── inventory/
  │       ├── ...
  │       └── index.ts
  │
  ├── shared/                       # Layer 3: Shared Reusable Primitives
  │   ├── ui/                       # Generic UI kit (Button, Modal, Skeleton, etc.)
  │   │   ├── Button.tsx
  │   │   ├── Modal.tsx
  │   │   └── Skeleton.tsx
  │   ├── lib/                      # Utility functions (formatCurrency, debounce, etc.)
  │   │   ├── formatCurrency.ts
  │   │   └── dateUtils.ts
  │   ├── api/                      # Shared HTTP client (Axios instance, interceptors)
  │   │   └── httpClient.ts
  │   └── config/                   # Environment variables, feature flags
  │       └── env.ts
  │
  └── infrastructure/               # Layer 1: External System Adapters
      ├── analytics/
      │   └── analyticsAdapter.ts
      ├── storage/
      │   └── localStorageAdapter.ts
      └── monitoring/
          └── sentryAdapter.ts
```

---

## 2. THE DEPENDENCY RULE (STRICT IMPORT DIRECTION)

```
  ALLOWED IMPORT DIRECTION (Top layers import from bottom layers ONLY):
  
  app/          ──imports──>  pages/
  pages/        ──imports──>  features/
  features/     ──imports──>  shared/
  shared/       ──imports──>  infrastructure/
  
  ❌ FORBIDDEN:
  shared/       ──imports──>  features/     (Lower layer reaching into higher layer!)
  features/auth ──imports──>  features/orders/components/OrderCard  (Cross-feature internal import!)
  
  ✅ CORRECT CROSS-FEATURE COMMUNICATION:
  features/auth ──imports──>  features/orders/index.ts  (Public API barrel only!)
```

### ESLint Enforcement Rule
```json
{
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        {
          "target": "./src/shared",
          "from": "./src/features",
          "message": "shared/ cannot import from features/ — dependency rule violation!"
        },
        {
          "target": "./src/features/orders",
          "from": "./src/features/auth/components",
          "message": "Cross-feature internal import! Use the public index.ts API instead."
        }
      ]
    }]
  }
}
```

---

## 3. THE PUBLIC API BARREL (`index.ts`)

```typescript
// features/orders/index.ts — PUBLIC CONTRACT
// Only these exports are visible to other features and pages!

export { OrderCard } from './components/OrderCard';
export { OrderFilters } from './components/OrderFilters';
export { useOrders } from './hooks/useOrders';
export { useCreateOrder } from './hooks/useCreateOrder';
export type { Order, OrderStatus, CreateOrderPayload } from './model/order.types';

// INTERNAL: OrderCard.styles.ts, OrderValidation.ts, etc. are NOT exported.
// Other features CANNOT import them directly.
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What is the Dependency Rule in Feature-Sliced Design and why does it prevent architectural decay?*
2. *Why should cross-feature imports only go through the public `index.ts` barrel and never reach internal files?*
3. *How does organizing by business capability (features/) differ from organizing by technical role (components/, hooks/, utils/), and what scaling benefits does it provide?*
