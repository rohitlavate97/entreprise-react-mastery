# Module 2.4 — TypeScript Anti-Patterns in Enterprise Codebases

## 1. WHAT & WHY
Enterprise TypeScript codebases frequently suffer from "False Safety"—a condition where TypeScript is configured and running, but anti-patterns systematically strip away the type checker's protection, allowing critical runtime bugs to enter production undetected.

---

## 2. THE TOP 5 ENTERPRISE TYPESCRIPT ANTI-PATTERNS

### Anti-Pattern 1: The Contagion of `any`
```typescript
// ❌ CRITICAL ANTI-PATTERN: Using 'any'
function parseApiResponse(response: any) {
  // 'any' disables all type checking not just here, but wherever this return value flows!
  return response.data.user;
}

// ✅ MODERN FIX: Use 'unknown' + Type Narrowing / Schema Validation
function parseApiResponseSafe(response: unknown): UserDTO {
  const result = UserDTOSchema.safeParse(response);
  if (!result.success) throw new Error('Invalid response');
  return result.data;
}
```

---

### Anti-Pattern 2: The Dangerous Type Assertion (`as Type`)
Using `as` tells the compiler: *"Trust me, I know better than you."* When you are wrong, TypeScript cannot save you.

```typescript
// ❌ ANTI-PATTERN: Blindly asserting external data
const config = JSON.parse(localStorage.getItem('config') || '{}') as AppConfig;
// If localStorage contained malformed JSON, config.theme.mode throws runtime TypeError!

// ✅ MODERN FIX: Validation or Defensive Fallback
const raw = localStorage.getItem('config');
const config: AppConfig = raw ? ConfigSchema.parse(JSON.parse(raw)) : DEFAULT_CONFIG;
```

---

### Anti-Pattern 3: The Non-Null Assertion Operator (`!`) Trap
Using `!` asserts that a value is definitely neither `null` nor `undefined`.

```typescript
// ❌ ANTI-PATTERN:
const user = users.find(u => u.id === targetId)!;
console.log(user.name); // Crashes if targetId not found in array!

// ✅ MODERN FIX: Handle non-existence explicitly
const user = users.find(u => u.id === targetId);
if (!user) {
  throw new EntityNotFoundError(`User with ID ${targetId} not found.`);
}
console.log(user.name); // Safely narrowed to User
```

---

### Anti-Pattern 4: Optional Chaining Returning `undefined` Into Math / Logic
```typescript
// ❌ ANTI-PATTERN:
const totalPrice = item?.price * quantity; 
// If item is null, totalPrice becomes NaN! NaN propagates silently through the billing system!

// ✅ MODERN FIX: Nullish Coalescing with explicit fallback
const unitPrice = item?.price ?? 0;
const totalPrice = unitPrice * quantity;
```

---

### Anti-Pattern 5: Double Type Casting (`as unknown as Target`)
Double casting bypasses TypeScript's fundamental type overlap checks.

```typescript
// ❌ ANTI-PATTERN: Forcing incompatible types
const badString = (123 as unknown) as string;
badString.toLowerCase(); // Compiles fine, crashes at runtime: badString.toLowerCase is not a function!
```

---

## 3. STRICT `tsconfig.json` ENTERPRISE BASELINE

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  }
}
```
*Enabling `"noUncheckedIndexedAccess": true` forces array indexing (`arr[0]`) to return `T | undefined`, preventing out-of-bounds null pointer exceptions!*

---

## 4. EXPERT INTERVIEW QUESTIONS
1. *Why is `unknown` preferred over `any` when handling untyped third-party payloads?*
2. *What does `"noUncheckedIndexedAccess": true` do in `tsconfig.json`, and why is it recommended for mission-critical enterprise applications?*
3. *How can careless use of the optional chaining operator (`?.`) introduce `NaN` or silent bugs in financial calculation logic?*
