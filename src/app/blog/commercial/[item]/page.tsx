import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COMMERCIAL_GUIDE_DETAILS } from '@/data/commercialGuideDetails';
import { COMMERCIAL_ITEMS, getCommercialGuide, commercialGuidePath } from '@/lib/commercialGuide';
import { pageMetadata } from '@/lib/siteMetadata';
import CommercialGuideDetail from '@/components/CommercialGuideDetail';

export const dynamicParams = false;
type Props = { params: Promise<{ item: string }> };

export function generateStaticParams() { return COMMERCIAL_ITEMS.map(item => ({ item: item.id })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getCommercialGuide((await params).item);
  if (!guide) notFound();
  return pageMetadata({ path: commercialGuidePath(guide.id), title: guide.title + ' | 폼잇 상가 가이드', description: guide.detail, index: false });
}

export default async function CommercialItemPage({ params }: Props) {
  const guide = getCommercialGuide((await params).item);
  if (!guide) notFound();
  return <CommercialGuideDetail guide={guide} content={COMMERCIAL_GUIDE_DETAILS[guide.id]} />;
}
