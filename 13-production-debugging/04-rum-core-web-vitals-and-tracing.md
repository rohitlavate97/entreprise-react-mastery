# Module 13.4 — Real User Monitoring (RUM) & Core Web Vitals Telemetry

## 1. WHAT
- **Real User Monitoring (RUM):** An observability practice that continuously captures and analyzes real browser performance metrics directly from end users in production across varying devices, network conditions, and geographies.
- **Google Core Web Vitals (CWV):** Three standard user-centric performance metrics:
  - **LCP (Largest Contentful Paint):** Loading speed of primary visual content ($\le 2.5\text{s}$ Good).
  - **INP (Interaction to Next Paint):** Visual responsiveness to user clicks/inputs ($\le 200\text{ms}$ Good).
  - **CLS (Cumulative Layout Shift):** Visual stability during page rendering ($\le 0.1$ Good).

```
                     CORE WEB VITALS TARGET THRESHOLDS
                     
  Metric    Good (Target)      Needs Improvement    Poor
  ────────────────────────────────────────────────────────────
  LCP       ≤ 2.5s             2.5s – 4.0s          > 4.0s
  INP       ≤ 200ms            200ms – 500ms        > 500ms
  CLS       ≤ 0.1              0.1 – 0.25           > 0.25
```

---

## 2. PRODUCTION IMPLEMENTATION: `web-vitals` TELEMETRY WITH `sendBeacon`

```typescript
// shared/monitoring/vitals.ts
import { onCLS, onINP, onLCP, Metric } from 'web-vitals';

const VITALS_ENDPOINT = '/api/telemetry/vitals';

function reportMetric(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });

  // Use navigator.sendBeacon to guarantee delivery even if user closes tab
  if (navigator.sendBeacon) {
    navigator.sendBeacon(VITALS_ENDPOINT, body);
  } else {
    fetch(VITALS_ENDPOINT, { body, method: 'POST', keepalive: true });
  }
}

export function initWebVitals() {
  onLCP(reportMetric);
  onINP(reportMetric);
  onCLS(reportMetric);
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why is Interaction to Next Paint (INP) a significantly better measure of responsiveness than First Input Delay (FID)?*
2. *Why must Web Vitals telemetry use `navigator.sendBeacon` or `fetch({ keepalive: true })` instead of standard Axios calls?*
3. *What are the top three causes of Cumulative Layout Shift (CLS) in React SPAs?*
