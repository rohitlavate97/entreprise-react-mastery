# Module 4.4 — Effects Lifecycle: `useLayoutEffect` vs. `useEffect` & Strict Mode

## 1. WHAT
- **`useLayoutEffect` (Synchronous Layout Phase):** An effect hook that fires **synchronously** immediately after React mutates the DOM, but **before the browser paints the screen**. It blocks visual painting, allowing synchronous DOM measurements and mutations without user-visible flicker.
- **`useEffect` (Asynchronous Passive Phase):** An effect hook that fires **asynchronously** after the browser has completed layout, paint, and composite steps. It is non-blocking to ensure smooth UI responsiveness.
- **Strict Mode Double Invocation (`<React.StrictMode>`):** In development, React deliberately executes the lifecycle sequence:
  $$\text{Mount (Setup)} \xrightarrow{} \text{Unmount (Cleanup)} \xrightarrow{} \text{Remount (Setup)}$$
  to verify that effect cleanup functions completely restore the environment and prevent production memory leaks.

```
                      THE COMPLETE EFFECT EXECUTION TIMELINE
                      
  1. Render Phase: React calls Component(props) -> Generates JSX Element Tree
             │
  2. Commit Mutation: React updates Real DOM nodes
             │
  3. Layout Effects: useLayoutEffect runs SYNCHRONOUSLY ◄── [BLOCKED: Browser cannot paint yet]
     - Perfect for reading DOM dimensions (element.getBoundingClientRect())
     - Perfect for adjusting scroll positions before user sees screen
             │
  4. Browser Paint: Browser paints pixels to physical screen ◄── [USER SEES UPDATE]
             │
  5. Passive Effects: useEffect runs ASYNCHRONOUSLY
     - Perfect for data fetching, analytics logging, event subscriptions
```

---

## 2. WHY
Choosing between `useLayoutEffect` and `useEffect`:
1. **Preventing Visual Flicker:** If you measure a tooltip's height and adjust its `top` position using `useEffect`, the user will see the tooltip appear at the wrong position for one frame (16ms) and jump to the correct position. `useLayoutEffect` adjusts the position *before* the first paint, eliminating flicker.
2. **Preventing Main-Thread Jank:** Putting long-running network calls or heavy data processing in `useLayoutEffect` blocks browser painting, causing severe INP penalties and frozen screens.

---

## 3. STRICT MODE INVESTIGATION: WHY EFFECTS RUN TWICE

In React 18 development mode:
```tsx
useEffect(() => {
  console.log('1. Subscribed');
  return () => {
    console.log('2. Unsubscribed');
  };
}, []);
```
**Console Output in Development:**
`1. Subscribed` $\rightarrow$ `2. Unsubscribed` $\rightarrow$ `1. Subscribed`.

### Why does React do this?
In future versions and Concurrent React features (like offscreen pre-rendering and fast tab switching), React can unmount and remount component trees while preserving state. If your effect adds a native listener or starts a WebSocket without a matching cleanup function, re-mounting would create duplicate listeners and memory leaks in production.

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What is the exact chronological execution difference between `useLayoutEffect` and `useEffect` relative to the browser Paint step?*
2. *Why does React Strict Mode unmount and remount effects in development, and what production bugs does this reveal?*
3. *Why does using `useLayoutEffect` on the server during SSR trigger a React warning?*
