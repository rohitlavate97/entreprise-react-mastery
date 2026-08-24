# Module 11.5 — Error Handling & RFC 7807 Problem Details (Spring Boot 3 to React)

## 1. WHAT
- **RFC 7807 Problem Details:** An IETF standard specification that defines a standardized JSON format for carrying machine-readable error details in HTTP responses:
  - `type`: URI reference identifying the problem type
  - `title`: Short human-readable summary
  - `status`: HTTP status code
  - `detail`: Human-readable explanation specific to this occurrence
  - `instance`: URI of the specific request that generated the error
  - `invalidParams`: Array of field-level validation errors for form mapping

```
                   STANDARDIZED RFC 7807 JSON PAYLOAD
                   
  HTTP/1.1 422 Unprocessable Entity
  Content-Type: application/problem+json
  
  {
    "type": "https://api.enterprise.com/errors/validation",
    "title": "Validation Failed",
    "status": 422,
    "detail": "3 fields failed constraint validation",
    "instance": "/api/orders",
    "invalidParams": [
      { "name": "email", "reason": "Must be a valid email address" },
      { "name": "totalAmount", "reason": "Must be greater than 0" },
      { "name": "shippingAddress.zipCode", "reason": "Invalid ZIP code" }
    ]
  }
```

---

## 2. SPRING BOOT 3 GLOBAL EXCEPTION HANDLER (`@RestControllerAdvice`)

```java
// backend/src/main/java/com/enterprise/common/GlobalExceptionHandler.java
package com.enterprise.common;

import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationExceptions(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Validation failed for one or more fields"
        );
        problem.setType(URI.create("https://api.enterprise.com/errors/validation"));
        problem.setTitle("Validation Failed");

        // Map Spring FieldErrors to RFC 7807 invalidParams list
        List<InvalidParamDto> invalidParams = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> new InvalidParamDto(err.getField(), err.getDefaultMessage()))
            .toList();

        problem.setProperty("invalidParams", invalidParams);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(problem);
    }

    public record InvalidParamDto(String name, String reason) {}
}
```

---

## 3. REACT HOOK FORM AUTOMATIC ERROR MAPPER

```typescript
// frontend/src/shared/forms/mapServerErrors.ts
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export function mapProblemDetailsToForm<T extends FieldValues>(
  error: any,
  setError: UseFormSetError<T>
): boolean {
  const problem = error.response?.data as ProblemDetail | undefined;

  if (problem?.invalidParams && Array.isArray(problem.invalidParams)) {
    problem.invalidParams.forEach(({ name, reason }) => {
      setError(name as Path<T>, {
        type: 'server',
        message: reason,
      });
    });
    return true; // Successfully mapped field errors
  }

  return false; // Generic error, not mapped to specific fields
}
```

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *What are the architectural advantages of adopting RFC 7807 Problem Details across all microservices compared to ad-hoc error JSON formats?*
2. *How does `mapProblemDetailsToForm` translate nested field paths (e.g. `shippingAddress.zipCode`) directly into React Hook Form errors?*
3. *Why should the `type` URI field point to a stable documentation URL explaining the error category?*
