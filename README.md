# Applied Agentic AI

> The definitive knowledge platform for AI agents, LLMs, and agentic systems — **appliedagentic.in**

---

## Overview

Applied Agentic AI is a production-ready full-stack content publishing platform built with **Next.js 14**, **MySQL**, and **OpenAI** integration. It provides structured learning across 8 modules covering everything from AI foundations to advanced multi-agent production deployments.

### Features

#### Public Site
- 🎯 **8 Learning Modules** with structured topics and articles
- 🔍 **Full-text search** with instant dropdown results
- 📖 **Rich article reader** — table of contents, reading progress bar, copy-code buttons
- 🎧 **Audio articles** with sticky mini audio player (OpenAI TTS)
- 📱 **Mobile-first** responsive design
- 🌙 **Dark/Light mode** with smooth transitions
- ⚡ **3D loader** (Three.js neural network) on first visit
- 🎨 **Particle hero** with typewriter effect
- 🖼️ **Framer Motion** scroll animations throughout
- 🗺️ **Dynamic sitemap** and robots.txt

#### Admin Panel (`/admin`)
- 🔐 **Secure auth** — NextAuth.js v5 with bcrypt passwords
- 📝 **TipTap WYSIWYG editor** with 15+ extensions (tables, code blocks with syntax highlighting, embeds, etc.)
- 🤖 **AI Assistant Panel** — Generate text, images (DALL-E 3), and audio (TTS) from within the editor
- 📂 **Module & Topic CRUD** with drag-drop reordering
- 📊 **Analytics dashboard** with Recharts charts
- 🖼️ **Media library** with multi-upload, copy URL, delete
- ⚙️ **Settings** — General, AI config, SEO, admin account
- 🔄 **Auto-save** every 60 seconds while editing
- 📋 **Article duplication**, status management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2 (App Router, TypeScript) |
| Database | MySQL 8+ with Prisma 5.17 ORM |
| Auth | NextAuth.js v5 (Credentials, JWT) |
| Editor | TipTap 2.6 (20+ extensions) |
| AI | OpenAI SDK 4.57 (GPT-4, DALL-E 3, TTS) |
| Animations | Framer Motion 11.3, Three.js 0.168 |
| Charts | Recharts |
| Styling | Tailwind CSS 3.4 |
| Toasts | Sonner |
| Package manager | pnpm |
| Deployment | Hostinger VPS, PM2, Nginx |

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- MySQL 8+ running locally

### Setup

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/appliedagentic.in.git
cd appliedagentic.in

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your MySQL credentials and API keys

# 4. Run DB migrations and seed
pnpm prisma migrate dev
pnpm prisma db seed

# 5. Start dev server
pnpm dev
```

Visit:
- **Public site**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin
  - Email: `admin@appliedagentic.com`
  - Password: `Admin@123`

---

## Environment Variables

All variables are documented in [.env.example](.env.example).

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MySQL connection string |
| `NEXTAUTH_URL` | ✅ | Full site URL |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char secret |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL (for sitemap) |
| `UPLOAD_DIR` | Optional | Absolute path for uploads |
| `MAX_FILE_SIZE_MB` | Optional | Upload limit (default: 10) |

---

## Project Structure

```
appliedagentic.in/
├── app/
│   ├── (admin)/              # Admin route group
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── modules/
│   │   ├── topics/
│   │   ├── articles/
│   │   ├── media/
│   │   ├── settings/
│   │   └── analytics/
│   ├── (public)/             # Public route group
│   │   ├── page.tsx          # Homepage
│   │   ├── modules/
│   │   ├── topics/
│   │   ├── articles/
│   │   └── search/
│   ├── api/                  # API routes (22 endpoints)
│   ├── layout.tsx            # Root layout
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── admin/                # Admin UI components
│   ├── public/               # Public UI components
│   └── shared/               # Shared (Loader3D, ThemeProvider, etc.)
├── lib/                      # Utilities (prisma, auth, openai, storage...)
├── prisma/
│   ├── schema.prisma         # 10 models
│   └── seed.ts               # Full seed data
├── styles/
│   └── globals.css           # Design tokens + component classes
├── types/
│   └── index.ts              # TypeScript interfaces
├── ecosystem.config.js       # PM2 config
└── DEPLOYMENT.md             # VPS deployment guide
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm prisma migrate dev` | Run migrations in dev |
| `pnpm prisma migrate deploy` | Apply migrations in production |
| `pnpm prisma db seed` | Seed database with initial data |
| `pnpm prisma studio` | Open Prisma Studio |

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full step-by-step Hostinger VPS deployment instructions covering:
- Node.js, MySQL, PM2, Nginx setup
- SSL (Let's Encrypt)
- Environment configuration
- Build & deploy
- Zero-downtime updates

---

## License

MIT © Applied Agentic AI
