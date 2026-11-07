import { C } from './EstimateLayout';

const plans = [
  { amount: '10만원', base: 10, bonus: 0 },
  { amount: '50만원', base: 50, bonus: 10 },
  { amount: '100만원', base: 100, bonus: 30 },
] as const;

export default function PartnerCreditPromotion() {
  return <section aria-label="파트너 크레딧 오픈 프로모션" style={{ background: C.home.ivory, color: C.home.ink, border: `1px solid ${C.home.line}`, borderRadius: 20, padding: 'clamp(20px, 4vw, 36px)', wordBreak: 'keep-all' }}>
    <span style={{ display: 'inline-block', background: C.primary, color: C.textDark, fontSize: 11, fontWeight: 800, padding: '6px 10px', borderRadius: 6 }}>파트너 오픈 프로모션</span>
    <h2 style={{ margin: '16px 0 12px', fontSize: 'clamp(25px, 4vw, 34px)', letterSpacing: '-0.045em', lineHeight: 1.3 }}>다음 공사를 위한 크레딧,<br />시작은 더 넉넉하게.</h2>
    <p style={{ color: C.home.muted, fontSize: 14, lineHeight: 1.8, margin: '0 0 24px' }}>1크레딧 = 1만원 · 최소 10만원부터 10만원 단위로 충전<br />오픈 프로모션으로 50만원 충전 시 10크레딧, 100만원 충전 시 30크레딧을 추가 지급합니다.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 14 }}>
      {plans.map(plan => <article key={plan.amount} style={{ minWidth: 0, background: C.card, border: `1px solid ${plan.bonus ? C.primary : C.home.line}`, borderRadius: 14, padding: 22 }}>
        <p style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700 }}>{plan.amount} 충전</p>
        <p style={{ margin: '0 0 14px', fontSize: 32, fontWeight: 850, letterSpacing: '-0.04em' }}>{plan.base + plan.bonus}<span style={{ fontSize: 15, fontWeight: 700, marginLeft: 5 }}>크레딧</span></p>
        <div style={{ display: 'inline-block', padding: '7px 10px', borderRadius: 7, background: plan.bonus ? C.selectedBg : C.home.paper, color: plan.bonus ? C.home.bronze : C.home.muted, fontSize: 12, fontWeight: 750 }}>{plan.bonus ? `보너스 +${plan.bonus}크레딧` : '기본 충전'}</div>
        <p style={{ margin: '14px 0 0', color: C.home.muted, fontSize: 12, lineHeight: 1.7 }}>기본 {plan.base}크레딧{plan.bonus ? ` + 추가 ${plan.bonus}크레딧` : ' 지급'}</p>
      </article>)}
    </div>
    <p style={{ color: C.home.muted, fontSize: 12, lineHeight: 1.8, margin: '20px 0 0' }}>현재는 충전 혜택 안내이며 온라인 결제와 크레딧 차감은 아직 연결되지 않았습니다. 이용 조건과 충전 절차는 폼잇 담당자에게 문의해주세요.</p>
  </section>;
}
