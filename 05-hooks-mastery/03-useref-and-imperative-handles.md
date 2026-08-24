# Module 5.3 — `useRef`, Mutable Escape Hatches & `useImperativeHandle`

## 1. WHAT
- **`useRef`:** A React Hook that returns a mutable reference object whose `.current` property is initialized to the passed argument. The object **persists across all renders** of the component lifecycle and **mutating `.current` does NOT trigger a re-render**.
- **`useImperativeHandle`:** A React Hook used alongside `forwardRef` to customize the imperative instance handle exposed to parent components (limiting exposure to safe, explicit methods rather than exposing raw underlying DOM nodes).

```
                     TWO USE CASES OF useRef
                     
  Use Case 1: DOM Node Reference
  const inputRef = useRef<HTMLInputElement>(null);
  <input ref={inputRef} />
  // After Commit: inputRef.current points to the real HTMLInputElement.
  
  -----------------------------------------------------------------------------
  
  Use Case 2: Mutable Value Across Renders (No Re-render)
  const timerIdRef = useRef<number | null>(null);
  // Storing interval IDs, previous props, or render counts without triggering UI updates.
```

---

## 2. MODERN IMPLEMENTATION: `useImperativeHandle` (CUSTOM IMPERATIVE API)

```tsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

// 1. Define explicit imperative contract
export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
}

// 2. Child Component with forwardRef and useImperativeHandle
export const VideoPlayer = forwardRef<VideoPlayerHandle, { src: string }>(
  ({ src }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Expose only safe methods to parent (encapsulating raw video element)
    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      }
    }));

    return <video ref={videoRef} src={src} className="w-full rounded-lg" />;
  }
);

VideoPlayer.displayName = 'VideoPlayer';

// 3. Parent Component consuming the imperative handle
export function Dashboard() {
  const playerRef = useRef<VideoPlayerHandle>(null);

  return (
    <div>
      <VideoPlayer ref={playerRef} src="/promo.mp4" />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.seekTo(30)}>Jump to 0:30</button>
    </div>
  );
}
```

---

## 3. THE PREVIOUS VALUE PATTERN (`usePrevious`)

```tsx
import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value; // Updates ref AFTER render finishes!
  }, [value]);

  return ref.current; // Returns the value from the PREVIOUS render!
}
```

---

## 4. COMMON MISTAKES
1. **Reading or Writing `ref.current` During Render:**
   ```tsx
   // ❌ BREAKS CONCURRENT RENDERING:
   export function BadCounter() {
     const countRef = useRef(0);
     countRef.current++; // Modifying refs during render is an impure side effect!
     return <div>Render #{countRef.current}</div>;
   }
   ```
2. **Using a Ref Where State is Required:** Storing a form input value in a ref when you need the UI to update or show instant validation errors.

---

## 5. EXPERT INTERVIEW QUESTIONS
1. *Why is reading or writing `ref.current` during the Render Phase strictly forbidden in Concurrent React?*
2. *When should you use `useImperativeHandle` over passing standard React props?*
3. *How does `useRef` differ mechanically from a standard variable declared outside the component function?*
