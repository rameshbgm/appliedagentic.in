-- =============================================================================
-- Module 1 DML: Seed Data extracted from Module 1 .mhtml files
-- =============================================================================

-- Admin user (password: Admin@123  — CHANGE BEFORE PRODUCTION)
INSERT IGNORE INTO `User` (`email`, `passwordHash`, `name`, `role`, `updatedAt`)
VALUES (
    'admin@appliedagentic.com',
    '$2a$12$placeholder_replace_with_real_bcrypt_hash',
    'Admin User',
    'ADMIN',
    NOW()
);

-- Site settings
INSERT IGNORE INTO `SiteSettings`
    (`id`, `siteName`, `tagline`, `metaDescription`, `footerText`, `updatedAt`)
VALUES (
    1,
    'Applied Agentic AI',
    'Master Agentic AI — From Foundations to Enterprise Strategy',
    'The definitive knowledge hub for AI professionals mastering Generative and Agentic AI for organizational transformation.',
    '© 2026 Applied Agentic AI. All rights reserved.',
    NOW()
);

-- Module 1
INSERT IGNORE INTO `Module`
    (`name`, `slug`, `order`, `description`, `icon`, `color`, `isPublished`, `updatedAt`)
VALUES (
    'Foundations of Generative and Agentic AI',
    'module-1-foundations',
    1,
    'Build your foundational knowledge in Generative AI, large language models, chatbots, cost optimization, and multimedia AI interaction.',
    '\U0001f9e0',
    '#6C3DFF',
    true,
    NOW()
);

-- Module 1 Topics
INSERT IGNORE INTO `Topic`
    (`moduleId`, `name`, `slug`, `order`, `description`, `color`, `isPublished`, `updatedAt`)
SELECT m.id, 'Generative AI Fundamentals', 'module-1-generative-ai-fundamentals', 1,
       'An in-depth exploration of Generative AI Fundamentals within the context of Foundations of Generative and Agentic AI.',
       '#6C3DFF', true, NOW()
FROM `Module` m WHERE m.slug = 'module-1-foundations';

INSERT IGNORE INTO `Topic`
    (`moduleId`, `name`, `slug`, `order`, `description`, `color`, `isPublished`, `updatedAt`)
SELECT m.id, 'AI Chatbots: Past, Present, and Future', 'module-1-ai-chatbots-past-present-and-future', 2,
       'An in-depth exploration of AI Chatbots: Past, Present, and Future within the context of Foundations of Generative and Agentic AI.',
       '#6C3DFF', true, NOW()
FROM `Module` m WHERE m.slug = 'module-1-foundations';

INSERT IGNORE INTO `Topic`
    (`moduleId`, `name`, `slug`, `order`, `description`, `color`, `isPublished`, `updatedAt`)
SELECT m.id, 'Cost-Optimized Models and Performance Trade-Offs', 'module-1-cost-optimized-models-and-performance-trade-offs', 3,
       'An in-depth exploration of Cost-Optimized Models and Performance Trade-Offs within the context of Foundations of Generative and Agentic AI.',
       '#6C3DFF', true, NOW()
FROM `Module` m WHERE m.slug = 'module-1-foundations';

INSERT IGNORE INTO `Topic`
    (`moduleId`, `name`, `slug`, `order`, `description`, `color`, `isPublished`, `updatedAt`)
SELECT m.id, 'Exploring Multimedia and Language Interaction Models', 'module-1-exploring-multimedia-and-language-interaction-models', 4,
       'An in-depth exploration of Exploring Multimedia and Language Interaction Models within the context of Foundations of Generative and Agentic AI.',
       '#6C3DFF', true, NOW()
FROM `Module` m WHERE m.slug = 'module-1-foundations';

INSERT IGNORE INTO `Topic`
    (`moduleId`, `name`, `slug`, `order`, `description`, `color`, `isPublished`, `updatedAt`)
SELECT m.id, 'Advanced Applications of Generative AI Tools', 'module-1-advanced-applications-of-generative-ai-tools', 5,
       'An in-depth exploration of Advanced Applications of Generative AI Tools within the context of Foundations of Generative and Agentic AI.',
       '#6C3DFF', true, NOW()
FROM `Module` m WHERE m.slug = 'module-1-foundations';


-- Module 1 Articles (content extracted from .mhtml files)
INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Module 1 Overview: Foundations of Generative and Agentic AI',
    'module-1-overview',
    'Module 1 Foundations of Generative and Agentic AI Start Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time. Menu button: Click the menu button to open up a list of all the modules in the...',
    '<p>Module 1</p>
<p>Foundations of Generative and Agentic AI</p>
<p>Start</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    1,
    u.id,
    'Module 1 Overview: Foundations of Generative and Agentic AI | Applied Agentic AI',
    'Module 1 Foundations of Generative and Agentic AI Start Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB Forward/Back arrows: Click the Forward and Back arrows to move through the module on',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Introduction',
    'module-1-introduction',
    'Introduction Digital transformation is more than just a trendy buzzword—it is a deep shift in how organizations harness digital technologies to unlock value, streamline operations, and keep their customer base satisfied. With the 2020s generative AI revolution in the rearview mirror and the agentic...',
    '<p>Introduction</p>
<p>Digital transformation is more than just a trendy buzzword—it is a deep shift in how organizations harness digital technologies to unlock value, streamline operations, and keep their customer base satisfied. With the 2020s generative AI revolution in the rearview mirror and the agentic AI revolution in the test driving stages, this process is reaching an entirely new phase. We are talking about systems that can create original content, think through challenges, and carry out complex, multi-step tasks all on their own.</p>
<p>Imagine an AI that not only writes an appealing, precisely targeted marketing email but also tests subject lines, schedules the campaign, and adjusts offers in real time based on customer responses. Or picture a financial assistant that not only generates projections but flags anomalies, runs what-if scenarios, and even drafts board-ready slide decks summarizing its insights. Agentic AI is set to transform every link in your value chain—working alongside human teams to do more, faster, with fewer hand-offs.</p>
<p>In this module, we will ground you in the fundamentals of generative AI. First, it is essential to understand the core principles and technology fueling the vast abilities of generative AI chatbots like the near-instant generation of text, images, and video and how this lays the groundwork for AI agents which can take initiative, chain together tasks, and make autonomous decisions. By the end of this module, you will not only speak the language of generative AI, but you will be ready to build on that knowledge with advanced workflows and agentic systems later in the course.</p>
<p>Important Note</p>
<p>The cursor icon indicates that an element is interactive. You will see these icons above clickable images, drop-down menus, pop-ups, and more. Click on them to reveal more information.</p>
<p>Glossary</p>
<p>Throughout the module, you will encounter new and important terminology. Download and save this glossary as a useful reference when studying the content.</p>
<p>Download the Glossary</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    2,
    u.id,
    'Introduction | Applied Agentic AI',
    'Introduction Digital transformation is more than just a trendy buzzword—it is a deep shift in how organizations harness digital technologies to unlock value, streamline operations, and keep their cust',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Table of Contents',
    'module-1-table-of-contents',
    'Table of Contents 1. Generative AI Fundamentals Uses of Generative AI The Underlying Architecture of Generative AI A Brief History of AI: How Did We Get Here? 2. AI Chatbots: Past, Present, and Future The Evolution of AI Chatbot Technology Strategic Applications: Transforming the Customer Experience...',
    '<p>Table of Contents</p>
<p>1. Generative AI Fundamentals</p>
<p>Uses of Generative AI</p>
<p>The Underlying Architecture of Generative AI</p>
<p>A Brief History of AI: How Did We Get Here?</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>The Evolution of AI Chatbot Technology</p>
<p>Strategic Applications: Transforming the Customer Experience</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>The Role of Cost-Optimized Models</p>
<p>What Actually Creates Cost in AI?</p>
<p>Performance Trade-Offs: Choosing Wisely</p>
<p>How Do We Navigate These Elements?</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>Audio Generation</p>
<p>Image Generation</p>
<p>Underlying Technologies</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>A Generative AI Toolbox for Better Organizational Performance</p>
<p>Case Study: Amarra</p>
<p>The Coming Wave of Agentic AI</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    1,
    u.id,
    'Table of Contents | Applied Agentic AI',
    'Table of Contents 1. Generative AI Fundamentals Uses of Generative AI The Underlying Architecture of Generative AI A Brief History of AI: How Did We Get Here? 2. AI Chatbots: Past, Present, and Future',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Learning Objectives',
    'module-1-learning-objectives',
    'Learning Objectives In Module 1, “Foundations of Generative and Agentic AI,” you will learn from MIT professors Dr. John Williams and Dr. Abel Sanchez how to: Understand the evolution and landscape of generative AI Familiarize yourself with the terminology and categories of AI models Recognize the s...',
    '<p>Learning Objectives</p>
<p>In Module 1, “Foundations of Generative and Agentic AI,” you will learn from MIT professors Dr. John Williams and Dr. Abel Sanchez how to:</p>
<p>Understand the evolution and landscape of generative AI</p>
<p>Familiarize yourself with the terminology and categories of AI models</p>
<p>Recognize the strategic value of different AI functionalities (e.g., chatbots, reasoning, and multimedia)</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    1,
    u.id,
    'Learning Objectives | Applied Agentic AI',
    'Learning Objectives In Module 1, “Foundations of Generative and Agentic AI,” you will learn from MIT professors Dr. John Williams and Dr. Abel Sanchez how to: Understand the evolution and landscape of',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Generative AI Fundamentals',
    'generative-ai-fundamentals',
    '1. Generative AI Fundamentals In 2022, the launch of ChatGPT 3.5 created an unprecedented level of excitement in the technology world (Sanchez, 2025). For the very first time, millions of people could access advanced AI capabilities through any Internet browser using plain language. In contrast, bef...',
    '<p>1. Generative AI Fundamentals</p>
