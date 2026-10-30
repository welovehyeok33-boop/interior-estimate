import { apiJson, isAdmin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { REFERRAL_SITES, referralLink, calculateReferralRate, type ReferralRow } from '@/lib/referralSites';
import { loadReferralStats } from '@/lib/serverReferralStats';
import { parseStatsPeriod } from '@/lib/adminStatsPeriod';
import type { TrafficReport } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const period = parseStatsPeriod(new URL(request.url).searchParams);
    if (!period) return apiJson({ error: '기간을 확인해주세요.' }, 400);
    const { range, from, to, dates, detailCoverage } = period;
    let tokens: Record<string, unknown> = {};
    try { const value: unknown = JSON.parse(process.env.FORMIT_REFERRAL_TOKENS || '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) tokens = value as Record<string, unknown>; } catch { /* pending, never expose credentials */ }
    const externalPromises = REFERRAL_SITES.map(site => loadReferralStats(site.source, dates, tokens[site.source]));
    const db = serverDb();
    // Count in the database instead of downloading and scanning up to 50,000 visits.
    // Independent counts also keep one source's failure from blanking every source.
    const contactsPromises = REFERRAL_SITES.map(async site => {
      // Missing retained days are unknown, not zero and not a misleading partial-month total.
      if (!detailCoverage.complete) return null;
      try {
        const result = await db.from('traffic_details').select('traffic_daily!inner(source)', { count: 'exact', head: true })
          .gte('day', from).lte('day', to).eq('traffic_daily.source', site.source)
          .contains('pages', ['/consult/step4']);
        return result.error ? null : result.count;
      } catch { return null; }
    });
    // Materialize the PostgREST thenable once; every site shares the same summary query.
    const summaryPromise = (async () => {
      const summary = await db.rpc(range === 'month' ? 'admin_dashboard_range' : 'admin_dashboard', range === 'month' ? { p_from: from, p_to: to } : { p_days: dates.length, p_offset: range === 'yesterday' ? 1 : 0 });
      if (summary.error) throw new Error('Stats unavailable');
      return summary.data as TrafficReport;
    })();
    const jobs = REFERRAL_SITES.map(async (site, i): Promise<ReferralRow> => {
      const [report, contacts, siteStats] = await Promise.all([summaryPromise, contactsPromises[i], externalPromises[i]]);
      const matches = report.sources.filter(s => s.source === site.source);
      const arrivals = matches.reduce((sum, s) => sum + s.visitors, 0);
      const converted = matches.reduce((sum, s) => sum + s.converted, 0);
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
      return { source: site.source, name: site.name, host: site.host, link: referralLink(site.source, site.destination), external: siteStats,
        arrivals, contacts, converted, ...calculateReferralRate(siteStats, rateArrivals) };
    });
    if (new URL(request.url).searchParams.get('stream') === '1') {
      const waiting: ReferralRow[] = REFERRAL_SITES.map(site => ({ source: site.source, name: site.name, host: site.host, link: referralLink(site.source, site.destination),
        external: { status: 'loading', visitors: null, clickers: null, recordedVisitors: null, recordedClickers: null, visitorDays: 0, visitorDates: [], dailyVisitors: [], clickerDays: 0, totalDays: dates.length, partial: false, updatedAt: null },
        arrivals: null, contacts: null, converted: null, rate: null, rateBasis: { state: 'loading', arrivals: null, visitors: null, days: 0, totalDays: dates.length } }));
      const encoder = new TextEncoder();
      let closed = false;
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const send = (event: unknown) => { if (!closed) controller.enqueue(encoder.encode(JSON.stringify(event) + '\n')); };
          send({ type: 'start', report: { from, to, rows: waiting, detailCoverage, updatedAt: new Date().toISOString() } });
          void Promise.all(jobs.map(job => job.then(row => send({ type: 'row', row })))).then(() => {
            if (!closed) { send({ type: 'done', updatedAt: new Date().toISOString() }); closed = true; controller.close(); }
          }, () => {
            if (!closed) { send({ type: 'error' }); closed = true; controller.close(); }
          });
        },
        cancel() { closed = true; },
      });
      return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Accel-Buffering': 'no' } });
    }
    return apiJson({ from, to, rows: await Promise.all(jobs), detailCoverage, updatedAt: new Date().toISOString() });
  } catch { return apiJson({ error: '유입처 통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }, 503); }
}
