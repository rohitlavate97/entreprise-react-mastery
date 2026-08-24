# Project 2 — Real-Time Financial Trading & Analytics Dashboard

## 1. PROJECT SPECIFICATION & ARCHITECTURAL BLUEPRINT
- **Domain:** High-Frequency Trading & Market Analytics.
- **Core Architecture:**
  - **Transport Layer:** WebSockets / STOMP over Spring Boot `/ws/quotes`.
  - **High-Frequency Rendering:** Throttling 500 ticks/sec via `requestAnimationFrame` buffer to maintain steady 60fps.
  - **Data Visualization:** Virtualized Order Book with `@tanstack/react-virtual` rendering 50,000 bid/ask levels.
  - **Memory Safety:** Strict cleanup of interval timers and socket listeners to guarantee 0MB memory leak over 8-hour trading days.

```
                    HIGH-FREQUENCY TICK BUFFERING ENGINE
                    
  WebSocket Stream (500 ticks/sec)
         │
         ▼
  [ In-Memory Ring Buffer (Mutable Ref) ] <── Ticks appended without calling setState!
         │
         ▼ (Synchronized to Screen Refresh: 60fps / 16.6ms)
  requestAnimationFrame(() => {
    setFlushedOrderBook(ringBuffer.current); // ONLY 1 React render per frame!
  });
```

---

## 2. PRODUCTION IMPLEMENTATION: RAF TICK BUFFER HOOK

```tsx
// features/trading/hooks/useOrderBookStream.ts
import { useEffect, useRef, useState } from 'react';

export function useOrderBookStream(symbol: string) {
  const [orderBook, setOrderBook] = useState<Map<number, number>>(new Map());
  const pendingBufferRef = useRef<Map<number, number>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.enterprise.com/ws/quotes?symbol=${symbol}`);

    ws.onmessage = (event) => {
      const { price, size } = JSON.parse(event.data);
      pendingBufferRef.current.set(price, size);

      // Schedule flush on next animation frame if not already scheduled
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          setOrderBook(new Map(pendingBufferRef.current));
          rafIdRef.current = null;
        });
      }
    };

    return () => {
      ws.close();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [symbol]);

  return { orderBook };
}
```
