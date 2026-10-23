import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as portfolio from '../src/lib/portfolio.ts';
import * as share from '../src/lib/shareMetadata.ts';

const require = createRequire(import.meta.url);
function load(path, dependencies = {}) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(output, { exports, URL, process, require: name => dependencies[name] ?? require(name) });
  return exports;
}
const Link = ({ href, children, ...props }) => React.createElement('a', { ...props, href }, children);
const Image = ({ fill, preload, sizes, ...props }) => React.createElement('img', props);
const C = { primary: '#f5c200', home: { paper: '#fcfaf5', ivory: '#f8f4ea', ink: '#24231f', muted: '#70695e', bronze: '#84673f', line: '#ded6c7', darkLine: '#494338', onDark: '#f7f2e8', mutedOnDark: '#bdb5a7' } };
const view = load('src/components/CompanyPortfolio.tsx', { './EstimateLayout': { C }, '@/lib/portfolio': portfolio, 'next/link': { default: Link }, 'next/image': { default: Image } });
const seo = load('src/lib/siteMetadata.ts', { './shareMetadata': share });

test('portfolio presents four connected fields, with AI clearly separated as a future direction', () => {
  assert.deepEqual(portfolio.PORTFOLIO_FIELDS.map(field => field.id), ['interior', 'development', 'ai', 'marketing']);
  assert.equal(new Set(portfolio.PORTFOLIO_FIELDS.map(field => field.id)).size, 4);
  assert.equal(portfolio.getPortfolioField('unknown').id, 'interior');
  assert.equal(portfolio.getPortfolioField('ai').status, '확장 방향');
  assert.match(portfolio.getPortfolioField('ai').description, /현재 자동 분석 서비스를 제공하는 것은 아닙니다/);
  assert.ok(portfolio.PORTFOLIO_FIELDS.every(field => field.connection.length > 10));
});

test('work examples are existing platform features and use only intended public destinations', () => {
  assert.equal(portfolio.PORTFOLIO_WORKS.length, 3);
  const paths = portfolio.PORTFOLIO_WORKS.flatMap(work => work.links.map(link => link.href));
  assert.deepEqual(paths, ['/landing', '/blog/residential', '/blog/commercial']);
  assert.equal(portfolio.PORTFOLIO_WORKS.find(work => work.id === 'operations').links.length, 0);
  assert.match(portfolio.PORTFOLIO_WORKS.find(work => work.id === 'operations').description, /실제 고객 정보와 내부 수치는 공개하지 않고/);
});

test('server HTML shows a complete labeled concept, accessible field selectors and no pretend customer data', () => {
  const html = renderToStaticMarkup(React.createElement(view.default));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes(portfolio.PORTFOLIO_PREVIEW_NOTICE));
  assert.ok(html.includes(portfolio.PORTFOLIO_IMAGE_NOTICE));
  assert.equal((html.match(/aria-pressed=/g) || []).length, 4);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.ok(html.includes('aria-controls="portfolio-field-detail"'));
  assert.ok(html.includes('aria-live="polite"'));
  for (const id of ['connections', 'work', 'portfolio-title']) assert.ok(html.includes('id="' + id + '"'));
  for (const work of portfolio.PORTFOLIO_WORKS) assert.ok(html.includes(work.name));
  assert.ok(html.includes('현재 파일 업로드·자동 분석·시세 판정 기능을 제공하지 않습니다'));
  assert.ok(!html.includes('href="/admin'));
  assert.ok(!html.includes('<form'));
  assert.ok(!html.includes('<input'));
  const source = readFileSync(new URL('../src/components/CompanyPortfolio.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|localStorage|sessionStorage|\/api\/|serverDb|serverSms/);
  const image = readFileSync(new URL('../public/portfolio/space-concept-v1.png', import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
});

test('unlinked company concept has a unique canonical and remains noindex until approved', () => {
  const page = load('src/app/portfolio/page.tsx', { '@/components/CompanyPortfolio': view, '@/lib/siteMetadata': seo });
  assert.equal(page.metadata.alternates.canonical, 'https://form.it.kr/portfolio');
  assert.equal(page.metadata.robots.index, false);
  assert.equal(page.metadata.robots.googleBot.index, false);
  assert.match(page.metadata.title, /포트폴리오 시안/);
  assert.equal(page.default().type, view.default);
  const sitemap = readFileSync(new URL('../src/app/sitemap.ts', import.meta.url), 'utf8');
  assert.ok(!sitemap.includes('/portfolio'));
});
