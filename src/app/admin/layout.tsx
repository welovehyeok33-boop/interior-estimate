import { AdminThemeProvider } from '@/components/AdminTheme';
import { utilityMetadata } from '@/lib/siteMetadata';

export const metadata = utilityMetadata('관리자');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
