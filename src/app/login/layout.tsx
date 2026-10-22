import { utilityMetadata } from '@/lib/siteMetadata';

export const metadata = utilityMetadata('로그인');

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
