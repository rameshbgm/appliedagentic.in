// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import sanitizeHtml from 'sanitize-html'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: parse .mhtml files and extract plain text
// ─────────────────────────────────────────────────────────────────────────────

/** Decode MIME quoted-printable encoding. */
function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, '')            // soft line breaks
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/** Strip HTML tags using sanitize-html, returning clean readable text. */
function stripHtml(html: string): string {
  // Allow no tags — converts all content to plain text
  const text = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    // Preserve whitespace around block-level elements
    textFilter: (text) => text,
  })
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n')
}

const NAV_RE = /^(Skip to content|Home|Menu|Previous|Next|Resources|Help|Navigation|Close)$/

/** Remove navigation chrome lines from extracted text. */
function removeNavLines(text: string): string {
  return text.split('\n').filter(l => !NAV_RE.test(l.trim())).join('\n')
}

/** Wrap each paragraph of plain text in <p> tags for storage as HTML. */
function textToHtml(text: string): string {
  return text
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<p>${l.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`)
    .join('\n')
}

/**
 * Extract clean plain text from an .mhtml (MIME HTML) file.
 * Handles multipart/related MIME with quoted-printable encoding.
 */
function extractMhtmlContent(filePath: string): string {
  const raw = fs.readFileSync(filePath, 'utf-8')

  // Find the first text/html part
  const htmlPartMatch = raw.match(/Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]+?)(?:\r?\n------MultipartBoundary|$)/i)
  if (!htmlPartMatch) return ''

  let htmlContent = htmlPartMatch[1]

  // Decode quoted-printable if needed
  const headerBlock = raw.slice(0, htmlPartMatch.index! + 200)
  if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(headerBlock.slice(-500))) {
    htmlContent = decodeQuotedPrintable(htmlContent)
  }

  const text = removeNavLines(stripHtml(htmlContent))

  // Drop the repeated module-level header line if present
  const lines = text.split('\n')
  if (lines[0]?.includes('Module 1') && lines[0]?.includes('Foundations')) {
    lines.shift()
  }
  return lines.join('\n')
}

// Map each Module 1 topic title to its .mhtml source file
const MODULE1_DIR = path.join(__dirname, '..', 'docs', 'learningmoduls',
  'Module 1 Foundations of Generative and Agentic AI')

const module1ContentMap: Record<string, string> = {
  'Generative AI Fundamentals':
    '1. Generative AI Fundamentals.mhtml',
  'AI Chatbots: Past, Present, and Future':
    '2. AI Chatbots- Past, Present, and Future.mhtml',
  'Cost-Optimized Models and Performance Trade-Offs':
    '3. Cost-Optimized Models and Performance Trade-Offs.mhtml',
  'Exploring Multimedia and Language Interaction Models':
    '4. Exploring Multimedia and Language Interaction Models.mhtml',
  'Advanced Applications of Generative AI Tools':
    '5. Advanced Applications of Generative AI Tools.mhtml',
}

function getModule1ArticleContent(topicTitle: string): { content: string; summary: string; readingTimeMinutes: number } {
  const fileName = module1ContentMap[topicTitle]
  if (!fileName) {
    return {
      content: `<h1>${topicTitle}</h1><p>This article is currently being written. Check back soon for the complete content.</p>`,
      summary: `Comprehensive guide to ${topicTitle}.`,
      readingTimeMinutes: 5,
    }
  }

  const filePath = path.join(MODULE1_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Source file not found: ${filePath}`)
    return {
      content: `<h1>${topicTitle}</h1><p>Content source file not found.</p>`,
      summary: `Comprehensive guide to ${topicTitle}.`,
      readingTimeMinutes: 5,
    }
  }

  const plainText = extractMhtmlContent(filePath)
  const content   = textToHtml(plainText)
  const wordCount = plainText.split(/\s+/).length
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  const summaryText = plainText.slice(0, 300).replace(/\n/g, ' ').trim()
  const summary = summaryText.length < plainText.length ? summaryText + '…' : summaryText

  return { content, summary, readingTimeMinutes }
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const modules = [
  {
    title: 'Foundations of Generative and Agentic AI',
    slug: 'module-1-foundations',
    orderIndex: 1,
    icon: '🧠',
    color: '#6C3DFF',
    shortDescription: 'Build your foundational knowledge in Generative AI, large language models, chatbots, cost optimization, and multimedia AI interaction.',
    topics: [
      'Generative AI Fundamentals',
      'AI Chatbots: Past, Present, and Future',
      'Cost-Optimized Models and Performance Trade-Offs',
      'Exploring Multimedia and Language Interaction Models',
      'Advanced Applications of Generative AI Tools',
    ],
  },
  {
    title: 'The Rise of Agentic AI and Emerging Platforms',
    slug: 'module-2-rise-agentic',
    orderIndex: 2,
    icon: '🚀',
    color: '#00D4FF',
    shortDescription: 'Explore the evolution from simple AI to autonomous agents, emerging platforms, and the critical debate between single and multi-agent architectures.',
    topics: [
      'Emerging Agentic Platforms',
      'Vibe Living',
      'Single vs. Multi-Agent Architectures',
      'Open-Source vs. Closed-Source AI Systems',
    ],
  },
  {
    title: 'Connecting Agents to Digital Ecosystems',
    slug: 'module-3-connecting-agents',
    orderIndex: 3,
    icon: '🔗',
    color: '#FF6B6B',
    shortDescription: 'Learn how to integrate agentic AI into existing digital workflows, legacy systems, and customer-facing applications.',
    topics: [
      'Building Agents into Existing Workflows',
      'Integrating Generative and Agentic AI with Existing Systems: Challenges and Solutions',
      'Spotify MCP and Other Edge-cases of Agent Integration',
      'Empathy and Response-Tuning for Customer-Facing Agents',
    ],
  },
  {
    title: 'Agent Risks, Disinformation, and Systemic Impact',
    slug: 'module-4-agent-risks',
    orderIndex: 4,
    icon: '⚠️',
    color: '#FFD93D',
    shortDescription: 'Understand the cybersecurity risks of agent ecosystems, disinformation threats, and the systemic limitations of autonomous AI perception.',
    topics: [
      'Classic and Current Cybersecurity Risks',
      'Cybersecurity for Agent Ecosystems',
      'Limitations of Agent Perception and Error Correction',
    ],
  },
  {
    title: 'AI Agents by Business Function',
    slug: 'module-5-business-function',
    orderIndex: 5,
    icon: '💼',
    color: '#4ECDC4',
    shortDescription: 'Discover how AI agents are deployed across HR, finance, IT, and product development, and learn about enterprise architecture patterns.',
    topics: [
      'The Maturity Cycle of Agentic Implementation (Crawl–Walk–Run)',
      'Advantages of Agentic AI for the Product Development Cycle',
      'Functional Deployments: HR Bots, Finance Advisors and IT Copilots',
      'Agent Architecture in the Enterprise: Centralized vs. Embedded',
    ],
  },
  {
    title: 'The Last Mile – From Pilot to Practice',
    slug: 'module-6-last-mile',
    orderIndex: 6,
    icon: '🏁',
    color: '#FF9F43',
    shortDescription: 'Bridge the gap between AI proof-of-concept and full-scale deployment — addressing voice agents, internal resistance, and performance monitoring.',
    topics: [
      'Voice Agents: Synthesis, Phone Systems, and Real-time Applications',
      'Last-mile Integration: Why Pilots Succeed but Deployments Stall',
      'Internal Resistance and Change Management',
      'Monitoring Agent Performance (Metrics, KPIs, Feedback Loops)',
    ],
  },
  {
    title: 'Governance, Compliance, and Agent Testing',
    slug: 'module-7-governance',
    orderIndex: 7,
    icon: '⚖️',
    color: '#A29BFE',
    shortDescription: 'Navigate the regulatory landscape (GDPR, CCPA, HIPAA) and learn how to test, sandbox, and document agentic systems for compliance.',
    topics: [
      'Regulation Overview: GDPR, CCPA, HIPAA, and Emerging Agent Rules',
      'Testing Agent Behavior: Sandboxing, A/B Testing, Safety Checks',
      'Agent Speed vs. Oversight: Where to Insert Guardrails',
      'Documentation and Compliance Readiness',
    ],
  },
  {
    title: 'Strategy Capstone – Leading the Agentic Future',
    slug: 'module-8-strategy-capstone',
    orderIndex: 8,
    icon: '🎯',
    color: '#55EFC4',
    shortDescription: 'Develop a comprehensive agentic AI strategy — from roadmap to team structure, organizational culture, and maturity assessment.',
    topics: [
      'Strategic Roadmap Development (Short-, Medium-, Long-Term)',
      'Team Structure, Vendor Choice, and Internal Capability Building',
      'Organizational Culture and Leadership for Agent Adoption',
      'Summary of Technical Enablers and Business Opportunities',
      'Maturity Assessment of Agent Strategy – Change Management',
    ],
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin@123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@appliedagentic.com' },
    update: {},
    create: {
      email: 'admin@appliedagentic.com',
      passwordHash,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  })
  console.log(`✅ Admin user created: ${adminUser.email}`)

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: 'Applied Agentic AI',
      tagline: 'Master Agentic AI — From Foundations to Enterprise Strategy',
      metaDescription: 'The definitive knowledge hub for AI professionals mastering Generative and Agentic AI for organizational transformation.',
      footerText: '© 2026 Applied Agentic AI. All rights reserved.',
    },
  })
  console.log('✅ Site settings created')

  // Create modules and topics
  for (const moduleData of modules) {
    const module = await prisma.module.upsert({
      where: { slug: moduleData.slug },
      update: {},
      create: {
        name: moduleData.title,
        slug: moduleData.slug,
        order: moduleData.orderIndex,
        icon: moduleData.icon,
        color: moduleData.color,
        description: moduleData.shortDescription,
        isPublished: true,
      },
    })
    console.log(`📦 Module created: ${module.name}`)

    for (let i = 0; i < moduleData.topics.length; i++) {
      const topicTitle = moduleData.topics[i]
      const topicSlug = slugify(`module-${moduleData.orderIndex}-${topicTitle}`)

      const topic = await prisma.topic.upsert({
        where: { slug: topicSlug },
        update: {},
        create: {
          moduleId: module.id,
          name: topicTitle,
          slug: topicSlug,
          order: i + 1,
          color: moduleData.color,
          isPublished: true,
          description: `An in-depth exploration of ${topicTitle} within the context of ${moduleData.title}.`,
        },
      })
      console.log(`  📚 Topic created: ${topic.name}`)

      // Create an article for each topic; Module 1 topics use real extracted content
      const articleSlug = slugify(topicTitle)
      const existingArticle = await prisma.article.findUnique({ where: { slug: articleSlug } })

      if (!existingArticle) {
        // Use real content extracted from .mhtml for Module 1; placeholder for others
        const articleData = moduleData.orderIndex === 1
          ? getModule1ArticleContent(topicTitle)
          : {
              content: `<h1>${topicTitle}</h1><p>This article is currently being written. Check back soon for the complete content.</p>`,
              summary: `Comprehensive guide to ${topicTitle} — covering key concepts, practical applications, and strategic implications for organizations adopting agentic AI.`,
              readingTimeMinutes: 5,
            }

        const article = await prisma.article.create({
          data: {
            title: topicTitle,
            slug: articleSlug,
            summary: articleData.summary,
            content: articleData.content,
            status: moduleData.orderIndex === 1 ? 'PUBLISHED' : 'DRAFT',
            publishedAt: moduleData.orderIndex === 1 ? new Date() : null,
            readingTimeMinutes: articleData.readingTimeMinutes,
            authorId: adminUser.id,
            seoTitle: `${topicTitle} | Applied Agentic AI`,
            seoDescription: `Learn about ${topicTitle} in the context of organizational AI transformation.`,
          },
        })

        // Link article to topic
        await prisma.topicArticle.create({
          data: {
            topicId: topic.id,
            articleId: article.id,
            orderIndex: 1,
          },
        })
        console.log(`    📝 Article created: ${article.title}`)
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Seed Nav Menus & Sub-Menus
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n📋 Seeding nav menus …')

  const navMenusData = [
    {
      title: 'AI Foundations',
      slug: 'ai-foundations',
      description: 'Core concepts and fundamentals of artificial intelligence and generative AI.',
      order: 1,
      subMenus: [
        { title: 'Generative AI Basics', slug: 'generative-ai-basics', description: 'Introduction to generative AI models and capabilities.', order: 1 },
        { title: 'Large Language Models', slug: 'large-language-models', description: 'Understanding LLMs, transformers, and prompt engineering.', order: 2 },
        { title: 'AI Tools & Platforms', slug: 'ai-tools-platforms', description: 'Overview of popular AI tools and development platforms.', order: 3 },
      ],
    },
    {
      title: 'Agentic AI',
      slug: 'agentic-ai',
      description: 'Explore autonomous AI agents, multi-agent systems, and real-world applications.',
      order: 2,
      subMenus: [
        { title: 'What Are AI Agents', slug: 'what-are-ai-agents', description: 'Defining AI agents and their architecture patterns.', order: 1 },
        { title: 'Multi-Agent Systems', slug: 'multi-agent-systems', description: 'Designing systems where multiple agents collaborate.', order: 2 },
        { title: 'Agent Frameworks', slug: 'agent-frameworks', description: 'LangChain, CrewAI, AutoGen, and other agentic frameworks.', order: 3 },
        { title: 'Real-World Use Cases', slug: 'real-world-use-cases', description: 'Production deployments and case studies of AI agents.', order: 4 },
      ],
    },
    {
      title: 'Resources',
      slug: 'resources',
      description: 'Curated learning resources, tutorials, and community guides.',
      order: 3,
      subMenus: [
        { title: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides for building AI applications.', order: 1 },
        { title: 'Research Papers', slug: 'research-papers', description: 'Key academic papers and industry reports.', order: 2 },
      ],
    },
  ]

  for (const menuData of navMenusData) {
    const menu = await prisma.navMenu.upsert({
      where: { slug: menuData.slug },
      update: { title: menuData.title, description: menuData.description, order: menuData.order },
      create: { title: menuData.title, slug: menuData.slug, description: menuData.description, order: menuData.order, isVisible: true },
    })
    console.log(`  📂 Menu: ${menu.title}`)

    for (const subData of menuData.subMenus) {
      const sub = await prisma.navSubMenu.upsert({
        where: { slug: subData.slug },
        update: { title: subData.title, description: subData.description, order: subData.order, menuId: menu.id },
        create: { title: subData.title, slug: subData.slug, description: subData.description, order: subData.order, menuId: menu.id, isVisible: true },
      })
      console.log(`    └─ SubMenu: ${sub.title}`)
    }
  }

  console.log('\n✨ Seed completed successfully!')
  console.log('\n🔐 Admin credentials (CHANGE BEFORE PRODUCTION):')
  console.log('   Email: admin@appliedagentic.com')
  console.log('   Password: Admin@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
