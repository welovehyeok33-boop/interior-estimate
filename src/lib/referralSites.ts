export const REFERRAL_SITES = [
  { source: 'interiorfree', name: '인테리어프리', host: 'interiorfree.kr', destination: '/', endpoint: '/api/formit-stats/' },
  { source: 'interiorhub_office', name: '오피스 인테리어', host: 'office.interiorhub.kr', destination: '/consult', endpoint: '/wp-json/ih-admin/v1/formit-stats' },
  { source: 'interiorhub_academy', name: '학원 인테리어', host: 'academy.interiorhub.kr', destination: '/consult', endpoint: '/wp-json/ih-admin/v1/formit-stats' },
  { source: 'buildhyeok_apt', name: '아파트 길잡이', host: 'apt.buildhyeok.com', destination: '/consult', endpoint: '/admin/formit-stats.php' },
] as const;
export type ReferralSource = typeof REFERRAL_SITES[number]['source'];
export function referralLink(source: string, destination: string) {
  const url = new URL(destination, 'https://form.it.kr');
  url.searchParams.set('utm_source', source); url.searchParams.set('utm_medium', 'referral');
  return url.href;
}
export function referralDates(range: string, now = new Date()) {
  if (!['today', 'yesterday', '7', '30'].includes(range)) throw new Error('Invalid range');
  const day = new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10);
  const end = Date.parse(day + 'T00:00:00Z') - (range === 'yesterday' ? 86400000 : 0);
  const length = range === '30' ? 30 : range === '7' ? 7 : 1;
  const dates = Array.from({length}, (_, i) => new Date(end - (length - 1 - i) * 86400000).toISOString().slice(0, 10));
  return { from: dates[0], to: dates[dates.length - 1], dates };
}
type Aggregate = { visitors: number | null; clickers: number | null; partial: boolean; updatedAt: string | null;
  recordedVisitors: number | null; recordedClickers: number | null; visitorDays: number; clickerDays: number; totalDays: number };
export function validateReferralStats(raw: unknown, source: string, dates: string[]): Aggregate {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid report');
  const r = raw as Record<string, unknown>;
  if (r.version !== 1 || r.source !== source || r.timezone !== 'Asia/Seoul' || r.metric !== 'daily_unique_browser' ||
      r.from !== dates[0] || r.to !== dates[dates.length - 1] || !Array.isArray(r.days) || r.days.length !== dates.length ||
      !['complete', 'partial'].includes(String(r.coverage))) throw new Error('Invalid report');
  const seen = new Set<string>(); let visitors = 0, clickers = 0, visitorDays = 0, clickerDays = 0;
  for (const item of r.days) {
    if (!item || typeof item !== 'object') throw new Error('Invalid day');
    const d = item as Record<string, unknown>;
    if (typeof d.day !== 'string' || !dates.includes(d.day) || seen.has(d.day)) throw new Error('Invalid day');
    seen.add(d.day);
    for (const key of ['visitors', 'clickers']) if (d[key] !== null && (typeof d[key] !== 'number' || !Number.isSafeInteger(d[key]) || (d[key] as number) < 0)) throw new Error('Invalid count');
    if (d.visitors !== null) { visitors += d.visitors as number; visitorDays++; }
    if (d.clickers !== null) { clickers += d.clickers as number; clickerDays++; }
  }
  const partial = r.coverage === 'partial' || visitorDays < dates.length || clickerDays < dates.length;
  if (!Number.isSafeInteger(visitors) || !Number.isSafeInteger(clickers)) throw new Error('Invalid total');
  // Keep full-period totals unknown when days are missing. Recorded totals are separately labelled in the UI.
  return { visitors: visitorDays < dates.length ? null : visitors, clickers: clickerDays < dates.length ? null : clickers, partial,
    recordedVisitors: visitorDays > 0 ? visitors : null, recordedClickers: clickerDays > 0 ? clickers : null,
    visitorDays, clickerDays, totalDays: dates.length,
    updatedAt: typeof r.dateUpdatedAt === 'string' && Number.isFinite(Date.parse(r.dateUpdatedAt)) ? r.dateUpdatedAt : null };
}
export type ReferralRow = { source: string; name: string; host: string; link: string;
  external: Aggregate & { status: 'ready' | 'pending' | 'error' | 'partial' };
  arrivals: number; contacts: number | null; converted: number; rate: number | null };
export type ReferralReport = { from: string; to: string; rows: ReferralRow[]; updatedAt: string };
