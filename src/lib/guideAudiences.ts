export const GUIDE_AUDIENCES = [
  {
    id: 'residential',
    label: '주거',
    title: '주거 인테리어',
    examples: '아파트 · 빌라 · 단독주택',
    description: '내가 살 공간의 공사를 준비해요.',
  },
  {
    id: 'commercial',
    label: '상가',
    title: '상가 인테리어',
    examples: '사무실 · 카페 · 음식점 · 학원 · 매장',
    description: '내 사업에 맞는 공간의 공사를 준비해요.',
  },
] as const;

export type GuideAudience = (typeof GUIDE_AUDIENCES)[number]['id'];

export function guideAudiencePath(audience: GuideAudience): string {
  return '/blog/' + audience;
}
