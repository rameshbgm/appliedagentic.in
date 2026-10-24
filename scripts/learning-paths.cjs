#!/usr/bin/env node
// Explicit phases: --validate, --links, --apply, --media, --verify, --publish.
// No database writes occur unless a write phase is explicitly selected.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const { root, trackSlugs, sha, slugify, loadCurriculum, allArticles } = require('./learning-paths-plan.cjs');
const { generateDiagrams } = require('./learning-paths-diagrams.cjs');
const work = path.join(root, 'logs/learning-paths');
const site = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://appliedagentic.in').replace(/\/$/, '');
const log = (event, details = {}) => {
  fs.mkdirSync(work, { recursive: true });
  const row = { at: new Date().toISOString(), event, ...details };
  fs.appendFileSync(path.join(work, 'events.jsonl'), JSON.stringify(row) + '\n', { mode: 0o600 });
  console.log(JSON.stringify(row));
};
const save = (file, value) => fs.writeFileSync(path.join(work, file), JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });

async function assertTarget(p) {
  assert(process.env.DATABASE_URL, 'Load an explicit environment file before database operations');
  const url = new URL(process.env.DATABASE_URL);
  const expected = process.env.LEARNING_TARGET_DATABASE;
  assert(expected, 'Set LEARNING_TARGET_DATABASE to the exact intended database name');
  assert.equal(decodeURIComponent(url.pathname.slice(1)), expected, 'Environment database differs from explicit target');
  const [row] = await p.$queryRaw`SELECT DATABASE() AS name`;
  assert.equal(row.name, expected, 'Connected database differs from explicit target');
  log('database-verified', { database: row.name });
}

