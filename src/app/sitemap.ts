import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/data/posts';
import { PUBLIC_SEARCH_PAGES, blogPath, siteUrl } from '@/lib/siteMetadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();
  return [
    ...PUBLIC_SEARCH_PAGES.map(page => ({ url: siteUrl(page.path) })),
    ...(posts.length ? [{ url: siteUrl('/blog') }] : []),
    ...posts.map(post => ({
      url: siteUrl(blogPath(post.slug)),
      lastModified: [post.publishedAt, post.review!.reviewedAt].sort().at(-1)!,
    })),
  ];
}
