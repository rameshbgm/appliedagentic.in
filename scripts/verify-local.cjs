// Integration checks create and remove only their own records in localhost DB.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const dotenv = require('dotenv');
const { createPrismaClient } = require('../lib/prisma-client.cjs');
const sharp = require('sharp');
const env = dotenv.parse(fs.readFileSync('.env.local'));
const base = process.env.APP_TEST_URL || 'http://localhost:3000';
for (const value of [base, env.DATABASE_URL]) {
  if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname)) throw new Error('Verification is restricted to localhost.');
}
const db = createPrismaClient({ url: env.DATABASE_URL });
const stamp = `codex-check-${Date.now()}`;
const cookieJar = new Map();
const made = { article: [], menu: [], media: [] };
let originalSettings;
const checks = [];

async function request(path, options = {}, authenticated = true) {
  const headers = new Headers(options.headers);
  if (authenticated && cookieJar.size) headers.set('Cookie', [...cookieJar].map(([k, v]) => `${k}=${v}`).join('; '));
  const res = await fetch(new URL(path, base), { ...options, headers, redirect: 'manual', signal: AbortSignal.timeout(60_000) });
  if (authenticated) for (const cookie of res.headers.getSetCookie()) { const pair = cookie.split(';')[0]; const split = pair.indexOf('='); cookieJar.set(pair.slice(0, split), pair.slice(split + 1)); }
  return res;
}
async function json(path, method = 'GET', body, authenticated = true, expected = 200) {
  const res = await request(path, { method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }, authenticated);
  const data = await res.json();
  assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return data.data;
}
function pass(name) { checks.push(name); console.log(`PASS ${name}`); }
async function page(path, expected = 200, authenticated = true) {
  const res = await request(path, {}, authenticated); const html = await res.text();
  if (expected === 404 && res.status === 200) {
    // Next can send the shell before a streamed notFound() result is known.
    assert(html.includes('This stop is not on the map.'), `${path} must render the not-found boundary`);
    assert(!html.includes('Verification section'), 'Draft content leaked into the public response');
  } else assert.equal(res.status, expected, path);
  assert(!html.includes('This line is temporarily closed.'), `${path} rendered the error boundary`);
  return html;
}

