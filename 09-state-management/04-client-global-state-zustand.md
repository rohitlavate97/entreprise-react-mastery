# Module 9.4 — Client Global State with Zustand: Store Design & Fine-Grained Selectors

## 1. WHAT
- **Zustand:** A small, fast, scalable state-management solution based on simplified flux principles. It stores state outside the React component tree and uses subscription listeners (`useSyncExternalStore` internally) to re-render components **only when the specifically selected slice of state changes**.
- **Atomic Selector:** Passing a selector function `useStore(state => state.theme)` ensures the component only re-renders when `state.theme` changes, completely ignoring updates to `state.sidebarOpen` or `state.activeModal`.

```
                    CONTEXT vs ZUSTAND SELECTOR EFFICIENCY
                    
  React Context (Without Splitting):
  Provider value = { theme, sidebarOpen, user, modalQueue }
  • Updating modalQueue -> FORCES ALL CONSUMERS TO RE-RENDER!
  
  Zustand (Atomic Subscription):
  const theme = useUIStore(state => state.theme);
  • Updating modalQueue -> ZERO RE-RENDERS for components subscribing to theme!
```

---

## 2. PRODUCTION IMPLEMENTATION: ENTERPRISE UI STORE WITH ZUSTAND

```typescript
// shared/stores/uiStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  // State
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  activeToasts: ToastMessage[];

  // Actions (colocated with state)
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        isSidebarOpen: true,
        activeToasts: [],

        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),

        addToast: (toast) =>
          set(
            (state) => ({
              activeToasts: [...state.activeToasts, { ...toast, id: crypto.randomUUID() }],
            }),
            false,
            'addToast'
          ),

        removeToast: (id) =>
          set(
            (state) => ({
              activeToasts: state.activeToasts.filter((t) => t.id !== id),
            }),
            false,
            'removeToast'
          ),
      }),
      {
        name: 'app-ui-preferences', // Persists theme to localStorage
        partialize: (state) => ({ theme: state.theme }), // ONLY persist theme, not ephemeral toasts
      }
    )
  )
);
```

---

## 3. SELECTOR PERFORMANCE DISCIPLINE (PREVENTING UNNECESSARY RE-RENDERS)

```tsx
import React from 'react';
import { useUIStore } from '@/shared/stores/uiStore';
import { useShallow } from 'zustand/react/shallow';

// ✅ EFFICIENT: Atomic Selector (only re-renders if isSidebarOpen changes)
export function SidebarToggle() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <button onClick={toggleSidebar}>
      {isSidebarOpen ? 'Collapse' : 'Expand'}
    </button>
  );
}

// ✅ EFFICIENT: Multi-property selector using useShallow
export function ToastContainer() {
  const { toasts, removeToast } = useUIStore(
    useShallow((state) => ({
      toasts: state.activeToasts,
      removeToast: state.removeToast,
    }))
  );

  return (
    <div className="fixed bottom-4 right-4">
      {toasts.map((toast) => (
        <div key={toast.id} onClick={() => removeToast(toast.id)}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *How does Zustand use `useSyncExternalStore` internally to prevent tearing in Concurrent React?*
2. *What happens when a component calls `const store = useStore()` without passing a selector function?*
3. *How does `useShallow` compare to standard `===` identity checks when selecting multiple store fields?*