<p>In 2022, the launch of ChatGPT 3.5 created an unprecedented level of excitement in the technology world (Sanchez, 2025). For the very first time, millions of people could access advanced AI capabilities through any Internet browser using plain language. In contrast, before ChatGPT appeared on the scene, using an AI model had often required specialized knowledge.</p>
<p>Thanks to its ability to understand and produce natural language, ChatGPT could generate text-based content, such as poems, songs, short stories, and essays, within seconds. (Murphy, 2023)</p>
<p>Undoubtedly, ChatGPT (and competitors such as Claude and Google Gemini) was a game changer. Nevertheless, these generative AI-powered models are merely stepping stones on the road to an even greater revolution that is waiting in the wings—the rise of semi-autonomous agentic AI systems. Throughout this course, we will explore the technology and capabilities of agentic AI systems in detail.</p>
<p>In this first section, we will look at the capabilities and technical foundations of generative AI systems.</p>
<p>Uses of Generative AI</p>
<p>Generative AI is already driving massive improvements in efficiency and productivity.  Take the customer service sector, where on average, companies have seen productivity gains of between 15% and 30% due to generative AI innovations. (Tordjman et al., 2025).</p>
<p>Let’s explore how generative AI-driven content creation can help to streamline workflows across organizations.</p>
<p>Written Content</p>
<p>Written Content</p>
<p>Generative AI can significantly reduce the time needed to develop written materials, such as marketing copy, executive summaries, and proposal drafts. Let’s say that you prompted ChatGPT or Gemini to draft a 250-word blog post about a sustainable sneaker line for a marketing campaign. The chatbot would produce a polished first draft in just seconds.</p>
<p>Audio</p>
<p>Audio</p>
<p>AI-driven audio synthesis enables the rapid production of sound effects, background music, and even fully narrated voice content. By specifying attributes like tempo, instrumentation, and mood, you can receive multiple audio options ready for immediate use.</p>
<p>AI tools such as ElevenLabs can produce authentic-sounding replications of human voices, accurately mimicking tone, pronunciation, and inflection, enabling organizations to utilize the technology for voice-overs or even to generate virtual spokespeople.</p>
<p>Images and Video</p>
<p>Images and Video</p>
<p>Nowadays, any commercial AI chatbot can almost instantly transform a single text prompt into fully realized, high-quality visuals.  A request such as “Generate a photorealistic image of an electric-powered SUV by the seaside at sunset,” would enable an automaker to produce several concept visuals in moments. Marketing teams can iterate on layouts, product mockups, and campaign imagery internally, accelerating time-to-market and reducing dependence on external agencies.</p>
<p>Furthermore, generative AI’s capabilities now extend into video synthesis. Programs like Synthesia and Runway, among others, can generate short promotional clips, animated product demos, or dynamic social media content directly from text prompts, opening new avenues for rich multimedia storytelling.</p>
<p>Coding</p>
<p>Coding</p>
<p>The code generation capabilities of generative AI assistants can streamline software development by producing boilerplate code, API integrations, and unit-test scaffolds from minimal specifications. For instance, asking “Write a Python function for user authentication with JWT support” instantly delivers a functional piece of code.</p>
<p>As a result, software engineering teams could gradually shift their focus from coding to more creative tasks requiring uniquely human critical thinking and problem-solving abilities, like performance tuning and feature development.</p>
<p>Speech-to-Text</p>
<p>Speech-to-Text</p>
<p>Speech-to-text services can convert meetings, customer calls, and presentations into accurate, searchable transcripts in real time. These transcripts can feed downstream processes and enhance decision-making and compliance. They also ensure accessibility for all stakeholders.</p>
<p>Text-to-Speech</p>
<p>Text-to-Speech</p>
<p>Text-to-Speech engines can generate natural-sounding voice outputs from any written script, supporting applications like virtual assistants, telephone menus, and multilingual e-learning products. This capability enables 24/7 audio-driven services without recurring recording costs and ensures consistency across global customer-facing touchpoints.</p>
<p>(Mollick, 2022; Mozilla, 2023; McKinsey, 2024)</p>
<p>The Underlying Architecture of Generative AI</p>
<p>At times, generative AI may feel like magic, but it is built on well-established machine-learning principles and clever model designs. In the next section, we will walk through the key components, using real-world examples to illustrate how they come together.</p>
<p>Machine Learning Foundations</p>
<p>At its core, generative AI is powered by machine learning, the foundational technology of large language models (LLMs). Without it, generative AI would not exist as we know it. Machine learning involves training algorithms on large datasets to recognize patterns, make predictions, and improve performance over time, without being explicitly programmed.</p>
<p>Until recently, machine learning centered on the development of predictive models that detected and sorted patterns. To illustrate this, let’s consider a predictive AI model trained on multiple images of cats. Such a model would learn the visual features common to those “adorable cats” and then scan new images to find those matching the learned pattern.</p>
<p>Generative AI is far more powerful. Instead of merely identifying cats, these systems can produce new and unique images as well as generate written descriptions of said cats on demand. (McKinsey, 2024)</p>
<p>Neural Networks</p>
<p>Neural Networks</p>
<p>Neural networks are the engines which power LLMs and enable them to model and learn complex relationships at scale. (Stöffelbauer, 2023)</p>
<p>Loosely inspired by the structure of the human brain, neural networks are composed of interconnected nodes organized in layers, where each one processes input data to recognize patterns and make predictions.</p>
<p>Deep Learning</p>
<p>Deep Learning</p>
<p>Deep learning is a specialized branch of machine learning focused on unstructured data like text and images. The term “deep learning” refers to the fact that neural networks can be made up of large numbers of layers (in other words, they are deep). For example, ChatGPT is based on an artificial neural network of 176 billion neurons, almost double the 100 billion neurons found in the human brain. (Stöffelbauer, 2023)</p>
<p>In deep learning, data is processed in a hierarchical manner, extracting complex features at each level. Thanks to this approach, deep learning models can perform natural language processing tasks with a high degree of accuracy.</p>
<p>GANs</p>
<p>Generative Adversarial Networks</p>
<p>GANs consist of two neural networks: a generator and a discriminator. The generator creates fake data while the discriminator evaluates whether the data is real or fake (Candido, n.d.).</p>
<p>The two networks train together in a competitive process, improving each other over time: the generator aims to produce increasingly realistic data, while the discriminator improves at detecting fakes.</p>
<p>Definition</p>
<p>Natural language processing (NLP) encompasses the broader field of teaching machines to understand and generate human language. It provides the techniques that underpin LLMs and transformer models.</p>
<p>Large Language Models (LLMs)</p>
<p>Large language models, such as ChatGPT and Claude, are specialized deep-learning networks designed to predict and generate human language. They are built using transformers, which use self-attention mechanisms to process entire sequences of text in parallel.</p>
<p>Let’s take a closer look at the key components of LLMs:</p>
<p>Language modeling</p>
<p>Neural networks train LLMs on massive sets of data to teach them to predict the next word in a sequence, no matter its length, its language of origin, or format. Ultimately, LLMs are capable of handling any form of natural language, whether it is a poem, a piece of code, or a mathematical formula.</p>
<p>Transformers</p>
<p>Transformers use a mechanism called self-attention to weigh the importance of each word against all others in the input data. This allows them to maintain context over long passages, which is essential for chatbots\' text generation capabilities.</p>
<p>Unlike traditional neural networks, transformers are probabilistic.  ChatGPT, starting with GPT-3, was a milestone in the evolution of transformer-based models.</p>
<p>(Mozilla, 2023; Stöffelbauer,﻿ 2023)</p>
<p>To transform this architectural foundation into the engine that powers modern AI models, LLMs must undergo a multi-stage training process:</p>
<p>Pre-Training</p>
<p>The model analyzes massive amounts of data—from books and articles to code repositories—to learn the statistical patterns of language. As it trains, the LLM adjusts its internal weights, or the numerical values that determine the strength of connections between neurons in artificial neural networks, improving the model’s ability to make predictions and effectively building a broad “language intuition.”</p>
<p>Once it has been pre-trained, the model is further trained on a specialized dataset (e.g., transcripts from customer support interactions). The goal is to align the AI model’s outputs with domain-specific vocabulary and tone. This step tailors the generalist LLM into a purpose-built AI assistant.</p>
<p>Fine-Tuning</p>
<p>Reinforcement Learning</p>
<p>Human evaluators review model outputs, scoring them for relevance, accuracy, and style. These scores feed back into the training loop, guiding the model toward responses that better match human expectations.</p>
<p>(Stöffelbauer, 2023)</p>
<p>How a Large Language Model Works</p>
<p>Consider a customer-service chatbot powered by generative AI. The chatbot first receives a customer’s message, saying, “I haven’t received my order.” Each word is converted into a numerical vector that helps to capture their semantic relationships. These vectors then get passed through multiple neural network layers—early layers detect keywords and simple patterns (common phrases like “haven’t received”), while deeper layers attempt to infer the intent of the customer’s request. Thanks to deep learning, the model is capable of piecing together certain cues (negation in “haven’t,” reference to “order”) into a high-level understanding: the customer is asking for help tracking a missing shipment.</p>
<p>Next, the model calculates probabilities across possible intents (“track orders,” “cancel order,” “get a refund,” etc.) and selects the most likely one (“track order”) based on learned patterns. Finally, the chatbot generates a coherent reply: “I’m sorry to hear that. Could you please provide the order number so I can check its status?”</p>
<p>Prompt Engineering</p>
<p>A surprisingly powerful lever, prompt engineering is the practice of crafting inputs that guide a generative AI model toward the desired output. (Dougherty, 2024). Good prompts act like well-worded briefs, ensuring that AI focuses on the right details, tone, and structure.</p>
<p>Consider the following prompts. Which one would provide a more useful foundation for a company press release on its sustainability initiatives?</p>
<p>Write about why sustainability is important for our organization.</p>
<p>Draft a one-paragraph executive summary of how our new solar-powered warehouse helps to reduce energy consumption and contributes to our larger goals of becoming a more sustainable organization.</p>
<p>A Brief History of AI: How Did We Get Here?</p>
<p>This is only a foretaste of what is to come, and only the shadow of what is going to be. We have to have some experience with the machine before we really know its capabilities... but I do not see why it should not enter any one of the fields normally covered by the human intellect, and eventually compete on equal terms.</p>
<p>Alan Turing</p>
<p>British mathematician (1912-1954)</p>
<p>The origins of artificial intelligence can be traced back to 1950, when Alan Turing, the “father of computer science,” posed the question, “Can machines think?” (Williams, 2024). Turing introduced the Turing test, which can measure the intelligence of a test subject and can be used to determine whether a machine can demonstrate human intelligence. (Investopedia, 2024). Modern variations of the Turing test continue to be deployed in AI research and development.</p>
<p>1956</p>
<p>John McCarthy, one of the founding fathers of the artificial intelligence field, first coins the term “artificial intelligence,” for a proposal presented at the seminal Dartmouth Summer Research Project on Artificial Intelligence.</p>
<p>﻿ (IEEE, n.d.)Image source: (IEEE, n.d.)</p>
<p>1966</p>
<p>MIT professor Joseph Weizenbaum creates the first chatbot, ELIZA, which simulates conversations with a psychotherapist.</p>
<p>Image source: (Wikimedia, 2024)</p>
<p>1997</p>
<p>An IBM supercomputer known as Deep Blue wins a match against then-reigning world chess champion Garry Kasparov.</p>
<p>Image source: (IBM, n.d.)</p>
<p>2012</p>
<p>AlexNet revolutionizes the field by winning the annual ImageNet Large Scale Visualization Recognition Challenge (ILSVRC) competition designed to evaluate the performance of algorithms used to classify images (Klinger, 2024). The model introduced major innovations in neural network technology, with its success proving that deep learning was the future.</p>
<p>2014</p>
<p>The concept of the generative adversarial network (GAN) is developed by Ian Goodfellow and colleagues at the University of Montreal.</p>
<p>2016</p>
<p>DeepMind’s Alpha Go defeats world champion Go player Lee Sedol, demonstrating the capabilities of reinforcement learning and deep neural networks in mastering complex games.</p>
<p>2017</p>
<p>Transformer architecture is introduced by Google researchers in their paper “Attention is All You Need.” Its use of self-attention mechanisms revolutionizes large-scale language modeling and helps make a variety of natural language processing tasks, such as machine translation and text generation, a reality.</p>
<p>2018-present</p>
<p>OpenAI introduces the first version of the generative pre-trained transformer (GPT) model, kickstarting the era of large-scale pre-trained large language models.</p>
<p>Each version of the model, including GPT-2 (2019), GPT-3 (2020), and GPT-4 (2024), is a massive leap forward in capability and scale, culminating in the release of GPT-4o. This latest version supports real-time voice conversations, can respond to visual inputs such as photos and screenshots more effectively, and can even search the Internet.</p>
<p>2023</p>
<p>The release of LangChain, an open-source framework for the development of applications using LLMs, helped to facilitate the process of building new chatbots and AI agents for tech enthusiasts and enterprises alike (IBM, 2023).</p>
<p>Conclusion</p>
<p>Generative AI’s journey, from early rule-based experiments to today’s transformer-powered models, has shown us how machines can learn patterns, create content, and engage in conversation almost as fluently as humans.</p>
<p>As we move forward, agentic AI will build on these foundations by adding autonomy: systems that not only generate outputs but also set goals, make decisions, and act on them with minimal guidance. In Module 2, we will explore how agentic AI architectures differ, what practical use cases they unlock, and the leadership considerations for safely integrating these self-directed agents into your organization’s strategy.</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    12,
    u.id,
    'Generative AI Fundamentals | Applied Agentic AI',
    '1. Generative AI Fundamentals In 2022, the launch of ChatGPT 3.5 created an unprecedented level of excitement in the technology world (Sanchez, 2025). For the very first time, millions of people could',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'AI Chatbots: Past, Present, and Future',
    'ai-chatbots-past-present-and-future',
    '2. AI Chatbots: Past, Present, and Future The Evolution of AI Chatbot Technology Chatbot capabilities have evolved significantly since MIT professor Joseph Weizenbaum created ELIZA, the world’s first chatbot, in 1966. Basic chatbots Conversational agents Generative AI chatbots The first generation o...',
    '<p>2. AI Chatbots: Past, Present, and Future</p>
