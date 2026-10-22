export const REFERRAL_SITES = [
  { source: 'interiorfree', name: '인테리어프리', host: 'interiorfree.kr', destination: '/', endpoint: '/api/formit-stats/' },
  { source: 'interiorhub_office', name: '오피스 인테리어', host: 'office.interiorhub.kr', destination: '/consult', endpoint: '/wp-json/ih-admin/v1/formit-stats' },
  { source: 'interiorhub_academy', name: '학원 인테리어', host: 'academy.interiorhub.kr', destination: '/consult', endpoint: '/wp-json/ih-admin/v1/formit-stats' },
  { source: 'interiorhub_apt', name: '아파트 인테리어', host: 'apt.interiorhub.kr', destination: '/consult', endpoint: '/wp-json/ih-admin/v1/formit-stats' },
  { source: 'interiorhub_villa', name: '빌라 인테리어', host: 'villa.interiorhub.kr', destination: '/consult', endpoint: '/wp-json/ih-admin/v1/formit-stats' },
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
  recordedVisitors: number | null; recordedClickers: number | null; visitorDays: number; visitorDates: string[]; clickerDays: number; totalDays: number };
export function validateReferralStats(raw: unknown, source: string, dates: string[]): Aggregate {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid report');
  const r = raw as Record<string, unknown>;
  if (r.version !== 1 || r.source !== source || r.timezone !== 'Asia/Seoul' || r.metric !== 'daily_unique_browser' ||
      r.from !== dates[0] || r.to !== dates[dates.length - 1] || !Array.isArray(r.days) || r.days.length !== dates.length ||
      !['complete', 'partial'].includes(String(r.coverage))) throw new Error('Invalid report');
  const seen = new Set<string>(); const visitorDates: string[] = []; let visitors = 0, clickers = 0, visitorDays = 0, clickerDays = 0;
  for (const item of r.days) {
    if (!item || typeof item !== 'object') throw new Error('Invalid day');
    const d = item as Record<string, unknown>;
    if (typeof d.day !== 'string' || !dates.includes(d.day) || seen.has(d.day)) throw new Error('Invalid day');
    seen.add(d.day);
    for (const key of ['visitors', 'clickers']) if (d[key] !== null && (typeof d[key] !== 'number' || !Number.isSafeInteger(d[key]) || (d[key] as number) < 0)) throw new Error('Invalid count');
    if (d.visitors !== null) { visitors += d.visitors as number; visitorDays++; visitorDates.push(d.day); }
    if (d.clickers !== null) { clickers += d.clickers as number; clickerDays++; }
  }
  const partial = r.coverage === 'partial' || visitorDays < dates.length || clickerDays < dates.length;
  if (!Number.isSafeInteger(visitors) || !Number.isSafeInteger(clickers)) throw new Error('Invalid total');
  // Keep full-period totals unknown when days are missing. Recorded totals are separately labelled in the UI.
  return { visitors: visitorDays < dates.length ? null : visitors, clickers: clickerDays < dates.length ? null : clickers, partial,
    recordedVisitors: visitorDays > 0 ? visitors : null, recordedClickers: clickerDays > 0 ? clickers : null,
    visitorDays, visitorDates: visitorDates.sort(), clickerDays, totalDays: dates.length,
    updatedAt: typeof r.dateUpdatedAt === 'string' && Number.isFinite(Date.parse(r.dateUpdatedAt)) ? r.dateUpdatedAt : null };
}
export type ReferralRow = { source: string; name: string; host: string; link: string;
  external: Aggregate & { status: 'ready' | 'pending' | 'error' | 'partial' };
  arrivals: number; contacts: number | null; converted: number; rate: number | null; rateBasis: ReferralRateBasis };
export type ReferralReport = { from: string; to: string; rows: ReferralRow[]; updatedAt: string };

export type ReferralRateBasis = {
  state: 'ready' | 'provisional' | 'no_visitors' | 'no_data' | 'not_connected' | 'unavailable';
  arrivals: number | null; visitors: number | null; days: number; totalDays: number;
};
export const REFERRAL_RATE_LABELS: Record<ReferralRateBasis['state'], string> = {
  ready: '—', provisional: '—', no_visitors: '방문 없음', no_data: '데이터 부족', not_connected: '연결 대기', unavailable: '조회 오류',
};
export function calculateReferralRate(external: ReferralRow['external'], arrivals: number | null): Pick<ReferralRow, 'rate' | 'rateBasis'> {
  const visitors = external.visitors ?? external.recordedVisitors;
  const basis = { arrivals, visitors, days: external.visitorDays, totalDays: external.totalDays };
  const empty = (state: ReferralRateBasis['state']) => ({ rate: null, rateBasis: { ...basis, state } });
  if (external.status === 'pending') return empty('not_connected');
  if (external.status === 'error') return empty('unavailable');
  if (visitors === null || external.visitorDays === 0) return empty('no_data');
  if (visitors === 0) return empty('no_visitors');
  if (arrivals === null || !Number.isSafeInteger(arrivals) || arrivals < 0) return empty('unavailable');
  return { rate: Math.round(arrivals / visitors * 1000) / 10,
    rateBasis: { ...basis, state: external.partial ? 'provisional' : 'ready' } };
}

export function groupReferralRows(rows: readonly ReferralRow[]) {
  const isHub = (row: ReferralRow) => row.host.endsWith('.interiorhub.kr');
  return [
    { id: 'interiorfree', name: '인테리어프리', rows: rows.filter(row => row.source === 'interiorfree') },
    { id: 'interiorhub', name: 'Interior HUB', rows: rows.filter(row => row.source !== 'interiorfree' && isHub(row)) },
    { id: 'other', name: '기타 유입처', rows: rows.filter(row => row.source !== 'interiorfree' && !isHub(row)) },
  ].filter(group => group.rows.length > 0);
}
