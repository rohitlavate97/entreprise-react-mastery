# Module 14.4 — Core Web Vitals Optimization: LCP, INP & CLS Engineering

## 1. WHAT
- **Core Web Vitals Engineering:** The discipline of optimizing real user rendering performance to hit Google's strict thresholds:
  1. **LCP (Largest Contentful Paint $\le 2.5\text{s}$):** Ensuring the largest hero image or banner renders immediately.
  2. **CLS (Cumulative Layout Shift $\le 0.1$):** Preventing visible layout jumping as images, fonts, or async components mount.
  3. **INP (Interaction to Next Paint $\le 200\text{ms}$):** Yielding the main thread so user clicks and keypresses render immediate visual feedback.

```
                    CORE WEB VITALS OPTIMIZATION PATTERNS
                    
  1. LCP OPTIMIZATION:
     <link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
     • NEVER add loading="lazy" to the hero image!
     
  2. CLS ZERO-SHIFT LAYOUT:
     <div className="aspect-video w-full bg-gray-200">  <-- Reserves exact 16:9 space
       <img src="/product.jpg" width="800" height="450" className="w-full h-full object-cover" />
     </div>
     • Zero layout jumping when product.jpg finishes downloading!
     
  3. INP MAIN THREAD YIELDING:
     startTransition(() => {
       setFilteredList(hugeListFilter(query)); // Runs in background, yields to typing!
     });
```

---

## 2. ELIMINATING LONG TASKS (>50ms) WITH `yieldToMain`

```typescript
// shared/utils/scheduler.ts
// Yields execution back to the browser event loop so user input / paint can execute

export function yieldToMain(): Promise<void> {
  // Use modern Chrome scheduler API if available, fallback to setTimeout(0)
  if ('scheduler' in window && 'yield' in (window as any).scheduler) {
    return (window as any).scheduler.yield();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

// Processing 50,000 items in chunks without freezing the UI (Zero INP drop)
export async function processLargeDatasetInChunks<T>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => void
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(processor);
    // Yield to main thread every chunk to allow user interaction
    await yieldToMain();
  }
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does adding `loading="lazy"` to a hero image severely damage your LCP score?*
2. *How does CSS `aspect-ratio: 16/9` eliminate Cumulative Layout Shift before an image loads?*
3. *How does `startTransition` help achieve a "Good" INP score (<200ms) during heavy state updates?*