function articleFields(article) {
  return {
    title: article.title, summary: article.summary, content: article.content,
    readingTimeMinutes: article.readingTimeMinutes,
    seoTitle: article.seoTitle, seoDescription: article.seoDescription,
    seoKeywords: article.tags.join(', '), seoCanonicalUrl: `${site()}/articles/${article.slug}`,
    ogTitle: article.seoTitle, ogDescription: article.seoDescription,
    ogImageUrl: `${site()}${article.imageUrl}`,
    twitterTitle: article.seoTitle, twitterDescription: article.seoDescription,
    aiContentDeclaration: 'ai-assisted',
  };
}
const include = { subMenus: { orderBy: { order: 'asc' }, include: { articles: { orderBy: { orderIndex: 'asc' }, include: { article: {
  include: { sections: { orderBy: { order: 'asc' } }, articleTags: { include: { tag: true } }, coverImage: { select: { id: true, url: true, mimeType: true, sizeBytes: true, altText: true, width: true, height: true } }, subMenuArticles: true },
} } } } } };
async function readState(p) { return p.navMenu.findMany({ where: { slug: { in: trackSlugs } }, orderBy: { order: 'asc' }, include }); }
async function existingFingerprint(p, tracks) {
  const ownedSlugs = allArticles(tracks).map(a => a.slug);
  const articles = await p.article.findMany({
    where: { slug: { notIn: ownedSlugs } }, orderBy: { id: 'asc' },
    select: {
      id: true, title: true, slug: true, summary: true, content: true, status: true, coverImageId: true, audioUrl: true,
      seoTitle: true, seoDescription: true, seoKeywords: true,
      sections: { orderBy: { id: 'asc' }, select: { id: true, title: true, content: true, audioUrl: true, order: true } },
      articleTags: { orderBy: { tagId: 'asc' }, select: { tagId: true } },
    },
  });
  const menus = await p.navMenu.findMany({ where: { slug: { notIn: trackSlugs } }, orderBy: { id: 'asc' }, select: {
    id: true, slug: true, title: true, description: true, order: true, isVisible: true,
    subMenus: { orderBy: { id: 'asc' }, select: { id: true, slug: true, title: true, description: true, order: true, isVisible: true, articles: { orderBy: { id: 'asc' }, select: { articleId: true, orderIndex: true } } } },
  } });
  return { articles: articles.length, hash: sha(JSON.stringify({ articles, menus })) };
}
async function preserveExisting(p, tracks, capture = false) {
  const database = decodeURIComponent(new URL(process.env.DATABASE_URL).pathname.slice(1));
  const filename = `existing-${sha(database).slice(0, 12)}.json`;
  const destination = path.join(work, filename);
  const actual = await existingFingerprint(p, tracks);
  if (!fs.existsSync(destination)) {
    if (!capture) return;
    save(filename, actual); log('existing-content-snapshot', actual); return;
  }
  assert.deepEqual(actual, JSON.parse(fs.readFileSync(destination, 'utf8')), 'Pre-existing content changed during import; inspect the baseline before continuing');
  log('existing-content-unchanged', { articles: actual.articles });
}
function checkState(rows, tracks, { media = false, published = false } = {}) {
  assert.equal(rows.length, tracks.length, 'Some learning paths have not been imported');
  for (const track of tracks) {
    const menu = rows.find(m => m.slug === track.slug);
    assert(menu && menu.title === track.title && menu.description === track.description);
    assert.equal(menu.subMenus.length, 8);
    if (published) assert(menu.isVisible, `${track.slug}: menu hidden`);
    for (const module of track.modules) {
      const sub = menu.subMenus.find(m => m.slug === module.slug);
      assert(sub && sub.title === module.title && sub.order === module.order && sub.description === module.description);
      assert.equal(sub.articles.length, 3);
      if (published) assert(sub.isVisible, `${module.slug}: module hidden`);
      for (const expected of module.articles) {
        const link = sub.articles.find(l => l.article.slug === expected.slug);
        assert(link && link.orderIndex === expected.order, `${expected.slug}: incorrect article order`);
        const article = link.article;
        for (const [key, value] of Object.entries(articleFields(expected))) assert.equal(article[key], value, `${expected.slug}: ${key} differs from versioned source`);
        assert.equal(article.sections.length, 1);
        assert.equal(article.sections[0].title, expected.title);
        assert.equal(article.sections[0].content, expected.content);
        assert.equal(article.sections[0].order, 0);
        assert.equal(article.subMenuArticles.length, 1, `${expected.slug}: unexpected extra module assignment`);
        assert.deepEqual(article.articleTags.map(t => t.tag.slug).sort(), expected.tags.map(slugify).sort());
        if (media) {
          assert(article.coverImage?.url === expected.imageUrl && article.coverImage.sizeBytes > 1000 && article.coverImage.mimeType === 'image/png', `${expected.slug}: missing cover`);
          assert(article.coverImage.altText === expected.coverAlt, `${expected.slug}: missing image alternative text`);
          assert(article.audioUrl && article.sections[0].audioUrl === article.audioUrl, `${expected.slug}: incomplete audio`);
        }
        if (published) assert.equal(article.status, 'PUBLISHED');
      }
    }
  }
}
async function apply(p, tracks) {
  await preserveExisting(p, tracks, true);
  const author = await p.article.findFirst({ orderBy: { id: 'asc' }, select: { authorId: true } });
  assert(author, 'An existing article author is required');
  const before = await p.navMenu.findMany({ orderBy: { id: 'asc' }, select: { id: true, slug: true, title: true, isVisible: true } });
  const snapshot = `before-${Date.now()}.json`;
  save(snapshot, { capturedAt: new Date().toISOString(), menus: before, existingArticleCount: await p.article.count() });
  for (const track of tracks) {
    const existing = await p.navMenu.findUnique({ where: { slug: track.slug }, include });
    if (existing) { checkState([existing], [track]); log('path-already-matches', { slug: track.slug }); continue; }
    const modules = track.modules.map(m => m.slug);
    const articles = track.modules.flatMap(m => m.articles.map(a => a.slug));
    assert.equal(await p.navSubMenu.count({ where: { slug: { in: modules } } }), 0, 'Module slug conflict; refusing to overwrite');
    assert.equal(await p.article.count({ where: { slug: { in: articles } } }), 0, 'Article slug conflict; refusing to overwrite');
    await p.$transaction(async tx => {
      const menu = await tx.navMenu.create({ data: { title: track.title, slug: track.slug, description: track.description, order: track.order, isVisible: false } });
      for (const module of track.modules) {
        const sub = await tx.navSubMenu.create({ data: { menuId: menu.id, title: module.title, slug: module.slug, description: module.description, order: module.order, isVisible: false } });
        for (const article of module.articles) {
          const tags = [];
          for (const name of article.tags) tags.push(await tx.tag.upsert({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) }, update: {} }));
          await tx.article.create({ data: {
            ...articleFields(article), slug: article.slug, authorId: author.authorId, status: 'DRAFT',
            sections: { create: { title: article.title, content: article.content, order: 0 } },
            articleTags: { create: tags.map(tag => ({ tagId: tag.id })) },
            subMenuArticles: { create: { subMenuId: sub.id, orderIndex: article.order } },
          } });
        }
      }
    }, { maxWait: 30000, timeout: 120000 });
    log('path-staged', { slug: track.slug, modules: 8, articles: 24 });
  }
  checkState(await readState(p), tracks);
}

