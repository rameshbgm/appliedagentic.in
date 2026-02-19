

## 0) Purpose \& success criteria

Build **AppliedAgentic**, a production-ready, mobile-first, visually premium content publishing platform and AI knowledge hub for articles on Generative AI and Agentic AI, inspired in spirit by modern visual engineering guide sites (clean, editorial, animated, high readability).[^2][^4][^1]

**Primary goal:** Everything (topics/modules/articles/media/settings) is managed from a secure admin panel with a powerful WYSIWYG editor and integrated AI tools for text, images, and audio generation.[^3][^4][^1][^2]

**Success criteria**

- Admin can log in, create/edit/publish/schedule articles, upload/insert images, embed links/iframes, and manage site navigation.[^1][^2]
- Admin can generate AI-assisted text, AI images, and AI audio inside the editor (OpenAI SDK), with configurable models/temperature/etc.[^4][^2][^1]
- Public site is fast, SEO-friendly, mobile-first, responsive, with premium typography and tasteful animations (Framer Motion + optional Three.js loader).[^2][^4][^1]
- Data persisted in **MySQL** using **Prisma**, deployable to **Hostinger** (VPS or Node hosting).[^4][^1][^2]

***

## 1) Tech stack (mandatory)

### Core

- **Next.js 14+** (latest, App Router, TypeScript strict).[^1][^2][^4]
- **MySQL 8+** database.[^2][^4][^1]
- **Prisma ORM** for schema + migrations + seed.[^4][^1][^2]
- **Tailwind CSS** for styling + design tokens.[^1][^4]
- **Framer Motion** for animations and page transitions.[^2][^4][^1]
- **TipTap** WYSIWYG editor with required extensions.[^4][^1]
- **OpenAI Node SDK** for AI text/image/audio.[^1][^2][^4]
- **NextAuth.js** (admin-only credentials provider) for authentication and route protection.[^2][^4][^1]


### Optional but recommended

- **Three.js** for a 3D loader (must be lightweight and not harm mobile performance).[^4]
- Upload tooling:
    - Option A: Next.js route handlers + `multer`-style approach (or `formidable`) and local disk storage.[^2][^4]
    - Option B: `uploadthing` for easier uploads (still store metadata in DB).[^4]
    - Option C: Cloudinary/S3-compatible storage (pluggable abstraction).[^1][^2]


### Package manager

- Prefer `pnpm`.[^1]

***

## 2) Product roles \& permissions

### Public visitor

- Browse modules/topics and read published articles.[^2][^1]
- Search and filter content (by topic/module/status/tag where relevant).[^4][^1]
- View article page with readability-first layout, Table of Contents, reading progress bar, and optional audio player if available.[^1][^4]


### Admin (single admin initially)

- Secure login (email/password only). No public registration.[^2][^1]
- Full CRUD on Topics and Articles; optionally Modules too (depending on final data model choice).[^3][^1]
- Upload/manage media assets and insert into articles.[^1][^2]
- Configure site settings (branding, SEO defaults, social links, analytics placeholders).[^1]
- Configure AI settings (models, temperature, max tokens, voice, image size/quality/style) without redeploy if possible.[^4][^1]

***

## 3) Content model \& information architecture

### Course framing

The platform represents an online course/knowledge hub:

**Applied Agentic AI for Organizational Transformation**[^3][^2]

### Required hierarchy

Support a structured taxonomy:

- **Module** → **Topic** → **Article**[^2]
- Additionally support generic expansion beyond the initial course content to any future topics.[^3][^1]


### Seeded modules/topics list (must be inserted as initial data, editable later)

Seed the 8 Modules and their topics/articles stubs as draft placeholders, editable in admin.[^3][^4][^1]

**Module 1 – Foundations of Generative and Agentic AI**

- Generative AI Fundamentals
- AI Chatbots: Past, Present, and Future
- Cost-Optimized Models and Performance Trade-Offs
- Exploring Multimedia and Language Interaction Models
- Advanced Applications of Generative AI Tools[^3][^4][^1]

