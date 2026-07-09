import { Metadata } from "next";

export const metadata: Metadata = {
  title: "인테리어 공정 가이드 — 폼잇. 블로그",
  description: "현직 인테리어 전문가가 직접 쓴 공정별 비용 가이드. 도배, 타일, 전기, 방수 등 마감·기능 공정의 정확한 단가와 시공 정보를 제공합니다.",
  openGraph: {
    title: "인테리어 공정 가이드 — 폼잇.",
    description: "현직 전문가가 쓴 공정별 인테리어 비용 정보",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
