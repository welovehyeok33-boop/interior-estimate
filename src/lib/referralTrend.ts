import type { ReferralReport } from './referralSites';

export type ReferralTrendDay = { day: string; visitors: number | null; knownSites: number; totalSites: number };

// Use the same validated upstream daily counts as the table, never Formit arrivals or inferred averages.
export function referralVisitorTrend(report: ReferralReport, source = 'all'): ReferralTrendDay[] {
  const from = Date.parse(report.from + 'T00:00:00Z'), to = Date.parse(report.to + 'T00:00:00Z');
  const length = (to - from) / 86_400_000 + 1;
  if (!Number.isInteger(length) || length < 1 || length > 31) return [];
  const rows = source === 'all' ? report.rows : report.rows.filter(row => row.source === source);
  const series = rows.map(row => new Map(
    row.external.status === 'ready' || row.external.status === 'partial'
      ? (row.external.dailyVisitors ?? []).map(day => [day.day, day.visitors]) : [],
  ));
  return Array.from({ length }, (_, i) => {
    const day = new Date(from + i * 86_400_000).toISOString().slice(0, 10);
    const known = series.map(values => values.get(day)).filter((value): value is number =>
      typeof value === 'number' && Number.isSafeInteger(value) && value >= 0);
    const sum = known.reduce((total, value) => total + value, 0);
    return { day, visitors: known.length > 0 && Number.isSafeInteger(sum) ? sum : null, knownSites: known.length, totalSites: rows.length };
  });
}