**Module 2 – The Rise of Agentic AI and Emerging Platforms**

- Emerging Agentic Platforms
- Vibe Living
- Single vs. Multi-Agent Architectures
- Open-Source vs. Closed-Source AI Systems[^3][^4][^1]

**Module 3 – Connecting Agents to Digital Ecosystems**

- Building Agents into Existing Workflows
- Integrating Generative and Agentic AI with Existing Systems: Challenges and Solutions
- Spotify MCP and Other Edge-cases of Agent Integration
- Empathy and Response-Tuning for Customer-Facing Agents[^3][^4][^1]

**Module 4 – Agent Risks, Disinformation, and Systemic Impact**

- Classic and Current Cybersecurity Risks
- Cybersecurity for Agent Ecosystems
- Limitations of Agent Perception and Error Correction[^3][^4][^1]

**Module 5 – AI Agents by Business Function**

- The Maturity Cycle of Agentic Implementation (Crawl–Walk–Run)
- Advantages of Agentic AI for the Product Development Cycle
- Functional Deployments: HR Bots, Finance Advisors and IT Copilots
- Agent Architecture in the Enterprise: Centralized vs. Embedded[^4][^3][^1]

**Module 6 – The Last Mile – From Pilot to Practice**

- Voice Agents: Synthesis, Phone Systems, and Real-time Applications
- Last-mile Integration: Why Pilots Succeed but Deployments Stall
- Internal Resistance and Change Management
- Monitoring Agent Performance (Metrics, KPIs, Feedback Loops)[^3][^4][^1]

**Module 7 – Governance, Compliance, and Agent Testing**

- Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules
- Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks
- Agent Speed vs. Oversight: Where to Insert Guardrails
- Documentation and Compliance Readiness[^4][^1][^3]

**Module 8 – Strategy Capstone – Leading the Agentic Future**

- Strategic roadmap development (short-, medium-, long-term)
- Team structure, vendor choice, and internal capability building
- Organizational culture and leadership for agent adoption
- Summary of technical enablers and business opportunities
- Maturity assessment of agent strategy – change management[^1][^3][^4]

***

## 4) Database (MySQL) — final schema requirements

You have two different schema directions across attachments:

- Direction A: `Module` table + `Topic` table referencing module.[^3]
- Direction B: Only `Topic` with `moduleLabel/moduleNumber` field.[^4][^1]

**Final decision (recommended):** Implement explicit `Module` table and `Topic` table referencing it for clean structure, while still allowing flexible expansion. Also support tags, media library, and AI logs. This aligns with your “Modules → Topics → Articles” architecture and future growth.[^2][^3]

### Prisma models (minimum required entities)

Implement (at least):

- `User` (admin)
- `Module`
- `Topic`
- `Article`
- `Tag` (and `ArticleTag` join)
- `MediaAsset` / `Media` (media library)
- `SiteSettings` (general settings + AI settings)
- Optional: `AIUsageLog` and/or `AIMedia` (track AI outputs and prompts)[^1][^3][^4]


### Article publication state

Support: `draft`, `scheduled`, `published`, and optionally `archived`.[^3][^1]

### View counters \& analytics

- Add `viewCount` on articles and implement an endpoint or server action to increment views.[^2][^4]


### Constraints \& indexes

- Unique `slug` for module/topic/article.
- Index `status`, `publishedAt`, and FKs for performance.[^3]

***

## 5) Repository structure (target)

Implement a clean Next.js App Router repo similar to this (adjust as needed but keep the spirit):[^4][^1]

