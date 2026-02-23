# Hostinger Migration Guide

This document explains how to migrate the Prisma schema and data from your local development database to the Hostinger MySQL instance defined in `.env.production`.

IMPORTANT: These steps can be destructive. Ensure you have valid backups before running any deploy commands.

1) Prepare
- Ensure `.env.production` contains the correct `DATABASE_URL` for Hostinger.
- Ensure you have access to run `mysqldump` from this environment (for backup).

2) Create backups (recommended)
- Run: `scripts/backup-hostinger.sh`
- This produces three files under `backups/`:
  - `hostinger_full_<timestamp>.sql` (complete dump)
  - `hostinger_schema_<timestamp>.sql` (DDL only)
  - `hostinger_data_<timestamp>.sql` (DML only)

3) Review migrations
- The project uses Prisma migrations stored under `prisma/migrations`.
- Inspect the SQL in `prisma/migrations/*` to confirm expected DDL changes.

4) Deploy migrations to Hostinger (safe)
- Run: `scripts/deploy-hostinger.sh`
- The script will run a backup, then call `npx prisma migrate deploy` against the Hostinger DB, then run the seeder.

5) Seed admin users
- The deploy script runs `scripts/seed-hostinger.js` which upserts the SuperAdmin and Admin users and prints the generated passwords once.

6) Verification
- Log into the admin UI and confirm the SuperAdmin email exists and you can sign in.
- Check `SELECT COUNT(*) FROM Article;` and other tables to confirm expected data.

7) Rollback (if required)
- If something goes wrong, restore from the backup created in step 2:
  - `mysql -uUSER -pPASSWORD -hHOST -PPORT < backups/hostinger_full_<timestamp>.sql`

8) Notes & Safety
- Prefer running `prisma migrate deploy` during a maintenance window.
- If you prefer non-destructive, use `npx prisma db push --schema=./prisma/schema.prisma` instead — note that this does not create migration history and is less reversible.

If you want, I can run the deploy now using `.env.production` (will first create backups). Confirm and I'll execute.