<p>The Evolution of AI Chatbot Technology</p>
<p>Chatbot capabilities have evolved significantly since MIT professor Joseph Weizenbaum created ELIZA, the world’s first chatbot, in 1966.</p>
<p>Basic chatbots</p>
<p>Conversational agents</p>
<p>Generative AI chatbots</p>
<p>The first generation of chatbots were rule-based, using algorithms to detect keywords and provide pre-determined responses. Lacking natural language processing (NLP) capabilities, they were limited in scope and output (Murphy, 2023). These types of chatbots were often used in customer support contexts to help people find answers to frequently asked questions. For example, customers would be offered predefined options (e.g. order status, change password) and the chatbot would provide scripted replies based on users’ selections.</p>
<p>In the early 2010s, thanks to advancements in machine learning (ML), a new generation of chatbots, known as conversational agents, became available (Murphy, 2023). These models could understand natural language more accurately, learn from past examples, and complete more complex tasks. Examples of these include IBM Watson, Siri, and Alexa.</p>
<p>As we saw in the previous section, developments in the late 2010s, such as transformer-based neural networks and LLMs, paved the way for a new generation of generative AI chatbots. Unlike the traditional, rules-based AI chatbots, these models could handle larger and more complex volumes of customer queries and provide personalized responses that sound so natural, one might think they had been produced by a human customer service agent (Marr, 2024).</p>
<p>In the past few years, we have begun to observe the rise of a new generation of AI chatbots which are capable of even more complex, multi-step problem solving and which are ultimately the key to achieving greater levels of AI intelligence.</p>
<p>Reasoning Models</p>
<p>Reasoning models, such as Open AI’s o3 and o4 models, are the most recent milestone in the evolution of AI chatbots. These models are trained to spend more time processing queries and thinking through problems before responding, like a human analyst would. (Williams, 2025).  This new generation of models has already demonstrated significant improvement on tasks requiring complex reasoning in areas such as science, coding, and math. (Paul &amp; Tong, 2024).</p>
<p>How do these new models work? Like a chef following a detailed recipe, they can break down queries into smaller tasks. Unlike previous versions of generative AI models, they can do this semi-autonomously, without explicit user prompting for each step. This process incorporates an approach known as chain-of-thought prompting.</p>
<p>While there are clear advantages to reasoning models, there are a few key disadvantages to consider, primarily longer processing time and a higher investment in computational resources. In addition, AI hallucination remains an inherent risk of LLMs. Hallucination is a phenomenon where AI models produce outputs that are not informed by any training data or follow any recognized patterns, leading to instances where chatbots may produce false or inaccurate claims.  A study conducted by OpenAI found that on two different metrics used to measure the level of hallucination, its o4-mini model was more likely to hallucinate than earlier ChatGPT models. ﻿</p>
<p>Definition</p>
<p>Chain-of-thought prompting is designed to significantly improve the ability of LLMs to perform complex reasoning. It involves generating a series of intermediate natural language reasoning steps that lead to the final answer for a problem, simulating a human-like thought process for arriving at a solution.</p>
<p>Imagine asking a chatbot whether to expand into Market A or Market B. A chain-of-thought-enabled model would analyze each factor separately, such as market size, competition, and the regulatory environment, before providing its conclusion.</p>
<p>(Williams, 2025)</p>
<p>Recommended Video</p>
<p>In this video, Dr. John Williams provides an in-depth explanation of how chain-of-thought prompting works as well as its potential business applications, for instance, in the areas of financial analysis, strategic planning, and customer insight.</p>
<p>Chain-of-Thought Prompting</p>
<p>Chain-of-Thought Prompting</p>
<p>Agentic AI</p>
<p>Unlike traditional AI chatbots that react to user prompts, agentic AI can take action autonomously and proactively, adapt to context, and execute goals in a complex environment, all with minimal human intervention. (Coshow et al., 2025). According to MIT’s Dr. Abel Sanchez, an AI agent is essentially a workflow with tasks potentially involving humans.</p>
<p>Agentic AI has a wide array of potential use cases:</p>
<p>Automate customer experiences</p>
<p>Create and post content as part of an advertising campaign</p>
<p>Provide proactive sales intelligence and recommend next steps, such as upselling opportunities</p>
<p>Enable improved security systems that can monitor, report and act on their own initiative</p>
<p>Automate supply chains and planning</p>
<p>(Coshow et al., 2025)</p>
<p>We will explore the architecture and workings of agentic AI systems in greater detail starting in Module 2.</p>
<p>Recommended Video</p>
<p>In this video, IBM’s Martin Keen compares the capabilities and technical foundations of generative AI and agentic AI systems. While there are some overlapping similarities in the underlying technology, there are major differences in how each type of AI system functions.</p>
<p>Generative vs. Agentic AI</p>
<p>Generative vs. Agentic AI</p>
<p>Video Player</p>
<p>00:00</p>
<p>00:00</p>
<p>07:19</p>
<p>Use Up/Down Arrow keys to increase or decrease volume.</p>
<p>Strategic Applications: Transforming the Customer Experience</p>
<p>Compared to earlier iterations, today’s customer-facing chatbots have far more advanced capabilities. In addition to handling larger volumes of user queries, they can respond with much greater accuracy and nuance, as well as provide increasingly personalized responses based on customer data and previous interactions. (Marr, 2024).  In the coming years, AI customer experience agents could allow companies to automate a significant percentage of customer interactions while also boosting engagement. (Coshow et al., 2025)</p>
<p>Imagine this: Following a customer’s purchase, an AI agent analyzes their order history and communications, searching for patterns in their buying habits and identifying upselling opportunities.</p>
<p>Later that day, the agent sends a personalized thank you email to the customer, asking for feedback and suggesting a complimentary product that would appeal to them. In practice, this scenario would suggest a capacity to analyze and react to customer behavior that surpasses human abilities, while ensuring more precise and effective customer engagement.</p>
<p>While this future potential has not yet been fully realized, companies such as Klarna and Octopus Energy have already benefitted from major improvements in productivity, cost reductions, and even higher rates of customer satisfaction. Both cases are also practical examples of how customer service operations will increasingly incorporate generative AI applications to handle straightforward and/or repetitive tasks.</p>
<p>Klarna</p>
<p>Klarna</p>
<p>In 2024, the Swedish fintech company Klarna adopted an AI customer service assistant powered by OpenAI. The chatbot reportedly handled a workload equivalent to that of 700 full-time customer service agents in its first month. Furthermore, on several measures, the assistant delivered significant productivity improvements: Repeat inquiries fell by 25% due to a greater degree of accuracy in task resolution while the average speed of service was two minutes, compared to 11 minutes with human agents.</p>
<p>Octopus Energy</p>
<p>Octopus Energy</p>
<p>UK-based energy supplier Octopus Energy has built conversational AI powered by ChatGPT into its customer service channel and has designated responsibility to the chatbot for handling inquiries. According to the company, the system handles the work of 250 people and in a reflection of the initiative\'s success, the agent has received higher average customer satisfaction ratings than human customer service agents.</p>
<p>(Marr, 2024; Tordjman et al., 2025)</p>
<p>In the following Padlet, name one area of your company in which AI could enhance the workflow or add efficiency. After you have posted, respond to at least two people\'s posts.</p>
<p>To create a post, click the “+” button. Type your comment. Then, click “Publish” and your comment will appear anonymously. You can edit your post if you wish by clicking the menu (three dots) on the right side of your pin.</p>
<p>Important note: The following interactive element can be challenging to view or interact with on smaller handheld mobile devices. It is best to use a desktop, laptop, or tablet to ensure full accessibility. ​</p>
<p>Knowledge Check</p>
<p>Which of the following best describes a key difference between basic chatbots and generative AI chatbots?</p>
<p>Choose the correct answer and click &quot;Submit.&quot;</p>
<p>Basic chatbots use transformer-based neural networks to deliver human-like responses.</p>
<p>Generative AI chatbots rely solely on rule-based algorithms to generate replies.</p>
<p>Basic chatbots can analyze large datasets and provide personalized responses.</p>
<p>Generative AI chatbots can understand context and provide natural, human-like responses.</p>
<p>Submit</p>
<p>Please complete the activity before continuing.</p>
<p>Continue</p>
<p>Incorrect</p>
<p>The correct answer is: Generative AI chatbots can understand context and provide natural, human-like responses.</p>
<p>Continue</p>
<p>Correct</p>
<p>Congratulations! You\'ve successfully completed the activity.</p>
<p>Continue</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    8,
    u.id,
    'AI Chatbots: Past, Present, and Future | Applied Agentic AI',
    '2. AI Chatbots: Past, Present, and Future The Evolution of AI Chatbot Technology Chatbot capabilities have evolved significantly since MIT professor Joseph Weizenbaum created ELIZA, the world’s first ',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Cost-Optimized Models and Performance Trade-Offs',
    'cost-optimized-models-and-performance-trade-offs',
    '3. Cost-Optimized Models and Performance Trade-Offs As organizations explore the role of AI in digital transformation, it becomes increasingly important to understand not just what these systems can do— but how efficiently they can do it. In the real world, cost and performance are not just technica...',
    '<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>As organizations explore the role of AI in digital transformation, it becomes increasingly important to understand not just what these systems can do— but how efficiently they can do it. In the real world, cost and performance are not just technical considerations, but strategic ones. Choosing the most powerful model available may seem logical, but at scale, it could be economically unsustainable. Likewise, prioritizing low cost alone might limit the system’s utility. This section helps break down what drives cost in AI systems and how to think about performance trade-offs in real-world deployments.</p>
