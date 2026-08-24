# Module 16.4 — Software Supply Chain Security, npm Audits & Subresource Integrity (SRI)

## 1. WHAT
- **Software Supply Chain Attacks:** Exploits where an attacker compromises a third-party npm package, transitive dependency, or CDN asset that your application relies upon. Once merged or deployed, the malicious code runs inside your users' browsers with full access to their session tokens and local state.
- **Subresource Integrity (SRI):** A security feature that enables browsers to verify that resources fetched from third-party CDNs (like analytics or fonts) have not been maliciously modified by validating a cryptographic hash (`integrity="sha384-..."`).

```
                    SUBRESOURCE INTEGRITY (SRI) CHECK
                    
  HTML: <script src="https://cdn.com/analytics.js"
                integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
                crossorigin="anonymous"></script>
                
  1. Browser downloads analytics.js from CDN.
  2. Browser computes SHA-384 hash of file content.
  3. If hash matches -> Script EXECUTES.
  4. If CDN was compromised and script modified -> Hash MISMATCH -> Browser BLOCKS execution!
```

---

## 2. CI/CD SUPPLY CHAIN ENFORCEMENT PROTOCOL

```yaml
# .github/workflows/security-audit.yml
name: Security & Dependency Audit

on:
  push:
    branches: [main]
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # Step 1: Strict lockfile installation
      - name: Install dependencies with frozen lockfile
        run: npm ci

      # Step 2: Fail build if high/critical CVEs exist in dependencies
      - name: Run npm security audit
        run: npm audit --audit-level=high

      # Step 3: Run Socket.dev supply chain scanner (detects telemetry/obfuscation)
      - name: Socket Security Scan
        uses: socketsecurity/socket-security-action@v1
        with:
          api-key: ${{ secrets.SOCKET_SECURITY_API_KEY }}
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *What is a "transitive dependency attack" in npm and why is locking dependencies via `package-lock.json` insufficient to catch malicious updates?*
2. *Why is `crossorigin="anonymous"` required on `<script>` tags when utilizing Subresource Integrity (SRI)?*
3. *What are "Typosquatting" attacks in npm registries and how can enterprise private registries (Nexus / Artifactory) protect teams against them?*
