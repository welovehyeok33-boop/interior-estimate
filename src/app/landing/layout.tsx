import { PUBLIC_SEARCH_PAGES, pageMetadata } from '@/lib/siteMetadata';

export const metadata = pageMetadata(PUBLIC_SEARCH_PAGES[1]);

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
