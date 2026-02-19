# Applied Agentic AI — Master Code Generation Prompt
### For GitHub Copilot | Full-Stack Next.js + MySQL + Prisma + OpenAI
**Version:** 2.0 (Consolidated Master)  
**Date:** February 2026  
**Target:** GitHub Copilot Workspace / Copilot Chat (Agent Mode)

---

> **How to use with GitHub Copilot:**
> - Open this file in VS Code
> - Use Copilot Chat in **Agent mode** (`@workspace /new` or open Copilot Edits)
> - Paste sections incrementally OR reference this file as your full specification
> - Always start with `prisma/schema.prisma`, then `lib/`, then API routes, then components

---

## ROLE AND OBJECTIVE

You are a **senior full-stack engineer and product designer**.

Your task is to design and implement a complete, production-ready, content-managed website called **"Applied Agentic AI"** — a modern AI knowledge hub — to be deployed on **Hostinger VPS**.

**Stack (non-negotiable):**
- **Next.js** (latest, App Router, TypeScript, Server Components)
- **MySQL 8+** as the primary database
- **Prisma ORM** for schema migrations and type-safe queries
- **TailwindCSS** for styling + **Framer Motion** for animations
- **TipTap** as the WYSIWYG rich-text editor
- **NextAuth.js v5** (Credentials provider, admin-only)
- **OpenAI Node.js SDK** (text, image, audio generation)
- **Three.js** for 3D loading animation
- **PM2 + Nginx** on Hostinger VPS for deployment
- Package manager: **pnpm**

---

## 1. REPOSITORY STRUCTURE

Generate the complete project with this exact directory layout:

```
appliedagentic/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx                        # Public layout: Navbar + Footer
│   │   ├── page.tsx                          # Homepage (Hero, Modules Grid, Articles)
│   │   ├── modules/
│   │   │   ├── page.tsx                      # All modules grid listing
│   │   │   └── [moduleSlug]/
│   │   │       └── page.tsx                  # Module detail: topics + articles roadmap
│   │   ├── topics/
│   │   │   └── [topicSlug]/
│   │   │       └── page.tsx                  # Topic detail: article list
│   │   ├── articles/
│   │   │   ├── page.tsx                      # All articles: filter by module/topic/tag
│   │   │   └── [articleSlug]/
│   │   │       └── page.tsx                  # Article reader page
│   │   └── search/
│   │       └── page.tsx                      # Full-text search results
│   ├── (admin)/
│   │   ├── layout.tsx                        # Admin layout: sidebar + header
│   │   ├── login/
│   │   │   └── page.tsx                      # Admin login page
│   │   ├── dashboard/
│   │   │   └── page.tsx                      # Dashboard: stats, recent, AI usage
│   │   ├── modules/
│   │   │   ├── page.tsx                      # Modules list + drag-drop reorder
│   │   │   ├── new/page.tsx                  # Create module form
│   │   │   └── [id]/edit/page.tsx            # Edit module form
│   │   ├── topics/
│   │   │   ├── page.tsx                      # Topics list with module filter
│   │   │   ├── new/page.tsx                  # Create topic form
│   │   │   └── [id]/edit/page.tsx            # Edit topic form
│   │   ├── articles/
│   │   │   ├── page.tsx                      # Articles list: filters + bulk actions
│   │   │   ├── new/page.tsx                  # Create article: TipTap + metadata sidebar
│   │   │   └── [id]/edit/page.tsx            # Edit article
│   │   ├── media/
│   │   │   └── page.tsx                      # Media library: images + audio grid
│   │   ├── settings/
│   │   │   └── page.tsx                      # Site settings + AI config (tabbed)
│   │   └── analytics/
│   │       └── page.tsx                      # Analytics: view counts, AI usage logs
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts        # NextAuth handler
│   │   ├── modules/
│   │   │   ├── route.ts                      # GET all, POST create
│   │   │   └── [id]/route.ts                 # GET, PUT, DELETE by id
│   │   │   └── reorder/route.ts              # PATCH reorder
│   │   ├── topics/
│   │   │   ├── route.ts                      # GET all, POST create
│   │   │   └── [id]/route.ts                 # GET, PUT, DELETE by id
│   │   ├── articles/
│   │   │   ├── route.ts                      # GET (with filters), POST create
│   │   │   ├── [id]/route.ts                 # GET, PUT, DELETE by id
│   │   │   ├── [id]/publish/route.ts         # PATCH publish/unpublish
│   │   │   └── [id]/schedule/route.ts        # PATCH schedule publish
│   │   ├── media/
│   │   │   ├── upload/route.ts               # POST file upload (images/audio)
│   │   │   └── [id]/route.ts                 # DELETE media asset
│   │   ├── tags/
│   │   │   └── route.ts                      # GET all tags
│   │   ├── search/
│   │   │   └── route.ts                      # GET full-text search
│   │   ├── settings/
│   │   │   └── route.ts                      # GET/PUT site settings
│   │   └── ai/
│   │       ├── generate-text/route.ts        # POST AI text generation
│   │       ├── generate-image/route.ts       # POST AI image generation (DALL-E)
│   │       ├── generate-audio/route.ts       # POST AI audio/TTS generation
│   │       └── test/route.ts                 # POST test OpenAI connection
│   └── layout.tsx                            # Root layout: ThemeProvider, fonts
├── components/
│   ├── public/
│   │   ├── Navbar.tsx                        # Responsive nav, mega-menu, glassmorphism scroll
│   │   ├── Footer.tsx                        # Links, social icons, copyright
│   │   ├── HeroSection.tsx                   # Animated hero with particle canvas
│   │   ├── ModuleCard.tsx                    # Module card with color accent + hover 3D tilt
│   │   ├── TopicCard.tsx                     # Topic card
│   │   ├── ArticleCard.tsx                   # Article card: image, topic badge, excerpt
│   │   ├── ArticleContent.tsx                # Rendered TipTap HTML with custom styles
│   │   ├── ArticleAudioPlayer.tsx            # Sticky audio player for AI-generated narration
│   │   ├── TableOfContents.tsx               # Auto-generated sticky TOC from headings
│   │   ├── ReadingProgressBar.tsx            # Scroll-based reading progress bar
│   │   ├── RelatedArticles.tsx               # Related articles section
│   │   ├── SearchBar.tsx                     # Search input with debounce
│   │   └── ScrollAnimations.tsx             # Framer Motion scroll reveal wrapper
│   ├── admin/
│   │   ├── Sidebar.tsx                       # Collapsible admin sidebar
│   │   ├── AdminHeader.tsx                   # Top bar: breadcrumb, quick actions, toggle
│   │   ├── DashboardStats.tsx                # Stats cards grid
│   │   ├── editor/
│   │   │   ├── ArticleEditor.tsx             # TipTap WYSIWYG main wrapper
│   │   │   ├── EditorToolbar.tsx             # Full formatting toolbar
│   │   │   ├── ImageUploadModal.tsx          # Upload or select from Media Library
│   │   │   ├── EmbedModal.tsx                # Embed YouTube/Loom by URL
│   │   │   ├── LinkModal.tsx                 # Insert/edit link modal
│   │   │   └── AIAssistPanel.tsx             # Floating AI assistant panel (text/image/audio)
│   │   ├── MediaLibraryModal.tsx             # Select media from library
│   │   ├── MediaGrid.tsx                     # Media grid display
│   │   ├── ModuleForm.tsx                    # Create/edit module form
│   │   ├── TopicForm.tsx                     # Create/edit topic form
│   │   ├── ArticleMetaSidebar.tsx            # Metadata sidebar for article editor
│   │   └── StatsCard.tsx                     # Reusable stat display card
│   └── shared/
│       ├── Loader3D.tsx                      # Three.js 3D neural network loader (session-once)
│       ├── ThemeProvider.tsx                 # Dark/light theme context
│       ├── ToastNotifier.tsx                 # Toast notification system
│       ├── ConfirmDialog.tsx                 # "Are you sure?" confirmation modal
│       └── TagInput.tsx                      # Tag chip input component
├── lib/
│   ├── prisma.ts                             # Prisma client singleton (with HMR safety)
│   ├── auth.ts                               # NextAuth config (CredentialsProvider + bcrypt)
│   ├── openai.ts                             # OpenAI SDK instance (env-config)
│   ├── storage.ts                            # Pluggable file storage (local/S3 abstraction)
│   ├── slugify.ts                            # Slug generation utility
│   ├── readingTime.ts                        # Reading time calculator
│   └── utils.ts                             # Misc utilities (dates, truncate, etc.)
├── middleware.ts                             # Protect /admin/* routes via NextAuth session
├── prisma/
│   ├── schema.prisma                         # Full Prisma schema (MySQL)
│   ├── seed.ts                               # Seed: admin user + 8 modules + all topics
│   └── migrations/                          # Prisma auto-generated migrations
├── public/
│   ├── uploads/                             # Local file storage (images, audio)
│   │   ├── images/
│   │   ├── ai/                              # AI-generated images
│   │   └── audio/                           # AI-generated audio
│   ├── fonts/
│   └── images/
├── styles/
│   └── globals.css                          # Global CSS + CSS variables (design tokens)
├── types/
│   └── index.ts                             # Shared TypeScript types/interfaces
├── .env.local                               # Environment variables (never commit)
├── .env.example                             # Environment variable template
├── next.config.ts                           # Next.js config (standalone output, image domains)
├── tailwind.config.ts                       # Tailwind config (custom colors, fonts, breakpoints)
├── tsconfig.json                            # TypeScript strict config
├── package.json                             # Dependencies
└── README.md                               # Full setup + deployment guide
```

