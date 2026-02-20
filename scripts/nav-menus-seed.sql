-- =============================================================
-- AppliedAgentic.in — Nav Menus & Sub-Menus Seed Data
-- Run: mysql -u <user> -p <database> < scripts/nav-menus-seed.sql
-- =============================================================

-- Clear existing data (child first)
DELETE FROM `SubMenuArticle`;
DELETE FROM `NavSubMenu`;
DELETE FROM `NavMenu`;

-- Reset auto-increment counters
ALTER TABLE `NavMenu` AUTO_INCREMENT = 1;
ALTER TABLE `NavSubMenu` AUTO_INCREMENT = 1;

-- =============================================================
-- NAV MENUS
-- =============================================================

INSERT INTO `NavMenu` (`id`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(1, 'AI Foundations',   'ai-foundations',   'Core concepts behind modern AI — from basic machine learning to prompt engineering and responsible use.', 1, 1, NOW(), NOW()),
(2, 'Agentic AI',       'agentic-ai',       'Everything about autonomous AI agents — how they think, plan, use tools, and work in multi-agent systems.',        2, 1, NOW(), NOW()),
(3, 'RAG',              'rag',              'Retrieval-Augmented Generation from first principles — architecture, chunking, evaluation and debugging.',          3, 1, NOW(), NOW()),
(4, 'Applied Projects', 'applied-projects', 'Hands-on projects ranging from beginner chatbots to advanced multi-agent and RAG-powered systems.',                4, 1, NOW(), NOW()),
(5, 'Tools & Frameworks','tools-frameworks','A practical guide to LLM providers, orchestration frameworks, vector databases and developer utilities.',           5, 1, NOW(), NOW()),
(6, 'Learning Paths',   'learning-paths',   'Structured, role-based roadmaps — from complete beginner to AI architect and career-ready practitioner.',          6, 1, NOW(), NOW());

-- =============================================================
-- NAV SUB-MENUS
-- =============================================================

-- ── Menu 1: AI Foundations ──────────────────────────────────
INSERT INTO `NavSubMenu` (`id`, `menuId`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(1,  1, 'AI Basics',          'ai-basics',          'What AI is, how machine learning relates to deep learning, and the three core learning paradigms.',           1, 1, NOW(), NOW()),
(2,  1, 'LLM Fundamentals',   'llm-fundamentals',   'How large language models work, what tokens and context windows mean, and when to fine-tune vs prompt.',     2, 1, NOW(), NOW()),
(3,  1, 'Prompt Engineering', 'prompt-engineering', 'Patterns and techniques for writing effective prompts — roles, instructions, context, examples and code.',   3, 1, NOW(), NOW()),
(4,  1, 'Ethics & Safety',    'ethics-safety',      'Reducing hallucinations, understanding bias, and applying responsible-use principles in real products.',     4, 1, NOW(), NOW());

-- ── Menu 2: Agentic AI ──────────────────────────────────────
INSERT INTO `NavSubMenu` (`id`, `menuId`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(5,  2, 'Agentic Concepts',  'agentic-concepts',  'What an AI agent is, how tools, memory and planning fit together, and single- vs multi-agent architectures.',  1, 1, NOW(), NOW()),
(6,  2, 'Agent Workflows',   'agent-workflows',   'Task decomposition, tool-calling pipelines and patterns for long-running background agents.',                  2, 1, NOW(), NOW()),
(7,  2, 'Use Cases',         'use-cases',         'Real-world agent deployments: customer support, internal knowledge assistants and workflow automation.',       3, 1, NOW(), NOW()),
(8,  2, 'Design & Pitfalls', 'design-pitfalls',   'Common failure modes, guardrails, safety considerations and how to measure agent performance.',               4, 1, NOW(), NOW());

-- ── Menu 3: RAG ─────────────────────────────────────────────
INSERT INTO `NavSubMenu` (`id`, `menuId`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(9,  3, 'RAG Basics',      'rag-basics',      'What RAG is, why it beats plain fine-tuning for most use cases, and the typical end-to-end architecture.',   1, 1, NOW(), NOW()),
(10, 3, 'Data & Chunking', 'data-chunking',   'Preparing documents, choosing chunk sizes, trade-offs between strategies, and embedding dimensions.',         2, 1, NOW(), NOW()),
(11, 3, 'Architectures',   'architectures',   'Simple Q&A RAG, multi-step iterative retrieval, and agentic RAG patterns at a glance.',                       3, 1, NOW(), NOW()),
(12, 3, 'Evaluation',      'evaluation',      'Measuring answer quality, debugging bad responses, and balancing cost vs latency in production.',             4, 1, NOW(), NOW());

-- ── Menu 4: Applied Projects ────────────────────────────────
INSERT INTO `NavSubMenu` (`id`, `menuId`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(13, 4, 'Beginner Projects',     'beginner-projects',     'Build your first chatbot over PDFs and a simple FAQ bot for a website.',                              1, 1, NOW(), NOW()),
(14, 4, 'Intermediate Projects', 'intermediate-projects', 'Internal knowledge base assistant and an email summarization pipeline.',                              2, 1, NOW(), NOW()),
(15, 4, 'Advanced Projects',     'advanced-projects',     'Multi-agent support assistant and full workflow orchestration with agents and RAG.',                  3, 1, NOW(), NOW()),
(16, 4, 'Case Studies',          'case-studies',          'Two complete end-to-end project walk-throughs from problem definition to production deployment.',      4, 1, NOW(), NOW());

-- ── Menu 5: Tools & Frameworks ──────────────────────────────
INSERT INTO `NavSubMenu` (`id`, `menuId`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(17, 5, 'Model Providers',      'model-providers',      'Overview of major LLM providers and how to choose the right model for each use case.',                 1, 1, NOW(), NOW()),
(18, 5, 'Orchestration Tools',  'orchestration-tools',  'High-level comparison of popular agent and RAG orchestration frameworks.',                             2, 1, NOW(), NOW()),
(19, 5, 'Vector Databases',     'vector-databases',     'What vector databases are, how similarity search works, and how to choose a vector store.',            3, 1, NOW(), NOW()),
(20, 5, 'Utilities',            'utilities',            'Embeddings, tokenization, metrics, logging and monitoring tools for AI applications.',                  4, 1, NOW(), NOW());

-- ── Menu 6: Learning Paths ──────────────────────────────────
INSERT INTO `NavSubMenu` (`id`, `menuId`, `title`, `slug`, `description`, `order`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(21, 6, 'Beginner Path',   'beginner-path',   'Step-by-step plan to go from zero to your first working chatbot, with the essential concepts to learn first.', 1, 1, NOW(), NOW()),
(22, 6, 'Builder Path',    'builder-path',    'Structured plans to build and ship your first RAG app and your first practical agent.',                         2, 1, NOW(), NOW()),
(23, 6, 'Architect Path',  'architect-path',  'Designing AI systems end-to-end with a focus on evaluation, observability and governance.',                     3, 1, NOW(), NOW()),
(24, 6, 'Career Guides',   'career-guides',   'Roles in applied AI, skills maps and roadmaps to grow from practitioner to architect.',                         4, 1, NOW(), NOW());
