import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "폼잇. — 인테리어 무료 견적 상담",
  description: "주거·상가 인테리어, 공간과 공사 계획만 알려주세요. 회원가입 없이 무료 견적 상담을 신청하고 필요한 공사와 예산을 함께 정리해요.",
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
