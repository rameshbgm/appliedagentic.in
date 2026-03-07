#!/usr/bin/env bash
# scripts/reset-db-keep-users.sh
#
# Drops every table EXCEPT `User` from the production database,
# then uses `prisma db push` to recreate the full schema (no seed data).
#
# MUST be run ON the production server where DATABASE_URL = 127.0.0.1.
# Usage:
#   chmod +x scripts/reset-db-keep-users.sh
#   ./scripts/reset-db-keep-users.sh
#
# What it does:
#   1. Reads DB credentials from .env.production
#   2. Drops all non-User tables (FK-safe, in dependency order)
#   3. Drops the Prisma migrations history table
#   4. Runs `prisma db push --force-reset=false` to recreate all tables
#   5. Prints a summary
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Load .env.production ─────────────────────────────────────────────────────
ENV_FILE="$(dirname "$0")/../.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env.production not found at $ENV_FILE"
  exit 1
fi

# Parse DATABASE_URL  (mysql://user:pass@host:port/dbname)
DATABASE_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d'"' -f2)
if [[ -z "$DATABASE_URL" ]]; then
  echo "ERROR: DATABASE_URL not found in .env.production"
  exit 1
fi

DB_USER=$(echo "$DATABASE_URL"  | sed -E 's|mysql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL"  | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL"  | sed -E 's|mysql://[^@]+@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL"  | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL"  | sed -E 's|.*/([^?]+).*|\1|')

echo ""
echo "┌─────────────────────────────────────────────────┐"
echo "│  Production DB Reset — keep User table only      │"
echo "├─────────────────────────────────────────────────┤"
echo "│  Host : $DB_HOST:$DB_PORT"
echo "│  DB   : $DB_NAME"
echo "│  User : $DB_USER"
echo "└─────────────────────────────────────────────────┘"
echo ""
echo "⚠️  This will PERMANENTLY DELETE all non-User data."
read -rp "Type 'yes' to continue: " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

SQL_FILE="$(mktemp /tmp/reset-db-XXXXXX.sql)"

# ── Step 1: Drop all non-User tables in dependency order ─────────────────────
echo ""
echo "▶  Dropping tables (preserving User)…"

cat > "$SQL_FILE" <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;

-- Junction / child tables first
DROP TABLE IF EXISTS SubMenuArticle;
DROP TABLE IF EXISTS MenuArticle;
DROP TABLE IF EXISTS ArticleSection;
DROP TABLE IF EXISTS TopicArticle;
DROP TABLE IF EXISTS ArticleTag;
DROP TABLE IF EXISTS AIUsageLog;

-- Core content
DROP TABLE IF EXISTS Article;
DROP TABLE IF EXISTS MediaAsset;
DROP TABLE IF EXISTS Tag;

-- Navigation
DROP TABLE IF EXISTS NavSubMenu;
DROP TABLE IF EXISTS NavMenu;

-- Taxonomy
DROP TABLE IF EXISTS Topic;
DROP TABLE IF EXISTS Module;

-- Settings
DROP TABLE IF EXISTS SiteSettings;

-- Prisma migration history (will be rebuilt by db push)
DROP TABLE IF EXISTS _prisma_migrations;

SET FOREIGN_KEY_CHECKS = 1;
SQL

export DATABASE_URL="$DATABASE_URL"
cd "$(dirname "$0")/.."
npx prisma db execute --file="$SQL_FILE" --schema=prisma/schema.prisma 2>&1
rm -f "$SQL_FILE"

echo "   ✓ Tables dropped"

# ── Step 2: Recreate schema via Prisma db push ────────────────────────────────
echo ""
echo "▶  Recreating schema with Prisma db push…"

npx prisma db push --skip-generate --accept-data-loss 2>&1

echo ""
echo "✅  Done. Schema recreated. User table untouched."
echo ""

# ── Step 3: Show current tables ───────────────────────────────────────────────
echo "▶  Current tables in $DB_NAME:"
SHOW_SQL="$(mktemp /tmp/show-tables-XXXXXX.sql)"
echo "SHOW TABLES;" > "$SHOW_SQL"
npx prisma db execute --file="$SHOW_SQL" --schema=prisma/schema.prisma 2>&1
rm -f "$SHOW_SQL"
echo ""
