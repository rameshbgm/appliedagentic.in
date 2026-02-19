<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Create an detailed granular prompt for the following, more detaills, including very details, below is my requirement

i want build an website appliedagentic, my ask is i wan to manage all the content from backend, i want to store the data in mysql, latest next.js wanted to host in hostinger, 
i wan to use this website to publish my articals in AI and   below modules  I wan to have an an admin account wher I login and write and publish the atricles.
website should support the WYSWYG, can upload the image, links, embadded links, fornt, html and all the formattings. Also I want to integrate it with AI, while writing the Article i should have an option to create an AI generated image, text and audio. using OpenAI SDK , keep the placeholers for API key, model, tempratur and other confir
Always Mobile web page first approach and responsive,  it l
I am looking for modern website, something like bytebytego.com
i can extent to any topic and inside  that topic I can write any number of articles.
think of good design, dymanic menu, topic, atrical creation,   Everything should be managed by admin panel. 
design good Admin panel to control everything, 
good layout, 3d animination to load , good font to read, scrolling animination, colourful, attractive
I have maby below topics,  Module 1 Foundations of Generative and Agentic AI Module 4 Agent Risks, Disinformation, and Systemic Impact Module 2 The Rise of Agentic AI and Emerging Platforms Module 3 Connecting Agents to Digital Ecosystems 1. Generative AI Fundamentals 2. AI Chatbots: Past, Present, and Future 3. Cost-Optimized Models and Performance Trade-Offs 4. Exploring Multimedia and Language Interaction Models 5. Advanced Applications of Generative AI Tools 1. Classic and Current Cybersecurity Risks 2. Cybersecurity for Agent Ecosystems 3. Limitations of Agent Perception and Error Correction 1. Emerging Agentic Platforms 2. Vibe Living 3. Single vs. Multi-Agent Architectures 4. Open-Source vs. Closed-Source AI Systems 1. Building Agents into Existing Workflows 2. Integrating Generative and Agentic AI with Existing Systems: Challenges and Solutions 3. Spotify MCP and Other Edge-cases of Agent Integration 4. Empathy and Response-Tuning for Customer-Facing Agents Module 5 AI Agents by Business Function Module 6 The Last Mile – From Pilot to Practice 1. The Maturity Cycle of Agentic Implementation (Crawl-walk-run) 2. Advantages Of Agentic AI for the Product Development Cycle (E.G. Accelerated Prototyping, Automation of Quality Assurance Pipelines, Reducing Product Launch Timelines) 3. Functional Deployments: HR Bots, Finance Advisors and IT Copilots 4. Agent Architecture in the Enterprise: Centralized Vs. Embedded 1. Voice Agents: Synthesis, Phone Systems, and Real-time Applications 2. Last-mile Integration: Why Pilots Succeed but Deployments Stall 3. Internal Resistance and Change Management 4. Monitoring Agent Performance (Metrics, KPIs, Feedback Loops) Online Course: Applied Agentic AI for Organizational Transformation 14 Module 7 Governance, Compliance, and Agent Testing Module 8 Strategy Capstone – Leading the Agentic Future 1. Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules 2. Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks 3. Agent Speed vs. Oversight: Where to Insert Guardrails 4. Documentation and Compliance Readiness 1. Strategic roadmap development (short-, medium-, long-term) 2. Team structure, vendor choice, and internal capability building 3. Organizational culture and leadership for agent adoption 4. Summary of technical enablers and business opportunities 5. Maturity assessment of agent strategy – change management

Below is a detailed, granular prompt you can copy‑paste into another AI or share with a developer to build your “Applied Agentic AI” website. It is designed to create a modern, visual, mobile‑first site inspired by platforms like ByteByteGo, which presents succinct graphical engineering guides and system design content with a strong visual-first style.[^1][^2][^3]

## How to use this prompt

- Replace anything in `[[double brackets]]` with your own values (e.g., project name, domain).
- Keep the structure and bullet points; they tell the AI/dev exactly what to build.
- This prompt assumes: latest Next.js (App Router, TypeScript), MySQL, deployment on Hostinger, and OpenAI SDK for AI features.

***

## Full prompt to copy‑paste

