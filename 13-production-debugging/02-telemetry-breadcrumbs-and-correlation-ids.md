# Module 13.2 — Telemetry, Error Reporting & Distributed Correlation IDs

## 1. WHAT
- **Client Telemetry:** The automated collection and transmission of frontend runtime errors, user interaction breadcrumbs, and network events to an observability platform (Sentry / Datadog / OpenTelemetry).
- **End-to-End Distributed Tracing:** Tagging every client-side error report with the identical `X-Correlation-ID` sent in API headers, allowing on-call engineers to copy an ID from Sentry and find the exact matching Java stack trace in Spring Boot / ELK / Grafana Loki.

```
                    DISTRIBUTED CORRELATION TRACING
                    
  React Client (Sentry Incident)                  Spring Boot Backend (Grafana Loki / ELK)
  ┌────────────────────────────────────────┐      ┌────────────────────────────────────────┐
  │ Error: "Failed to process order"       │      │ Log Entry:                             │
  │ Trace-ID: 7f3a9b21-44e2-41f8           │ ───> │ [7f3a9b21-44e2-41f8] PaymentDeclined:  │
  │ User: user_123                         │      │ Insufficient funds on card ending 4242 │
  │ Component: <CheckoutButton />          │      └────────────────────────────────────────┘
  └────────────────────────────────────────┘
```

---

## 2. PRODUCTION IMPLEMENTATION: SENTRY ERROR BOUNDARY & DATA SCRUBBING

```typescript
// shared/monitoring/sentry.ts
import * as Sentry from '@sentry/react';

export function initMonitoring() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    release: import.meta.env.VITE_APP_RELEASE_VERSION,

    // Scrub sensitive PII / Payment Data before sending to Sentry
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },

    // Capture React Component Stack
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Masks text in session replays for privacy
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1, // Sample 10% of standard transactions in production
    replaysOnErrorSampleRate: 1.0, // Record 100% of sessions where errors occur
  });
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *How does attaching `X-Correlation-ID` to Sentry tags bridge the gap between frontend exceptions and backend Spring Boot microservices?*
2. *Why is `beforeSend` scrubbing mandatory for GDPR and PCI-DSS compliance when using client telemetry tools?*
3. *What is the difference between `tracesSampleRate` and `replaysOnErrorSampleRate` in production telemetry budgets?*
