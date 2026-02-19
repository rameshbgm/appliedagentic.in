# AppliedAgentic — Full-Stack Website Build Prompt
## Granular Developer Specification

---

## 🧭 PROJECT OVERVIEW

Build a **production-ready, full-stack content publishing platform** called **AppliedAgentic** — a modern AI-focused editorial website and knowledge hub. The platform must support complete CMS-level content management through a secure admin panel, AI-assisted content creation, rich WYSIWYG editing, and a visually stunning public-facing experience inspired by sites like **bytebytego.com**.

---

## 🛠️ TECH STACK

| Layer | Technology |
|---|---|
| Frontend Framework | **Next.js 14+** (App Router, Server Components) |
| Styling | **Tailwind CSS** + **Framer Motion** (animations) |
| Database | **MySQL** via **Prisma ORM** |
| Auth | **NextAuth.js** (admin-only credentials provider) |
| Rich Text Editor | **TipTap** (extensible WYSIWYG, headless) |
| AI Integration | **OpenAI SDK** (text, image, audio generation) |
| File/Image Storage | **Local disk** or **Cloudinary** (configurable) |
| Hosting | **Hostinger VPS** (Node.js + MySQL environment) |
| Package Manager | **pnpm** |
| Language | **TypeScript** throughout |

---

## 📁 PROJECT STRUCTURE

```
appliedagentic/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Homepage
│   │   ├── [topic]/
│   │   │   ├── page.tsx                # Topic listing page
│   │   │   └── [article]/
│   │   │       └── page.tsx            # Article detail page
│   │   ├── search/page.tsx             # Search results
│   │   └── layout.tsx                  # Public layout
│   ├── (admin)/
│   │   ├── login/page.tsx              # Admin login
│   │   ├── dashboard/page.tsx          # Admin dashboard
│   │   ├── topics/
│   │   │   ├── page.tsx                # Topic management list
│   │   │   ├── new/page.tsx            # Create topic
│   │   │   └── [id]/edit/page.tsx      # Edit topic
│   │   ├── articles/
│   │   │   ├── page.tsx                # Articles list with filter
│   │   │   ├── new/page.tsx            # Create article (WYSIWYG)
│   │   │   └── [id]/edit/page.tsx      # Edit article
│   │   ├── media/page.tsx              # Media library
│   │   ├── settings/page.tsx           # Global site settings, AI config
│   │   └── layout.tsx                  # Admin layout with sidebar
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── topics/route.ts
│       ├── topics/[id]/route.ts
│       ├── articles/route.ts
│       ├── articles/[id]/route.ts
│       ├── articles/[id]/publish/route.ts
│       ├── media/upload/route.ts
│       ├── ai/generate-text/route.ts
│       ├── ai/generate-image/route.ts
│       └── ai/generate-audio/route.ts
├── components/
│   ├── public/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── TopicCard.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleContent.tsx          # Rendered article HTML
│   │   ├── DynamicMenu.tsx             # Animated nav with topics
│   │   └── ScrollAnimations.tsx
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── ArticleEditor/
│   │   │   ├── index.tsx               # TipTap WYSIWYG wrapper
│   │   │   ├── Toolbar.tsx             # Formatting toolbar
│   │   │   ├── ImageUploadModal.tsx
│   │   │   ├── EmbedModal.tsx
│   │   │   ├── LinkModal.tsx
│   │   │   └── AIAssistPanel.tsx       # Floating AI sidebar
│   │   ├── MediaLibrary.tsx
│   │   └── StatsCard.tsx
│   └── ui/                             # Shared design system components
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── openai.ts                       # OpenAI SDK wrapper
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── fonts/
│   └── images/
├── .env.local                          # Environment config (see below)
└── next.config.ts
```

---

## 🗄️ DATABASE SCHEMA (MySQL via Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  articles  Article[]
}

model Topic {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  description String?   @db.Text
  icon        String?   // emoji or icon name
  color       String?   // hex color for theming
  coverImage  String?
  order       Int       @default(0)
  isVisible   Boolean   @default(true)
  moduleLabel String?   // e.g. "Module 1"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  articles    Article[]
}