```txt
appliedagentic/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── modules/
│   │   │   ├── page.tsx
│   │   │   └── [moduleSlug]/page.tsx
│   │   ├── topics/
│   │   │   ├── page.tsx
│   │   │   └── [topicSlug]/page.tsx
│   │   ├── articles/
│   │   │   ├── page.tsx
│   │   │   └── [articleSlug]/page.tsx
│   │   ├── search/page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx                # dashboard
│   │   ├── modules/...
│   │   ├── topics/...
│   │   ├── articles/...
│   │   ├── media/...
│   │   ├── settings/...
│   │   └── analytics/...
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── modules/...
│   │   ├── topics/...
│   │   ├── articles/...
│   │   ├── media/upload/route.ts
│   │   ├── ai/generate-text/route.ts
│   │   ├── ai/generate-image/route.ts
│   │   ├── ai/generate-audio/route.ts
│   │   └── search/route.ts
│   └── layout.tsx
├── components/
│   ├── public/...
│   ├── admin/...
│   └── shared/...
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── openai.ts
│   ├── upload.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/
└── README.md
```


***

## 6) Public site — pages \& UX specs

### Global requirements

- **Mobile-first** layout and responsive behavior for all pages.[^2][^1][^4]
- Dark-mode default is acceptable; provide light mode toggle if feasible.[^1]
- Premium readable typography (body line-height ~1.7, good spacing).[^2][^4]
- Smooth scrolling, tasteful reveals, and non-janky animations.[^4][^1][^2]


### Required public pages

#### `/` Home

- Hero section with strong headline/tagline + CTA buttons.
- Topics/modules grid (8 modules), each card themed by module color.
- Featured article section + latest articles feed (cards).
- Optional newsletter section (can be placeholder).[^1][^4]


#### `/modules` and `/modules/[moduleSlug]`

- List modules and allow browsing module roadmap (topics within module and their articles).[^2][^3]


#### `/topics` and `/topics/[topicSlug]`

- Topic directory and topic detail page with article list ordered by `orderIndex`/`order`.[^4][^1]


#### `/articles` and `/articles/[articleSlug]`

- Articles index with filters (module/topic/tag) and search.
- Article detail reader:
    - cover image, breadcrumbs, metadata (date, read time)
    - reading progress bar
    - rendered WYSIWYG content with great styling
    - sticky Table of Contents on desktop
    - previous/next article navigation
    - related articles
    - audio player if article has AI audio narration/summary[^1][^4]


#### `/search`

- Search across title/excerpt/content; paginate results.[^4][^1]

***

## 7) Admin panel — full specification

### Security rules

- All `/admin/*` routes are protected via NextAuth and middleware.[^2][^1][^4]
- All admin mutations require server-side authentication check.
- No public registration; seed admin account in `prisma/seed.ts`.[^1][^2]


### Admin UI layout

- Left sidebar navigation, responsive (collapsible on mobile/tablet).[^4][^1]
- Top header with page title, quick action (“New Article”), and user actions.[^1]


### Admin modules (pages)

1. **Dashboard**
    - Stats cards: total modules, topics, articles, published/drafts, media count, total views.[^4][^1]
    - Recent articles list/table with edit links.[^1]
    - Optional AI usage summary.[^4]
2. **Modules management**
    - CRUD modules
    - reorder modules (drag-and-drop optional)
    - module slug auto generation + editable[^3][^1]
3. **Topics management**
    - CRUD topics
    - assign topic to module, set orderIndex
    - topic theming: icon, color, cover image, short description[^1][^4]
4. **Articles management**
    - Table list + filters (topic/module/status)
    - Bulk actions: publish/unpublish/delete (optional but desired).[^1]
    - Create/Edit page: full-screen editor with metadata sidebar:
        - title, slug, excerpt/summary
        - module/topic assignments
        - tags
        - status: draft/scheduled/published
        - publish datetime for scheduled
        - cover image
        - SEO meta fields
        - AI assist panel[^3][^1]
5. **Media library**
    - Grid view, preview modal, copy URL, delete confirm, search/filter by type.[^2][^4][^1]
6. **Settings**
    - General: site name, tagline, logo, favicon, meta description.[^4][^1]
    - Social/SEO: social links, default OG image, analytics ID placeholder.[^1]
    - AI Configuration:
        - API key masked input (server-side only)
        - model fields for text/image/audio
        - temperature slider
        - max tokens
        - image size/quality/style defaults
        - voice + speed defaults
        - “Test Connection” endpoint `/api/ai/test` (recommended)[^4][^1]
