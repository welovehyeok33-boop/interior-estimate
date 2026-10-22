import type { Metadata } from "next";
import { Suspense } from "react";
import VisitTracker from "@/components/VisitTracker";
import { SITE_URL, PUBLIC_SEARCH_PAGES, pageMetadata, searchVerification, jsonLd, websiteStructuredData } from '@/lib/siteMetadata';

export const metadata: Metadata = {
  ...pageMetadata(PUBLIC_SEARCH_PAGES[0]),
  metadataBase: new URL(SITE_URL),
  verification: searchVerification(),
  icons: {
    icon: "/formit-icon-transparent-64.png",
    apple: "/formit-apple-v2.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteStructuredData) }} />
        {children}
        <Suspense fallback={null}><VisitTracker /></Suspense>
      </body>
    </html>
  );
}
