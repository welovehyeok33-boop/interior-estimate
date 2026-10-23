import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RESIDENTIAL_GUIDE_DETAILS } from '@/data/residentialGuideDetails';
import { RESIDENTIAL_ITEMS, getResidentialGuide, residentialGuidePath } from '@/lib/residentialChecklist';
import { pageMetadata } from '@/lib/siteMetadata';
import ResidentialGuideDetail from '@/components/ResidentialGuideDetail';

export const dynamicParams = false;
type Props = { params: Promise<{ item: string }> };

export function generateStaticParams() {
  return RESIDENTIAL_ITEMS.map(item => ({ item: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getResidentialGuide((await params).item);
  if (!guide) notFound();
  return pageMetadata({ path: residentialGuidePath(guide.id), title: guide.title + ' | 폼잇 주거 가이드', description: guide.detail, index: false });
}

export default async function ResidentialItemPage({ params }: Props) {
  const guide = getResidentialGuide((await params).item);
  if (!guide) notFound();
  return <ResidentialGuideDetail guide={guide} content={RESIDENTIAL_GUIDE_DETAILS[guide.id]} />;
}
