import 'server-only';
import { createHash } from 'node:crypto';
import { REFERRAL_SITES, validateReferralStats, combineReferralStats, type ReferralSource, type ReferralRow, type ReferralIssue } from './referralSites';

const CACHE_MS = 60_000, CACHE_LIMIT = 64, REQUEST_MS = 20_000, BUDGET_MS = 45_000;
type External = ReferralRow['external'];
class UpstreamFailure extends Error {
  constructor(readonly issue: ReferralIssue, readonly retryable: boolean) { super('Statistics unavailable'); }
}
function failure(error: unknown): UpstreamFailure {
  if (error instanceof UpstreamFailure) return error;
  const name = error && typeof error === 'object' && 'name' in error ? error.name : '';
  return new UpstreamFailure(name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network', true);
}

// Private, bounded, warm-instance cache only. No public/CDN cache, credentials or browser identifiers.
// Cold instances still perform the full bounded fetch/retry; expired values never masquerade as fresh.
export function createReferralStatsLoader(options: {
  request?: typeof fetch; now?: () => number; pause?: (ms: number) => Promise<void>;
  signal?: (ms: number) => AbortSignal;
} = {}) {
  const request = options.request ?? fetch, now = options.now ?? Date.now;
  const pause = options.pause ?? (ms => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const signal = options.signal ?? (ms => AbortSignal.timeout(ms));
  const cache = new Map<string, { expires: number; value: External }>();
  const inflight = new Map<string, Promise<External>>();
  const copy = (value: External, cached: boolean): External => ({ ...value, visitorDates: [...value.visitorDates], cached });

  return async function load(source: ReferralSource, dates: string[], token: unknown): Promise<External> {
    const empty: External = { status: 'error', visitors: null, clickers: null, partial: false, updatedAt: null,
      recordedVisitors: null, recordedClickers: null, visitorDays: 0, visitorDates: [], clickerDays: 0, totalDays: dates.length };
    if (typeof token !== 'string' || token.length < 32) return { ...empty, status: 'pending' };
    const site = REFERRAL_SITES.find(item => item.source === source);
    if (!site || !dates.length || dates.length > 31 || dates.some((day, i) =>
      !/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) ||
      (i > 0 && Date.parse(day) - Date.parse(dates[i - 1]) !== 86_400_000))) return { ...empty, issue: 'invalid' };
    // Rotation and different periods cannot share cached aggregates. Never retain the raw token as a key.
    const key = createHash('sha256').update(JSON.stringify([source, dates, token])).digest('hex');
    const hit = cache.get(key);
    if (hit && hit.expires > now()) return copy(hit.value, true);
    cache.delete(key);

    async function refresh(): Promise<External> {
      const deadline = now() + BUDGET_MS;
      async function chunkStats(chunk: string[]) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const remaining = deadline - now();
          if (remaining <= 0) throw new UpstreamFailure('timeout', false);
          try {
            const url = new URL(site!.endpoint, 'https://' + site!.host);
            url.searchParams.set('from', chunk[0]); url.searchParams.set('to', chunk[chunk.length - 1]);
            const response = await request(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
              redirect: 'error', signal: signal(Math.max(1, Math.min(REQUEST_MS, remaining))) });
            if (!response.ok) {
              await response.body?.cancel();
              throw new UpstreamFailure(response.status === 401 || response.status === 403 ? 'auth' : 'upstream', response.status === 429 || response.status >= 500);
            }
            const text = await response.text();
            try {
              if (text.length > 32_000) throw new Error('Oversized report');
              return validateReferralStats(JSON.parse(text), source, chunk);
            } catch { throw new UpstreamFailure('invalid', false); }
          } catch (error) {
            const problem = failure(error);
            if (!problem.retryable || attempt === 1 || deadline - now() <= 250) throw problem;
            await pause(250);
          }
        }
        throw new UpstreamFailure('upstream', false);
      }
      try {
        // Do not double the load on each WordPress site for a 31-day calendar month.
        const parts = [await chunkStats(dates.slice(0, 30))];
        if (dates.length > 30) parts.push(await chunkStats(dates.slice(30)));
        const aggregate = combineReferralStats(parts);
        const value: External = { ...aggregate, status: aggregate.partial ? 'partial' : 'ready', fetchedAt: new Date(now()).toISOString(), cached: false };
        for (const [oldKey, old] of cache) if (old.expires <= now()) cache.delete(oldKey);
        if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
        cache.set(key, { value, expires: now() + CACHE_MS });
        return value;
      } catch (error) { return { ...empty, issue: failure(error).issue }; }
    }

    let work = inflight.get(key);
    if (!work) { work = refresh(); inflight.set(key, work); }
    try { return copy(await work, false); }
    finally { if (inflight.get(key) === work) inflight.delete(key); }
  };
}

export const loadReferralStats = createReferralStatsLoader();
