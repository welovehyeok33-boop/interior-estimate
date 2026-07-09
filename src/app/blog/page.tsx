"use client";

import Link from "next/link";
import { getPublishedPosts, FINISH_SUBCATEGORIES, FUNCTION_SUBCATEGORIES, type Category } from "@/data/posts";


const CATEGORIES: { id: Category; label: string; subs: string[] }[] = [
  { id: "마감공정", label: "마감공정", subs: FINISH_SUBCATEGORIES },
  { id: "기능공정", label: "기능공정", subs: FUNCTION_SUBCATEGORIES },
];

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f2eb" }}>
      {/* 헤더 */}
      <div style={{ background: "linear-gradient(135deg, #2c1810, #4a3728)", padding: "14px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#f5ede0", letterSpacing: "-0.02em" }}>폼잇.</span>
          </Link>
          <span style={{ fontSize: 13, color: "rgba(245,237,224,0.6)" }}>인테리어 공정 가이드</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* 타이틀 */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-block", background: "#2c1810", color: "#f0c080", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 16, letterSpacing: "0.06em" }}>
            ✈︎ &nbsp;전문가 공정 가이드
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#2c1810", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            인테리어 공정별 비용 가이드
          </h1>
          <p style={{ fontSize: 16, color: "#8c7060", lineHeight: 1.7, margin: 0 }}>
            현직 인테리어 전문가가 직접 작성한 공정별 정보입니다.<br />
            정확한 단가와 시공 노하우를 확인하세요.
          </p>
        </div>

        {/* 카테고리별 글 목록 */}
        {CATEGORIES.map((cat) => {
          const posts = getPublishedPosts().filter((p) => p.category === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 56 }}>
              {/* 카테고리 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #e8ddd0" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2c1810", margin: 0 }}>{cat.label}</h2>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {cat.subs.map((sub) => (
                    <span key={sub} style={{ fontSize: 11, color: "#a0624a", background: "#f5ede0", border: "1px solid #e8ddd0", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {posts.length === 0 ? (
                <p style={{ color: "#b09880", fontSize: 14 }}>글을 준비 중입니다.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {posts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          background: "#fffdf9",
                          border: "1.5px solid #e8ddd0",
                          borderRadius: 14,
                          padding: "20px",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(160,98,74,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                        }}
                      >
                        <div style={{ fontSize: 11, color: "#a0624a", fontWeight: 700, marginBottom: 8, letterSpacing: "0.04em" }}>
                          {post.subcategory}
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2c1810", margin: "0 0 8px", lineHeight: 1.5 }}>
                          {post.title.split("—")[0].trim()}
                        </h3>
                        <p style={{ fontSize: 13, color: "#8c7060", margin: "0 0 12px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {post.description}
                        </p>
                        <div style={{ fontSize: 12, color: "#b09880" }}>{post.publishedAt}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* 견적 CTA */}
        <div style={{ background: "linear-gradient(135deg, #2c1810, #4a3728)", borderRadius: 16, padding: "32px 28px", textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "#f0c080", fontSize: 13, fontWeight: 700, margin: "0 0 8px", letterSpacing: "0.06em" }}>✈︎ &nbsp; AI 자동 견적</p>
          <h3 style={{ color: "#f5ede0", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>
            직접 견적 받아보세요
          </h3>
          <p style={{ color: "rgba(245,237,224,0.7)", fontSize: 14, margin: "0 0 20px", lineHeight: 1.7 }}>
            조건만 입력하면 30초 안에<br />전문가 수준의 견적서를 무료로 받아볼 수 있어요.
          </p>
          <Link href="/estimate/detail" style={{ display: "inline-block", background: "linear-gradient(135deg, #d4956a, #a0624a)", color: "white", padding: "12px 28px", borderRadius: 30, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            세부 견적 시작하기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
