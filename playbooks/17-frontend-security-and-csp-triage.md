# Playbook PB-017 — Frontend Security Incident, XSS Sanitization & CSP Violation Triage

## Objective
Provide an operational triage workflow for responding to XSS injection incidents, CSRF validation failures, CSP directive blocks, and third-party dependency vulnerabilities.

---

## 1. XSS Incident Response & Triage Workflow

```
[ Step 1: Containment & Identification ]
  - Is the payload Stored (in database) or Reflected (in URL)?
  - Search codebase for dangerouslySetInnerHTML and direct innerHTML assignments.
             │
[ Step 2: Database Sanitization ]
  - Execute backend script to scrub un-sanitized HTML from database rows.
             │
[ Step 3: Implement DOMPurify Whitelist ]
  - Enforce <SanitizedHtml /> component with strict ALLOWED_TAGS.
  - Audit all <a href> tags to ensure javascript: URLs are blocked.
```

---

## 2. CSP Directive Block Triage

```
[ Step 1: Inspect Browser Console CSP Violation ]
  - Read directive in error: script-src, connect-src, frame-ancestors, or font-src.
  - Identify blocked domain (e.g. https://api.stripe.com).
             │
[ Step 2: Update Nginx CSP Policy ]
  - Add approved domain to specific directive in security-headers.conf.
  - Test locally using Content-Security-Policy-Report-Only.
             │
[ Step 3: Verify Subresource Integrity (SRI) ]
  - If script-src requires CDN script: calculate SHA-384 hash and add integrity tag.
```

---

## 3. CSRF 403 Forbidden Triage

```
[ Step 1: Check Cookie vs Header ]
  - Does browser have XSRF-TOKEN cookie?
  - Does request payload have X-XSRF-TOKEN header?
             │
[ Step 2: Verify Axios Config ]
  - Ensure axios instance has:
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
             │
[ Step 3: Verify Spring Security Handler ]
  - Ensure CookieCsrfTokenRepository.withHttpOnlyFalse() is configured.
```
