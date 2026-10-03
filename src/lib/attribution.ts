export type Attribution = { source: string; medium: string; campaign: string; landing: string };
export const SOURCE_LABELS: Record<string, string> = {
  direct: '직접 방문·출처 확인 불가', naver: '네이버', google: '구글', instagram: '인스타그램',
  kakao: '카카오', facebook: '페이스북', youtube: '유튜브', daum: '다음', bing: '빙', other: '기타 외부 사이트',
};
export function campaignToken(value: unknown): string {
  return typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(value) && !/\d{7}/.test(value) ? value.toLowerCase() : '';
}
export function landingGroup(path: unknown): string {
  if (typeof path !== 'string') return 'unknown';
  if (path === '/blog' || path.startsWith('/blog/')) return '/blog';
  return ['/', '/landing', '/estimate', '/estimate/scan', '/consult', '/consult/step2', '/consult/step3', '/consult/step4',
    '/estimate/detail', '/estimate/detail/step2', '/estimate/detail/step3', '/estimate/detail/step4', '/estimate/detail/step5'].includes(path) ? path : 'unknown';
}
export function normalizeAttribution(input: unknown): Attribution | null {
  if (!input || typeof input !== 'object') return null;
  const v = input as Record<string, unknown>;
  return { source: campaignToken(v.source) || 'direct', medium: campaignToken(v.medium),
    campaign: campaignToken(v.campaign), landing: landingGroup(v.landing) };
}
export function captureAttribution(href: string, referrer: string): Attribution {
  const url = new URL(href);
  let source = campaignToken(url.searchParams.get('utm_source'));
  let medium = campaignToken(url.searchParams.get('utm_medium'));
  const campaign = campaignToken(url.searchParams.get('utm_campaign'));
  if (!source) {
    source = 'direct';
    try {
      const ref = new URL(referrer);
      const internal = [url.hostname, 'form.it.kr', 'www.form.it.kr', 'interior-estimate-rouge.vercel.app'];
      if (['http:', 'https:'].includes(ref.protocol) && !internal.includes(ref.hostname)) {
        const domains: Record<string, string[]> = { naver: ['naver.com'], google: ['google.com', 'google.co.kr'],
          instagram: ['instagram.com'], kakao: ['kakao.com'], facebook: ['facebook.com', 'fb.com'],
          youtube: ['youtube.com', 'youtu.be'], daum: ['daum.net'], bing: ['bing.com'] };
        source = Object.keys(domains).find(k => domains[k].some(d => ref.hostname === d || ref.hostname.endsWith('.' + d))) || 'other';
        if (!medium) medium = 'referral';
      }
    } catch { /* No referrer is normal, especially inside apps. */ }
  }
  return { source, medium, campaign, landing: landingGroup(url.pathname) };
}
