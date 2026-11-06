import { redirect } from "next/navigation";
import { currentPartner } from '@/lib/serverPartnerPortal';
import PartnerLeadBoard from '@/components/PartnerLeadBoard';
import { isAdmin } from '@/lib/serverAuth';
export const dynamic = 'force-dynamic';

export default async function PartnerLeadsPage() {
  if (await isAdmin()) return <PartnerLeadBoard company="폼잇 관리자" mode="admin" />;
  const account = await currentPartner();
  if (!account) redirect('/partner/login');
  return <PartnerLeadBoard company={account.company} />;
}
