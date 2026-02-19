# AppliedAgentic — Comprehensive Website Build Prompt

---

## PROJECT OVERVIEW

Build a full-stack, production-ready, **mobile-first** content publishing platform called **AppliedAgentic** — a modern AI knowledge hub for publishing articles on Generative AI, Agentic AI, and related technology topics. The platform must rival the design quality and UX of **bytebytego.com**, featuring bold typography, rich animations, intuitive navigation, a powerful admin CMS, and deep AI content generation integration.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Framework | **Next.js 14+** (App Router, React Server Components) |
| Language | **TypeScript** (strict mode) |
| Database | **MySQL 8+** via **Prisma ORM** |
| Styling | **Tailwind CSS** + custom CSS variables |
| Animation | **Framer Motion** + **Three.js** (for 3D loader) |
| Rich Text Editor | **TipTap** (WYSIWYG with extensions) |
| AI Integration | **OpenAI Node.js SDK** (text, image, audio) |
| Authentication | **NextAuth.js v5** (admin-only credentials provider) |
| File Uploads | **Uploadthing** or **Next.js API route** with **Multer** + local/S3 storage |
| Hosting | **Hostinger VPS** (Node.js environment) |
| Deployment | **PM2** process manager + **Nginx** reverse proxy |
| ORM | **Prisma** |

---

## REPOSITORY STRUCTURE

