"use client";

import { GuideRoadmap } from './ResidentialRoadmap';
import { COMMERCIAL_SOURCES, COMMERCIAL_STAGES } from '@/lib/commercialGuide';

export default function CommercialRoadmap() {
  return <GuideRoadmap audience="commercial" stages={COMMERCIAL_STAGES} sources={COMMERCIAL_SOURCES} title="공간 계획부터, 오픈 후까지." notice="상가 공통 준비를 위한 기본 틀이에요. 업종·건물·지역에 따라 필요한 절차와 순서가 달라져요. 음식점 관련 자료는 업종별 확인의 예시이며 모든 상가에 같은 조건이 적용되는 것은 아니에요. 계약·인허가·안전 판단은 관할 기관과 관련 전문가에게 확인하세요." />;
}
