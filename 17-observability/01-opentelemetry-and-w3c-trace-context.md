# Module 17.1 — OpenTelemetry & W3C Distributed TraceContext Propagation

## 1. WHAT
- **W3C Trace Context Standard:** An international standard for distributed tracing headers that enables end-to-end tracing across microservices, databases, and client frontend applications.
- **The `traceparent` Header Format:**
  `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`
  - `00`: Version
  - `4bf92f3577b34da6a3ce929d0e0e4736`: **Trace ID** (32 hex chars, shared across all services in this transaction)
  - `00f067aa0ba902b7`: **Parent Span ID** (16 hex chars, identifies the caller step)
  - `01`: **Trace Flags** (`01` = recorded/sampled)

```
                    DISTRIBUTED TRACING FLOW (REACT TO SPRING BOOT)
                    
  React Client (User clicks "Checkout")
  • Starts Span: "checkout_submit" (Trace ID: 4bf92f35...)
  • Generates HTTP Request with Header:
    traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
         │
         ▼
  Spring Boot API Gateway (:8080)
  • Reads traceparent header -> Continues Trace ID: 4bf92f35...
  • Starts Child Span: "gateway_auth_filter"
         │
         ▼
  Order Microservice (:8081)
  • Continues Trace ID: 4bf92f35...
  • Starts Child Span: "save_order_db"
         │
  All spans aggregated in Jaeger / Grafana Tempo into a SINGLE END-TO-END TIMELINE!
```

---

## 2. PRODUCTION IMPLEMENTATION: OPENTELEMETRY TRACEPARENT GENERATOR

```typescript
// shared/telemetry/tracer.ts
import { AxiosInstance } from 'axios';

// Helper to generate compliant W3C hex strings
function randomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateTraceparent(): { traceId: string; spanId: string; header: string } {
  const traceId = randomHex(32); // 32 hex characters
  const spanId = randomHex(16);  // 16 hex characters
  const header = `00-${traceId}-${spanId}-01`;
  return { traceId, spanId, header };
}

// Attach W3C Trace Context to Axios Client
export function attachTraceContext(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const { traceId, header } = generateTraceparent();
    config.headers.set('traceparent', header);
    config.headers.set('X-Correlation-ID', traceId);
    return config;
  });
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What are the four components of a W3C `traceparent` header string?*
2. *Why is distributed tracing essential when troubleshooting a slow 12-second checkout transaction in a microservices architecture?*
3. *How does Spring Boot's OpenTelemetry agent automatically parse the incoming `traceparent` header to continue the client span?*
