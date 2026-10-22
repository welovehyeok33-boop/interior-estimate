import { utilityMetadata } from '@/lib/siteMetadata';

export const metadata = utilityMetadata('파트너');

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
