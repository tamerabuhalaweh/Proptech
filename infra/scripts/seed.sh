#!/usr/bin/env bash
# ============================================================
# Proptech Platform — Seed Database
# Populates development database with sample Saudi/MENA data
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}ℹ  $1${NC}"; }
log_ok()    { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "🌱 Seeding database with sample data..."
echo ""

# Check if database is reachable
log_info "Checking database connection..."
cd packages/db

# Run seed
log_info "Running seed script..."
npx ts-node prisma/seed.ts

cd "$PROJECT_ROOT"

log_ok "Database seeded successfully!"
echo ""
echo "  Default credentials:"
echo "    Super Admin:  admin@proptech.sa / Admin@123"
echo "    Tenant Admin: admin@demo.com / Admin@123"
echo ""
