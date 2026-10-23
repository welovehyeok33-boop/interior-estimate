"use client";
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Post } from '@/data/posts';
import { IconArrowRight, IconBuildingStore, IconHome } from '@tabler/icons-react';
import { GUIDE_AUDIENCES, guideAudiencePath, type GuideAudience } from '@/lib/guideAudiences';
import { C } from './EstimateLayout';
import GuideContent from './GuideContent';
import ResidentialRoadmap from './ResidentialRoadmap';

export type GuideSummary = Pick<Post, 'slug' | 'title' | 'description' | 'category' | 'subcategory' | 'publishedAt'> & { href: string };
export type GuideArticleData = GuideSummary & { content?: string; review?: Post['review'] };

function Shell({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: '100vh', background: C.card, color: C.textDark }}>
    <header style={{ borderBottom: '1px solid ' + C.border }}><div style={{ maxWidth: 900, margin: '0 auto', padding: '18px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
      <Link href="/" style={{ color: C.textDark, textDecoration: 'none', fontWeight: 800, fontSize: 22 }}>폼잇.</Link>
      <Link href="/consult?new=1" style={{ color: C.textDark, background: C.primary, padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>무료 견적 상담</Link>
    </div></header>
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 72px', boxSizing: 'border-box', overflowWrap: 'anywhere' }}>{children}</main>
  </div>;
}

function ConsultCta() {
  return <section aria-label="무료 견적 상담 안내" style={{ padding: '24px', borderRadius: 14, background: C.bg, border: '1px solid ' + C.border, marginTop: 36 }}>
    <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>내 공간에 맞는 상담이 필요하다면</h2>
    <p style={{ color: C.textMid, lineHeight: 1.8, margin: '0 0 18px' }}>지역과 공간, 공사 계획을 알려주세요. 무료 견적 상담으로 다음 단계를 확인할 수 있어요.</p>
    <Link href="/consult?new=1" style={{ display: 'inline-block', padding: '12px 18px', background: C.primary, color: C.textDark, borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>무료 견적 상담 신청</Link>
  </section>;
}

function ReviewNotice() {
  return <section aria-label="콘텐츠 검수 안내" style={{ padding: 22, borderRadius: 14, background: C.bg, border: '1px solid ' + C.border, lineHeight: 1.9 }}>
    <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>기존 자료를 검수하고 있어요</h2>
    <p style={{ margin: 0, color: C.textMid, fontSize: 14 }}>기존 글의 내용과 비용 근거를 확인하고 있습니다. 검수를 마친 자료부터 공개하며, 확인 전 자료는 검색 노출 대상에서 제외합니다.</p>
  </section>;
}

function GuidePostList({ posts }: { posts: GuideSummary[] }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>{posts.map(post => <article key={post.slug} style={{ padding: 22, border: '1px solid ' + C.border, borderRadius: 12, minWidth: 0 }}>
        <span style={{ color: C.textMid, fontSize: 12 }}>{post.category} · {post.subcategory}</span>
        <h2 style={{ fontSize: 18, lineHeight: 1.6, margin: '10px 0' }}><Link href={post.href} style={{ color: C.textDark, textDecoration: 'none' }}>{post.title}</Link></h2>
        <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.8 }}>{post.description}</p>
        <time dateTime={post.publishedAt} style={{ color: C.textMid, fontSize: 12 }}>{post.publishedAt}</time>
  </article>)}</div>;
}

export function GuideIndex({ posts }: { posts: GuideSummary[] }) {
  return <Shell>
    <p style={{ margin: '0 0 10px', color: C.textMid, fontSize: 13 }}>폼잇 가이드</p>
    <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', letterSpacing: '-0.04em', margin: '0 0 12px' }}>인테리어 가이드</h1>
    <p style={{ color: C.textMid, lineHeight: 1.8, margin: '0 0 28px' }}>준비하는 공간을 선택해주세요.</p>
    <nav aria-label="공간별 인테리어 가이드" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16, marginBottom: 28 }}>
      {GUIDE_AUDIENCES.map(audience => {
        const Icon = audience.id === 'residential' ? IconHome : IconBuildingStore;
        return <Link key={audience.id} href={guideAudiencePath(audience.id)} style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 26, border: '1px solid ' + C.border, borderRadius: 18, textDecoration: 'none', color: C.textDark, minWidth: 0 }}>
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: C.bg, borderRadius: 14 }}><Icon size={26} stroke={1.6} /></span>
          <div>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.03em', margin: '0 0 10px' }}>{audience.title}</h2>
            <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.8, margin: '0 0 8px' }}>{audience.description}</p>
            <p style={{ color: C.textMid, fontSize: 12, lineHeight: 1.8, margin: 0 }}>{audience.examples}</p>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTop: '1px solid ' + C.border, fontSize: 14, fontWeight: 700 }}>{audience.label} 가이드 보기<IconArrowRight aria-hidden="true" size={18} /></span>
        </Link>;
      })}
    </nav>
    {posts.length === 0 ? <ReviewNotice /> : <section aria-label="공개된 인테리어 가이드"><h2 style={{ fontSize: 20, margin: '0 0 16px' }}>최근 공개된 가이드</h2><GuidePostList posts={posts} /></section>}
    <ConsultCta />
  </Shell>;
}

