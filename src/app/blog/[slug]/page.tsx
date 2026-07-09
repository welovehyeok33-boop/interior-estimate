import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { POSTS, getPostBySlug, getPublishedPosts } from "@/data/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | 폼잇.`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
    alternates: {
      canonical: `https://interiorhub.co.kr/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const today = new Date().toISOString().split("T")[0];
  if (!post || post.publishedAt > today) notFound();

  // 마크다운 스타일 파싱 (간단 버전)
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 20, fontWeight: 800, color: "#2c1810", margin: "32px 0 12px", paddingBottom: 8, borderBottom: "2px solid #e8ddd0" }}>{line.replace("## ", "")}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 17, fontWeight: 700, color: "#4a3728", margin: "24px 0 8px" }}>{line.replace("### ", "")}</h3>;
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*[:：]?\s*(.*)/);
        if (match) return <li key={i} style={{ margin: "6px 0", color: "#5c4030", lineHeight: 1.7 }}><strong style={{ color: "#2c1810" }}>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</li>;
      }
      if (line.startsWith("- ")) return <li key={i} style={{ margin: "6px 0", color: "#5c4030", lineHeight: 1.7 }}>{line.replace("- ", "")}</li>;
      if (line.startsWith("> ")) return <blockquote key={i} style={{ borderLeft: "3px solid #d4956a", paddingLeft: 16, margin: "16px 0", color: "#8c7060", fontStyle: "italic" }}>{line.replace("> ", "")}</blockquote>;
      if (line.startsWith("**Q.")) {
        return <p key={i} style={{ fontWeight: 700, color: "#2c1810", margin: "20px 0 4px" }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("**A.")) {
        return <p key={i} style={{ color: "#5c4030", margin: "0 0 8px", lineHeight: 1.7 }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("```")) return null;
      if (line.startsWith("|")) {
        const cells = line.split("|").filter(Boolean).map(c => c.trim());
        const isHeader = cells.every(c => c);
        if (line.includes("---")) return null;
        return (
          <tr key={i}>
            {cells.map((cell, j) => (
              <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid #e8ddd0", fontSize: 14, color: "#5c4030" }}>{cell}</td>
            ))}
          </tr>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} style={{ margin: "8px 0", color: "#5c4030", lineHeight: 1.8, fontSize: 15 }}>{line}</p>;
    });
  };

  // JSON-LD 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.publishedAt,
    "author": { "@type": "Organization", "name": "폼잇." },
    "publisher": { "@type": "Organization", "name": "폼잇." },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: "100vh", background: "#f7f2eb" }}>
        {/* 헤더 */}
        <div style={{ background: "linear-gradient(135deg, #2c1810, #4a3728)", padding: "14px 0" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: "#f5ede0", textDecoration: "none", letterSpacing: "-0.02em" }}>
              폼잇.
            </Link>
            <Link href="/blog" style={{ fontSize: 13, color: "rgba(245,237,224,0.6)", textDecoration: "none" }}>
              ← 블로그 목록
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px 80px" }}>

          {/* 브레드크럼 */}
          <div style={{ fontSize: 13, color: "#b09880", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#b09880", textDecoration: "none" }}>홈</Link>
            {" › "}
            <Link href="/blog" style={{ color: "#b09880", textDecoration: "none" }}>블로그</Link>
            {" › "}
            <span style={{ color: "#a0624a" }}>{post.subcategory}</span>
          </div>

          {/* 글 헤더 */}
          <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: "2px solid #e8ddd0" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 12, background: "#2c1810", color: "#f0c080", padding: "3px 10px", borderRadius: 12, fontWeight: 700 }}>
                {post.category}
              </span>
              <span style={{ fontSize: 12, background: "#f5ede0", color: "#a0624a", padding: "3px 10px", borderRadius: 12, fontWeight: 700, border: "1px solid #e8ddd0" }}>
                {post.subcategory}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 800, color: "#2c1810", margin: "0 0 12px", lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              {post.title}
            </h1>
            <p style={{ fontSize: 15, color: "#8c7060", margin: "0 0 16px", lineHeight: 1.7 }}>
              {post.description}
            </p>
            <div style={{ fontSize: 13, color: "#b09880" }}>
              폼잇. 전문가 · {post.publishedAt}
            </div>
          </div>

          {/* 본문 */}
          <article style={{ marginBottom: 48 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", display: "none" }} />
            {renderContent(post.content)}
          </article>

          {/* 견적 CTA */}
          <div style={{ background: "linear-gradient(135deg, #2c1810, #4a3728)", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginBottom: 40 }}>
            <p style={{ color: "#f0c080", fontSize: 13, fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.06em" }}>
              ✈︎ &nbsp; {post.subcategory} 견적이 궁금하다면?
            </p>
            <h3 style={{ color: "#f5ede0", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
              AI 견적 무료로 받아보기
            </h3>
            <p style={{ color: "rgba(245,237,224,0.7)", fontSize: 14, margin: "0 0 18px", lineHeight: 1.7 }}>
              조건만 입력하면 30초 안에 견적서를 받을 수 있어요.
            </p>
            <Link href="/estimate/detail" style={{ display: "inline-block", background: "linear-gradient(135deg, #d4956a, #a0624a)", color: "white", padding: "11px 26px", borderRadius: 30, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              세부 견적 시작하기 →
            </Link>
          </div>

          {/* 다른 글 보기 */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2c1810", marginBottom: 16 }}>다른 글 보기</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {getPublishedPosts().filter((p) => p.slug !== post.slug).slice(0, 3).map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fffdf9", border: "1.5px solid #e8ddd0", borderRadius: 10 }}>
                  <span style={{ fontSize: 11, color: "#a0624a", fontWeight: 700, whiteSpace: "nowrap" }}>{p.subcategory}</span>
                  <span style={{ fontSize: 14, color: "#2c1810", fontWeight: 600 }}>{p.title.split("—")[0].trim()}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