async function verifyMediaBytes(p, rows) {
  for (const menu of rows) for (const sub of menu.subMenus) for (const { article } of sub.articles) {
    for (const url of [article.coverImage.url, article.audioUrl]) {
      const asset = await p.mediaAsset.findUniqueOrThrow({ where: { url }, select: { data: true, sizeBytes: true, mimeType: true } });
      assert(asset.data && asset.data.length === asset.sizeBytes && asset.data.length > 1000, `Missing or truncated media: ${url}`);
      const data = Buffer.from(asset.data);
      if (asset.mimeType === 'image/png') assert((await sharp(data).metadata()).width === 1200, `Invalid image: ${url}`);
      else assert(asset.mimeType === 'audio/mpeg' && (data.toString('ascii', 0, 3) === 'ID3' || data[0] === 255), `Invalid audio: ${url}`);
    }
  }
}

async function media(p, tracks) {
  const { generateNarration } = require('./learning-paths-audio.cjs');
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  const config = { model: process.env.LEARNING_AUDIO_MODEL || process.env.OPENAI_AUDIO_MODEL || 'gpt-realtime-2.1-mini', voice: process.env.OPENAI_TTS_VOICE || 'marin', apiKey: process.env.OPENAI_API_KEY, ffmpeg };
  assert(config.apiKey, 'OPENAI_API_KEY is required to generate narration');
  assert(require('node:child_process').spawnSync(ffmpeg, ['-version']).status === 0, 'FFmpeg is required for compressed MP3 output; set FFMPEG_PATH');
  await generateDiagrams(tracks);
  const rows = await readState(p); checkState(rows, tracks);
  const dbArticles = rows.flatMap(m => m.subMenus.flatMap(s => s.articles.map(l => l.article)));
  const selectedPaths = process.env.LEARNING_MEDIA_PATHS?.split(',').filter(Boolean) || trackSlugs;
  assert(selectedPaths.every(slug => trackSlugs.includes(slug)), 'LEARNING_MEDIA_PATHS contains an unknown learning path');
  const articles = allArticles(tracks).filter(article => selectedPaths.includes(article.track.slug));
  const failures = []; let cursor = 0;
  const concurrency = Math.max(1, Math.min(4, Number(process.env.LEARNING_AUDIO_CONCURRENCY) || 3));
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < articles.length) {
      const expected = articles[cursor++]; const article = dbArticles.find(a => a.slug === expected.slug);
      try {
        if (!article.coverImageId) {
          const data = fs.readFileSync(path.join(work, 'covers', `${expected.slug}.png`));
          const asset = await p.mediaAsset.upsert({ where: { url: expected.imageUrl }, update: {}, create: {
            filename: path.basename(expected.imageUrl), url: expected.imageUrl, type: 'IMAGE', mimeType: 'image/png', data, sizeBytes: data.length,
            width: 1200, height: 800, altText: expected.coverAlt, caption: expected.diagram.caption, createdByUserId: article.authorId,
          } });
          await p.article.update({ where: { id: article.id }, data: { coverImageId: asset.id } });
          log('cover-attached', { slug: expected.slug, bytes: data.length });
        }
        if (article.audioUrl && article.sections[0].audioUrl === article.audioUrl) { log('audio-already-attached', { slug: expected.slug }); continue; }
        const generated = await generateNarration(expected, path.join(work, 'audio', expected.slug), config, log);
        const url = `/uploads/learning-audio/${expected.slug}-${generated.manifest.fingerprint.slice(0, 12)}.mp3`;
        await p.$transaction(async tx => {
          const current = await tx.article.findUniqueOrThrow({ where: { id: article.id }, select: { content: true } });
          assert.equal(current.content, expected.content, 'Article changed during narration generation');
          await tx.mediaAsset.upsert({ where: { url }, update: {}, create: {
            filename: path.basename(url), url, type: 'AUDIO', mimeType: 'audio/mpeg', data: generated.buffer, sizeBytes: generated.buffer.length,
            caption: `AI-generated narration. ${config.model}; voice ${config.voice}.`, createdByUserId: article.authorId,
          } });
          await tx.article.update({ where: { id: article.id }, data: { audioUrl: url } });
          await tx.articleSection.update({ where: { id: article.sections[0].id }, data: { audioUrl: url } });
          await tx.audioJob.upsert({ where: { articleId: article.id }, create: { articleId: article.id, status: 'done', total: 1, completed: 1, failed: 0 }, update: { status: 'done', total: 1, completed: 1, failed: 0 } });
          await tx.aIUsageLog.create({ data: { userId: article.authorId, articleId: article.id, type: 'AUDIO_GENERATION', model: config.model, promptSnippet: generated.text.slice(0, 200), status: 'success' } });
        }, { maxWait: 30000, timeout: 60000 });
        log('audio-attached', { slug: expected.slug, bytes: generated.buffer.length, durationSeconds: Math.round(generated.manifest.durationSeconds) });
      } catch (error) {
        const message = String(error.message).split(config.apiKey).join('[REDACTED]');
        failures.push({ slug: expected.slug, error: message }); log('media-failed', failures.at(-1));
      }
    }
  }));
  save('media-failures.json', failures);
  assert.equal(failures.length, 0, `${failures.length} media tasks failed; rerun --media to resume`);
}

