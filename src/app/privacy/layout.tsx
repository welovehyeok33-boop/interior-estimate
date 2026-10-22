import { utilityMetadata } from '@/lib/siteMetadata';

export const metadata = utilityMetadata('개인정보 수집·이용 안내');

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
