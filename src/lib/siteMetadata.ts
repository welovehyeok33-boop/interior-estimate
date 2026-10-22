import type { Metadata } from 'next';
import { shareDescription, shareImage, shareTitle } from './shareMetadata';

export const SITE_URL = 'https://form.it.kr';
export const SITE_NAME = '폼잇.';
export const PUBLIC_SEARCH_PAGES = [
  { path: '/', title: shareTitle, description: shareDescription },
  { path: '/landing', title: '인테리어 무료 견적 상담 안내 | 폼잇.', description: '주거·상가 인테리어를 계획하고 있다면 지역, 공간과 공사 계획을 알려주세요. 폼잇 무료 견적 상담 신청 과정과 이용 안내를 확인하세요.' },
] as const;

export function siteUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Site path required');
  const url = new URL(path, SITE_URL);
  if (url.origin !== SITE_URL) throw new Error('Site origin required');
  return url.href;
}

export function blogPath(slug: string): string {
  return '/blog/' + encodeURIComponent(slug.normalize('NFC'));
}

export function searchRobots(index: boolean): Metadata['robots'] {
  const allowed = index && process.env.VERCEL_ENV !== 'preview';
  return { index: allowed, follow: true, googleBot: { index: allowed, follow: true, ...(allowed ? { 'max-image-preview': 'large' as const } : {}) } };
}

export function pageMetadata({ path, title, description, index = true }: { path: string; title: string; description: string; index?: boolean }): Metadata {
  const url = siteUrl(path);
  return {
    title, description, alternates: { canonical: url }, robots: searchRobots(index),
    openGraph: { title, description, url, siteName: SITE_NAME, locale: 'ko_KR', type: 'website', images: [shareImage] },
    twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
  };
}

export function utilityMetadata(title: string): Metadata {
  return { title: `${title} | ${SITE_NAME}`, alternates: { canonical: null }, robots: searchRobots(false) };
}

export function searchVerification(env: Record<string, string | undefined> = process.env): Metadata['verification'] {
  const google = env.GOOGLE_SITE_VERIFICATION?.trim();
  const naver = env.NAVER_SITE_VERIFICATION?.trim();
  return { ...(google ? { google } : {}), ...(naver ? { other: { 'naver-site-verification': naver } } : {}) };
}

export function jsonLd(value: unknown): string {
  return (JSON.stringify(value) ?? 'null').replace(/</g, '\\u003c');
}

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: SITE_NAME, url: SITE_URL, logo: siteUrl('/formit-apple-v2.png') },
    { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: SITE_NAME, url: SITE_URL, inLanguage: 'ko-KR', publisher: { '@id': SITE_URL + '/#organization' } },
  ],
};