async function main() {
  try {
    const health = await request('/api/health', {}, false); assert.equal(health.status, 200);
    assert((await db.article.count({ where: { status: 'PUBLISHED' } })) >= 72);
    pass('database readiness and populated content');
    const search = await json('/api/search?q=RAG%20Pipelines&limit=2'); assert(search.total > 0);
    const first = await json('/api/search?q=agent&limit=5&page=1');
    const second = await json('/api/search?q=agent&limit=5&page=2');
    assert(first.total > 5); assert(!first.items.some((a) => second.items.some((b) => a.id === b.id)));
    const invalid = await json('/api/search?q=RAG&page=-1&limit=bad'); assert.equal(invalid.page, 1); assert.equal(invalid.limit, 10);
    pass('multiword search, pagination and invalid query handling');
    await json('/api/articles', 'POST', { title: stamp }, false, 401);
    const csrf = await jsonAuthCsrf();
    const login = await request('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' }, body: new URLSearchParams({ csrfToken: csrf, email: process.env.APP_TEST_EMAIL || 'admin@appliedagentic.com', password: process.env.APP_TEST_PASSWORD || 'Admin@2026!' }) });
    assert.equal(login.status, 200);
    const session = await request('/api/auth/session'); assert((await session.json()).user);
    for (const path of ['/admin/dashboard', '/admin/menus', '/admin/submenus', '/admin/articles', '/admin/media', '/admin/settings', '/admin/subscribers']) await page(path);
    pass('admin login, protected APIs and every admin work area');

    const menu = await json('/api/menus', 'POST', { title: stamp, slug: stamp }, true, 201); made.menu.push(menu.id);
    const zone = await json('/api/submenus', 'POST', { title: `${stamp} zone`, slug: `${stamp}-zone`, menuId: menu.id }, true, 201);
    const png = await sharp({ create: { width: 40, height: 40, channels: 3, background: '#2450e8' } }).png().toBuffer();
    const form = new FormData(); form.set('file', new Blob([png], { type: 'image/png' }), 'verification.png');
    const upload = await request('/api/media/upload', { method: 'POST', body: form });
    assert.equal(upload.status, 201); const media = (await upload.json()).data; made.media.push(media.id);
    const crop = await json('/api/media/crop', 'POST', { mediaAssetId: media.id, x: 0, y: 0, width: 50, height: 50 }); made.media.push(crop.mediaAssetId);
    const image = await request(crop.url, {}, false); assert.equal(image.status, 200); assert.match(image.headers.get('content-type'), /image/);
    pass('image upload, storage, retrieval and crop');

    const article = await json('/api/articles', 'POST', { title: stamp, slug: stamp, summary: 'Local application verification.', status: 'DRAFT', content: 'Verification content.', subMenuIds: [zone.id], coverImageId: media.id, sections: [{ title: 'Verification section', content: '## A real section\n\nThis verifies publication and editing.' }] }, true, 201); made.article.push(article.id);
    await page(`/articles/${stamp}`, 404, false);
    await page(`/articles/${stamp}`, 200, true);
    const publishedAt = '2026-01-02T00:00:00.000Z';
    await json(`/api/articles/${article.id}`, 'PUT', { status: 'PUBLISHED', publishedAt });
    await json(`/api/articles/${article.id}`, 'PUT', { status: 'PUBLISHED', summary: 'Updated verification content.' });
    assert.equal((await json(`/api/articles/${article.id}`)).publishedAt, publishedAt);
    await json(`/api/articles/${article.id}/publish`, 'PATCH', { action: 'publish' });
    assert.equal((await json(`/api/articles/${article.id}`)).publishedAt, publishedAt);
    assert((await page(`/articles/${stamp}`, 200, false)).includes('A real section'));
    assert((await page(`/${stamp}/${stamp}-zone`, 200, false)).includes(stamp));
    const copy = await json(`/api/articles/${article.id}/duplicate`, 'POST', undefined, true, 201); made.article.push(copy.id);
    await json(`/api/articles/${article.id}/publish`, 'PATCH', { action: 'unpublish' });
    await page(`/articles/${stamp}`, 404, false);
    pass('menu and zone creation, article editing, publishing, dates, draft privacy, duplication and unpublishing');

    originalSettings = await json('/api/settings');
    await json('/api/settings', 'PUT', { siteName: 'Applied Agentic AI', tagline: `${stamp} settings work`, siteUrl: base });
    assert((await page('/')).includes(`${stamp} settings work`));
    await json('/api/settings', 'PUT', { siteUrl: 'not-a-url' }, true, 422);
    pass('settings persistence, validation and public rendering');

    const illustrated = await db.article.findFirstOrThrow({
      where: { status: 'PUBLISHED', coverImageId: { not: null }, sections: { some: { content: { contains: '![' } } } },
      select: { slug: true, subMenuArticles: { take: 1, select: { subMenu: { select: { slug: true, menu: { select: { slug: true } } } } } } },
    });
    const section = illustrated.subMenuArticles[0]?.subMenu;
    const imageRoutes = ['/', `/articles/${illustrated.slug}`, ...(section ? [`/${section.menu.slug}`, `/${section.menu.slug}/${section.slug}`] : [])];
    for (const showArticleImages of [false, true]) {
      await json('/api/settings', 'PUT', { showArticleImages });
      assert.equal((await json('/api/settings')).showArticleImages, showArticleImages);
      for (const route of imageRoutes) {
        const html = await page(route, 200, false);
        const imageCount = (html.match(/<img\b/g) || []).length;
        if (!showArticleImages) assert.equal(imageCount, 0, `${route} must omit image elements instead of hiding them`);
        else assert(imageCount > 0, `${route} should restore its images`);
      }
    }
    await json('/api/settings', 'PUT', { showArticleImages: 'false' }, true, 422);
    await json('/api/settings', 'PUT', { showArticleImages: originalSettings.showArticleImages });
    pass('article image setting persists and omits/restores cover, inline and listing images');

    const email = `${stamp}@example.com`;
    await json('/api/newsletter', 'POST', { email: 'invalid' }, false, 422);
    await json('/api/newsletter', 'POST', { email, source: 'homepage' }, false);
    await json('/api/newsletter', 'POST', { email: email.toUpperCase() }, false);
    assert.equal(await db.newsletterSubscriber.count({ where: { email } }), 1);
    const subscriber = await db.newsletterSubscriber.findUniqueOrThrow({ where: { email } });
    const csv = await request('/api/newsletter/subscribers'); assert((await csv.text()).includes(email));
    await json('/api/newsletter/unsubscribe', 'POST', { token: subscriber.token }, false);
    assert((await db.newsletterSubscriber.findUniqueOrThrow({ where: { email } })).unsubscribedAt);
    pass('newsletter persistence, duplicate handling, admin export and unsubscribe');

    const wav = Buffer.alloc(48044); wav.write('RIFF'); wav.writeUInt32LE(48036, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(24000, 24); wav.writeUInt32LE(48000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(48000, 40);
    const audio = await db.mediaAsset.create({ data: { filename: `${stamp}.wav`, url: `/uploads/audio/${stamp}.wav`, type: 'AUDIO', mimeType: 'audio/wav', data: wav, sizeBytes: wav.length } }); made.media.push(audio.id);
    for (const [range, bytes] of [['bytes=0-43', 44], ['bytes=-44', 44], ['bytes=48000-', 44]]) {
      const res = await request(audio.url, { headers: { Range: range } }, false); assert.equal(res.status, 206); assert.equal((await res.arrayBuffer()).byteLength, bytes);
    }
    const badRange = await request(audio.url, { headers: { Range: 'bytes=999999-' } }, false); assert.equal(badRange.status, 416);
    const existing = await db.article.findFirstOrThrow({ where: { status: 'PUBLISHED', audioUrl: { not: null } }, select: { audioUrl: true } });
    const remoteAudio = await request(existing.audioUrl, { headers: { Range: 'bytes=0-127' } }, false); assert.equal(remoteAudio.status, 206); assert.equal((await remoteAudio.arrayBuffer()).byteLength, 128);
    pass('audio byte ranges, seeking, invalid ranges and original narration streaming');
    await json(`/api/articles/${copy.id}`, 'DELETE');
    await json(`/api/articles/${article.id}`, 'DELETE');
    pass('article deletion');
    console.log(`Completed ${checks.length} end-to-end checks.`);
  } finally {
    if (originalSettings) await db.siteSettings.update({ where: { id: 1 }, data: { siteName: originalSettings.siteName, tagline: originalSettings.tagline, siteUrl: originalSettings.siteUrl, metaDescription: originalSettings.metaDescription, showArticleImages: originalSettings.showArticleImages } });
    await db.article.deleteMany({ where: { id: { in: made.article } } });
    await db.navMenu.deleteMany({ where: { id: { in: made.menu } } });
    await db.mediaAsset.deleteMany({ where: { id: { in: made.media } } });
    await db.newsletterSubscriber.deleteMany({ where: { email: `${stamp}@example.com` } });
    await db.$disconnect();
  }
}
async function jsonAuthCsrf() { const res = await request('/api/auth/csrf'); return (await res.json()).csrfToken; }
main().catch((err) => { console.error(err); process.exitCode = 1; });