---

## 2. DATABASE SCHEMA (Prisma — MySQL)

Generate the complete `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  ADMIN
  SUPERADMIN
}

enum ArticleStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

enum MediaType {
  IMAGE
  AUDIO
}

enum AILogType {
  TEXT_GENERATION
  IMAGE_GENERATION
  AUDIO_GENERATION
}

// ─────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────

model User {
  id           Int          @id @default(autoincrement())
  email        String       @unique
  passwordHash String
  name         String
  role         Role         @default(ADMIN)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  articles     Article[]    @relation("ArticleAuthor")
  mediaAssets  MediaAsset[] @relation("MediaCreator")
  aiLogs       AIUsageLog[]
}

model Module {
  id               Int      @id @default(autoincrement())
  title            String
  slug             String   @unique
  orderIndex       Int      @default(0)
  shortDescription String?  @db.Text
  icon             String?  // emoji or icon class
  color            String?  // hex color for module theming
  coverImage       String?
  isPublished      Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  createdBy        Int?
  updatedBy        Int?
  topics           Topic[]

  @@index([slug])
  @@index([orderIndex])
}

model Topic {
  id               Int            @id @default(autoincrement())
  moduleId         Int
  module           Module         @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title            String
  slug             String         @unique
  orderIndex       Int            @default(0)
  shortDescription String?        @db.Text
  icon             String?
  color            String?
  coverImage       String?
  isPublished      Boolean        @default(true)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  createdBy        Int?
  updatedBy        Int?
  topicArticles    TopicArticle[]

  @@index([slug])
  @@index([moduleId])
  @@index([orderIndex])
}

model Article {
  id                 Int            @id @default(autoincrement())
  title              String
  slug               String         @unique
  summary            String?        @db.Text
  content            String         @db.LongText   // TipTap HTML or JSON
  status             ArticleStatus  @default(DRAFT)
  publishedAt        DateTime?
  scheduledAt        DateTime?
  isFeatured         Boolean        @default(false)
  coverImageId       Int?
  coverImage         MediaAsset?    @relation("ArticleCoverImage", fields: [coverImageId], references: [id])
  audioUrl           String?        // AI-generated audio narration URL
  readingTimeMinutes Int?
  viewCount          Int            @default(0)
  seoTitle           String?
  seoDescription     String?        @db.Text
  seoCanonicalUrl    String?
  ogImageUrl         String?
  authorId           Int
  author             User           @relation("ArticleAuthor", fields: [authorId], references: [id])
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  createdBy          Int?
  updatedBy          Int?
  topicArticles      TopicArticle[]
  articleTags        ArticleTag[]
  aiLogs             AIUsageLog[]

  @@index([slug])
  @@index([status])
  @@index([publishedAt])
  @@index([authorId])
  @@index([isFeatured])
}

model TopicArticle {
  id         Int     @id @default(autoincrement())
  topicId    Int
  articleId  Int
  orderIndex Int     @default(0)
  topic      Topic   @relation(fields: [topicId], references: [id], onDelete: Cascade)
  article    Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([topicId, articleId])
  @@index([topicId])
  @@index([articleId])
}

model Tag {
  id          Int          @id @default(autoincrement())
  name        String       @unique
  slug        String       @unique
  articleTags ArticleTag[]

  @@index([slug])
}

model ArticleTag {
  id        Int     @id @default(autoincrement())
  articleId Int
  tagId     Int
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([articleId, tagId])
}

model MediaAsset {
  id              Int        @id @default(autoincrement())
  filename        String
  url             String
  type            MediaType
  mimeType        String?
  altText         String?
  caption         String?
  width           Int?
  height          Int?
  sizeBytes       Int?
  aiPrompt        String?    @db.Text    // if AI-generated, store the prompt
  createdByUserId Int?
  createdBy       User?      @relation("MediaCreator", fields: [createdByUserId], references: [id])
  createdAt       DateTime   @default(now())
  articles        Article[]  @relation("ArticleCoverImage")

  @@index([type])
  @@index([createdAt])
}

model AIUsageLog {
  id            Int        @id @default(autoincrement())
  userId        Int?
  articleId     Int?
  type          AILogType
  model         String
  inputTokens   Int?
  outputTokens  Int?
  promptSnippet String?    @db.Text
  status        String     @default("success")  // success | error
  createdAt     DateTime   @default(now())
  user          User?      @relation(fields: [userId], references: [id])
  article       Article?   @relation(fields: [articleId], references: [id])

  @@index([type])
  @@index([createdAt])
  @@index([userId])
}

model SiteSettings {
  id                  Int      @id @default(1)
  siteName            String   @default("Applied Agentic AI")
  tagline             String?
  logoUrl             String?
  faviconUrl          String?
  metaDescription     String?  @db.Text
  footerText          String?
  socialTwitter       String?
  socialLinkedin      String?
  socialYoutube       String?
  defaultOgImage      String?
  analyticsId         String?
  // AI config — stored in DB but override by env if set
  openaiTextModel     String   @default("gpt-4o")
  openaiImageModel    String   @default("dall-e-3")
  openaiAudioModel    String   @default("tts-1")
  openaiTemperature   Float    @default(0.7)
  openaiMaxTokens     Int      @default(2000)
  openaiImageSize     String   @default("1024x1024")
  openaiImageQuality  String   @default("standard")
  openaiTtsVoice      String   @default("nova")
  updatedAt           DateTime @updatedAt
}
```

