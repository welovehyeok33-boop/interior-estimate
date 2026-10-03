export type TrafficKind = "visit" | "consult" | "engine";
export type TrafficDay = {
  day: string; visitors: number; consult_starts: number; engine_starts: number;
  converted: number; requests: number;
};
export type TrafficReport = {
  days: TrafficDay[]; startedAt: string; updatedAt: string;
  totalRequests: number; pendingRequests: number;
  attributionStartedAt: string; from: string; to: string; dueRequests: number;
  sources: { source: string | null; medium: string; campaign: string; visitors: number; starts: number; converted: number }[];
  landings: { landing: string | null; visitors: number; converted: number }[];
  statuses: { status: string; count: number }[];
};
export function koreaDay(date = new Date()) {
  return new Date(date.getTime() + 9 * 3600000).toISOString().slice(0, 10);
}
export function trafficKind(path: string): TrafficKind | null {
  if (path === "/consult" || /^\/consult\/step[234]$/.test(path)) return "consult";
  if (path === "/estimate/detail" || /^\/estimate\/detail\/step[2345]$/.test(path)) return "engine";
  if (["/", "/landing", "/estimate", "/estimate/scan", "/blog"].includes(path) || path.startsWith("/blog/")) return "visit";
  return null;
}
export function conversionRate(converted: number, visitors: number) {
  return visitors > 0 ? Math.round(converted / visitors * 1000) / 10 : null;
}
