// Public project ID, never an API credential. No Identify calls or customer data.
export const CLARITY_PROJECT_ID = 'z972urj8pg';
export const CLARITY_DASHBOARD = `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/dashboard`;
export const CLARITY_CONSENT_COOKIE = 'formit_clarity_consent_v1';
export const CLARITY_PREFERENCE_EVENT = 'formit:analytics-preference-change';
export type ClarityConsent = 'granted' | 'denied' | null;
export function clarityConsent(value?: string): ClarityConsent {
  return value === 'granted' || value === 'denied' ? value : null;
}
export function clarityPageAllowed(path: string, search = '', hash = '') {
  // Only bounded campaign tokens may appear in recorded URLs.
  if (hash || search.length > 512) return false;
  const params = new URLSearchParams(search);
  const seen = new Set<string>();
  const allowed = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
  for (const [key, value] of params) {
    if (!allowed.has(key) || seen.has(key)
      || !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(value)
      || /\d{7}/.test(value)) return false;
    seen.add(key);
  }
  return ['/', '/landing', '/estimate', '/estimate/scan', '/consult', '/consult/step2', '/consult/step3', '/consult/step4', '/partners', '/portfolio', '/blog'].includes(path)
    || /^\/blog\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(path);
}
export function clarityBrowserAllowed(navigator: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true;
}
export function clarityServerAllowed(env: string | undefined, hostname: string, excluded: boolean, adminCookie: boolean) {
  return env === 'production' && ['form.it.kr', 'www.form.it.kr'].includes(hostname) && !excluded && !adminCookie;
}
