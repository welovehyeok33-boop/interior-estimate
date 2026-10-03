import type { CSSProperties } from 'react';
import { C } from './EstimateLayout';
export const panel: CSSProperties = { padding: 20, borderRadius: 16, border: `1px solid ${C.home.darkLine}`, background: C.home.darkCard, color: C.home.onDark };
export const field: CSSProperties = { boxSizing: 'border-box', minWidth: 0, maxWidth: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${C.home.darkLine}`, background: C.headerFrom, color: C.home.onDark, fontSize: 14 };
export const action: CSSProperties = { ...field, cursor: 'pointer', fontWeight: 700 };
export const goldAction: CSSProperties = { ...action, background: C.primary, color: C.textDark, borderColor: C.primary };
export const muted: CSSProperties = { color: C.home.mutedOnDark, fontSize: 12, lineHeight: 1.8 };
