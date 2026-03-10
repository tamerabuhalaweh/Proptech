# SECURITY.md — Proptech Platform Security Audit Report

**Audit Date**: 2026-03-11  
**Auditor**: Security Engineer (automated)  
**Scope**: Full codebase — backend API, frontend, infrastructure, CI/CD  

---

## Executive Summary

The Proptech platform is a multi-tenant SaaS application with **21 NestJS API modules**, JWT+RBAC authentication, and Prisma ORM. A comprehensive security audit identified **4 CRITICAL**, **3 HIGH**, and **6 MEDIUM** severity issues. All CRITICAL and HIGH issues have been patched. MEDIUM and LOW items are documented for future hardening.

---

## Vulnerabilities Found & Fixed

### 🔴 CRITICAL — Fixed

#### 1. Privilege Escalation via Registration (CVE-equivalent)
- **File**: `apps/api/src/auth/dto/register.dto.ts`, `auth.service.ts`
- **Issue**: `RegisterDto` accepted an optional `role` field, allowing any user to self-register as `SUPER_ADMIN` or `TENANT_ADMIN`
- **Fix**: Removed `role` field from `RegisterDto`. New users always get `VIEWER` role. Added password strength validation (`@Matches` decorator requiring uppercase, lowercase, and digit)
- **Impact**: Complete system takeover by unauthenticated attacker

#### 2. Cross-Tenant Data Access via Tenants Controller
- **File**: `apps/api/src/tenants/tenants.controller.ts`
- **Issue**: `TENANT_ADMIN` users could access, modify, or view ANY tenant's data via `GET /tenants/:id` and `PATCH /tenants/:id` — no check that `:id` matches their own `tenantId`
- **Fix**: Added `assertTenantAccess()` method that verifies `TENANT_ADMIN` can only access their own tenant. `SUPER_ADMIN` retains cross-tenant access
- **Impact**: Full cross-tenant data breach

#### 3. Missing Tenant Scoping in Booking Validation
- **File**: `apps/api/src/bookings/bookings.service.ts`
- **Issue**: `assertNoActiveBooking()` queried bookings without `tenantId` filter, potentially leaking booking existence across tenants. Also exposed internal booking IDs in error messages
- **Fix**: Added `tenantId` parameter and filter. Removed booking ID from conflict error message
- **Impact**: Cross-tenant information disclosure

#### 4. Weak/Default Secrets in Docker Compose
- **File**: `docker-compose.yml`
- **Issue**: JWT secrets, Postgres password, and Redis password had hardcoded fallback defaults (weak placeholder defaults). If deployed without `.env`, these weak defaults would be used
- **Fix**: Changed to `${VAR:?error message}` syntax — Docker Compose now **fails to start** if secrets are not explicitly set. Removed direct port exposure for Postgres and Redis
- **Impact**: Full database and auth bypass in production

### 🟠 HIGH — Fixed

#### 5. No Rate Limiting on Authentication Endpoints
- **File**: `apps/api/src/auth/auth.controller.ts`, `app.module.ts`
- **Issue**: Login, registration, and token refresh had no rate limiting, enabling brute-force attacks
- **Fix**: 
  - Added `@nestjs/throttler` with global rate limit (100 req/min per IP)
  - Auth-specific limits: login (5/min), register (3/min), refresh (10/min)
  - Added `ThrottlerGuard` as global APP_GUARD
- **Impact**: Credential brute-forcing, account enumeration

#### 6. XSS via Email Template Interpolation
- **File**: `apps/api/src/email-templates/email-templates.service.ts`
- **Issue**: `interpolate()` method inserted user-provided variable values directly into HTML templates without escaping, allowing stored XSS
- **Fix**: Added `escapeHtml()` method that escapes `& < > " '` characters. All template variable values are now HTML-escaped before interpolation
- **Impact**: Stored XSS in emails sent to users

#### 7. Deep Health Check Exposes Internal System Information
- **File**: `apps/api/src/health/health.controller.ts`
- **Issue**: `GET /api/health/deep` was marked `@Public()`, exposing database error messages, memory usage, and system metrics to unauthenticated users
- **Fix**: Removed `@Public()` — deep health check now requires JWT authentication. Removed database error message from response body
- **Impact**: Information disclosure aiding targeted attacks

