# Module 6.2 — Advanced Composition Patterns: Compound Components, Render Props & Slots

## 1. WHAT
- **Composition Over Configuration:** Instead of building a single component with 30 props controlling every visual permutation, compose small focused components together and let the consumer decide layout and content.
- **Compound Components:** A group of components that share implicit state through React Context, working together as a cohesive unit (e.g. `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>`).
- **Slot Pattern (Inversion of Control):** Passing entire JSX subtrees as props (typically named `header`, `footer`, `sidebar`, `actions`) to let the consumer inject custom content at specific mounting points.
- **Render Props → Custom Hooks:** The historical Render Props pattern (`<DataLoader render={(data) => ...} />`) has been almost entirely replaced by Custom Hooks (`const data = useDataLoader()`), which avoid unnecessary nesting and are simpler to compose.

---

## 2. COMPOUND COMPONENTS IMPLEMENTATION

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ── Internal Shared State ──
interface AccordionContextValue {
  openIndex: number | null;
  toggle: (index: number) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion compound components must be rendered inside <Accordion>');
  }
  return ctx;
}

// ── Root Component (State Owner) ──
export function Accordion({ children }: { children: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <AccordionContext.Provider value={{ openIndex, toggle }}>
      <div className="divide-y border rounded-lg">{children}</div>
    </AccordionContext.Provider>
  );
}

// ── Item Component (Registers Index) ──
export function AccordionItem({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  return <div>{children}</div>;
}

// ── Trigger Component (Toggle Button) ──
export function AccordionTrigger({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { openIndex, toggle } = useAccordionContext();
  const isOpen = openIndex === index;

  return (
    <button
      onClick={() => toggle(index)}
      className="w-full flex justify-between items-center p-4 text-left font-medium"
      aria-expanded={isOpen}
    >
      {children}
      <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  );
}

// ── Content Component (Collapsible Panel) ──
export function AccordionContent({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { openIndex } = useAccordionContext();
  if (openIndex !== index) return null;

  return (
    <div className="p-4 text-gray-700" role="region">
      {children}
    </div>
  );
}

// ── Consumer Usage (Clean, Declarative, Flexible) ──
// <Accordion>
//   <AccordionItem index={0}>
//     <AccordionTrigger index={0}>Billing FAQ</AccordionTrigger>
//     <AccordionContent index={0}>
//       <p>We accept Visa, MasterCard, and ACH transfers.</p>
//     </AccordionContent>
//   </AccordionItem>
//   <AccordionItem index={1}>
//     <AccordionTrigger index={1}>Shipping Policy</AccordionTrigger>
//     <AccordionContent index={1}>
//       <p>Free shipping on orders over $50.</p>
//     </AccordionContent>
//   </AccordionItem>
// </Accordion>
```

---

## 3. SLOT PATTERN (INVERSION OF CONTROL)

```tsx
import React, { ReactNode } from 'react';

interface PageLayoutProps {
  header: ReactNode;    // Slot: injected by consumer
  sidebar?: ReactNode;  // Optional slot
  children: ReactNode;  // Main content slot
  footer?: ReactNode;   // Optional slot
}

export function PageLayout({ header, sidebar, children, footer }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4">{header}</header>
      <div className="flex flex-1">
        {sidebar && <aside className="w-64 border-r p-4">{sidebar}</aside>}
        <main className="flex-1 p-6">{children}</main>
      </div>
      {footer && <footer className="border-t px-6 py-4">{footer}</footer>}
    </div>
  );
}

// Consumer decides WHAT renders in each slot:
// <PageLayout
//   header={<DashboardNavbar user={currentUser} />}
//   sidebar={<AdminSidebar permissions={permissions} />}
//   footer={<ComplianceFooter version={APP_VERSION} />}
// >
//   <OrdersDataGrid />
// </PageLayout>
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What problem does the Compound Component pattern solve that a single component with many boolean/enum props cannot?*
2. *Why is the Slot pattern (passing JSX as props) considered Inversion of Control, and when should you prefer it over children?*
3. *Why have Custom Hooks largely replaced Render Props in modern React codebases?*
