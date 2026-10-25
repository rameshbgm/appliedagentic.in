const { test } = require('node:test');
const assert = require('node:assert/strict');
const { planRelease } = require('../scripts/deploy-schema.cjs');
const column = (tableName, columnName) => ({ tableName, columnName });
const base = [column('SiteSettings', 'id')];
const complete = [...base, ...['siteUrl', 'showArticleImages'].map((name) => column('SiteSettings', name)), ...['id', 'email', 'token', 'source', 'createdAt', 'unsubscribedAt'].map((name) => column('NewsletterSubscriber', name))];
test('legacy production schema requires only the three reviewed additive changes', () => {
  const plan = planRelease(base);
  assert.deepEqual(plan.map((step) => step.name), ['SiteSettings.siteUrl', 'SiteSettings.showArticleImages', 'NewsletterSubscriber']);
  for (const step of plan) {
    assert.match(step.sql, /(?:ALTER TABLE|CREATE TABLE)/);
    assert.doesNotMatch(step.sql, /\b(?:DROP|TRUNCATE|DELETE|UPDATE)\b/i);
  }
  assert.match(plan[1].sql, /DEFAULT true/);
  assert.match(plan[2].sql, /UNIQUE INDEX `NewsletterSubscriber_token_key`/);
});
test('completed releases are no-ops and partial releases resume only missing steps', () => {
  assert.deepEqual(planRelease(complete), []);
  assert.deepEqual(planRelease([...base, column('SiteSettings', 'siteUrl')]).map((step) => step.name), ['SiteSettings.showArticleImages', 'NewsletterSubscriber']);
});
test('wrong database and incompatible existing tables fail before applying any SQL', () => {
  assert.throws(() => planRelease([]), /database target/);
  assert.throws(() => planRelease([...base, column('NewsletterSubscriber', 'id')]), /incompatible schema/);
});
