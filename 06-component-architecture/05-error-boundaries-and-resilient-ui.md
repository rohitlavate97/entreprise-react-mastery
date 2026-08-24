# Module 6.5 — Error Boundaries, Suspense Boundaries & Resilient UI Architecture

## 1. WHAT
- **Error Boundary:** A React class component that catches JavaScript errors thrown during the render phase, lifecycle methods, or constructors of its entire child subtree. It prevents the entire application from crashing (white screen) and displays a fallback UI instead.
- **Suspense Boundary:** A React component (`<Suspense fallback={...}>`) that displays a loading fallback while its children are suspended (e.g. lazy-loaded code splits or data fetching with `use()`).
- **Resilient UI Architecture:** Strategically placing Error Boundaries and Suspense Boundaries at different levels of the component tree to contain failures and loading states to the smallest possible UI region.

```
                    BOUNDARY PLACEMENT STRATEGY
                    
  <App>
    <ErrorBoundary fallback={<FullPageCrash />}>        ← GLOBAL: Last resort catch-all
      <Suspense fallback={<AppShellSkeleton />}>         ← GLOBAL: Initial app load
        <AppRouter>
          <DashboardPage>
            <ErrorBoundary fallback={<WidgetError />}>   ← FEATURE: Isolate widget failures
              <Suspense fallback={<ChartSkeleton />}>    ← FEATURE: Independent loading
                <RevenueChart />                         ← If this crashes, only THIS widget shows error
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<WidgetError />}>
              <Suspense fallback={<TableSkeleton />}>
                <OrdersTable />                          ← Independent from RevenueChart
              </Suspense>
            </ErrorBoundary>
          </DashboardPage>
        </AppRouter>
      </Suspense>
    </ErrorBoundary>
  </App>
```

---

## 2. IMPLEMENTATION: REUSABLE ERROR BOUNDARY

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report to external monitoring (Sentry, Datadog, etc.)
    this.props.onError?.(error, errorInfo);
    console.error('[ErrorBoundary] Caught:', error, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.handleReset);
      }
      return fallback;
    }
    return this.props.children;
  }
}

// Usage with recoverable fallback:
// <ErrorBoundary
//   fallback={(error, reset) => (
//     <div>
//       <p>Widget failed: {error.message}</p>
//       <button onClick={reset}>Try Again</button>
//     </div>
//   )}
//   onError={(err, info) => Sentry.captureException(err, { extra: info })}
// >
//   <RevenueChart />
// </ErrorBoundary>
```

---

## 3. WHAT ERROR BOUNDARIES DO NOT CATCH
Error Boundaries only catch errors in the **React render tree**. They do NOT catch:
1. **Event handler errors** → Use `try/catch` inside `onClick`, `onSubmit`.
2. **Async code errors** (Promises, `setTimeout`) → Use `.catch()` or `try/catch` in `async` functions.
3. **Server-side rendering errors** → Require SSR-specific error handling.
4. **Errors thrown in the Error Boundary itself** → Need a parent Error Boundary above it.

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why must Error Boundaries be class components and not functional components?*
2. *What is the strategic difference between placing one global Error Boundary vs multiple feature-level Error Boundaries?*
3. *What categories of errors does an Error Boundary NOT catch, and how should those be handled?*
