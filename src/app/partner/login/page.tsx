import { redirect } from 'next/navigation';
import PartnerLogin from '@/components/PartnerLogin';
import { currentPartner } from '@/lib/serverPartnerPortal';
import { isAdmin } from '@/lib/serverAuth';
export const dynamic = 'force-dynamic';
export default async function PartnerLoginPage() {
  let authenticated = false;
  try { authenticated = await isAdmin() || !!await currentPartner(); } catch { /* Sign-in UI remains available during an outage. */ }
  if (authenticated) redirect('/partner/leads');
  return <PartnerLogin />;
}
