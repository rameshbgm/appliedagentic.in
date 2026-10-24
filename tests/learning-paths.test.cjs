const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadCurriculum, allArticles, slugify } = require('../scripts/learning-paths-plan.cjs');
const { narrationText, chunkText, transcriptCoverage, wav } = require('../scripts/learning-paths-audio.cjs');
const { renderDiagram } = require('../scripts/learning-paths-diagrams.cjs');
const { articleFields, checkState, assertTarget } = require('../scripts/learning-paths.cjs');
const { allocateDates } = require('../scripts/learning-paths-dates.cjs');

test('publication dates cover distinct Singapore days from January through today without future timestamps', () => {
  const articles = Array.from({ length: 114 }, (_, id) => ({ id, slug: `article-${id}`, publishedAt: null, updatedAt: new Date('2026-10-24T20:00:00Z') }));
  const now = new Date('2026-10-24T20:15:00Z');
  const plan = allocateDates(articles, now);
  const calendarDay = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(date);
  const days = plan.map(article => calendarDay(article.publishedAt));
  assert.equal(new Set(days).size, 114);
  assert.equal([...days].sort()[0], '2026-01-01');
  assert.equal([...days].sort().at(-1), '2026-10-25');
  assert(plan.every(article => article.publishedAt <= now));
  assert.deepEqual(allocateDates(articles, now), allocateDates([...articles].reverse(), now));
});

test('the complete curriculum contains 3 paths, 24 modules and 72 fully referenced lessons', () => {
  const tracks = loadCurriculum();
  assert.equal(tracks.length, 3);
  assert.equal(tracks.flatMap(t => t.modules).length, 24);
  assert.equal(allArticles(tracks).length, 72);
  assert(allArticles(tracks).every(a => a.words >= 650 && a.sources.length >= 2));
});

test('narration chunking preserves content and handles long unbroken tokens', () => {
  for (const input of ['First sentence. Second sentence. '.repeat(500), 'a'.repeat(5001)]) {
    const chunks = chunkText(input, 500);
    assert(chunks.length > 1);
    assert(chunks.every(chunk => chunk.length <= 500 && chunk.trim()));
    assert.equal(chunks.join('').replace(/\s/g, ''), input.replace(/\s/g, ''));
  }
});

test('transcript checks detect omitted or repeated passages', () => {
  assert.equal(transcriptCoverage('The agent calls a tool.', 'The agent calls a tool.'), 1);
  assert(transcriptCoverage('one two three four five', 'one two') < 0.88);
  assert(transcriptCoverage('one two three four five', 'one one one one one') < 0.88);
});

test('tiny closing passages retain enough lesson context for narration', () => {
  const text = 'A complete lesson sentence. '.repeat(180) + 'Continue with the next lesson.';
  const chunks = chunkText(text);
  assert(chunks.at(-1).length >= 250);
  assert(chunks.every(chunk => chunk.length <= 2400));
  assert.equal(chunks.join('').replace(/\s/g, ''), text.replace(/\s/g, ''));
});

test('narration strips markup and references while disclosing the synthetic voice', () => {
  const text = narrationText({ title: 'Tools', markdown: '## Concepts\n**Read** [the lesson](/articles/tools).\n```js\nrun();\n```\n## References\n[Source](https://example.com)' });
  assert.match(text, /AI-generated voice/);
  assert.match(text, /Read the lesson/);
  assert(!text.includes('https://') && !text.includes('run();') && !text.includes('**'));
});

test('WAV encoding preserves PCM payload and declares the expected sample format', () => {
  const pcm = Buffer.alloc(48000);
  const buffer = wav(pcm);
  assert.equal(buffer.readUInt32LE(24), 24000);
  assert.equal(buffer.readUInt32LE(40), 48000);
  assert.equal(buffer.length, 48044);
  assert.deepEqual(buffer.subarray(44), pcm);
});

function stateFor(tracks) {
  return tracks.map(track => ({ ...track, isVisible: true, subMenus: track.modules.map(module => ({ ...module, isVisible: true, articles: module.articles.map(expected => ({ orderIndex: expected.order, article: {
    ...articleFields(expected), slug: expected.slug, status: 'PUBLISHED',
    sections: [{ title: expected.title, content: expected.content, order: 0, audioUrl: '/audio.mp3' }],
    articleTags: expected.tags.map(tag => ({ tag: { slug: slugify(tag) } })), subMenuArticles: [{}],
    coverImage: { url: expected.imageUrl, mimeType: 'image/png', sizeBytes: 15000, altText: expected.coverAlt }, audioUrl: '/audio.mp3',
  } })) })) }));
}

test('publication validation rejects content drift and incomplete media', () => {
  const tracks = loadCurriculum(); const rows = stateFor(tracks);
  assert.doesNotThrow(() => checkState(rows, tracks, { media: true, published: true }));
  const article = rows[0].subMenus[0].articles[0].article;
  article.sections[0].audioUrl = null;
  assert.throws(() => checkState(rows, tracks, { media: true }), /incomplete audio/);
  article.sections[0].audioUrl = article.audioUrl;
  article.content += '\nchanged';
  assert.throws(() => checkState(rows, tracks), /differs from versioned source/);
});

test('database target must be explicitly named and match both URL and server', async () => {
  const original = { DATABASE_URL: process.env.DATABASE_URL, LEARNING_TARGET_DATABASE: process.env.LEARNING_TARGET_DATABASE };
  try {
    process.env.DATABASE_URL = 'mysql://user:pass@localhost/example';
    delete process.env.LEARNING_TARGET_DATABASE;
    await assert.rejects(() => assertTarget({}), /exact intended database/);
    process.env.LEARNING_TARGET_DATABASE = 'wrong';
    await assert.rejects(() => assertTarget({}), /differs from explicit target/);
    process.env.LEARNING_TARGET_DATABASE = 'example';
    await assert.rejects(() => assertTarget({ $queryRaw: async () => [{ name: 'another' }] }), /Connected database differs/);
  } finally {
    for (const [key, value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test('technical figures escape editorial text and include accessible descriptions', () => {
  const article = allArticles(loadCurriculum())[0];
  const svg = renderDiagram({ ...article, title: '<script> & "example"' });
  assert(svg.includes('&lt;script&gt; &amp; &quot;example&quot;'));
  assert(!svg.includes('<script>'));
  assert(svg.includes('aria-labelledby="title description"') && svg.includes('<desc id="description">'));
});
