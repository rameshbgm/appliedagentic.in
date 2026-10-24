#!/usr/bin/env node
// Production-only, resumable import for Modules 5-8. No source files are edited.
// dotenv -e .env.production -- node scripts/course-content.cjs --prepare
// Then --apply, followed by the application's media pipeline, then --publish.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const definitions = require('./course-content-data.cjs');
const { root, sha, readModule } = require('./import-module4.cjs');
const { normalizeText, normalizeObject } = require('./course-text.cjs');
const work = path.join(root, 'logs/course-import');
const TARGET = 'u915919430_appliedagentic';
const fields = ['title', 'summary', 'content', 'seoTitle', 'seoDescription', 'seoKeywords', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription'];
const limits = { seoTitle: 60, seoDescription: 160, ogTitle: 70, ogDescription: 200, twitterTitle: 70, twitterDescription: 200 };
const slugify = s => s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
fs.mkdirSync(work, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(work, name), JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });

async function assertProduction(p) {
  const url = new URL(process.env.DATABASE_URL || 'mysql://missing');
  assert.equal(decodeURIComponent(url.pathname.slice(1)), TARGET, 'Refusing to write outside the requested production database');
  assert(!['localhost', '127.0.0.1', '::1', 'mysql', '0.0.0.0', 'missing'].includes(url.hostname), 'Local Docker databases are not allowed');
  const [row] = await p.$queryRaw`SELECT DATABASE() AS name`;
  assert.equal(row.name, TARGET, 'Connected database does not match the requested target');
  console.log(JSON.stringify({ database: row.name, host: url.hostname, productionTargetVerified: true }));
}