async function verifyLinks(tracks) {
  const urls = [...new Set(allArticles(tracks).flatMap(a => [...a.markdown.matchAll(/\]\((https:\/\/[^\s)]+)\)/g)].map(m => m[1])))];
  const results = []; let cursor = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++]; let row;
      try {
        const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'AppliedAgentic-Curriculum-LinkCheck/1.0' } });
        row = { url, status: response.status, finalUrl: response.url, ok: response.ok };
        await response.body?.cancel();
      } catch (error) { row = { url, ok: false, error: error.message }; }
      results.push(row);
    }
  }));
  save('links.json', results);
  log('links-checked', { total: results.length, failures: results.filter(r => !r.ok) });
  assert(results.every(r => r.ok), 'Some reference links need review; see logs/learning-paths/links.json');
}

async function main() {
  fs.mkdirSync(work, { recursive: true });
  const tracks = loadCurriculum();
  const args = new Set(process.argv.slice(2));
  log('curriculum-validated', { tracks: tracks.length, modules: tracks.reduce((n, t) => n + t.modules.length, 0), articles: allArticles(tracks).length, words: allArticles(tracks).reduce((n, a) => n + a.words, 0) });
  if (args.has('--links')) await verifyLinks(tracks);
  if (args.has('--diagrams')) await generateDiagrams(tracks);
  if (![...args].some(a => ['--apply', '--media', '--verify', '--publish'].includes(a))) return;
  const p = new PrismaClient();
  try {
    await assertTarget(p);
    if (args.has('--apply')) await apply(p, tracks);
    if (args.has('--media')) await media(p, tracks);
    let rows = await readState(p);
    checkState(rows, tracks, { media: args.has('--verify') || args.has('--publish') });
    if (args.has('--verify') || args.has('--publish')) {
      await verifyMediaBytes(p, rows);
      await preserveExisting(p, tracks);
    }
    if (args.has('--publish')) {
      const articleIds = rows.flatMap(m => m.subMenus.flatMap(s => s.articles.map(l => l.article.id)));
      await p.$transaction(async tx => {
        await tx.article.updateMany({ where: { id: { in: articleIds }, status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
        await tx.navSubMenu.updateMany({ where: { menuId: { in: rows.map(m => m.id) } }, data: { isVisible: true } });
        await tx.navMenu.updateMany({ where: { id: { in: rows.map(m => m.id) } }, data: { isVisible: true } });
      });
      rows = await readState(p); checkState(rows, tracks, { media: true, published: true });
      log('curriculum-published', { menus: rows.length, articles: articleIds.length });
    }
    save('state.json', { checkedAt: new Date().toISOString(), paths: rows.map(m => ({ id: m.id, slug: m.slug, visible: m.isVisible, modules: m.subMenus.map(s => ({ slug: s.slug, visible: s.isVisible, articles: s.articles.map(l => ({ id: l.article.id, slug: l.article.slug, status: l.article.status, cover: l.article.coverImage?.url, audio: l.article.audioUrl })) })) })) });
    log('database-content-verified', { paths: rows.length });
  } finally { await p.$disconnect(); }
}
module.exports = { assertTarget, articleFields, checkState, verifyLinks, verifyMediaBytes };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
