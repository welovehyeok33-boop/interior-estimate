const DAY = 86400000;
export type DetailCoverage = { complete: boolean; from: string | null; to: string | null };
export type StatsPeriod = { range: string; from: string; to: string; dates: string[]; detailCoverage: DetailCoverage };

export function statsMonth(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 7);
}

export function validStatsMonth(value: string, now = new Date()): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && value >= '2000-01' && value <= statsMonth(now);
}

export function statsQuery(range: string, month: string): string {
  return new URLSearchParams(range === 'month' ? { range, month } : { range }).toString();
}

export function parseStatsPeriod(params: URLSearchParams, now = new Date()): StatsPeriod | null {
  if (params.getAll('range').length > 1 || params.getAll('month').length > 1) return null;
  const range = params.get('range') || '7';
  const today = new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10);
  const todayStamp = Date.parse(today + 'T00:00:00Z');
  let from: string, to: string;
  if (range === 'month') {
    const month = params.get('month') || '';
    if (!validStatsMonth(month, now)) return null;
    const [year, number] = month.split('-').map(Number);
    const last = new Date(Date.UTC(year, number, 0)).toISOString().slice(0, 10);
    from = month + '-01'; to = last < today ? last : today;
  } else {
    if (!['today', 'yesterday', '7', '30'].includes(range) || params.has('month')) return null;
    const end = todayStamp - (range === 'yesterday' ? DAY : 0);
    const length = range === '30' ? 30 : range === '7' ? 7 : 1;
    from = new Date(end - (length - 1) * DAY).toISOString().slice(0, 10);
    to = new Date(end).toISOString().slice(0, 10);
  }
  const start = Date.parse(from + 'T00:00:00Z'), end = Date.parse(to + 'T00:00:00Z');
  const dates = Array.from({ length: (end - start) / DAY + 1 }, (_, index) => new Date(start + index * DAY).toISOString().slice(0, 10));
  const retained = new Date(todayStamp - 29 * DAY).toISOString().slice(0, 10);
  const detailFrom = from > retained ? from : retained;
  return { range, from, to, dates, detailCoverage: { complete: from >= retained, from: detailFrom <= to ? detailFrom : null, to: detailFrom <= to ? to : null } };
}
