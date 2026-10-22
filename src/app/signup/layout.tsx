import { utilityMetadata } from '@/lib/siteMetadata';

export const metadata = utilityMetadata('회원가입');

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
