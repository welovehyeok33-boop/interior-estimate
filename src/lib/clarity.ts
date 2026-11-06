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
  // Never record arbitrary URLs, private screens, results or query/hash contents.
  if (search || hash) return false;
  return ['/', '/landing', '/estimate', '/estimate/scan', '/consult', '/consult/step2', '/consult/step3', '/consult/step4', '/partners', '/portfolio', '/blog'].includes(path)
    || /^\/blog\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(path);
}
export function clarityBrowserAllowed(navigator: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true;
}
export function clarityServerAllowed(env: string | undefined, hostname: string, excluded: boolean, adminCookie: boolean) {
  return env === 'production' && ['form.it.kr', 'www.form.it.kr'].includes(hostname) && !excluded && !adminCookie;
}
