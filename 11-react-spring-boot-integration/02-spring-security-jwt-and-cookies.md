# Module 11.2 — Enterprise Authentication Architecture: Spring Security 6, JWT & HttpOnly Cookies

## 1. WHAT
- **The Modern Split-Token Architecture:**
  1. **Access Token (Short-lived, e.g. 15 mins):** Stored strictly in React JavaScript runtime memory (Zustand/Auth Context). Transmitted via `Authorization: Bearer <token>` header. **Immune to CSRF**.
  2. **Refresh Token (Long-lived, e.g. 7 days):** Stored in a browser cookie with flags `HttpOnly; Secure; SameSite=Strict; Path=/api/auth`. **Immune to XSS**.

```
                   SPLIT-TOKEN FULL-STACK AUTHENTICATION
                   
  React Client (Memory Store)                     Spring Boot Backend / DB
  ┌─────────────────────────┐                     ┌──────────────────────────────┐
  │ Access Token (15m)      │ ──[ Bearer JWT ]──> │ Spring Security Filter Chain │
  │ (In JS memory - no XSS) │                     │ (Validates JWT signature)    │
  └─────────────────────────┘                     └──────────────────────────────┘
  
  Browser Cookie Jar                              Spring Boot /auth/refresh
  ┌─────────────────────────┐                     ┌──────────────────────────────┐
  │ Refresh Token Cookie    │ ──[ Cookie Header]─>│ Validates refresh token      │
  │ • HttpOnly (no JS read) │                     │ Rotates token & returns new  │
  │ • SameSite=Strict       │                     │ in-memory Access Token       │
  │ • Secure (HTTPS only)   │                     └──────────────────────────────┘
  └─────────────────────────┘
```

---

## 2. SPRING BOOT 3 / SPRING SECURITY 6 CONFIGURATION

```java
// backend/src/main/java/com/enterprise/config/SecurityConfig.java
package com.enterprise.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Attach CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // 2. Disable CSRF for stateless Bearer token APIs (Enabled only on cookie-auth endpoints)
            .csrf(csrf -> csrf.disable())
            
            // 3. Stateless Session Management (Zero server-side HTTP session storage)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. Endpoint Authorization Rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/register", "/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            
            // 5. Inject JWT Filter before standard username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why is storing access tokens in `localStorage` an unacceptable security vulnerability in enterprise banking/healthcare applications?*
2. *How does the combination of in-memory Access Tokens and `HttpOnly; SameSite=Strict` Refresh Cookies eliminate both XSS token theft and CSRF attacks?*
3. *Why must Spring Security's `SessionCreationPolicy` be configured to `STATELESS` when using JWT authentication?*
