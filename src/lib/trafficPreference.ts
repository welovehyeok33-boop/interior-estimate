export const TRAFFIC_EXCLUSION_COOKIE = 'formit_traffic_excluded';
export const TRAFFIC_EXCLUSION_SECONDS = 365 * 24 * 60 * 60;
export function trafficExcluded(value?: string) { return value === '1'; }
