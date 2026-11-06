import { createHmac, timingSafeEqual } from 'node:crypto';
import { PARTNER_UUID, PARTNER_SESSION_SECONDS } from './partnerPortal';
export function signPartnerSession(id: string, version: string, expires: number, secret: string) {
  const payload = `${id}.${version}.${expires}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}
export function readPartnerSession(token: string, secret: string, now = Date.now()) {
  if (token.length > 200) return null;
  const [id, version, rawExpires, signature, extra] = token.split('.');
  if (extra !== undefined || !PARTNER_UUID.test(id || '') || !PARTNER_UUID.test(version || '') || !/^\d{13}$/.test(rawExpires || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return null;
  const expires = Number(rawExpires);
  if (expires <= now || expires > now + PARTNER_SESSION_SECONDS * 1000) return null;
  const expected = signPartnerSession(id, version, expires, secret);
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected)) ? { id, version } : null;
}