export function GuideAudienceIndex({ audience, posts }: { audience: GuideAudience; posts: GuideSummary[] }) {
  const category = GUIDE_AUDIENCES.find(item => item.id === audience)!;
  return <Shell>
    <nav aria-label="현재 위치" style={{ fontSize: 13, color: C.textMid, marginBottom: 28 }}><Link href="/blog" style={{ color: C.textMid }}>인테리어 가이드</Link> › {category.label}</nav>
    <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', letterSpacing: '-0.04em', margin: '0 0 12px' }}>{category.title} 가이드</h1>
    <p style={{ color: C.textMid, lineHeight: 1.8, margin: '0 0 24px' }}>{category.examples}<br />{category.description}</p>
    <nav aria-label="공간별 가이드 전환" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
      {GUIDE_AUDIENCES.map(item => <Link key={item.id} href={guideAudiencePath(item.id)} aria-current={item.id === audience ? 'page' : undefined} style={{ color: C.textDark, background: item.id === audience ? C.primary : C.card, border: '1px solid ' + (item.id === audience ? C.primary : C.border), borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>{item.title}</Link>)}
    </nav>
    {audience === 'residential' ? <ResidentialRoadmap /> : posts.length === 0 && <ReviewNotice />}
    {posts.length > 0 && <section aria-label="공개된 인테리어 가이드" style={{ marginTop: 32 }}><h2 style={{ fontSize: 20, margin: '0 0 16px' }}>함께 읽는 가이드</h2><GuidePostList posts={posts} /></section>}
    <ConsultCta />
  </Shell>;
}

export function GuideArticle({ post, published, related }: { post: GuideArticleData; published: boolean; related: GuideSummary[] }) {
  return <Shell>
    <nav aria-label="현재 위치" style={{ fontSize: 13, color: C.textMid, marginBottom: 28 }}><Link href="/" style={{ color: C.textMid }}>홈</Link> › <Link href="/blog" style={{ color: C.textMid }}>인테리어 가이드</Link></nav>
    <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: 8, background: C.bg, color: C.textMid, fontSize: 12 }}>{published ? post.subcategory : '검수 전 보관 자료'}</span>
    <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', lineHeight: 1.5, letterSpacing: '-0.03em', margin: '16px 0 20px' }}>{post.title}</h1>
    {!published ? <section aria-label="자료 공개 보류 안내" style={{ padding: 24, background: C.bg, border: '1px solid ' + C.border, borderRadius: 14, lineHeight: 1.9 }}>
      <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>내용을 확인하고 있어요</h2>
      <p style={{ margin: 0, color: C.textMid }}>이 자료는 내용과 비용 근거를 검수 중입니다. 확인 전 본문은 공개하지 않으며, 검색 노출 대상에서도 제외했습니다.</p>
    </section> : <>
      <p style={{ lineHeight: 1.8, color: C.textMid }}>{post.description}</p>
      <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.8 }}>발행 <time dateTime={post.publishedAt}>{post.publishedAt}</time> · 검수 {post.review?.reviewer} · <time dateTime={post.review?.reviewedAt}>{post.review?.reviewedAt}</time></p>
      <article aria-label="가이드 본문" style={{ marginTop: 28 }}><GuideContent content={post.content || ''} /></article>
      {post.review && <section aria-label="참고 출처" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid ' + C.border }}><h2 style={{ fontSize: 18 }}>참고 출처</h2><ul style={{ paddingLeft: 22, lineHeight: 1.9 }}>{post.review.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: C.textMid }}>{source.title}</a></li>)}</ul></section>}
    </>}
    <ConsultCta />
    {related.length > 0 && <section aria-label="관련 가이드" style={{ marginTop: 36 }}><h2 style={{ fontSize: 20 }}>함께 확인할 가이드</h2><ul style={{ paddingLeft: 22, lineHeight: 1.9 }}>{related.map(item => <li key={item.slug}><Link href={item.href} style={{ color: C.textDark }}>{item.title}</Link></li>)}</ul></section>}
  </Shell>;
}
