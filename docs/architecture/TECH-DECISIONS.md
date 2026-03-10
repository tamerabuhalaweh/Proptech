# 🏛️ Technical Architecture Decisions

## ADR-001: Next.js 15 with App Router
- **Decision**: Use Next.js 15 App Router (not Pages Router)
- **Reason**: Server Components, parallel routes for dashboards, streaming SSR, middleware for tenant routing
- **Trade-off**: Steeper learning curve but future-proof

## ADR-002: shadcn/ui + Radix UI
- **Decision**: Use shadcn/ui as the component library
- **Reason**: Full ownership of components (copy-paste, not dependency), Radix primitives for accessibility, Tailwind-native styling, easy RTL customization
- **Trade-off**: More initial setup vs. MUI/Ant Design, but zero vendor lock-in

## ADR-003: Multi-Tenant Architecture (Schema-per-Tenant)
- **Decision**: Shared database with row-level tenant isolation (tenant_id column)
- **Reason**: Simpler ops than schema-per-tenant, works well up to ~1000 tenants
- **Guard**: Prisma middleware to auto-inject tenant_id in all queries
- **Encryption**: Tenant-specific encryption keys stored in AWS KMS / Vault

## ADR-004: NestJS for Backend
- **Decision**: Use NestJS (TypeScript, modular, dependency injection)
- **Reason**: Enterprise-grade structure, built-in validation, guards, interceptors
- **API Style**: RESTful with OpenAPI 3.1 spec generation

## ADR-005: PostgreSQL + Prisma
- **Decision**: PostgreSQL 16 with Prisma ORM
- **Reason**: JSONB for flexible fields, full-text search, row-level security, Prisma for type-safe queries and migrations
- **Trade-off**: Prisma adds abstraction but guarantees type safety

## ADR-006: Arabic/English RTL Support
- **Decision**: next-intl for i18n, Tailwind RTL plugin, logical properties (ms/me instead of ml/mr)
- **Reason**: Saudi market requires full Arabic support with Hijri calendar
- **Calendar**: Use @internationalized/date for Hijri/Gregorian conversion
- **Font**: IBM Plex Sans Arabic + Inter

## ADR-007: Zustand + TanStack Query
- **Decision**: Zustand for client state, TanStack Query v5 for server state
- **Reason**: Lightweight, no boilerplate (vs Redux), automatic caching/refetching
- **Pattern**: Query keys follow `[module, entity, id]` convention

## ADR-008: Monorepo with Turborepo
- **Decision**: Monorepo structure with Turborepo for build orchestration
- **Reason**: Shared types, UI components, and configs across apps
- **Structure**: `apps/` for deployables, `packages/` for shared code

## ADR-009: Authentication — NextAuth.js v5
- **Decision**: NextAuth.js v5 with credential + OAuth providers
- **Reason**: Built-in session management, JWT, multi-tenant aware
- **RBAC**: Role-based access (Super Admin, Tenant Admin, Manager, Broker, Viewer)

## ADR-010: Design System — Proptech Theme
- **Decision**: Custom design tokens on top of shadcn/ui
- **Colors**: 
  - Primary: Deep Blue (#1E3A5F) — trust, professionalism
  - Accent: Gold (#D4A843) — premium, real estate
  - Success: Emerald (#10B981)
  - Background: Slate (#F8FAFC) / Dark (#0F172A)
- **Typography**: Inter (Latin), IBM Plex Sans Arabic (Arabic)
- **Spacing**: 4px grid system
- **Border Radius**: 8px default, 12px for cards