```text
You are a senior full‑stack engineer and product designer.  
Your task is to design and implement a complete content‑managed website called **“Applied Agentic AI”** that will be deployed on Hostinger. The stack MUST be:

- Latest **Next.js** (App Router, TypeScript, server components where appropriate)
- **MySQL** as the primary database
- **Prisma** ORM (or another modern TypeScript ORM) for database access
- Deployed to **Hostinger** (Node.js / container or managed Next.js), with environment variables for all secrets

The goal: A modern, visually engaging, mobile‑first site (inspired by bytebytego.com style) for publishing AI/Agentic AI articles and course modules, with a full admin panel and AI‑assisted content creation (text, images, audio) using the **OpenAI SDK**.

--------------------------------
1. High‑level goals and roles
--------------------------------
Implement the system to support these roles and goals:

- **Public visitor**
  - Browse topics, modules, and articles.
  - Read well‑formatted articles with images, code, diagrams, and embedded media.
  - Navigate easily on mobile (primary) and desktop (responsive).
  - Discover content by topic/module, tags, search, and “related articles.”

- **Admin (single admin account for now)**
  - Secure login/logout and session‑based access to an admin panel.
  - Create, edit, schedule, and publish/unpublish topics, modules, and articles.
  - Use a full **WYSIWYG editor** with:
    - Headings, bold, italic, underline, lists, block quotes
    - Code blocks, inline code
    - Links, embedded external content (e.g., YouTube, X/Twitter, iframes)
    - Image upload and image alignment
    - HTML paste support, and basic HTML view if possible
  - Use **built‑in AI helpers** to:
    - Generate or refine article text
    - Generate article cover images and inline images
    - Generate audio narration or audio summary of the article
  - Manage menus, navigation order, site metadata, and basic theming from the admin.

--------------------------------
2. Information architecture & content model
--------------------------------
Design the content hierarchy for an online program called:

> **“Applied Agentic AI for Organizational Transformation”**

Model the structure as:

- **Course** (single primary course for now: Applied Agentic AI)
  - **Modules** (e.g., Module 1, Module 2, … Module 8)
  - Each Module has many **Topics/Sections**
  - Each Topic/Section can have many **Articles**

Requirements:

- Allow flexible **Topic → Article** relationships:
  - An Article MUST belong to at least one Topic.
  - A Topic belongs to exactly one Module.
- Support these example modules and topic names as seed data / examples (do not hardcode them into code; treat them as initial content that can be edited from admin):

  - **Module 1 – Foundations of Generative and Agentic AI**
    - Generative AI Fundamentals
    - AI Chatbots: Past, Present, and Future
    - Cost-Optimized Models and Performance Trade-Offs
    - Exploring Multimedia and Language Interaction Models
    - Advanced Applications of Generative AI Tools

  - **Module 2 – The Rise of Agentic AI and Emerging Platforms**
    - Emerging Agentic Platforms
    - Vibe Living
    - Single vs. Multi-Agent Architectures
    - Open-Source vs. Closed-Source AI Systems

  - **Module 3 – Connecting Agents to Digital Ecosystems**
    - Building Agents into Existing Workflows
    - Integrating Generative and Agentic AI with Existing Systems: Challenges and Solutions
    - Spotify MCP and Other Edge-cases of Agent Integration
    - Empathy and Response-Tuning for Customer-Facing Agents

  - **Module 4 – Agent Risks, Disinformation, and Systemic Impact**
    - Classic and Current Cybersecurity Risks
    - Cybersecurity for Agent Ecosystems
    - Limitations of Agent Perception and Error Correction

  - **Module 5 – AI Agents by Business Function**
    - The Maturity Cycle of Agentic Implementation (Crawl–Walk–Run)
    - Advantages of Agentic AI for the Product Development Cycle
    - Functional Deployments: HR Bots, Finance Advisors, IT Copilots
    - Agent Architecture in the Enterprise: Centralized vs. Embedded

  - **Module 6 – The Last Mile – From Pilot to Practice**
    - Voice Agents: Synthesis, Phone Systems, Real-time Applications
    - Last-mile Integration: Why Pilots Succeed but Deployments Stall
    - Internal Resistance and Change Management
    - Monitoring Agent Performance (Metrics, KPIs, Feedback Loops)

  - **Module 7 – Governance, Compliance, and Agent Testing**
    - Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules
    - Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks
    - Agent Speed vs. Oversight: Where to Insert Guardrails
    - Documentation and Compliance Readiness

  - **Module 8 – Strategy Capstone – Leading the Agentic Future**
    - Strategic roadmap development (short-, medium-, long-term)
    - Team structure, vendor choice, and internal capability building
    - Organizational culture and leadership for agent adoption
    - Summary of technical enablers and business opportunities
    - Maturity assessment of agent strategy – change management

- **Articles**
  - Each article has:
    - Title, slug, short summary
    - Main content (rich text from WYSIWYG)
    - Optional hero/cover image
    - Optional estimated read time
    - Status: draft, scheduled, published
    - PublishedAt timestamp
    - SEO metadata: meta title, meta description, canonical URL, Open Graph image reference
  - Articles should be extendable beyond the above modules for any future AI or non‑AI topics.

--------------------------------
3. Database schema (MySQL)
--------------------------------
Using Prisma (or equivalent), define at minimum:

- `User`
  - `id`
  - `email` (unique)
  - `passwordHash`
  - `name`
  - `role` (enum: ADMIN, maybe support more roles later)
  - timestamps

- `Module`
  - `id`
  - `title`
  - `slug`
  - `orderIndex` (for ordering in navigation)
  - `shortDescription`
  - timestamps

- `Topic`
  - `id`
  - `moduleId` (FK to Module)
  - `title`
  - `slug`
  - `orderIndex`
  - `shortDescription`
  - timestamps

- `Article`
  - `id`
  - `title`
  - `slug`
  - `summary`
  - `content` (rich text JSON or HTML string, depending on editor choice)
  - `status` (enum: DRAFT, SCHEDULED, PUBLISHED)
  - `publishedAt`
  - `coverImageId` (FK to MediaAsset)
  - `readingTimeMinutes` (int, can be computed)
  - `seoTitle`
  - `seoDescription`
  - `seoCanonicalUrl`
  - timestamps

- `TopicArticle` (join table for many‑to‑many if needed)
  - `id`
  - `topicId`
  - `articleId`
  - `orderIndex`

- `Tag`
  - `id`
  - `name`
  - `slug`

- `ArticleTag`
  - `id`
  - `articleId`
  - `tagId`

- `MediaAsset`
  - `id`
  - `url` (relative or absolute)
  - `type` (IMAGE, AUDIO)
  - `altText`
  - `caption`
  - `width`
  - `height`
  - `createdByUserId` (FK)
  - timestamps

- `AIUsageLog` (optional but recommended)
  - `id`
  - `userId`
  - `articleId` (nullable)
  - `type` (TEXT_GENERATION, IMAGE_GENERATION, AUDIO_GENERATION)
  - `model`
  - `inputTokens` (if available)
  - `outputTokens` (if available)
  - raw request/response snippets (optional, anonymized)
  - timestamps

Ensure proper indices on `slug`, `status`, `publishedAt`, and foreign keys.

--------------------------------
4. Tech stack details
--------------------------------
- Next.js **App Router** (e.g., `/app` directory), TypeScript, server actions where appropriate.
- Styling:
  - Use a utility‑first framework like **Tailwind CSS** or a modern CSS‑in‑JS solution.
  - Support light/dark theme (optional but nice to have).
- ORM:
  - **Prisma** for schema migrations and type‑safe queries against MySQL.
- Auth:
  - Email/password admin with hashed password (bcrypt or similar).
  - Use secure, HTTP‑only cookies or NextAuth Credentials provider.
  - Protect all admin routes; redirect unauthenticated users to login.

--------------------------------
5. Public site – pages & behavior
--------------------------------
Implement at least:

- `/` (Home)
  - Hero section explaining “Applied Agentic AI” and what the site offers.
  - Featured Module(s) and Featured Articles.
  - Call‑to‑action to explore the course/modules.
  - Visual, card-based layout for modules/topics; use subtle 3D/scroll animations.

- `/modules`
  - Grid/list of all modules with description and link to module detail.

- `/modules/[moduleSlug]`
  - Module overview.
  - List of Topics/Sections and their related articles.
  - Progress‑style layout (like a structured course roadmap).

- `/topics/[topicSlug]`
  - Topic description and list of articles in that topic.
  - Highlight the module this topic belongs to.

- `/articles`
  - List of all published articles with filters by module, topic, and tags.
  - Search bar for searching by title, summary, and content (server‑side search initially).

- `/articles/[articleSlug]`
  - Article detail page with:
    - Readable typography (good fonts, white space).
    - Support for images, code blocks, inline callouts, tables, and embedded content.
    - Optional inline “AI summary” box (if generated).
    - Related articles section at bottom.
  - SEO tags set from article metadata.

- `/admin/*`
  - All admin routes must be behind auth.

--------------------------------
6. Admin panel – UX and modules
--------------------------------
Design a **modern admin dashboard** with:

- Left sidebar navigation:
  - Dashboard (overview of content, quick stats)
  - Modules
  - Topics
  - Articles
  - Media Library
  - Settings (site metadata, AI config, navigation)
  - Profile / Logout

- **Dashboard**
  - Counts of modules, topics, published articles, drafts.
  - Latest articles edited.
  - Recent AI operations usage logs.

- **Modules management**
  - CRUD for modules.
  - Reordering modules with drag‑and‑drop if possible.
  - Associate topics to modules.

- **Topics management**
  - CRUD for topics.
  - Assign module and set display order.

- **Articles management**
  - List with filters: by status, module, topic, tag.
  - Create/Edit Article screen including:
    - Title, slug (auto‑generated but editable).
    - Summary.
    - Topic assignment(s).
    - Tag assignment.
    - Status (draft, scheduled, published) and publishedAt.
    - Cover image selector (from Media Library) or upload new.
    - WYSIWYG editor for main content.
    - SEO fields (title, description, canonical URL).
    - Buttons for:
      - “Save as Draft”
      - “Publish Now”
      - “Schedule Publish” (choose date/time)

--------------------------------
7. WYSIWYG editor requirements
--------------------------------
For the article editor, integrate a robust React WYSIWYG editor (e.g., Tiptap, Slate, or similar) with:

- Rich text features:
  - Paragraph, headings (H1–H4), bold, italic, underline, strikethrough.
  - Bulleted and numbered lists, checklists.
  - Blockquotes.
  - Code blocks and inline code.
- Media & embeds:
  - Image upload (drag‑and‑drop and via toolbar).
  - Insert image from Media Library.
  - Insert links with target options.
  - Embed external content by URL (e.g. YouTube, Loom, etc.).
- Formatting:
  - Text alignment, highlighting, callout blocks if available.
  - Ability to paste from Word/Google Docs and preserve formatting as much as possible.
- HTML:
  - Either:
    - Store structured JSON and render it via components, OR
    - Store sanitized HTML safely.
  - Option to view/edit HTML is a bonus.

--------------------------------
8. AI integration (OpenAI SDK)
--------------------------------
Integrate **OpenAI SDK** for three major capabilities inside the admin editor:

- **Configuration placeholders**
  - Do NOT hardcode keys; read from environment variables.
  - Use a configuration object like:

    - `OPENAI_API_KEY`
    - `OPENAI_TEXT_MODEL` (e.g., `"gpt-4.1"` or `"gpt-4o-mini"`)
    - `OPENAI_IMAGE_MODEL` (e.g., `"gpt-image-1"`)
    - `OPENAI_AUDIO_MODEL` (for TTS or other audio if available)
    - `OPENAI_TEMPERATURE` (number)
    - `OPENAI_MAX_TOKENS` (number)

  - Allow these to be set/overridden from a secure admin settings page, but **never** expose the actual API key in the frontend. Keep keys server‑side only.

- **AI text assistance**
  - In the article edit screen, include AI actions such as:
    - “Generate outline from title”
    - “Expand this section”
    - “Summarize this article”
    - “Improve writing style” (clarity, conciseness, tone)
  - Implement as:
    - Admin selects some text in the editor, clicks an AI action.
    - Backend calls OpenAI text model with a prompt and returns updated text.
    - Show a diff/preview and allow admin to accept/insert.

- **AI image generation**
  - In the article editor, a panel:
    - Input: short text prompt (e.g., “a minimal 3D illustration of autonomous AI agents collaborating in a modern office”).
    - Backend calls OpenAI images endpoint with the configured `OPENAI_IMAGE_MODEL`.
    - Return generated image, store it as a `MediaAsset`, and allow admin to:
      - Use it as cover image.
      - Insert into the article content at cursor.

- **AI audio generation**
  - Provide a feature to generate:
    - Audio narration of the full article, or
    - Audio summary.
  - Flow:
    - Admin clicks “Generate audio summary” or “Generate full narration.”
    - Backend sends article text (or summary) to the OpenAI audio/voice model.
    - Receives audio file, saves as `MediaAsset` with type AUDIO.
    - On the article page, if audio exists, show a simple audio player.

- **Error handling & limits**
  - Show clear error messages if AI calls fail.
  - Respect rate limits; optionally log usage in `AIUsageLog`.
  - Provide basic feedback (spinner, 3D/animated indicator) while AI operations run.

--------------------------------
9. Media handling
--------------------------------
- File storage:
  - Use a pluggable abstraction so storage can be:
    - Local (e.g., `/public/uploads`) by default, or
    - Swapped to S3‑compatible storage later.
- Media Library in admin:
  - Grid view of uploaded images and audio.
  - Filter by type (image/audio) and by uploader.
  - Click to view details, copy URL, or delete (with “are you sure?” confirmation).

--------------------------------
10. UI/UX, layout, and animations
--------------------------------
- Design inspiration:
  - Modern, educational, and visual‑first like popular system design resources.
  - Card‑based grids, clean sections, and diagrams/illustrations feel.
- General guidelines:
  - **Mobile‑first**, then scale up to tablet and desktop.
  - Use a highly readable font pairing (e.g., sans serif for body, slightly stronger display font for headings).
  - Consistent spacing scale, clear visual hierarchy.
- Animations:
  - Subtle **3D‑style loading animation** (e.g., for page loads and AI operations).
  - Smooth scroll‑based animations:
    - Fade‑in / slide‑in of modules and articles as they come into view.
  - Avoid heavy animations that hurt performance on mobile.
- Color palette:
  - Use a colorful, but professional palette suitable for tech/AI education.
  - Ensure sufficient contrast for accessibility.

--------------------------------
11. Performance, SEO, and accessibility
--------------------------------
- Performance:
  - Use Next.js image optimization for article and cover images.
  - Lazy‑load non‑critical images and heavy components.
  - Cache queries where appropriate (e.g., modules/topics lists).
- SEO:
  - Generate meta tags per page from content.
  - Clean URLs: `/modules/module-slug`, `/topics/topic-slug`, `/articles/article-slug`.
  - Sitemap and robots.txt.
- Accessibility:
  - Semantic HTML and ARIA where needed.
  - Keyboard navigation for main actions.
  - Alt text for images (required in admin when uploading).

--------------------------------
12. Security and configuration
--------------------------------
- Protect all admin routes:
  - Redirect to login if not authenticated.
  - CSRF protection for write operations.
- Passwords:
  - Always stored as secure hashes.
- Secrets & config:
  - Use environment variables for:
    - Database credentials
    - OpenAI API key
    - Any other third‑party secrets
  - Do NOT leak secrets to client‑side code.
- Basic audit:
  - Track `createdBy` and `updatedBy` on Articles, Topics, and Modules.

--------------------------------
13. Deliverables
--------------------------------
Produce:

1. A Next.js project ready to deploy on Hostinger, with:
   - `schema.prisma` (or equivalent) for MySQL.
   - Migrations to create all tables.
   - Admin authentication implemented.
   - Public pages and admin panel pages as described.

2. Clear README including:
   - How to set up locally.
   - Required environment variables (including placeholders for:
     - `DATABASE_URL`
     - `OPENAI_API_KEY`
     - `OPENAI_TEXT_MODEL`
     - `OPENAI_IMAGE_MODEL`
     - `OPENAI_AUDIO_MODEL`
     - `OPENAI_TEMPERATURE`
     - `OPENAI_MAX_TOKENS`
   - How to deploy to Hostinger (build command, start command).

3. Example seed script (optional but helpful) to:
   - Create the main course and the 8 modules with the topic names listed above.
   - Create one example admin user with a known email/password (document this, and mark it as development‑only).

Follow this specification closely, but you may suggest small improvements if they make the admin experience or site performance significantly better.
```

<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://bytebytego.com/guides/

[^2]: https://grokkingthesystemdesign.com/platforms/bytebytego/

[^3]: https://www.designgurus.io/blog/bytebytego-vs-designgurus-2026

[^4]: Hostinger Deployment.txt

[^5]: https://www.linkedin.com/company/bytebytego

[^6]: https://blog.bytebytego.com/p/free-system-design-pdf-158-pages

[^7]: https://bytebytego.com/courses/system-design-interview

[^8]: https://github.com/ishanrakitha/ByteByteGoHQ-system-design-101

[^9]: https://bytebytego.com/?fpr=javarevisited

[^10]: https://www.linkedin.com/posts/vijaymallepudi_system-design-pdfs-activity-7329878123980738560-TypS

[^11]: https://github.com/ByteByteGoHq/system-design-101

[^12]: https://bytebytego.com/guides/how-it-works/

[^13]: https://www.linkedin.com/posts/tarun-jajoria_systemdesign-machinelearning-generativeai-activity-7369036520697143298-xocs

[^14]: https://bytebytego.com/courses/system-design-interview/scale-from-zero-to-millions-of-users

[^15]: https://x.com/bytebytego?lang=en

[^16]: https://blog.bytebytego.com/p/ep160-top-20-system-design-concepts

