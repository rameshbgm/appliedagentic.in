#!/usr/bin/env bash
set -euo pipefail
# Backup Hostinger DB using .env.production -> creates full/schema/data dumps
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Parsing DATABASE_URL from .env.production..."
PARSED=$(node scripts/parse_db_url.js)
read DB_USER DB_PASS DB_HOST DB_PORT DB_NAME <<< "$PARSED"

if [ -z "$DB_NAME" ]; then
  echo "Could not determine DB name from DATABASE_URL. Aborting." >&2
  exit 1
fi

mkdir -p backups
TS=$(date +%Y%m%d%H%M%S)
FULL="backups/hostinger_full_${TS}.sql"
SCHEMA="backups/hostinger_schema_${TS}.sql"
DATA="backups/hostinger_data_${TS}.sql"

echo "Creating full dump -> $FULL"
mysqldump -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -P"$DB_PORT" --single-transaction --routines --triggers --events "$DB_NAME" > "$FULL"

echo "Creating schema-only dump -> $SCHEMA"
mysqldump -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -P"$DB_PORT" --no-data "$DB_NAME" > "$SCHEMA"

echo "Creating data-only dump -> $DATA"
mysqldump -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -P"$DB_PORT" --no-create-info "$DB_NAME" > "$DATA"

echo "Backups created:"
ls -lh "$FULL" "$SCHEMA" "$DATA"