```
appliedagentic/
├── app/
│   ├── (public)/                     # Public-facing pages
│   │   ├── page.tsx                  # Homepage
│   │   ├── topics/
│   │   │   ├── page.tsx              # All topics listing
│   │   │   └── [topicSlug]/
│   │   │       ├── page.tsx          # Topic detail + article list
│   │   │       └── [articleSlug]/
│   │   │           └── page.tsx      # Article reader
│   │   ├── search/page.tsx           # Search results
│   │   └── layout.tsx                # Public layout (navbar, footer)
│   ├── admin/                        # Protected admin panel
│   │   ├── layout.tsx                # Admin sidebar layout
│   │   ├── page.tsx                  # Dashboard
│   │   ├── topics/
│   │   │   ├── page.tsx              # Manage topics
│   │   │   ├── new/page.tsx          # Create topic
│   │   │   └── [id]/edit/page.tsx    # Edit topic
│   │   ├── articles/
│   │   │   ├── page.tsx              # Manage articles
│   │   │   ├── new/page.tsx          # Create article (full editor)
│   │   │   └── [id]/edit/page.tsx    # Edit article
│   │   ├── media/page.tsx            # Media library
│   │   ├── settings/page.tsx         # Site settings, AI config
│   │   └── analytics/page.tsx        # View counts, engagement
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── topics/route.ts
│   │   ├── articles/route.ts
│   │   ├── upload/route.ts
│   │   ├── ai/
│   │   │   ├── generate-text/route.ts
│   │   │   ├── generate-image/route.ts
│   │   │   └── generate-audio/route.ts
│   │   └── search/route.ts
│   └── layout.tsx                    # Root layout
├── components/
│   ├── public/                       # Public UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── TopicCard.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleReader.tsx
│   │   ├── SearchBar.tsx
│   │   └── ScrollAnimations.tsx
│   ├── admin/                        # Admin UI components
│   │   ├── Sidebar.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── ArticleEditor.tsx         # TipTap WYSIWYG wrapper
│   │   ├── AIAssistantPanel.tsx
│   │   ├── MediaUploader.tsx
│   │   └── TopicForm.tsx
│   └── shared/
│       ├── Loader3D.tsx              # Three.js 3D intro loader
│       ├── ThemeProvider.tsx
│       └── ToastNotifier.tsx
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── openai.ts                     # OpenAI SDK instance (uses env config)
│   ├── auth.ts                       # NextAuth config
│   └── utils.ts                      # Slug gen, date format, etc.
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── fonts/
│   └── images/
├── styles/
│   └── globals.css
├── .env.local                        # Environment variables
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## DATABASE SCHEMA (MySQL via Prisma)

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
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String
  name         String
  role         Role      @default(ADMIN)
  createdAt    DateTime  @default(now())
  articles     Article[]
}

enum Role {
  ADMIN
  SUPERADMIN
}

model Topic {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  description String?   @db.Text
  icon        String?   // emoji or icon class
  color       String?   // hex color for theming the topic card
  coverImage  String?
  moduleNumber Int?     // e.g., Module 1, Module 2
  order       Int       @default(0)
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  articles    Article[]
}

model Article {
  id            Int       @id @default(autoincrement())
  title         String
  slug          String    @unique
  excerpt       String?   @db.Text
  content       String    @db.LongText   // TipTap JSON or HTML
  coverImage    String?
  readTimeMin   Int?
  isPublished   Boolean   @default(false)
  publishedAt   DateTime?
  viewCount     Int       @default(0)
  order         Int       @default(0)
  topic         Topic     @relation(fields: [topicId], references: [id])
  topicId       Int
  author        User      @relation(fields: [authorId], references: [id])
  authorId      Int
  tags          Tag[]     @relation("ArticleTags")
  aiImages      AIMedia[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  slug     String    @unique
  articles Article[] @relation("ArticleTags")
}

model AIMedia {
  id         Int      @id @default(autoincrement())
  type       AIMediaType
  url        String
  prompt     String   @db.Text
  model      String
  articleId  Int?
  article    Article? @relation(fields: [articleId], references: [id])
  createdAt  DateTime @default(now())
}

enum AIMediaType {
  IMAGE
  AUDIO
  TEXT
}

model SiteSettings {
  id              Int    @id @default(1)
  siteName        String @default("AppliedAgentic")
  tagline         String?
  logo            String?
  favicon         String?
  metaDescription String? @db.Text
  // AI Config (stored encrypted or as placeholders)
  openaiApiKey    String? // store as env ref: "env:OPENAI_API_KEY"
  openaiTextModel String  @default("gpt-4o")
  openaiImageModel String @default("dall-e-3")
  openaiAudioModel String @default("tts-1")
  openaiTemperature Float @default(0.7)
  openaiMaxTokens Int     @default(2000)
  openaiImageSize String  @default("1024x1024")
  openaiImageQuality String @default("standard")
  openaiVoice     String  @default("alloy")
  updatedAt       DateTime @updatedAt
}

model MediaLibrary {
  id         Int      @id @default(autoincrement())
  filename   String
  url        String
  mimeType   String
  sizeBytes  Int
  altText    String?
  createdAt  DateTime @default(now())
}
```

---

## ENVIRONMENT VARIABLES (.env.local)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/appliedagentic"

# Auth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://appliedagentic.com"

# OpenAI — placeholders, configurable from admin panel
OPENAI_API_KEY="sk-placeholder"
OPENAI_TEXT_MODEL="gpt-4o"
OPENAI_IMAGE_MODEL="dall-e-3"
OPENAI_AUDIO_MODEL="tts-1"
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
OPENAI_IMAGE_SIZE="1024x1024"
OPENAI_IMAGE_QUALITY="standard"
OPENAI_VOICE="alloy"

# Upload
UPLOAD_DIR="./public/uploads"
MAX_UPLOAD_SIZE_MB=10

