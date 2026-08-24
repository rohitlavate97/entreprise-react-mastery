# Playbook PB-018 — Distributed Tracing & Observability Pipeline Triage

## Objective
Provide an operational triage workflow for diagnosing broken W3C distributed traces, log shipping ingestion bottlenecks, session replay PII leaks, and recursive logging crashes.

---

## 1. Broken Distributed Trace (Missing Parent Span) Triage

```
[ Step 1: Inspect Client Outgoing Request ]
  - Check Network Tab -> Headers -> Does request contain traceparent?
  - Verify format: 00-[32-hex-trace-id]-[16-hex-span-id]-01
  - Ensure all characters are lowercase hex [0-9a-f].
             │
[ Step 2: Inspect Spring Boot Trace Ingestion ]
  - Does Spring Boot have OpenTelemetry javaagent or Spring Cloud Sleuth/Micrometer Tracing?
  - Verify Spring Boot logs: [traceId, spanId] matches client header.
             │
[ Step 3: Check CORS Allowed Headers ]
  - Verify traceparent is listed in backend Access-Control-Allow-Headers!
```

---

## 2. Session Replay PII Compliance Triage

```
[ Step 1: Audit Live Recording in Staging ]
  - Trigger test transaction in staging environment with test credit card / SSN.
  - Open Sentry Replay player -> Verify all input fields render as masked asterisks.
             │
[ Step 2: Apply Mandatory CSS Mask Selectors ]
  - Add className="sentry-block" to sensitive component containers.
  - Verify maskAllText: true is enabled in Sentry initialization options.
```

---

## 3. Logger Infinite Loop & Ingestion Flood Triage

```
[ Step 1: Inspect Network Tab Flood ]
  - Are there hundreds of POST requests to /api/telemetry/logs per second?
             │
[ Step 2: Break Recursive Catch Block ]
  - Inspect catch handlers in logger.ts:
    fetch('/api/telemetry/logs').catch(() => {}); // MUST NOT call logger.error()!
             │
[ Step 3: Enforce Buffer & Batch Flush Interval ]
  - Set BATCH_SIZE = 20 and FLUSH_INTERVAL_MS = 10000.
```
