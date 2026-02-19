// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

      // Create a draft article for each topic
      const articleSlug = slugify(topicTitle)
      const existingArticle = await prisma.article.findUnique({ where: { slug: articleSlug } })

      if (!existingArticle) {
        const article = await prisma.article.create({
          data: {
            title: topicTitle,
            slug: articleSlug,
            summary: `Comprehensive guide to ${topicTitle} — covering key concepts, practical applications, and strategic implications for organizations adopting agentic AI.`,
            content: `<h1>${topicTitle}</h1><p>This article is currently being written. Check back soon for the complete content.</p>`,
            status: 'DRAFT',
            readingTimeMinutes: 5,
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
