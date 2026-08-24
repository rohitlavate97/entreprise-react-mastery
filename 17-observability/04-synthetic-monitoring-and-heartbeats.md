# Module 17.4 — Synthetic Health Checks, Heartbeats & Offline Resilience

## 1. WHAT
- **Synthetic Monitoring:** Automated probes that simulate user journeys and check backend service health from the frontend at regular intervals.
- **Offline Resilience:** Detecting loss of network connectivity and gracefully pausing background polling, displaying an offline banner, and queuing user actions for replay upon reconnect.

```
                    OFFLINE CONNECTIVITY STATE MACHINE
                    
  [ ONLINE ] ──(Browser offline event / Ping fails)──> [ OFFLINE ]
      ▲                                                    │
      │                                                    ├── Pause TanStack Query refetches
      │                                                    ├── Display persistent "Offline" banner
      │                                                    └── Queue mutations in IndexedDB
      │                                                    │
      └──────(Browser online event + Ping 200 OK)──────────┘
             • Refetch active queries
             • Replay queued mutations
```

---

## 2. PRODUCTION IMPLEMENTATION: NETWORK STATUS & HEARTBEAT HOOK

```tsx
// shared/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    async function checkConnectivity(): Promise<boolean> {
      try {
        // Fast HTTP HEAD probe to verify actual internet connectivity (bypasses captive portal false-positives)
        const response = await fetch('/api/health/ping', {
          method: 'HEAD',
          cache: 'no-store',
        });
        return response.ok;
      } catch {
        return false;
      }
    }

    const handleOnline = async () => {
      const hasRealInternet = await checkConnectivity();
      if (hasRealInternet) {
        setIsOnline(true);
        // Automatically refetch all active stale queries on reconnect
        queryClient.resumePausedMutations();
        queryClient.invalidateQueries();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  return { isOnline };
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why is checking `navigator.onLine` alone insufficient to verify internet access (e.g. airport Wi-Fi captive portals)?*
2. *How does TanStack Query coordinate with network connectivity listeners to pause and resume in-flight queries?*
3. *What is the difference between active synthetic monitoring (Datadog Synthetics) and passive RUM (Real User Monitoring)?*
