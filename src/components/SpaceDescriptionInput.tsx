"use client";

import { C } from "@/components/EstimateLayout";
import { SPACE_DESCRIPTION_MAX_LENGTH } from "@/lib/estimateSpace";

export function SpaceDescriptionInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div id="space-description-details" style={{ marginTop: 12, padding: 16, borderRadius: 12, background: C.selectedBg, border: `1px solid ${C.border}` }}>
      <label htmlFor="space-description" style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>
        어떤 공간을 생각하고 계세요? (선택)
      </label>
      <textarea
        id="space-description"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={SPACE_DESCRIPTION_MAX_LENGTH}
        aria-describedby="space-description-help"
        style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.textDark, fontFamily: "inherit", fontSize: 16, lineHeight: 1.6, resize: "vertical" }}
      />
      <div id="space-description-help" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 6, fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>
        <span>연락처 없이 공간이나 원하는 공사를 간단히 적어주세요.<br />비워두고 넘어가도 괜찮아요.</span>
        <span style={{ whiteSpace: "nowrap" }}>{value.length}/{SPACE_DESCRIPTION_MAX_LENGTH}</span>
      </div>
    </div>
  );
}
