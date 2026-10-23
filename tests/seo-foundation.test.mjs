import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as posts from '../src/data/posts.ts';
import * as share from '../src/lib/shareMetadata.ts';
import * as audiences from '../src/lib/guideAudiences.ts';
import * as checklist from '../src/lib/residentialChecklist.ts';
import * as residentialDetails from '../src/data/residentialGuideDetails.ts';

const require = createRequire(import.meta.url);
const now = new Date('2026-10-22T02:00:00Z');
function load(path, dependencies = {}) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(output, { exports, URL, process, require: name => dependencies[name] ?? require(name) });
  return exports;
}
const seo = load('src/lib/siteMetadata.ts', { './shareMetadata': share });
const C = { bg: '#fff8dd', card: '#fff', border: '#ddd', primary: '#f5c200', textDark: '#111', textMid: '#444' };
const Link = ({ href, children, ...props }) => React.createElement('a', { ...props, href }, children);
const content = load('src/components/GuideContent.tsx', { './EstimateLayout': { C } });
const roadmap = load('src/components/ResidentialRoadmap.tsx', { './EstimateLayout': { C: { ...C, primaryLight: '#ffd740', ruler: {} } }, '@/lib/residentialChecklist': checklist, 'next/link': { default: Link } });
const views = load('src/components/GuideViews.tsx', { './EstimateLayout': { C }, './GuideContent': content, './ResidentialRoadmap': roadmap, 'next/link': { default: Link }, '@/lib/guideAudiences': audiences });
const detailView = load('src/components/ResidentialGuideDetail.tsx', { './EstimateLayout': { C }, './GuideViews': views, '@/lib/residentialChecklist': checklist, 'next/link': { default: Link } });
function articleModule(data = posts) {
  return load('src/app/blog/[slug]/page.tsx', {
    '@/data/posts': data, '@/lib/siteMetadata': seo, '@/components/GuideViews': views,
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
  });
}
const approved = () => ({ ...posts.POSTS[0], status: 'published', publishedAt: '2026-10-20',
  review: { reviewer: '검증용 검수자', reviewedAt: '2026-10-21', sources: [{ title: '검증용 공식 출처', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' }] } });

test('all 22 original records are preserved but withheld from publication until reviewed', () => {
  assert.equal(posts.POSTS.length, 22);
  assert.equal(posts.getPublishedPosts(now).length, 0);
  assert.ok(posts.POSTS.every(post => post.content.length > 0 && !posts.isPostPublished(post, now)));
});

test('Korean, encoded and Unicode-normalized old slugs resolve; malformed or unknown paths do not', () => {
  for (const post of posts.POSTS) {
    assert.equal(posts.getPostBySlug(post.slug), post);
    assert.equal(posts.getPostBySlug(encodeURIComponent(post.slug)), post);
    assert.equal(posts.getPostBySlug(encodeURIComponent(post.slug.normalize('NFD'))), post);
  }
  for (const slug of ['%E0%A4%A', '../admin', '%2Fadmin', 'does-not-exist', encodeURIComponent(encodeURIComponent(posts.POSTS[0].slug))]) assert.equal(posts.getPostBySlug(slug), undefined);
});

test('publication requires explicit approval, usable content, real dates and a named review with HTTPS sources', () => {
  const post = approved();
  assert.equal(posts.isPostPublished(post, now), true);
  const invalid = [
    { ...post, status: 'draft' }, { ...post, review: undefined }, { ...post, title: '' }, { ...post, content: ' ' },
    { ...post, publishedAt: '2026-02-30' }, { ...post, publishedAt: '2026-10-23' },
    { ...post, review: { ...post.review, reviewer: '' } }, { ...post, review: { ...post.review, sources: [] } },
    { ...post, review: { ...post.review, reviewedAt: '2026-10-23' } },
    ...['http://example.com', 'javascript:alert(1)', 'https://user:password@example.com'].map(url => ({ ...post, review: { ...post.review, sources: [{ title: 'source', url }] } })),
  ];
  for (const value of invalid) assert.equal(posts.isPostPublished(value, now), false);
  assert.equal(posts.isPostPublished({ ...post, publishedAt: '2026-10-23' }, new Date('2026-10-22T15:00:00Z')), true);
});

test('canonical and share URLs stay on Formit; utilities clear inherited canonicals; preview stays noindex', () => {
  const metadata = seo.pageMetadata(seo.PUBLIC_SEARCH_PAGES[0]);
  assert.equal(metadata.alternates.canonical, 'https://form.it.kr/');
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.images[0].url, share.shareImage.url);
  assert.equal(seo.utilityMetadata('관리자').alternates.canonical, null);
  assert.equal(seo.utilityMetadata('관리자').robots.index, false);
  for (const path of ['https://evil.test/', '//evil.test', '/\\evil.test/']) assert.throws(() => seo.siteUrl(path));
  const previous = process.env.VERCEL_ENV;
  try { process.env.VERCEL_ENV = 'preview'; assert.equal(seo.pageMetadata(seo.PUBLIC_SEARCH_PAGES[0]).robots.googleBot.index, false); }
  finally { if (previous === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous; }
});

test('sitemap includes only indexable, working public routes and approved guides without fake update dates', () => {
  const module = load('src/app/sitemap.ts', { '@/data/posts': posts, '@/lib/siteMetadata': seo, '@/lib/guideAudiences': audiences });
  const entries = module.default();
  assert.deepEqual(Array.from(entries, entry => entry.url), ['https://form.it.kr/', 'https://form.it.kr/landing']);
  assert.ok(entries.every(entry => entry.lastModified === undefined));
  const post = approved();
  const future = load('src/app/sitemap.ts', { '@/data/posts': { getPublishedPosts: () => [post] }, '@/lib/siteMetadata': seo, '@/lib/guideAudiences': audiences }).default();
  assert.equal(future.length, 4);
  assert.equal(future.at(-1).url, seo.siteUrl(seo.blogPath(post.slug)));
  assert.equal(future.at(-1).lastModified, '2026-10-21');
  assert.ok(!JSON.stringify(future).includes('interiorhub.co.kr'));
});

test('robots advertises the right sitemap and allows noindex notices to be crawled', () => {
  const rules = load('src/app/robots.ts', { '@/lib/siteMetadata': seo }).default();
  assert.equal(rules.sitemap, 'https://form.it.kr/sitemap.xml');
  assert.equal(rules.rules.allow, '/');
  assert.equal(rules.rules.disallow, '/api/');
});

test('all utility layouts explicitly exclude their pages without altering their providers', () => {
  for (const route of ['admin', 'consult', 'estimate', 'login', 'signup', 'partner', 'privacy']) {
    const layout = load('src/app/' + route + '/layout.tsx', { '@/lib/siteMetadata': seo,
      '@/components/AdminTheme': { AdminThemeProvider: 'admin-theme' }, '@/components/EstimateProgressProvider': { EstimateProgressProvider: 'estimate-progress' } });
    assert.equal(layout.metadata.robots.index, false, route);
    assert.equal(layout.metadata.robots.googleBot.index, false, route);
    assert.equal(layout.metadata.alternates.canonical, null, route);
    if (route === 'admin') assert.equal(layout.default({ children: 'fixture' }).type, 'admin-theme');
    if (route === 'consult') assert.equal(layout.default({ children: 'fixture' }).type, 'estimate-progress');
  }
  assert.equal(load('src/app/landing/layout.tsx', { '@/lib/siteMetadata': seo }).metadata.alternates.canonical, 'https://form.it.kr/landing');
});

test('review notices resolve old URLs with noindex and never expose original text, false authors or Article markup', async () => {
  const module = articleModule();
  assert.equal(module.generateStaticParams().length, 22);
  for (const post of posts.POSTS) {
    const props = { params: Promise.resolve({ slug: encodeURIComponent(post.slug) }) };
    const metadata = await module.generateMetadata(props);
    assert.equal(metadata.robots.index, false);
    assert.equal(metadata.robots.googleBot.index, false);
    assert.equal(metadata.alternates.canonical, seo.siteUrl(seo.blogPath(post.slug)));
    assert.equal(metadata.openGraph.type, 'website');
    const tree = await module.default(props);
    const view = tree.props.children[1];
    assert.equal(view.props.published, false);
    assert.equal(view.props.post.content, undefined);
    assert.equal(view.props.post.review, undefined);
    const html = renderToStaticMarkup(tree);
    assert.match(html, /내용을 확인하고 있어요/);
    assert.doesNotMatch(html, /application\/ld\+json|폼잇\. 전문가|30초|세부 견적|평당 단가:/);
    assert.match(html, /href="\/consult\?new=1"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  }
  await assert.rejects(module.default({ params: Promise.resolve({ slug: 'does-not-exist' }) }), /NOT_FOUND/);
});

test('empty guide index is a server-built noindex notice and does not serialize the archive', () => {
  const layout = load('src/app/blog/layout.tsx', { '@/data/posts': posts, '@/lib/siteMetadata': seo });
  assert.equal(layout.generateMetadata().robots.index, false);
  const page = load('src/app/blog/page.tsx', { '@/data/posts': posts, '@/lib/siteMetadata': seo, '@/components/GuideViews': views });
  const tree = page.default();
  assert.equal(tree.props.posts.length, 0);
  const html = renderToStaticMarkup(tree);
  assert.match(html, /기존 자료를 검수하고 있어요/);
  assert.doesNotMatch(html, /현직|정확한 단가|30초|세부 견적|도배 비용 완전 정리/);
  assert.match(html, /aria-label="공간별 인테리어 가이드"/);
  for (const audience of audiences.GUIDE_AUDIENCES) {
    assert.match(html, new RegExp('href="' + audiences.guideAudiencePath(audience.id) + '"'));
    assert.ok(html.includes(audience.title));
  }
});

test('audience lists require both publication approval and explicit audience assignment', () => {
  const count = posts.POSTS.length;
  const fixtures = [
    { ...approved(), slug: 'residential-fixture', audiences: ['residential'] },
    { ...approved(), slug: 'commercial-fixture', audiences: ['commercial'] },
    { ...approved(), slug: 'shared-fixture', audiences: ['residential', 'commercial'] },
    { ...approved(), slug: 'unassigned-fixture' },
    { ...approved(), slug: 'draft-fixture', status: 'draft', audiences: ['residential', 'commercial'] },
  ];
  try {
    posts.POSTS.push(...fixtures);
    assert.deepEqual(posts.getPublishedPostsForAudience('residential', now).map(post => post.slug).sort(), ['residential-fixture', 'shared-fixture']);
    assert.deepEqual(posts.getPublishedPostsForAudience('commercial', now).map(post => post.slug).sort(), ['commercial-fixture', 'shared-fixture']);
  } finally { posts.POSTS.splice(count); }
  assert.equal(posts.POSTS.length, 22);
  assert.equal(posts.getPublishedPostsForAudience('residential', now).length, 0);
  assert.equal(posts.getPublishedPostsForAudience('commercial', now).length, 0);
});

test('both audience routes have independent canonicals, noindex empty states, real links and no held article bodies', () => {
  for (const audience of audiences.GUIDE_AUDIENCES) {
    const module = load('src/app/blog/' + audience.id + '/page.tsx', { '@/data/posts': posts, '@/lib/siteMetadata': seo, '@/components/GuideViews': views });
    const metadata = module.generateMetadata();
    assert.equal(metadata.alternates.canonical, 'https://form.it.kr/blog/' + audience.id);
    assert.equal(metadata.robots.index, false);
    assert.equal(metadata.robots.googleBot.index, false);
    assert.ok(metadata.title.includes(audience.title));
    const tree = module.default();
    assert.equal(tree.props.audience, audience.id);
    assert.equal(tree.props.posts.length, 0);
    const html = renderToStaticMarkup(tree);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, audience.id === 'residential' ? /주거 인테리어 단계별 가이드/ : /기존 자료를 검수하고 있어요/);
    const active = html.match(/<a\b[^>]*>/g).find(tag => tag.includes('href="/blog/' + audience.id + '"'));
    assert.ok(active.includes('aria-current="page"'));
    assert.match(html, /href="\/blog"/);
    assert.doesNotMatch(html, /도배 비용 완전 정리|평당 단가:|현직 인테리어 전문가/);
    const unassigned = load('src/app/blog/' + audience.id + '/page.tsx', { '@/data/posts': { getPublishedPostsForAudience: () => [] }, '@/lib/siteMetadata': seo, '@/components/GuideViews': views });
    assert.equal(unassigned.generateMetadata().robots.index, false);
    const approvedModule = load('src/app/blog/' + audience.id + '/page.tsx', { '@/data/posts': { getPublishedPostsForAudience: () => [{ ...approved(), audiences: [audience.id] }] }, '@/lib/siteMetadata': seo, '@/components/GuideViews': views });
    assert.equal(approvedModule.generateMetadata().robots.index, true);
    assert.equal(approvedModule.default().props.posts.length, 1);
  }
});

test('sitemap includes an audience only when that audience has a reviewed published guide', () => {
  const build = data => load('src/app/sitemap.ts', { '@/data/posts': { getPublishedPosts: () => data }, '@/lib/siteMetadata': seo, '@/lib/guideAudiences': audiences }).default();
  const residential = { ...approved(), audiences: ['residential'] };
  const one = build([residential]).map(entry => entry.url);
  assert.ok(one.includes('https://form.it.kr/blog/residential'));
  assert.ok(!one.includes('https://form.it.kr/blog/commercial'));
  const both = build([{ ...residential, audiences: ['residential', 'commercial'] }]).map(entry => entry.url);
  assert.ok(both.includes('https://form.it.kr/blog/commercial'));
  assert.equal(new Set(both).size, both.length);
});

test('residential roadmap has eight ordered stages and 25 unique detail destinations', () => {
  assert.equal(checklist.RESIDENTIAL_STAGES.length, 8);
  assert.equal(checklist.RESIDENTIAL_STAGES[0].percent, 0);
  assert.equal(checklist.RESIDENTIAL_STAGES.at(-1).percent, 100);
  assert.equal(checklist.RESIDENTIAL_ITEMS.length, 25);
  assert.equal(new Set(checklist.RESIDENTIAL_ITEMS.map(item => item.id)).size, 25);
  assert.equal(new Set(checklist.RESIDENTIAL_STAGES.map(stage => stage.id)).size, 8);
  for (const [index, stage] of checklist.RESIDENTIAL_STAGES.entries()) {
    if (index) assert.ok(stage.percent > checklist.RESIDENTIAL_STAGES[index - 1].percent);
    assert.ok(stage.items.every(item => item.title && item.detail));
  }
  assert.equal(checklist.getResidentialGuide(checklist.RESIDENTIAL_ITEMS[0].id).previous, null);
  assert.equal(checklist.getResidentialGuide(checklist.RESIDENTIAL_ITEMS.at(-1).id).next, null);
  for (const invalid of ['', '../admin', 'unknown', '%2fadmin']) assert.equal(checklist.getResidentialGuide(invalid), undefined);
  for (const [input, expected] of [[0, 0], [0.504, 50], [0.999, 100], [1, 100], [-5, 0], [3, 100], [NaN, 0], [Infinity, 0]]) assert.equal(checklist.guideScrollPercent(input), expected);
});

test('residential roadmap has crawlable item links and no checkboxes, saved-state access or paid side effects', () => {
  const html = renderToStaticMarkup(React.createElement(roadmap.default));
  assert.equal((html.match(/type="checkbox"/g) || []).length, 0);
  assert.equal((html.match(/<h3\b/g) || []).length, 8);
  assert.match(html, /가이드 탐색 위치/);
  assert.match(html, /실제 공사 진행률/);
  for (const item of checklist.RESIDENTIAL_ITEMS) assert.ok(html.includes('href="' + checklist.residentialGuidePath(item.id) + '"'));
  assert.doesNotMatch(html, /체크한 항목|브라우저에만 저장/);
  assert.match(html, /참고 자료와 이용 안내/);
  for (const source of checklist.RESIDENTIAL_SOURCES) assert.ok(html.includes(source.title));
  const code = readFileSync(new URL('../src/components/ResidentialRoadmap.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(code, /fetch\(|supabase|SOLAPI|\/api\/|localStorage|useSyncExternalStore|toggleCheck|type="checkbox"/i);
});

test('all 25 residential detail pages resolve, have unique noindex canonicals and return to the matching stage', async () => {
  const module = load('src/app/blog/residential/[item]/page.tsx', {
    '@/lib/residentialChecklist': checklist, '@/data/residentialGuideDetails': residentialDetails,
    '@/lib/siteMetadata': seo, '@/components/ResidentialGuideDetail': detailView,
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
  });
  assert.equal(module.generateStaticParams().length, 25);
  const destinations = new Set();
  for (const [index, item] of checklist.RESIDENTIAL_ITEMS.entries()) {
    const props = { params: Promise.resolve({ item: item.id }) };
    const metadata = await module.generateMetadata(props);
    destinations.add(metadata.alternates.canonical);
    assert.equal(metadata.alternates.canonical, 'https://form.it.kr' + checklist.residentialGuidePath(item.id));
    assert.equal(metadata.robots.index, false);
    assert.equal(metadata.robots.googleBot.index, false);
    const body = residentialDetails.RESIDENTIAL_GUIDE_DETAILS[item.id];
    assert.equal(body.points.length, 3);
    assert.ok(body.points.every(point => point.trim().length > 10));
    assert.ok(body.question && body.record);
    const html = renderToStaticMarkup(await module.default(props));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes(item.title));
    assert.ok(html.includes('href="/blog/residential#residential-' + item.stageId + '"'));
    assert.match(html, /이렇게 준비해보세요|이렇게 물어보세요|챙겨둘 자료/);
    assert.doesNotMatch(html, /type="checkbox"|"@type":"Article"|전문가 검수 완료/);
    if (index) assert.ok(html.includes(checklist.residentialGuidePath(checklist.RESIDENTIAL_ITEMS[index - 1].id)));
    if (index < 24) assert.ok(html.includes(checklist.residentialGuidePath(checklist.RESIDENTIAL_ITEMS[index + 1].id)));
  }
  assert.equal(destinations.size, 25);
  await assert.rejects(module.default({ params: Promise.resolve({ item: 'unknown' }) }), /NOT_FOUND/);
  await assert.rejects(module.generateMetadata({ params: Promise.resolve({ item: '../admin' }) }), /NOT_FOUND/);
});

test('approved content uses a single title, semantic lists/tables and truthful Article/Breadcrumb data', async () => {
  const post = { ...approved(), content: '## 확인 사항\n\n- **항목**: 내용\n- 두 번째\n\n1. 첫 단계\n2. 둘째 단계\n\n| 구분 | 설명 |\n| --- | --- |\n| A | B |\n\n<script>alert(1)</script>' };
  const module = articleModule({ ...posts, getPostBySlug: () => post, isPostPublished: value => posts.isPostPublished(value, now), getPublishedPosts: () => [post] });
  const props = { params: Promise.resolve({ slug: post.slug }) };
  const metadata = await module.generateMetadata(props);
  assert.equal(metadata.openGraph.type, 'article');
  const html = renderToStaticMarkup(await module.default(props));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<ul[^>]*><li/); assert.match(html, /<ol[^>]*><li/);
  assert.match(html, /<table[^>]*><thead><tr><th/); assert.match(html, /<tbody><tr><td/);
  assert.match(html, /"@type":"Article"/); assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /&lt;script&gt;alert/); assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /검증용 검수자/); assert.match(html, /검증용 공식 출처/);
});

test('verification is optional, restricted to the configured public tokens, and JSON-LD cannot close its script', () => {
  assert.equal(Object.keys(seo.searchVerification({})).length, 0);
  const proof = seo.searchVerification({ GOOGLE_SITE_VERIFICATION: ' google-fixture ', NAVER_SITE_VERIFICATION: 'naver-fixture', SUPABASE_SERVICE_ROLE_KEY: 'must-not-leak' });
  assert.equal(proof.google, 'google-fixture'); assert.equal(proof.other['naver-site-verification'], 'naver-fixture');
  assert.ok(!JSON.stringify(proof).includes('must-not-leak'));
  const serialized = seo.jsonLd({ title: '</script><script>alert(1)</script>' });
  assert.ok(!serialized.includes('<')); assert.equal(JSON.parse(serialized).title, '</script><script>alert(1)</script>');
  assert.equal(seo.jsonLd(undefined), 'null');
});
