import type { CSSProperties } from 'react';
import { C } from './EstimateLayout';
export const panel: CSSProperties = { padding: 24, borderRadius: 18, border: `1px solid ${C.admin.line}`, background: C.admin.surface, color: C.admin.text };
export const field: CSSProperties = { boxSizing: 'border-box', minWidth: 0, maxWidth: '100%', minHeight: 42, padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.admin.line}`, background: C.admin.surface, color: C.admin.text, fontSize: 14, colorScheme: 'inherit' };
export const action: CSSProperties = { ...field, cursor: 'pointer', fontWeight: 700 };
export const goldAction: CSSProperties = { ...action, background: C.primary, color: C.textDark, borderColor: C.primary };
export const muted: CSSProperties = { color: C.admin.muted, fontSize: 13, lineHeight: 1.7 };
export function consultStatusStyle(status: string): CSSProperties {
  const palette = Object.hasOwn(C.consultStatus, status)
    ? C.consultStatus[status as keyof typeof C.consultStatus]
    : { color: C.admin.muted, background: C.admin.raised };
  return { ...palette, border: `1px solid ${palette.color}`, fontWeight: 700 };
}
export function consultStatusBadge(status: string): CSSProperties {
  return { ...consultStatusStyle(status), display: 'inline-flex', alignItems: 'center',
    borderRadius: 999, padding: '5px 10px', fontSize: 12, lineHeight: 1.5, whiteSpace: 'nowrap' };
}
