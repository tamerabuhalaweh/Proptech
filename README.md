# 🏗️ Proptech Platform

> Multi-tenant Property Management SaaS for the Saudi/MENA market

[![CI](https://github.com/your-org/proptech/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/proptech/actions/workflows/ci.yml)
[![Deploy](https://github.com/your-org/proptech/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/proptech/actions/workflows/deploy.yml)

---

## 📋 Overview

Proptech is a comprehensive property management platform built for real estate developers and brokers in Saudi Arabia. It provides multi-tenant, bilingual (Arabic/English) support with RTL-first UI, covering the full property lifecycle from listing to booking and payment tracking.

## 🛠️ Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| **Frontend**   | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| **Backend**    | NestJS 11, Prisma ORM, PostgreSQL 16            |
| **Auth**       | JWT (access + refresh tokens), Passport.js      |
| **Monorepo**   | Turborepo, npm workspaces                       |
| **i18n**       | next-intl (AR/EN), RTL support                  |
| **Infra**      | Docker, Nginx, GitHub Actions CI/CD             |
| **Monitoring** | Prometheus (scraping), structured logging        |
| **Caching**    | Redis 7 (future: sessions, queues)              |

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (:80)                       │
│              Reverse Proxy + SSL                     │
├────────────────────┬────────────────────────────────┤
│                    │                                │
│   /api/*           │   /*                           │
│   ▼                │   ▼                            │
│ ┌────────────┐     │ ┌──────────────┐               │
│ │  NestJS    │     │ │  Next.js 15  │               │
│ │  API       │     │ │  Frontend    │               │
│ │  (:3001)   │     │ │  (:3000)     │               │
│ └─────┬──────┘     │ └──────────────┘               │
│       │            │                                │
│       ▼            │                                │
│ ┌────────────┐     │ ┌──────────────┐               │
│ │ PostgreSQL │     │ │    Redis     │               │
│ │  (:5432)   │     │ │   (:6379)   │               │
│ └────────────┘     │ └──────────────┘               │
└────────────────────┴────────────────────────────────┘

Monorepo Structure:
proptech/
├── apps/
│   ├── api/           # NestJS backend
│   └── web/           # Next.js frontend
├── packages/
│   ├── db/            # Prisma schema, client, seed
│   ├── config/        # Shared configuration
│   ├── types/         # Shared TypeScript types
│   └── ui/            # Shared UI components
├── infra/
│   ├── nginx/         # Reverse proxy config
│   ├── scripts/       # Setup, seed, reset scripts
│   └── monitoring/    # Prometheus, Grafana
├── .github/workflows/ # CI/CD pipelines
├── docker-compose.yml # Production compose
└── docker-compose.dev.yml # Dev compose override
```

## 🚀 Getting Started

### Option 1: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/your-org/proptech.git
cd proptech

# Copy environment files
cp .env.example .env

# Start everything
docker compose up -d

# Run database migrations
docker compose exec api npx prisma db push --schema=packages/db/prisma/schema.prisma

# Seed with sample data
docker compose exec api npx ts-node packages/db/prisma/seed.ts

# Access:
#   Web:     http://localhost
#   API:     http://localhost/api
#   Swagger: http://localhost/docs
```

### Option 2: Local Development

```bash
# Prerequisites: Node.js 20+, PostgreSQL 16, npm

# Clone and setup
git clone https://github.com/your-org/proptech.git
cd proptech
bash infra/scripts/setup.sh

# Start development servers
npm run dev

# Access:
#   Web:     http://localhost:3000
#   API:     http://localhost:3001/api
#   Swagger: http://localhost:3001/docs
```

### Option 3: Docker (Dev Mode with Hot Reload)

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# pgAdmin: http://localhost:5050
```

## 🔐 Default Credentials

| User          | Email                        | Password  | Role         |
| ------------- | ---------------------------- | --------- | ------------ |
| Arabic Admin  | admin@dar-alarkan.sa         | Admin@123 | Tenant Admin |
| Arabic Broker | broker@dar-alarkan.sa        | Admin@123 | Broker       |
| English Admin | admin@gulfproperties.com     | Admin@123 | Tenant Admin |
| English Broker| broker@gulfproperties.com    | Admin@123 | Broker       |

## 🌍 Environment Variables

### API (`apps/api/.env`)

| Variable             | Description                    | Default              |
| -------------------- | ------------------------------ | -------------------- |
| `DATABASE_URL`       | PostgreSQL connection string   | (required)           |
| `JWT_ACCESS_SECRET`  | JWT access token secret        | (required)           |
| `JWT_REFRESH_SECRET` | JWT refresh token secret       | (required)           |
| `JWT_ACCESS_EXPIRY`  | Access token TTL               | `15m`                |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL              | `7d`                 |
| `PORT`               | API server port                | `3001`               |
| `CORS_ORIGINS`       | Allowed CORS origins (CSV)     | `http://localhost:3000` |
| `SWAGGER_ENABLED`    | Enable Swagger docs            | `true`               |

### Web (`apps/web/.env.local`)

| Variable              | Description         | Default                      |
| --------------------- | ------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend API URL     | `http://localhost:3001/api`  |
| `NEXT_PUBLIC_APP_NAME` | App display name    | `Proptech`                   |

## 📚 API Documentation

When `SWAGGER_ENABLED=true`, interactive API docs are available at:
- **Local:** http://localhost:3001/docs
- **Docker:** http://localhost/docs

### Key Endpoints

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| POST   | `/api/auth/login`     | Authenticate user     |
| POST   | `/api/auth/register`  | Register new user     |
| GET    | `/api/health`         | Basic health check    |
| GET    | `/api/health/deep`    | Deep health (+ DB)    |
| GET    | `/api/properties`     | List properties       |
| GET    | `/api/leads`          | List leads            |
| GET    | `/api/bookings`       | List bookings         |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run API tests only
cd apps/api && npm run test

# Run e2e tests
cd apps/api && npm run test:e2e
```

## 📁 Folder Structure

```
proptech/
├── apps/
│   ├── api/                     # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/            # Authentication (JWT, guards)
│   │   │   ├── bookings/        # Booking management
│   │   │   ├── buildings/       # Building CRUD
│   │   │   ├── campaigns/       # Marketing campaigns
│   │   │   ├── common/          # Shared decorators, filters, interceptors
│   │   │   ├── communications/  # Email/SMS/WhatsApp
│   │   │   ├── dashboard/       # Analytics & KPIs
│   │   │   ├── documents/       # Document management
│   │   │   ├── email-templates/ # Email template engine
│   │   │   ├── health/          # Health check endpoints
│   │   │   ├── leads/           # CRM lead management
│   │   │   ├── locale/          # i18n/locale settings
│   │   │   ├── milestones/      # Payment milestones
│   │   │   ├── notifications/   # In-app notifications
│   │   │   ├── pricing/         # Pricing & discounts
│   │   │   ├── prisma/          # Database service
│   │   │   ├── properties/      # Property CRUD
│   │   │   ├── subscriptions/   # SaaS subscriptions
│   │   │   ├── tenants/         # Multi-tenant management
│   │   │   └── units/           # Unit inventory
│   │   └── test/                # E2E tests
│   │
│   └── web/                     # Next.js Frontend
│       ├── app/                 # App router pages
│       │   └── [locale]/        # i18n routes (ar/en)
│       │       ├── (auth)/      # Login, register
│       │       └── (dashboard)/ # Dashboard, properties, leads...
│       ├── components/          # React components
│       ├── hooks/               # Custom hooks & API hooks
│       ├── i18n/                # Internationalization config
│       ├── lib/                 # Utilities, API client, types
│       ├── messages/            # ar.json, en.json translations
│       └── providers/           # Auth, query providers
│
├── packages/
│   ├── db/                      # Prisma schema & client
│   │   └── prisma/
│   │       ├── schema.prisma    # Database schema
│   │       └── seed.ts          # Seed data
│   ├── config/                  # Shared constants & validation
│   ├── types/                   # Shared TypeScript types
│   └── ui/                      # Shared UI package
│
├── infra/
│   ├── nginx/                   # Reverse proxy config
│   ├── scripts/                 # DevOps scripts
│   └── monitoring/              # Prometheus, Grafana
│
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.yml           # Production Docker
├── docker-compose.dev.yml       # Dev Docker override
├── Dockerfile.api               # API container
└── Dockerfile.web               # Web container
```

## 🤝 Contributing

1. Create a feature branch from `develop`:
   ```bash
   git checkout -b feature/your-feature develop
   ```
2. Make your changes and ensure all tests pass:
   ```bash
   npm run lint && npm run test
   ```
3. Commit with conventional commits:
   ```bash
   git commit -m "feat(leads): add bulk import endpoint"
   ```
4. Push and open a Pull Request to `develop`
5. CI pipeline must pass before merge

### Commit Convention

- `feat(scope):` — New feature
- `fix(scope):` — Bug fix
- `docs(scope):` — Documentation
- `chore(scope):` — Maintenance
- `refactor(scope):` — Code refactoring
- `test(scope):` — Tests

## 📄 License

Proprietary — © 2024 Smart Labs / SorohTheQA
