import { getPublishedPosts } from '@/data/posts';
import { pageMetadata } from '@/lib/siteMetadata';

export function generateMetadata() {
  return pageMetadata({ path: '/blog', title: '인테리어 가이드 | 폼잇.',
    description: '주거·상가 인테리어의 비용과 공사 준비를 위한 폼잇 가이드입니다. 검수를 마친 자료부터 공개합니다.',
    index: getPublishedPosts().length > 0 });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
