# Module 22.4 — Automated Quality Gates, Linters & Pre-Commit Hooks

## 1. WHAT
- **Automated Quality Gates:** Tooling that automatically enforces code formatting, static analysis, type checking, and dead-code elimination in Git pre-commit hooks and CI pipelines, freeing human reviewers to focus purely on business logic, security, and architecture.

---

## 2. PRODUCTION TOOLING STACK

```yaml
# lefthook.yml (Fast Rust-Based Pre-Commit Hook Manager)
pre-commit:
  parallel: true
  commands:
    typecheck:
      run: npx tsc --noEmit
    biome-check:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json}"
      run: npx @biomejs/biome check --apply {staged_files}
      stage_fixed: true
    knip:
      run: npx knip --no-exit-code
```

```json
// biome.json (Ultra-Fast Formatter and Linter)
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useHookAtTopLevel": "error"
      },
      "security": {
        "noDangerouslySetInnerHtml": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noArrayIndexKey": "error"
      }
    }
  }
}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *How does Knip identify dead code, unreferenced exports, and orphaned npm packages across large monorepos?*
2. *Why is Biome significantly faster than traditional ESLint + Prettier pipelines?*
3. *Why should pre-commit hooks execute only against `{staged_files}` rather than the entire repository?*