<p>The Role of Cost-Optimized Models</p>
<p>Let’s start with an analogy. Imagine your job is to get your kids to school. You buy a premium minivan—it is safe, fast, and can fit all their backpacks. It is a great solution. But now imagine your task is to get every kid in your town to school. Buying hundreds of high-end minivans suddenly becomes absurd—far too expensive, too resource-intensive, and might overwhelm the roads and school parking lots. Instead, you would likely consider alternatives: school buses, bike convoys, or walking groups. Why? Because at scale, the “best” solution is not always the most technologically advanced one.</p>
<p>This mirrors how we think about AI: deploying a top-tier system like GPT-4.5 for every chatbot or analysis task might look good on paper, but it may burn through budgets and processing time without adding proportionate value, making it the proverbial minivan. Instead, organizations must evaluate AI systems based on the right balance of cost and performance for the task at hand.</p>
<p>What Actually Creates Cost in AI?</p>
<p>There are three main contributors to the cost of running AI systems:</p>
<p>1. The Equipment (Compute Infrastructure)</p>
<p>1. The Equipment (Compute Infrastructure)</p>
<p>AI models run on powerful servers equipped with graphics processing units (GPUs) —specialized chips that can perform parallel computations extremely quickly. Whether you rent this infrastructure in the cloud (like AWS or Azure) or build it in-house, it is not cheap.</p>
<p>Larger models require more memory and processing power, which increases hardware demand. Some companies spend millions just to deploy or fine-tune a large model.</p>
<p>Even if you do not own the equipment yourself, you are paying for it every time you use a model hosted by OpenAI, Anthropic, or others—that is built into their pricing.</p>
<p>2. The System (AI Model Choice and Tokens)</p>
<p>2. The System (AI Model Choice + Tokens)</p>
<p>The biggest driver of usage-based cost is your choice of model—especially when it comes to large language models (LLMs) like GPT.</p>
<p>These models process language in tokens —units of text that are usually 3–4 characters long, or about 0.75 words. Both your input (the question you send) and output (the model’s response) are measured in tokens, and you pay for both. (OpenAI 2023)</p>
<p>Example:</p>
<p>You send a prompt that is 500 tokens.</p>
<p>The AI replies with 1,000 tokens.</p>
<p>If the model charges $0.06 per 1,000 output tokens and $0.03 per 1,000 input tokens, that interaction costs about $0.09.</p>
<p>Now imagine running that interaction 10,000 times per day. That is $900/day or $27,000/month—for what could have been a simple automated task.</p>
<p>As we will see later, some models are 500x more expensive than others for similar tasks. Even GPT-4.5 costs $150 per million output tokens, while GPT-4o mini costs just $0.60 per million, making it 250 times more expensive. That is a staggering difference with huge implications at scale.</p>
<p>3. The Energy (Electricity and Environmental Cost)</p>
<p>3. The Energy (Electricity and Environmental Cost)</p>
<p>AI models consume an enormous amount of electricity, especially when running on clusters of GPUs in data centers.</p>
<p>As AI systems scale and become more widely adopted, energy consumption becomes a real economic and environmental concern. That is why major AI companies are now investing in alternative energy solutions, including nuclear power, to lower costs and improve sustainability. (Patrizio, 2025)</p>
<p>Every prompt has a carbon footprint. And in high-volume applications, energy usage becomes an essential part of the cost-performance equation.</p>
<p>Performance Trade-Offs: Choosing Wisely</p>
<p>As mentioned in the opening minivan analogy, not all tasks need the most powerful AI model. Smart deployment is about making intelligent trade-offs—finding the right mix of speed, accuracy, cost, and context handling.</p>
<p>Here are some common trade-off categories:</p>
<p>Accuracy vs. Cost</p>
<p>Higher-end models (like GPT-4.5) tend to be more accurate and nuanced—but they are significantly more expensive. If you are building a medical diagnosis assistant, this level of precision might be necessary. But for a customer service bot? A cheaper model might be more than sufficient.</p>
<p>Speed vs. Power</p>
<p>Bigger models are slower to respond. For real-time applications (e.g. chatbots, virtual assistants), latency (processing time) matters. A lightweight model may sacrifice some accuracy but provide a far better user experience by responding instantly.</p>
<p>Context Length vs. Efficiency</p>
<p>Context length refers to how much information the model can “remember” in one go—like the running history of a conversation. GPT-4.5 supports 128,000 tokens; some newer models support up to 200,000. But not all use cases need that—and, counterintuitively, longer context support does not always mean higher cost. Some models handle long context more efficiently, offering both power and savings (like GPT-4o or OpenAI o3-mini) (Codingscape, 2024).</p>
<p>How Do We Navigate These Elements?</p>
<p>When designing AI solutions—whether as a student, engineer, or business leader—ask these questions.</p>
<p>What is the minimum level of accuracy we need?</p>
<p>How often will the model be used? (Usage volume changes everything.)</p>
<p>Can we use caching or cheaper models for certain tasks?</p>
<p>Is real-time performance important?</p>
<p>Does the model need to remember a lot (long context), or can it work with shorter prompts?</p>
<p>Choosing the right AI model is not just about power. It is about context, constraints, and consequences.</p>
<p>In the following video, Dr. Abel Sanchez takes us through a simple example of how to run content on an AI system and see the exact price the system charges.</p>
<p>Assignment: Evaluating the Cost of AI Systems</p>
<p>In this assignment, we will prompt GPT and then look at the associated charge on the account, gaining a better understanding of how we can optimize our product/service for cost.</p>
<p>Knowledge Check</p>
<p>Why might an organization avoid using a powerful AI model such as GPT-4.5 for all tasks?</p>
<p>Choose the correct answer and click &quot;Submit.&quot;</p>
<p>It cannot handle large volumes of data.</p>
<p>It provides low accuracy in real-time applications.</p>
<p>It may result in high operational costs without proportional performance benefits.</p>
<p>It lacks support for multiple languages.</p>
<p>Submit</p>
<p>Please complete the activity before continuing.</p>
<p>Continue</p>
<p>Incorrect</p>
<p>The correct answer is: It may result in high operational costs without proportional performance benefits</p>
<p>Continue</p>
<p>Correct</p>
<p>Congratulations! You\'ve successfully completed the activity.</p>
<p>Continue</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    6,
    u.id,
    'Cost-Optimized Models and Performance Trade-Offs | Applied Agentic AI',
    '3. Cost-Optimized Models and Performance Trade-Offs As organizations explore the role of AI in digital transformation, it becomes increasingly important to understand not just what these systems can d',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Exploring Multimedia and Language Interaction Models',
    'exploring-multimedia-and-language-interaction-models',
    '4. Exploring Multimedia and Language Interaction Models The subject of AI in relation to audio output or language comprehension sounds deceptively simple. As humans, we are so accustomed to comprehending speech, voice tone, and intonation that we often assume these processes happen effortlessly, but...',
    '<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>The subject of AI in relation to audio output or language comprehension sounds deceptively simple. As humans, we are so accustomed to comprehending speech, voice tone, and intonation that we often assume these processes happen effortlessly, but</p>