---

## 3. ENVIRONMENT VARIABLES

### `.env.example` (commit this)
```env
# ─── Database ───────────────────────────────────────────────────────────────
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/appliedagentic"

# ─── Authentication ─────────────────────────────────────────────────────────
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://yourdomain.com"

# ─── OpenAI ─── All configurable from Admin → Settings → AI Config ──────────
OPENAI_API_KEY="sk-your-api-key-here"
OPENAI_TEXT_MODEL="gpt-4o"
OPENAI_IMAGE_MODEL="dall-e-3"
OPENAI_AUDIO_MODEL="tts-1"
OPENAI_TEMPERATURE="0.7"
OPENAI_MAX_TOKENS="2000"
OPENAI_IMAGE_SIZE="1024x1024"
OPENAI_IMAGE_QUALITY="standard"
OPENAI_TTS_VOICE="nova"

# ─── File Upload ────────────────────────────────────────────────────────────
UPLOAD_DIR="./public/uploads"
MAX_UPLOAD_SIZE_MB="10"

# ─── Public Site ────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://appliedagentic.com"
NEXT_PUBLIC_SITE_NAME="Applied Agentic AI"
```

> **SECURITY RULE:** `OPENAI_API_KEY` and `DATABASE_URL` must NEVER be accessed in client-side code. All AI operations go through Next.js API routes on the server side only.

---

## 4. DESIGN SYSTEM & TOKENS

### CSS Variables (`styles/globals.css`)
```css
:root {
  /* Brand Colors */
  --color-primary:      #6C3DFF;   /* Electric Violet */
  --color-secondary:    #00D4FF;   /* Cyan */
  --color-accent:       #FF6B6B;   /* Coral */
  --color-gold:         #FFD93D;   /* Yellow highlight */

  /* Background Layers (Dark Mode Default) */
  --bg-base:            #0A0A0F;
  --bg-surface:         #12121A;
  --bg-elevated:        #1A1A28;
  --bg-border:          #2A2A3E;

  /* Text */
  --text-primary:       #F0F0FF;
  --text-secondary:     #9999BB;
  --text-muted:         #55556A;

  /* Module Colors (8 modules) */
  --module-1:           #6C3DFF;
  --module-2:           #00D4FF;
  --module-3:           #FF6B6B;
  --module-4:           #FFD93D;
  --module-5:           #4ECDC4;
  --module-6:           #FF9F43;
  --module-7:           #A29BFE;
  --module-8:           #55EFC4;
}

/* Light Mode Override */
[data-theme="light"] {
  --bg-base:            #FFFFFF;
  --bg-surface:         #F8F9FA;
  --bg-elevated:        #FFFFFF;
  --bg-border:          #E2E8F0;
  --text-primary:       #0F0F1A;
  --text-secondary:     #4A4A6A;
  --text-muted:         #9090AA;
}
```

### Typography
- **Display/Headings:** `Space Grotesk` (Google Fonts) — bold, modern
- **Body text:** `Inter` — clean, legible
- **Code:** `JetBrains Mono`
- Base: `16px` mobile → `18px` desktop
- Line height: `1.7` for article body content

