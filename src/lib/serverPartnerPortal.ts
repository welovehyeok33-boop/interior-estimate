import 'server-only';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';
import { serverDb } from './serverDb';
import { PARTNER_PORTAL_COOKIE, partnerLead, partnerLeadCard, type PartnerAccount } from './partnerPortal';
import { readPartnerSession } from './partnerSession';

export function partnerSessionSecret() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Partner authentication is not configured');
  return createHmac('sha256', key).update('formit-partner-session-v1').digest('hex');
}
export async function currentPartner(): Promise<PartnerAccount | null> {
  const token = (await cookies()).get(PARTNER_PORTAL_COOKIE)?.value;
  if (!token) return null;
  const session = readPartnerSession(token, partnerSessionSecret());
  if (!session) return null;
  const db = serverDb();
  const { data, error } = await db.from('partner_portal_accounts').select('id,company,email,active,session_version,created_at').eq('id', session.id).eq('active', true).eq('session_version', session.version).maybeSingle();
  if (error) throw new Error('Partner access unavailable');
  if (!data) return null;
  const { data: auth, error: authError } = await db.auth.admin.getUserById(session.id);
  if (authError || !auth.user || auth.user.app_metadata.formit_partner !== true) return null;
  const banned = (auth.user as unknown as Record<string, unknown>).banned_until;
  if (typeof banned === 'string' && Date.parse(banned) > Date.now()) return null;
  return data as PartnerAccount;
}
export const PARTNER_SOURCE_COLUMNS = 'id,created_at,name,region,building_type,area,commercial_type,budget,schedule,status';
export function partnerCutoff() { return new Date(Date.now() - 90 * 86400000).toISOString(); }
export type LeadEntry = { consultation_id: string; partner_id: string; slot: number; created_at: string; company: string };
export async function partnerLeadEntries(ids: string[]): Promise<LeadEntry[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));
  const results = await Promise.all(chunks.map(chunk => serverDb().from('partner_lead_entries').select('consultation_id,partner_id,slot,created_at,partner_portal_accounts(company)').in('consultation_id', chunk)));
  if (results.some(result => result.error)) throw new Error('Bid participation unavailable');
  return results.flatMap(result => (result.data || []).map(row => ({ consultation_id: row.consultation_id, partner_id: row.partner_id, slot: row.slot, created_at: row.created_at,
    company: (row.partner_portal_accounts as unknown as { company: string } | null)?.company || '파트너' })));
}
export async function publishedPartnerLeads(partnerId?: string) {
  const db = serverDb();
  const { data, error } = await db.from('partner_lead_publications').select(`published_at,consultations!inner(${PARTNER_SOURCE_COLUMNS})`).gte('consultations.created_at', partnerCutoff()).order('published_at', { ascending: false }).limit(500);
  if (error) throw new Error('Partner leads unavailable');
  const sourceIds = (data || []).flatMap(value => { const row = value.consultations as unknown as { id?: string } | null; return row?.id ? [row.id] : []; });
  const entries = await partnerLeadEntries(sourceIds);
  return (data || []).flatMap(value => {
    const row = value.consultations as unknown;
    if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
    const source = row as Record<string, unknown>;
    const id = String(source.id);
    const participants = entries.filter(entry => entry.consultation_id === id);
    const joined = !!partnerId && participants.some(entry => entry.partner_id === partnerId);
    return [partnerLeadCard(partnerLead(source, value.published_at), id, participants.length, joined, !partnerId)];
  });
}
