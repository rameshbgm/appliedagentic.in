# Admin Guide

This document explains how to access and manage the site after the Hostinger migration.

- SuperAdmin / Admin accounts are created by the seeder (`scripts/seed-hostinger.js`).
- After `scripts/deploy-hostinger.sh` runs, the script prints the generated plain-text passwords once to stdout — store them securely and rotate after first login.

Common tasks:
- Sign in at `/app/(admin)/login`.
- Manage articles, modules, topics and media from the admin UI.
- To add or update admin users manually, use the Prisma Studio or run a custom upsert via Prisma client.

Security notes:
- Do not enable `NEXT_PUBLIC_QUICK_LOGIN` in production.
- Rotate seeder-generated passwords after initial sign-in.
