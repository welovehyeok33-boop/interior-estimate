import { getPublishedPostsForAudience } from '@/data/posts';
import { GuideAudienceIndex } from '@/components/GuideViews';
import { blogPath, pageMetadata } from '@/lib/siteMetadata';

export function generateMetadata() {
  return pageMetadata({ path: '/blog/commercial', title: '상가 인테리어 가이드 | 폼잇.',
    description: '사무실·카페·음식점·학원·매장의 인테리어 공사를 준비하는 폼잇 상가 가이드입니다. 검수된 자료부터 공개합니다.',
    index: getPublishedPostsForAudience('commercial').length > 0 });
}

export default function CommercialGuidePage() {
  const posts = getPublishedPostsForAudience('commercial').map(({ slug, title, description, category, subcategory, publishedAt }) => ({
    slug, title, description, category, subcategory, publishedAt, href: blogPath(slug),
  }));
  return <GuideAudienceIndex audience="commercial" posts={posts} />;
}
