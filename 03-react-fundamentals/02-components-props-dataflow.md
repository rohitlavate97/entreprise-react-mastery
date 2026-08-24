# Module 3.2 — Components, Props & Unidirectional Data Flow

## 1. WHAT
- **Component:** A self-contained, reusable JavaScript function that accepts arbitrary inputs (called **Props**) and returns a React element tree describing a section of the user interface.
- **Props (Properties):** Immutable, read-only inputs passed from parent components down to child components.
- **Unidirectional Data Flow:** The architectural principle where state flows strictly downward through the component tree (Parent $\rightarrow$ Child), while events and requests for state change flow strictly upward via callback functions (Child $\rightarrow$ Parent).

```
                      UNIDIRECTIONAL DATA FLOW
                      
                  ┌──────────────────────────────┐
                  │       Parent Component       │
                  │  [State: count = 5]          │
                  └──────────────┬───────────────┘
                                 │
                 Props Flow DOWN │ ▲ Callbacks Flow UP
                 (count = 5)     │ │ (onIncrement())
                                 ▼ │
                  ┌──────────────────────────────┐
                  │       Child Component        │
                  │  Renders UI, fires callback  │
                  └──────────────────────────────┘
```

---

## 2. WHY
Why unidirectional data flow is mandatory for enterprise predictability:
1. **Deterministic Debugging:** In two-way data binding systems (e.g. AngularJS 1.x), any child component could mutate parent state directly, creating circular update loops where finding which component mutated a variable was difficult. In React, state has a single owner.
2. **Component Reusability:** Presentational components (buttons, modals, tables) do not own domain state; they receive data and callbacks via props, making them easily testable and reusable across multiple features.

---

## 3. COMPOSITION OVER INHERITANCE: THE SLOTS PATTERN

When passing complex layouts or multiple sections into a component, prefer **Explicit Slots** over monolithic configuration objects.

```tsx
import React, { ReactNode } from 'react';

export interface PageLayoutProps {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode; // Main Content slot
  footer?: ReactNode;
}

export function PageLayout({
  header,
  sidebar,
  children,
  footer
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">{header}</header>
      <div className="flex-1 flex">
        {sidebar && <aside className="w-64 border-r">{sidebar}</aside>}
        <main className="flex-1 p-6">{children}</main>
      </div>
      {footer && <footer className="border-t">{footer}</footer>}
    </div>
  );
}
```

---

## 4. COMPOUND COMPONENT PATTERN

Allows a family of components to communicate implicitly through an internal Context while giving the consumer full control over layout.

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="flex border-b">{children}</div>;
}

export function TabTrigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabTrigger must be used inside <Tabs>');
  const isActive = ctx.activeTab === value;

  return (
    <button
      onClick={() => ctx.setActiveTab(value)}
      className={`px-4 py-2 ${isActive ? 'border-b-2 border-blue-600 font-bold' : ''}`}
    >
      {children}
    </button>
  );
}

export function TabContent({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabContent must be used inside <Tabs>');
  if (ctx.activeTab !== value) return null;

  return <div className="p-4">{children}</div>;
}
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *What is the architectural advantage of React's unidirectional data flow over two-way data binding?*
2. *How does the Compound Component pattern improve API ergonomics for design system components (e.g. Tabs, Select, Accordion)?*
3. *Why should components avoid mutating props directly, and what runtime safeguards does React employ in development to catch prop mutations?*