function readSource(number, filename) {
  const original = fs.readFileSync(path.join(root, `docs/appliedagentic_source_structured/Module_${number}`, filename), 'utf8').replace(/\r\n/g, '\n');
  const match = original.match(/^# (.+)\n\n\*\*Summary:\*\* ([^\n]*)\n\n([\s\S]+)$/);
  assert(match, `Unexpected structure in Module ${number}/${filename}`);
  return { filename, hash: sha(original), title: normalizeText(match[1]), body: normalizeText(match[3].trim()) };
}
function splitSections(file) {
  const parts = []; let current; let fenced = false;
  for (const line of file.body.split('\n')) {
    if (/^(`{3,}|~{3,})/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^# (.+)$/);
    if (heading) { current = { title: heading[1], lines: [] }; parts.push(current); }
    else { assert(current, `Content before first section: ${file.filename}`); current.lines.push(line); }
  }
  const sections = parts.map((s, order) => ({ title: s.title, content: s.lines.join('\n').trim(), order, sourceFile: file.filename }));
  assert.equal(sections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n'), file.body, `Source text changed in ${file.filename}`);
  return sections;
}
function basePlan(number) {
  const definition = definitions.find(m => m.number === number);
  assert(definition, 'Only remaining Modules 5-8 are supported');
  const directory = path.join(root, `docs/appliedagentic_source_structured/Module_${number}`);
  const filenames = fs.readdirSync(directory).filter(f => f.endsWith('.md')).sort();
  const sourceFiles = filenames.filter(f => !f.includes('References')).map(f => readSource(number, f));
  const title = sourceFiles[0].title.replace(/^Module \d+:\s*/, '').replace(/ - Introduction$/, '');
  const articles = definition.lessons.map(([prefix, title, slug, summary, coverConcept], index) => {
    const sources = prefix === '01' ? sourceFiles.slice(0, 2) : [sourceFiles.find(f => f.filename.startsWith(prefix + '_'))];
    assert(sources.every(Boolean), `Missing file for ${number}/${prefix}`);
    const sections = prefix === '01'
      ? sources.map((f, order) => ({ title: order === 0 ? `Module ${number}: Introduction` : 'Learning Objectives', content: f.body, order, sourceFile: f.filename }))
      : splitSections(sources[0]);
    const content = sections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n');
    return { title, slug, summary, coverConcept, coverAlt: title + ': an illustration of the lesson concepts.',
      sources: sources.map(({ filename, hash }) => ({ filename, hash })), sections, content, order: index + 1,
      readingTimeMinutes: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200)), metadataFingerprint: sha(slug + summary + content) };
  });
  assert.equal(articles.flatMap(a => a.sources).length, sourceFiles.length, `Not all source files are mapped in Module ${number}`);
  return normalizeObject({ moduleNumber: number, parentSlug: 'organizational-transformation', title, slug: definition.slug, order: number,
    description: definition.description, articles, excludedReferenceFiles: filenames.filter(f => f.includes('References')) });
}
function metadataPath(slug) { return path.join(work, 'metadata', slug + '.json'); }
function getPlan(number) {
  const plan = basePlan(number);
  for (const article of plan.articles) {
    assert(fs.existsSync(metadataPath(article.slug)), `Prepare metadata first: ${article.slug}`);
    const cached = JSON.parse(fs.readFileSync(metadataPath(article.slug), 'utf8'));
    assert.equal(cached.fingerprint, article.metadataFingerprint, `Source changed after preparation: ${article.slug}`);
    Object.assign(article, cached.metadata);
    for (const [key, limit] of Object.entries(limits)) assert(article[key]?.length && article[key].length <= limit, `${article.slug}: invalid ${key}`);
    assert(article.seoKeywords && article.tags?.length >= 3 && article.tags.length <= 10);
    assert(!JSON.stringify(article).includes('\u2014'), `${article.slug}: em dash remains`);
  }
  plan.hash = sha(JSON.stringify(plan));
  return plan;
}
function checkContent(module, plan) {
  assert(module, `Missing Module ${plan.moduleNumber}`);
  for (const key of ['title', 'slug', 'order', 'description']) assert.equal(module[key], plan[key]);
  assert.equal(module.articles.length, plan.articles.length);
  for (const expected of plan.articles) {
    const link = module.articles.find(l => l.article.slug === expected.slug);
    assert(link, `Missing article ${expected.slug}`);
    assert.equal(link.orderIndex, expected.order);
    for (const key of fields) assert.equal(link.article[key], expected[key], `${expected.slug}: ${key} differs`);
    assert.deepEqual(link.article.sections.map(({ title, content, order }) => ({ title, content, order })), expected.sections.map(({ title, content, order }) => ({ title, content, order })));
    assert.deepEqual(link.article.articleTags.map(t => t.tag.slug).sort(), expected.tags.map(slugify).sort());
    assert.equal(link.article.subMenuArticles.length, 1);
    assert.equal(link.article.menuArticles.length, 0);
  }
}

async function prepare() {
  require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' } });
  require('tsconfig-paths').register({ baseUrl: root, paths: { '@/*': ['./*'] } });
  const { runSeoOptimizer } = require('../agents/seo-optimizer/agent');
  const { runTagsGenerator } = require('../agents/tags-generator/agent');
  fs.mkdirSync(path.join(work, 'metadata'), { recursive: true });
  const articles = definitions.flatMap(d => basePlan(d.number).articles);
  let cursor = 0; const failures = [];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (cursor < articles.length) {
      const a = articles[cursor++];
      try {
        if (fs.existsSync(metadataPath(a.slug))) {
          assert.equal(JSON.parse(fs.readFileSync(metadataPath(a.slug), 'utf8')).fingerprint, a.metadataFingerprint);
          console.log(JSON.stringify({ event: 'metadata-cached', slug: a.slug })); continue;
        }
        const [seo, tagged] = await Promise.all([
          runSeoOptimizer({ prompt: a.title, context: `Brief: ${a.summary}\n\nSource excerpt:\n${a.content.slice(0, 3000)}` }),
          runTagsGenerator({ prompt: `Article title: ${a.title}\n\nContent excerpt:\n${a.content.slice(0, 2000)}` }),
        ]);
        const metadata = {};
        for (const [key, limit] of Object.entries(limits)) {
          let text = normalizeText(seo[key] || '').replace(/\s+/g, ' ').trim();
          if (text.length > limit) text = text.slice(0, limit).replace(/\s+\S*$/, '').trim();
          assert(text, `AI returned empty ${key}`); metadata[key] = text;
        }
        metadata.seoKeywords = normalizeText(seo.seoKeywords || '').trim();
        metadata.tags = [...new Map((tagged.tags || []).map(t => normalizeText(t).toLowerCase().trim()).filter(Boolean).map(t => [slugify(t), t])).values()].slice(0, 10);
        assert(metadata.seoKeywords && metadata.tags.length >= 3, 'AI returned incomplete keywords or tags');
        fs.writeFileSync(metadataPath(a.slug), JSON.stringify({ fingerprint: a.metadataFingerprint, metadata }, null, 2) + '\n');
        console.log(JSON.stringify({ event: 'metadata-prepared', slug: a.slug, tags: metadata.tags.length }));
      } catch (e) { failures.push({ slug: a.slug, error: e.message }); console.log(JSON.stringify({ event: 'metadata-failed', slug: a.slug, error: e.message })); }
    }
  }));
  assert.equal(failures.length, 0, JSON.stringify(failures));
  for (const d of definitions) save(`module-${d.number}-plan.json`, getPlan(d.number));
}

async function normalizeExisting(p, parent) {
  const modules = await p.navSubMenu.findMany({ where: { menuId: parent.id }, include: { articles: { include: { article: { include: { sections: true, articleTags: true, subMenuArticles: true, menuArticles: true } } } } } });
  if (!fs.existsSync(path.join(work, 'before.json'))) save('before.json', { capturedAt: new Date().toISOString(), database: TARGET, parent, modules });
  let changed = 0;
  const articles = [...new Map(modules.flatMap(m => m.articles).map(l => [l.article.id, l.article])).values()];
  for (const m of modules) {
    const data = {};
    for (const key of ['title', 'description']) if (m[key]?.includes('\u2014')) data[key] = normalizeText(m[key]);
    if (Object.keys(data).length) { await p.navSubMenu.update({ where: { id: m.id }, data }); changed++; }
  }
  for (const a of articles) {
    const data = {};
    for (const key of fields) if (a[key]?.includes('\u2014')) data[key] = normalizeText(a[key]);
    const changedSections = a.sections.filter(s => s.title.includes('\u2014') || s.content.includes('\u2014'));
    if (Object.keys(data).length || changedSections.length) {
      await p.$transaction(async tx => {
        if (Object.keys(data).length) await tx.article.update({ where: { id: a.id }, data });
        for (const s of changedSections) await tx.articleSection.update({ where: { id: s.id }, data: { title: normalizeText(s.title), content: normalizeText(s.content) } });
      }, { timeout: 30000 }); changed++;
    }
  }
  console.log(JSON.stringify({ event: 'em-dashes-removed', changedRecords: changed, preservedExistingMedia: true }));
}

async function apply(p, plans) {
  const parent = await p.navMenu.findUniqueOrThrow({ where: { slug: plans[0].parentSlug } });
  await normalizeExisting(p, parent);
  const author = await p.article.findUniqueOrThrow({ where: { slug: 'introduction-module1' }, select: { authorId: true } });
  for (const plan of plans) {
    const existing = await readModule(p, plan);
    if (existing) { checkContent(existing, plan); console.log(JSON.stringify({ event: 'module-cached', number: plan.moduleNumber })); continue; }
    assert.equal(await p.article.count({ where: { slug: { in: plan.articles.map(a => a.slug) } } }), 0, 'Refusing to overwrite an existing article slug');
    await p.$transaction(async tx => {
      const m = await tx.navSubMenu.create({ data: { menuId: parent.id, title: plan.title, slug: plan.slug, description: plan.description, order: plan.order, isVisible: false } });
      for (const a of plan.articles) {
        const tagIds = [];
        for (const name of a.tags) tagIds.push((await tx.tag.upsert({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) }, update: {} })).id);
        await tx.article.create({ data: { ...Object.fromEntries(fields.map(key => [key, a[key]])), slug: a.slug, status: 'DRAFT', authorId: author.authorId,
          readingTimeMinutes: a.readingTimeMinutes, aiContentDeclaration: 'ai-assisted',
          sections: { create: a.sections.map(({ title, content, order }) => ({ title, content, order })) },
          articleTags: { create: tagIds.map(tagId => ({ tagId })) }, subMenuArticles: { create: { subMenuId: m.id, orderIndex: a.order } } } });
      }
    }, { timeout: 90000 });
    checkContent(await readModule(p, plan), plan);
    save(`module-${plan.moduleNumber}-plan.json`, plan);
    console.log(JSON.stringify({ event: 'module-staged', number: plan.moduleNumber, articles: plan.articles.length, sections: plan.articles.reduce((n, a) => n + a.sections.length, 0) }));
  }
}

function mediaAdapter(numbers) {
  const plans = numbers.map(getPlan);
  return { root, work, sha,
    buildPlan: () => ({ articles: plans.flatMap(p => p.articles), plans }),
    readModule: async p => { const modules = []; for (const plan of plans) modules.push(await readModule(p, plan)); return { modules, articles: modules.flatMap(m => m.articles) }; },
    checkContent: aggregate => aggregate.modules.forEach((m, i) => checkContent(m, plans[i])), assertProduction,
  };
}

async function main() {
  const p = new PrismaClient();
  try {
    await assertProduction(p);
    if (process.argv.includes('--normalize-existing')) {
      const parent = await p.navMenu.findUniqueOrThrow({ where: { slug: 'organizational-transformation' } });
      await normalizeExisting(p, parent); return;
    }
    if (process.argv.includes('--prepare')) { await prepare(); return; }
    const plans = definitions.map(d => getPlan(d.number));
    if (process.argv.includes('--apply')) await apply(p, plans);
    const modules = [];
    for (const plan of plans) { const m = await readModule(p, plan); checkContent(m, plan); modules.push(m); }
    if (process.argv.includes('--publish') || process.argv.includes('--publish-ready')) {
      const ready = modules.filter(m => m.articles.every(l => l.article.coverImageId && l.article.sections.every(s => s.audioUrl)));
      if (process.argv.includes('--publish')) assert.equal(ready.length, modules.length, 'Some modules still have incomplete media');
      await p.$transaction(async tx => {
        await tx.article.updateMany({ where: { id: { in: ready.flatMap(m => m.articles.map(l => l.article.id)) }, status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
        await tx.navSubMenu.updateMany({ where: { id: { in: ready.map(m => m.id) }, isVisible: false }, data: { isVisible: true } });
      }, { timeout: 30000 });
      console.log(JSON.stringify({ event: 'modules-published', modules: ready.map(m => m.order) }));
    }
    const state = [];
    for (const plan of plans) {
      const m = await readModule(p, plan); checkContent(m, plan);
      state.push({ number: plan.moduleNumber, id: m.id, slug: m.slug, visible: m.isVisible,
        articles: m.articles.map(l => ({ id: l.article.id, slug: l.article.slug, status: l.article.status, cover: !!l.article.coverImageId, sections: l.article.sections.length, audio: l.article.sections.filter(s => s.audioUrl).length })) });
    }
    save('state.json', { checkedAt: new Date().toISOString(), database: TARGET, modules: state });
    console.log(JSON.stringify(state));
  } finally { await p.$disconnect(); }
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { root, work, sha, basePlan, getPlan, readModule, checkContent, assertProduction, mediaAdapter, fields, normalizeText, normalizeObject };
