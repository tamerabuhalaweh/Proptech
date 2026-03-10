# 🚀 Deployment Guide

> How to deploy Proptech Platform to production

---

## Prerequisites

- Docker Engine 24+ & Docker Compose v2
- Domain name (for SSL)
- Server with 2+ CPU cores, 4GB+ RAM
- PostgreSQL 16 (included in docker-compose)

---

## 1. Docker Deployment

### 1.1 Prepare the Server

```bash
# SSH into your server
ssh user@your-server.com

# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in

# Verify
docker --version
docker compose version
```

### 1.2 Clone & Configure

```bash
# Clone the repository
git clone https://github.com/your-org/proptech.git
cd proptech

# Create environment file
cp .env.example .env

# Edit with your production values
nano .env
```

**Critical `.env` values to change:**

```env
# Generate secure secrets (run on your machine):
#   openssl rand -base64 64
JWT_ACCESS_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
POSTGRES_PASSWORD=<strong-random-password>
REDIS_PASSWORD=<strong-random-password>

# Disable Swagger in production
SWAGGER_ENABLED=false

# Set your domain for CORS
CORS_ORIGINS=https://your-domain.com

# Frontend API URL (through Nginx)
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### 1.3 Build & Start

```bash
# Build and start all services
docker compose up -d --build

# Check service health
docker compose ps

# View logs
docker compose logs -f api
docker compose logs -f web
```

### 1.4 Initialize Database

```bash
# Push schema to database
docker compose exec api sh -c "cd /app/packages/db && npx prisma db push"

# Seed with initial data (optional)
docker compose exec api npx ts-node packages/db/prisma/seed.ts
```

### 1.5 Verify

```bash
# Check health endpoint
curl http://localhost/api/health

# Check deep health (database connectivity)
curl http://localhost/api/health/deep
```

---

## 2. Environment Setup

### 2.1 Environment Files

| File                  | Purpose                | Used By          |
| --------------------- | ---------------------- | ---------------- |
| `.env`                | Docker Compose vars    | docker-compose   |
| `apps/api/.env`       | API runtime config     | NestJS (local)   |
| `apps/web/.env.local` | Frontend build config  | Next.js (local)  |

> **In Docker:** All env vars are passed through `docker-compose.yml` — you only need the root `.env` file.

### 2.2 Secret Management

For production, consider:

1. **Docker Secrets** — for swarm mode deployments
2. **HashiCorp Vault** — for enterprise secret management
3. **AWS Secrets Manager / GCP Secret Manager** — for cloud deployments

---

## 3. Database Migration Guide

### 3.1 Schema Changes

```bash
# Create a migration
cd packages/db
npx prisma migrate dev --name describe-your-change

# Apply in production
docker compose exec api sh -c "cd /app/packages/db && npx prisma migrate deploy"
```

### 3.2 Backup & Restore

```bash
# Backup
docker compose exec postgres pg_dump -U proptech proptech > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U proptech proptech < backup_20240101.sql
```

### 3.3 Reset Database

```bash
# ⚠️ DESTRUCTIVE — drops all data
docker compose exec api sh -c "cd /app/packages/db && npx prisma db push --force-reset"

# Re-seed
docker compose exec api npx ts-node packages/db/prisma/seed.ts
```

---

## 4. SSL Setup

### 4.1 Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificates will be at:
#   /etc/letsencrypt/live/your-domain.com/fullchain.pem
#   /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 4.2 Configure Nginx for SSL

1. Copy certificates to `infra/nginx/ssl/`:
   ```bash
   mkdir -p infra/nginx/ssl
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/nginx/ssl/
   ```

2. Uncomment SSL section in `infra/nginx/nginx.conf`:
   - Uncomment the `listen 443 ssl http2` server block
   - Uncomment the HTTP→HTTPS redirect
   - Update `server_name` to your domain
   - Uncomment HSTS header

3. Update `docker-compose.yml`:
   ```yaml
   nginx:
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
       - ./infra/nginx/ssl:/etc/nginx/ssl:ro
   ```

4. Restart:
   ```bash
   docker compose up -d nginx
   ```

### 4.3 Auto-Renewal

```bash
# Add to crontab
sudo crontab -e

# Add this line (renews and copies certs)
0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/*.pem /path/to/proptech/infra/nginx/ssl/ && docker compose -f /path/to/proptech/docker-compose.yml restart nginx
```

---

## 5. Monitoring Setup

### 5.1 Health Checks

The API exposes two health endpoints:

- `GET /api/health` — Basic health (uptime, version)
- `GET /api/health/deep` — Deep health (database connectivity, memory usage)

### 5.2 Prometheus

```bash
# Add Prometheus to docker-compose (optional)
# The config is at infra/monitoring/prometheus.yml

docker run -d \
  --name prometheus \
  --network proptech-network \
  -p 9090:9090 \
  -v $(pwd)/infra/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  prom/prometheus
```

### 5.3 Structured Logging

The API uses a global `LoggingInterceptor` that logs:
- Request method, URL, status code, duration
- Client IP and User-Agent
- Error messages for failed requests

Logs can be forwarded to:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki + Grafana** — lightweight alternative
- **CloudWatch / Cloud Logging** — managed cloud services

### 5.4 Alerts

Set up alerts for:
- Health check failures (5xx on `/api/health`)
- High error rate (>5% of requests returning 5xx)
- High response time (p95 > 1s)
- Database connection pool exhaustion
- Disk space < 20%

---

## 6. Scaling

### 6.1 Horizontal Scaling

```bash
# Scale API replicas
docker compose up -d --scale api=3

# Nginx will round-robin between instances
```

### 6.2 Database Scaling

- **Read replicas** — for read-heavy workloads
- **Connection pooling** — use PgBouncer between API and PostgreSQL
- **Managed database** — AWS RDS, GCP Cloud SQL, or Neon

### 6.3 CDN

For static assets, configure a CDN (CloudFront, Cloudflare):
- Point CDN to `/_next/static/*`
- Set `NEXT_PUBLIC_CDN_URL` in Next.js config

---

## 7. Rollback

```bash
# Roll back to previous image version
docker compose pull  # Pull latest
# Or specify exact version:
# API_IMAGE=ghcr.io/your-org/proptech/api:abc1234 docker compose up -d api

# Roll back database migration
docker compose exec api sh -c "cd /app/packages/db && npx prisma migrate resolve --rolled-back MIGRATION_NAME"
```

---

## 8. Troubleshooting

| Issue                      | Solution                                              |
| -------------------------- | ----------------------------------------------------- |
| API won't start            | Check `docker compose logs api` for errors            |
| Database connection failed | Verify `DATABASE_URL` and `postgres` service health   |
| Nginx 502 Bad Gateway      | API/Web not ready yet — check health with `docker compose ps` |
| CORS errors                | Update `CORS_ORIGINS` in `.env`                       |
| Build failures             | Clear Docker cache: `docker compose build --no-cache` |

---

© 2024 Smart Labs / SorohTheQA — Proprietary
