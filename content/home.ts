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
    'Deep-dive into AI agents, LLMs, RAG pipelines, prompt engineering and modern agentic systems — with practical, production-grade content.',

  ctas: {
    primary:   { label: 'Explore Modules', href: '/modules' },
    secondary: { label: 'Browse Articles', href: '/articles' },
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
  badge:           'Browse Topics',
  headline:        'Everything you need to master',
  headlineAccent:  'Agentic AI',
  subheadline:     'Six topic areas covering foundations, hands-on projects, tools and career paths.',
}

// ─── Featured Articles Section ─────────────────────────────────────────────────
export const featuredArticlesContent = {
  badge:          'Featured Articles',
  headline:       'Start',
  headlineAccent: 'Learning',
  viewAllLabel:   'All articles',
  viewAllHref:    '/articles',
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────
export const ctaBannerContent = {
  headline:       'Ready to master',
  headlineAccent: 'Agentic AI?',
  subheadline:
    'Structured learning paths, practical examples, and comprehensive coverage of modern AI agent systems.',
  primaryCta:   { label: 'Start Learning',   href: '/ai-foundations' },
  secondaryCta: { label: 'Browse Articles',  href: '/articles'       },
}
