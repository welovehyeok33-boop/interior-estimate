import { getPublishedPostsForAudience } from '@/data/posts';
import { GuideAudienceIndex } from '@/components/GuideViews';
import { blogPath, pageMetadata } from '@/lib/siteMetadata';

export function generateMetadata() {
  return pageMetadata({ path: '/blog/commercial', title: '상가 인테리어 가이드 | 폼잇.',
    description: '업종·임대 조건 확인부터 견적·계약·공사·오픈 준비까지, 세로 줄자를 따라 살펴보는 상가 인테리어 공통 기본 가이드입니다.',
    index: getPublishedPostsForAudience('commercial').length > 0 });
}

export default function CommercialGuidePage() {
  const posts = getPublishedPostsForAudience('commercial').map(({ slug, title, description, category, subcategory, publishedAt }) => ({
    slug, title, description, category, subcategory, publishedAt, href: blogPath(slug),
  }));
  return <GuideAudienceIndex audience="commercial" posts={posts} />;
}
