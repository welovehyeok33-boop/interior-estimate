import { redirect } from "next/navigation";
import { currentPartner } from '@/lib/serverPartnerPortal';
import PartnerLeadBoard from '@/components/PartnerLeadBoard';
export const dynamic = 'force-dynamic';

export default async function PartnerLeadsPage() {
  const account = await currentPartner();
  if (!account) redirect('/partner/login');
  return <PartnerLeadBoard company={account.company} />;
}
