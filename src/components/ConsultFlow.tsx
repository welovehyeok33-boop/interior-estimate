"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconCheck, IconPhone } from "@tabler/icons-react";
import { C } from "./EstimateLayout";
import { useConsultDraft, saveConsult, clearConsult } from "@/lib/consultStore";
import { useContactDraft, saveContact, clearContact } from "@/lib/contactStore";
import { CONSULT_OPTIONS, consultationPayload, firstMissingConsultStep, validArea, validPhone } from "@/lib/consultValidation";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const routes = ["/consult", "/consult/step2", "/consult/step3", "/consult/step4"];
const titles = ["어디를 바꾸고 싶으세요?", "공간 크기를 알려주세요", "공사 계획을 알려주세요", "연락받을 정보를 확인해주세요"];
const hints = ["지역과 공간만 선택하면 시작할 수 있어요.", "대략적으로 알려주셔도 괜찮아요.", "정해지지 않은 항목은 상담하면서 결정해요.", "신청 내용을 확인한 뒤 전화로 상담을 이어갑니다."];
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "14px 16px", font: "inherit", fontSize: 16, borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, color: C.textDark };
const buttonStyle: CSSProperties = { padding: "14px 18px", minHeight: 48, borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.textDark, font: "inherit", fontWeight: 700, cursor: "pointer" };
const noopSubscribe = () => () => {};

