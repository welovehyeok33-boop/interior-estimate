import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POSTS, getPostBySlug, getPublishedPosts, isPostPublished } from '@/data/posts';
import { SITE_URL, blogPath, siteUrl, pageMetadata, jsonLd } from '@/lib/siteMetadata';
import { GuideArticle, type GuideSummary } from '@/components/GuideViews';

export const dynamicParams = false;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // Preserve old URLs as explicit noindex review notices instead of deleting their original records.
  return POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  const published = isPostPublished(post);
  const metadata = pageMetadata({ path: blogPath(post.slug),
    title: published ? post.title + ' | 폼잇.' : '검수 중인 인테리어 자료 | 폼잇.',
    description: published ? post.description : '기존 인테리어 자료의 내용과 비용 근거를 확인하고 있습니다. 검수 전 본문은 공개하지 않습니다.', index: published });
  return published ? { ...metadata, openGraph: { ...metadata.openGraph, type: 'article', publishedTime: post.publishedAt, modifiedTime: [post.publishedAt, post.review!.reviewedAt].sort().at(-1) } } : metadata;
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  const published = isPostPublished(post);
  const url = siteUrl(blogPath(post.slug));
  const summary: GuideSummary = { slug: post.slug, title: post.title, description: published ? post.description : '',
    category: post.category, subcategory: post.subcategory, publishedAt: post.publishedAt, href: blogPath(post.slug) };
  // Do not serialize unreviewed text into client props or the RSC response.
  const article = published ? { ...summary, content: post.content, review: post.review } : summary;
  const related = getPublishedPosts().filter(item => item.slug !== post.slug).slice(0, 3).map(({ slug, title, description, category, subcategory, publishedAt }) => ({
    slug, title, description, category, subcategory, publishedAt, href: blogPath(slug),
  }));
  const structuredData = published ? {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', '@id': url + '#article', mainEntityOfPage: url, headline: post.title, description: post.description,
        inLanguage: 'ko-KR', datePublished: post.publishedAt, dateModified: [post.publishedAt, post.review!.reviewedAt].sort().at(-1),
        author: { '@type': 'Organization', name: '폼잇.', url: SITE_URL }, publisher: { '@id': SITE_URL + '/#organization' },
        citation: post.review!.sources.map(source => source.url) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: '인테리어 가이드', item: siteUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ] },
    ],
  } : null;
  return <>
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />}
    <GuideArticle post={article} published={published} related={related} />
  </>;
}