### 🟡 MEDIUM — Fixed

#### 8. RolesGuard Not Applied Globally
- **File**: `apps/api/src/app.module.ts`
- **Issue**: `RolesGuard` was only applied via `@UseGuards(RolesGuard)` on individual controllers. If a developer forgot to add it, RBAC was silently bypassed
- **Fix**: Added `RolesGuard` as global `APP_GUARD`. It's now enforced on ALL routes by default (no-op if no `@Roles()` decorator is present)
- **Impact**: Potential authorization bypass on new endpoints

#### 9. Missing Security Headers
- **File**: `apps/api/src/main.ts`
- **Issue**: No HTTP security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.) were set by the API server itself (only Nginx had them)
- **Fix**: Added `helmet` middleware for comprehensive security headers. Added explicit CORS `allowedHeaders` and `maxAge`. Added request body size limit (10MB)
- **Impact**: Clickjacking, MIME sniffing, missing defense-in-depth

#### 10. Error Messages Leak Internal Details
- **File**: `apps/api/src/common/filters/all-exceptions.filter.ts`
- **Issue**: Generic `Error` exceptions had their raw `.message` returned to clients, potentially exposing file paths, SQL queries, or stack frames
- **Fix**: In production, generic error messages are replaced with "Internal server error". Development mode retains detailed messages for debugging
- **Impact**: Information disclosure

#### 11. Logging Could Capture Passwords
- **File**: `apps/api/src/common/interceptors/logging.interceptor.ts`
- **Issue**: No safeguard against logging sensitive request bodies (passwords, tokens)
- **Fix**: Added `SENSITIVE_PATHS` list for auth endpoints. Dev-mode body logging now redacts `password`, `passwordHash`, and `refreshToken` fields
- **Impact**: Credential exposure in log files

#### 12. Document URL/Filename Validation
- **File**: `apps/api/src/documents/dto/create-document.dto.ts`
- **Issue**: `url` field accepted any string (including `file://`, `http://`, internal IPs for SSRF). `fileName` had no validation against path traversal characters
- **Fix**: Added `@IsUrl` with HTTPS-only protocol requirement. Added `@MaxLength(2048)` for URL. Added `@Matches` regex to reject path-separator characters in filenames
- **Impact**: SSRF, path traversal

---

## Security Architecture Review

### ✅ What's Good

| Area | Status | Notes |
|------|--------|-------|
| **JWT Implementation** | ✅ Solid | Separate access/refresh secrets, 15min access expiry, 7d refresh |
| **Password Hashing** | ✅ Good | bcrypt with 12 rounds (via `BCRYPT_ROUNDS` constant) |
| **Tenant Isolation (Services)** | ✅ Good | All service methods accept `tenantId` from JWT, not request body. Every Prisma query includes `tenantId` filter |
| **Input Validation** | ✅ Good | Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strips unknown fields |
| **Soft Delete** | ✅ Good | Entities use `deletedAt` filter, preventing accidental data exposure |
| **Docker Security** | ✅ Good | Multi-stage builds, non-root users (`nestjs`/`nextjs`), proper `.dockerignore` |
| **Nginx** | ✅ Good | Security headers, rate limiting zones, hidden file denial, gzip, SSL template ready |
| **CI/CD** | ✅ Good | Secrets via `${{ secrets.GITHUB_TOKEN }}`, no hardcoded tokens |
| **CORS** | ✅ Good | Configured via env var, not wildcard |
| **Prisma (ORM)** | ✅ Good | No raw SQL, no string interpolation — parameterized queries by default |
| **API Responses** | ✅ Good | Auth responses use explicit field selection, `passwordHash` never returned |
| **Broker Isolation** | ✅ Good | Leads module restricts BROKER role to only see assigned leads |

### ⚠️ Areas for Future Improvement

