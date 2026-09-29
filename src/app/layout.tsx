import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "폼잇. — 인테리어 견적 상담",
  description: "지역과 공간, 공사 계획을 간단히 입력하고 무료 견적 상담을 신청하세요. 상세 견적 미리보기도 확인할 수 있습니다.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
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
        {children}
      </body>
    </html>
  );
}
