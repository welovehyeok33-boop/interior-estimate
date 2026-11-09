"use client";

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { C } from '@/components/EstimateLayout';
import { CLARITY_PROJECT_ID, CLARITY_PREFERENCE_EVENT, clarityBrowserAllowed, clarityPageAllowed, type ClarityConsent } from '@/lib/clarity';

type ClarityCommand = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global { interface Window { clarity?: ClarityCommand } }
type Settings = { eligible: boolean; consent: ClarityConsent };

// Loaded only after an explicit opt-in and a fresh server-side eligibility check.
// A full document navigation on revocation/private routes unloads the SDK itself.
export default function ClarityAnalytics() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const injected = useRef(false);
  const allowed = clarityPageAllowed(pathname, search);

  useLayoutEffect(() => {
    if (injected.current && !clarityPageAllowed(pathname, search, window.location.hash)) {
      window.clarity?.('stop');
      window.location.reload();
    }
  }, [pathname, search]);

  useEffect(() => {
    const refresh = () => {
      if (injected.current) {
        window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
        window.clarity?.('stop');
        window.location.reload();
      } else setRevision(v => v + 1);
    };
    window.addEventListener(CLARITY_PREFERENCE_EVENT, refresh);
    window.addEventListener('hashchange', refresh);
    return () => {
      window.removeEventListener(CLARITY_PREFERENCE_EVENT, refresh);
      window.removeEventListener('hashchange', refresh);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!clarityBrowserAllowed(navigator) || (!allowed && pathname !== '/privacy')) return;
    fetch('/api/analytics/clarity', { cache: 'no-store', signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error(); return r.json() as Promise<Settings>; })
      .then(data => {
        if (controller.signal.aborted) return;
        setSettings(data);
        if (!data.eligible || data.consent !== 'granted' || !allowed || injected.current
          || !clarityPageAllowed(window.location.pathname, window.location.search, window.location.hash)
          || !clarityBrowserAllowed(navigator)) return;
        // Root DOM is masked before any vendor code executes, including stored form summaries.
        document.body.setAttribute('data-clarity-mask', 'true');
        const command: ClarityCommand = (...args) => { (command.q ??= []).push(args); };
        window.clarity = command;
        command('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
        const script = document.createElement('script');
        script.id = 'formit-clarity';
        script.async = true;
        script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
        script.referrerPolicy = 'strict-origin-when-cross-origin';
        injected.current = true;
        document.head.appendChild(script);
      })
      .catch(() => { /* Fail closed: site and consultation remain usable. */ });
    return () => controller.abort();
  }, [allowed, pathname, search, revision]);

  async function save(consent: Exclude<ClarityConsent, null>) {
    if (busy) return;
    setBusy(true); setError('');
    // Stop immediately, even when persistence fails. Never resume in this document.
    if (consent === 'denied' && injected.current) {
      window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      window.clarity?.('stop');
    }
    try {
      const response = await fetch('/api/analytics/clarity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent }) });
      if (!response.ok) throw new Error();
      const verify = await fetch('/api/analytics/clarity', { cache: 'no-store' });
      if (!verify.ok) throw new Error();
      const next: Settings = await verify.json();
      if (next.consent !== consent) throw new Error();
      setSettings(next);
      if (injected.current) window.location.reload();
      else setRevision(v => v + 1);
    } catch { setError('설정을 저장하지 못했어요. 다시 시도해주세요.'); }
    finally { setBusy(false); }
  }

  const privacy = pathname === '/privacy';
  if (!clarityBrowserAllowed(typeof navigator === 'undefined' ? {} : navigator)) return null;
  if (pathname === '/' || !settings?.eligible || (!allowed && !privacy) || (!privacy && settings.consent !== null)) return null;
  return <aside aria-label="선택적 방문 행동 분석 설정" data-clarity-mask="true" style={privacy
    ? { margin: '20px 24px', padding: 18, background: C.bg, color: C.textDark, borderRadius: 12 }
    : { position: 'fixed', bottom: 12, left: 12, right: 12, margin: '0 auto', maxWidth: 520, padding: '14px 16px', zIndex: 1000, background: C.card, color: C.textDark, border: `1px solid ${C.border}`, borderRadius: 14 }}>
    <strong style={{ fontSize: 13 }}>더 편한 폼잇을 위한 방문 행동 분석 (선택)</strong>
    <p style={{ margin: '6px 0 10px', fontSize: 12, lineHeight: 1.65 }}>동의하면 Microsoft Clarity로 클릭·스크롤과 화면 이용 흐름을 분석해요. 모든 화면 글자와 입력 내용은 가립니다. 거부해도 상담 신청은 그대로 이용할 수 있어요. <Link href="/privacy#clarity">자세히 보기</Link></p>
    {privacy && <p role="status" style={{ fontSize: 12 }}>현재 설정: {settings.consent === 'granted' ? '허용' : settings.consent === 'denied' ? '거부' : '선택 전'}</p>}
    <div style={{ display: 'flex', gap: 8 }}>
      <button type="button" disabled={busy} onClick={() => void save('denied')} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.textDark, cursor: 'pointer' }}>거부</button>
      <button type="button" disabled={busy} onClick={() => void save('granted')} style={{ padding: '8px 16px', border: 0, borderRadius: 8, background: C.primary, color: C.textDark, cursor: 'pointer' }}>분석 허용</button>
    </div>
    {error && <p role="alert" style={{ fontSize: 12 }}>{error}</p>}
  </aside>;
}
