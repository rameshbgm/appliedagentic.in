#!/usr/bin/env node
// Run with dotenv run -q -f .env.production -- node scripts/import-module4.cjs.
// Default: validate and write a local plan. --apply stages drafts; --publish
// requires complete covers/audio. Existing articles are never overwritten.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createPrismaClient } = require('../lib/prisma-client.cjs');
const { normalizeObject } = require('./course-text.cjs');

const root = path.resolve(__dirname, '..');
const work = path.join(root, 'logs/module4-import');
const source = path.join(root, 'docs/appliedagentic_source_structured/Module_4');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const slugify = value => value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
const write = (name, value) => {
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, name), JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
};

function readSource(filename) {
  const raw = fs.readFileSync(path.join(source, filename), 'utf8').replace(/\r\n/g, '\n');
  const match = raw.match(/^# (.+)\n\n\*\*Summary:\*\* ([^\n]*)\n\n([\s\S]+)$/);
  assert(match, `Unexpected source structure: ${filename}`);
  return { filename, hash: sha(raw), title: match[1], sourceSummary: match[2], body: match[3].trim() };
}

function lessonSections(file) {
  const result = [];
  let current;
  let fence = null;
  for (const line of file.body.split('\n')) {
    const f = line.match(/^(`{3,}|~{3,})/);
    if (f) fence = fence ? null : f[1][0];
    const heading = !fence && line.match(/^# (.+)$/);
    if (heading) {
      current = { title: heading[1], lines: [] };
      result.push(current);
    } else {
      assert(current, `Content before first section in ${file.filename}`);
      current.lines.push(line);
    }
  }
  const sections = result.map((s, order) => ({ title: s.title, content: s.lines.join('\n').trim(), order, sourceFile: file.filename }));
  assert.equal(sections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n'), file.body,
    `Section splitting changed source text: ${file.filename}`);
  return sections;
}

function buildPlan() {
  const files = fs.readdirSync(source).filter(f => /^0[1-6]_.*\.md$/.test(f)).sort().map(readSource);
  assert.equal(files.length, 6);
  const definitions = [
    {
      title: 'Introduction', slug: 'introduction-module4', sources: files.slice(0, 2),
      summary: 'Understand classic cyber threats, AI-powered attacks, and the limitations of AI systems. Learn the objectives and frameworks covered in Module 4.',
      sections: [
        { title: 'Module 4: Cybersecurity — Introduction', content: files[0].body, order: 0, sourceFile: files[0].filename },
        { title: 'Learning Objectives', content: files[1].body, order: 1, sourceFile: files[1].filename },
      ],
      seoTitle: 'AI Cybersecurity: Threats, Defences and Learning Objectives',
      seoDescription: 'Explore AI cybersecurity threats, defence frameworks and AI limitations. Learn what Module 4 covers and how to strengthen organisational security.',
      seoKeywords: 'ai cybersecurity, agentic ai security, cyber threats, cybersecurity frameworks, deepfakes, prompt injection, ai risk management',
      ogTitle: 'Leading Securely in the Age of AI',
      ogDescription: 'Discover the threats, defence frameworks and AI limitations that business leaders need to understand before deploying intelligent systems.',
      twitterTitle: 'What Changes When AI Enters Your Security Landscape?',
      twitterDescription: 'Start Module 4 with a clear view of classic threats, AI-powered attacks and the practical security skills you will develop.',
      tags: ['cybersecurity', 'agentic ai', 'ai risk management', 'security awareness', 'cyber kill chain', 'human oversight'],
      coverConcept: 'A luminous translucent shield protects a neural network in an interconnected digital business ecosystem. Branching workflow connections and subtle amber risk signals at the perimeter convey organisational cybersecurity and human oversight.',
      coverAlt: 'A shield protecting an AI network and connected business systems.',
    },
    {
      title: 'Classic and Current Cybersecurity Risks', slug: 'classic-and-current-cybersecurity-risks', sources: [files[2]],
      summary: 'Trace the evolution from phishing and social engineering to deepfakes, AI impersonation and prompt injection, using practical business examples.',
      seoTitle: 'Cybersecurity Risks: Phishing, Deepfakes and AI Attacks',
      seoDescription: 'Understand classic cyber threats and AI-powered attacks, including phishing, deepfakes, voice impersonation and prompt injection. Learn the risks.',
      seoKeywords: 'cybersecurity risks, phishing, social engineering, deepfakes, ai impersonation, prompt injection, remote access trojan, ai security',
      ogTitle: 'From Phishing to Deepfakes: How Cyber Threats Have Evolved',
      ogDescription: 'Follow familiar attack patterns into the AI era and learn why human trust remains a target for phishing, impersonation and malicious instructions.',
      twitterTitle: 'Cyber Threats Have Changed. Human Trust Is Still the Target.',
      twitterDescription: 'Explore phishing, deepfakes, voice cloning and prompt injection through business scenarios that explain how AI changes the threat landscape.',
      tags: ['phishing', 'social engineering', 'deepfakes', 'ai impersonation', 'prompt injection', 'cybersecurity'],
      coverConcept: 'A central glowing business communication node is surrounded by an abstract email envelope, voice waveform, synthetic face silhouette and corrupted instruction stream. Subtle amber intrusion paths approach a blue business network, showing the evolution of phishing into AI-powered threats.',
      coverAlt: 'Email, voice and synthetic media signals approaching a connected business network.',
    },
    {
      title: 'Cybersecurity Response and Prevention', slug: 'cybersecurity-response-and-prevention', sources: [files[3]],
      summary: 'Use the seven phases of the Cyber Kill Chain to identify defensive opportunities and combine technical controls with a culture of verification.',
      seoTitle: 'Cybersecurity Prevention: The Cyber Kill Chain Explained',
      seoDescription: 'Learn the seven Cyber Kill Chain phases and practical controls for phishing, deepfakes and prompt injection. Build layered defences and verification habits.',
      seoKeywords: 'cyber kill chain, cybersecurity prevention, incident response, layered security, zero trust, endpoint detection, verification, ai security',
      ogTitle: 'Break the Attack Chain: Cybersecurity Response and Prevention',
      ogDescription: 'Map attacks to seven phases, identify where to intervene and combine technical safeguards with human verification to strengthen your organisation.',
      twitterTitle: 'Seven Chances to Interrupt a Cyberattack',
      twitterDescription: 'The Cyber Kill Chain shows where to stop an attack. Learn how layered controls, verification and security awareness work together.',
      tags: ['cyber kill chain', 'incident response', 'layered security', 'zero trust', 'endpoint detection', 'security awareness'],
      coverConcept: 'A protected digital business core is encircled by translucent defensive rings. An incoming amber signal is interrupted at several bright cyan verification checkpoints, with subtle monitoring pulses and a human oversight node. Convey layered defence, prevention and response.',
      coverAlt: 'Layered defensive rings and verification checkpoints protecting a digital business core.',
    },
    {
      title: 'Cybersecurity Case Study', slug: 'cybersecurity-case-study', sources: [files[4]],
      summary: 'Apply the Cyber Kill Chain to the Lisa Mendez teaching scenario, identify missed safeguards and examine where layered defences could interrupt an attack.',
      seoTitle: 'Cyber Kill Chain Case Study: Mapping a Phishing Attack',
      seoDescription: 'Apply the Cyber Kill Chain to a phishing teaching scenario. Identify missed safeguards across seven phases and find ways to interrupt attacks.',
      seoKeywords: 'cybersecurity case study, cyber kill chain, phishing attack, security controls, remote access trojan, financial fraud, layered defence',
      ogTitle: 'Anatomy of a Cyberattack: A Cyber Kill Chain Case Study',
      ogDescription: 'Walk through the Lisa Mendez teaching scenario and identify the technical controls, human decisions and verification steps that could break the attack chain.',
      twitterTitle: 'Where Could This Cyberattack Have Been Stopped?',
      twitterDescription: 'Map a phishing teaching scenario to the Cyber Kill Chain and examine the missed opportunities for detection, prevention and independent verification.',
      tags: ['cyber kill chain', 'phishing', 'security controls', 'financial fraud', 'incident analysis', 'layered security'],
      coverConcept: 'A left-to-right sequence of seven abstract connected nodes progresses from reconnaissance and malicious delivery toward a protected financial vault. A brilliant cyan defensive checkpoint interrupts the amber attack path. Use shapes and symbols only; analytical and educational.',
      coverAlt: 'An attack path interrupted by a defensive checkpoint before reaching a financial vault.',
    },
    {
      title: 'Limits of AI Perception', slug: 'limits-of-ai-perception', sources: [files[5]],
      summary: 'Examine six limits of AI perception—empathy, bias, memory, context, hallucination and cascading agent errors—and the safeguards that help manage them.',
      seoTitle: 'Limits of AI Perception: Bias, Hallucination and Context',
      seoDescription: 'Explore six limits of AI perception, from bias and hallucination to memory and agent errors. Learn where verification and human oversight matter.',
      seoKeywords: 'ai perception, ai limitations, hallucination, algorithmic bias, context windows, agentic ai errors, human oversight, ai verification',
      ogTitle: 'Why AI Gets Things Wrong—and How to Build Better Safeguards',
      ogDescription: 'Understand empathy gaps, bias, memory limits, context failures, hallucinations and cascading agent errors, with practical approaches to human oversight.',
      twitterTitle: 'AI Can Be Capable and Fragile at the Same Time',
      twitterDescription: 'Explore six limitations of AI perception and learn how verification, context management and human checkpoints help manage consequential mistakes.',
      tags: ['ai perception', 'algorithmic bias', 'hallucination', 'context windows', 'human oversight', 'agentic ai'],
      coverConcept: 'A luminous abstract AI lens studies a fragmented geometric scene that resolves into two subtly different interpretations. A small human oversight silhouette beside the lens adds a clean cyan verification signal. Convey ambiguity, incomplete context and thoughtful review.',
      coverAlt: 'An AI lens interpreting fragmented information beside a human verification signal.',
    },
  ];
  const articles = definitions.map((d, index) => {
    const sections = d.sections || lessonSections(d.sources[0]);
    const content = sections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n');
    const article = { ...d, sources: d.sources.map(({ filename, hash }) => ({ filename, hash })), sections, content, order: index + 1,
      readingTimeMinutes: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200)) };
    for (const [key, limit] of Object.entries({ seoTitle: 60, seoDescription: 160, ogTitle: 70, ogDescription: 200, twitterTitle: 70, twitterDescription: 200 })) {
      assert(article[key] && article[key].length <= limit, `${article.slug}: ${key} length ${article[key]?.length} exceeds ${limit}`);
    }
    assert.equal(new Set(article.tags.map(slugify)).size, article.tags.length);
    assert(sections.every(s => s.title && s.content));
    return article;
  });
  const plan = { moduleNumber: 4, parentSlug: 'organizational-transformation', slug: 'cybersecurity',
    title: files[0].title.replace(/^Module 4:\s*/, ''), order: 4,
    description: 'Understand classic and AI-powered cybersecurity threats, apply layered defence frameworks, and evaluate the limitations of AI perception and reasoning.',
    excludedReferenceFiles: ['07_References_Part1.md', '08_References_Part2.md'], articles };
  const cleanPlan = normalizeObject(plan);
  cleanPlan.hash = sha(JSON.stringify(cleanPlan));
  return cleanPlan;
}

async function readModule(p, plan) {
  return p.navSubMenu.findUnique({ where: { slug: plan.slug }, include: { articles: { orderBy: { orderIndex: 'asc' }, include: { article: {
    include: { sections: { orderBy: { order: 'asc' } }, coverImage: { select: { id: true, url: true, mimeType: true, width: true, height: true, altText: true } }, articleTags: { include: { tag: true } }, subMenuArticles: true, menuArticles: true },
  } } } } });
}

function checkContent(module, plan) {
  assert(module, 'Module 4 has not been staged');
  assert.equal(module.title, plan.title);
  assert.equal(module.order, 4);
  assert.equal(module.articles.length, 5);
  for (const expected of plan.articles) {
    const link = module.articles.find(l => l.article.slug === expected.slug);
    assert(link, `Missing article ${expected.slug}`);
    const a = link.article;
    assert.equal(link.orderIndex, expected.order);
    for (const key of ['title', 'summary', 'content', 'seoTitle', 'seoDescription', 'seoKeywords', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription']) assert.equal(a[key], expected[key], `${a.slug}: ${key} differs`);
    assert.deepEqual(a.sections.map(({ title, content, order }) => ({ title, content, order })), expected.sections.map(({ title, content, order }) => ({ title, content, order })), `${a.slug}: sections differ`);
    assert.deepEqual(a.articleTags.map(x => x.tag.slug).sort(), expected.tags.map(slugify).sort(), `${a.slug}: tags differ`);
    assert.equal(a.subMenuArticles.length, 1, `${a.slug}: unexpected module assignment`);
    assert.equal(a.menuArticles.length, 0, `${a.slug}: unexpected direct menu assignment`);
  }
}

async function main() {
  const plan = buildPlan();
  write('plan.json', plan);
  console.log(JSON.stringify({ plan: path.join(work, 'plan.json'), articles: plan.articles.map(a => ({ title: a.title, slug: a.slug, sections: a.sections.length, sourceFiles: a.sources.map(s => s.filename) })), totalSections: plan.articles.reduce((n, a) => n + a.sections.length, 0) }));
  if (!process.argv.some(x => ['--apply', '--verify', '--publish'].includes(x))) return;
  assert(process.env.DATABASE_URL, 'DATABASE_URL is required');
  const p = createPrismaClient();
  try {
    const parent = await p.navMenu.findUniqueOrThrow({ where: { slug: plan.parentSlug } });
    if (process.argv.includes('--apply')) {
      const existingModule = await readModule(p, plan);
      if (existingModule) {
        assert.equal(existingModule.menuId, parent.id);
        checkContent(existingModule, plan);
        console.log('Existing Module 4 matches the plan; no content changes made.');
      } else {
        const conflicts = await p.article.findMany({ where: { slug: { in: plan.articles.map(a => a.slug) } }, select: { id: true, slug: true } });
        assert.equal(conflicts.length, 0, 'An article slug already exists; refusing to overwrite it');
        const template = await p.article.findUniqueOrThrow({ where: { slug: 'introduction-module1' }, select: { authorId: true } });
        const before = await p.article.findMany({ orderBy: { id: 'asc' }, include: { sections: true, articleTags: true, subMenuArticles: true, menuArticles: true } });
        write(`before-${Date.now()}.json`, { capturedAt: new Date().toISOString(), parent, articles: before });
        await p.$transaction(async tx => {
          const module = await tx.navSubMenu.create({ data: { menuId: parent.id, title: plan.title, slug: plan.slug, description: plan.description, order: 4, isVisible: false } });
          for (const a of plan.articles) {
            const tags = [];
            for (const name of a.tags) tags.push(await tx.tag.upsert({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) }, update: {} }));
            await tx.article.create({ data: {
              title: a.title, slug: a.slug, summary: a.summary, content: a.content, status: 'DRAFT', authorId: template.authorId,
              readingTimeMinutes: a.readingTimeMinutes, seoTitle: a.seoTitle, seoDescription: a.seoDescription, seoKeywords: a.seoKeywords,
              ogTitle: a.ogTitle, ogDescription: a.ogDescription, twitterTitle: a.twitterTitle, twitterDescription: a.twitterDescription,
              aiContentDeclaration: 'ai-assisted',
              sections: { create: a.sections.map(({ title, content, order }) => ({ title, content, order })) },
              articleTags: { create: tags.map(t => ({ tagId: t.id })) },
              subMenuArticles: { create: { subMenuId: module.id, orderIndex: a.order } },
            } });
          }
        }, { timeout: 60000 });
      }
    }
    let module = await readModule(p, plan);
    checkContent(module, plan);
    const describe = m => m.articles.map(l => ({ id: l.article.id, slug: l.article.slug, order: l.orderIndex, status: l.article.status, cover: !!l.article.coverImageId,
      sections: l.article.sections.map(s => ({ id: s.id, title: s.title, order: s.order, audio: !!s.audioUrl })) }));
    let coverage = describe(module);
    if (process.argv.includes('--publish')) {
      assert(coverage.every(a => a.cover && a.sections.every(s => s.audio)), 'Every article requires a cover and all sections require audio before publication');
      await p.$transaction(async tx => {
        await tx.article.updateMany({ where: { id: { in: coverage.map(a => a.id) }, status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
        await tx.navSubMenu.update({ where: { id: module.id }, data: { isVisible: true } });
      });
      module = await readModule(p, plan);
      assert(module.isVisible && module.articles.every(l => l.article.status === 'PUBLISHED'));
      coverage = describe(module);
    }
    write('state.json', { checkedAt: new Date().toISOString(), planHash: plan.hash, moduleId: module.id, visible: module.isVisible, articles: coverage });
    console.log(JSON.stringify({ moduleId: module.id, visible: module.isVisible, articles: coverage }));
  } finally { await p.$disconnect(); }
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { buildPlan, checkContent, readModule, work, root, write, sha };
