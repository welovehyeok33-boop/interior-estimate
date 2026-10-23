"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { C } from '@/components/EstimateLayout';

type Readiness = { ready: boolean; reason: string | null; recipient: string | null; dailyLimit: number | null;
  pricing: { status: string; unitCost?: number; reason?: string; httpStatus?: number; shape?: string } | null; testMessage: string };
const REASONS: Record<string, string> = {
  disabled: '문자 알림이 꺼져 있어요.', not_production: '운영 서버에서만 실제 문자를 보낼 수 있어요.',
  invalid_config: '운영 서버의 문자 비밀 설정을 확인해주세요.', daily_limit: '오늘 발송 한도에 도달했어요.',
  test_limit: '같은 내용의 테스트는 24시간에 한 번만 가능해요. 솔라피 발송 내역을 확인해주세요.',
  quota_unavailable: '발송 한도를 확인하지 못해 문자를 보내지 않았어요.',
  price_unavailable: '현재 SMS 단가를 확인하지 못해 문자를 보내지 않았어요.',
  price_limit: '현재 단가가 부가세를 고려한 20원 한도를 넘어 문자를 보내지 않았어요.',
  provider_rejected: '솔라피에서 발송 요청을 거절했어요. 발송 내역과 잔액을 확인해주세요.',
  invalid_response: '접수 결과를 확인하지 못했어요. 다시 보내지 말고 솔라피 발송 내역을 확인해주세요.',
  network: '접수 결과를 확인하지 못했어요. 중복 방지를 위해 다시 보내지 말고 발송 내역을 확인해주세요.',
};

export default function AdminSmsPage() {
  const [settings, setSettings] = useState<Readiness | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('/api/admin/sms', { cache: 'no-store' }).then(async response => {
      if (response.status === 401) { setLoginRequired(true); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '문자 설정을 확인하지 못했어요.');
      setSettings(data);
    }).catch(() => setMessage('문자 설정을 확인하지 못했어요.'));
  }, []);
  async function testSms() {
    if (busy || attempted || !settings?.ready) return;
    setBusy(true);
    setAttempted(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmTest: true }) });
      const data = await response.json();
      if (response.status === 401) setLoginRequired(true);
      setMessage(data.status === 'accepted' ? '테스트 문자 1건이 솔라피에 접수됐어요. 휴대폰 수신 여부를 확인해주세요.'
        : REASONS[data.reason] || '결과를 확인하지 못했어요. 다시 보내지 말고 솔라피 발송 내역을 확인해주세요.');
    } catch { setMessage('결과를 확인하지 못했어요. 중복 방지를 위해 다시 보내지 말고 솔라피 발송 내역을 확인해주세요.'); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', color: C.admin.text }}>
    <Link href="/admin" style={{ color: C.admin.muted, fontSize: 13 }}>← 관리자 페이지</Link>
    <section style={{ marginTop: 20, padding: 24, borderRadius: 16, background: C.admin.surface, border: `1px solid ${C.admin.line}` }}>
      <h1 style={{ fontSize: 24, margin: '0 0 16px' }}>문자 알림 연결 확인</h1>
      {loginRequired ? <p>먼저 <Link href="/admin">관리자 로그인</Link> 후 이 페이지로 돌아와주세요.</p>
        : settings ? <>
          <p style={{ fontWeight: 700 }}>{settings.ready ? '운영 문자 알림 켜짐' : '문자 알림 확인 필요'}</p>
          <p style={{ color: C.admin.muted, lineHeight: 1.7, fontSize: 14 }}>{settings.ready
            ? `관리자 ${settings.recipient} · 한국시간 하루 최대 ${settings.dailyLimit}건. 신규 견적 저장 성공 시 알립니다.`
            : REASONS[settings.reason || ''] || '설정을 확인해주세요.'}</p>
          <p style={{ color: C.admin.muted, lineHeight: 1.7, fontSize: 13 }}>테스트는 문자 1건, 최대 20원입니다. 추가 충전·자동결제는 하지 않습니다. 고객 정보와 상담 통계는 생성하지 않습니다.</p>
          {settings.pricing && <p style={{ color: C.admin.muted, fontSize: 12, lineHeight: 1.7 }}>{settings.pricing.status === 'ok'
            ? `현재 단문 단가: 부가세 포함 최대 ${settings.pricing.unitCost}원`
            : `단가 조회 확인 필요: ${settings.pricing.reason}${settings.pricing.httpStatus ? ` · HTTP ${settings.pricing.httpStatus}` : ''}${settings.pricing.shape ? ` · ${settings.pricing.shape}` : ''}`}</p>}
          {settings.testMessage && <pre style={{ margin: '16px 0', padding: 12, borderRadius: 10, border: `1px solid ${C.admin.line}`,
            whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: C.admin.text }}>{settings.testMessage}</pre>}
          <button type="button" onClick={testSms} disabled={!settings.ready || busy || attempted}
            style={{ width: '100%', padding: '12px 16px', border: 0, borderRadius: 10, background: C.primary, color: C.textDark, fontSize: 14, fontWeight: 700, cursor: busy || attempted ? 'default' : 'pointer', opacity: !settings.ready || busy || attempted ? 0.6 : 1 }}>
            {busy ? '발송 확인 중…' : attempted ? '테스트 요청 완료 · 다시 보내지 않음' : '테스트 문자 1건 발송 (최대 20원)'}
          </button>
        </> : <p>문자 설정을 확인하고 있어요.</p>}
      {message && <p role="status" style={{ fontSize: 14, lineHeight: 1.7, overflowWrap: 'anywhere' }}>{message}</p>}
    </section>
  </main>;
}