# Site
NEXT_PUBLIC_SITE_URL="https://appliedagentic.com"
NEXT_PUBLIC_SITE_NAME="AppliedAgentic"
```

---

## DESIGN SYSTEM

### Color Palette
```css
:root {
  /* Brand */
  --color-primary:     #6C3DFF;  /* Electric Violet */
  --color-secondary:   #00D4FF;  /* Cyan */
  --color-accent:      #FF6B6B;  /* Coral */
  --color-gold:        #FFD93D;  /* Highlight yellow */

  /* Background layers */
  --bg-base:           #0A0A0F;  /* Near-black */
  --bg-surface:        #12121A;  /* Card surface */
  --bg-elevated:       #1A1A28;  /* Elevated card */
  --bg-border:         #2A2A3E;  /* Border color */

  /* Text */
  --text-primary:      #F0F0FF;
  --text-secondary:    #9999BB;
  --text-muted:        #55556A;

  /* Module colors (one per topic module) */
  --module-1:          #6C3DFF;
  --module-2:          #00D4FF;
  --module-3:          #FF6B6B;
  --module-4:          #FFD93D;
  --module-5:          #4ECDC4;
  --module-6:          #FF9F43;
  --module-7:          #A29BFE;
  --module-8:          #55EFC4;
}
```

### Typography
- **Display/Hero**: `Space Grotesk` (Google Fonts) — bold, modern
- **Body/Reading**: `Inter` — clean, legible at all sizes
- **Code**: `JetBrains Mono`
- Base size: `16px` mobile → `18px` desktop
- Line height: `1.7` for article body

### Spacing & Breakpoints (Tailwind config)
```js
// tailwind.config.ts
screens: {
  'xs': '375px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1440px',
}
```

---

## ANIMATIONS & VISUAL EFFECTS

### 3D Loader (Three.js — `Loader3D.tsx`)
- On first page load, display a full-screen Three.js canvas for 2.5 seconds
- Render a slowly rotating **abstract neural network node graph** (glowing nodes + edges) in purple/cyan
- Use `THREE.Points`, `THREE.Line`, and `THREE.SphereGeometry`
- Fade out with opacity transition to reveal the page
- Store "seen" state in `sessionStorage` so it only shows once per session

### Scroll Animations (Framer Motion)
- Every section fades up (`y: 40 → 0, opacity: 0 → 1`) on scroll entry using `whileInView`
- Stagger children elements by `0.1s` delays
- Article cards slide in from the left with a subtle scale effect
- Topic module cards flip on hover (CSS `perspective` + `rotateY`)
- Numbers/stats count up when visible

### Page Transitions
- Route changes use Framer Motion `AnimatePresence` with a soft crossfade
- Article page entrance: hero image zooms out slightly from `scale: 1.05 → 1.0`

### Navbar
- Transparent on hero, transitions to solid `bg-surface/80 backdrop-blur-xl` on scroll
- Animated underline on active link using layout animations
- Mobile: full-screen slide-down menu with staggered link entrance

---

## PUBLIC WEBSITE — PAGE SPECIFICATIONS

### 1. Homepage (`/`)

**Hero Section:**
- Full-viewport dark gradient background with animated floating particle mesh (canvas)
- Large headline: "The Future of Work is **Agentic**" (Space Grotesk, 64px+ on desktop)
- Sub-headline about the platform purpose
- CTA button: "Explore Topics" → smooth scroll to topics grid
- Animated rotating 3D text or typewriter effect for sub-topics

**Topics Grid:**
- 8-module card grid (2 columns mobile, 4 columns desktop)
- Each card has: module badge, color accent, icon, title, article count, short description
- Cards have a subtle gradient glow border matching module color
- Hover: card lifts with box-shadow, color intensifies

**Featured Articles:**
- Horizontal scroll carousel on mobile, 3-column grid on desktop
- Article card: cover image, topic badge, title, excerpt (2 lines clamped), read time, date

**Stats Bar:**
- Animated number count: Total Articles, Modules, Topics
- Dark glass panel with neon border

**Newsletter/CTA Section:**
- "Stay ahead of the AI curve" signup (can be non-functional placeholder with styling)

### 2. All Topics (`/topics`)
- Full grid of all modules with descriptions
- Filterable by "module number"
- Each topic shows: cover image, module number, article count, color theme

### 3. Topic Detail (`/topics/[topicSlug]`)
- Hero banner with topic color gradient, module badge, title, description
- Breadcrumb navigation
- Article list: numbered list (ordered by `order` field), with title, excerpt, read time, publish date
- Sidebar (desktop): topic outline / quick links to articles
- "About This Module" expandable section

### 4. Article Reader (`/topics/[topicSlug]/[articleSlug]`)
- Full-width cover image with parallax scroll effect
- Sticky progress bar at top indicating scroll position
- Article header: breadcrumb, title, excerpt, read time, date, author
- Body: rendered TipTap HTML/JSON with custom styling
  - `h1`, `h2`, `h3` anchored with auto-generated IDs
  - Code blocks with syntax highlighting (`highlight.js`)
  - Image captions
  - Blockquote styling with accent left border
  - Embedded videos/iframes
  - Tables with responsive horizontal scroll
- Floating **Table of Contents** sidebar (desktop): sticky, highlights current section
- **AI-Generated Audio**: if article has audio, show embedded player bar at top
- Bottom: "Next Article" / "Previous Article" navigation within topic
- Related articles section

### 5. Search (`/search`)
- Full-text search across article titles, excerpts, content
- Filter by topic/module
- Results paginated, showing article cards

---

## ADMIN PANEL — FULL SPECIFICATION

All admin routes are under `/admin`, protected by NextAuth session.

### Admin Layout
- **Left Sidebar** (collapsible on mobile):
  - Logo + "Admin Panel" label
  - Navigation links: Dashboard, Topics, Articles, Media, Settings, Analytics, Preview Site
  - User avatar + name at bottom + logout button
  - Active link has gradient pill highlight

### Admin Dashboard (`/admin`)
- Stats cards: Total Topics, Total Articles, Published Articles, Draft Articles, Total Views, Media Files
- Recent Articles table: title, topic, status, date, views, edit link
- Quick actions: "New Article", "New Topic"
- AI Usage summary (if tracked)

### Topic Management (`/admin/topics`)

**Topic List:**
- Sortable table: Module #, Title, Slug, Articles Count, Status, Actions
- Drag-to-reorder rows (for `order` field)
- Bulk actions: Publish/Unpublish/Delete

**Create/Edit Topic Form:**
- Fields:
  - `moduleNumber` (number)
  - `title` (text)
  - `slug` (auto-generated from title, editable)
  - `description` (textarea, supports basic markdown)
  - `icon` (emoji picker or icon class input)
  - `color` (hex color picker — drives card theming)
  - `coverImage` (image uploader → media library picker)
  - `order` (number)
  - `isPublished` (toggle)
- Preview card rendered in real-time on the right

### Article Management (`/admin/articles`)

**Article List:**
- Filterable by Topic, Status (Draft/Published), Date
- Columns: Cover Thumbnail, Title, Topic, Author, Status, Views, Date, Actions
- Drag-to-reorder within topic

**Article Editor (`/admin/articles/new` and `/admin/articles/[id]/edit`):**

This is the most complex and important screen.

**Layout:** Two-panel on desktop — left: editor (70%), right: sidebar controls (30%).

**Left Panel — TipTap WYSIWYG Editor:**

Configure TipTap with ALL of the following extensions:
- `StarterKit` (bold, italic, strike, code, heading H1–H4, paragraph, bullet list, ordered list, blockquote, horizontal rule, undo/redo)
- `Underline`
- `TextAlign` (left, center, right, justify)
- `Color` + `TextStyle` (font color picker)
- `Highlight` (background color)
- `FontFamily` (dropdown: Inter, Space Grotesk, JetBrains Mono, Georgia, Arial)
- `FontSize` (px input)
- `Link` (href, target, rel — with URL validation)
- `Image` (with resizing handles, alignment options, alt text, caption)
- `Youtube` / `Iframe` embed extension (paste URL to embed)
- `Table` with `TableRow`, `TableHeader`, `TableCell` (add/remove rows/cols, merge cells)
- `CodeBlock` with `lowlight` syntax highlighting (language selector)
- `Placeholder`
- `CharacterCount`
- `History` (undo/redo)
- `Dropcursor` + `Gapcursor`
- Custom `AudioBlock` node — renders an `<audio>` player in the content

**Toolbar (sticky at top of editor):**
- Row 1: Heading dropdown | Bold | Italic | Underline | Strike | Code | Link | Unlink
- Row 2: Align Left/Center/Right | Bullet List | Ordered List | Blockquote | HR | Code Block | Table
- Row 3: Font Family | Font Size | Text Color | Highlight Color | Clear Formatting
- Row 4: Insert Image (upload or URL) | Insert Video/Embed | Insert Audio | Insert HTML Block
- Toolbar is responsive — collapses to icon-only on tablet

**Right Panel — Article Settings Sidebar:**
- `title` (text input — large, primary)
- `slug` (auto-generated, editable, with "regenerate" button)
- `excerpt` (textarea, 160 char limit with counter)
- `coverImage` (drag-drop uploader + media library picker, shows preview)
- `topicId` (searchable dropdown)
- `tags` (multi-select creatable tags)
- `order` (number input)
- `readTimeMin` (auto-calculated from word count, but editable)
- `isPublished` + `publishedAt` (datetime picker)
- Action buttons: **Save Draft** | **Publish** | **Preview** (opens new tab)
- Delete article (with confirmation modal)

---

## AI ASSISTANT PANEL

Inside the Article Editor, there is a collapsible **AI Assistant Panel** on the right (or as a floating drawer on mobile).

### AI Text Generation
- Prompt input: multiline textarea
- Context toggle: "Include current article text as context" (sends editor content as context)
- Output mode: Replace Selection | Insert at Cursor | Append to End | Show in Preview
- Config (editable, pulls from SiteSettings defaults):
  - `model`: dropdown (gpt-4o, gpt-4o-mini, gpt-3.5-turbo, o1-mini) or text input
  - `temperature`: slider (0.0–2.0, step 0.1)
  - `maxTokens`: number input
  - `systemPrompt`: expandable textarea (default: "You are an expert AI writer for the AppliedAgentic platform...")
- **Generate** button → calls `/api/ai/generate-text`
- Response shown in a preview box with "Insert" / "Copy" / "Discard" actions
- Streaming response supported (SSE)

### AI Image Generation
- Prompt input: textarea
- Config:
  - `model`: dropdown (dall-e-3, dall-e-2) or text input
  - `size`: dropdown (256x256, 512x512, 1024x1024, 1024x1792, 1792x1024)
  - `quality`: dropdown (standard, hd)
  - `style`: dropdown (vivid, natural)
  - `n`: number (1–4, only for dall-e-2)
- **Generate Image** button → calls `/api/ai/generate-image`
- Shows generated image preview
- Actions: "Insert into Article" (uploads to media library, inserts `<img>` node) | "Save to Media Library" | "Discard"

### AI Audio Generation (Text-to-Speech)
- Input: either "Use article content" toggle or custom text textarea
- Config:
  - `model`: dropdown (tts-1, tts-1-hd) or text input
  - `voice`: dropdown (alloy, echo, fable, onyx, nova, shimmer)
  - `speed`: slider (0.25–4.0)
- **Generate Audio** button → calls `/api/ai/generate-audio`
- Audio player preview
- Actions: "Attach to Article" (saves URL to article's `aiImages` relation, renders player at top of article) | "Save to Media Library" | "Discard"

---

## API ROUTES — DETAILED SPEC

### `/api/ai/generate-text` (POST)
```typescript
// Request body
{
  prompt: string;
  context?: string;          // Current article content
  model?: string;            // Override from request, default from env/settings
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}
// Response: { text: string } or SSE stream
```

### `/api/ai/generate-image` (POST)
```typescript
// Request body
{
  prompt: string;
  model?: string;            // 'dall-e-3' | 'dall-e-2'
  size?: string;             // '1024x1024' etc.
  quality?: string;          // 'standard' | 'hd'
  style?: string;            // 'vivid' | 'natural'
  n?: number;
}
// Response: { imageUrl: string, revisedPrompt?: string }
// Internally: downloads image, saves to /public/uploads/ai/, returns local URL
```

### `/api/ai/generate-audio` (POST)
```typescript
// Request body
{
  text: string;
  model?: string;            // 'tts-1' | 'tts-1-hd'
  voice?: string;            // 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number;
}
// Response: { audioUrl: string }
// Internally: saves mp3 to /public/uploads/audio/, returns local URL
```

### `/api/topics` (GET, POST) and `/api/topics/[id]` (GET, PUT, DELETE)
Standard REST CRUD. GET (public) returns only published topics. POST/PUT/DELETE require admin session.

### `/api/articles` (GET, POST) and `/api/articles/[id]` (GET, PUT, DELETE)
- GET (public): returns published articles with pagination (`?page=1&limit=10&topicId=&search=`)
- Response includes: id, title, slug, excerpt, coverImage, readTimeMin, publishedAt, viewCount, topic (title, slug, color), tags
- GET `/api/articles/[id]` also increments `viewCount` by 1
- POST/PUT/DELETE require admin session

### `/api/upload` (POST)
- Accepts `multipart/form-data` with file field
- Validates: max 10MB, allowed types: jpg, jpeg, png, webp, gif, mp3, mp4, pdf, svg
- Saves to `/public/uploads/[year]/[month]/[uuid].[ext]`
- Saves record to `MediaLibrary` table
- Returns: `{ url: string, filename: string, mimeType: string, sizeBytes: number }`

### `/api/search` (GET)
- `?q=search+term&topicId=&page=1&limit=10`
- MySQL `FULLTEXT` search on `Article.title`, `Article.excerpt`, `Article.content`

---

## OPENAI SDK INTEGRATION (`lib/openai.ts`)

```typescript
import OpenAI from 'openai';
import { SiteSettings } from '@prisma/client';

