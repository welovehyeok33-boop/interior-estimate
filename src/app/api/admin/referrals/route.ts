import { apiJson, isAdmin } from '@/lib/serverAuth';
import { serverDb } from '@/lib/serverDb';
import { REFERRAL_SITES, referralDates, referralLink, validateReferralStats, type ReferralRow } from '@/lib/referralSites';
import type { TrafficReport } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

async function externalStats(site: typeof REFERRAL_SITES[number], dates: string[], tokens: Record<string, unknown>): Promise<ReferralRow['external']> {
  const empty = { visitors: null, clickers: null, partial: false, updatedAt: null };
  const token = tokens[site.source];
  if (typeof token !== 'string' || token.length < 32) return { ...empty, status: 'pending' };
  try {
    // Fixed allowlist: neither host nor path may be supplied by the client.
    const url = new URL(site.endpoint, 'https://' + site.host);
    url.searchParams.set('from', dates[0]); url.searchParams.set('to', dates[dates.length - 1]);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Upstream unavailable');
    const text = await response.text();
    if (text.length > 32000) throw new Error('Invalid response');
    const aggregate = validateReferralStats(JSON.parse(text), site.source, dates);
    return { ...aggregate, status: aggregate.partial ? 'partial' : 'ready' };
  } catch { return { ...empty, status: 'error' }; }
}

export async function GET(request: Request) {
  try {
    if (!await isAdmin()) return apiJson({ error: '로그인이 필요합니다.' }, 401);
    const range = new URL(request.url).searchParams.get('range') || '7';
    if (!['today', 'yesterday', '7', '30'].includes(range)) return apiJson({ error: '기간을 확인해주세요.' }, 400);
    const { from, to, dates } = referralDates(range);
    let tokens: Record<string, unknown> = {};
    try { const value: unknown = JSON.parse(process.env.FORMIT_REFERRAL_TOKENS || '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) tokens = value as Record<string, unknown>; } catch { /* pending, never expose credentials */ }
    const externalPromise = Promise.all(REFERRAL_SITES.map(site => externalStats(site, dates, tokens)));
    const db = serverDb();
    // Count in the database instead of downloading and scanning up to 50,000 visits.
    // Independent counts also keep one source's failure from blanking every source.
    const contactsPromise = Promise.all(REFERRAL_SITES.map(async site => {
      try {
        const result = await db.from('traffic_details').select('traffic_daily!inner(source)', { count: 'exact', head: true })
          .gte('day', from).lte('day', to).eq('traffic_daily.source', site.source)
          .contains('pages', ['/consult/step4']);
        return result.error ? null : result.count;
      } catch { return null; }
    }));
    const [summary, contacts, external] = await Promise.all([
      db.rpc('admin_dashboard', { p_days: dates.length, p_offset: range === 'yesterday' ? 1 : 0 }),
      contactsPromise, externalPromise,
    ]);
    if (summary.error) throw new Error('Stats unavailable');
    const report = summary.data as TrafficReport;
    const rows = REFERRAL_SITES.map((site, i): ReferralRow => {
      const matches = report.sources.filter(s => s.source === site.source);
      const arrivals = matches.reduce((sum, s) => sum + s.visitors, 0);
      const converted = matches.reduce((sum, s) => sum + s.converted, 0);
      const visitors = external[i].visitors;
      return { source: site.source, name: site.name, host: site.host, link: referralLink(site.source, site.destination), external: external[i],
        arrivals, contacts: contacts[i], converted,
        rate: external[i].status === 'ready' && visitors !== null && visitors > 0 ? Math.round(arrivals / visitors * 1000) / 10 : null };
    });
    return apiJson({ from, to, rows, updatedAt: new Date().toISOString() });
  } catch { return apiJson({ error: '유입처 통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }, 503); }
}