<p>any such elements require a complex technical architecture.</p>
<p>Along with these technologies comes a wide range of options. As we have seen in other areas of digital transformation, choosing wisely ensures not only technical appropriateness but also alignment with your business’s financial goals.</p>
<p>Before diving deeper, let’s establish some basic definitions. This will help you make valuable distinctions between seemingly similar functionalities, participate more effectively in stakeholder conversations, and conduct more nuanced research.</p>
<p>Audio Generation</p>
<p>Automatic Speech Recognition (ASR)</p>
<p>Definition: Converts spoken language into text</p>
<p>Common Uses: Meeting transcription, real-time captioning, command processing</p>
<p>Text-to-Speech (TTS)</p>
<p>Definition: Converts text into natural-sounding speech</p>
<p>Common Uses: News readers, voice assistants, voiceovers for content</p>
<p>Natural Language Understanding (NLU)</p>
<p>Definition: Parses transcribed audio to determine intent and context</p>
<p>Common Uses: Voice-based customer service, conversation agents</p>
<p>Voice Biometrics (optional but increasingly important)</p>
<p>Definition: Uses unique voice characteristics for speaker authentication</p>
<p>Growing Uses: Fintech, healthcare, high-security enterprise environments</p>
<p>Combinations of Technologies</p>
<p>As you will see throughout this course, these technologies can operate individually but are often combined to produce richer, more effective services and products. Below is a look at how these components are typically integrated across sectors.</p>
<p>Sector</p>
<p>Use Case</p>
<p>Tech Stack</p>
<p>Healthcare</p>
<p>Dictation, transcription, patient interaction</p>
<p>Whisper + NLP layer (HIPAA compliance needed) (Paubox, 2025)</p>
<p>Retail</p>
<p>Voice-based customer service kiosks</p>
<p>TTS + ASR + chatbot NLU (PYMNTS, 2024)</p>
<p>Education</p>
<p>Language learning, accessibility, lectures</p>
<p>TTS (multilingual) + voice grading (Wood et al., 2018)</p>
<p>Finance</p>
<p>Call center automation, sentiment analysis</p>
<p>ASR + NLU + analytics (Grace, 2025)</p>
<p>Automotive</p>
<p>In-car voice assistants</p>
<p>Edge-optimized ASR + embedded NLU (EE Times, 2025)</p>
<p>The Logistics of Generative AI-Powered Audio</p>
<p>Once you understand the core technologies and their combinations, it is important to factor in cost drivers. Audio AI can become surprisingly expensive based on several factors:</p>
<p>Real-Time vs. Batch Processing</p>
<p>Real-Time vs. Batch Processing</p>
<p>This is a crucial distinction affecting both functionality and cost.</p>
<p>Real-time audio systems respond with extremely low latency—typically under one second—making them essential for scenarios like car GPS systems that must communicate lane changes instantly.</p>
<p>Batch audio systems, by contrast, can take minutes or even hours to process information, which is fine for tasks like transcribing and summarizing a video conference after it ends.</p>
<p>Note: Real-time systems generally incur higher costs due to the need for continuous, low-latency computation. (GeeksforGeeks, 2024)</p>
<p>Language Support</p>
<p>Language Support</p>
<p>Language support refers to the availability and quality of audio AI in various languages.</p>
<p>Widely spoken languages (e.g., English, Mandarin) tend to have higher-quality models with more options for accents, voice types, and intonation.</p>
<p>Less common languages often suffer from lower quality outputs or limited options—and enhancing them usually incurs additional costs due to the need for specialized training.</p>
<p>Customization</p>
<p>Customization</p>
<p>Customization is critical for brand alignment and user experience.</p>
<p>You may need a voice reflecting specific qualities—such as language, accent, age, or emotional tone—that matches your brand identity.</p>
<p>On the comprehension side, models trained primarily on standard American English may struggle with regional variants like Scottish, Indian, or Nigerian English.</p>
<p>Cultural factors also matter: politeness, directness, and conversational styles vary globally and must be accounted for.</p>
<p>Warning: High levels of customization, such as building a fully on-brand voice, may require thousands of hours of training and substantial financial investment. It is a delicate balance between cost and quality. (Dialzara, 2024)</p>
<p>Data Privacy and Compliance</p>
<p>Data Privacy and Compliance</p>
<p>This is an especially complex, fast-changing, and consequential area.</p>
<p>Different regions enforce varying regulations, and a mistake here can lead to fines, lawsuits, or serious reputational damage. Enterprises must navigate a patchwork of laws such as:</p>
<p>European Union: General Data Protection Regulation (GDPR)</p>
<p>California, United States: California Consumer Privacy Act (CCPA)</p>
<p>United States healthcare sector: Health Insurance Portability and Accountability Act (HIPAA)</p>
<p>Brazil: Lei Geral de Proteção de Dados (General Law for the Protection of Personal Data)</p>
<p>Here are some major risk areas and their mitigations:</p>
<p>Risk</p>
<p>Example</p>
<p>Mitigation</p>
<p>Unconsented recording</p>
<p>Recording user voices without notification</p>
<p>Use explicit consent prompts and audio cues</p>
<p>Data retention</p>
<p>Storing audio indefinitely</p>
<p>Set strict retention policies, allow deletion</p>
<p>Biometric misuse</p>
<p>Using voiceprints without explicit consent</p>
<p>Require opt-in for voice biometrics</p>
<p>Third-party leakage</p>
<p>Sending user data to cloud APIs unsafely</p>
<p>Use strong contracts (DPAs), or keep data on-premises</p>
<p>Cross-border data transfer</p>
<p>Using U.S. servers for EU users</p>
<p>Comply with international transfer agreements (SCCs, DPF)</p>
<p>(Germanos et al., 2021)</p>
<p>Recommended Reading</p>
<p>In the following article, Duolingo will replace contract workers with AI﻿, see how Duolingo is implementing AI.</p>
<p>Image Generation</p>
<p>In the space of a few short years, the visual elements of generative and agentic AI have quickly moved from being a supplemental to essential part of most companies’ workflow. This is seen in all sectors across the economy.</p>
<p>Advertising and Marketing</p>
<p>AI-generated visuals streamline the creation of diverse ad creatives, enabling rapid A/B testing across platforms like Facebook and Instagram. By producing tailored images for different demographics, brands can enhance engagement and conversion rates. This approach reduces reliance on traditional photoshoots, saving time and costs while maintaining brand consistency.</p>
<p>(DataFeedWatch, 2025)</p>
<p>Entertainment</p>
<p>In entertainment, AI assists in generating concept art, character designs, and backgrounds, accelerating the creative process. Game developers and filmmakers use AI to visualize scenes and assets quickly, facilitating faster prototyping and iteration. This technology supports creative teams in exploring diverse artistic directions efficiently.</p>
<p>Retail and E-commerce</p>
<p>Retailers leverage AI to create product mockups and virtual try-ons, enhancing the online shopping experience. By generating realistic images of products in various settings or on different models, businesses can showcase offerings without extensive photoshoots. This capability aids in visual merchandising and personalized marketing.</p>
<p>(Moon Technolabs, 2025)</p>
<p>Architecture and Design</p>
<p>Architects utilize AI to produce 3D model sketches and design variations rapidly. This accelerates the conceptual phase, allowing for quick exploration of different architectural styles and layouts. AI-generated visuals assist in client presentations and iterative design processes.</p>
<p>Healthcare</p>
<p>In healthcare, AI augments medical imaging by enhancing image quality and aiding in diagnostics. It can generate synthetic medical images for training purposes, supporting the development of diagnostic models. This application improves accuracy in disease detection and medical education.</p>
<p>(Langate, 2024)</p>
<p>Education and Training</p>
<p>Educators employ AI to create custom illustrations and visual explanations, enriching learning materials. AI-generated images help in visualizing complex concepts, catering to diverse learning styles. This enhances student engagement and aids in the comprehension of abstract subjects.</p>
<p>(MIT Sloan EdTech, 2024)</p>
<p>Underlying Technologies</p>
<p>The Building Blocks</p>
<p>Although this explains what is happening, in order to know how to use these technologies for our own companies, we will have to pop the proverbial hood and look at how it is happening. Once again, knowing the specifics will add nuance and depth to your future research endeavors and enable you to participate in vital decision-making conversations in your company.</p>
<p>The three main technologies fueling the recent explosion in image generation are generative adversarial networks (GANs), diffusion models, and transformers. Each of these has unique operating principles that come with strengths and weaknesses. Although we mentioned two of these technologies earlier in the course, we will review and expand on these topics to hone your ability to select the best product or even combine various technologies.</p>
<p>GANs</p>
<p>Generative Adversarial Networks (GANs)</p>
<p>There is something inherently dramatic about GANs. As the name suggests, these are adversarial networks—two AIs locked in a high-stakes battle. Just like real-world rivals, they are designed to outwit each other.</p>
<p>The generator tries to create fake images (or data) good enough to fool its opponent.</p>
<p>The discriminator plays defense—scrutinizing every detail to spot the fakes and discredit the generator.</p>
<p>They battle in a loop: as the generator improves its deception, the discriminator sharpens its detection. Over time, the generator learns to produce stunningly realistic results. GANs power deepfakes, image editing, upscaling, and artistic AI tools.</p>
<p>GANs have been a technological revolution, shocking the world with their realistic, creative, and artistically nuanced outputs.</p>
<p>However, like many powerful technologies, they come with limitations. One of the most notable is something called mode collapse.</p>
<p>This does not mean the system stops working, but rather that its creative variety narrows. Instead of generating diverse new content, the GAN gets stuck repeating similar outputs— mages that are easy for the discriminator to approve.</p>
<p>This is a side effect of the adversarial structure of GANs. The generator is constantly trying to fool the discriminator, and sometimes it finds a kind of shortcut—producing only a narrow set of outputs that consistently succeed, rather than exploring the full creative range it is capable of. In trying to solve this issue, we often use diffusion models. (Topal, 2023)</p>
<p>Diffusion Models</p>
<p>Diffusion Models</p>
<p>Whereas GANs operate by pitting two systems against each other in an adversarial loop, diffusion models take a radically different approach. They begin with pure noise—imagine a screen filled with random static—and gradually refine it, step by step, until the chaos resolves into a coherent image based on your prompt.</p>
<p>To understand this, think of a Rorschach inkblot. It is just a chaotic pattern—ink splattered and folded into an abstract mess. But when you look at it, your brain starts pulling order from disorder. Perhaps you see, “Two aliens having tea in a pine forest.”</p>
<p>That highly specific, imaginative interpretation might never have emerged from a blank canvas. The randomness acts as a creative catalyst.</p>
<p>Diffusion models work on a similar principle. This approach not only stabilizes the training process but also avoids the creative &quot;ruts&quot; that GANs sometimes fall into, such as mode collapse, where variety diminishes over time.</p>
<p>Of course, diffusion models are not without their quirks. They can sometimes produce images that are oddly over-constructed—like a fox with three tails, a hand with seven fingers, or a bicycle fused to the sky.</p>
<p>This happens when the model lacks global coherence or misinterprets subtle parts of the prompt. This is where transformer technology can be useful.</p>
<p>(Lucent Innovation, 2024)</p>
<p>Transformers</p>
<p>Transformers</p>
<p>Transformers and attention mark another major revolution in generative AI.</p>
<p>Before transformers, systems like recurrent neural networks (RNNs) and Long Short-Term Memory (LSTM) networks dominated the field. These models worked by processing language sequentially—word by word—updating their internal state as they went. But they had a major weakness: their memory was shallow and unreliable.</p>
<p>To understand this limitation, imagine the party game where people go around in a circle adding one sentence at a time to a shared story. It is entertaining but often veers wildly off-course. Without a sense of the whole narrative, tangents creep in or even take over. That is fine when you are writing a silly bedtime story—but not when you are asking a machine to summarize legal documents or interpret medical test results. Something more coherent, more globally aware, was needed.</p>
<p>That breakthrough came in 2017, when a team at Google Brain published the landmark paper &quot;Attention Is All You Need.&quot;</p>
<p>This paper introduced the transformer architecture, which abandoned the sequential limitations of earlier models. The key innovation was the use of self-attention—a mechanism that allows the model to examine and weigh the importance of all parts of a sentence (or image) at once.</p>
<p>In practical terms, attention allows the model to consider every word in a text in relation to every other word—not just the ones that came immediately before. This creates a kind of “total vision” that leads to far more coherent and structured output.</p>
<p>In human terms, it might feel like an epiphany—suddenly seeing an essay, image, or musical score as a whole, rather than as a linear stream of parts.</p>
<p>With this holistic view, the model can maintain tone, consistency, and structure far more effectively.</p>
<p>Transformers didnot just improve coherence—they unlocked scalability. Because their design allows for parallel processing (unlike RNNs), transformers can be trained on vast datasets, enabling today’s large language models (LLMs) like GPT, Claude, and PaLM.</p>
<p>(Alammar, 2018)</p>
<p>What This Means for Development</p>
<p>As we have seen across generative technologies, these systems—GANs, diffusion models, and transformers—can be used individually, but they are increasingly deployed in combination. Each architecture has its own strengths and limitations, so the most effective solutions often rely on hybrid approaches that balance creativity, structure, and scalability.</p>
<p>In practice, this means developers often use GANs for speed and realism, diffusion models for diversity and stability, and transformers for coherence and control—sometimes within the same application.</p>
<p>Here are a few real-world examples:</p>
<p>Image Generation + Language Understanding</p>
<p>Tools like DALL·E 3 or Midjourney use a transformer-based language model to interpret text prompts and guide a diffusion model that creates the image.</p>
<p>The transformer ensures the system understands what is being asked for, while the diffusion model handles how to render it visually—with detail and nuance.</p>
<p>Conversational Agents + Visual Tools</p>
<p>An agent like GPT-4 with vision or Claude 3 can process both text and images, thanks to a multimodal transformer architecture that incorporates visual embeddings.</p>
<p>These agents might use external image captioning models (often built on transformers or CNNs) or diffusion-generated media as part of their output pipeline.</p>
<p>GAN + Transformer for Video or Game Asset Generation</p>
<p>Some game studios use GANs to rapidly generate textures or assets and then run those results through transformer models to ensure coherence across a scene, or to label and organize content automatically.</p>
<p>This hybrid model speeds up creative pipelines while maintaining control over thematic consistency.</p>
<p>Why This Matters for You</p>
<p>As a student or developer in this field, it is important not to think of AI models as mutually exclusive tools, but rather as modular components in a larger system. Just like a filmmaker might use different types of cameras and lenses to shoot a movie, AI creators choose different models for different tasks—and the real magic often happens when you combine them thoughtfully.</p>
<p>Workflows and Bottom Lines</p>
<p>Naturally, all of the information in this module is meant to support concrete business decisions. The right choices will depend on your specific needs, the technologies that best fit those needs, and the cost-saving trade-offs you are willing to make. Every business will reach its own conclusions based on these factors. Below, we have summarized the core information in a table for easy reference.</p>
<p>Level</p>
<p>Description</p>
<p>Example Tools</p>
<p>Best for</p>
<p>Trade-offs</p>
<p>Off-the-Shelf APIs</p>
<p>Hosted models you call via API. No setup. Pay-per-use.</p>
<p>DALL-E 3 (OpenAI API), Stability AI\'s DreamStudio, Adobe Firefly</p>
<p>Quick prototypes, marketing images, general content needs</p>
<p>Limited fine-tuning. Pay for every call. Potential data lock-in.</p>
<p>Open-Source Local Models</p>
<p>Install models on your own servers (or in private cloud).</p>
<p>Stable Diffusion (base and XL), HuggingFace Diffusers</p>
<p>More control over images, privacy, brand consistency</p>
<p>Setup cost, compute expense, need in-house AI expertise.</p>
<p>Custom Fine-Tuned Models</p>
<p>Train a model on your proprietary style/data.</p>
<p>DreamBooth (for style), LoRA fine-tuning, custom Stable Diffusion forks</p>
<p>High-volume, brand-specific content, &quot;signature style&quot; visuals</p>
<p>Very expensive training. Must maintain and update models.</p>
<p>(Acorn, 2024)</p>
<p>Knowledge Check</p>
<p>What is a major conceptual limitation of GANs that affects their creative output over time?</p>
<p>Choose the correct answer and click &quot;Submit.&quot;</p>
<p>GANs cannot generate images with realistic textures.</p>
<p>GANs require labeled datasets for training, which limits their scalability.</p>
<p>GANs may suffer from mode collapse, which reduces output diversity.</p>
<p>GANs use transformers, which limits their ability to generate artistic content.</p>
<p>Submit</p>
<p>Please complete the activity before continuing.</p>
<p>Continue</p>
<p>Incorrect</p>
<p>The correct answer is: GANs may suffer from mode collapse, which reduces output diversity.</p>
<p>Continue</p>
<p>Correct</p>
<p>Congratulations! You\'ve successfully completed the activity.</p>
<p>Continue</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    14,
    u.id,
    'Exploring Multimedia and Language Interaction Models | Applied Agentic AI',
    '4. Exploring Multimedia and Language Interaction Models The subject of AI in relation to audio output or language comprehension sounds deceptively simple. As humans, we are so accustomed to comprehend',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Advanced Applications of Generative AI Tools',
    'advanced-applications-of-generative-ai-tools',
    '5. Advanced Applications of Generative AI Tools A Generative AI Toolbox for Better Organizational Performance Thus far in this course, we have explored the foundational principles of AI, generative AI, and agentic AI—tracing the field from its early origins in the 1950s to its current, market-disrup...',
    '<p>5. Advanced Applications of Generative AI Tools</p>
