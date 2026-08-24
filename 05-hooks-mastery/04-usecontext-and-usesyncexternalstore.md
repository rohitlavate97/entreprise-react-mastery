# Module 5.4 — `useContext`, Context Splitting & `useSyncExternalStore`

## 1. WHAT
- **`useContext`:** A React Hook that allows components to subscribe to data passed down from a `<Context.Provider>` without manual prop drilling through intermediate components.
- **The Context Re-render Cascade:** When a `<Context.Provider value={val}>` updates its `value`, **every component that calls `useContext(Context)` is forced to re-render**, even if the component only reads an unchanged property of that value object.
- **`useSyncExternalStore`:** The official React 18/19 Hook designed specifically for subscribing to non-React external data stores (e.g. Redux, Zustand, Browser Window APIs, WebSocket managers) in a way that is guaranteed to prevent **Tearing** (inconsistent UI states) during Concurrent rendering.

```
                      CONTEXT SPLITTING ARCHITECTURE
                      
  ❌ Monolithic Context (Causes Unnecessary Re-renders):
  <AuthContext.Provider value={{ user, theme, permissions, activeNotifications }}>
  // Every time a new notification arrives, components that ONLY care about 'theme' re-render!
  
  -----------------------------------------------------------------------------------
  
  ✅ Split Context Architecture (Optimized Performance):
  <UserContext.Provider value={user}>              (Rare updates)
    <ThemeContext.Provider value={theme}>          (Theme toggles only)
      <NotificationContext.Provider value={notifs}> (High-frequency updates)
        <App />
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  </UserContext.Provider>
```

---

## 2. MODERN IMPLEMENTATION: `useSyncExternalStore` (BROWSER SUBSCRIPTION)

Subscribing to browser online/offline status cleanly without tearing or missing updates:

```tsx
import React, { useSyncExternalStore } from 'react';

// 1. Subscribe function conforming to useSyncExternalStore signature
function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

// 2. Snapshot readers for Client and SSR
function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true; // Conservative default during SSR
}

// 3. Custom hook
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getServerSnapshot
  );
}

// 4. Component Usage
export function ConnectivityBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-red-600 text-white p-2 text-center">
      You are currently offline. Actions will be queued.
    </div>
  );
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does updating a single property in a Context value trigger re-renders in all consumers, and how does Context Splitting solve this?*
2. *What is "Tearing" in Concurrent React, and how does `useSyncExternalStore` eliminate tearing when reading external state?*
3. *Why should provider values always be wrapped in `useMemo` when containing objects or functions?*
