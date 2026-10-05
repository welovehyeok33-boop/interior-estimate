import 'server-only';

// Never include applicant contact details or arbitrary customer text in email/logs.
export async function notifyConsultation(submissionId: string): Promise<void> {
  if (process.env.VERCEL_ENV !== 'production') return;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONSULT_NOTIFY_FROM?.trim();
  const to = process.env.CONSULT_NOTIFY_TO?.trim();
  const mailbox = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
  if (!key || !from || !to || !mailbox.test(from) || !mailbox.test(to)) {
    console.error('consult_notification: configuration_missing');
    return;
  }
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) return;
  const payload = JSON.stringify({
    from: `폼잇 <${from}>`, to: [to], subject: '[폼잇] 새로운 무료견적 상담이 접수됐어요',
    text: '새로운 무료견적 상담 신청이 저장됐습니다.\n\n관리자 페이지에 로그인한 뒤 상담 관리에서 확인해주세요.\nhttps://form.it.kr/admin\n\n고객 개인정보는 이메일에 포함하지 않습니다.',
  });
  // Bounded retries share a provider idempotency key. No customer-facing failures.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
          'Idempotency-Key': `consult-notification/${submissionId}` },
        body: payload, signal: AbortSignal.timeout(5000),
      });
      if (response.ok) return;
      if (response.status !== 429 && response.status < 500) {
        console.error('consult_notification: rejected', response.status);
        return;
      }
    } catch { /* Only a fixed code is logged; never provider errors or credentials. */ }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  console.error('consult_notification: retries_exhausted');
}
