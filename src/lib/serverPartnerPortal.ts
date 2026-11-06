import 'server-only';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';
import { serverDb } from './serverDb';
import { PARTNER_PORTAL_COOKIE, partnerLead, type PartnerAccount } from './partnerPortal';
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
export async function publishedPartnerLeads() {
  const db = serverDb();
  const { data, error } = await db.from('partner_lead_publications').select(`published_at,consultations!inner(${PARTNER_SOURCE_COLUMNS})`).gte('consultations.created_at', partnerCutoff()).order('published_at', { ascending: false }).limit(500);
  if (error) throw new Error('Partner leads unavailable');
  return (data || []).flatMap(value => {
    const row = value.consultations as unknown;
    if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
    return [partnerLead(row as Record<string, unknown>, value.published_at)];
  });
}
