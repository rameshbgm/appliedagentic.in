# Run the complete application locally

Use Node 22.22.2+, 24.15.0+, or 26+ with npm 12.2.1 (see `package.json`). Docker Desktop provides the MySQL database.

1. Install dependencies with `npm ci`.
2. Create `.env.local` from `.env.example`. For the bundled Docker database use
   `DATABASE_URL="mysql://aa_user:aa_password@localhost:3306/appliedagentic"`.
   Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000`, and generate
   an `AUTH_SECRET` with `openssl rand -base64 32`.
3. Run `npm run dev:setup`. This starts only MySQL, waits for readiness, applies the
   Prisma schema, and creates the local admin if it does not already exist.
4. Run `npm run dev`, then open http://localhost:3000.

`dev:setup` refuses a non-local database. On macOS it starts Docker Desktop when
necessary. Existing local content and admin passwords are preserved.

## Start with published content

For a **new, empty** local database and an existing `.env.production` containing
source database credentials, replace step 3 with:

```sh
npm run dev:setup -- --copy-content
```

The import reads production and writes only to localhost. It copies content,
menus, sections, tags and media metadata into a local transaction. It refuses to
overwrite a populated local database. Media is read from the source database on
demand using server-only `DEV_MEDIA_DATABASE_URL` in the ignored `.env.local`.
Only the requested byte range is read for narration. New uploads, edits, crops,
subscriptions and publications are stored locally. Cropping a source image also
caches its original bytes locally.

The media source is used **only** in development. Keep its credentials private.
For a self-contained production deployment, retain the original database/media
or migrate its blobs along with the application data.

If setting up the empty database manually, `npm run db:sync:local` performs the
content-copy step. Run it before creating local seed records, then restart the
application. `npm run dev:setup` can be rerun without `--copy-content` afterward.

## Admin and features

Admin access is at `/login`. The local seeded account is
`admin@appliedagentic.com` / `Admin@2026!`. A quick-login button appears only in
development when `NEXT_PUBLIC_QUICK_LOGIN=true`. Production seed credentials can
be supplied using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`; rerunning the seed
never resets existing passwords.

The application includes menu/zone management, article sections and publishing,
media upload/crop, search with pagination, narration and reader tools, dashboard,
profile, site settings, and newsletter subscriptions. Anonymous readers cannot
view draft articles; authenticated admins can preview them.

In **Settings → General**, **Show article images** controls covers, article-list
thumbnails and inline article images across the public site. Save the setting,
then reload any already-open reader pages. When disabled, image elements are
omitted from the rendered pages, so the browser does not request the images.
The media library and admin editor retain access to the original images.

Text agents use OpenAI first. If OpenAI returns quota or temporary-service errors
and a Gemini key is configured, text requests retry with Gemini while preserving
their instructions. Set `AI_TEXT_FALLBACK_PROVIDER=none` to disable this fallback.
Image and narration generation still use the provider selected in the editor and
require that provider's usable key and billing. Existing narration does not
require an AI call to play.

Newsletter subscriptions are saved in MySQL, listed at `/admin/subscribers`, and
exported as CSV for an email service. The export includes an unsubscribe URL per
subscriber. The application does not send campaign emails by itself.

## Verification

| Command | Checks |
| --- | --- |
| `npm run clean` | Remove `.next` and TypeScript build cache |
| `npm run lint` | ESLint CLI; existing React Compiler diagnostics and explicit `any` use are warnings |
| `npm run type-check` | TypeScript |
| `npm run test:learning` | Curriculum and publication tooling |
| `npm run test:ai` | Provider transports and text fallback with mocked APIs |
| `npm run test:app` | Search parameters and media byte ranges |
| `npm run test:deploy` | Additive release planning, repeatability and incompatible schema guards |
| `npm run db:check:prod` | Read-only verification against `.env.production` |
| `npm run db:deploy:prod` | Explicitly apply the reviewed additive Transit release to `.env.production` |
| `npm run test:app:live` | Running local app: login, admin pages, search, article lifecycle, media, settings and newsletter |
| `npm run build` | Prisma client generation and production Next.js build |

Live checks require the app running, a populated local database, and the seeded
admin. Override `APP_TEST_EMAIL` / `APP_TEST_PASSWORD` for a different existing
local account. Tests create and remove only their own records and restore the
settings they temporarily change. They refuse non-local URLs and databases.

Before deploying against an existing database, run `npm run db:check:prod`.
If it reports missing Transit schema, review `prisma/releases/20261025_transit.sql`
and run `npm run db:deploy:prod` with the intended environment. The release adds
only missing `SiteSettings.siteUrl`, `SiteSettings.showArticleImages` and
`NewsletterSubscriber`; it preserves existing settings/content and can safely
resume a partially completed run. Local development and verification never
apply this production release implicitly.


## Dependency baseline (25 October 2026)

All direct dependencies were checked against their latest stable registry releases.
Next.js 16.4.3, React 19.3.1, Prisma 7.10.1 and TypeScript 7.0.2 are used.
Auth.js stays on the existing v5 API at its latest beta, 5.0.0-beta.32; Prisma 8
release candidates are excluded from this production update.

- Prisma 7 reads CLI connection settings from `prisma7.config.ts`. Both the app
  and maintenance scripts use the shared MySQL adapter in `lib/prisma-client.cjs`.
  Explicit environment variables take priority over `.env.local` and `.env`.
- Type checking uses native TypeScript 7. Next.js and ts-node use Microsoft's
  TypeScript 6 compatibility package through the `typescript` npm alias because
  they require its JavaScript compiler API.
- SheetJS 0.20.3 comes from its official CDN, which carries newer releases than
  npm. `.npmrc` allows direct remote dependencies for that pinned tarball.
- npm 12 install hooks are approved only for the pinned Prisma CLI, engines and
  native resolver. Refresh these approvals when those dependencies change.
- A scoped override supplies the patched PostCSS selector parser to Tailwind
  Typography. `npm audit` reports zero vulnerabilities with the checked-in lockfile.
- ESLint 10 works with Next.js 16.4.3. Some included plugins still advertise
  ESLint 9 peer ranges and produce install warnings, as described in Next.js's
  bundled ESLint guide. React Compiler migration diagnostics remain visible as
  warnings; React Compiler is not enabled for this application.

For a clean production build, run `npm ci` followed by `npm run build:prod`.
Every build with a configured database now checks the Transit schema before
cleaning/compiling. Missing columns or tables fail the build with the explicit
release command, preventing a successful build from deploying a broken site.
Standard builds generate the client but never apply this release automatically.
The explicit `build:with-migrate` command applies this reviewed release before
compiling. When
DATABASE_URL is absent, compilation may still use the existing build-time stub;
run the explicit database check with the deployment environment before release.

## Production incident verification (25 October 2026)

The live 500 was reproduced locally with `npm run start:prod`, which reads
`.env.production`: health was 200, but home was 500 because `siteUrl` was missing.
Both settings columns and the subscriber table were absent from production.
The release was tested against isolated MySQL, then explicitly approved and
applied to production. Existing settings and all 114 articles, 211 sections and
326 media records were preserved. Live and production-environment local routes
were checked after the repair. The local app continues to run with the
production environment, so admin changes there affect the real database.