model Article {
  id              Int       @id @default(autoincrement())
  title           String
  slug            String    @unique
  excerpt         String?   @db.Text
  content         String    @db.LongText  // HTML from TipTap
  coverImage      String?
  audioUrl        String?   // AI generated audio
  status          String    @default("draft")  // draft | published | archived
  isFeatured      Boolean   @default(false)
  readingTimeMin  Int?
  metaTitle       String?
  metaDescription String?   @db.Text
  tags            String?   // comma-separated
  topicId         Int
  authorId        Int
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  topic           Topic     @relation(fields: [topicId], references: [id])
  author          User      @relation(fields: [authorId], references: [id])
}

model Media {
  id        Int      @id @default(autoincrement())
  filename  String
  url       String
  mimeType  String
  size      Int
  altText   String?
  createdAt DateTime @default(now())
}

model SiteSettings {
  id              Int     @id @default(autoincrement())
  key             String  @unique
  value           String  @db.Text
}
// Settings keys: site_name, site_tagline, logo_url, favicon_url,
// footer_text, social_twitter, social_linkedin, social_youtube,
// og_image, analytics_id, openai_api_key, openai_text_model,
// openai_image_model, openai_audio_model, openai_temperature,
// openai_max_tokens, openai_tts_voice
```

---

## 🔐 AUTHENTICATION

- Use **NextAuth.js** with **Credentials Provider** only
- Admin login via email + bcrypt password
- Session stored as JWT (HTTP-only cookie)
- All `/admin/*` routes protected via Next.js middleware
- Redirect unauthenticated users to `/admin/login`
- No public registration — admin account created via seed script

```ts
// lib/auth.ts — NextAuth config
// providers: [CredentialsProvider] only
// bcrypt.compare for password verification
// JWT strategy, 8-hour session
```

---

## ✏️ WYSIWYG ARTICLE EDITOR (TipTap)

### Core Features Required:
- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Code inline, Subscript, Superscript
- **Headings**: H1 through H4 with visual hierarchy
- **Paragraph Styles**: Lead paragraph, quote block, callout box
- **Lists**: Ordered, Unordered, Task list (checkboxes)
- **Code Blocks**: Syntax highlighted with language selector (using `lowlight`)
- **Tables**: Insert, resize, add/remove rows and columns
- **Images**: Upload from device, paste from clipboard, set alt text, caption, align left/center/right, resize
- **Links**: Insert, edit, remove hyperlinks; option for "open in new tab"
- **Embeds**: YouTube, Twitter/X, Loom, CodeSandbox embed via iframe (enter URL → auto-embed)
- **Dividers**: Horizontal rule
- **HTML Mode**: Toggle to raw HTML view and back
- **Font Selection**: At minimum 3 font families selectable per block
- **Text Color & Highlight**: Full color picker
- **Alignment**: Left, Center, Right, Justify
- **Undo/Redo**: Full history stack

### Toolbar Layout:
```
[Heading ▾] [Bold] [Italic] [Underline] [Strike] | [Link] [Image] [Embed] 
[List] [OrderedList] [Task] | [Code] [CodeBlock] [Quote] | [Table] [HR]
[AlignLeft] [AlignCenter] [AlignRight] | [FontColor] [Highlight] 
[HTML] [Undo] [Redo] | [🤖 AI Assist ▾]
```

---

## 🤖 AI INTEGRATION (OpenAI SDK)

### AI Assist Panel (Floating Sidebar in Editor)
Triggered by toolbar button or keyboard shortcut `Ctrl+Shift+A`.

#### 1. AI Text Generation
```
Input: [Prompt textarea]
Options:
  - Tone: [Professional | Conversational | Technical | Inspirational]
  - Length: [Short (100w) | Medium (300w) | Long (600w)]
  - Mode: [Generate from scratch | Expand selected text | Summarize | Rewrite | Fix grammar]
Output: Preview in panel → [Insert at cursor] or [Replace selection]
```

#### 2. AI Image Generation (DALL·E)
```
Input: [Image description textarea]
Options:
  - Size: [1024x1024 | 1792x1024 | 1024x1792]
  - Style: [Vivid | Natural]
  - Quality: [Standard | HD]
Output: Generated image preview → [Insert into article] or [Save to Media Library]
```

#### 3. AI Audio Generation (TTS)
```
Input: [Select text from article OR type custom text]
Options:
  - Voice: [alloy | echo | fable | onyx | nova | shimmer]
  - Speed: [0.5x – 2.0x slider]
Output: Audio player preview → [Attach to Article] (stored as audioUrl on article)
```

### API Routes for AI:
```ts
// POST /api/ai/generate-text
// Body: { prompt, mode, tone, length, selectedText? }
// Uses: openai.chat.completions.create(...)

// POST /api/ai/generate-image  
// Body: { prompt, size, style, quality }
// Uses: openai.images.generate(...)
// Returns: base64 or URL; saves to /public/uploads/ai/

// POST /api/ai/generate-audio
// Body: { text, voice, speed }
// Uses: openai.audio.speech.create(...)
// Returns: audio file URL saved to /public/uploads/audio/
```

### Configuration (from SiteSettings or .env):
```env
# .env.local — all AI config with placeholders
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_TEXT_MODEL=gpt-4o              # placeholder — configurable in admin
OPENAI_IMAGE_MODEL=dall-e-3           # placeholder
OPENAI_AUDIO_MODEL=tts-1              # placeholder
OPENAI_TEMPERATURE=0.7                # placeholder
OPENAI_MAX_TOKENS=2000                # placeholder
OPENAI_TTS_VOICE=nova                 # placeholder
```

All AI configuration values must also be editable via the **Admin → Settings → AI Configuration** panel (persisted to `SiteSettings` table), so no redeploy is needed to change model or API key.

---

## 🌐 PUBLIC WEBSITE DESIGN

### Design Direction
- **Inspiration**: bytebytego.com — clean, editorial, premium tech feel
- **Aesthetic**: Dark mode default with light mode toggle; deep navy/charcoal backgrounds, electric blue and purple accents, white text
- **Feel**: Modern SaaS + editorial journalism hybrid

### Typography
- **Headings**: `Inter` or `Cal Sans` — bold, clean, geometric
- **Body**: `Lora` or `Source Serif 4` — readable serif for long-form reading
- **Code**: `JetBrains Mono`
- Font sizes: Fluid/responsive using `clamp()`

### Animations & Motion
Use **Framer Motion** throughout:

1. **Page Load**: 3D card flip or particle dissolve intro animation (CSS/Three.js lightweight loader — 1.5s max)
2. **Scroll Animations**: 
   - Sections fade-up + slight Y-translate as they enter viewport
   - Article cards scale from 0.95 → 1.0 on appear
   - Topic modules slide in from alternating sides
3. **Hero**: Animated gradient background (shifting purple → blue → teal mesh gradient)
4. **Navbar**: Glass morphism effect; shrinks + adds backdrop blur on scroll
5. **Hover Effects**: Cards lift with box-shadow + subtle 3D tilt (CSS `perspective` + `rotateX/Y` on mousemove)
6. **Topic Color Stripes**: Each module/topic has a unique color accent that appears as animated left border on hover
7. **Reading Progress**: Thin colored progress bar at top of article pages

### Homepage Sections (in order):
```
1. Hero Section
   - Animated tagline: "Master Agentic AI — From Foundations to Enterprise Strategy"
   - Subheadline + CTA buttons: [Explore Topics] [Latest Articles]
   - Animated background: floating neural network nodes or gradient mesh

2. Featured Article (full-width card, latest featured article)

3. Topics Grid ("Explore by Module")
   - 8 module cards in responsive grid (2 cols mobile, 4 cols desktop)
   - Each card: colored icon, module label, title, article count, hover animation

4. Latest Articles Feed
   - 6 article cards in masonry or 3-col grid
   - Card: cover image, topic tag, title, excerpt, read time, date

5. Newsletter/Subscribe Section
   - Simple email capture (stored in DB or integrated with ConvertKit placeholder)

6. Footer
   - Logo, tagline, nav links, social icons, copyright
```

### Topic Page (`/[topic]`):
```
- Hero with topic title, description, color accent, article count
- Filter bar: [All | Published | Sort by Date/Title]
- Articles grid — all articles under this topic
- Breadcrumb: Home > Topic Name
```

### Article Page (`/[topic]/[article]`):
```
- Full-width cover image with parallax
- Breadcrumb navigation
- Article metadata: author, date, reading time, topic tag
- AI audio player (if audioUrl exists) — sticky mini player
- Rendered article HTML with beautiful typography
- Table of Contents (auto-generated from headings, sticky sidebar on desktop)
- Related Articles section (same topic)
- Share buttons: Twitter/X, LinkedIn, Copy link
```

### Dynamic Navigation Menu:
```
- Desktop: Horizontal top nav with mega-menu dropdown
  - "Topics" dropdown reveals all 8 modules in a grid with icons and descriptions
- Mobile: Hamburger → full-screen animated slide-in menu
  - Accordion for each module showing its articles
- Active topic highlighted with color accent
- Smooth open/close animations
```

---

## 🖥️ ADMIN PANEL DESIGN

### Layout:
```
Left Sidebar (260px, dark theme):
  - Logo + site name at top
  - Navigation:
    [🏠 Dashboard]
    [📚 Topics]
    [📝 Articles]  
    [🖼️ Media Library]
    [⚙️ Settings]
    [🤖 AI Config]
  - User avatar + name at bottom
  - Collapse sidebar button

Top Header:
  - Page title (breadcrumb)
  - [+ New Article] quick action button
  - Notification bell
  - Dark/light mode toggle

Main Content Area:
  - White/dark card-based layout
  - Full responsive down to tablet
```

### Dashboard Page:
```
Stats Row (4 cards):
  [Total Articles] [Published] [Topics] [Media Files]

Charts Row:
  [Articles Published per Month — line chart]
  [Articles by Topic — donut chart]

Recent Articles table (last 10):
  Title | Topic | Status | Date | Actions

Quick Actions:
  [Write New Article] [Add Topic] [Upload Media]
```

### Topics Management:
```
List View:
  - Table: Order | Color | Icon | Module Label | Title | Articles Count | Visible | Actions
  - Drag-and-drop reordering (react-beautiful-dnd)
  - Toggle visibility inline
  - Edit / Delete buttons

Create/Edit Topic Form:
  - Title (text)
  - Slug (auto-generated, editable)
  - Module Label (e.g. "Module 1")
  - Description (short textarea)
  - Icon (emoji picker or icon selector)
  - Color picker (for card accent)
  - Cover image upload
  - Display Order (number)
  - Is Visible toggle
  - [Save Draft] [Save & Publish]
```

### Articles Management:
```
List View:
  - Filters: [All Topics ▾] [All Statuses ▾] [Search...]
  - Table: Cover | Title | Topic | Author | Status | Date | Featured | Actions
  - Bulk actions: Publish / Unpublish / Delete selected
  - Status badges: Draft (gray), Published (green), Archived (orange)
  - Inline featured toggle

Create/Edit Article Page (full-screen editor layout):
  ┌─────────────────────────────────────────────────────────┐
  │ [← Back]    Article Title Input (large)    [Save Draft] [Publish ▾] │
  ├───────────────────────────┬─────────────────────────────┤
  │                           │  METADATA SIDEBAR           │
  │   TIPTAP EDITOR           │  ─────────────────          │
  │   (full height,           │  Topic: [dropdown]          │
  │    scrollable)            │  Status: [dropdown]         │
  │                           │  Slug: [editable]           │
  │                           │  Excerpt: [textarea]        │
  │                           │  Cover Image: [upload btn]  │
  │                           │  Tags: [tag input]          │
  │                           │  Featured: [toggle]         │
  │                           │  Meta Title: [text]         │
  │                           │  Meta Desc: [textarea]      │
  │                           │  Publish Date: [datetime]   │
  │                           │  ─────────────────          │
  │                           │  [🤖 Open AI Assist]        │
  └───────────────────────────┴─────────────────────────────┘
```

### Media Library:
```
- Grid view of all uploaded images/files
- Upload button: drag-and-drop zone or file picker
- Filter by type: [Images | Audio | All]
- Search by filename
- Click image → preview modal with copy URL button
- Delete with confirmation
- Display: filename, size, upload date, preview thumbnail
```

### Settings Page (tabs):
```
Tab 1: General
  - Site Name, Tagline, Logo upload, Favicon upload
  - Footer text, Copyright text

Tab 2: Social & SEO
  - Twitter URL, LinkedIn URL, YouTube URL
  - Default OG Image upload
  - Google Analytics ID (placeholder)

Tab 3: AI Configuration
  - OpenAI API Key (masked input, show/hide toggle)
  - Text Model (text input, default: gpt-4o)
  - Image Model (text input, default: dall-e-3)
  - Audio Model (text input, default: tts-1)
  - Temperature (slider 0.0 → 2.0, step 0.1)
  - Max Tokens (number input)
  - Default TTS Voice (dropdown: alloy, echo, fable, onyx, nova, shimmer)
  - [Test Connection] button → calls /api/ai/test

Tab 4: Admin Account
  - Change name, email, password
```

---

## 📱 MOBILE-FIRST RESPONSIVE BREAKPOINTS

All components must be designed mobile-first using Tailwind CSS:

```
Mobile:     < 640px   (base styles)
Tablet:     640px–1024px  (sm: / md:)
Desktop:    1024px+   (lg: / xl:)
Wide:       1280px+   (2xl:)
```

Specific mobile behaviors:
- Navbar: hamburger menu, full-screen overlay with animated backdrop
- Editor: full-width single column, metadata panel collapses to accordion below editor
- Admin sidebar: hidden by default, slides in on toggle
- Article cards: single column on mobile, 2 cols tablet, 3 cols desktop
- Topic grid: 1 col mobile, 2 cols tablet, 4 cols desktop
- AI Assist panel: bottom drawer on mobile (slides up), sidebar on desktop
- All touch targets minimum 44×44px
- Font sizes increase appropriately on small screens

---

## 🌐 PRE-SEEDED CONTENT STRUCTURE

Seed the following Topics into the database at setup:

```
Module 1: Foundations of Generative and Agentic AI
  Articles: Generative AI Fundamentals | AI Chatbots: Past, Present, and Future |
  Cost-Optimized Models and Performance Trade-Offs | Exploring Multimedia and Language 
  Interaction Models | Advanced Applications of Generative AI Tools

Module 2: The Rise of Agentic AI and Emerging Platforms
  Articles: Emerging Agentic Platforms | Vibe Living | 
  Single vs. Multi-Agent Architectures | Open-Source vs. Closed-Source AI Systems

Module 3: Connecting Agents to Digital Ecosystems
  Articles: Building Agents into Existing Workflows | Integrating Generative and Agentic AI
  with Existing Systems | Spotify MCP and Other Edge-cases of Agent Integration |
  Empathy and Response-Tuning for Customer-Facing Agents

Module 4: Agent Risks, Disinformation, and Systemic Impact
  Articles: Classic and Current Cybersecurity Risks | Cybersecurity for Agent Ecosystems |
  Limitations of Agent Perception and Error Correction

Module 5: AI Agents by Business Function
  Articles: The Maturity Cycle of Agentic Implementation | Advantages of Agentic AI 
  for Product Development | Functional Deployments: HR Bots, Finance Advisors and IT Copilots |
  Agent Architecture in the Enterprise

Module 6: The Last Mile – From Pilot to Practice
  Articles: Voice Agents: Synthesis, Phone Systems, and Real-time Applications |
  Last-mile Integration: Why Pilots Succeed but Deployments Stall |
  Internal Resistance and Change Management |
  Monitoring Agent Performance (Metrics, KPIs, Feedback Loops)

Module 7: Governance, Compliance, and Agent Testing
  Articles: Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules |
  Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks |
  Agent Speed vs. Oversight: Where to Insert Guardrails |
  Documentation and Compliance Readiness

Module 8: Strategy Capstone – Leading the Agentic Future
  Articles: Strategic Roadmap Development | Team Structure, Vendor Choice, 
  and Internal Capability Building | Organizational Culture and Leadership for Agent Adoption |
  Summary of Technical Enablers and Business Opportunities |
  Maturity Assessment of Agent Strategy – Change Management
```

All seeded articles should be in `draft` status with placeholder content.

---

## ⚙️ ENVIRONMENT VARIABLES (.env.local)

```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/appliedagentic

# Auth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://yourdomain.com

# OpenAI — all configurable from admin panel
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_TEXT_MODEL=gpt-4o
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_AUDIO_MODEL=tts-1
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
OPENAI_TTS_VOICE=nova

# File Storage
UPLOAD_DIR=./public/uploads
MAX_UPLOAD_SIZE_MB=10

# App
NEXT_PUBLIC_SITE_URL=https://appliedagentic.com
NEXT_PUBLIC_SITE_NAME=AppliedAgentic
```

---

## 🚀 HOSTINGER DEPLOYMENT CHECKLIST

1. **VPS Setup**: Node.js 20+, MySQL 8+, PM2, Nginx
2. **Nginx Config**: Reverse proxy port 3000 → domain, enable SSL (Let's Encrypt)
3. **Build Command**: `pnpm build`
4. **Start Command**: `pm2 start npm --name "appliedagentic" -- start`
5. **DB Migration**: `npx prisma migrate deploy && npx prisma db seed`
6. **Env File**: Upload `.env.local` with production values
7. **Upload Directory**: Set correct permissions on `/public/uploads/`
8. **next.config.ts**: Configure `output: 'standalone'` for PM2 compatibility
9. **Caching**: Enable ISR (Incremental Static Regeneration) for public article pages — revalidate every 60 seconds

---

## 🎨 COLOR PALETTE & DESIGN TOKENS

```css
/* Primary Palette */
--color-bg-dark:      #0A0E1A   /* Deep navy background */
--color-bg-card:      #111827   /* Card background */
--color-bg-sidebar:   #0D1117   /* Admin sidebar */
--color-accent-blue:  #3B82F6   /* Primary CTA, links */
--color-accent-purple:#8B5CF6   /* Secondary accent */
--color-accent-teal:  #14B8A6   /* Module 3 color, tags */
--color-text-primary: #F9FAFB   /* Main text */
--color-text-muted:   #9CA3AF   /* Secondary text */
--color-border:       #1F2937   /* Dividers */

