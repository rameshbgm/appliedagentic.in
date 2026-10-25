#!/usr/bin/env node
// User-requested publication-date allocation. Dry run unless --apply is supplied.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createPrismaClient } = require('../lib/prisma-client.cjs');
const { root, sha } = require('./learning-paths-plan.cjs');
const { assertTarget } = require('./learning-paths.cjs');

function allocateDates(articles, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const year = Number(today.slice(0, 4));
  assert.equal(year, 2026, 'This editorial date allocation is explicitly scoped to 2026');
  const start = new Date('2026-01-01T00:00:00+08:00').getTime();
  const endDay = new Date(`${today}T00:00:00+08:00`).getTime();
  const days = Math.round((endDay - start) / 86400000);
  assert(articles.length <= days + 1, 'Not enough calendar days to assign distinct publication dates');
  const rank = day => sha(`applied-agentic-publication-2026:${day}`);
  const available = Array.from({ length: Math.max(0, days - 1) }, (_, i) => i + 1).sort((a, b) => rank(a).localeCompare(rank(b)));
  const selected = articles.length >= 2 ? [0, days, ...available.slice(0, articles.length - 2)] : [0];
  const ordered = [...articles].sort((a, b) => sha(a.slug).localeCompare(sha(b.slug)));
  return ordered.map((article, index) => {
    const day = selected[index];
    const fraction = parseInt(sha(article.slug).slice(0, 8), 16) / 0x100000000;
    const midnight = start + day * 86400000;
    const minutes = day === days
      ? Math.floor(fraction * Math.max(0, Math.floor((now.getTime() - midnight) / 60000)))
      : 9 * 60 + Math.floor(fraction * 10 * 60);
    const publishedAt = new Date(midnight + minutes * 60000);
    assert(publishedAt >= new Date(start) && publishedAt <= now);
    return { id: article.id, slug: article.slug, publishedAt, previousPublishedAt: article.publishedAt, updatedAt: article.updatedAt };
  });
}

async function main() {
  const p = createPrismaClient();
  try {
    await assertTarget(p);
    const articles = await p.article.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, slug: true, publishedAt: true, updatedAt: true }, orderBy: { id: 'asc' } });
    assert(articles.length, 'Publish the complete curriculum before allocating dates');
    const plan = allocateDates(articles);
    const directory = path.join(root, 'logs/learning-paths');
    fs.mkdirSync(directory, { recursive: true });
    const backup = path.join(directory, 'publication-dates-before.json');
    if (!fs.existsSync(backup)) fs.writeFileSync(backup, JSON.stringify(articles, null, 2), { mode: 0o600 });
    fs.writeFileSync(path.join(directory, 'publication-dates-plan.json'), JSON.stringify(plan, null, 2), { mode: 0o600 });
    if (process.argv.includes('--apply')) {
      for (const article of plan) await p.article.update({ where: { id: article.id }, data: { publishedAt: article.publishedAt, updatedAt: article.updatedAt } });
      const actual = await p.article.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, publishedAt: true } });
      for (const article of actual) assert.equal(article.publishedAt.toISOString(), plan.find(a => a.id === article.id).publishedAt.toISOString());
    }
    const dates = plan.map(a => a.publishedAt.toISOString()).sort();
    console.log(JSON.stringify({ articles: plan.length, distinctDays: new Set(plan.map(a => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(a.publishedAt))).size, first: dates[0], last: dates.at(-1), timezone: 'Asia/Singapore', applied: process.argv.includes('--apply') }));
  } finally { await p.$disconnect(); }
}
module.exports = { allocateDates };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
