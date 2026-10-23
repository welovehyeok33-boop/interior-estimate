"use client";

import type { GuideBody } from '@/lib/guideTypes';
import { COMMERCIAL_SOURCES, type CommercialGuide } from '@/lib/commercialGuide';
import { GuideItemDetail } from './ResidentialGuideDetail';

export default function CommercialGuideDetail({ guide, content }: { guide: CommercialGuide; content: GuideBody }) {
  return <GuideItemDetail guide={guide} content={content} audience="commercial" sources={COMMERCIAL_SOURCES} />;
}
