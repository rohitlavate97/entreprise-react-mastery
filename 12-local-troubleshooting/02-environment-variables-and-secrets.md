# Module 12.2 — Environment Variables, Build-Time Secrets & Runtime Validation

## 1. WHAT
- **Client-Side Environment Variables:** Variables statically injected into the client bundle at build/compile time.
- **The Security Mandate:** *Any variable prefixed with `VITE_` is statically embedded into public JavaScript bundles and is completely visible to any user who inspects source code. NEVER put database credentials, private API secret keys, or encryption keys in `VITE_` variables.*

```
                 CLIENT VS SERVER ENVIRONMENT VARIABLES
                 
  ❌ CATASTROPHIC SECURITY LEAK:
  VITE_STRIPE_SECRET_KEY=sk_live_999999999999999999  <-- EMBEDDED IN PUBLIC JS BUNDLE!
  Anyone can open DevTools -> Sources -> bundle.js and steal your private API key!
  
  --------------------------------------------------------------------------------------
  
  ✅ PROPER SEPARATION:
  # Client (Public):
  VITE_API_BASE_URL=https://api.enterprise.com
  VITE_STRIPE_PUBLIC_KEY=pk_live_1234567890
  
  # Server (Spring Boot application.yml / Secret Manager):
  STRIPE_SECRET_KEY=sk_live_999999999999999999      <-- Never sent to browser!
```

---

## 2. PRODUCTION IMPLEMENTATION: TYPE-SAFE ENV VALIDATION (ZOD)

```typescript
// src/shared/config/env.ts
import { z } from 'zod';

// Define expected environment variables schema
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

// Validate import.meta.env on application boot
const parseEnv = () => {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    console.error('❌ [Invalid Environment Variables]:', result.error.format());
    throw new Error('Invalid environment variables. Check .env file configuration.');
  }

  return result.data;
};

// Export typed singleton
export const env = parseEnv();
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does omitting the `VITE_` prefix cause a variable to resolve to `undefined` in Vite applications?*
2. *Why is `import.meta.env` static replacement during `vite build` different from Node.js `process.env` runtime reads?*
3. *What is the file loading precedence between `.env`, `.env.local`, `.env.development`, and `.env.production` in Vite?*
