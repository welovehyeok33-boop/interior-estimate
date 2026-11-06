import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/serverAuth';
import AdminPartnerPortal from '@/components/AdminPartnerPortal';
export const dynamic = 'force-dynamic';
export default async function PartnerPortalManagement() {
  if (!await isAdmin()) redirect('/admin');
  return <AdminPartnerPortal />;
}
