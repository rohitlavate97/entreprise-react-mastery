# Project 1 — Multi-Tenant SaaS Workspace Architecture

## 1. PROJECT SPECIFICATION & ARCHITECTURAL BLUEPRINT
- **Domain:** Enterprise B2B SaaS Platform (Team collaboration, customer workspaces, billing).
- **Core Architecture:**
  - **Auth Layer:** Split-Token authentication (Stateless JWT in memory + HttpOnly refresh cookie).
  - **Multi-Tenant State Isolation:** Query Key Factory partitioning cache by `organizationId`.
  - **Routing & RBAC:** React Router v6 with `<ProtectedRoute>` inspecting roles (`ADMIN`, `MEMBER`, `VIEWER`).
  - **Backend Contract:** Spring Boot 3 multi-tenant schema isolation with Hibernate `@TenantId`.

```
                    PROJECT 1 ARCHITECTURE MATRIX
                    
  Browser Client (React 19 + TypeScript)
  ├── Auth Store (Zustand) ──────────> in-memory JWT Access Token
  ├── Query Keys Factory ────────────> ['org', orgId, 'projects', filter] (100% Cache Isolation)
  ├── Route Guards ──────────────────> <RoleGuard allow={['ADMIN']}>
  └── Layout System ─────────────────> AppLayout -> OrganizationSwitcher -> Outlet
```

---

## 2. PRODUCTION IMPLEMENTATION: ORG-ISOLATED QUERY FACTORY

```typescript
// features/workspace/api/workspaceKeys.ts
export const workspaceKeys = {
  all: (orgId: string) => ['workspace', orgId] as const,
  projects: (orgId: string) => [...workspaceKeys.all(orgId), 'projects'] as const,
  projectList: (orgId: string, filters: { status?: string; page: number }) =>
    [...workspaceKeys.projects(orgId), 'list', filters] as const,
  members: (orgId: string) => [...workspaceKeys.all(orgId), 'members'] as const,
};
```

---

## 3. SPRING BOOT MULTI-TENANT CONTROLLER INTEGRATION

```java
// backend/src/main/java/com/enterprise/workspace/controller/ProjectController.java
@RestController
@RequestMapping("/api/v1/organizations/{orgId}/projects")
public class ProjectController {

    @GetMapping
    @PreAuthorize("hasPermission(#orgId, 'PROJECT_READ')")
    public ResponseEntity<List<ProjectResponseDto>> listProjects(
            @PathVariable String orgId,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(projectService.getProjectsByTenant(orgId, page));
    }
}
```