| Area | Severity | Recommendation |
|------|----------|---------------|
| **Refresh Token Storage** | MEDIUM | Currently stateless JWT — no way to revoke refresh tokens. Implement token rotation or store refresh tokens in Redis/DB for revocation |
| **Login Tenant Ambiguity** | LOW | `login()` uses `findFirst` without `tenantId` — same email in multiple tenants matches first found. Consider requiring tenant slug/ID on login |
| **CSRF Protection** | LOW | Cookie-based auth isn't used (Bearer token only), so CSRF risk is minimal. Add if cookies are ever used |
| **Swagger in Production** | LOW | `SWAGGER_ENABLED` defaults to `false` in docker-compose but `true` in main.ts. Ensure it's always `false` in production |
| **bcrypt Dependency** | LOW | bcrypt v5.x depends on vulnerable `tar` via `@mapbox/node-pre-gyp`. Upgrade to bcrypt v6.x or switch to `bcryptjs` (pure JS) when ready |
| **Content-Security-Policy** | LOW | Nginx CSP uses `unsafe-inline` and `unsafe-eval` for scripts. Tighten when frontend is hardened |
| **Audit Log Integrity** | LOW | Activity logs are in the same database — consider write-once storage or external audit service |
| **HSTS** | LOW | Commented out in Nginx — uncomment after SSL is configured |
| **Subscription Guard Usage** | LOW | `SubscriptionLimitGuard` exists but isn't applied to property/unit creation endpoints |
| **@angular-devkit CVEs** | LOW | 6 moderate vulnerabilities in `@nestjs/cli` dev dependency chain — not shipped to production |

---

## Threat Model Summary

### Assets
1. **Tenant Data** — properties, buildings, units, bookings, leads, financials
2. **User Credentials** — passwords, JWT tokens
3. **PII** — names, emails, phone numbers (leads, communications)
4. **Business Logic** — pricing, discounts, campaigns, subscription limits

### Threat Actors
1. **Unauthenticated Attacker** — brute-force, credential stuffing, registration abuse
2. **Authenticated Malicious Tenant** — cross-tenant data access, privilege escalation
3. **Compromised Insider** — data exfiltration, unauthorized admin actions
4. **Supply Chain** — vulnerable npm dependencies

### Mitigations Implemented
| Threat | Mitigation |
|--------|-----------|
| Brute-force login | Rate limiting (5 attempts/min on login) |
| Privilege escalation | Role removed from registration, hardcoded to VIEWER |
| Cross-tenant access | JWT-based tenant scoping on all queries, controller-level access checks |
| XSS | HTML escaping in email templates, Helmet security headers |
| Information leakage | Production error sanitization, authenticated deep health check |
| SSRF | HTTPS-only URL validation on document uploads |
| Weak secrets | Docker Compose fails if secrets not explicitly set |
| Missing auth | Global JWT guard, global RBAC guard |

---

## Packages Added
- `helmet` — HTTP security headers middleware
- `@nestjs/throttler` — Rate limiting / brute-force protection

## Files Modified
- `apps/api/src/auth/dto/register.dto.ts` — Removed `role` field, added password strength
- `apps/api/src/auth/dto/login.dto.ts` — Simplified validation
- `apps/api/src/auth/auth.service.ts` — Hardcoded VIEWER role on registration
- `apps/api/src/auth/auth.controller.ts` — Added rate limiting decorators
- `apps/api/src/tenants/tenants.controller.ts` — Added tenant access control
- `apps/api/src/bookings/bookings.service.ts` — Fixed tenant scoping
- `apps/api/src/app.module.ts` — Added ThrottlerModule, global guards
- `apps/api/src/main.ts` — Added Helmet, CORS hardening, body size limit
- `apps/api/src/email-templates/email-templates.service.ts` — Added HTML escaping
- `apps/api/src/health/health.controller.ts` — Removed @Public from deep check
- `apps/api/src/common/filters/all-exceptions.filter.ts` — Production error sanitization
- `apps/api/src/common/interceptors/logging.interceptor.ts` — Sensitive data redaction
- `apps/api/src/documents/dto/create-document.dto.ts` — URL/filename validation
- `docker-compose.yml` — Required secrets, removed port exposure
- `.env.example` — Added security comments

## Test Results
All **43 test suites** pass, **392 tests** pass after security hardening.
