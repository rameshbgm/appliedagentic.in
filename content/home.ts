// content/home.ts
// All static text for the public home page (app/(public)/page.tsx)

// ─── Hero Section ───────────────────────────────────────────────────────────────
export const heroContent = {
  badge: 'The Applied AI Knowledge Hub',

  headline: {
    line1: 'Master',
    line2: 'AI Agents',
  },

  /** Cycles through these words/phrases in the typewriter below the headline */
  typewriterTopics: [
    'AI Agents',
    'LLM Systems',
    'RAG Pipelines',
    'Prompt Engineering',
    'Agentic Patterns',
    'Production AI',
  ],

  subheadline:
    'Build, deploy, and reason about AI agents — from LLM fundamentals to production-ready agentic workflows.',

  ctas: {
    primary:   { label: 'Explore Articles', href: '/modules' },
    secondary: { label: 'Browse Topics',   href: '/#topics'   },
  },

  /** Stats whose values are always static */
  staticStats: [
    { value: '100%', label: 'Free to Read' },
    { value: 'Live', label: 'AI Content'   },
  ],
  /** Labels for dynamic stats fetched from the DB */
  dynamicStatLabels: {
    modules:  'Learning Modules',
    articles: 'In-depth Articles',
  },
}

// ─── Browse Topics Section ─────────────────────────────────────────────────────
export const browseTopicsContent = {
  badge:           'Learning Modules',
  headline:        'Everything you need to master',
  headlineAccent:  'Agentic AI',
  subheadline:     'From first principles to production - structured paths through AI agents, LLMs, RAG, and the tools that power real-world agentic systems.',
}

// ─── Featured Articles Section ─────────────────────────────────────────────────
export const featuredArticlesContent = {
  badge:          'Featured Articles',
  headline:       'Start',
  headlineAccent: 'Learning',
  viewAllLabel:   'All articles',
  viewAllHref:    '/modules',
}

// ─── Hero rotating messages (shown every 7s with random neon color) ──────────
export const heroRotatingMessages: string[] = [
  'Build and deploy AI agents that plan, act, and adapt in real-world environments.',
  'Go beyond prompting. Learn the architecture behind autonomous, tool-using AI systems.',
  'From RAG pipelines to multi-agent orchestration, learn what actually works in production.',
  'Master the core patterns of real AI agents: memory, planning, tools, and self-reflection.',
  'The internet runs on APIs. The future runs on agents. Learn to build both.',
  'Structured paths from first principles all the way to deployed reasoning AI systems.',
  'LLMs are the engine. Agents are the vehicle. This is where you learn to drive.',
  'Explore the full agentic AI stack: models, memory, tools, and orchestration layers.',
  'Every great AI product starts with understanding how language models reason and act.',
  'Cut through the hype with deep, practical knowledge on agentic systems that actually ship.',
  'From zero-shot prompts to autonomous agents that plan, act, and self-correct at scale.',
  'Learn to build AI that does not just respond. It decides, acts, and adapts over time.',
  'The era of single-turn chatbots is over. Welcome to the age of agentic AI.',
  'Understand how agents perceive inputs, reason over context, and take meaningful actions.',
  'Production AI is not about clever prompts. It is about robust, observable, reliable systems.',
  'RAG, tool-calling, memory, and planning. Master every pillar of modern agentic design.',
  'AI agents that work in the real world require far more than a capable base model.',
  'From transformer internals to deployment pipelines, deep coverage with zero fluff.',
  'Build agents that solve real problems, not just demos that impress for five minutes.',
  'The shift from assistants to agents is the most significant platform transition in software.',
  'Agentic AI is the new full-stack discipline. Understand the entire execution chain.',
  'Practical, production-focused content on LLMs, agents, RAG, and everything in between.',
  'Learn how leading teams are building reliable, observable, agentic AI systems right now.',
  'Not just tutorials. Mental models. Not just demos. Deployable, production-grade patterns.',
  'Go deep on the systems that will define how software is built for the next decade.',
  'Every module is built around what actually ships, not what looks good in a notebook.',
  'Understand why AI agents fail in production and learn to build systems that do not.',
  'Context windows, tool use, and multi-step reasoning form the core of agentic AI.',
  'Agents that browse, code, search, and synthesise knowledge. Learn to orchestrate them.',
  'The next generation of engineers will build with, around, and directly on top of LLMs.',
  'Grounding, retrieval, evaluation, and safety are the parts that make AI products real.',
  'Move past prompt curiosity and into serious agentic systems engineering.',
  'Learn to design AI agents that are robust, auditable, and genuinely useful in practice.',
  'The best agentic systems feel like magic outside and sound engineering on the inside.',
  'Understand attention, embeddings, and reasoning chains beyond surface-level API calls.',
  'From local models to cloud-scale multi-agent pipelines, cover the full deployment spectrum.',
  'Agentic AI rewards systems thinkers. Start building that thinking from the ground up.',
  'The foundations are never optional. Every great agent engineer deeply understands the model.',
  'Hands-on, structured, opinionated learning designed for serious AI builders.',
  'Retrieval-augmented generation done right with real architecture, evaluation, and tradeoffs.',
  'Build agents with long-term memory, persistent state, and broad real-world tool access.',
  'Not just what LLMs can do, but how to reliably make them perform at production scale.',
  'Every lesson is written for engineers who want to ship products, not just run experiments.',
  'Autonomous agents need more than raw intelligence. They need guardrails and observability.',
  'From fine-tuning intuition to production RLHF, understand how models are shaped over time.',
  'Multi-agent systems, role specialization, and coordination patterns covered in real depth.',
  'The gap between an AI demo and an AI product is systems engineering. Build that bridge here.',
  'Real-world agentic AI sits at the intersection of software, product, and cognitive architecture.',
  'Knowledge graphs, vector stores, and semantic search power the memory layer of modern AI.',
  'Applied means usable. Learn agentic AI the way professionals build production systems.',
]

// ─── CTA Banner ──────────────────────────────────────────────────────────────────────────────────────
export const ctaBannerContent = {
  headline:       'Ready to master',
  headlineAccent: 'Agentic AI?',
  subheadline:
    'Structured learning paths, practical examples, and comprehensive coverage of modern AI agent systems.',
  primaryCta:   { label: 'Start Learning',   href: '#topics'        },
  secondaryCta: { label: 'Browse Articles',  href: '/search'        },
}
