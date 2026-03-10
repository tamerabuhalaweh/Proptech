#!/usr/bin/env bash
# ============================================================
# Proptech Platform — First-Time Setup Script
# Installs deps, copies env files, generates Prisma, runs migrations
# ============================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}ℹ  $1${NC}"; }
log_ok()    { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Navigate to project root (two levels up from infra/scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "================================================"
echo "  🏗️  Proptech Platform — Setup"
echo "================================================"
echo ""

# ---- Check prerequisites ----
log_info "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { log_error "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm  >/dev/null 2>&1 || { log_error "npm is required."; exit 1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  log_error "Node.js 20+ is required. Current: $(node -v)"
  exit 1
fi
log_ok "Node.js $(node -v)"

# ---- Copy environment files ----
log_info "Setting up environment files..."

if [ ! -f ".env" ]; then
  cp .env.example .env
  log_ok "Created .env from .env.example"
else
  log_warn ".env already exists — skipping"
fi

if [ ! -f "apps/api/.env" ]; then
  cp apps/api/.env.example apps/api/.env
  log_ok "Created apps/api/.env"
else
  log_warn "apps/api/.env already exists — skipping"
fi

if [ ! -f "apps/web/.env.local" ]; then
  cp apps/web/.env.example apps/web/.env.local
  log_ok "Created apps/web/.env.local"
else
  log_warn "apps/web/.env.local already exists — skipping"
fi

# ---- Install dependencies ----
log_info "Installing dependencies..."
npm ci
log_ok "Dependencies installed"

# ---- Generate Prisma client ----
log_info "Generating Prisma client..."
cd packages/db && npx prisma generate && cd "$PROJECT_ROOT"
log_ok "Prisma client generated"

# ---- Run database migrations ----
log_info "Running database migrations..."
log_warn "Make sure PostgreSQL is running and DATABASE_URL in apps/api/.env is correct"

read -p "  Run migrations now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd packages/db && npx prisma db push && cd "$PROJECT_ROOT"
  log_ok "Database schema pushed"
else
  log_warn "Skipped migrations — run manually: cd packages/db && npx prisma db push"
fi

# ---- Build shared packages ----
log_info "Building shared packages..."
npx turbo build --filter=@proptech/config --filter=@proptech/types --filter=@proptech/db
log_ok "Shared packages built"

echo ""
echo "================================================"
echo "  🎉  Setup complete!"
echo "================================================"
echo ""
echo "  Next steps:"
echo "    1. Review .env files and update secrets"
echo "    2. Start development:  npm run dev"
echo "    3. Seed database:      bash infra/scripts/seed.sh"
echo "    4. Open API docs:      http://localhost:3001/docs"
echo "    5. Open Web app:       http://localhost:3000"
echo ""
