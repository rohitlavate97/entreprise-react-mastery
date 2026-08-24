# Module 11.3 — Spring Boot CORS Architecture & Filter Chain Ordering

## 1. WHAT
- **The Preflight Filter Ordering Problem:** When a React application sends a non-simple HTTP request (e.g. JSON `Content-Type`, custom `Authorization` or `X-Correlation-ID` header), the browser automatically fires an unauthenticated `OPTIONS` preflight request.
- **The Classic Spring Bug:** If Spring Security evaluates authorization *before* the CORS filter processes the request, Spring Security sees an unauthenticated request without a JWT and rejects it with `401 Unauthorized` or `403 Forbidden`. The browser aborts the request before the real POST/GET is ever sent!

```
                  SPRING SECURITY FILTER CHAIN ORDERING
                  
  ❌ WRONG ORDER (Spring Security blocks preflight):
  Browser (OPTIONS /api/orders) ──> [ Spring Security Auth Filter ] ──> ❌ 401/403 FORBIDDEN!
                                                                      (Never reaches CorsFilter!)
                                                                      
  ---------------------------------------------------------------------------------------------
  
  ✅ CORRECT ORDER (CorsFilter executes FIRST):
  Browser (OPTIONS /api/orders) ──> [ 1. CorsFilter ] ──> Detects OPTIONS + Origin match
                                                      ──> Appends Access-Control headers
                                                      ──> Returns 200 OK immediately!
                                                      
  Browser (POST /api/orders)    ──> [ 1. CorsFilter ] ──> Appends CORS headers
                                ──> [ 2. JwtAuthFilter ] ──> Validates Bearer Token -> Controller
```

---

## 2. PRODUCTION SPRING BOOT CORS CONFIGURATION

```java
// backend/src/main/java/com/enterprise/config/CorsConfig.java
package com.enterprise.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 1. Explicit Allowed Origins (Never use "*" when allowCredentials is true!)
        config.setAllowedOrigins(allowedOrigins);
        
        // 2. Allowed HTTP Methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // 3. Allowed Request Headers (Must include all custom headers sent by client)
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Correlation-ID",
            "Idempotency-Key",
            "If-Match"
        ));
        
        // 4. Exposed Response Headers (Headers readable by React JavaScript code)
        config.setExposedHeaders(List.of(
            "Location",
            "ETag",
            "X-Total-Count",
            "X-Correlation-ID"
        ));
        
        // 5. Allow Credentials (Cookies & Authorization headers)
        config.setAllowCredentials(true);
        
        // 6. Cache Preflight Response in Browser (Prevents preflight on every single request)
        config.setMaxAge(3600L); // 1 hour preflight cache

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does using `allowedOrigins("*")` throw an error when `allowCredentials(true)` is enabled in Spring Boot?*
2. *Why must response headers like `ETag` and `X-Total-Count` be explicitly listed in `setExposedHeaders` for React to read them via Axios?*
3. *What is the exact mechanism by which `http.cors(cors -> cors.configurationSource(...))` integrates with the Spring Security filter chain?*