### Tailwind Config (`tailwind.config.ts`)
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      colors: {
        primary: '#6C3DFF',
        secondary: '#00D4FF',
        accent: '#FF6B6B',
        gold: '#FFD93D',
        surface: '#12121A',
        elevated: '#1A1A28',
        border: '#2A2A3E',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
```

---

## 5. AUTHENTICATION (`lib/auth.ts`)

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null
        return { id: String(user.id), email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 hours
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role
      }
      return session
    },
  },
})
```

### Middleware (`middleware.ts`)
```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/dashboard')
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isAuthenticated = !!req.auth

  if (isAdminRoute && !isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
}
```

---

## 6. OPENAI INTEGRATION (`lib/openai.ts`)

```typescript
// lib/openai.ts
import OpenAI from 'openai'
import { prisma } from './prisma'

// Server-side only — never export to client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  return new OpenAI({ apiKey })
}

export const getAIConfig = async () => {
  // DB config overrides env defaults (except API key — always from env)
  const settings = await prisma.siteSettings.findFirst()
  return {
    textModel: process.env.OPENAI_TEXT_MODEL ?? settings?.openaiTextModel ?? 'gpt-4o',
    imageModel: process.env.OPENAI_IMAGE_MODEL ?? settings?.openaiImageModel ?? 'dall-e-3',
    audioModel: process.env.OPENAI_AUDIO_MODEL ?? settings?.openaiAudioModel ?? 'tts-1',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? String(settings?.openaiTemperature ?? 0.7)),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? String(settings?.openaiMaxTokens ?? 2000)),
    imageSize: (process.env.OPENAI_IMAGE_SIZE ?? settings?.openaiImageSize ?? '1024x1024') as '1024x1024' | '1792x1024' | '1024x1792',
    imageQuality: (process.env.OPENAI_IMAGE_QUALITY ?? settings?.openaiImageQuality ?? 'standard') as 'standard' | 'hd',
    ttsVoice: (process.env.OPENAI_TTS_VOICE ?? settings?.openaiTtsVoice ?? 'nova') as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
  }
}

export { getOpenAIClient }
```

---

## 7. API ROUTES — FULL SPECIFICATION

### 7.1 AI Text Generation (`app/api/ai/generate-text/route.ts`)
```typescript
// POST /api/ai/generate-text
// Body: { prompt, mode, tone, length, selectedText?, articleId? }
// mode: "generate" | "expand" | "summarize" | "rewrite" | "outline" | "improve"
// tone: "professional" | "conversational" | "technical" | "inspirational"
// length: "short" (100w) | "medium" (300w) | "long" (600w)

// Implementation:
// 1. Verify session (admin only)
// 2. Load AI config from getAIConfig()
// 3. Build system prompt based on mode + tone + length
// 4. Call openai.chat.completions.create() server-side
// 5. Log usage to AIUsageLog
// 6. Return { text: string }
```

### 7.2 AI Image Generation (`app/api/ai/generate-image/route.ts`)
```typescript
// POST /api/ai/generate-image
// Body: { prompt, size?, quality?, style? }
// style: "vivid" | "natural"

// Implementation:
// 1. Verify session
// 2. Load AI config
// 3. Call openai.images.generate({ model, prompt, size, quality, style, response_format: "url" })
// 4. Download the generated image
// 5. Save to /public/uploads/ai/[timestamp]-[slug].png
// 6. Create MediaAsset record in DB
// 7. Log to AIUsageLog
// 8. Return { url, mediaAssetId }
```

### 7.3 AI Audio Generation (`app/api/ai/generate-audio/route.ts`)
```typescript
// POST /api/ai/generate-audio
// Body: { text, voice?, speed?, articleId? }
// voice: alloy | echo | fable | onyx | nova | shimmer

// Implementation:
// 1. Verify session
// 2. Load AI config
// 3. Call openai.audio.speech.create({ model, voice, input: text, speed })
// 4. Convert ArrayBuffer to Buffer
// 5. Save to /public/uploads/audio/[timestamp].mp3
// 6. Create MediaAsset record (type: AUDIO)
// 7. If articleId provided, update Article.audioUrl
// 8. Log to AIUsageLog
// 9. Return { url, mediaAssetId }
```

### 7.4 File Upload (`app/api/media/upload/route.ts`)
```typescript
// POST /api/media/upload (multipart/form-data)
// Fields: file (File), altText? (string)

// Implementation:
// 1. Verify session
// 2. Validate file type (images: jpg/png/webp/gif/svg, audio: mp3/wav/ogg)
// 3. Validate file size <= MAX_UPLOAD_SIZE_MB
// 4. Generate unique filename: [timestamp]-[nanoid].[ext]
// 5. Save to UPLOAD_DIR/images/ or UPLOAD_DIR/audio/
// 6. Get image dimensions (for images, use sharp or probe-image-size)
// 7. Create MediaAsset record
// 8. Return { url, mediaAssetId, filename, type }
```

### 7.5 Articles API (`app/api/articles/route.ts`)
```typescript
// GET /api/articles
// Query params: status, moduleId, topicId, tag, search, page, limit, featured
// Returns: paginated list with topic/module info

// POST /api/articles
// Body: { title, slug, summary, content, status, topicIds[], tagIds[], 
//         coverImageId?, readingTimeMinutes?, seoTitle?, seoDescription?, 
//         seoCanonicalUrl?, publishedAt?, scheduledAt?, isFeatured? }
// Returns: created Article
```

### 7.6 Publish/Schedule (`app/api/articles/[id]/publish/route.ts`)
```typescript
// PATCH /api/articles/[id]/publish
// Body: { action: "publish" | "unpublish" | "schedule", scheduledAt?: DateTime }
// Updates article status and publishedAt/scheduledAt accordingly
```

---

## 8. TIPTAP WYSIWYG EDITOR — FULL CONFIGURATION

### Extensions to install and configure:
```typescript
// components/admin/editor/ArticleEditor.tsx

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Youtube from '@tiptap/extension-youtube'
// Custom extensions:
// - CalloutBlock (custom Node for callout/info boxes)
// - EmbedBlock (custom Node for iframe embeds)
```

### Toolbar Layout
The `EditorToolbar.tsx` must render:
```
Row 1: [Heading ▾ H1-H4] [Bold] [Italic] [Underline] [Strike] [Sub] [Sup] | 
        [AlignL] [AlignC] [AlignR] [AlignJustify]
Row 2: [BulletList] [OrderedList] [TaskList] | [Blockquote] [CodeInline] [CodeBlock ▾language]
        [HorizontalRule] | [Table ▾]  
Row 3: [Link] [Image ▾Upload/Library] [YouTube] [Embed]  | 
        [TextColor] [Highlight] | [HTML ◉]
Row 4: [Undo] [Redo] [Clear Formatting] | [🤖 AI Assist ▾ Generate/Expand/Summarize/Rewrite]
```

### AI Assist Panel Behavior
- Triggered by toolbar button or `Ctrl+Shift+A`
- On **desktop**: slides in from the right as a 320px panel alongside the editor
- On **mobile**: slides up as a bottom sheet drawer
- Three tabs: **Text**, **Image**, **Audio**

**Text Tab:**
```
Mode: [Generate | Expand Selected | Summarize | Rewrite | Outline | Improve]
Tone: [Professional | Conversational | Technical | Inspirational]
Length: [Short 100w | Medium 300w | Long 600w]
[Prompt textarea — 3 rows]
[Generate →] button with spinner
--- Preview pane ---
[Insert at Cursor] [Replace Selection] [Discard]
```

**Image Tab:**
```
[Image prompt textarea]
Size: [1024×1024 | 1792×1024 | 1024×1792]
Style: [Vivid | Natural]  Quality: [Standard | HD]
[Generate Image →] button with spinner
--- Preview (generated image thumbnail) ---
[Insert into Article] [Set as Cover] [Save to Library] [Discard]
```

**Audio Tab:**
```
Source: [Full Article | Article Summary | Custom Text]
Voice: [alloy | echo | fable | onyx | nova | shimmer] (dropdown)
Speed: [slider 0.5x – 2.0x]
[Generate Audio →] button
--- Audio player preview ---
[Attach to Article] [Save to Library] [Discard]
```

---

## 9. PUBLIC WEBSITE PAGES

### 9.1 Homepage (`app/(public)/page.tsx`)
Server component. Fetch from DB on the server. Layout:

```
1. <Loader3D />          — Three.js 3D loader (shows once per session via sessionStorage)
2. <HeroSection />       — Full-viewport dark gradient + animated particle mesh canvas
   - Headline: "The Future of Work is Agentic" (Space Grotesk, 64px+ desktop)
   - Sub-headline about the platform
   - CTA buttons: [Explore Modules →] [Latest Articles →]
   - Animated typewriter for sub-topics cycling through module names
3. <StatsBar />          — Animated count-up: Total Articles | Modules | Topics
4. <ModulesGrid />       — 8 module cards, 2-col mobile / 4-col desktop
   - Each card: color accent, icon, module badge, title, topic count, description
   - Hover: 3D CSS tilt + glow intensifies
5. <FeaturedArticle />   — Latest featured article — full-width card
6. <LatestArticles />    — 6 most recent published articles, 1-col/2-col/3-col grid
7. <NewsletterCTA />     — "Stay ahead of the AI curve" — email input (can be placeholder)
8. <Footer />
```

### 9.2 Modules Listing (`app/(public)/modules/page.tsx`)
- Grid of all published modules with cover, description, topic count
- ISR: `revalidate = 3600`

### 9.3 Module Detail (`app/(public)/modules/[moduleSlug]/page.tsx`)
- Module hero: color gradient, badge, title, description
- Course-roadmap-style numbered list of topics, each expanding to show articles
- Breadcrumb: Home > Modules > Module Name
- `generateMetadata()` from module data

### 9.4 Topic Detail (`app/(public)/topics/[topicSlug]/page.tsx`)
- Topic hero with module color gradient + module label badge
- Breadcrumb: Home > Modules > Module > Topic
- Ordered article list with: number, title, excerpt, read time, status badge
- Sidebar (desktop): article quick navigation links

### 9.5 All Articles (`app/(public)/articles/page.tsx`)
- Filter bar: Module dropdown, Topic dropdown, Tag chips, Search input
- Masonry or 3-col responsive grid of `<ArticleCard />`
- Pagination (12 per page)
- Server-side search via `/api/search`

### 9.6 Article Reader (`app/(public)/articles/[articleSlug]/page.tsx`)
```
Layout (desktop: 3-column, tablet: 2-column, mobile: 1-column):

Left (hidden mobile):  [empty / ad placeholder]
Center (main):
  - Full-width cover image with parallax effect
  - <ReadingProgressBar /> — sticky, top 0, colored bar
  - Breadcrumb navigation
  - Article header: title, excerpt, meta (author, date, reading time, topic tag)
  - <ArticleAudioPlayer /> — if audioUrl exists, sticky mini-player bar
  - <ArticleContent /> — rendered TipTap HTML:
      h1/h2/h3 auto-anchored with IDs for TOC
      Code blocks: highlight.js syntax highlighting
      Images: Next.js <Image> with captions
      Blockquotes: accent left border (module color)
      Tables: horizontal scroll wrapper
      Embeds: iframe with aspect ratio container
  - <RelatedArticles /> — same topic, 3 cards
  - Share bar: Twitter/X, LinkedIn, Copy Link

Right (sticky, desktop only):
  - <TableOfContents /> — auto-generated from h2/h3 headings, highlights current
```

- `generateMetadata()` for full SEO: title, description, OG tags, canonical URL
- `generateStaticParams()` for all published articles
- ISR: `revalidate = 300` (5 minutes)

### 9.7 Search (`app/(public)/search/page.tsx`)
- Server component: receives `?q=` query param
- Full-text search across article title, summary, content (MySQL FULLTEXT or LIKE)
- Filter by module/topic
- Paginated results with highlighted matches

---

## 10. ADMIN PANEL PAGES

### 10.1 Admin Layout (`app/(admin)/layout.tsx`)
```
Fixed left sidebar (260px desktop, hidden mobile with toggle):
  - Logo + "Admin Panel" text
  - Navigation links with icons:
    [🏠 Dashboard]  [📦 Modules]  [📚 Topics]  [📝 Articles]
    [🖼️ Media]  [⚙️ Settings]  [📊 Analytics]
    [🌐 Preview Site] (opens public site in new tab)
  - User avatar + name + role badge at bottom
  - [Logout] button
  - Gradient pill on active link

Top header bar:
  - Current page title + breadcrumb
  - [+ New Article] quick action
  - [🔔] notification bell (AI job status)
  - Dark/light mode toggle
```

### 10.2 Dashboard (`app/(admin)/dashboard/page.tsx`)
```
Stats row (6 cards with icons and count-up animations):
  [Total Modules] [Total Topics] [Published Articles] [Draft Articles] 
  [Total Media Files] [AI Operations Used]

Charts row (use Recharts):
  - Line chart: Articles Published per Month (last 6 months)
  - Donut chart: Articles by Module

Recent Articles table (last 10 edited):
  Cover | Title | Topic | Status badge | Last Updated | Views | [Edit]

AI Usage Log (last 5 operations):
  Type | Model | Article | Status | Date

Quick Actions:
  [✏️ Write New Article] [📦 Add Module] [📚 Add Topic] [🖼️ Upload Media]
```

### 10.3 Modules Management (`app/(admin)/modules/`)
**List page:**
- Table with drag-and-drop reordering (`@dnd-kit/sortable`)
- Columns: ⠿ drag handle | Color swatch | Icon | Order | Title | Topic count | Visible toggle | [Edit] [Delete]
- [+ New Module] button top right
- Inline delete with `<ConfirmDialog />`

**Create/Edit form:**
- Title (text input → auto-generates slug)
- Slug (editable text, shows `/modules/[slug]` preview)
- Short Description (textarea)
- Icon (emoji picker)
- Color (color picker)
- Cover Image (upload or select from media library)
- Display Order (number)
- Is Published (toggle)
- [Save Draft] [Publish] buttons

### 10.4 Topics Management (`app/(admin)/topics/`)
Same pattern as Modules.
Additional fields:
- **Module** (dropdown to assign parent module)

### 10.5 Articles Management (`app/(admin)/articles/`)
**List page:**
- Filter bar: [Search...] [All Modules ▾] [All Topics ▾] [All Statuses ▾] [Featured only toggle]
- Table: Cover | Title | Topic | Author | Status badge | Date | Featured toggle | Views | [Edit] [Delete]
- Bulk actions: [Publish Selected] [Unpublish Selected] [Delete Selected]
- Pagination

**Create/Edit Article Page:**
Full-screen 2-panel layout (see Section 8 above).

Left panel (editor area, ~65% width):
- Large article title input (H1 style, no border)
- `<ArticleEditor />` TipTap component (full height, scrollable)

Right panel (metadata sidebar, ~35% width, scrollable):
```
Topic:          [dropdown — required]
Additional Topics: [multi-select]
Status:         [Draft | Published | Scheduled | Archived]
Slug:           [auto-generated, editable text]
Excerpt/Summary: [textarea, 160 chars]
Cover Image:    [thumbnail if set, + Upload/Library button]
Tags:           [<TagInput /> chip component]
Featured:       [toggle]
Reading Time:   [auto-calculated, editable]
Publish Date:   [datetime picker — active when status=SCHEDULED]
Audio:          [current audio player if attached + Generate button]
─────── SEO ───────
Meta Title:     [text, 60 char limit]
Meta Desc:      [textarea, 160 char limit]
Canonical URL:  [text]
OG Image:       [media selector]
───────────────────
[🤖 Open AI Assistant]
[Save as Draft]   [Publish Now ▾ Schedule]
```

### 10.6 Media Library (`app/(admin)/media/page.tsx`)
- Upload zone: drag-and-drop or file picker (top of page)
- Filter tabs: [All] [Images] [Audio]
- Search by filename
- Responsive grid: 2 cols mobile → 4 cols desktop
- Each tile: thumbnail/audio icon, filename (truncated), file size, date
- Click → preview modal:
  - Full image or audio player
  - Filename, size, dimensions (for images), upload date, alt text (editable)
  - [Copy URL] [Insert into Editor] [Delete]
- Delete with `<ConfirmDialog />`

### 10.7 Settings (`app/(admin)/settings/page.tsx`)
Tabbed interface:

**Tab 1 — General:**
- Site Name, Tagline
- Logo upload, Favicon upload
- Footer text, Copyright text

**Tab 2 — Social & SEO:**
- Twitter URL, LinkedIn URL, YouTube URL
- Default OG Image
- Google Analytics ID (placeholder)

**Tab 3 — AI Configuration:**
- OpenAI API Key (masked input, 👁 show/hide toggle)
- Text Model (text input, default: `gpt-4o`)
- Image Model (text input, default: `dall-e-3`)
- Audio Model (text input, default: `tts-1`)
- Temperature (slider 0.0→2.0, step 0.1, shows value)
- Max Tokens (number input)
- Default TTS Voice (dropdown: alloy, echo, fable, onyx, nova, shimmer)
- Image Size (dropdown: 1024×1024, 1792×1024, 1024×1792)
- Image Quality (dropdown: standard, HD)
- [🧪 Test OpenAI Connection] button → calls `/api/ai/test`, shows success/error toast

**Tab 4 — Admin Account:**
- Change name, email, password (with current password confirmation)

---

## 11. THREE.JS 3D LOADER (`components/shared/Loader3D.tsx`)

```typescript
// Full-screen overlay Three.js loader, shows once per session

// Requirements:
// 1. On mount, check sessionStorage key "aa_loader_seen"
// 2. If not seen: render full-screen canvas overlay (bg: var(--bg-base))
// 3. Three.js scene: animated neural network node graph
//    - ~80 glowing nodes (THREE.SphereGeometry, radius 0.15)
//    - Random positions within [-10, 10] bounding box
//    - Lines connecting nearby nodes (THREE.Line, distance threshold 4)
//    - Node color: electric violet (#6C3DFF) with slight random variation
//    - Line color: cyan (#00D4FF) at 30% opacity
//    - Slow rotation: scene.rotation.y += 0.002 per frame
//    - Nodes pulse in size using Math.sin(time) * 0.03
//    - Use THREE.Points for efficiency if nodes > 100
// 4. After 2.5 seconds: fade out overlay (CSS opacity 1→0, transition 0.5s)
// 5. On fade complete: remove from DOM, set sessionStorage key
// 6. While loading: show "Applied Agentic AI" text + animated dots below canvas
```

---

## 12. ANIMATIONS SPECIFICATION

### Framer Motion Scroll Animations (`components/public/ScrollAnimations.tsx`)
```typescript
// Reusable wrapper: <FadeIn>, <SlideInLeft>, <SlideInRight>, <ScaleIn>
// All use whileInView + viewport: { once: true, margin: "-100px" }

// FadeIn: y: 40→0, opacity: 0→1, duration: 0.6
// SlideInLeft: x: -60→0, opacity: 0→1, duration: 0.6  
// SlideInRight: x: 60→0, opacity: 0→1, duration: 0.6
// ScaleIn: scale: 0.92→1, opacity: 0→1, duration: 0.5
// Stagger children: staggerChildren: 0.1 on parent motion.div
```

### Navbar Scroll Behavior
```typescript
// On scroll > 50px: add class "scrolled" 
// .scrolled: bg-surface/80 backdrop-blur-xl border-b border-border shadow-lg
// Transition: all 0.3s ease
// Active link: animated underline using Framer Motion layoutId="nav-underline"
// Mobile: hamburger → full-screen slide-down menu, staggered link entrance
```

### Article Card Hover
```typescript
// whileHover: { y: -8, scale: 1.02 }
// CSS: box-shadow intensifies (module color glow)
// transition: { type: "spring", stiffness: 400, damping: 25 }
```

### Module Card 3D Tilt
```typescript
// On mousemove: calculate tilt angle from cursor position
// Apply CSS transform: perspective(1000px) rotateX(Xdeg) rotateY(Ydeg)
// Max tilt: ±8 degrees
// Reset on mouseleave with transition: 0.3s ease
// Also: color gradient glow border animates in on hover
```

### Page Transitions
```typescript
// AnimatePresence in root layout
// Route change: opacity 0→1 over 0.3s crossfade
// Article hero image: scale 1.05→1.0 on mount (0.8s)
```

---

## 13. INFORMATION ARCHITECTURE — CONTENT MODEL

The course is called: **"Applied Agentic AI for Organizational Transformation"**

**Content Hierarchy:**
```
Course
└── Module 1..8
    └── Topic 1..N (each topic belongs to exactly ONE module)
        └── Article 1..N (each article belongs to ONE OR MORE topics via TopicArticle join)
```

**URL Structure:**
- `/modules` — all modules
- `/modules/[moduleSlug]` — module detail with topics
- `/topics/[topicSlug]` — topic with articles list
- `/articles` — all articles with filters
- `/articles/[articleSlug]` — article reader

---

## 14. SEED DATA (`prisma/seed.ts`)

Generate a complete seed file with:

### Admin User
```typescript
// DEVELOPMENT ONLY — change credentials before production
{
  email: "admin@appliedagentic.com",
  passwordHash: bcrypt.hashSync("Admin@123", 10),
  name: "Admin User",
  role: "ADMIN"
}
```

### 8 Modules with Topics

**Module 1 – Foundations of Generative and Agentic AI** (`slug: module-1-foundations`)
Topics:
1. Generative AI Fundamentals
2. AI Chatbots: Past, Present, and Future
3. Cost-Optimized Models and Performance Trade-Offs
4. Exploring Multimedia and Language Interaction Models
5. Advanced Applications of Generative AI Tools

**Module 2 – The Rise of Agentic AI and Emerging Platforms** (`slug: module-2-rise-agentic`)
Topics:
1. Emerging Agentic Platforms
2. Vibe Living
3. Single vs. Multi-Agent Architectures
4. Open-Source vs. Closed-Source AI Systems

**Module 3 – Connecting Agents to Digital Ecosystems** (`slug: module-3-connecting-agents`)
Topics:
1. Building Agents into Existing Workflows
2. Integrating Generative and Agentic AI with Existing Systems: Challenges and Solutions
3. Spotify MCP and Other Edge-cases of Agent Integration
4. Empathy and Response-Tuning for Customer-Facing Agents

**Module 4 – Agent Risks, Disinformation, and Systemic Impact** (`slug: module-4-agent-risks`)
Topics:
1. Classic and Current Cybersecurity Risks
2. Cybersecurity for Agent Ecosystems
3. Limitations of Agent Perception and Error Correction

**Module 5 – AI Agents by Business Function** (`slug: module-5-business-function`)
Topics:
1. The Maturity Cycle of Agentic Implementation (Crawl–Walk–Run)
2. Advantages of Agentic AI for the Product Development Cycle
3. Functional Deployments: HR Bots, Finance Advisors, IT Copilots
4. Agent Architecture in the Enterprise: Centralized vs. Embedded

**Module 6 – The Last Mile – From Pilot to Practice** (`slug: module-6-last-mile`)
Topics:
1. Voice Agents: Synthesis, Phone Systems, Real-time Applications
2. Last-mile Integration: Why Pilots Succeed but Deployments Stall
3. Internal Resistance and Change Management
4. Monitoring Agent Performance (Metrics, KPIs, Feedback Loops)

**Module 7 – Governance, Compliance, and Agent Testing** (`slug: module-7-governance`)
Topics:
1. Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules
2. Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks
3. Agent Speed vs. Oversight: Where to Insert Guardrails
4. Documentation and Compliance Readiness

**Module 8 – Strategy Capstone – Leading the Agentic Future** (`slug: module-8-strategy-capstone`)
Topics:
1. Strategic Roadmap Development (Short-, Medium-, Long-Term)
2. Team Structure, Vendor Choice, and Internal Capability Building
3. Organizational Culture and Leadership for Agent Adoption
4. Summary of Technical Enablers and Business Opportunities
5. Maturity Assessment of Agent Strategy – Change Management

### Seed Script Config
```json
// package.json
"prisma": {
  "seed": "ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts"
}
```

---

## 15. PERFORMANCE, SEO & ACCESSIBILITY

### SEO
- Every public page uses `generateMetadata()` with:
  ```typescript
  title, description, openGraph: { title, description, images, url, type }
  twitter: { card: 'summary_large_image', ... }
  alternates: { canonical: seoCanonicalUrl }
  ```
- `app/sitemap.ts` — dynamic sitemap with all published articles, modules, topics
- `app/robots.ts` — allow all public, disallow /admin, /api

### Performance
- `next.config.ts`: `output: 'standalone'` for PM2 deployment
- Next.js `<Image />` for all images (automatic optimization, lazy loading)
- ISR on article pages: `revalidate = 300`
- ISR on module/topic pages: `revalidate = 3600`
- Route-based code splitting (automatic with App Router)
- Heavy components (Three.js Loader, Chart components) lazy-loaded with `dynamic()`

### Accessibility
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<aside>`, `<header>`, `<footer>`
- ARIA labels on all icon buttons
- All images require `alt` text (enforced in admin upload form)
- Keyboard navigable: all interactive elements reachable via Tab
- Focus indicators visible (not hidden with `outline: none`)
- Color contrast: minimum WCAG AA (4.5:1 for text)

---

## 16. SECURITY

- All `/admin` routes protected by NextAuth middleware
- CSRF: Next.js Server Actions have built-in CSRF protection; for API routes use same-origin check
- Passwords: bcryptjs with `saltRounds = 12`
- API key: read ONLY from server-side env; never passed to client
- Uploaded files: validate MIME type (magic bytes check), restrict extensions
- HTML content from TipTap: sanitize with `DOMPurify` server-side before saving
- `createdBy` / `updatedBy` audit fields tracked on Article, Topic, Module

---

## 17. HOSTINGER VPS DEPLOYMENT

### Setup Steps
```bash
# 1. VPS: Ubuntu 22.04, Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2 pnpm

# 2. MySQL 8 setup
sudo apt install mysql-server
sudo mysql_secure_installation
# Create DB: CREATE DATABASE appliedagentic; CREATE USER ...

# 3. Nginx reverse proxy
sudo apt install nginx
# Config: proxy_pass http://localhost:3000 with SSL (Let's Encrypt)

# 4. Clone and setup
git clone your-repo /var/www/appliedagentic
cd /var/www/appliedagentic
pnpm install
cp .env.example .env.local  # Fill in real values

# 5. Build and migrate
pnpm build
npx prisma migrate deploy
npx prisma db seed

# 6. Start with PM2
pm2 start npm --name "appliedagentic" -- start
pm2 save
pm2 startup
```

### `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'appliedagentic.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
}
export default config
```

### Nginx Config (`/etc/nginx/sites-available/appliedagentic`)
```nginx
server {
  listen 80;
  server_name appliedagentic.com www.appliedagentic.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name appliedagentic.com www.appliedagentic.com;

  ssl_certificate /etc/letsencrypt/live/appliedagentic.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/appliedagentic.com/privkey.pem;

  client_max_body_size 10M;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
  }

  location /_next/static/ {
    alias /var/www/appliedagentic/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location /public/uploads/ {
    alias /var/www/appliedagentic/public/uploads/;
    expires 30d;
  }
}
```

---

## 18. PACKAGE.JSON — DEPENDENCIES

```json
{
  "name": "appliedagentic",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "@prisma/client": "^5.14.0",
    "prisma": "^5.14.0",
    "next-auth": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "openai": "^4.52.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.13",
    "framer-motion": "^11.2.0",
    "three": "^0.166.0",
    "@tiptap/react": "^2.4.0",
    "@tiptap/starter-kit": "^2.4.0",
    "@tiptap/extension-underline": "^2.4.0",
    "@tiptap/extension-text-align": "^2.4.0",
    "@tiptap/extension-text-style": "^2.4.0",
    "@tiptap/extension-color": "^2.4.0",
    "@tiptap/extension-highlight": "^2.4.0",
    "@tiptap/extension-task-list": "^2.4.0",
    "@tiptap/extension-task-item": "^2.4.0",
    "@tiptap/extension-table": "^2.4.0",
    "@tiptap/extension-table-row": "^2.4.0",
    "@tiptap/extension-table-cell": "^2.4.0",
    "@tiptap/extension-table-header": "^2.4.0",
    "@tiptap/extension-image": "^2.4.0",
    "@tiptap/extension-link": "^2.4.0",
    "@tiptap/extension-code-block-lowlight": "^2.4.0",
    "@tiptap/extension-placeholder": "^2.4.0",
    "@tiptap/extension-character-count": "^2.4.0",
    "@tiptap/extension-youtube": "^2.4.0",
    "@tiptap/extension-subscript": "^2.4.0",
    "@tiptap/extension-superscript": "^2.4.0",
    "@tiptap/extension-horizontal-rule": "^2.4.0",
    "lowlight": "^3.1.0",
    "highlight.js": "^11.9.0",
    "recharts": "^2.12.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "dompurify": "^3.1.0",
    "sharp": "^0.33.4",
    "multer": "^1.4.5",
    "nanoid": "^5.0.0",
    "date-fns": "^3.6.0",
    "zod": "^3.23.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/node": "^20.14.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/three": "^0.166.0",
    "@types/multer": "^1.4.11",
    "@types/dompurify": "^3.0.5",
    "ts-node": "^10.9.2",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 19. README.md

Generate a complete `README.md` with:

```markdown
# Applied Agentic AI — Website

A production-ready content publishing platform for AI/Agentic AI education.

## Prerequisites
- Node.js 20+
- MySQL 8+
- pnpm (`npm install -g pnpm`)

## Local Setup

\`\`\`bash
git clone <repo-url>
cd appliedagentic
pnpm install
cp .env.example .env.local
# Edit .env.local with your DB credentials and OpenAI API key
npx prisma migrate dev --name init
npx prisma db seed
pnpm dev
\`\`\`

Open: http://localhost:3000
Admin: http://localhost:3000/login
Default credentials (DEV ONLY): admin@appliedagentic.com / Admin@123

## Environment Variables
[full table of all env vars with descriptions]

## Deployment to Hostinger VPS
[step-by-step guide from Section 17]

## Build Commands
- Build: \`pnpm build\`
- Start: \`pm2 start npm --name "appliedagentic" -- start\`
- DB Migrate: \`npx prisma migrate deploy\`
- DB Seed: \`npx prisma db seed\`
```

---

## 20. GITHUB COPILOT — GENERATION ORDER

For best results with GitHub Copilot, generate files in this order:

1. `prisma/schema.prisma` — full schema as defined above
2. `npx prisma migrate dev --name init` — run migration
3. `lib/prisma.ts` — singleton client
4. `lib/auth.ts` — NextAuth config
5. `lib/openai.ts` — OpenAI wrapper
6. `lib/storage.ts` — file storage abstraction
7. `lib/slugify.ts`, `lib/readingTime.ts`, `lib/utils.ts`
8. `middleware.ts` — route protection
9. `types/index.ts` — shared types
10. `styles/globals.css` — CSS variables + design tokens
11. `tailwind.config.ts` — full Tailwind config
12. `app/layout.tsx` — root layout with ThemeProvider + fonts
13. **Shared components:** `Loader3D.tsx`, `ThemeProvider.tsx`, `ToastNotifier.tsx`, `ConfirmDialog.tsx`
14. **API routes (all):** auth, modules, topics, articles, media, ai/*, settings, search
15. **Admin components:** Sidebar, AdminHeader, DashboardStats, ArticleEditor (TipTap), AIAssistPanel, MediaGrid, all forms
16. **Admin pages:** layout, dashboard, modules/, topics/, articles/, media/, settings/
17. **Public components:** Navbar, Footer, HeroSection, ModuleCard, TopicCard, ArticleCard, ArticleContent, ArticleAudioPlayer, TableOfContents, ReadingProgressBar, ScrollAnimations
18. **Public pages:** layout, /, /modules, /modules/[moduleSlug], /topics/[topicSlug], /articles, /articles/[articleSlug], /search
19. `app/sitemap.ts`, `app/robots.ts`
20. `prisma/seed.ts` — full seed with admin user + all 8 modules + all topics
21. `next.config.ts`, `.env.example`, `README.md`

---

## 21. CODING STANDARDS & CONVENTIONS

- **TypeScript:** strict mode, no `any` types — use proper interfaces from `types/index.ts`
- **Imports:** use path aliases (`@/lib/...`, `@/components/...`, `@/types`)
- **Server vs Client:** mark client components with `'use client'` — default to Server Components
- **Server Actions:** use for form mutations (create/update/delete) where appropriate
- **Error handling:** all API routes return consistent `{ success, data?, error? }` JSON
- **Zod validation:** validate all API request bodies with Zod schemas
- **Naming:** PascalCase for components, camelCase for functions/vars, UPPER_SNAKE for env vars
- **Comments:** JSDoc for exported functions, inline for non-obvious logic
- **No hardcoded values:** all config through env vars or DB settings

---

*End of Master Specification — Applied Agentic AI v2.0*
*Consolidated from: AppliedAgentic_Build_Prompt.md + AppliedAgentic_Website_Prompt.md + Project-Overview-and-Architecture.pdf + original requirements*
