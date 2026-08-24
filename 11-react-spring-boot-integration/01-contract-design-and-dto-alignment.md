# Module 11.1 — Full-Stack Contract Design & DTO Alignment (Spring Boot & TypeScript)

## 1. WHAT
- **Full-Stack Contract Alignment:** The explicit architectural alignment of data transfer objects (DTOs), serialization formats, date-time standards, nullability constraints, and numeric precision rules between a Spring Boot Java backend and a React TypeScript frontend.
- **The Critical Precision Boundary:**
  - Java 64-bit `Long` can represent integers up to $2^{63} - 1$ ($\approx 9.22 \times 10^{18}$).
  - JavaScript `Number` is IEEE 754 double precision, with `Number.MAX_SAFE_INTEGER` capped at $2^{53} - 1$ (`9007199254740991`).
  - **Rule:** *All 64-bit Java `Long` primary keys / snowflake IDs MUST be serialized as JSON Strings to prevent silent numeric truncation.*

```
                 THE 64-BIT INTEGER TRUNCATION TRAP
                 
  Spring Boot Database Entity:
  id = 9007199254740995L  (Long)
            │
  JSON Payload without String Serializer:
  { "id": 9007199254740995 }
            │
  JavaScript JSON.parse() in React Client:
  Number(9007199254740995) ──> Evaluates to 9007199254740996 (LAST DIGIT CORRUPTED!)
            │
  Client sends mutation: PUT /api/orders/9007199254740996 ──> ❌ 404 NOT FOUND!
```

---

## 2. SPRING BOOT JACKSON CONFIGURATION & DTO ALIGNMENT

```java
// backend/src/main/java/com/enterprise/orders/dto/OrderResponseDto.java
package com.enterprise.orders.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

public record OrderResponseDto(
    // 1. Safe Long Serialization: Serializes 64-bit Long as JSON string: "9007199254740995"
    @JsonSerialize(using = ToStringSerializer.class)
    Long id,

    @NotNull
    String orderNumber,

    // 2. Financial Decimals: Preserved as exact string or scaled decimal
    BigDecimal totalAmount,

    // 3. Strict ISO-8601 UTC Instant timestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    Instant createdAt,

    OrderStatus status
) {}
```

---

## 3. MATCHING REACT TYPESCRIPT DTO

```typescript
// frontend/src/features/orders/model/order.types.ts
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';

export interface OrderResponseDto {
  id: string; // Typed as string to receive serialized Long safely!
  orderNumber: string;
  totalAmount: number;
  createdAt: string; // ISO-8601 UTC string (e.g. "2026-08-25T12:00:00.000Z")
  status: OrderStatus;
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why does JavaScript silently corrupt 64-bit Java `Long` values, and how does `@JsonSerialize(using = ToStringSerializer.class)` eliminate this bug?*
2. *Why should all backend timestamps be serialized strictly as ISO-8601 UTC strings rather than Unix epoch milliseconds or localized strings?*
3. *How do you enforce single-source-of-truth DTO schema alignment between Spring Boot and React using OpenAPI / Swagger code generators?*
