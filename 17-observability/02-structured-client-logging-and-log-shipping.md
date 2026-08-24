# Module 17.2 — Structured Client Logging, Context Enrichment & Batch Shipping

## 1. WHAT
- **Structured Client Logging:** Emitting log messages as machine-readable JSON objects (containing timestamps, log levels, component names, user IDs, and contextual metadata) rather than unstructured strings like `console.log("data", x)`.
- **Log Shipping & Batching:** Buffering client logs in memory and shipping them in scheduled batches (e.g. every 10 seconds or when queue reaches 20 items) to an ingestion endpoint (Grafana Loki / Datadog / Elasticsearch) to avoid spamming the network with hundreds of individual HTTP POST requests.

```
                    BATCHED LOG SHIPPING PIPELINE
                    
  logger.info("Order clicked", { orderId: "ORD-1" })  ──┐
  logger.warn("Slow network detected", { rtt: 1200 }) ──┼──> [ In-Memory Log Queue ] (Buffer: 20 items)
  logger.error("Mutation failed", { status: 500 })   ──┘              │
                                                                       ▼ Flush every 10s or on page unload
                                                          POST /api/telemetry/logs (Batch of 20)
                                                                       │
                                                          [ Grafana Loki / Datadog ]
```

---

## 2. PRODUCTION IMPLEMENTATION: BATCHED JSON LOGGER

```typescript
// shared/telemetry/logger.ts
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  url: string;
  userAgent: string;
}

class ClientLogger {
  private queue: LogEntry[] = [];
  private flushTimer: number | null = null;
  private readonly BATCH_SIZE = 20;
  private readonly FLUSH_INTERVAL_MS = 10000; // 10s

  constructor() {
    // Flush on tab close
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    // Print to developer console in non-production
    if (import.meta.env.DEV) {
      console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](
        `[${entry.level}] ${entry.message}`,
        entry.context || ''
      );
    }

    this.queue.push(entry);

    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = window.setTimeout(() => this.flush(), this.FLUSH_INTERVAL_MS);
    }
  }

  public info(msg: string, ctx?: Record<string, unknown>) { this.log('INFO', msg, ctx); }
  public warn(msg: string, ctx?: Record<string, unknown>) { this.log('WARN', msg, ctx); }
  public error(msg: string, ctx?: Record<string, unknown>) { this.log('ERROR', msg, ctx); }

  public flush(isBeacon = false) {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const payload = JSON.stringify({ logs: [...this.queue] });
    this.queue = [];

    if (isBeacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry/logs', payload);
    } else {
      fetch('/api/telemetry/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {}); // Suppress log delivery failures to prevent recursive loops
    }
  }
}

export const logger = new ClientLogger();
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why must client log shippers suppress errors when `POST /api/telemetry/logs` itself fails?*
2. *What is the difference between client-side log sampling and log level filtering?*
3. *Why should structured log payloads include release version and Git commit hash tags?*
