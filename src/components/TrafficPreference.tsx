"use client";
import { useEffect, useState } from 'react';
import { C } from '@/components/EstimateLayout';

export default function TrafficPreference() {
  const [excluded, setExcluded] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/analytics/preference', { cache: 'no-store', signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { if (!controller.signal.aborted) { setExcluded(data.excluded); setError(''); } })
      .catch(() => { if (!controller.signal.aborted) setError('방문 집계 설정을 불러오지 못했어요.'); });
    return () => controller.abort();
  }, [retry]);
  async function toggle() {
    if (excluded === null || busy) return;
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/analytics/preference', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ excluded: !excluded }) });
      if (!r.ok) throw new Error();
      const saved = await r.json();
      const check = await fetch('/api/analytics/preference', { cache: 'no-store' });
      if (!check.ok || (await check.json()).excluded !== saved.excluded) throw new Error();
      setExcluded(saved.excluded);
    } catch { setError('설정을 저장하지 못했어요. 쿠키 허용 여부를 확인하고 다시 시도해주세요.'); }
    finally { setBusy(false); }
  }
  return <section id="traffic-preference" aria-label="내 방문 집계 설정" style={{ margin: '16px 0', padding: 16, borderRadius: 12, background: C.bg, color: C.textDark }}>
    <strong>내 방문 집계 설정</strong>
    <p role="status" style={{ margin: '8px 0', fontSize: 13 }}>{excluded === null ? '설정 확인 중…' : excluded ? '이 브라우저는 방문 집계에서 제외 중입니다.' : '이 브라우저의 방문 집계 제외가 꺼져 있습니다.'}</p>
    <button type="button" disabled={busy || excluded === null} onClick={toggle}
      style={{ border: 0, borderRadius: 8, padding: '10px 14px', background: C.primary, color: C.textDark, cursor: 'pointer' }}>
      {busy ? '저장 중…' : excluded ? '방문 집계 제외 해제' : '이 브라우저 방문 집계 제외'}
    </button>
    {error && <p role="alert">{error} {excluded === null && <button type="button" onClick={() => setRetry(v => v + 1)}>다시 확인</button>}</p>}
    <p style={{ fontSize: 12, marginBottom: 0, lineHeight: 1.7 }}>제외하면 로그아웃해도 방문·견적 진입·신청 전환 방문자에 포함되지 않아요. 실제 상담 신청은 계속 저장되고 접수 건수에 포함됩니다. 이전 통계는 변경하지 않습니다.<br />설정은 현재 도메인·브라우저에 최대 1년간 유지돼요. 쿠키 삭제, 시크릿 모드, 다른 기기·브라우저에서는 다시 설정해주세요.</p>
  </section>;
}
