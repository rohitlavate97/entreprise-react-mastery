# Module 22.1 — Senior & Staff Engineer Code Review Rubric & Security Checklist

## 1. WHAT
- **Enterprise Code Review Standard:** A rigorous, multi-dimensional review process that inspects pull requests for functional correctness, security vulnerabilities, performance regressions, type safety, accessibility, and architectural longevity.
- **The Senior Reviewer Mental Model:** Look beyond superficial formatting (which automated linters handle) and evaluate system-level implications:
  1. *What happens when the network fails or times out?*
  2. *What happens when this component unmounts while an async promise is in-flight?*
  3. *Can untrusted user input execute JavaScript or bypass authentication?*
  4. *Will this render 50,000 times on large datasets?*

```
                    THE 5-PILLAR SENIOR CODE REVIEW RUBRIC
                    
  1. Correctness & Error Handling ──> Edge cases, null checks, 500 API fallbacks
  2. Security & Data Privacy ───────> XSS sanitization, CSRF headers, PII masking
  3. Performance & Memory ──────────> Virtualization, memoization, event cleanup
  4. Type Safety & Contracts ───────> Runtime Zod validation, zero "any" types
  5. Architecture & Cohesion ───────> State colocation, clean directory boundaries
```

---

## 2. THE SENIOR REVIEW SECURITY CHECKLIST

- [ ] **XSS Defense:** Are all instances of `dangerouslySetInnerHTML` wrapped in `DOMPurify.sanitize()`?
- [ ] **Safe Links:** Do external `<a target="_blank">` tags include `rel="noopener noreferrer"`? Are user-provided URLs validated against `javascript:` pseudo-protocols?
- [ ] **CSRF & Auth:** Do mutating API calls (`POST`, `PUT`, `DELETE`) transmit `X-XSRF-TOKEN` headers?
- [ ] **Secrets & PII:** Are API keys or sensitive credentials accidentally committed in `.env` or client bundles?

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What is the difference between a Junior review (syntax/style) and a Staff Engineer review (architecture/system design)?*
2. *Why should formatting and linting discussions be strictly banned from PR reviews and enforced via CI tools instead?*
3. *How do you give constructive feedback on a flawed PR architecture without demoralizing the author?*
