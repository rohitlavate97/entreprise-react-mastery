# Module 23.3 — Spaced Repetition Active Recall Flashcard Deck (30 High-Yield Prompts)

## 1. FLASHCARDS: REACT INTERNALS & FIBER

### Q1: What is the difference between the Render Phase and Commit Phase in React?
> **Answer:** The **Render Phase** is asynchronous and interruptible; React traverses Fiber nodes, calls component functions, calculates diffs, and assigns effect tags without touching the real DOM. The **Commit Phase** is synchronous and uninterruptible; React mutates the host DOM, runs layout effects (`useLayoutEffect`), and schedules passive effects (`useEffect`).

---

### Q2: Why does React 18 / 19 execute `useEffect` twice in Strict Mode development?
> **Answer:** To detect unintended side-effects and ensure components are resilient to remounting (e.g. state preservation in Fast Refresh / Offscreen APIs). It mounts, unmounts, and remounts components to verify cleanup functions properly release listeners, timers, and sockets.

---

### Q3: What is the purpose of the `$$typeof: Symbol.for('react.transitional.element')` property on React elements?
> **Answer:** It protects against Cross-Site Scripting (XSS) via JSON injection. Because valid JSON payloads transmitted from an attacker cannot serialize native JavaScript `Symbol` primitives, React rejects malicious user-submitted object payloads pretending to be valid JSX elements.

---

## 2. FLASHCARDS: SPRING BOOT & FULL-STACK INTEGRATION

### Q4: Why does a 64-bit Java `Long` primary key get corrupted when parsed by standard JavaScript `JSON.parse()`?
> **Answer:** JavaScript represents all numbers as IEEE-754 double-precision floats, which only provide 53 bits of integer precision (`Number.MAX_SAFE_INTEGER` = $9,007,199,254,740,991$). Any 64-bit Java `Long` greater than this value has its least significant digits rounded to zero. Fix: Serialize as String in Java using Jackson `@JsonSerialize(using = ToStringSerializer.class)`.

---

### Q5: Why must the Spring `CorsFilter` bean be registered with `@Order(Ordered.HIGHEST_PRECEDENCE)`?
> **Answer:** Preflight HTTP `OPTIONS` requests contain no authentication cookies or Bearer tokens. If security authentication filters execute before the CORS filter, Spring Security rejects the unauthenticated preflight request with `403 Forbidden`, preventing the browser from ever sending the actual API request.

---

## 3. FLASHCARDS: SECURITY & PERFORMANCE

### Q6: How does the Double-Submit Cookie pattern protect against CSRF attacks in Spring Security?
> **Answer:** The server issues a cryptographically random token inside a cookie (`XSRF-TOKEN`). When making a mutating request (`POST`/`PUT`), the client reads the cookie and copies the token into a custom HTTP request header (`X-XSRF-TOKEN`). Because cross-origin attacker scripts cannot read cookies under the Same-Origin Policy, they cannot forge the required header.

---

### Q7: Why is `dangerouslySetInnerHTML` vulnerable to XSS even when using regular expressions to strip `<script>` tags?
> **Answer:** Attackers can bypass naive regex filters using hundreds of alternative HTML injection vectors: `<img src="x" onerror="...">`, `<svg onload="...">`, `<iframe src="javascript:...">`, or obfuscated entity encoding. Robust defense requires DOM tree parsing and tag whitelisting via `DOMPurify.sanitize()`.