7. **Analytics**
    - At minimum: show viewCount per article + totals.
    - Optional: charts (articles by topic, published over time) if time permits.[^2][^1]

***

## 8) WYSIWYG editor — TipTap requirements (must implement)

### Core features

- Headings H1–H4, paragraph, bold/italic/underline/strike.[^1]
- Lists: bullet, ordered, task list.[^1]
- Blockquote, callout box (custom node), horizontal rule.[^1]
- Code:
    - inline code
    - code blocks with syntax highlighting (lowlight/highlight.js) and language selector.[^4][^1]
- Tables: insert/resize/add/remove rows/cols (TipTap table extensions).[^1]
- Links with “open in new tab”.[^1]
- Images:
    - upload from device
    - paste from clipboard
    - set alt text and optional caption
    - align left/center/right and resize (if feasible).[^2][^1]
- Embeds:
    - YouTube, Twitter/X, Loom, CodeSandbox via iframe embed (enter URL → generate embed).[^1]
- HTML mode:
    - toggle raw HTML view (bonus but requested).[^2][^1]
- Undo/redo history.[^1]
- Optional: font family selection (at least 3 options), text color, highlight, alignment including justify.[^1]


### Editor UX layout

Toolbar layout (use as guideline):[^1]

```txt
[Heading ▾] [Bold] [Italic] [Underline] [Strike] | [Link] [Image] [Embed]
[List] [OrderedList] [Task] | [Code] [CodeBlock] [Quote] | [Table] [HR]
[AlignLeft] [AlignCenter] [AlignRight] | [FontColor] [Highlight]
[HTML] [Undo] [Redo] | [🤖 AI Assist ▾]
```


***

## 9) AI integration — OpenAI SDK (server-side only)

### Non-negotiable constraints

- **Never expose API keys in client-side code**.
- AI calls happen in route handlers (`/app/api/ai/*`) or server actions.
- Admin UI calls these endpoints and receives results.[^2][^4][^1]


### AI assist panel (inside admin article editor)

Trigger: toolbar + keyboard shortcut `Ctrl+Shift+A`.[^1]

#### A) AI Text

Support modes:[^1]

- Generate from scratch
- Expand selected text
- Summarize
- Rewrite (tone)
- Fix grammar

Options:

- Tone: Professional / Conversational / Technical / Inspirational
- Length presets: Short/Medium/Long
- Configurable: model, temperature, max tokens

UX:

- Show preview/diff; admin can “Insert at cursor” or “Replace selection”.[^3][^1]

Route:

- `POST /api/ai/generate-text`
- Body: `{ prompt, mode, tone, length, selectedText?, configOverrides? }`[^1]


#### B) AI Image

Support:

- Prompt input, size options, style, quality
- Generate preview; save to media library; insert into article at cursor; or set as cover.[^3][^1]

Route:

- `POST /api/ai/generate-image`
- Body: `{ prompt, size, style, quality, configOverrides? }`[^1]

Storage:

- Save generated image to `/public/uploads/ai/` (or configured storage) and create MediaAsset row.[^2][^1]


#### C) AI Audio (TTS)

Support:

- Generate audio summary or full narration.
- Voice selection (alloy/echo/fable/onyx/nova/shimmer) and speed slider 0.5–2.0.[^1]
- Save to `/public/uploads/audio/` and link to article.[^2][^1]

Route:

- `POST /api/ai/generate-audio`
- Body: `{ text, voice, speed, configOverrides? }`[^1]


### AI configuration storage

- Use `.env` as default values.
- Allow admin settings page to store *config* in DB (SiteSettings).
- API key input must be masked and stored securely; if not encrypting initially, store reference pattern like `env:OPENAI_API_KEY` or store in env only and store models/params in DB.[^4][^1]

***

## 10) Media uploads \& storage

### Required behaviors

- Upload images from admin editor and media library.
- Validate MIME types and max file size (default 10MB).
- Store file on disk (default) at `/public/uploads/...` and persist metadata in DB.[^2][^4][^1]
- Provide a media picker modal inside editor to reuse uploaded images.[^1]


