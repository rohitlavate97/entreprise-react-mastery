# Playbook PB-012 — Full-Stack React + Spring Boot Integration Triage

## Objective
Provide an operational triage workflow for diagnosing CORS preflight rejections, Long ID truncation, CSRF token validation failures, and JPA concurrency conflicts between React and Spring Boot.

---

## 1. CORS Preflight 401/403 Block Triage Workflow

```
[ Step 1: Check Preflight Response Headers ]
  - Inspect OPTIONS request in Network Tab:
    • Is status 401 or 403? -> Spring Security blocked it before CorsFilter!
    • Is status 200/204 but missing Access-Control-Allow-Origin? -> Origin not in allowlist.
             │
[ Step 2: Fix Spring Security Filter Order ]
  - Ensure SecurityConfig uses: .cors(cors -> cors.configurationSource(...))
  - Never configure CORS via @CrossOrigin on controllers if SecurityFilterChain is active!
             │
[ Step 3: Check Custom Request Headers ]
  - Does request send X-Correlation-ID or Idempotency-Key?
  - Verify these exact header names are listed in config.setAllowedHeaders().
```

---

## 2. 64-bit Long ID Truncation Triage

```
[ Step 1: Detect Corruption ]
  - Does ID end in 000, 002, 004, or mismatch DB primary key?
  - Check raw HTTP response in Network tab -> Is ID a number (12345678901234567)?
             │
[ Step 2: Fix Backend DTO Serialization ]
  - Add @JsonSerialize(using = ToStringSerializer.class) to entity/DTO Long fields.
             │
[ Step 3: Fix Frontend TypeScript Type ]
  - Update interface: id: string (NOT number).
```

---

## 3. JPA 409 Optimistic Concurrency Conflict Triage

```
[ Step 1: Verify ETag & Version Column ]
  - Does DB entity have @Version private Long version?
  - Does Controller return .eTag(version) on GET requests?
             │
[ Step 2: Verify If-Match Header ]
  - Does React mutation send headers: { 'If-Match': currentVersion }?
             │
[ Step 3: Provide UI Conflict Resolution Modal ]
  - When API returns 409 Conflict, show diff modal: "Overwrite", "Reload", or "Cancel".
```
