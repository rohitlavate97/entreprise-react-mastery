# Module 6.4 — Prop Drilling Mitigation & State Colocation Decision Tree

## 1. WHAT
- **Prop Drilling:** The practice of passing data through multiple intermediate component layers that do not use the data themselves, solely to deliver it to a deeply nested descendant.
- **State Colocation:** The principle that state should live as close as possible to the components that read it. If only `<OrderItemRow>` needs `itemQuantity`, the state belongs in `<OrderItemRow>`, not in `<App>`.

```
                    STATE PLACEMENT DECISION TREE
                    
  ┌─ Does only ONE component read this state?
  │   YES ──> Keep state LOCAL in that component (useState).
  │
  │   NO ──> Do SIBLING components need to share it?
  │           YES ──> LIFT STATE UP to nearest common parent.
  │
  │           NO ──> Do DISTANT descendants (3+ levels) need it?
  │                   YES ──> Is the data static or rarely changes?
  │                           YES ──> Use React CONTEXT.
  │                           NO ──> Is it server-fetched data?
  │                                   YES ──> Use SERVER-STATE library
  │                                           (TanStack Query / SWR).
  │                                   NO ──> Use CLIENT-STATE manager
  │                                           (Zustand / Jotai / Redux Toolkit).
  │
  └─ Does it belong in the URL (pagination, filters, search)?
      YES ──> Use URL STATE (searchParams, React Router).
```

---

## 2. THE FIVE STATE CATEGORIES IN ENTERPRISE REACT

| Category | Examples | Correct Home | Wrong Home |
|---|---|---|---|
| **Local UI State** | Modal open/close, tooltip visible, accordion index | `useState` in the component | Global Redux store |
| **Lifted Shared State** | Selected tab in a sibling tab group, shared filter value | `useState` in nearest common parent | Context for 2 siblings |
| **Server Cache State** | API response data, paginated lists, user profile | TanStack Query / SWR cache | `useState` + `useEffect` |
| **Global Client State** | Auth token, theme preference, locale, sidebar collapsed | Context or Zustand | `localStorage` polled by timer |
| **URL State** | Page number, sort column, search query, active tab | `useSearchParams` / React Router | `useState` duplicating URL |

---

## 3. ANTI-PATTERN: PROP DRILLING 7 LEVELS DEEP

```tsx
// ❌ ANTI-PATTERN: Passing 'theme' through 7 components that don't use it!
<App theme={theme}>                          // Knows about theme
  <Dashboard theme={theme}>                  // Doesn't use theme, just passes it down
    <Sidebar theme={theme}>                  // Doesn't use theme, just passes it down
      <SidebarSection theme={theme}>         // Doesn't use theme, just passes it down
        <NavItem theme={theme}>              // Doesn't use theme, just passes it down
          <NavIcon theme={theme}>            // Doesn't use theme, just passes it down
            <IconSvg fill={theme.iconColor}> // FINALLY uses theme!
```

### ✅ Fix: Context for Truly Global, Rarely-Changing Data
```tsx
// ThemeProvider wraps the tree ONCE at the top level.
// Only <IconSvg> subscribes. Intermediate components are completely unaware.

const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Deep descendant subscribes directly:
function IconSvg() {
  const { theme } = useContext(ThemeContext);
  return <svg fill={theme.iconColor}>...</svg>;
}
```

---

## 4. COMPONENT COMPOSITION AS PROP-DRILLING KILLER

```tsx
// ❌ Drilling 'user' through Layout → Sidebar → UserAvatar:
<Layout user={user}>
  <Sidebar user={user}>
    <UserAvatar user={user} />
  </Sidebar>
</Layout>

// ✅ Composition: Parent renders <UserAvatar> directly and passes it as a slot!
<Layout
  sidebar={
    <Sidebar>
      <UserAvatar user={user} />  {/* No drilling needed! */}
    </Sidebar>
  }
>
  <MainContent />
</Layout>
```

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *When should you lift state up to a parent vs introduce React Context vs adopt a server-state library?*
2. *Why is Component Composition (Slot Pattern) often a better prop-drilling fix than Context?*
3. *What are the five categories of state in an enterprise React application, and where should each live?*
