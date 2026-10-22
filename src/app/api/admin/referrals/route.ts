import { apiJson, isAdmin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { REFERRAL_SITES, referralLink, validateReferralStats, combineReferralStats, calculateReferralRate, type ReferralRow } from '@/lib/referralSites';
import { parseStatsPeriod } from '@/lib/adminStatsPeriod';
import type { TrafficReport } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

async function externalStats(site: typeof REFERRAL_SITES[number], dates: string[], tokens: Record<string, unknown>): Promise<ReferralRow['external']> {
  const empty = { visitors: null, clickers: null, partial: false, updatedAt: null,
    recordedVisitors: null, recordedClickers: null, visitorDays: 0, visitorDates: [], clickerDays: 0, totalDays: dates.length };
  const token = tokens[site.source];
  if (typeof token !== 'string' || token.length < 32) return { ...empty, status: 'pending' };
  try {
    // Fixed allowlist: neither host nor path may be supplied by the client.
    const chunks = [dates.slice(0, 30), ...(dates.length > 30 ? [dates.slice(30)] : [])];
    const parts = await Promise.all(chunks.map(async chunk => {
      const url = new URL(site.endpoint, 'https://' + site.host);
      url.searchParams.set('from', chunk[0]); url.searchParams.set('to', chunk[chunk.length - 1]);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Upstream unavailable');
      const text = await response.text();
      if (text.length > 32000) throw new Error('Invalid response');
      return validateReferralStats(JSON.parse(text), site.source, chunk);
    }));
    const aggregate = combineReferralStats(parts);
    return { ...aggregate, status: aggregate.partial ? 'partial' : 'ready' };
  } catch { return { ...empty, status: 'error' }; }
}

export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const period = parseStatsPeriod(new URL(request.url).searchParams);
    if (!period) return apiJson({ error: '기간을 확인해주세요.' }, 400);
    const { range, from, to, dates, detailCoverage } = period;
    let tokens: Record<string, unknown> = {};
    try { const value: unknown = JSON.parse(process.env.FORMIT_REFERRAL_TOKENS || '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) tokens = value as Record<string, unknown>; } catch { /* pending, never expose credentials */ }
    const externalPromise = Promise.all(REFERRAL_SITES.map(site => externalStats(site, dates, tokens)));
    const db = serverDb();
    // Count in the database instead of downloading and scanning up to 50,000 visits.
    // Independent counts also keep one source's failure from blanking every source.
    const contactsPromise = Promise.all(REFERRAL_SITES.map(async site => {
      // Missing retained days are unknown, not zero and not a misleading partial-month total.
      if (!detailCoverage.complete) return null;
      try {
        const result = await db.from('traffic_details').select('traffic_daily!inner(source)', { count: 'exact', head: true })
          .gte('day', from).lte('day', to).eq('traffic_daily.source', site.source)
          .contains('pages', ['/consult/step4']);
        return result.error ? null : result.count;
      } catch { return null; }
    }));
    const [summary, contacts, external] = await Promise.all([
      db.rpc(range === 'month' ? 'admin_dashboard_range' : 'admin_dashboard', range === 'month' ? { p_from: from, p_to: to } : { p_days: dates.length, p_offset: range === 'yesterday' ? 1 : 0 }),
      contactsPromise, externalPromise,
    ]);
    if (summary.error) throw new Error('Stats unavailable');
    const report = summary.data as TrafficReport;
    const rows = await Promise.all(REFERRAL_SITES.map(async (site, i): Promise<ReferralRow> => {
      const matches = report.sources.filter(s => s.source === site.source);
      const arrivals = matches.reduce((sum, s) => sum + s.visitors, 0);
      const converted = matches.reduce((sum, s) => sum + s.converted, 0);
      const siteStats = external[i];
      // A partial external denominator must never be compared with all-period Formit arrivals.
      // Query only the dates with known site visits, returning an exact count and no browser rows.
      let rateArrivals: number | null = siteStats.visitorDays === dates.length ? arrivals : null;
      if (siteStats.visitorDays > 0 && siteStats.visitorDays < dates.length && (siteStats.recordedVisitors ?? 0) > 0) {
        try {
          const result = await db.from('traffic_daily').select('day', { count: 'exact', head: true })
            .gte('day', from).lte('day', to).eq('source', site.source).in('day', siteStats.visitorDates);
          rateArrivals = result.error ? null : result.count;
        } catch { rateArrivals = null; }
      }
      return { source: site.source, name: site.name, host: site.host, link: referralLink(site.source, site.destination), external: external[i],
        arrivals, contacts: contacts[i], converted, ...calculateReferralRate(siteStats, rateArrivals) };
    }));
    return apiJson({ from, to, rows, detailCoverage, updatedAt: new Date().toISOString() });
  } catch { return apiJson({ error: '유입처 통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }, 503); }
}