<p>A Generative AI Toolbox for Better Organizational Performance</p>
<p>Thus far in this course, we have explored the foundational principles of AI, generative AI, and agentic AI—tracing the field from its early origins in the 1950s to its current, market-disrupting capabilities. Along the way, we have examined how written, audio, and visual technologies each contribute to the evolving AI landscape.</p>
<p>However, we have spent less time discussing the specific tools and platforms developed by leading companies. Since the goal of this course is to help you integrate AI functionality into your organization, we will now shift focus—breaking down these broad technologies into individual, purpose-built tools that could enhance your company’s performance.</p>
<p>Image Generation</p>
<p>AI tools that generate images from text prompts or other inputs, enabling rapid content creation at scale.</p>
<p>Use</p>
<p>Marketing: Campaign visuals, ad creatives, social media graphic</p>
<p>Product Design: Mockups, variations, concept exploration</p>
<p>Concept Art: Storyboarding, pre-visualization, style prototyping</p>
<p>Education: Illustrations for training materials, infographics, learning visuals</p>
<p>Specific Products</p>
<p>DALL·E 3 (OpenAI)</p>
<p>DALL·E 3 (OpenAI)</p>
<p>DALL·E 3 is known for producing coherent, prompt-faithful images—especially with nuanced text prompts. It integrates tightly with ChatGPT, making it easy to iteratively refine images through conversation. It is particularly strong in generating literal and detailed scenes.</p>
<p>Midjourney</p>
<p>Midjourney</p>
<p>Midjourney excels in artistic, stylized, and surreal visuals. It is often favored by designers and creatives looking for inspiration or mood boards. While its outputs are less literal, they are highly aesthetic and often visually striking.</p>
<p>Adobe Firefly</p>
<p>Adobe Firefly</p>
<p>Firefly emphasizes brand-safe, commercially licensed image generation. It is ideal for enterprise marketing teams who need visuals without legal gray areas. It integrates into Adobe Creative Cloud (Photoshop, Illustrator), making it a smooth fit for designers.</p>
<p>Runway (Gen-2)</p>
<p>Runway (Gen-2)</p>
<p>Runway focuses on video and motion content, but its image capabilities are also strong. It is especially useful for teams wanting to move seamlessly from still images to animations. Creative teams in media and entertainment often use it for rapid prototyping.</p>
<p>Audio Generation</p>
<p>Use</p>
<p>Customer Service: Voice agents, IVR systems, call center automation</p>
<p>Accessibility: Screen readers, audio descriptions, voiceovers</p>
<p>Language Learning: Pronunciation training, interactive speaking exercises</p>
<p>Content Creation: Audiobooks, podcast narration, AI newsreaders</p>
<p>Specific Products</p>
<p>ElevenLabs</p>
<p>ElevenLabs</p>
<p>ElevenLabs offers high-fidelity, natural-sounding text-to-speech voices with emotional tone control and multilingual support. It is commonly used for audiobook production and content voiceovers. Known for its realism and flexibility in voice cloning.</p>
<p>Whisper (OpenAI)</p>
<p>Whisper (OpenAI)</p>
<p>Whisper is an open-source automatic speech recognition (ASR) model. It transcribes audio into text and handles accents and noisy environments well. Ideal for transcription, captioning, and accessibility.</p>
<p>Microsoft Azure Neural TTS</p>
<p>Microsoft Azure Neural TTS</p>
<p>﻿This is part of Microsoft’s Cognitive Services and offers a range of prebuilt and customizable voices. It is enterprise-ready and integrates easily into large systems, including customer service platforms.</p>
<p>Amazon Polly</p>
<p>Amazon Polly</p>
<p>Polly is AWS’s TTS solution that supports lifelike speech synthesis in many languages. It is optimized for scalability and integrates well with other AWS tools, making it great for high-volume applications.</p>
<p>Text Generation</p>
<p>Use</p>
<p>Customer Engagement: Email drafting, chatbot scripts, FAQs</p>
<p>Internal Tools: Report writing, summarization, document generation</p>
<p>Content Marketing: Blog posts, social media captions, SEO content</p>
<p>Knowledge Management: Documentation, SOPs, help centers</p>
<p>Specific Products</p>
<p>ChatGPT (OpenAI)</p>
<p>ChatGPT (OpenAI)</p>
<p>ChatGPT is one of the most versatile text generators, suitable for everything from code to creative writing. The Pro version includes GPT-4 and advanced tools for integration and file analysis.</p>
<p>Claude (Anthropic)</p>
<p>Claude (Anthropic)</p>
<p>Claude is known for safer, more aligned outputs, and excels in thoughtful, concise communication. Often preferred in legal, HR, or policy-related content creation due to its tone and constraint handling.</p>
<p>Jasper</p>
<p>Jasper</p>
<p>Jasper is a marketing-focused writing tool that includes templates for blog posts, emails, ad copy, and more. It emphasizes tone control, SEO optimization, and team collaboration.</p>
<p>Copy.ai</p>
<p>Copy.ai</p>
<p>Copy.ai is aimed at small businesses and marketers looking to quickly create social media captions, product descriptions, or landing page text. It is user-friendly and designed for fast turnaround.</p>
<p>Video Generation</p>
<p>Use</p>
<p>Marketing: Short-form ads, explainer videos, social content</p>
<p>Education: Video lessons, animated summaries, course materials</p>
<p>Entertainment: Concept trailers, character animation, storyboards</p>
<p>Specific Products</p>
<p>Runway Gen-2</p>
<p>Runway Gen-2</p>
<p>Runway offers video-from-text capabilities, letting users generate short clips from a written prompt. It is great for creative prototyping and motion-based storytelling.</p>
<p>Pika Labs</p>
<p>Pika Labs</p>
<p>Pika Labs focuses on quick, creative animation and stylized motion content. It is gaining popularity among creators for visual experimentation and lightweight post-production.</p>
<p>Synthesia</p>
<p>Synthesia</p>
<p>Synthesia allows users to create talking-head videos using AI avatars. It is widely used for training videos, onboarding, and localized presentations without needing real presenters or studios.</p>
<p>HeyGen</p>
<p>HeyGen</p>
<p>HeyGen specializes in generating realistic talking-head videos from text and audio inputs. It offers customizable AI avatars and voice cloning, making it a popular tool for marketing, corporate communication, and multilingual content creation.</p>
<p>Case Study: Amarra</p>
<p>Amarra, a New Jersey-based global distributor of special-occasion gowns, integrated generative AI into its operations starting in 2020 to improve efficiency and customer experience.</p>
<p>The learning curve was steep and the hiccups were many, but through flexible thinking and hard work, they have been able to take digitization to a new level.</p>
<p>These are some of the ways in which Amarra harnessed generative AI to take its business to the next level.</p>
<p>Utilizing ChatGPT to automate the writing of product descriptions, resulting in a 60% reduction in content creation time</p>
<p>Deploying an AI-powered inventory management system that decreased overstocking by 40%, optimizing stock levels and reducing waste</p>
<p>Implementing AI-driven chatbots to handle 70% of customer inquiries, enhancing response times and freeing up human resources for more complex tasks</p>
<p>Educating employees on how to offload repetitive tasks on AI systems to free up their time for more human-oriented work</p>
<p>Although the integration of generative AI tools led to significant improvements in operational efficiency, cost savings, and customer satisfaction, it was not a seamless transition.</p>
<p>Amarra faced challenges such as balancing automation with the human touch. For example, the customer service bot was initially too robotic in tone and content. In addition, because they operate in many countries, national communications styles had to be factored in to avoid miscommunications or perceived offensiveness.</p>
<p>Beyond this, integrating AI with existing systems, and managing biases in AI models brought their own challenges. However, continuous adjustments and staff involvement addressed these issues effectively, creating a streamlined, competitive, and truly modern company. (Hightower, 2025)</p>
<p>The Coming Wave of Agentic AI</p>
<p>As we have seen throughout this module, generative AI is already reshaping how organizations create text, audio, visual content, and more. But content creation is only the beginning. The next frontier of digital transformation lies in agentic AI—systems that do not just respond to commands but take initiative, make decisions, and coordinate across tools autonomously. Imagine an AI that can not only write a marketing email, but also generate graphics, schedule a campaign, respond to performance data, and refine its approach over time. These agents represent a shift from passive tools to active collaborators, and in the next module, we will explore how this evolution opens new possibilities for automation, personalization, and digital intelligence at scale.</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    7,
    u.id,
    'Advanced Applications of Generative AI Tools | Applied Agentic AI',
    '5. Advanced Applications of Generative AI Tools A Generative AI Toolbox for Better Organizational Performance Thus far in this course, we have explored the foundational principles of AI, generative AI',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'References and Resources',
    'module-1-references-and-resources',
    'References and Resources The resources below include some of the research that has informed this module. Although you are not required to read them, these sources have been compiled to help you more deeply understand the course material. Some of them may require subscription or paid access. The link...',
    '<p>References and Resources</p>
