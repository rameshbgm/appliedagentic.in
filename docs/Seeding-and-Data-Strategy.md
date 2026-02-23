# Seeding and Data Strategy

Purpose
- Document what the seed scripts do, how to run them safely (local/dev and Hostinger), how to verify results, and recommended data handling procedures (password rotation, backups, staging). This is intended for operators and developers.

Seed scripts overview

- `prisma/seed.ts` (primary project seed)
  - Creates/upserts:
    - Admin user `admin@appliedagentic.com` (password in script: `Admin@123` for dev seeds).
    - `SiteSettings` singleton row.
    - Modules (Module 1..N), topics, and one article per topic.
    - For Module 1 topics, extracts and imports content from `.mhtml` source files in `docs/learningmoduls/...`.
    - Nav menus and submenus (and `NavSubMenu` rows).
  - Uses `prisma.upsert` operations to be idempotent where possible.

- `scripts/seed-hostinger.js`
  - Upserts two accounts into the DB referenced by `.env.production`:
    - `superadmin@appliedagentic.com` with role `SUPERADMIN`
    - `admin@appliedagentic.com` with role `ADMIN`
  - Generates random passwords and prints them to stdout. The script reads `.env.production` itself.

- Other seed-related scripts
  - `scripts/seed-nav-menus.ts` — re-seeds nav menus.
  - `scripts/seed-users.ts` — helpers for user seeding.
  - `scripts/clean-db.ts` — truncates tables (DESTRUCTIVE). Use only in dev and with backups.

How to run seeds (safe steps)

Local dev (recommended flow):

1. Install deps and generate Prisma client:

```bash
pnpm install
pnpm db:generate
```

2. Run migrations and seed the DB (dev):

```bash
pnpm db:migrate        # or `pnpx prisma migrate dev` if you prefer
pnpm db:seed           # runs `ts-node prisma/seed.ts` per package.json
```

3. Verify with Prisma Studio or the `scripts/query-hostinger.js` pattern (for local DB change `.env`):

```bash
pnpm db:studio
# OR use the provided script (adjust env file if needed)
node scripts/query-hostinger.js
```

Hostinger (production) — CAUTION

- `scripts/seed-hostinger.js` reads `.env.production` and will upsert admin accounts on the live Hostinger DB. This is non-destructive (upsert), but production credentials are sensitive; follow the steps below.

1. Backup the DB first (dump or Hostinger backup UI):

```bash
# Example MySQL dump — replace placeholders
mysqldump -h <HOST> -u <USER> -p<PASS> <DBNAME> > hostinger_pre_seed_backup.sql
```

2. Run the Hostinger seed (this prints generated passwords to stdout):

```bash
pnpm run seed:hostinger
# or
node scripts/seed-hostinger.js
```

3. Immediately rotate or reset any printed passwords in the admin panel or by running an update query. Do not leave printed plaintext passwords in logs.

What the seeds insert (summary)

- Admin account(s) — `superadmin@appliedagentic.com`, `admin@appliedagentic.com`.
- Site-wide settings row.
- Modules → Topics → Articles (Module 1 articles are published by default in seed; others may be DRAFT).
- Navigation menus and submenus.

Idempotency & rollback

- `prisma/seed.ts` uses `upsert` for many operations; re-running is generally safe and will not duplicate rows where `where` constraints match (slug/email).
- `scripts/seed-hostinger.js` uses `upsert` for emails as well.
- There is no automatic rollback; to undo an accidental seed you must either restore a DB backup or run a targeted cleanup. `scripts/clean-db.ts` exists but is destructive — do not run on production.

Verification & quick checks (read-only)

- A small utility `scripts/query-hostinger.js` exists and can be run with `.env.production` to inspect users, article count, recent articles, and nav menus.
- Example manual MySQL checks (replace credentials or rely on `.env.production`):

```bash
# list users
mysql -h HOST -u USER -p -D DB -e "SELECT id,email,role,createdAt FROM \`User\` ORDER BY createdAt DESC LIMIT 50;"

# count articles
mysql -h HOST -u USER -p -D DB -e "SELECT COUNT(*) FROM \`Article\`;"

# list recent published articles
mysql -h HOST -u USER -p -D DB -e "SELECT id,title,slug,status,publishedAt FROM \`Article\` WHERE status='PUBLISHED' ORDER BY publishedAt DESC LIMIT 20;"
```

Live verification performed

- I ran a read-only Prisma query using `.env.production` and confirmed the production DB currently contains:
  - One user: `admin@appliedagentic.com` (role: `SUPERADMIN`).
  - `ARTICLE_COUNT: 1`
  - One published article: `Basics of AI` (slug `hi`, id 34).
  - Nav menus seeded include: `ai-foundations`, `agentic-ai`, `rag`, `applied-projects`, `tools-frameworks`, `learning-paths`.

Security & operational recommendations

- Always backup before seeding production. Store backups offsite and retain versions for rollback.
- If `scripts/seed-hostinger.js` prints plaintext passwords, rotate those accounts immediately; prefer setting passwords via a secure rotation flow or disable seeded plaintext log output.
- Use a staging environment and run `prisma/seed.ts` there first to verify behavior with real migrations.
- Avoid running `scripts/clean-db.ts` against production. Label it clearly in docs and gating scripts.
- Make seeds idempotent where possible (use `upsert` and deterministic slugs/keys).
- Consider adding a `--dry-run` flag to heavy scripts to simulate changes without applying them.

Automation suggestions

- Add a CI job to run `prisma migrate status` and a smoke-test against a temporary DB before deploying migrations to prod.
- Use infrastructure-as-code (Terraform/Ansible) to manage DB backups and scheduled dumps.

Appendix — Useful commands

```bash
# Generate prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed local DB
pnpm db:seed

# Seed Hostinger (reads .env.production)
pnpm run seed:hostinger

# Quick production inspection (read-only) using the included script
node scripts/query-hostinger.js
```

---

End of Seeding and Data Strategy (initial draft).