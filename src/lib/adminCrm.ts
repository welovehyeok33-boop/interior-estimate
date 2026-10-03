export const CONSULT_STATUSES: Record<string, string> = {
  new: '신규', contact_attempted: '연락 시도', contacted: '연락 완료 (기존)', consulting: '상담 중',
  quoted: '견적 전달', contracted: '계약', closed: '종료',
};
export type Consultation = {
  id: string; created_at: string; name: string; phone: string; status: string;
  region: string | null; building_type: string | null; area: number | null;
  residential_grade: string | null; commercial_type: string | null; commercial_sub: string | null;
  space_description: string | null; consent_at: string | null; schedule: string | null;
  budget: string | null; memo: string | null; admin_note: string; next_contact_at: string | null; admin_version: number;
  experience: string | null; work_scope: string | null;
};
export function crmPatch(body: Record<string, unknown>) {
  if (typeof body.status !== 'string' || !Object.hasOwn(CONSULT_STATUSES, body.status)) return null;
  if (typeof body.admin_note !== 'string' || body.admin_note.length > 4000) return null;
  if (typeof body.admin_version !== 'number' || !Number.isSafeInteger(body.admin_version) || body.admin_version < 0) return null;
  if (body.next_contact_at !== null && (typeof body.next_contact_at !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(body.next_contact_at) ||
    !Number.isFinite(Date.parse(body.next_contact_at)) || new Date(body.next_contact_at).toISOString() !== body.next_contact_at)) return null;
  return { status: body.status, admin_note: body.admin_note.trim(), next_contact_at: body.next_contact_at as string | null,
    admin_version: body.admin_version + 1 };
}
export function kstInput(iso: string | null) {
  return iso ? new Date(Date.parse(iso) + 9 * 3600000).toISOString().slice(0, 16) : '';
}
export function fromKstInput(input: string) {
  if (!input) return null;
  const iso = new Date(input + ':00+09:00').toISOString();
  if (kstInput(iso) !== input) throw new Error('연락 일시를 확인해주세요.');
  return iso;
}
