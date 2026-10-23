import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/data/posts';
import { PUBLIC_SEARCH_PAGES, blogPath, siteUrl } from '@/lib/siteMetadata';
import { GUIDE_AUDIENCES, guideAudiencePath } from '@/lib/guideAudiences';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();
  return [
    ...PUBLIC_SEARCH_PAGES.map(page => ({ url: siteUrl(page.path) })),
    ...(posts.length ? [{ url: siteUrl('/blog') }] : []),
    ...GUIDE_AUDIENCES.filter(audience => posts.some(post => post.audiences?.includes(audience.id))).map(audience => ({ url: siteUrl(guideAudiencePath(audience.id)) })),
    ...posts.map(post => ({
      url: siteUrl(blogPath(post.slug)),
      lastModified: [post.publishedAt, post.review!.reviewedAt].sort().at(-1)!,
    })),
  ];
}
