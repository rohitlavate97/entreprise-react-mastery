# Module 22.5 — Code Review Issues Lab (REVIEW-001 to REVIEW-008)

This lab contains practical Pull Request diffs, reviewer feedback, and refactored solutions to master senior-level code reviews.

---

## 🔬 REVIEW-001: PR Diff Introducing Unsanitized `dangerouslySetInnerHTML`

- **Severity:** 🔴 Critical (Security Vulnerability)
- **Reviewer Flag:** Flagged `dangerouslySetInnerHTML={{ __html: prData.emailHtml }}` without DOMPurify.
- **Feedback:** "Block: Untrusted HTML from email body can contain XSS vectors. Wrap in `DOMPurify.sanitize()`."

---

## 🔬 REVIEW-002: PR Diff Passing Inline Object to `useEffect` Dependency

- **Severity:** 🔴 High (Infinite Render Loop)
- **Reviewer Flag:** `useEffect(() => { ... }, [{ status: 'active' }])`.
- **Feedback:** "Block: Object literal generates new reference on every render, triggering an infinite loop. Hoist constant or use primitive."

---

## 🔬 REVIEW-003: PR Diff Using `as any` Escape Hatch on API Response

- **Severity:** 🔴 High (Type Safety Bypass)
- **Reviewer Flag:** `const data = (await response.json()) as any;`.
- **Feedback:** "Block: Bypasses TypeScript compiler. Parse via Zod schema (`OrderSchema.parse(...)`) to enforce runtime contract."

---

## 🔬 REVIEW-004: PR Diff Lifting Local Modal State to Global Store

- **Severity:** 🟡 Medium (Architectural Anti-Pattern)
- **Reviewer Flag:** Added `isDeleteModalOpen` to global `useAppStore`.
- **Feedback:** "Request Changes: Violates State Colocation. Keep state inside the parent component to avoid global re-renders."

---

## 🔬 REVIEW-005: PR Diff Missing `rel="noopener noreferrer"` on External Link

- **Severity:** 🟡 Medium (Security - Tab-Napping)
- **Reviewer Flag:** `<a href={partnerUrl} target="_blank">`.
- **Feedback:** "Block: Missing `rel="noopener noreferrer"`. Vulnerable to `window.opener` redirection attacks."

---

## 🔬 REVIEW-006: PR Diff Using Array Index as Key on Drag-and-Drop List

- **Severity:** 🟡 Medium (Bug in State Preservation)
- **Reviewer Flag:** `{tasks.map((task, index) => <TaskCard key={index} ... />)}`.
- **Feedback:** "Request Changes: Re-ordering items causes React to reuse old input states. Use `key={task.id}`."

---

## 🔬 REVIEW-007: PR Diff Hardcoding Query Key String Literals

- **Severity:** 🟡 Medium (Maintainability / Key Drift)
- **Reviewer Flag:** `useQuery({ queryKey: ['user_orders_list'], ... })`.
- **Feedback:** "Request Changes: Violates Query Key Factory standard. Use `orderKeys.list(filter)`."

---

## 🔬 REVIEW-008: PR Diff Missing Event Listener Cleanup in `useEffect`

- **Severity:** 🔴 High (Memory Leak)
- **Reviewer Flag:** `useEffect(() => { window.addEventListener('scroll', onScroll); }, [])` with no return cleanup function.
- **Feedback:** "Block: Event listener will leak on component unmount. Return `() => window.removeEventListener('scroll', onScroll)`."
