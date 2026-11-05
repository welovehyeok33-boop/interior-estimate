import PartnerRecruitment from '@/components/PartnerRecruitment';
import { pageMetadata } from '@/lib/siteMetadata';
export const metadata = pageMetadata({ path: '/partners', title: '인테리어 파트너 모집 | 폼잇.', description: '주거·상가 인테리어 파트너를 모집합니다. 활동 지역과 전문 분야, 포트폴리오를 알려주세요. 검토 후 제휴 조건을 안내드립니다.' });
export default function PartnersPage() { return <PartnerRecruitment />; }