/* Module Color System (one per module) */
Module 1: #F59E0B  /* Amber */
Module 2: #3B82F6  /* Blue */
Module 3: #14B8A6  /* Teal */
Module 4: #EF4444  /* Red */
Module 5: #8B5CF6  /* Purple */
Module 6: #10B981  /* Emerald */
Module 7: #F97316  /* Orange */
Module 8: #EC4899  /* Pink */
```

---

## ✅ FEATURE CHECKLIST

**Public Website**
- [x] Homepage with hero, featured article, topics grid, latest articles
- [x] Dynamic topic pages with article listing
- [x] Article detail page with full rendered content
- [x] Auto-generated Table of Contents (sticky on desktop)
- [x] AI audio player (if audio attached)
- [x] Reading progress bar
- [x] Article sharing (Twitter, LinkedIn, copy link)
- [x] Related articles
- [x] Full-text search
- [x] Dark/light mode toggle
- [x] Responsive across all breakpoints
- [x] Scroll animations (Framer Motion)
- [x] 3D page-load animation
- [x] Dynamic mega-menu with all topics
- [x] SEO metadata (OG tags, structured data, sitemap.xml, robots.txt)

**Admin Panel**
- [x] Secure login (NextAuth credentials)
- [x] Dashboard with stats + charts
- [x] Full topic CRUD with drag-and-drop ordering
- [x] Full article CRUD with publish/draft/archive states
- [x] TipTap WYSIWYG with all formatting options
- [x] Image upload within editor
- [x] Embed links (YouTube, Twitter, etc.) within editor
- [x] Raw HTML editing mode
- [x] AI text generation with tone/length controls
- [x] AI image generation (DALL·E 3)
- [x] AI audio/TTS generation with voice selector
- [x] Media library (upload, browse, delete)
- [x] Site settings (general, SEO, social)
- [x] AI configuration panel (API key, model, temperature — all configurable)
- [x] Admin profile settings (password change)

---

## 📌 IMPLEMENTATION NOTES FOR DEVELOPER

1. Use **App Router** only — no Pages Router
2. Use **Server Components** by default; mark client components with `'use client'` only when interactivity is needed
3. All API routes must validate session with `getServerSession` before executing
4. TipTap content saved as **HTML string** in MySQL `LongText` column — render with `dangerouslySetInnerHTML` but sanitize with `DOMPurify` on client and `sanitize-html` on server before save
5. Images uploaded to `/public/uploads/` — return relative URL paths stored in DB
6. For AI image generation, save generated images to `/public/uploads/ai/` with timestamp filename
7. Use **Prisma transactions** for any operation touching multiple tables
8. Implement **optimistic UI** in admin panel for status toggles
9. All forms use **React Hook Form** + **Zod** for validation
10. Implement proper **error boundaries** and **loading skeletons** throughout
11. Use **next/image** for all images with proper width/height and lazy loading
12. Sitemap auto-generated from all published articles via `/sitemap.xml` dynamic route
13. Add `robots.txt` blocking `/admin/*` routes

---

*This document defines the complete specification for the AppliedAgentic platform build. Each section should be implemented fully before moving to the next phase: (1) DB + Auth → (2) Admin Panel + Editor → (3) AI Integration → (4) Public Site → (5) Animations + Polish → (6) Hostinger Deployment.*
