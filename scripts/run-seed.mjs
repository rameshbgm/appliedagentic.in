import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seed() {
  await prisma.subMenuArticle.deleteMany()
  await prisma.navSubMenu.deleteMany()
  await prisma.navMenu.deleteMany()
  console.log('Cleared existing menus')

  const menus = [
    { title: 'AI Foundations',     slug: 'ai-foundations',   description: 'Core concepts behind modern AI — from basic machine learning to prompt engineering and responsible use.', order: 1, isVisible: true },
    { title: 'Agentic AI',         slug: 'agentic-ai',       description: 'Everything about autonomous AI agents — how they think, plan, use tools, and work in multi-agent systems.', order: 2, isVisible: true },
    { title: 'RAG',                slug: 'rag',              description: 'Retrieval-Augmented Generation from first principles — architecture, chunking, evaluation and debugging.', order: 3, isVisible: true },
    { title: 'Applied Projects',   slug: 'applied-projects', description: 'Hands-on projects from beginner chatbots to advanced multi-agent and RAG-powered systems.', order: 4, isVisible: true },
    { title: 'Tools & Frameworks', slug: 'tools-frameworks', description: 'LLM providers, orchestration frameworks, vector databases and developer utilities.', order: 5, isVisible: true },
    { title: 'Learning Paths',     slug: 'learning-paths',   description: 'Structured role-based roadmaps — from complete beginner to AI architect.', order: 6, isVisible: true },
  ]

  const created = []
  for (const m of menus) {
    const rec = await prisma.navMenu.create({ data: m })
    created.push(rec)
    console.log('  Menu:', rec.title, '(id:', rec.id + ')')
  }

  const menuBySlug = Object.fromEntries(created.map(m => [m.slug, m.id]))

  const subs = [
    // AI Foundations
    { menuSlug: 'ai-foundations', title: 'AI Basics',          slug: 'ai-basics',           description: 'What AI is, how machine learning relates to deep learning, and the three core learning paradigms.', order: 1 },
    { menuSlug: 'ai-foundations', title: 'LLM Fundamentals',   slug: 'llm-fundamentals',    description: 'How large language models work, what tokens and context windows mean, and when to fine-tune vs prompt.', order: 2 },
    { menuSlug: 'ai-foundations', title: 'Prompt Engineering',  slug: 'prompt-engineering',  description: 'Patterns and techniques for writing effective prompts — roles, instructions, context, examples and code.', order: 3 },
    { menuSlug: 'ai-foundations', title: 'Ethics & Safety',     slug: 'ethics-safety',       description: 'Reducing hallucinations, understanding bias, and applying responsible-use principles.', order: 4 },
    // Agentic AI
    { menuSlug: 'agentic-ai', title: 'Agentic Concepts',  slug: 'agentic-concepts',  description: 'What an AI agent is, how tools, memory and planning fit together, and agent architectures.', order: 1 },
    { menuSlug: 'agentic-ai', title: 'Agent Workflows',   slug: 'agent-workflows',   description: 'Task decomposition, tool-calling pipelines and patterns for long-running background agents.', order: 2 },
    { menuSlug: 'agentic-ai', title: 'Use Cases',         slug: 'use-cases',         description: 'Real-world deployments: customer support, knowledge assistants and workflow automation.', order: 3 },
    { menuSlug: 'agentic-ai', title: 'Design & Pitfalls', slug: 'design-pitfalls',   description: 'Common failure modes, guardrails, safety considerations and measuring agent performance.', order: 4 },
    // RAG
    { menuSlug: 'rag', title: 'RAG Basics',      slug: 'rag-basics',    description: 'What RAG is, why it beats plain fine-tuning for most cases, and the typical end-to-end architecture.', order: 1 },
    { menuSlug: 'rag', title: 'Data & Chunking', slug: 'data-chunking', description: 'Preparing documents, choosing chunk sizes, trade-offs between strategies, and embedding dimensions.', order: 2 },
    { menuSlug: 'rag', title: 'Architectures',   slug: 'architectures', description: 'Simple Q&A RAG, multi-step iterative retrieval, and agentic RAG patterns.', order: 3 },
    { menuSlug: 'rag', title: 'Evaluation',      slug: 'evaluation',    description: 'Measuring answer quality, debugging bad responses, and balancing cost vs latency.', order: 4 },
    // Applied Projects
    { menuSlug: 'applied-projects', title: 'Beginner Projects',     slug: 'beginner-projects',     description: 'Build your first chatbot over PDFs and a simple FAQ bot for a website.', order: 1 },
    { menuSlug: 'applied-projects', title: 'Intermediate Projects', slug: 'intermediate-projects', description: 'Internal knowledge base assistant and an email summarization pipeline.', order: 2 },
    { menuSlug: 'applied-projects', title: 'Advanced Projects',     slug: 'advanced-projects',     description: 'Multi-agent support assistant and full workflow orchestration with agents and RAG.', order: 3 },
    { menuSlug: 'applied-projects', title: 'Case Studies',          slug: 'case-studies',          description: 'Two complete end-to-end project walk-throughs from problem definition to deployment.', order: 4 },
    // Tools & Frameworks
    { menuSlug: 'tools-frameworks', title: 'Model Providers',     slug: 'model-providers',     description: 'Overview of major LLM providers and how to choose the right model for each use case.', order: 1 },
    { menuSlug: 'tools-frameworks', title: 'Orchestration Tools', slug: 'orchestration-tools', description: 'High-level comparison of popular agent and RAG orchestration frameworks.', order: 2 },
    { menuSlug: 'tools-frameworks', title: 'Vector Databases',    slug: 'vector-databases',    description: 'What vector databases are, how similarity search works, and how to choose a vector store.', order: 3 },
    { menuSlug: 'tools-frameworks', title: 'Utilities',           slug: 'utilities',           description: 'Embeddings, tokenization, metrics, logging and monitoring tools for AI applications.', order: 4 },
    // Learning Paths
    { menuSlug: 'learning-paths', title: 'Beginner Path',  slug: 'beginner-path',  description: 'Step-by-step plan to go from zero to your first working chatbot.', order: 1 },
    { menuSlug: 'learning-paths', title: 'Builder Path',   slug: 'builder-path',   description: 'Plans to build and ship your first RAG app and your first practical agent.', order: 2 },
    { menuSlug: 'learning-paths', title: 'Architect Path', slug: 'architect-path', description: 'Designing AI systems end-to-end with evaluation, observability and governance.', order: 3 },
    { menuSlug: 'learning-paths', title: 'Career Guides',  slug: 'career-guides',  description: 'Roles in applied AI, skills maps and roadmaps to grow from practitioner to architect.', order: 4 },
  ]

  for (const s of subs) {
    const { menuSlug, ...data } = s
    await prisma.navSubMenu.create({ data: { ...data, menuId: menuBySlug[menuSlug], isVisible: true } })
  }
  console.log('Inserted', subs.length, 'sub-menus')
  console.log('✅ Done!')
}

seed().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