### Pluggable design

Create `lib/upload.ts` abstraction so later you can swap local → S3/Cloudinary without rewriting editor logic.[^2][^1]

***

## 11) UI/UX design system \& animation details

### Visual direction

- Premium tech/editorial look, colorful but professional, clean hierarchy, minimal clutter.[^2][^1]
- Dynamic menu (mega-menu on desktop; slide-in accordion on mobile).[^2][^1]


### Typography

Two variants appear in your attachments—choose one and implement consistently:

- Variant A (strong modern sans):
    - Display: Space Grotesk
    - Body: Inter
    - Code: JetBrains Mono[^4]
- Variant B (editorial blend):
    - Headings: Inter or Cal Sans
    - Body: Lora or Source Serif 4
    - Code: JetBrains Mono[^1]

**Implementation requirement:** Use Google Fonts via `next/font` and set typographic scale (mobile base 16px → desktop 18px, body line-height ~1.7).[^4][^1]

### Color palette \& tokens

Implement CSS variables for brand colors, surfaces, and per-module accents (8 module colors).[^4]

### Animations

- Framer Motion: reveal-on-scroll (fade-up), stagger children, route crossfade transitions.[^4][^2][^1]
- Hover effects: card lift, subtle 3D tilt using CSS perspective.[^1]
- Article page: cover image parallax and progress bar.[^4][^1]
- 3D loader:
    - Show at first load only (session storage)
    - Render abstract neural network graph with glowing nodes and edges
    - Auto fade-out after ~2.5s
    - Must be lightweight on mobile (fallback to simple spinner if needed).[^4]

***

## 12) Performance, SEO, accessibility

### Performance

- Use Next.js Image optimization, lazy-load heavy components (editor, 3D loader).[^3][^1]
- Avoid heavy animation on low-end mobile devices.[^1]


### SEO

- Clean slugs and canonical URLs.
- Use article meta title/description and OpenGraph image.[^3][^1]
- Provide `sitemap.xml` and `robots.txt`.[^3]


### Accessibility

- Semantic HTML and proper focus states.
- Keyboard navigation in admin and editor.
- Require alt text for images on upload.[^3][^1]

***

## 13) Authentication \& security details

### NextAuth

- Credentials provider only.
- Admin user seeded in DB.
- Passwords hashed with bcrypt.
- Protect admin pages via middleware and API routes via server session checks.[^2][^1]


### Security basics

- CSRF protection for mutations (NextAuth helps; still ensure safe patterns).
- Validate and sanitize HTML content if storing HTML; prefer TipTap JSON with safe renderer or sanitize HTML before rendering.[^3][^2]
- Never leak OpenAI API key to client.[^2][^1]

***

## 14) Search

### Minimum viable

- Search by title + excerpt + content.
- Implement as server-side DB query, basic LIKE/fulltext (choose based on MySQL configuration).[^4][^1]


### UI

- Search bar in navbar and `/search` page results with pagination.[^4][^1]

***

## 15) Deployment to Hostinger

Two deployment styles appear across your materials:

- **Hostinger Node hosting** can auto-detect Next.js and build.[^2]
- **Hostinger VPS** with Node.js + MySQL + PM2 + Nginx reverse proxy.[^4][^1]


### Recommended deployment path (VPS)

1. Provision VPS with Node.js 20+, MySQL 8+, Nginx, PM2.[^1]
2. Configure environment variables (`.env.local` in production environment or Hostinger panel).[^2][^1]
3. Build and run:
    - `pnpm install`
    - `pnpm build`
    - `pm2 start npm --name "appliedagentic" -- start`[^1]
4. DB:
    - `npx prisma migrate deploy`
    - `npx prisma db seed`[^1]
5. Nginx:
    - reverse proxy domain → `localhost:3000`
    - SSL via Let’s Encrypt.[^1]

### Optional: Standalone output

Set `next.config.ts` `output: 'standalone'` for simpler deployment packaging.[^1]

### Note about the Docker stack file

