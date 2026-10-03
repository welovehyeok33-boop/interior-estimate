export const TRACKED_PAGES: Record<string, string> = {
  '/': '홈', '/landing': '상담 안내', '/estimate': '견적 선택', '/estimate/scan': '스캔 안내', '/blog': '블로그',
  '/consult': '무료견적 1 · 공간', '/consult/step2': '무료견적 2 · 면적', '/consult/step3': '무료견적 3 · 일정/예산', '/consult/step4': '무료견적 4 · 연락처',
  '/estimate/detail': '상세견적 1 · 공간', '/estimate/detail/step2': '상세견적 2 · 면적', '/estimate/detail/step3': '상세견적 3 · 공사',
  '/estimate/detail/step4': '상세견적 4 · 자재', '/estimate/detail/step5': '상세견적 5 · 결과',
};
export function trackedPage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.startsWith('/blog/')) return '/blog';
  return Object.hasOwn(TRACKED_PAGES, value) ? value : null;
}
export type TrafficMetadata = { country: string | null; region: string | null; city: string | null; ip_mask: string | null; device: string; browser: string; os: string };
export type TrafficSegment = { label: string; visitors: number; converted: number };
export type TrafficDetails = {
  enabled: boolean; ipEnabled: boolean; startedAt: string; visitors: number;
  regions: (TrafficMetadata & { visitors: number; converted: number })[];
  devices: TrafficSegment[]; browsers: TrafficSegment[]; systems: TrafficSegment[];
  pages: { path: string; visitors: number; converted: number }[];
  recent: (TrafficMetadata & { day: string; first_at: string; last_at: string; pages: string[]; source: string | null; campaign: string | null; converted: boolean })[];
};
const KR_REGIONS: Record<string, string> = { '11': '서울', '26': '부산', '27': '대구', '28': '인천', '29': '광주', '30': '대전', '31': '울산', '41': '경기', '42': '강원', '43': '충북', '44': '충남', '45': '전북', '46': '전남', '47': '경북', '48': '경남', '49': '제주', '50': '세종' };
export function locationLabel(v: { country: string | null; region: string | null; city: string | null }) {
  const country = v.country === 'KR' ? '대한민국' : v.country;
  const region = v.country === 'KR' && v.region ? KR_REGIONS[v.region] || v.region : v.region;
  return [country, region, v.city].filter(Boolean).join(' · ') || '지역 확인 불가';
}
