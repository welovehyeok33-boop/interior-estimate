import type { DetailCoverage } from './adminStatsPeriod';

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
export type ReferralVisitorDay = { day: string; visitors: number | null };
type Aggregate = { visitors: number | null; clickers: number | null; partial: boolean; updatedAt: string | null; dailyVisitors: ReferralVisitorDay[];
  recordedVisitors: number | null; recordedClickers: number | null; visitorDays: number; visitorDates: string[]; clickerDays: number; totalDays: number };
export function validateReferralStats(raw: unknown, source: string, dates: string[]): Aggregate {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid report');
  const r = raw as Record<string, unknown>;
  if (r.version !== 1 || r.source !== source || r.timezone !== 'Asia/Seoul' || r.metric !== 'daily_unique_browser' ||
      r.from !== dates[0] || r.to !== dates[dates.length - 1] || !Array.isArray(r.days) || r.days.length !== dates.length ||
      !['complete', 'partial'].includes(String(r.coverage))) throw new Error('Invalid report');
  const seen = new Set<string>(); const visitorDates: string[] = []; const dailyVisitors: ReferralVisitorDay[] = []; let visitors = 0, clickers = 0, visitorDays = 0, clickerDays = 0;
  for (const item of r.days) {
    if (!item || typeof item !== 'object') throw new Error('Invalid day');
    const d = item as Record<string, unknown>;
    if (typeof d.day !== 'string' || !dates.includes(d.day) || seen.has(d.day)) throw new Error('Invalid day');
    seen.add(d.day);
    for (const key of ['visitors', 'clickers']) if (d[key] !== null && (typeof d[key] !== 'number' || !Number.isSafeInteger(d[key]) || (d[key] as number) < 0)) throw new Error('Invalid count');
    dailyVisitors.push({ day: d.day, visitors: d.visitors as number | null });
    if (d.visitors !== null) { visitors += d.visitors as number; visitorDays++; visitorDates.push(d.day); }
    if (d.clickers !== null) { clickers += d.clickers as number; clickerDays++; }
  }
  const partial = r.coverage === 'partial' || visitorDays < dates.length || clickerDays < dates.length;
  if (!Number.isSafeInteger(visitors) || !Number.isSafeInteger(clickers)) throw new Error('Invalid total');
  // Keep full-period totals unknown when days are missing. Recorded totals are separately labelled in the UI.
  return { visitors: visitorDays < dates.length ? null : visitors, clickers: clickerDays < dates.length ? null : clickers, partial,
    recordedVisitors: visitorDays > 0 ? visitors : null, recordedClickers: clickerDays > 0 ? clickers : null,
    visitorDays, visitorDates: visitorDates.sort(), dailyVisitors: dailyVisitors.sort((a, b) => a.day.localeCompare(b.day)), clickerDays, totalDays: dates.length,
    updatedAt: typeof r.dateUpdatedAt === 'string' && Number.isFinite(Date.parse(r.dateUpdatedAt)) ? r.dateUpdatedAt : null };
}
// Calendar months can contain 31 days; combine independently validated, <=30-day upstream chunks.
export function combineReferralStats(parts: Aggregate[]): Aggregate {
  if (!parts.length) throw new Error('Missing report');
  const visitorDays = parts.reduce((sum, part) => sum + part.visitorDays, 0);
  const clickerDays = parts.reduce((sum, part) => sum + part.clickerDays, 0);
  const totalDays = parts.reduce((sum, part) => sum + part.totalDays, 0);
  const visitors = parts.reduce((sum, part) => sum + (part.recordedVisitors ?? 0), 0);
  const clickers = parts.reduce((sum, part) => sum + (part.recordedClickers ?? 0), 0);
  const visitorDates = parts.flatMap(part => part.visitorDates).sort();
  const dailyVisitors = parts.flatMap(part => part.dailyVisitors).map(day => ({ ...day })).sort((a, b) => a.day.localeCompare(b.day));
  if (!Number.isSafeInteger(visitors) || !Number.isSafeInteger(clickers) || new Set(visitorDates).size !== visitorDays || new Set(dailyVisitors.map(day => day.day)).size !== totalDays) throw new Error('Invalid total');
  return { visitors: visitorDays === totalDays ? visitors : null, clickers: clickerDays === totalDays ? clickers : null,
    partial: parts.some(part => part.partial), recordedVisitors: visitorDays ? visitors : null, recordedClickers: clickerDays ? clickers : null,
    visitorDays, visitorDates, dailyVisitors, clickerDays, totalDays,
    updatedAt: parts.every(part => part.updatedAt) ? parts.map(part => part.updatedAt!).sort((a,b) => Date.parse(a) - Date.parse(b))[0] : null };
}

