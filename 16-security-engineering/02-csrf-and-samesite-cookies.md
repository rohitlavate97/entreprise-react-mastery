# Module 16.2 — CSRF Defense, SameSite Cookies & Double-Submit Tokens

## 1. WHAT
- **Cross-Site Request Forgery (CSRF):** An attack that tricks an authenticated victim's browser into executing an unwanted state-changing action (e.g. `POST /api/transfer-funds`) on a trusted web application where the victim currently has an active cookie session.
- **Why CSRF Happens:** Browsers automatically attach stored cookies (session IDs) to outgoing cross-origin HTTP requests unless blocked by `SameSite` policies or custom headers.
- **SameSite Cookie Values:**
  - **`SameSite=Strict`:** Cookie is **never** sent in cross-site requests (even when clicking a link from Google/Slack to your app). Best for banking / admin dashboards.
  - **`SameSite=Lax`:** Default in modern browsers. Cookie is withheld on cross-site subrequests (images, POST forms), but sent on top-level navigation (clicking a link).
  - **`SameSite=None; Secure`:** Cookie is sent on all cross-site requests. Requires HTTPS.

```
                    HOW CSRF ATTACKS WORK
                    
  1. User logs into Bank (Session Cookie set in browser).
  2. In another tab, User visits Malicious Website (evil.com).
  3. evil.com contains hidden form:
     <form action="https://bank.com/api/transfer" method="POST">
       <input name="toAccount" value="AttackerAccount" />
       <input name="amount" value="10000" />
     </form>
     <script>document.forms[0].submit();</script>
     
  4. Browser sends POST to bank.com and AUTOMATICALLY ATTACHES Bank Session Cookie!
  5. If bank lacks CSRF protection -> $10,000 is transferred!
```

---

## 2. FULL-STACK CSRF DEFENSE (SPRING SECURITY 6 + REACT AXIOS)

```java
// backend/src/main/java/com/enterprise/config/SecurityConfig.java
package com.enterprise.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        // Set to null to resolve token on every request (Spring Security 6 BREACH defense)
        requestHandler.setCsrfRequestAttributeName(null);

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(tokenRepository) // Writes XSRF-TOKEN cookie readable by JS
                .csrfTokenRequestHandler(requestHandler)
            );

        return http.build();
    }
}
```

```typescript
// frontend/src/shared/api/httpClient.ts
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  // Axios automatically reads 'XSRF-TOKEN' cookie and attaches 'X-XSRF-TOKEN' header!
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why are stateless APIs authenticated via in-memory `Authorization: Bearer <JWT>` headers inherently immune to CSRF?*
2. *How does the Double-Submit Cookie pattern prevent cross-origin attackers from forging state-changing requests?*
3. *What is the BREACH attack against CSRF tokens, and how does Spring Security 6's masked CSRF token mitigate it?*