function Field({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px", minWidth: 0 }}>
    <legend style={{ padding: 0, marginBottom: 12, fontWeight: 700, fontSize: 15 }}>{title}</legend>{children}
  </fieldset>;
}
function Choices({ options, value, onChange }: { options: readonly (readonly [string, string])[]; value?: string; onChange: (value: string) => void }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
    {options.map(([id, label]) => <button type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}
      style={{ ...buttonStyle, borderColor: value === id ? C.selectedBorder : C.border, background: value === id ? C.selectedBg : C.card, textAlign: "left", fontSize: 14 }}>
      {label}{value === id && <IconCheck size={16} aria-hidden style={{ verticalAlign: "middle", marginLeft: 6 }} />}
    </button>)}
  </div>;
}
export default function ConsultFlow({ step }: { step: 1 | 2 | 3 | 4 }) {
  const router = useRouter();
  const data = useConsultDraft();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [areaInput, setAreaInput] = useState<string | null>(null);
  const contact = useContactDraft();
  const name = contact.name ?? "";
  const phone = contact.phone ?? "";
  const [submitted, setSubmitted] = useState({ name: "", phone: "" });
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const firstMissing = firstMissingConsultStep(data);
  useEffect(() => {
    if (hydrated && !done && firstMissing < step) router.replace(routes[firstMissing - 1]);
  }, [hydrated, done, firstMissing, step, router]);

  const areaText = areaInput ?? (data.area == null ? "" : String(data.area));
  const areaValid = data.area === null || validArea(data.area);
  const canNext = step === 1 ? !!data.region && !!data.buildingType
    : step === 2 ? areaValid
    : step === 3 ? !!data.schedule && !!data.workScope && !!data.budget
    : !!name.trim() && validPhone(phone) && agreed && firstMissing === 4;
  const missingHint = step === 1 ? "지역과 공간 유형을 선택해주세요."
    : step === 2 ? "1~9,999평을 입력하거나 ‘아직 모르겠어요’를 선택해주세요."
    : step === 3 ? "시기·공사 범위·예산을 선택해주세요. 미정이어도 괜찮아요."
    : "이름·전화번호를 확인하고 개인정보 이용에 동의해주세요.";

  async function submit() {
    if (!canNext || locked.current) return;
    locked.current = true;
    setSending(true);
    setError("");
    try {
      if (!supabaseConfigured) throw new Error("service unavailable");
      const payload = consultationPayload(data, name, phone);
      const { error: insertError } = await supabase.from("consultations").insert(payload).abortSignal(AbortSignal.timeout(15000));
      if (insertError) throw insertError;
      setSubmitted({ name, phone });
      setDone(true);
      clearConsult();
      clearContact();
    } catch {
      setError("접수 완료를 확인하지 못했어요. 입력 내용은 그대로예요. 연결 상태를 확인하고 다시 시도해주세요.");
    } finally {
      locked.current = false;
      setSending(false);
    }
  }

  if (done) return <main style={{ minHeight: "100vh", background: C.bg, padding: "64px 20px", boxSizing: "border-box", color: C.textDark }}>
    <div role="status" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <IconCheck size={48} color={C.textDark} style={{ background: C.primary, borderRadius: "50%", padding: 12 }} />
      <h1 style={{ fontSize: 26 }}>견적 상담 신청이 접수됐어요</h1>
      <p style={{ lineHeight: 1.8 }}>{submitted.name.trim()}님, 입력하신 <strong>{submitted.phone}</strong> 번호로<br />신청 내용을 확인한 뒤 연락드릴게요.</p>
      <p style={{ color: C.textMid, lineHeight: 1.7 }}>지금 결제하거나 계약할 내용은 없어요.<br />상담할 때 공사 범위와 예상 비용을 함께 확인해주세요.</p>
      <Link href="/" style={{ ...buttonStyle, display: "block", textDecoration: "none", background: C.primary }}>홈으로 돌아가기</Link>
    </div>
  </main>;

  return <div style={{ minHeight: "100vh", background: C.bg, color: C.textDark }}>
    <header style={{ background: C.headerFrom }}>
      <div style={{ maxWidth: 560, margin: "auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ color: C.primary, fontWeight: 900, textDecoration: "none", fontSize: 20 }}>폼잇.</Link>
        <span style={{ color: C.card, fontSize: 13 }}>무료 견적 상담 · {step}/4</span>
      </div>
    </header>
    <main style={{ maxWidth: 560, boxSizing: "border-box", margin: "auto", padding: "28px 20px 48px" }}>
      <nav aria-label="신청 단계" style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {["공간", "면적", "계획", "연락처"].map((label, i) => <div key={label} aria-current={step === i + 1 ? "step" : undefined}
          style={{ flex: 1, fontSize: 12, color: C.textMid, borderTop: `4px solid ${i < step ? C.primary : C.border}`, paddingTop: 8 }}>{i + 1}. {label}</div>)}
      </nav>
      <h1 style={{ fontSize: 24, letterSpacing: "-0.6px", margin: "0 0 8px", wordBreak: "keep-all" }}>{titles[step - 1]}</h1>
      <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>{hints[step - 1]}</p>
      {!hydrated || firstMissing < step ? <p role="status">입력 내용을 불러오는 중이에요.</p> :
      <form onSubmit={event => { event.preventDefault(); if (step === 4) void submit(); else if (canNext) router.push(routes[step]); }}>
        <fieldset disabled={sending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {step === 1 && <>
            <Field title="공사 지역"><Choices options={CONSULT_OPTIONS.region} value={data.region} onChange={region => saveConsult({ region })} /></Field>
            <Field title="공간 유형"><Choices options={CONSULT_OPTIONS.buildingType} value={data.buildingType} onChange={buildingType => saveConsult({ buildingType })} /></Field>
            <p style={{ color: C.textMid, fontSize: 13 }}>상가는 매장·사무실·학원 등을 포함해요. 세부 업종은 나중에 이야기해도 괜찮아요.</p>
          </>}
          {step === 2 && <>
            <label htmlFor="consult-area" style={{ display: "block", fontWeight: 700, marginBottom: 10 }}>전용면적 (평)</label>
            <input id="consult-area" type="number" inputMode="decimal" min={1} max={9999} step="any" disabled={data.area === null}
              value={areaText} placeholder="예: 32" aria-describedby="area-help" style={inputStyle}
              onChange={event => { setAreaInput(event.target.value); saveConsult({ area: validArea(Number(event.target.value)) ? Number(event.target.value) : undefined }); }} />
            <p id="area-help" style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>1평은 약 3.3㎡예요. 84㎡는 약 25평이에요.<br />공급면적 대신 실제 사용하는 공간의 크기를 알려주세요.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" }}>
              {[10, 20, 25, 30, 40, 50].map(area => <button type="button" key={area} aria-pressed={data.area === area}
                style={{ ...buttonStyle, background: data.area === area ? C.selectedBg : C.card, borderColor: data.area === area ? C.primary : C.border }}
                onClick={() => { setAreaInput(String(area)); saveConsult({ area }); }}>{area}평</button>)}
            </div>
            <label style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 10, background: data.area === null ? C.selectedBg : C.card }}>
              <input type="checkbox" checked={data.area === null} onChange={event => { setAreaInput(""); saveConsult({ area: event.target.checked ? null : undefined }); }} style={{ width: 20, height: 20, accentColor: C.primary }} />
              아직 모르겠어요 · 상담할 때 확인
            </label>
          </>}
          {step === 3 && <>
            <Field title="공사 시기"><Choices options={CONSULT_OPTIONS.schedule} value={data.schedule} onChange={schedule => saveConsult({ schedule })} /></Field>
            <Field title="공사 범위"><Choices options={CONSULT_OPTIONS.workScope} value={data.workScope} onChange={workScope => saveConsult({ workScope })} /></Field>
            <Field title="생각하신 예산"><Choices options={CONSULT_OPTIONS.budget} value={data.budget} onChange={budget => saveConsult({ budget })} /></Field>
            <Field title="인테리어 경험 (선택)"><Choices options={CONSULT_OPTIONS.experience} value={data.experience} onChange={experience => saveConsult({ experience })} /></Field>
            <label htmlFor="consult-memo" style={{ display: "block", fontWeight: 700, marginBottom: 10 }}>원하는 공사나 궁금한 점 (선택)</label>
            <textarea id="consult-memo" maxLength={1000} rows={3} value={data.memo ?? ""} onChange={event => saveConsult({ memo: event.target.value })}
              placeholder="예: 카페 창업 준비 중이에요. 주방과 전기 공사부터 상담하고 싶어요." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
          </>}
          {step === 4 && <>
            <section aria-label="신청 내용" style={{ padding: 18, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 24 }}>
              <strong>신청 내용 확인</strong>
              <dl style={{ fontSize: 14, lineHeight: 1.8 }}>
                {(["region", "buildingType", "schedule", "workScope", "budget"] as const).map((key, i) => <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: C.textMid }}>{["지역", "공간", "시기", "범위", "예산"][i]}</dt>
                  <dd style={{ margin: 0 }}>{CONSULT_OPTIONS[key].find(option => option[0] === data[key])?.[1]}</dd>
                </div>)}
                <div style={{ display: "flex", justifyContent: "space-between" }}><dt>면적</dt><dd style={{ margin: 0 }}>{data.area === null ? "상담 시 확인" : `${data.area}평`}</dd></div>
              </dl>
              {data.memo && <p style={{ overflowWrap: "anywhere", fontSize: 14 }}>메모: {data.memo}</p>}
              <Link href="/consult" style={{ color: C.textMid }}>공간·면적 수정</Link>
            </section>
            <label htmlFor="consult-name" style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>이름</label>
            <input id="consult-name" name="name" autoComplete="name" required maxLength={50} value={name} onChange={event => saveContact({ name: event.target.value })} style={{ ...inputStyle, marginBottom: 20 }} />
            <label htmlFor="consult-phone" style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>연락받을 전화번호</label>
            <input id="consult-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" required maxLength={14} placeholder="010-1234-5678"
              value={phone} onChange={event => saveContact({ phone: event.target.value })} aria-describedby="phone-help" aria-invalid={phone.length > 0 && !validPhone(phone)} style={inputStyle} />
            <p id="phone-help" style={{ fontSize: 13, color: C.textMid }}>하이픈 없이 입력해도 괜찮아요. 번호를 한 번 더 확인해주세요.</p>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 0", fontSize: 14, lineHeight: 1.6 }}>
              <input type="checkbox" required checked={agreed} onChange={event => setAgreed(event.target.checked)} style={{ width: 20, height: 20, flexShrink: 0, accentColor: C.primary }} />
              개인정보 수집·이용에 동의합니다. (필수)
            </label>
            <p style={{ color: C.textMid, fontSize: 12, lineHeight: 1.8, marginTop: 0 }}>
              수집 항목: 이름, 전화번호, 입력한 공사 정보<br />이용 목적: 견적 상담 및 신청 확인<br />
              보유 기간: 상담 완료 후 파기<br />동의를 거부할 수 있으며, 이 경우 상담 신청이 어렵습니다.
            </p>
          </>}
          {error && <p role="alert" style={{ color: C.error, lineHeight: 1.6, padding: 12, border: `1px solid ${C.error}`, borderRadius: 10 }}>{error}</p>}
          <p aria-live="polite" style={{ color: C.textMid, fontSize: 13, lineHeight: 1.6, margin: "24px 0 12px" }}>{canNext ? step === 4 ? "상담 신청은 무료예요. 결제 정보는 받지 않아요." : "선택이 완료됐어요. 다음 단계로 이동해주세요." : missingHint}</p>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && <button type="button" style={buttonStyle} onClick={() => router.push(routes[step - 2])}>← 이전</button>}
            <button type="submit" disabled={!canNext || sending} style={{ ...buttonStyle, flex: 1, background: canNext ? C.primary : C.border, cursor: canNext ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {sending ? "접수 확인 중…" : step === 4 ? "무료 견적 상담 신청" : step === 3 ? "연락처 입력으로" : "다음"}
              {!sending && (step === 4 ? <IconPhone size={18} /> : <IconArrowRight size={18} />)}
            </button>
          </div>
        </fieldset>
      </form>}
    </main>
  </div>;
}