// Singleton client — API key from environment, overridable from DB settings
export function getOpenAIClient(settings?: Partial<SiteSettings>): OpenAI {
  return new OpenAI({
    apiKey: settings?.openaiApiKey || process.env.OPENAI_API_KEY,
    // All placeholders: model, temperature, maxTokens, etc. are passed per-call
  });
}

// Default config object shape — matches SiteSettings fields
export interface OpenAIConfig {
  apiKey: string;          // placeholder: process.env.OPENAI_API_KEY
  textModel: string;       // placeholder: process.env.OPENAI_TEXT_MODEL
  imageModel: string;      // placeholder: process.env.OPENAI_IMAGE_MODEL
  audioModel: string;      // placeholder: process.env.OPENAI_AUDIO_MODEL
  temperature: number;     // placeholder: process.env.OPENAI_TEMPERATURE
  maxTokens: number;       // placeholder: process.env.OPENAI_MAX_TOKENS
  imageSize: string;       // placeholder: process.env.OPENAI_IMAGE_SIZE
  imageQuality: string;    // placeholder: process.env.OPENAI_IMAGE_QUALITY
  voice: string;           // placeholder: process.env.OPENAI_VOICE
}
```

---

## ADMIN SETTINGS PAGE (`/admin/settings`)

Sections:
1. **Site Identity**: Site name, tagline, logo upload, favicon upload, meta description
2. **AI Configuration** (all fields editable, saved to `SiteSettings`):
   - OpenAI API Key (masked input, "Test Connection" button)
   - Text Generation: model (input + dropdown presets), temperature (slider), max tokens (input), system prompt (textarea)
   - Image Generation: model (input), default size, default quality, default style
   - Audio Generation: model (input), default voice (dropdown), default speed (slider)
   - Save button → updates `SiteSettings` in DB
3. **Admin Account**: Change name, email, password (current password required)
4. **Danger Zone**: Clear all view counts, export all content as JSON

---

## TOPIC & ARTICLE DATA SEEDING

Pre-seed database with the following **8 Modules** and their sub-topics as Topics (each sub-topic becomes an Article stub with placeholder content):

**Module 1 — Foundations of Generative and Agentic AI**
Articles: Generative AI Fundamentals | AI Chatbots: Past, Present, and Future | Cost-Optimized Models and Performance Trade-Offs | Exploring Multimedia and Language Interaction Models | Advanced Applications of Generative AI Tools

**Module 2 — The Rise of Agentic AI and Emerging Platforms**
Articles: Emerging Agentic Platforms | Vibe Living | Single vs. Multi-Agent Architectures | Open-Source vs. Closed-Source AI Systems

**Module 3 — Connecting Agents to Digital Ecosystems**
Articles: Building Agents into Existing Workflows | Integrating Generative and Agentic AI with Existing Systems: Challenges and Solutions | Spotify MCP and Other Edge-cases of Agent Integration | Empathy and Response-Tuning for Customer-Facing Agents

**Module 4 — Agent Risks, Disinformation, and Systemic Impact**
Articles: Classic and Current Cybersecurity Risks | Cybersecurity for Agent Ecosystems | Limitations of Agent Perception and Error Correction

**Module 5 — AI Agents by Business Function**
Articles: The Maturity Cycle of Agentic Implementation (Crawl-Walk-Run) | Advantages of Agentic AI for the Product Development Cycle | Functional Deployments: HR Bots, Finance Advisors and IT Copilots | Agent Architecture in the Enterprise: Centralized vs. Embedded

**Module 6 — The Last Mile – From Pilot to Practice**
Articles: Voice Agents: Synthesis, Phone Systems, and Real-time Applications | Last-mile Integration: Why Pilots Succeed but Deployments Stall | Internal Resistance and Change Management | Monitoring Agent Performance (Metrics, KPIs, Feedback Loops)

**Module 7 — Governance, Compliance, and Agent Testing**
Articles: Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules | Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks | Agent Speed vs. Oversight: Where to Insert Guardrails | Documentation and Compliance Readiness

**Module 8 — Strategy Capstone – Leading the Agentic Future**
Articles: Strategic Roadmap Development (Short-, Medium-, Long-Term) | Team Structure, Vendor Choice, and Internal Capability Building | Organizational Culture and Leadership for Agent Adoption | Summary of Technical Enablers and Business Opportunities | Maturity Assessment of Agent Strategy – Change Management

Create a Prisma seed file at `prisma/seed.ts` that inserts all modules as Topics and all article titles as draft Articles.

---

## AUTHENTICATION

Use **NextAuth.js v5** with **CredentialsProvider**:
- Admin logs in at `/admin/login`
- Single admin user (no public registration)
- Session stored in JWT cookie
- Middleware at `middleware.ts` protects all `/admin/*` routes (redirect to `/admin/login` if unauthenticated)
- Session checked on all admin API routes using `getServerSession()`

---

## MOBILE-FIRST REQUIREMENTS

Every component must be designed for **375px minimum width** first, then enhanced for larger screens. Specific requirements:

- Navbar: hamburger menu on mobile (full-screen overlay with backdrop blur)
- Admin Sidebar: collapsible to icon-only on tablet, bottom sheet drawer on mobile
- Article Editor: single-column on mobile (toolbar + editor stacked, sidebar becomes bottom modal sheet)
- AI Assistant Panel: slide-up bottom drawer on mobile, fixed right panel on desktop (≥1024px)
- Topic cards: 1 column on mobile, 2 on sm, 3 on md, 4 on xl
- Article cards: 1 column on mobile, 2 on md, 3 on lg
- All tables in admin: horizontally scrollable on mobile
- Font sizes scale with clamp(): `font-size: clamp(14px, 2.5vw, 18px)` for body
- Tap targets minimum 44×44px

---

## HOSTINGER VPS DEPLOYMENT

Provide a `DEPLOYMENT.md` file with:

1. Node.js 20 installation on Hostinger VPS
2. MySQL 8 setup: create database `appliedagentic`, user, and password
3. Clone repo, install deps, set `.env.local`
4. `npx prisma migrate deploy && npx prisma db seed`
5. `npm run build`
6. PM2 config (`ecosystem.config.js`):
   ```js
   module.exports = {
     apps: [{
       name: 'appliedagentic',
       script: 'node_modules/.bin/next',
       args: 'start',
       env: { NODE_ENV: 'production', PORT: 3000 }
     }]
   };
   ```
7. Nginx reverse proxy config (port 3000 → 443 HTTPS)
8. Let's Encrypt SSL with Certbot
9. File upload directory permissions
10. PM2 startup on server reboot

---

## PERFORMANCE & SEO

- All public pages use `generateMetadata()` for dynamic Open Graph + Twitter Card tags
- Images use `next/image` with `priority` on above-fold images
- ISR (Incremental Static Regeneration): topic and article pages with `revalidate: 3600`
- `sitemap.ts` auto-generated from all published topics and articles
- `robots.txt` blocks `/admin/*`
- Article content lazy-loads syntax highlighting
- Fonts loaded with `next/font/google` (subset: latin)
- `<link rel="preconnect">` for Google Fonts and CDN
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms

---

## ADDITIONAL FEATURES TO INCLUDE

1. **Article Preview Mode**: `/admin/articles/[id]/preview` renders the article exactly as public without publishing
2. **Article Duplication**: Clone an existing article as draft
3. **Draft Autosave**: Debounced auto-save every 30 seconds in the editor (saves to DB with `isPublished: false`)
4. **Reading Progress Bar**: Sticky top bar on article pages showing scroll %
5. **Dark Mode Only**: The entire site is dark-theme only (no toggle needed)
6. **Copy Code Button**: Auto-injects "Copy" button into all code blocks in article reader
7. **Estimated Read Time**: Auto-calculated from word count (avg 200 wpm), displayed on article cards and article header
8. **Related Articles**: Bottom of article page shows 3 articles from same topic (excluding current)
9. **Keyboard Shortcuts in Editor**: Ctrl+S to save draft, Ctrl+Enter to publish
10. **Media Library**: Grid view of all uploaded files with search, delete, and copy-URL functionality

---

## WHAT NOT TO BUILD (Explicit Exclusions)

- No user registration or public accounts
- No comments system
- No payment/subscription system
- No multi-author workflow (single admin only for now)
- No email newsletter integration (placeholder UI only)
- No social login
- No real-time collaboration

---

## DELIVERABLES CHECKLIST

- [ ] Fully working Next.js 14+ project with App Router
- [ ] MySQL schema deployed via Prisma
- [ ] NextAuth admin authentication
- [ ] Public homepage with 3D loader, animated hero, topic grid, article cards
- [ ] Topic listing and detail pages
- [ ] Article reader with progress bar, TOC, and AI audio player
- [ ] Full-featured TipTap WYSIWYG editor with all extensions
- [ ] AI Text / Image / Audio generation panel with all config placeholders
- [ ] Admin panel with dashboard, topic CRUD, article CRUD, media library, settings
- [ ] OpenAI SDK integration with env-based and DB-based config
- [ ] Prisma seed file with all 8 modules and their articles
- [ ] Mobile-first responsive design across all pages
- [ ] Framer Motion scroll animations
- [ ] Three.js 3D loading screen
- [ ] Deployment documentation for Hostinger VPS
- [ ] Environment variable template (`.env.example`)
- [ ] `README.md` with setup instructions

---

*End of Prompt — AppliedAgentic Website Build Specification v1.0*
