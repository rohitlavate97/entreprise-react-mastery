# Module 18.4 — Enterprise GitHub Actions CI/CD Pipeline

## 1. WHAT
- **Enterprise CI/CD Pipeline:** An automated continuous integration and continuous deployment workflow that validates code quality, executes unit and integration test suites, runs end-to-end browser smoke tests, builds production Docker images, uploads source maps to Sentry, and rolls out artifacts to Kubernetes clusters.

```
                    GITHUB ACTIONS CI/CD PIPELINE PHASES
                    
  [ Pull Request / Commit to Main ]
               │
               ▼
  Phase 1: Lint & TypeCheck ────> tsc --noEmit && eslint .
               │
               ▼
  Phase 2: Vitest Suites ───────> Unit & Integration tests with MSW
               │
               ▼
  Phase 3: Playwright E2E ──────> Multi-browser E2E checkout smoke tests
               │
               ▼
  Phase 4: Docker Build & Push ─> Builds multi-stage image & pushes to Registry (ECR/GHCR)
               │
               ▼
  Phase 5: Sentry Release ──────> Releases v1.4.2 & uploads hidden source maps
               │
               ▼
  Phase 6: Kubernetes Rollout ──> kubectl set image deployment/frontend frontend=app:v1.4.2
```

---

## 2. PRODUCTION WORKFLOW CONFIGURATION

```yaml
# .github/workflows/deploy.yml
name: Enterprise CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeCheck & Lint
        run: |
          npm run typecheck
          npm run lint

      - name: Run Unit & Integration Tests (Vitest)
        run: npm run test:run

  e2e:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright Tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  deploy:
    needs: e2e
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest,ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why should E2E tests run only after Unit/Integration tests pass (Fail-Fast principle)?*
2. *How does GitHub Actions layer caching (`type=gha`) reduce Docker build times from 6 minutes to 30 seconds?*
3. *Why should Docker image tags use immutable Git commit SHAs (`${{ github.sha }}`) rather than mutable `:latest` tags in Kubernetes deployments?*
