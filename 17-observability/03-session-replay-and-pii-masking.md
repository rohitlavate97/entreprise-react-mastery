# Module 17.3 — User Session Replay, DOM Recording & Privacy Masking

## 1. WHAT
- **Session Replay:** An observability tool that records DOM mutations, mouse movements, clicks, and scroll events in the browser, reconstructing a pixel-accurate video-like playback of the exact user session leading up to a production crash.
- **Privacy Masking:** The automated obfuscation of sensitive personal information (PII), passwords, financial data, and medical records before session replay data leaves the user's browser.

```
                    SESSION REPLAY DOM MUTATION CAPTURE
                    
  Real User DOM:
  <input name="ssn" value="123-45-6789" />
  <p className="user-email">rohit@enterprise.com</p>
         │
         ▼ (Sentry Replay Engine with Strict Masking)
  Captured Replay Stream (Transmitted over Network):
  <input name="ssn" value="***-**-****" />
  <p className="user-email">••••••••••••••••••</p>
  • Zero raw PII reaches observability servers!
```

---

## 2. PRIVACY CONTROLS & CSS MASKING SELECTORS

```html
<!-- Explicitly block entire sensitive DOM subtrees from session recording -->
<div className="sentry-block">
  <h3>Payment Details</h3>
  <CreditCardForm />
</div>

<!-- Mask individual text elements -->
<span className="sentry-mask">Account Balance: $14,250.00</span>

<!-- Unmask harmless static labels inside masked zones -->
<label className="sentry-unmask">Cardholder Name</label>
```

```typescript
// Sentry Replay Configuration with Strict Masking Defaults
import * as Sentry from '@sentry/react';

Sentry.init({
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,       // Replaces all text with asterisks (•••••)
      blockAllMedia: true,     // Replaces images and video with gray placeholders
      maskAllInputs: true,     // Masks all form input values
      block: ['.sentry-block', '[data-sentry-block]'],
      mask: ['.sentry-mask'],
    }),
  ],
  replaysSessionSampleRate: 0.05, // 5% of all sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with unhandled errors
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *How does `rrweb` record DOM mutations efficiently without taking continuous full-page screenshots?*
2. *Why is `maskAllText: true` recommended as the default policy in financial/healthcare enterprise applications?*
3. *What is the network bandwidth overhead of session replay streaming on slow mobile connections?*
