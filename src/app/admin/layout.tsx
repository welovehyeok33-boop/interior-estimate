import { AdminThemeProvider } from '@/components/AdminTheme';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
