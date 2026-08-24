# Module 18.1 — Multi-Stage Production Dockerfile Design (From 1.2GB to 24MB)

## 1. WHAT
- **Multi-Stage Docker Build:** A containerization pattern that separates the heavy build environment (Node.js runtime, npm dependencies, TypeScript compiler) from the lightweight production serving environment (Nginx Alpine).
- **The Container Weight Problem:**
  - Standard Single-Stage Dockerfile containing `node_modules`: $\sim 1.2\text{GB}$. Contains build tools, dev dependencies, and source code.
  - Multi-Stage Nginx Alpine Image: $\sim 24\text{MB}$. Contains **only** static HTML/JS/CSS assets and the Nginx web server binary.

```
                    MULTI-STAGE DOCKER BUILD PIPELINE
                    
  Stage 1: Build Container (node:20-alpine)  ~1.2GB
  ├── Copies package.json & runs npm ci
  ├── Copies source code
  └── Executes "npm run build" ──> Outputs static files to dist/
                                        │
                                        ▼ (Copies ONLY dist/ folder)
  Stage 2: Production Container (nginx:1.27-alpine)  ~24MB
  ├── Copies dist/ to /usr/share/nginx/html
  ├── Copies custom nginx.conf
  └── Runs as non-root user (nginx) on Port 8080
```

---

## 2. PRODUCTION MULTI-STAGE DOCKERFILE

```dockerfile
# syntax=docker/dockerfile:1.4
# Stage 1: Build Environment
FROM node:20-alpine AS builder

WORKDIR /app

# Cache dependencies layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production Runtime
FROM nginx:1.27-alpine-slim AS runner

# Create unprivileged runtime user & permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Switch to non-root user for security compliance
USER nginx

# Expose unprivileged port (8080)
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why should production Docker containers never run as the default `root` user?*
2. *How does copying `package.json` before source code leverage Docker layer caching to accelerate CI/CD builds?*
3. *Why does using Alpine-slim over standard Debian reduce container image size and CVE vulnerabilities by $>90\%$?*
