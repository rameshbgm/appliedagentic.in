// scripts/seed-nav-menus.ts
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

  const created: { id: number; slug: string }[] = []
  for (const m of menus) {
    const r = await prisma.navMenu.create({ data: m })
    created.push({ id: r.id, slug: r.slug })
    console.log('  Menu:', r.title)
  }

  const bySlug: Record<string, number> = {}
  for (const c of created) bySlug[c.slug] = c.id

  const subs: { ms: string; t: string; s: string; d: string; o: number }[] = [
    // AI Foundations
    { ms: 'ai-foundations', t: 'AI Basics',           s: 'ai-basics',           d: 'What AI is, how machine learning relates to deep learning, and the three core learning paradigms.', o: 1 },
    { ms: 'ai-foundations', t: 'LLM Fundamentals',    s: 'llm-fundamentals',    d: 'How large language models work, tokens and context windows, and when to fine-tune vs prompt.', o: 2 },
    { ms: 'ai-foundations', t: 'Prompt Engineering',  s: 'prompt-engineering',  d: 'Patterns for writing effective prompts — roles, instructions, context, examples and code generation.', o: 3 },
    { ms: 'ai-foundations', t: 'Ethics & Safety',     s: 'ethics-safety',       d: 'Reducing hallucinations, understanding bias, and responsible-use principles.', o: 4 },
    // Agentic AI
    { ms: 'agentic-ai', t: 'Agentic Concepts',  s: 'agentic-concepts',  d: 'What an AI agent is, how tools, memory and planning fit together, and agent architectures.', o: 1 },
    { ms: 'agentic-ai', t: 'Agent Workflows',   s: 'agent-workflows',   d: 'Task decomposition, tool-calling pipelines and patterns for long-running background agents.', o: 2 },
    { ms: 'agentic-ai', t: 'Use Cases',         s: 'use-cases',         d: 'Real-world deployments: customer support, knowledge assistants and workflow automation.', o: 3 },
    { ms: 'agentic-ai', t: 'Design & Pitfalls', s: 'design-pitfalls',   d: 'Common failure modes, guardrails, safety considerations and measuring agent performance.', o: 4 },
    // RAG
    { ms: 'rag', t: 'RAG Basics',      s: 'rag-basics',    d: 'What RAG is, why it beats fine-tuning for most cases, and the typical end-to-end architecture.', o: 1 },
    { ms: 'rag', t: 'Data & Chunking', s: 'data-chunking', d: 'Preparing documents, choosing chunk sizes, trade-offs between strategies, and embedding dimensions.', o: 2 },
    { ms: 'rag', t: 'Architectures',   s: 'architectures', d: 'Simple Q&A RAG, multi-step iterative retrieval, and agentic RAG patterns.', o: 3 },
    { ms: 'rag', t: 'Evaluation',      s: 'evaluation',    d: 'Measuring answer quality, debugging bad responses, and balancing cost vs latency.', o: 4 },
    // Applied Projects
    { ms: 'applied-projects', t: 'Beginner Projects',     s: 'beginner-projects',     d: 'Build your first chatbot over PDFs and a simple FAQ bot for a website.', o: 1 },
    { ms: 'applied-projects', t: 'Intermediate Projects', s: 'intermediate-projects', d: 'Internal knowledge base assistant and an email summarization pipeline.', o: 2 },
    { ms: 'applied-projects', t: 'Advanced Projects',     s: 'advanced-projects',     d: 'Multi-agent support assistant and full workflow orchestration with agents and RAG.', o: 3 },
    { ms: 'applied-projects', t: 'Case Studies',          s: 'case-studies',          d: 'Two complete end-to-end project walk-throughs from problem definition to deployment.', o: 4 },
    // Tools & Frameworks
    { ms: 'tools-frameworks', t: 'Model Providers',     s: 'model-providers',     d: 'Overview of major LLM providers and choosing the right model for each use case.', o: 1 },
    { ms: 'tools-frameworks', t: 'Orchestration Tools', s: 'orchestration-tools', d: 'High-level comparison of popular agent and RAG orchestration frameworks.', o: 2 },
    { ms: 'tools-frameworks', t: 'Vector Databases',    s: 'vector-databases',    d: 'What vector databases are, how similarity search works, and choosing a vector store.', o: 3 },
    { ms: 'tools-frameworks', t: 'Utilities',           s: 'utilities',           d: 'Embeddings, tokenization, metrics, logging and monitoring tools for AI applications.', o: 4 },
    // Learning Paths
    { ms: 'learning-paths', t: 'Beginner Path',  s: 'beginner-path',  d: 'Step-by-step plan to go from zero to your first working chatbot.', o: 1 },
    { ms: 'learning-paths', t: 'Builder Path',   s: 'builder-path',   d: 'Plans to build your first RAG app and your first practical agent.', o: 2 },
    { ms: 'learning-paths', t: 'Architect Path', s: 'architect-path', d: 'Designing AI systems end-to-end with evaluation, observability and governance.', o: 3 },
    { ms: 'learning-paths', t: 'Career Guides',  s: 'career-guides',  d: 'Roles in applied AI, skills maps and roadmaps to grow from practitioner to architect.', o: 4 },
  ]

  for (const s of subs) {
    await prisma.navSubMenu.create({
      data: { menuId: bySlug[s.ms], title: s.t, slug: s.s, description: s.d, order: s.o, isVisible: true },
    })
  }

  console.log(`Inserted ${subs.length} sub-menus`)
  console.log('✅ Done!')
}

seed()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