<p>The resources below include some of the research that has informed this module. Although you are not required to read them, these sources have been compiled to help you more deeply understand the course material. Some of them may require subscription or paid access.</p>
<p>The links to the following sources have been validated for 2025.</p>
<p>Reference List</p>
<p>Acorn. (2024, October 15). 7 AI image generation tools compared: pros, cons &amp; pricing. URL</p>
<p>Agrawal, A., Gans, J., &amp; Goldfarb, A. (2022, December 12). ChatGPT and how AI disrupts industries. Harvard Business Review. URL</p>
<p>Alammar, J. (2018). The illustrated transformer. Retrieved from URL</p>
<p>Bergmann, D., &amp; Stryker, C. (2023, October 31). What is LangChain?. IBM. URL</p>
<p>Castro, C. (2025, April 25). Beware, another ChatGPT trend threatens your privacy – here’s how to stay safe. TechRadar. URL</p>
<p>Caswell, A., &amp; Morrison, R. (2025, April 22). I’ve created thousands of AI images and these are the best AI image generators of 2025. Tom’s Guide. URL</p>
<p>Chui, M., Hall, B., Singla, A., Sukharevsky, A., &amp; Yee, L. (2023, August 1). The state of AI in 2023: Generative AI’s breakout year. McKinsey &amp; Company. URL</p>
<p>Codingscape. (2024, November 15). LLMs with largest context windows. URL</p>
<p>Coshow, T., Gao, A., Pingree, L., Verma, A., Scheibenreif, D., Khandabattu, H., Olliffe, G. (2024, October 21). Top strategic technology trends for 2025: Agentic AI. Gartner.</p>
<p>DataFeedWatch. (2025, April 10). 11 best AI advertising examples of 2025. URL</p>
<p>Dialzara. (2024, May 9). AI voice cloning for brand customization: guide. URL</p>
<p>EE Times. (2025, February 10). The evolution of voice in automotive. URL</p>
<p>Gadesha, V., Winland, V., &amp; Kavlakoglu, E. (2025, April 23). What is chain of thought (COT) prompting?. IBM. URL</p>
<p>GeeksforGeeks. (2024, October 5). Difference between batch processing and real time processing system. URL</p>
<p>Germanos, G., Kavallieros, D., Kolokotronis, N., &amp; Georgiou, N. (2021). Privacy issues in voice assistant ecosystems. arXiv. URL</p>
<p>Goodfellow, I., Pouget-Abadie, J., Mirza M., Bing, X, Warde-Farley, D. Ozair, S., Courville A., Bengio Y. (2014) Generative adversarial nets. Advances in Neural Information Processing Systems 27 (2014). PDF</p>
<p>Grace, A. (2025). Real-time sentiment analysis in call centers: Enhancing customer experience and operational efficiency. ResearchGate. URL</p>
<p>Haenlein, M. &amp; Kaplan, A. (2019, July). A brief history of artificial intelligence: On the past, present, and future of artificial intelligence. California Management Review 61(4). PDF</p>
<p>Hightower, S. S. (2025, March 7). A global dress distributor gave AI a chance. Now it makes creative content faster, and overstock is down 40%. Business Insider. URL</p>
<p>IBM. (n.d.). Deep Blue. IBM</p>
<p>Investopedia. (2024, August 5). The Turing test: What is it, what can pass it, and limitations. Investopedia. URL</p>
<p>Klingler, N. (2024, April 29). Alexnet: A revolutionary deep learning architecture. viso.ai. URL</p>
<p>Langate. (2024, December 23). AI in medical imaging: Transforming healthcare diagnostics. URL</p>
<p>Lawton, G. (2025, February 13). History of generative AI innovations spans 9 decades. TechTarget. URL</p>
<p>Lucent Innovation. (2024, March 15). Diffusion models for generative AI – explained. URL</p>
<p>Marr, B. (2024, January 26). How generative AI is revolutionizing customer service. Forbes. URL</p>
<p>McKinsey &amp; Company. (2024, April 2). What is generative AI? URL</p>
<p>MIT Sloan EdTech. (2024, March 6). Supporting learning with AI-generated images: A research-backed guide. ﻿URL</p>
<p>Mollick, E. (2022, December 14). ChatGPT is a tipping point for AI. Harvard Business Review. URL</p>
<p>Moon Technolabs. (2025, March 10). Top 15 generative AI use cases with application &amp; benefits. URL</p>
<p>Mozilla. (2023). Mozilla AI guide – AI basics. Mozilla. URL</p>
<p>Murphy, T. (2023, April 25). The evolution of chatbots and generative AI. TechTarget. URL</p>
<p>OpenAI. (2023). What are tokens and how to count Them? OpenAI Help Center. URL</p>
<p>OpenAI. (2025, April 16). OpenAI o3 and o4-mini System Card. PDF</p>
<p>Patrizio, A. (2025). Four tech companies eyeing nuclear power for AI energy. TechTarget. URL</p>
<p>Paul, K., &amp; Tong, A. (2024, September 13). OpenAI launches new series of AI models with “reasoning” abilities. Reuters. URL</p>
<p>PYMNTS. (2024, August 14). Multimodal AI impacts retail from voice assistants to checkout-free shopping. URL</p>
<p>Singla, A., Sukharevsky, A., Yee, L., &amp; Chui, M. (2024, May 30). The state of AI in early 2024: Gen AI adoption spikes and starts to generate value. McKinsey &amp; Company. URL</p>
<p>Stöffelbauer, A. (2023, October 24). How large language models work. Medium. URL</p>
<p>Tong, A., &amp; Paul, K. (2024, July 15). Exclusive: OpenAI working on new reasoning technology under code name ‘Strawberry’. Reuters. URL</p>
<p>Topal, M. (2023, July 23). What is mode collapse in GANs? Medium. URL</p>
<p>Tordjman, K. L., MacDonald, D., Gerrard, P., Derow, R., Scott, B., Poria, K., Bell, R., &amp; Irwin, M. (2025, January 13). How AI agents are opening the golden era of customer experience. BCG Global. URL</p>
<p>Wood, S. G., Moxley, J. H., Tighe, E. L., &amp; Wagner, R. K. (2018). Does use of text-to-speech and related read-aloud tools improve reading comprehension for students with reading disabilities? Journal of Learning Disabilities, 51(1), 73–84. URL﻿</p>
<p>Recommended Resources</p>
<p>IBM. (2025, April 21). Generative vs. agentic AI: Shaping the future of AI collaboration. [Video]. YouTube. URL</p>
<p>OpenAI. (2025, April 16). OpenAI o3 and o4-mini system card. PDF</p>
<p>Peters, J. (2025, April 29). Duolingo will replace contract workers with AI. TheVerge. URL</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    5,
    u.id,
    'References and Resources | Applied Agentic AI',
    'References and Resources The resources below include some of the research that has informed this module. Although you are not required to read them, these sources have been compiled to help you more d',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Assignments Preview',
    'module-1-assignments-preview',
    'Assignments Preview Once you have studied the module\'s materials, you will complete two activities. Click on the box below for a brief description. You will find all the materials necessary to submit your work in the platform. Assignment This module includes the following assignment: Evaluating the...',
    '<p>Assignments Preview</p>
<p>Once you have studied the module\'s materials, you will complete two activities. Click on the box below for a brief description. You will find all the materials necessary to submit your work in the platform.</p>
<p>Assignment</p>
<p>This module includes the following assignment:</p>
<p>Evaluating the Cost of AI Systems</p>
<p>Module 1 Glossary   M1_Glossary.pdf, PDF document, 83.36 KB</p>
<p>Forward/Back arrows: Click the Forward and Back arrows to move through the module one section at a time.</p>
<p>Menu button: Click the menu button to open up a list of all the modules in the course. Click on the section titles in the drop-down menu to jump straight to the section you want.</p>
<p>Learning Content</p>
<p>Interactive elements: The hand icon indicates interactive elements on each module page. Whenever you see the hand, click on the elements below it to further explore different kinds of module components, such as carousels, hotspots, pop-ups and more.</p>
<p>Hyperlinks: Click on hyperlinks or their corresponding cards to open a new tab or window in your browser. Close or minimize these links to return to the module.</p>
<p>Module 1</p>
<p>Introduction</p>
<p>Table of Contents</p>
<p>Learning Objectives</p>
<p>Assignments Preview</p>
<p>1. Generative AI Fundamentals</p>
<p>2. AI Chatbots: Past, Present, and Future</p>
<p>3. Cost-Optimized Models and Performance Trade-Offs</p>
<p>4. Exploring Multimedia and Language Interaction Models</p>
<p>5. Advanced Applications of Generative AI Tools</p>
<p>References and Resources</p>',
    'PUBLISHED',
    NOW(),
    1,
    u.id,
    'Assignments Preview | Applied Agentic AI',
    'Assignments Preview Once you have studied the module\'s materials, you will complete two activities. Click on the box below for a brief description. You will find all the materials necessary to submit ',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;

INSERT IGNORE INTO `Article`
    (`title`, `slug`, `summary`, `content`, `status`,
     `publishedAt`, `readingTimeMinutes`, `authorId`,
     `seoTitle`, `seoDescription`, `updatedAt`)
SELECT
    'Assignment 1: Evaluating the Cost of AI Systems',
    'assignment-1-evaluating-the-cost-of-ai-systems',
    'Assignment 1 - Evaluating the Cost of AI Systems Dashboard DT-ENG-018 Assignment 1 - Evaluating the Cost of AI Systems Skip To Content Dashboard Account Dashboard Courses Calendar Inbox My Dashboard DT-ENG-018 Assignments Assignment 1 - Evaluating the Cost of AI Systems December 2025 Modules Announc...',
    '<p>Assignment 1 - Evaluating the Cost of AI Systems</p>
