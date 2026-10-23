import type { Metadata } from 'next';
import CompanyPortfolio from '@/components/CompanyPortfolio';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  path: '/portfolio',
  title: '인테리어에서 개발·AI·마케팅까지 | 폼잇 포트폴리오 시안',
  description: '인테리어를 중심으로 개발과 AI, 마케팅이 서로 연결되는 폼잇의 회사 포트폴리오 콘셉트 페이지입니다.',
  index: false,
});

export default function PortfolioPage() {
  return <CompanyPortfolio />;
}
