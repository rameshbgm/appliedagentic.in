const { test } = require('node:test');
const assert = require('node:assert/strict');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'Node16', moduleResolution: 'Node16', jsx: 'react-jsx' } });
const { parseMediaRange } = require('../lib/media-range.ts');
const { positiveInteger, searchWhere } = require('../lib/search.ts');

test('media ranges support seeking, open ends and suffix requests', () => {
  assert.deepEqual(parseMediaRange('bytes=0-99', 1000), { start: 0, end: 99 });
  assert.deepEqual(parseMediaRange('bytes=500-', 1000), { start: 500, end: 999 });
  assert.deepEqual(parseMediaRange('bytes=-44', 1000), { start: 956, end: 999 });
  assert.deepEqual(parseMediaRange('bytes=950-2000', 1000), { start: 950, end: 999 });
  assert.deepEqual(parseMediaRange('bytes=-2000', 1000), { start: 0, end: 999 });
});

test('invalid and unsatisfiable media ranges never produce corrupt partial responses', () => {
  for (const header of ['bytes=-0', 'bytes=1000-', 'bytes=90-10', 'bytes=-', 'bytes=1-2,4-5', 'nonsense', 'bytes=99999999999999999999-']) {
    assert.equal(parseMediaRange(header, 1000), null, header);
  }
  assert.equal(parseMediaRange('bytes=0-', 0), null);
});

test('pagination cannot pass negative, fractional, NaN or unbounded limits to Prisma', () => {
  for (const value of [null, '', '-1', 'foo', '1.5', 'Infinity']) assert.equal(positiveInteger(value, 10, 100), 10);
  assert.equal(positiveInteger('100000', 10, 100), 100);
  assert.equal(positiveInteger('2', 1), 2);
});

test('multiword search matches each term across the article, sections, tags and visible zones', () => {
  const where = searchWhere('  RAG   Pipelines  ');
  assert.equal(where.status, 'PUBLISHED');
  assert.equal(where.AND.length, 2);
  assert.deepEqual(where.AND[0].OR[0], { title: { contains: 'RAG' } });
  assert.deepEqual(where.AND[1].OR[4], { articleTags: { some: { tag: { name: { contains: 'Pipelines' } } } } });
  assert.equal(where.AND[0].OR[5].subMenuArticles.some.subMenu.menu.isVisible, true);
  assert.deepEqual(searchWhere('RAG', 1, 2).topicArticles, { some: { topicId: 2 } });
});

test('disabled article images emit no image elements or sources while preserving lesson text and links', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Renderer = require('../components/public/MarkdownRenderer.tsx').default;
  const content = '# Lesson\n\nKeep the lesson text and [reference](https://example.com/reference).\n\n![Diagram](https://example.com/diagram.png)\n\n[![Linked image](https://example.com/linked.png)](https://example.com/detail)';
  const visible = renderToStaticMarkup(React.createElement(Renderer, { content }));
  assert.equal((visible.match(/<img\b/g) || []).length, 2);
  const hidden = renderToStaticMarkup(React.createElement(Renderer, { content, showImages: false }));
  assert(!/<img\b|src=|rel="preload"/.test(hidden));
  assert(hidden.includes('Keep the lesson text'));
  assert(hidden.includes('href="https://example.com/reference"'));
  assert(hidden.includes('<h1>Lesson</h1>'));
});
