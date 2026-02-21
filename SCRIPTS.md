# NPM Scripts Reference

## Development Commands

| Script | Command | Env File | Use When |
|---|---|---|---|
| `npm run dev` | `next dev` | `.env.local` | **Default** — local development with Docker MySQL |
| `npm run dev:prod` | `dotenv -e .env.production -- next dev` | `.env.production` | Testing against the Hostinger (production) database locally |
| `npm run dev:nodb` | `DATABASE_URL='' next dev` | `.env.local` (DB disabled) | UI/frontend-only work, no database needed |

## Production / Start Commands

| Script | Command | Env File | Use When |
|---|---|---|---|
| `npm run start` | `next start` | `.env.local` | Serve built app locally |
| `npm run start:prod` | `dotenv -e .env.production -- next start` | `.env.production` | Run production build against Hostinger DB |
| `npm run start:nodb` | `DATABASE_URL='' next start` | No DB | Serve built app without any DB connection |

## Database Commands

| Script | Command | Use When |
|---|---|---|
| `npm run db:migrate` | `prisma migrate dev` | Create/apply migrations on **local** Docker DB |
| `npm run db:deploy` | `prisma migrate deploy` | Apply migrations to **production** (Hostinger) DB |
| `npm run db:push` | `prisma db push` | Push schema changes without creating migration files |
| `npm run db:generate` | `prisma generate` | Regenerate Prisma client after schema changes |
| `npm run db:seed` | `ts-node prisma/seed.ts` | Seed the local database with initial data |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio GUI to inspect local DB |

---

## Quick Start Guide

### Local Development (default)

Make sure Docker is running, then:

```bash
docker compose up -d     # start local MySQL container
npm run dev              # start Next.js with .env.local
```

### Switching to Hostinger (Production DB)

```bash
npm run dev:prod         # connects to srv873.hstgr.io
```

### Run Without Database

Useful for working on UI components or pages that don't require DB access:

```bash
npm run dev:nodb
```

### Deploy Migrations to Hostinger

```bash
DATABASE_URL="mysql://u915919430_appliedagentic:<password>@srv873.hstgr.io:3306/u915919430_appliedagentic" npm run db:deploy
```

Or set the `DATABASE_URL` in `.env.production` and run:

```bash
dotenv -e .env.production -- npm run db:deploy
```

---

## Environment Files

| File | Purpose | Committed to Git |
|---|---|---|
| `.env` | Minimal override (Docker DB URL) | No |
| `.env.local` | Full local dev config | No |
| `.env.production` | Hostinger production config | No |
| `.env.example` | Template — safe to commit | Yes |

> All `.env*` files except `.env.example` are excluded via `.gitignore`.
