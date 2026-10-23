import { getPublishedPostsForAudience } from '@/data/posts';
import { GuideAudienceIndex } from '@/components/GuideViews';
import { blogPath, pageMetadata } from '@/lib/siteMetadata';

export function generateMetadata() {
  return pageMetadata({ path: '/blog/residential', title: '주거 인테리어 가이드 | 폼잇.',
    description: '계약 준비부터 공사·완공·입주 후 확인까지, 세로 줄자를 따라 살펴보는 주거 인테리어 단계별 체크리스트입니다.',
    index: getPublishedPostsForAudience('residential').length > 0 });
}

export default function ResidentialGuidePage() {
  const posts = getPublishedPostsForAudience('residential').map(({ slug, title, description, category, subcategory, publishedAt }) => ({
    slug, title, description, category, subcategory, publishedAt, href: blogPath(slug),
  }));
  return <GuideAudienceIndex audience="residential" posts={posts} />;
}
