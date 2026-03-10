#!/usr/bin/env bash
# ============================================================
# Proptech Platform — Reset Database
# Drops all tables and re-creates schema from Prisma
# ⚠️  DESTRUCTIVE — all data will be lost!
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}ℹ  $1${NC}"; }
log_ok()    { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "================================================"
echo "  ⚠️   DATABASE RESET"
echo "  This will DROP ALL TABLES and recreate them."
echo "  ALL DATA WILL BE LOST!"
echo "================================================"
echo ""

read -p "Are you sure? Type 'RESET' to confirm: " -r
echo
if [ "$REPLY" != "RESET" ]; then
  log_warn "Aborted. No changes made."
  exit 0
fi

# ---- Reset database ----
log_info "Resetting database..."
cd packages/db

# Force push schema (drops and recreates)
npx prisma db push --force-reset --skip-generate
log_ok "Database schema reset"

# Re-generate client
npx prisma generate
log_ok "Prisma client regenerated"

cd "$PROJECT_ROOT"

# ---- Optionally re-seed ----
read -p "Seed with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash infra/scripts/seed.sh
else
  log_info "Skipped seeding. Run: bash infra/scripts/seed.sh"
fi

echo ""
log_ok "Database reset complete!"
echo ""
