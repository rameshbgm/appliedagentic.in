#!/usr/bin/env node
// Completion audit against production records, original sources and live URLs.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { PrismaClient, Prisma } = require('@prisma/client');
const { getPlan, checkContent, assertProduction, work, fields, normalizeText } = require('./course-content.cjs');
const { checkContent: checkModule4, buildPlan: module4Plan } = require('./import-module4.cjs');
const p = new PrismaClient();
const origin = process.env.COURSE_VERIFY_ORIGIN || 'https://appliedagentic.in';
const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
async function get(url, options = {}) {
  const r = await fetch(origin + url, { ...options, signal: AbortSignal.timeout(90000) });
  assert.equal(r.status, options.headers?.Range ? 206 : 200, `${url}: HTTP ${r.status}`);
  return r;
}
async function pooled(items, fn) {
  let index = 0;
  await Promise.all(Array.from({ length: 3 }, async () => { while (index < items.length) await fn(items[index++]); }));
}
(async () => {
  await assertProduction(p);
  const parent = await p.navMenu.findUniqueOrThrow({ where: { slug: 'organizational-transformation' }, include: {
    subMenus: { orderBy: { order: 'asc' }, include: { articles: { orderBy: { orderIndex: 'asc' }, include: { article: { include: {
      sections: { orderBy: { order: 'asc' } }, articleTags: { include: { tag: true } }, subMenuArticles: true, menuArticles: true,
      coverImage: { select: { id: true, url: true, altText: true, width: true, height: true } },
    } } } } } },
  } });
  const modules = parent.subMenus;
  assert.equal(modules.length, 8);
  assert.deepEqual(modules.map(m => m.order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(modules.map(m => m.articles.length), [6, 5, 5, 5, 8, 5, 5, 3]);
  assert(modules.every(m => m.isVisible), 'Some course modules are hidden');
  const articles = modules.flatMap(m => m.articles.map(l => l.article));
  assert.equal(articles.length, 42);
  assert(articles.every(a => a.status === 'PUBLISHED'), 'Some course articles are unpublished');
  assert(articles.every(a => a.coverImage && a.summary && a.seoTitle && a.seoDescription && a.seoKeywords && a.articleTags.length), 'Missing article metadata');
  assert(!JSON.stringify(modules).includes('\u2014'), 'An em dash remains in the published course records');
  checkModule4(modules[3], module4Plan());
  for (const number of [5, 6, 7, 8]) checkContent(modules[number - 1], getPlan(number));

  // Old content must equal the original backup with only the requested punctuation change.
  const before = JSON.parse(fs.readFileSync(path.join(work, 'before.json'), 'utf8'));
  let preserved = 0;
  for (const oldModule of before.modules) {
    const current = modules.find(m => m.id === oldModule.id);
    assert.equal(current.slug, oldModule.slug);
    for (const key of ['title', 'description']) assert.equal(current[key], oldModule[key] === null ? null : normalizeText(oldModule[key]));
    for (const link of oldModule.articles) {
      const old = link.article;
      const a = articles.find(a => a.id === old.id);
      for (const key of fields) assert.equal(a[key], old[key] === null ? null : normalizeText(old[key]), `Existing article ${old.id}: unexpected ${key} change`);
      for (const key of ['slug', 'status', 'coverImageId', 'authorId', 'audioUrl']) assert.equal(a[key], old[key]);
      assert.equal(a.sections.length, old.sections.length);
      for (const s of old.sections) {
        const current = a.sections.find(x => x.id === s.id);
        assert.equal(current.title, normalizeText(s.title)); assert.equal(current.content, normalizeText(s.content));
        assert.equal(current.audioUrl, s.audioUrl); assert.equal(current.order, s.order);
      }
      preserved++;
    }
  }
  assert.equal(preserved, 21);
  const sections = articles.flatMap(a => a.sections);
  assert.equal(sections.length, 139);
  assert(sections.every(s => s.audioUrl), 'Missing section narration');
  const newArticles = modules.slice(4).flatMap(m => m.articles.map(l => l.article));
  const jobs = await p.audioJob.findMany({ where: { articleId: { in: newArticles.map(a => a.id) } } });
  assert.equal(jobs.length, 21);
  assert(jobs.every(j => j.status === 'done' && j.failed === 0 && j.completed === j.total), 'Audio jobs have not all completed successfully');
  const urls = [...new Set([...articles.map(a => a.coverImage.url), ...sections.map(s => s.audioUrl)])];
  const assets = await p.$queryRaw(Prisma.sql`SELECT id, url, mimeType, sizeBytes, OCTET_LENGTH(data) AS actualBytes, HEX(LEFT(data, 44)) AS header FROM MediaAsset WHERE url IN (${Prisma.join(urls)})`);
  assert.equal(assets.length, urls.length, 'Some linked assets do not exist');
  let audioSeconds = 0;
  for (const a of assets) {
    assert.equal(Number(a.actualBytes), a.sizeBytes, `${a.url}: binary size mismatch`);
    assert(a.sizeBytes > 44);
    const h = Buffer.from(a.header, 'hex');
    if (a.mimeType === 'image/png') assert.equal(h.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    else if (a.mimeType === 'audio/wav') {
      assert.equal(h.toString('ascii', 0, 4), 'RIFF'); assert.equal(h.toString('ascii', 8, 12), 'WAVE');
      assert.equal(h.readUInt32LE(4) + 8, a.sizeBytes);
      audioSeconds += (a.sizeBytes - 44) / h.readUInt32LE(28);
    } else assert(['image/jpeg', 'image/webp', 'audio/mpeg'].includes(a.mimeType), `Unexpected media type ${a.mimeType}`);
  }

  const pages = [];
  await pooled(modules, async m => {
    const url = `/${parent.slug}/${m.slug}`;
    const html = await (await get(url)).text();
    for (const l of m.articles) assert(html.includes(`/articles/${l.article.slug}`), `${url}: article link missing`);
    assert(html.includes(escape(m.title)), `${url}: module title missing`);
    pages.push({ url, status: 200, articles: m.articles.length });
  });
  await pooled(newArticles, async a => {
    const url = `/articles/${a.slug}`;
    const html = await (await get(url)).text();
    for (const value of [a.seoTitle, a.seoDescription, a.coverImage.url]) assert(html.includes(escape(value)), `${url}: metadata or cover missing`);
    for (const s of a.sections) assert(html.includes(`section-${s.id}`) && html.includes(s.audioUrl), `${url}: section/audio missing`);
    pages.push({ url, status: 200, sections: a.sections.length });
  });
  const nav = await (await get('/api/menus?includeSubMenus=true')).json();
  const courseMenu = nav.data.find(m => m.slug === parent.slug);
  assert.deepEqual(courseMenu.subMenus.map(m => m.slug), modules.map(m => m.slug));
  const sitemap = await (await get('/sitemap.xml')).text();
  for (const a of articles) assert(sitemap.includes(`/articles/${a.slug}`), `Sitemap missing ${a.slug}`);
  const audioRangeChecks = [];
  for (const m of modules.slice(4)) {
    const url = m.articles.at(-1).article.sections.at(-1).audioUrl;
    const r = await get(url, { headers: { Range: 'bytes=0-4095' } });
    assert.equal(r.headers.get('content-type'), 'audio/wav');
    assert(r.headers.get('content-range')?.startsWith('bytes 0-4095/'));
    const b = Buffer.from(await r.arrayBuffer()); assert.equal(b.length, 4096); assert.equal(b.toString('ascii', 0, 4), 'RIFF');
    audioRangeChecks.push({ module: m.order, status: 206 });
  }
  const report = { verifiedAt: new Date().toISOString(), database: 'u915919430_appliedagentic', host: new URL(process.env.DATABASE_URL).hostname,
    publishedModules: 8, publishedArticles: 42, newArticles: 21, sections: 139, newSections: 75, covers: 42, audioSections: 139,
    newCovers: 21, newAudioSections: 75, totalAudioMinutes: Math.round(audioSeconds / 60), emDashesInPublishedCourse: 0,
    originalArticlesPreservedApartFromPunctuation: preserved, sourceTextAndMetadataVerified: true, navigationVerified: true,
    liveOrigin: origin, pages, sitemapVerified: true, audioRangeChecks };
  fs.writeFileSync(path.join(work, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => p.$disconnect());
