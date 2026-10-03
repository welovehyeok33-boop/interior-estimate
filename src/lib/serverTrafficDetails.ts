import { isIP } from 'node:net';
import type { TrafficMetadata } from './trafficDetails';

export function maskIp(raw: string | null): string | null {
  const ip = raw?.split(',')[0].trim();
  if (!ip || ip.includes('%')) return null;
  if (isIP(ip) === 4) return ip.split('.').slice(0, 2).join('.') + '.*.*';
  if (isIP(ip) !== 6) return null;
  const normalized = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const [left, right] = normalized.split('::');
  const a = left ? left.split(':') : [], b = right ? right.split(':') : [];
  const parts = right !== undefined ? [...a, ...Array(8 - a.length - b.length).fill('0'), ...b] : a;
  if (parts.slice(0, 5).every(p => parseInt(p, 16) === 0) && parts[5] === 'ffff') {
    const prefix = parseInt(parts[6], 16);
    return `${prefix >> 8}.${prefix & 255}.*.*`;
  }
  return parts.slice(0, 3).map(p => parseInt(p, 16).toString(16)).join(':') + ':*:*:*:*:*';
}
export function clientEnvironment(userAgent: string) {
  const ua = userAgent.slice(0, 1000);
  const tablet = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua);
  const mobile = /Mobile|iPhone|iPod|Android/i.test(ua);
  const os = /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows' : /CrOS/i.test(ua) ? 'Chrome OS' : /Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : '확인 불가';
  const browser = /KAKAOTALK/i.test(ua) ? '카카오 인앱' : /NAVER\(/i.test(ua) ? '네이버 인앱' : /Instagram/i.test(ua) ? '인스타그램 인앱' : /SamsungBrowser/i.test(ua) ? 'Samsung Internet' : /Edg(?:e|A|iOS)?\//i.test(ua) ? 'Edge' : /OPR\//i.test(ua) ? 'Opera' : /Firefox|FxiOS/i.test(ua) ? 'Firefox' : /Chrome|CriOS/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : '확인 불가';
  return { device: tablet ? '태블릿' : mobile ? '모바일' : os === '확인 불가' ? '확인 불가' : 'PC', browser, os };
}
export function trafficMetadata(headers: Headers, trustedVercel = process.env.VERCEL === '1'): TrafficMetadata {
  const country = trustedVercel ? headers.get('x-vercel-ip-country') : null;
  const region = trustedVercel ? headers.get('x-vercel-ip-country-region') : null;
  let city: string | null = null;
  try { city = trustedVercel ? decodeURIComponent(headers.get('x-vercel-ip-city') || '') : null; } catch { /* Malformed geo header. */ }
  return { ...clientEnvironment(headers.get('user-agent') || ''),
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    region: region && /^[A-Za-z0-9-]{1,8}$/.test(region) ? region : null,
    city: city && /^[\p{L}\p{M}\p{N} .'-]{1,80}$/u.test(city) ? city : null,
    ip_mask: trustedVercel ? maskIp(headers.get('x-vercel-forwarded-for') || headers.get('x-forwarded-for')) : null,
  };
}
