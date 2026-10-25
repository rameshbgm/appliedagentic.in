// Versioned curriculum sources. This module never connects to a database.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'content/learning-paths');
const trackSlugs = ['agentic-ai-engineering', 'ai-evals', 'agent-harness-engineering'];
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const wordCount = text => text.trim().split(/\s+/u).length;

function loadCurriculum() {
  const slugs = new Set();
  const tracks = trackSlugs.map((slug, trackIndex) => {
    const directory = path.join(sourceRoot, slug);
    const track = JSON.parse(fs.readFileSync(path.join(directory, 'curriculum.json'), 'utf8'));
    assert.equal(track.slug, slug);
    assert(track.title && track.description && track.tagline);
    assert.equal(track.modules.length, 8, `${slug}: expected eight modules`);
    track.order = trackIndex + 2;
    for (const [moduleIndex, module] of track.modules.entries()) {
      assert(module.title && module.description && /^[a-z0-9-]+$/.test(module.slug));
      assert(!slugs.has(module.slug), `Duplicate module slug: ${module.slug}`);
      slugs.add(module.slug);
      module.order = moduleIndex + 1;
      assert.equal(module.articles.length, 3, `${module.slug}: expected three articles`);
      for (const [articleIndex, article] of module.articles.entries()) {
        assert(/^[a-z0-9-]+$/.test(article.slug) && !slugs.has(article.slug), `Invalid or duplicate article slug: ${article.slug}`);
        slugs.add(article.slug);
        assert(article.title && article.summary && article.coverAlt && article.coverConcept, `${article.slug}: missing editorial fields`);
        assert(article.seoTitle && article.seoTitle.length <= 60, `${article.slug}: SEO title exceeds 60 characters`);
        assert(article.seoDescription && article.seoDescription.length <= 160, `${article.slug}: SEO description exceeds 160 characters`);
        assert(article.tags.length >= 4 && new Set(article.tags.map(slugify)).size === article.tags.length, `${article.slug}: invalid tags`);
        assert(article.sources.length >= 2 && article.sources.every(s => s.title && new URL(s.url).protocol === 'https:'), `${article.slug}: missing primary references`);
        assert(article.file && path.basename(article.file) === article.file && article.file.endsWith('.md'), 'Unsafe source filename');
        const markdown = fs.readFileSync(path.join(directory, article.file), 'utf8').trim();
        assert(wordCount(markdown) >= 650, `${article.slug}: article needs at least 650 words (${wordCount(markdown)})`);
        assert(/## .*?(?:References|Sources)/i.test(markdown), `${article.slug}: missing references section`);
        assert(/## .*?(?:Exercise|Practice)/i.test(markdown), `${article.slug}: missing exercise`);
        assert(/\[[^\]]+\]\(\/articles\/[a-z0-9-]+\)/.test(markdown), `${article.slug}: missing internal article links`);
        for (const source of article.sources) assert(markdown.includes(source.url), `${article.slug}: reference is absent from article: ${source.url}`);
        assert(article.diagram?.nodes?.length >= 3 && article.diagram.nodes.length <= 5 && article.diagram.caption, `${article.slug}: missing diagram`);
        assert(article.diagram.edges.every(([from, to]) => Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to >= 0 && from < article.diagram.nodes.length && to < article.diagram.nodes.length), `${article.slug}: invalid diagram edges`);
        article.order = articleIndex + 1;
        article.markdown = markdown.replace(/^# [^\n]+\n+/, '');
        article.words = wordCount(markdown);
        article.readingTimeMinutes = Math.max(1, Math.ceil(article.words / 200));
        article.sourceHash = sha(markdown);
        article.imageUrl = `/uploads/learning/${article.slug}-${sha(JSON.stringify(article.diagram)).slice(0, 12)}.png`;
        article.content = `![${article.coverAlt.replace(/[\[\]]/g, '')}](${article.imageUrl})\n\n*${article.diagram.caption}*\n\n${article.markdown}`;
        const narrationFile = path.join(directory, article.file.replace(/\.md$/, '.narration.txt'));
        article.narration = fs.existsSync(narrationFile) ? fs.readFileSync(narrationFile, 'utf8').trim() : null;
      }
    }
    return track;
  });
  const articleSlugs = new Set(tracks.flatMap(t => t.modules.flatMap(m => m.articles.map(a => a.slug))));
  for (const track of tracks) for (const module of track.modules) for (const article of module.articles) {
    for (const [, target] of article.markdown.matchAll(/\]\(\/articles\/([a-z0-9-]+)(?:#[^)]*)?\)/g)) assert(articleSlugs.has(target), `${article.slug}: broken internal link ${target}`);
  }
  return tracks;
}

function allArticles(tracks) {
  return tracks.flatMap(track => track.modules.flatMap(module => module.articles.map(article => ({ ...article, track, module }))));
}

module.exports = { root, sourceRoot, trackSlugs, sha, slugify, wordCount, loadCurriculum, allArticles };

if (require.main === module) {
  const tracks = loadCurriculum();
  console.log(JSON.stringify(tracks.map(t => ({ title: t.title, modules: t.modules.length, articles: t.modules.flatMap(m => m.articles).length, words: t.modules.flatMap(m => m.articles).reduce((n, a) => n + a.words, 0) })), null, 2));
}
