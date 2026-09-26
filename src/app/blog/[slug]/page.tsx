import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { C } from "@/components/EstimateLayout";
import { SITE_URL } from "@/lib/site";
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
      canonical: `${SITE_URL}/blog/${post.slug}`,
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
    const lines = content.split("\n");
    let consumedUntil = -1;
    return lines.map((line, i) => {
      if (i <= consumedUntil) return null;
      if (line.startsWith("|")) {
        const rows: string[][] = [];
        let end = i;
        while (end < lines.length && lines[end].startsWith("|")) {
          const cells = lines[end].split("|").slice(1, -1).map(cell => cell.trim());
          if (!cells.every(cell => /^:?-+:?$/.test(cell))) rows.push(cells);
          end++;
        }
        consumedUntil = end - 1;
        return <div key={i} role="region" aria-label="비교표" tabIndex={0} style={{ overflowX: "auto", margin: "16px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, lineHeight: 1.6 }}>
            <thead><tr>{rows[0]?.map((cell, j) => <th key={j} scope="col" style={{ padding: 10, textAlign: "left", background: C.gold, borderBottom: "1px solid #E8E8E8" }}>{cell}</th>)}</tr></thead>
            <tbody>{rows.slice(1).map((row, k) => <tr key={k}>{row.map((cell, j) => <td key={j} style={{ padding: 10, borderBottom: "1px solid #E8E8E8", color: C.textMid }}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>;
      }
      if (line.startsWith("- ")) {
        let end = i;
        while (end < lines.length && lines[end].startsWith("- ")) end++;
        consumedUntil = end - 1;
        return <ul key={i} style={{ paddingLeft: 22, color: C.textMid, lineHeight: 1.7 }}>{lines.slice(i, end).map((item, j) => {
          const match = item.match(/^- \*\*(.+?)\*\*[:：]?\s*(.*)/);
          return <li key={j} style={{ margin: "6px 0" }}>{match ? <><strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</> : item.slice(2)}</li>;
        })}</ul>;
      }
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 20, fontWeight: 800, color: C.textDark, margin: "32px 0 12px", paddingBottom: 8, borderBottom: "2px solid #E8E8E8" }}>{line.replace("## ", "")}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 17, fontWeight: 700, color: C.textDark, margin: "24px 0 8px" }}>{line.replace("### ", "")}</h3>;
      if (line.startsWith("> ")) return <blockquote key={i} style={{ borderLeft: "3px solid #F5C200", paddingLeft: 16, margin: "16px 0", color: C.textMid, fontStyle: "italic" }}>{line.replace("> ", "")}</blockquote>;
      if (line.startsWith("**Q.")) {
        return <p key={i} style={{ fontWeight: 700, color: C.textDark, margin: "20px 0 4px" }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("**A.")) {
        return <p key={i} style={{ color: C.textMid, margin: "0 0 8px", lineHeight: 1.7 }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("```")) return null;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} style={{ margin: "8px 0", color: C.textMid, lineHeight: 1.8, fontSize: 15 }}>{line}</p>;
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

      <div style={{ minHeight: "100vh", background: C.bg }}>
        {/* 헤더 */}
        <div style={{ background: C.textDark, padding: "14px 0", position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: C.primary, textDecoration: "none", letterSpacing: "-0.02em" }}>
              폼잇.
            </Link>
            <Link href="/consult" style={{ fontSize: 13, color: C.textDark, background: C.primary, padding: "12px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>무료 견적 상담 →</Link>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px 80px" }}>

          {/* 브레드크럼 */}
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.textLight, textDecoration: "none" }}>홈</Link>
            {" › "}
            <Link href="/blog" style={{ color: C.textLight, textDecoration: "none" }}>블로그</Link>
            {" › "}
            <span style={{ color: C.textMid }}>{post.subcategory}</span>
          </div>

          {/* 글 헤더 */}
          <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: "2px solid #E8E8E8" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 12, background: C.textDark, color: C.primary, padding: "3px 10px", borderRadius: 12, fontWeight: 700 }}>
                {post.category}
              </span>
              <span style={{ fontSize: 12, background: C.gold, color: "#7A6400", padding: "3px 10px", borderRadius: 12, fontWeight: 700, border: "1px solid #F5C200" }}>
                {post.subcategory}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 800, color: C.textDark, margin: "0 0 12px", lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              {post.title}
            </h1>
            <p style={{ fontSize: 15, color: C.textMid, margin: "0 0 16px", lineHeight: 1.7 }}>
              {post.description}
            </p>
            <div style={{ fontSize: 13, color: C.textLight }}>
              폼잇. 전문가 · {post.publishedAt}
            </div>
          </div>

          {/* 본문 */}
          <article style={{ marginBottom: 48 }}>
            {renderContent(post.content)}
          </article>

          {/* 견적 CTA */}
          <div style={{ background: C.textDark, borderRadius: 16, padding: "28px 24px", textAlign: "center", marginBottom: 40 }}>
            <p style={{ color: C.primary, fontSize: 13, fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.06em" }}>
              ✈︎ &nbsp; {post.subcategory} 견적이 궁금하다면?
            </p>
            <h3 style={{ color: C.card, fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
              내 공간 무료 견적 상담
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 18px", lineHeight: 1.7 }}>
              공간과 공사 계획을 남기면 신청 확인 후 전화로 상담을 이어갑니다.
            </p>
            <Link href="/consult" style={{ display: "inline-block", background: C.primary, color: C.textDark, padding: "11px 26px", borderRadius: 30, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              무료 견적 상담 시작하기 →
            </Link>
          </div>

          {/* 다른 글 보기 */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, marginBottom: 16 }}>다른 글 보기</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {getPublishedPosts().filter((p) => p.slug !== post.slug).slice(0, 3).map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.card, border: "1.5px solid #E8E8E8", borderRadius: 10 }}>
                  <span style={{ fontSize: 11, color: "#7A6400", fontWeight: 700, whiteSpace: "nowrap" }}>{p.subcategory}</span>
                  <span style={{ fontSize: 14, color: C.textDark, fontWeight: 600 }}>{p.title.split("—")[0].trim()}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
