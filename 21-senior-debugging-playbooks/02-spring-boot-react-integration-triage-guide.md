# Module 21.2 — Full-Stack Spring Boot + React Integration Triage Guide

## 1. INTEGRATION FAILURE MODES & INSTANT REMEDIATION MATRIX

```
┌──────────────────────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Integration Boundary         │ Failure Symptom                          │ Instant Remediation Code                               │
├──────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. 64-bit Long ID Keys       │ 9223372036854775807 becomes ...75800     │ Java: @JsonSerialize(using = ToStringSerializer.class) │
│                              │ in React JSON.parse()                    │ TypeScript: id: string (NOT number!)                   │
├──────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. CORS Preflight (OPTIONS)  │ 403 Forbidden on preflight before auth   │ Java: CorsFilter bean registered with                  │
│                              │ filter chain executes                    │ @Order(Ordered.HIGHEST_PRECEDENCE)                     │
├──────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. CSRF Handshake            │ 403 Forbidden on POST/PUT/DELETE         │ Java: CookieCsrfTokenRepository.withHttpOnlyFalse()    │
│                              │ with active session cookie               │ Axios: xsrfCookieName: 'XSRF-TOKEN'                    │
├──────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. Concurrent Edits          │ Silent overwrite of colleague's changes  │ Java: @Version private Long version;                   │
│                              │ or unhandled 409 Conflict                │ React: Send { 'If-Match': String(version) } & rollback │
├──────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5. Date / Time Desync        │ Off-by-one day display errors across     │ Java: Instant (UTC); React: date-fns parseISO(utcStr)  │
│                              │ international timezones                  │ ALWAYS transmit ISO-8601 strings ending in 'Z'         │
└──────────────────────────────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```