<p>Dashboard</p>
<p>DT-ENG-018</p>
<p>Assignment 1 - Evaluating the Cost of AI Systems</p>
<p>Skip To Content</p>
<p>Dashboard</p>
<p>Account</p>
<p>Dashboard</p>
<p>Courses</p>
<p>Calendar</p>
<p>Inbox</p>
<p>My Dashboard</p>
<p>DT-ENG-018</p>
<p>Assignments</p>
<p>Assignment 1 - Evaluating the Cost of AI Systems</p>
<p>December 2025</p>
<p>Modules</p>
<p>Announcements</p>
<p>Live session</p>
<p>Syllabus</p>
<p>People</p>
<p>Grades</p>
<p>Support</p>
<p>Assignment 1 - Evaluating the Cost of AI Systems</p>
<p>New Attempt</p>
<p>Due</p>
<p>Dec 10, 2025 by</p>
<p>12:29am</p>
<p>Points</p>
<p>1</p>
<p>Submitting</p>
<p>a file upload</p>
<p>Available</p>
<p>until Feb 11 at 12:29am</p>
<p>Evaluating the Cost of AI Systems</p>
<p>Brief description: This assignment is mandatory and will be evaluated as part of your final grade. This assignment must be completed individually. Before attempting the assignment, you should study the module content.</p>
<p>Many of us have a growing sense of what AI systems —specifically large language models — are capable of and can see the value of, for example, a customer service, HR, sales or IT bot. However, what few of us know is how much these systems cost per transaction. Fewer still understand how those costs scale across different models and platforms. Yet this information is essential for any business considering AI implementation.</p>
<p>The prices may seem innocuous, often just a fraction of a cent to a few cents per interaction. But when multiplied by thousands or even millions of users, these costs can quickly add up. Using AI intelligently means understanding model pricing and evaluating the impact of usage at scale.</p>
<p>In this exercise, you will do just that: execute a transaction, determine its token usage, and calculate its cost on various platforms at scale. The initial process takes less than ten minutes, but we encourage you to go beyond this by experimenting with different scenarios:</p>
<p>•    What if the questions are short?</p>
<p>•    What if the answers are long?</p>
<p>•    What if we have 10,000 queries per month?</p>
<p>•    What if we have 1,000,000?</p>
<p>Instructions:</p>
<p>Run a standard transaction using your version of GPT.</p>
<p>Use a typical business-related question that a client might ask. For example:</p>
<p>“What is the process I need to go through to rent a car: prerequisites? documents to present? information to have on hand?”</p>
<p>Measure the token count.</p>
<p>Each interaction consists of an input (your question) and an output (the system’s response).</p>
<p>Go to OpenAI’s Tokenizer</p>
<p>Links to an external site..</p>
<p>This tool converts natural language into tokens, the units that determine cost. Simply paste your input text into the tokenizer, and it will tell you how many tokens it uses.</p>
<p>Record the number of tokens for your prompt.</p>
<p>In our example, the question was approximately 25 tokens.</p>
<p>Do the same for the system\'s response.</p>
<p>In our case, the GPT response was about 379 tokens, a typical length for a standard explanation.</p>
<p>Use a pricing calculator to estimate cost.</p>
<p>Go to a tool such as GPT for Work</p>
<p>Links to an external site. (or another provided calculator) and do the following:</p>
<p>Select “Calculate by: tokens”</p>
<p>(You will see this option near the top left of the page.)</p>
<p>Enter your input and output token amounts.</p>
<p>For our example: 25 (input) and 379 (output).</p>
<p>Enter the expected number of API calls.</p>
<p>This is the number of AI interactions you expect per day, month, or year. For instance, try 10,000 or 1,000,000. In our example, we used 10,000.</p>
<p>Review the results.</p>
<p>The table below will show you the total cost on various systems. In our case, the cost ranged from $1.15 to $229.65 USD, a staggering difference for the same process.</p>
<p>Explore additional scenarios.</p>
<p>Try varying the input and output length, or the number of interactions, to see how usage affects pricing across platforms and models.</p>
<p>Write 150-300 words explaining the following:</p>
<p>How exactly you had imagined implementing AI</p>
<p>Which specific parameters you experimented with</p>
<p>What the results were</p>
<p>What information you would need to make your final decisions</p>
<p>Format: Word/PDF document</p>
<p>Submit your work: To upload your work, click on &quot;Start assignment&quot; at the top right corner of the page. You must attach the document, then click on &quot;Submit assignment&quot; again.</p>
<p>1765297799</p>
<p>12/10/2025</p>
<p>12:29am</p>
<p>Your Assignment Submission</p>
<p>File Upload</p>
<p>Upload a file, or choose a file you\'ve already uploaded.</p>
<p>File:</p>
<p>Upload FileUse Webcam</p>
<p>remove empty attachment</p>
<p>Add Another File</p>
<p>remove empty attachment</p>
<p>Click here to find a file you\'ve already uploaded</p>
<p>Cancel</p>
<p>Submit Assignment</p>
<p>Description</p>
<p>Long Description</p>
<p>Cancel</p>
<p>Update Criterion</p>
<p>Additional Comments:</p>
<p>Cancel</p>
<p>Update Comments</p>
<p>Additional Comments:</p>
<p>Rating Score</p>
<p>to &gt;</p>
<p>pts</p>
<p>Rating Title</p>
<p>Rating Description</p>
<p>Cancel</p>
<p>Update Rating</p>
<p>Rubric</p>
<p>Can\'t change a rubric once you\'ve started using it.</p>
<p>Find a Rubric</p>
<p>Title:</p>
<p>Find Rubric</p>
<p>Title</p>
<p>You\'ve already rated students with this rubric.  Any major changes could affect their assessment results.</p>
<p>Title</p>
<p>Criteria</p>
<p>Ratings</p>
<p>Pts</p>
<p>Edit criterion description</p>
<p>Delete criterion row</p>
<p>This criterion is linked to a Learning Outcome</p>
<p>Description of criterion</p>
<p>Range</p>
<p>threshold:</p>
<p>5 pts</p>
<p>Edit rating</p>
<p>Delete rating</p>
<p>5</p>
<p>to &gt;0 pts</p>
<p>Full Marks</p>
<p>blank</p>
<p>Edit rating</p>
<p>Delete rating</p>
<p>0</p>
<p>to &gt;0 pts</p>
<p>No Marks</p>
<p>blank_2</p>
<p>This area will be used by the assessor to leave comments related to this criterion.</p>
<p>pts</p>
<p>/</p>
<p>5 pts</p>
<p>--</p>
<p>Edit criterion description</p>
<p>Delete criterion row</p>
<p>This criterion is linked to a Learning Outcome</p>
<p>Description of criterion</p>
<p>Range</p>
<p>threshold:</p>
<p>5 pts</p>
<p>Edit rating</p>
<p>Delete rating</p>
<p>5</p>
<p>to &gt;0 pts</p>
<p>Full Marks</p>
<p>blank</p>
<p>Edit rating</p>
<p>Delete rating</p>
<p>0</p>
<p>to &gt;0 pts</p>
<p>No Marks</p>
<p>blank_2</p>
<p>This area will be used by the assessor to leave comments related to this criterion.</p>
<p>pts</p>
<p>/</p>
<p>5 pts</p>
<p>--</p>
<p>Total Points:</p>
<p>5</p>
<p>out of 5</p>
<p>I\'ll write free-form comments when assessing students</p>
<p>Remove points from rubric</p>
<p>Don\'t post Outcomes results to Learning Mastery Gradebook</p>
<p>Use this rubric for assignment grading</p>
<p>Hide score total for assessment results</p>
<p>Cancel</p>
<p>Create Rubric</p>
<p>Submission</p>
<p>Submitted!</p>
<p>Dec 8, 2025 at 2:01am</p>
<p>Submission Details</p>
<p>Download Assignment 1 - Evaluating the Cost of AI Systems.pdf</p>
<p>success</p>
<p>Download history_2025-12-07T15_18_19.704+08_00.json</p>
<p>success</p>
<p>Grade: 1 (1 pts possible)</p>
<p>Graded Anonymously: no</p>
<p>Comments:</p>
<p>Ramesh</p>
<p>Truly excellent analysis!</p>
<p>WELL DONE!</p>
<p>•	Good demonstration of understanding token economics and cost mechanics.</p>
<p>•	Effective experimentation with input/output lengths and query volumes.</p>
<p>•	Clear articulation of early thinking around organizational AI use cases.</p>
<p>•	Shows strong grasp of Module 1 fundamentals and practical implications.</p>
<p>•	Insightful linkages made between model choice and strategic deployment.</p>
<p>SUGGESTIONS for Future assignment IMPROVEMENT</p>
<p>•	Clarify how your imagined AI implementation connects to value-chain impact.</p>
<p>Keep up your Great work!</p>
<p>Regards</p>
<p>Lee Bogner</p>
<p>Your Assigned Learning Facilitator</p>
<p>Lee Bogner, Dec 8, 2025 at 2:11am</p>',
    'PUBLISHED',
    NOW(),
    5,
    u.id,
    'Assignment 1: Evaluating the Cost of AI Systems | Applied Agentic AI',
    'Assignment 1 - Evaluating the Cost of AI Systems Dashboard DT-ENG-018 Assignment 1 - Evaluating the Cost of AI Systems Skip To Content Dashboard Account Dashboard Courses Calendar Inbox My Dashboard D',
    NOW()
FROM `User` u WHERE u.email = 'admin@appliedagentic.com'
LIMIT 1;


-- Link articles to their topics
INSERT IGNORE INTO `TopicArticle` (`topicId`, `articleId`, `orderIndex`)
SELECT t.id, a.id, 1
FROM `Topic` t
JOIN `Article` a ON a.slug = 'generative-ai-fundamentals'
WHERE t.slug = 'module-1-generative-ai-fundamentals';

INSERT IGNORE INTO `TopicArticle` (`topicId`, `articleId`, `orderIndex`)
SELECT t.id, a.id, 1
FROM `Topic` t
JOIN `Article` a ON a.slug = 'ai-chatbots-past-present-and-future'
WHERE t.slug = 'module-1-ai-chatbots-past-present-and-future';

INSERT IGNORE INTO `TopicArticle` (`topicId`, `articleId`, `orderIndex`)
SELECT t.id, a.id, 1
FROM `Topic` t
JOIN `Article` a ON a.slug = 'cost-optimized-models-and-performance-trade-offs'
WHERE t.slug = 'module-1-cost-optimized-models-and-performance-trade-offs';

INSERT IGNORE INTO `TopicArticle` (`topicId`, `articleId`, `orderIndex`)
SELECT t.id, a.id, 1
FROM `Topic` t
JOIN `Article` a ON a.slug = 'exploring-multimedia-and-language-interaction-models'
WHERE t.slug = 'module-1-exploring-multimedia-and-language-interaction-models';

INSERT IGNORE INTO `TopicArticle` (`topicId`, `articleId`, `orderIndex`)
SELECT t.id, a.id, 1
FROM `Topic` t
JOIN `Article` a ON a.slug = 'advanced-applications-of-generative-ai-tools'
WHERE t.slug = 'module-1-advanced-applications-of-generative-ai-tools';
