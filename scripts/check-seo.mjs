import assert from 'node:assert/strict';
import { POSTS, getPublishedPosts, isPostPublished } from '../src/data/posts.ts';
import { GUIDE_AUDIENCES, guideAudiencePath } from '../src/lib/guideAudiences.ts';

// Read-only HTTP smoke check. No analytics events, form submissions or authenticated data reads.
// Usage: node --experimental-strip-types scripts/check-seo.mjs [http://127.0.0.1:3012]
const origin = 'https://form.it.kr';
const base = new URL(process.argv[2] || origin);
assert.ok(base.origin === origin || ['localhost', '127.0.0.1'].includes(base.hostname), 'Use production or a local test server');
const results = [];
const normalizeUrl = value => new URL(value).href;
const decodeHtml = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), decodeHtml(match[2])]));
const meta = (html, name) => [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0])).find(item => item.name === name)?.content || '';
const canonical = html => [...html.matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0])).find(item => item.rel === 'canonical')?.href;
async function read(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(55000), headers: { 'user-agent': 'Googlebot SEO verification (read-only)' } });
  return { response, html: await response.text() };
}
async function checked(path, check) {
  try {
    await check(await read(path));
    results.push({ path, pass: true });
  } catch (error) {
    results.push({ path, pass: false, error: error.message });
  }
}
function checkRobots(html, indexable) {
  for (const name of ['robots', 'googlebot']) {
    const value = meta(html, name);
    assert.match(value, indexable ? /(?:^|,\s*)index(?:,|$)/ : /(?:^|,\s*)noindex(?:,|$)/, name + ' indexing directive');
  }
}
function checkCanonical(html, path) {
  assert.equal(normalizeUrl(canonical(html)), normalizeUrl(new URL(path, origin)), 'Canonical must use the production origin and clean path');
}
async function parallel(items, run) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (cursor < items.length) await run(items[cursor++]);
  }));
}

for (const path of ['/', '/landing', '/?utm_source=seo-test']) {
  await checked(path, ({ response, html }) => {
    assert.equal(response.status, 200);
    checkRobots(html, true);
    checkCanonical(html, path.startsWith('/?') ? '/' : path);
    assert.match(html, /application\/ld\+json/);
  });
}
const published = getPublishedPosts();
await checked('/blog', ({ response, html }) => {
  assert.equal(response.status, 200);
  checkRobots(html, published.length > 0);
  checkCanonical(html, '/blog');
  if (!published.length) {
    assert.ok(html.includes('기존 자료를 검수하고 있어요'));
    assert.ok(!html.includes('현직 인테리어 전문가'));
    assert.ok(!html.includes('"content":"##'));
  }
  for (const audience of GUIDE_AUDIENCES) assert.ok(html.includes('href="' + guideAudiencePath(audience.id) + '"'), 'Two audience entry links must be crawlable');
});
await parallel(GUIDE_AUDIENCES, audience => checked(guideAudiencePath(audience.id), ({ response, html }) => {
  const matching = published.filter(post => post.audiences?.includes(audience.id));
  assert.equal(response.status, 200);
  checkRobots(html, matching.length > 0);
  checkCanonical(html, guideAudiencePath(audience.id));
  assert.ok(html.includes(audience.title));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  if (!matching.length) assert.ok(html.includes(audience.id === 'residential' ? '주거 인테리어 단계별 체크리스트' : '기존 자료를 검수하고 있어요'));
  assert.ok(html.includes('href="/blog"'));
}));
await parallel(POSTS, post => checked('/blog/' + encodeURIComponent(post.slug), ({ response, html }) => {
  const publishedPost = isPostPublished(post);
  assert.equal(response.status, 200, 'Existing article URL must resolve');
  checkRobots(html, publishedPost);
  checkCanonical(html, '/blog/' + encodeURIComponent(post.slug));
  if (!publishedPost) {
    assert.ok(html.includes('내용을 확인하고 있어요'));
    const firstHeading = post.content.split('\n').find(line => /^##? /.test(line))?.replace(/^#+ /, '');
    if (firstHeading) assert.ok(!html.includes(firstHeading), 'Unreviewed body must not appear in HTML or RSC');
    assert.doesNotMatch(html, /"@type"\s*:\s*"Article"/);
    assert.ok(!html.includes(post.description), 'Unreviewed description must not be serialized');
  }
}));
const utilities = ['/admin', '/consult', '/consult/step2', '/consult/step3', '/consult/step4', '/estimate', '/estimate/detail', '/estimate/scan', '/login', '/signup', '/privacy', '/partner/leads'];
await parallel(utilities, path => checked(path, ({ response, html }) => {
  assert.equal(response.status, 200);
  checkRobots(html, false);
  assert.equal(canonical(html), undefined, 'Utility must not inherit the homepage canonical');
}));
await checked('/blog/seo-check-nonexistent-guide', ({ response }) => assert.equal(response.status, 404));
await checked('/robots.txt', ({ response, html }) => {
  assert.equal(response.status, 200);
  assert.ok(html.includes('Sitemap: https://form.it.kr/sitemap.xml'));
  assert.ok(html.includes('Disallow: /api/'));
  assert.doesNotMatch(html, /Disallow:.*(?:blog|admin|consult)/, 'Crawlers must be able to read noindex');
});
await checked('/sitemap.xml', ({ response, html }) => {
  assert.equal(response.status, 200);
  const urls = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => normalizeUrl(decodeHtml(match[1]))).sort();
  const categories = GUIDE_AUDIENCES.filter(audience => published.some(post => post.audiences?.includes(audience.id))).map(audience => guideAudiencePath(audience.id));
  const expected = ['/', '/landing', ...(published.length ? ['/blog'] : []), ...categories, ...published.map(post => '/blog/' + encodeURIComponent(post.slug))].map(path => normalizeUrl(new URL(path, origin))).sort();
  assert.deepEqual(urls, expected, 'Only approved canonical pages may enter sitemap');
  assert.ok(!html.includes('interiorhub.co.kr'));
});
await parallel(['/formit-share-v3.png', '/formit-icon-transparent-64.png', '/formit-apple-v2.png', '/favicon.ico'], path => checked(path, ({ response }) => assert.equal(response.status, 200)));
await parallel(['/api/admin/referrals', '/api/admin/consultations'], path => checked(path, ({ response }) => {
  assert.equal(response.status, 401);
  assert.match(response.headers.get('cache-control') || '', /no-store/);
}));
const failures = results.filter(result => !result.pass);
for (const result of failures) console.error('FAIL', result.path, result.error);
console.log(JSON.stringify({ base: base.origin, checks: results.length, passed: results.length - failures.length, failed: failures.length, preserved: POSTS.length, held: POSTS.length - published.length, published: published.length }, null, 2));
if (failures.length) process.exitCode = 1;
