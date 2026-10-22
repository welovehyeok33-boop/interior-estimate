import { getPublishedPosts } from '@/data/posts';
import { blogPath } from '@/lib/siteMetadata';
import { GuideIndex } from '@/components/GuideViews';

export default function BlogPage() {
  const posts = getPublishedPosts().map(({ slug, title, description, category, subcategory, publishedAt }) => ({
    slug, title, description, category, subcategory, publishedAt, href: blogPath(slug),
  }));
  return <GuideIndex posts={posts} />;
}
