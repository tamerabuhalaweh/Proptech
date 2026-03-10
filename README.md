# 🏗️ Proptech — Property Management SaaS Platform

## Overview
Multi-tenant SaaS property management platform for the Saudi/MENA market.
Arabic/English (RTL/LTR), Hijri calendar, SAR currency support.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **UI Library** | shadcn/ui + Radix UI + Tailwind CSS 4 |
| **State** | Zustand + TanStack Query v5 |
| **Forms** | React Hook Form + Zod validation |
| **i18n / RTL** | next-intl, Tailwind RTL plugin |
| **Backend** | Node.js (NestJS), TypeScript |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Auth** | NextAuth.js v5 (multi-tenant) |
| **File Storage** | S3-compatible (MinIO / AWS S3) |
| **Realtime** | Socket.io |
| **CI/CD** | GitHub Actions → Docker → VPS |
| **Monitoring** | Sentry, Prometheus + Grafana |

## Project Structure
```
proptech/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── ui/               # Shared UI components (shadcn/ui)
│   ├── db/               # Prisma schema & migrations
│   ├── types/            # Shared TypeScript types
│   └── config/           # ESLint, TS, Tailwind configs
├── docs/
│   ├── architecture/     # System design docs
│   ├── api/              # API specifications
│   └── ui-specs/         # UI/UX specifications
└── infra/                # Docker, nginx, deploy scripts
```

## Jira Project
- **Key**: PROP
- **URL**: https://sorohtheqa.atlassian.net/jira/software/projects/PROP
- **Board**: PROP: Default Board (ID: 34)
- **Workflow**: To Do → In Progress → Done

## Epics
1. **PROP-1**: Tenant Provisioning (PROP-2 to PROP-9)
2. **PROP-18**: Project Creation (PROP-19 to PROP-21)
3. **PROP-36**: Lead Capture (PROP-36 to PROP-53)

## Modules
1. **Tenant Management** — Multi-tenant isolation, provisioning, encryption
2. **Subscription & Billing** — Tiers, lifecycle, limits, credits
3. **Localization** — Arabic/English, Hijri, SAR, timezone
4. **Project Management** — Real estate projects, phases, media
5. **Inventory** — Units, buildings, pricing, availability grid
6. **Pricing & Discounts** — Price matrix, discounts, audit logs
7. **Construction Milestones** — Phases, installments, notifications
8. **Lead Management (CRM)** — Capture, scoring, pipeline, assignment
9. **Communication** — WhatsApp, email, calls, document tracking
10. **Analytics & Reporting** — Dashboards, forecasts, funnels