export type ReferralIssue = 'timeout' | 'network' | 'auth' | 'upstream' | 'invalid';
export const REFERRAL_ISSUE_LABELS: Record<ReferralIssue, string> = {
  timeout: '사이트 응답이 지연되어 재시도 후에도 조회하지 못했습니다.',
  network: '사이트 통계 서버에 연결하지 못했습니다.', auth: '사이트 통계 인증 연결을 확인해주세요.',
  upstream: '사이트 통계 서버가 오류를 반환했습니다.', invalid: '사이트 통계 응답의 기간 또는 형식을 확인할 수 없습니다.',
};
export type ReferralRow = { source: string; name: string; host: string; link: string;
  external: Aggregate & { status: 'ready' | 'pending' | 'error' | 'partial' | 'loading'; fetchedAt?: string; cached?: boolean; issue?: ReferralIssue };
  arrivals: number | null; contacts: number | null; converted: number | null; rate: number | null; rateBasis: ReferralRateBasis };
export type ReferralReport = { from: string; to: string; rows: ReferralRow[]; updatedAt: string; detailCoverage?: DetailCoverage };

type ReferralTotal = { value: number | null; knownSites: number; totalSites: number; partial: boolean; periodComplete: boolean };
export function summarizeReferralRows(rows: readonly ReferralRow[]): ReferralTotal[] {
  const sum = (values: { value: number | null; partial?: boolean; periodComplete?: boolean }[]): ReferralTotal => {
    const known = values.filter(item => item.value !== null && Number.isSafeInteger(item.value) && item.value >= 0);
    const total = known.reduce((result, item) => result + item.value!, 0);
    const valid = known.length > 0 && known.length === values.length && Number.isSafeInteger(total);
    return { value: valid ? total : null, knownSites: known.length, totalSites: values.length,
      partial: !valid || values.some(item => item.partial), periodComplete: valid && values.every(item => item.periodComplete !== false) };
  };
  // Match the displayed site values; partial/unknown dates must not become full-period zeroes.
  return [
    sum(rows.map(row => ({ value: row.external.status === 'error' || row.external.status === 'pending' ? null : row.external.visitors ?? row.external.recordedVisitors,
      partial: row.external.status !== 'ready' || row.external.visitors === null,
      periodComplete: row.external.visitors !== null && row.external.visitorDays > 0 && row.external.visitorDays === row.external.totalDays }))),
    sum(rows.map(row => ({ value: row.arrivals }))),
    sum(rows.map(row => ({ value: row.contacts }))),
    sum(rows.map(row => ({ value: row.converted }))),
  ];
}

export function referralTotalRate(totals: readonly ReferralTotal[]): number | null {
  const visitors = totals[0]?.value, arrivals = totals[1]?.value;
  if (visitors == null || arrivals == null || !Number.isSafeInteger(visitors) || !Number.isSafeInteger(arrivals) || visitors <= 0 || arrivals < 0) return null;
  // Use the displayed known totals even with historical gaps, labelled as a reference rate in the UI.
  // An unavailable site still makes the visitor total null; never average individual percentages.
  return Math.round(arrivals / visitors * 1000) / 10;
}

export type ReferralRateBasis = {
  state: 'ready' | 'provisional' | 'no_visitors' | 'no_data' | 'not_connected' | 'unavailable' | 'loading';
  arrivals: number | null; visitors: number | null; days: number; totalDays: number;
};
export const REFERRAL_RATE_LABELS: Record<ReferralRateBasis['state'], string> = {
  ready: '—', provisional: '—', no_visitors: '방문 없음', no_data: '데이터 부족', not_connected: '연결 대기', unavailable: '조회 오류', loading: '조회 중',
};
export function calculateReferralRate(external: ReferralRow['external'], arrivals: number | null): Pick<ReferralRow, 'rate' | 'rateBasis'> {
  const visitors = external.visitors ?? external.recordedVisitors;
  const basis = { arrivals, visitors, days: external.visitorDays, totalDays: external.totalDays };
  const empty = (state: ReferralRateBasis['state']) => ({ rate: null, rateBasis: { ...basis, state } });
  if (external.status === 'loading') return empty('loading');
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