The provided Docker script in `Hostinger Deployment.txt` is a separate infrastructure stack (Postgres + n8n + Jenkins + Nginx) and not required for AppliedAgentic Next.js + MySQL deployment, unless you want to run your own infra platform. Keep it separate from this project repo.[^5]

***

## 16) Environment variables (.env.example)

Create `.env.example` with placeholders:[^4][^1]

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/appliedagentic"

# NextAuth
NEXTAUTH_SECRET="replace-me"
NEXTAUTH_URL="https://yourdomain.com"

# Site
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="AppliedAgentic"

# Uploads
UPLOAD_DIR="./public/uploads"
MAX_UPLOAD_SIZE_MB=10

# OpenAI (placeholders, server-side only)
OPENAI_API_KEY="sk-placeholder"
OPENAI_TEXT_MODEL="gpt-4o"
OPENAI_IMAGE_MODEL="dall-e-3"
OPENAI_AUDIO_MODEL="tts-1"
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
OPENAI_IMAGE_SIZE="1024x1024"
OPENAI_IMAGE_QUALITY="standard"
OPENAI_VOICE="alloy"
```


***

## 17) Seed data requirements

Implement `prisma/seed.ts` to:

- Create 1 admin user (dev-only credentials documented in README).[^2][^1]
- Insert 8 modules and their topics as Topics (or as Articles stubs under Topics depending on your final hierarchy).
- Insert placeholder draft articles for each topic item title above with placeholder content.[^4][^1]

***

## 18) Deliverables checklist (must be done)

### Functional

- [ ] Next.js App Router app with TypeScript strict.[^4][^1]
- [ ] MySQL + Prisma schema and migrations.[^4][^1]
- [ ] Prisma seed inserts admin + modules/topics/articles stubs.[^4][^1]
- [ ] NextAuth credentials auth; middleware protects `/admin/*`.[^2][^1]
- [ ] Admin dashboard + modules/topics/articles/media/settings/analytics pages.[^4][^1]
- [ ] TipTap editor with all required extensions and media embed tooling.[^2][^1]
- [ ] Upload endpoint + media library DB persistence.[^2][^1]
- [ ] AI endpoints (text/image/audio) with OpenAI SDK and config placeholders.[^2][^4][^1]
- [ ] Public pages + article reader with TOC, progress bar, related links, optional audio player.[^4][^1]
- [ ] Search + filters.[^4][^1]


### Quality

- [ ] Mobile-first responsive UI everywhere.[^2][^4][^1]
- [ ] Framer Motion scroll/page transitions; optional Three.js loader.[^4][^1]
- [ ] SEO metadata, sitemap, robots.[^3][^1]
- [ ] Accessibility basics (alt text, keyboard nav).[^3][^1]


### Docs

- [ ] `README.md` local setup + env vars + migrations + seed + run instructions.[^3][^1]
- [ ] Hostinger deployment steps for VPS (PM2+Nginx) and/or Node hosting.[^2][^1]
- [ ] `.env.example` included.[^4][^1]

***

## 19) Implementation notes \& decisions Copilot must follow

1. Prefer server components for public pages, but keep editor/admin client components as needed.[^4][^1]
2. Store rich text either as TipTap JSON (preferred) or sanitized HTML; must render safely.[^3][^2]
3. AI routes must be server-only and read config from env + SiteSettings overrides.[^4][^1]
4. Do not bloat initial MVP with unnecessary infra; keep Docker optional.[^5][^1]
5. Keep UI modern, colorful, animated—but ensure performance on mobile and accessibility.[^2][^1]

***

If you want, the next step is to convert this spec into an actual **repo-ready file** name and structure (e.g., `SPEC.md`, `README.md`, `prisma/schema.prisma` skeleton, and a task list for Copilot).

<div align="center">⁂</div>

[^1]: AppliedAgentic_Website_Prompt.md

[^2]: Project-Overview-and-Architecture.pdf

[^3]: Create-an-detailed-granular-prompt-for-the-followi.md

[^4]: AppliedAgentic_Build_Prompt.md

[^5]: Hostinger-Deployment.txt

