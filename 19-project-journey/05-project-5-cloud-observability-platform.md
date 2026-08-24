# Project 5 — Enterprise Cloud Observability Platform

## 1. PROJECT SPECIFICATION & ARCHITECTURAL BLUEPRINT
- **Domain:** Distributed Tracing, Log Ingestion & Performance APM.
- **Core Architecture:**
  - **Trace Visualization:** Hierarchical Flamegraphs and waterfall span timelines rendered via SVG canvas.
  - **Live Log Explorer:** Virtualized streaming log console processing 10,000 log events/sec.
  - **OpenTelemetry Ingestion:** Real-time integration with Spring Boot OpenTelemetry collector and Jaeger.

```
                    PROJECT 5 DISTRIBUTED TRACE VISUALIZER
                    
  Trace: 4bf92f3577b34da6 (Total Duration: 245ms)
  
  [React Client] checkout_click ────────────────────────── (245ms)
    └── [Spring Gateway] auth_filter ─────────────────── (12ms)
          └── [Order Service] create_order_db ────────── (180ms)
                └── [PostgreSQL] INSERT INTO orders ─── (42ms)
```

---

## 2. PRODUCTION IMPLEMENTATION: SPAN WATERFALL COMPONENT

```tsx
// features/tracing/components/SpanWaterfall.tsx
import React from 'react';

export interface TraceSpan {
  id: string;
  name: string;
  service: string;
  startTimeMs: number;
  durationMs: number;
}

export function SpanWaterfall({ spans, totalDurationMs }: { spans: TraceSpan[]; totalDurationMs: number }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-900 text-white font-mono">
      <h3 className="text-sm font-bold text-gray-400 mb-4">Span Execution Waterfall</h3>
      <div className="space-y-2">
        {spans.map((span) => {
          const leftPercent = (span.startTimeMs / totalDurationMs) * 100;
          const widthPercent = Math.max(1, (span.durationMs / totalDurationMs) * 100);

          return (
            <div key={span.id} className="relative flex items-center h-6 hover:bg-gray-800 rounded px-2">
              <span className="w-48 text-xs truncate mr-4 text-cyan-400">{span.service}: {span.name}</span>
              <div className="flex-1 relative h-3 bg-gray-700 rounded overflow-hidden">
                <div
                  className="absolute top-0 h-full bg-emerald-500 rounded"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>
              <span className="w-16 text-right text-xs text-gray-400 ml-4">{span.durationMs}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```
